import type {
  FavoriteSetting,
  GuestAvatar,
  GuestRoom,
  LastPlayedPart,
  PresenceSnapshot,
  RefreshIntervalOption,
  RoomFavoriteStats,
  RoomFilters,
  RoomPresenceEvent,
  SortMode,
} from './types';

export const SYNCROOM_GUEST_API =
  'https://webapi.syncroom.appservice.yamaha.com/rooms/guest/online';

export const OFFICIAL_TEST_ROOM_NAME = 'Official Test Room';
export const FAVORITES_STORAGE_KEY = 'syncrooms-web:favorites';

export const DEFAULT_FAVORITES: FavoriteSetting[] = [];

export const DEFAULT_FILTERS: RoomFilters = {
  showJapan: true,
  showKorea: true,
  showUnlocked: true,
  showLocked: true,
  showTestRooms: false,
};

export const DEFAULT_SORT_MODE: SortMode = 'FAVORITE_ALERT_FIRST';
export const DEFAULT_REFRESH_INTERVAL: RefreshIntervalOption = 3;

export const REFRESH_INTERVAL_OPTIONS: Array<{
  value: RefreshIntervalOption;
  label: string;
}> = [
  { value: 1, label: '1分' },
  { value: 3, label: '3分' },
  { value: 5, label: '5分' },
  { value: 10, label: '10分' },
  { value: 30, label: '30分' },
  { value: 'off', label: '手動のみ' },
];

export function isOfficialTestRoom(room: Pick<GuestRoom, 'isTestRoom' | 'name'>) {
  return room.isTestRoom || room.name === OFFICIAL_TEST_ROOM_NAME;
}

export function buildJoinLink(roomId: string): string {
  return `syncroom://join?roomId=${encodeURIComponent(roomId)}`;
}

export function loadFavoriteSettings(): FavoriteSetting[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FAVORITES;
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_FAVORITES;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return DEFAULT_FAVORITES;
    }

    return parsed.filter((item): item is FavoriteSetting => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const maybeFavorite = item as Partial<FavoriteSetting>;
      return (
        typeof maybeFavorite.targetUserId === 'string' &&
        typeof maybeFavorite.alertOn === 'boolean'
      );
    });
  } catch {
    return DEFAULT_FAVORITES;
  }
}

export function saveFavoriteSettings(favorites: FavoriteSetting[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

export function getFavoriteUserIds(favorites: FavoriteSetting[]) {
  return new Set(favorites.map((favorite) => favorite.targetUserId));
}

export function getAlertUserIds(favorites: FavoriteSetting[]) {
  return new Set(
    favorites
      .filter((favorite) => favorite.alertOn)
      .map((favorite) => favorite.targetUserId),
  );
}

export function getRoomFavoriteStats(
  room: GuestRoom,
  favorites: FavoriteSetting[],
): RoomFavoriteStats {
  const favoriteUserIds = getFavoriteUserIds(favorites);
  const alertUserIds = getAlertUserIds(favorites);

  let favoriteCount = 0;
  let alertCount = 0;

  for (const member of room.members ?? []) {
    if (favoriteUserIds.has(member.userId)) {
      favoriteCount += 1;
    }

    if (alertUserIds.has(member.userId)) {
      alertCount += 1;
    }
  }

  return {
    favoriteCount,
    alertCount,
    hasFavorite: favoriteCount > 0,
    hasAlertTarget: alertCount > 0,
  };
}

export function filterRooms(rooms: GuestRoom[], filters: RoomFilters) {
  return rooms.filter((room) => {
    if (!filters.showTestRooms && isOfficialTestRoom(room)) {
      return false;
    }

    const provider = room.ownerUser?.idProvider;
    const providerVisible =
      provider === 'ymid-jp'
        ? filters.showJapan
        : provider === 'ymid-kr'
          ? filters.showKorea
          : filters.showJapan || filters.showKorea;

    if (!providerVisible) {
      return false;
    }

    if (room.needPasswd && !filters.showLocked) {
      return false;
    }

    if (!room.needPasswd && !filters.showUnlocked) {
      return false;
    }

    return true;
  });
}

export function sortRooms(
  rooms: GuestRoom[],
  favorites: FavoriteSetting[],
  sortMode: SortMode,
) {
  const decorated = rooms.map((room, index) => ({
    room,
    index,
    stats: getRoomFavoriteStats(room, favorites),
  }));

  decorated.sort((left, right) => {
    const testRoomDiff =
      Number(isOfficialTestRoom(left.room)) - Number(isOfficialTestRoom(right.room));

    if (testRoomDiff !== 0) {
      return testRoomDiff;
    }

    if (sortMode === 'FAVORITE_ALERT_FIRST') {
      if (left.stats.hasAlertTarget !== right.stats.hasAlertTarget) {
        return Number(right.stats.hasAlertTarget) - Number(left.stats.hasAlertTarget);
      }

      if (left.stats.alertCount !== right.stats.alertCount) {
        return right.stats.alertCount - left.stats.alertCount;
      }

      if (left.room.members.length !== right.room.members.length) {
        return right.room.members.length - left.room.members.length;
      }

      if (left.room.onlinedAt !== right.room.onlinedAt) {
        return right.room.onlinedAt - left.room.onlinedAt;
      }
    }

    if (sortMode === 'FAVORITE_COUNT_FIRST') {
      if (left.stats.favoriteCount !== right.stats.favoriteCount) {
        return right.stats.favoriteCount - left.stats.favoriteCount;
      }

      if (left.room.members.length !== right.room.members.length) {
        return right.room.members.length - left.room.members.length;
      }

      if (left.room.onlinedAt !== right.room.onlinedAt) {
        return right.room.onlinedAt - left.room.onlinedAt;
      }
    }

    return left.index - right.index;
  });

  return decorated.map((entry) => entry.room);
}

export function diffRoomSnapshots(
  rooms: GuestRoom[],
  favorites: FavoriteSetting[],
  snapshot: PresenceSnapshot,
) {
  const alertUserIds = getAlertUserIds(favorites);
  const events: RoomPresenceEvent[] = [];

  const nextMembersByRoom = new Map<string, Set<string>>();
  const nextNicknameByUserId = new Map<string, string>();
  const nextRoomNameByRoomId = new Map<string, string>();
  const nextOfficialByRoomId = new Map<string, boolean>();

  for (const room of rooms) {
    const isOfficial = isOfficialTestRoom(room);
    nextRoomNameByRoomId.set(room.roomId, room.name);
    nextOfficialByRoomId.set(room.roomId, isOfficial);

    const currentMembers = new Set<string>();

    for (const member of room.members ?? []) {
      currentMembers.add(member.userId);
      nextNicknameByUserId.set(member.userId, member.nickname || 'ゲスト');

      if (isOfficial || !alertUserIds.has(member.userId)) {
        continue;
      }

      const wasInSameRoom =
        snapshot.prevMembersByRoom.get(room.roomId)?.has(member.userId) ?? false;
      const enterKey = `${member.userId}:${room.roomId}`;

      if (!wasInSameRoom && !snapshot.notifiedEnter.has(enterKey)) {
        events.push({
          type: 'enter',
          userId: member.userId,
          nickname: member.nickname || 'ゲスト',
          roomId: room.roomId,
          roomName: room.name,
        });
        snapshot.notifiedEnter.add(enterKey);
      }
    }

    nextMembersByRoom.set(room.roomId, currentMembers);
  }

  for (const [roomId, previousMembers] of snapshot.prevMembersByRoom.entries()) {
    if (snapshot.prevOfficialByRoomId.get(roomId)) {
      continue;
    }

    const currentMembers = nextMembersByRoom.get(roomId) ?? new Set<string>();
    const roomName = snapshot.prevRoomNameByRoomId.get(roomId) ?? 'ルーム';

    for (const userId of previousMembers) {
      if (currentMembers.has(userId) || !alertUserIds.has(userId)) {
        continue;
      }

      const nickname =
        nextNicknameByUserId.get(userId) ??
        snapshot.prevNicknameByUserId.get(userId) ??
        'ゲスト';

      events.push({
        type: 'exit',
        userId,
        nickname,
        roomId,
        roomName,
      });
    }
  }

  return {
    events,
    nextSnapshot: {
      prevMembersByRoom: nextMembersByRoom,
      prevNicknameByUserId: nextNicknameByUserId,
      prevRoomNameByRoomId: nextRoomNameByRoomId,
      prevOfficialByRoomId: nextOfficialByRoomId,
    },
  };
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }

  return `${Math.max(minutes, 0)}分`;
}

export function formatLastPlayedPart(lastPlayedPart: LastPlayedPart) {
  if (!lastPlayedPart || !('part' in lastPlayedPart) || !lastPlayedPart.part) {
    return 'パート未設定';
  }

  if (lastPlayedPart.part === 'custom') {
    return (
      ('customPart' in lastPlayedPart && lastPlayedPart.customPart) || 'カスタム'
    );
  }

  return lastPlayedPart.part;
}

export function getAvatarUrl(avatar: GuestAvatar) {
  if ('type' in avatar && avatar.type === 'url' && avatar.url) {
    return avatar.url;
  }

  return null;
}
