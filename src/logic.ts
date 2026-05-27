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
  ListColumnWidthsSetting,
  RoomViewMode,
  SortMode,
  ThemeMode,
} from './types';

export const SYNCROOM_GUEST_API =
  'https://webapi.syncroom.appservice.yamaha.com/rooms/guest/online';

export const OFFICIAL_TEST_ROOM_NAME = 'Official Test Room';
export const FAVORITES_STORAGE_KEY = 'syncrooms-web:favorites';
export const FILTERS_STORAGE_KEY = 'syncrooms-web:filters';
export const REFRESH_INTERVAL_STORAGE_KEY = 'syncrooms-web:refresh-interval';
export const THEME_STORAGE_KEY = 'syncrooms-web:theme';
export const VIEW_MODE_STORAGE_KEY = 'syncrooms-web:view-mode';
export const LIST_COLUMN_WIDTHS_STORAGE_KEY = 'syncrooms-web:list-column-widths';

export const DEFAULT_FAVORITES: FavoriteSetting[] = [];

export const DEFAULT_FILTERS: RoomFilters = {
  showJapan: true,
  showKorea: true,
  showUnlocked: true,
  showLocked: true,
  showTestRooms: true,
};

export const DEFAULT_SORT_MODE: SortMode = 'FAVORITE_ALERT_FIRST';
export const DEFAULT_REFRESH_INTERVAL: RefreshIntervalOption = 3;
export const DEFAULT_THEME: ThemeMode = 'system';
export const DEFAULT_VIEW_MODE: RoomViewMode = 'card';

export const LIST_COL_MIN_WIDTH = 160;
export const LIST_COL_AUTO_MAX_WIDTH = 8000;

export const DEFAULT_LIST_COLUMN_WIDTHS: ListColumnWidthsSetting = {
  name: 260,
  members: 220,
  description: 240,
  membersShowFullNames: false,
};

export const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: 'system', label: 'システム' },
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
];

export const VIEW_MODE_OPTIONS: Array<{ value: RoomViewMode; label: string }> = [
  { value: 'card', label: 'カード' },
  { value: 'list', label: '一覧' },
];

export const REFRESH_INTERVAL_OPTIONS: Array<{
  value: RefreshIntervalOption;
  label: string;
}> = [
  { value: 0.5, label: '30秒' },
  { value: 1, label: '1分' },
  { value: 3, label: '3分' },
  { value: 5, label: '5分' },
  { value: 10, label: '10分' },
  { value: 30, label: '30分' },
  { value: 'off', label: '手動のみ' },
];

const ROOM_TAG_LABELS: Record<string, string> = {
  anime: 'アニメ',
  beginnerswelcome: '初心者歓迎',
  'bosa nova': 'ボサノヴァ',
  'bossa nova': 'ボサノヴァ',
  brasil: 'ブラジル音楽',
  chatting: '雑談',
  countryfolk: 'カントリー / フォーク',
  fusion: 'フュージョン',
  games: 'ゲーム音楽',
  hiphoprap: 'ヒップホップ / ラップ',
  idol: 'アイドル',
  jazz: 'ジャズ',
  jpop: 'J-POP',
  kpop: 'K-POP',
  novoicewelcome: '聞き専歓迎',
  pop: 'ポップス',
  practicing: '練習中',
  recording: '録音 / 制作',
  rnbsoul: 'R&B / ソウル',
  rock: 'ロック',
  seekingaccompaniment: '伴奏募集',
  seekingbassist: 'ベース募集',
  seekingdrummers: 'ドラマー募集',
  seekingguitarists: 'ギター募集',
  seekingkeyboardist: 'キーボード募集',
  seekingmembers: 'メンバー募集',
  seekingvocalists: 'ボーカル募集',
  streaming: '配信中',
  testing: 'テスト',
  vocaloid: 'ボカロ',
};

const ROOM_TAG_WORD_LABELS: Record<string, string> = {
  anime: 'アニメ',
  beginner: '初心者',
  beginners: '初心者',
  welcome: '歓迎',
  blues: 'ブルース',
  bosa: 'ボサ',
  bossa: 'ボサ',
  nova: 'ノヴァ',
  brasil: 'ブラジル音楽',
  chatting: '雑談',
  country: 'カントリー',
  folk: 'フォーク',
  fusion: 'フュージョン',
  game: 'ゲーム',
  games: 'ゲーム音楽',
  hiphop: 'ヒップホップ',
  rap: 'ラップ',
  idol: 'アイドル',
  jazz: 'ジャズ',
  jpop: 'J-POP',
  kpop: 'K-POP',
  no: 'なし',
  voice: 'ボイス',
  practicing: '練習中',
  recording: '録音',
  rnb: 'R&B',
  soul: 'ソウル',
  rock: 'ロック',
  seeking: '募集',
  accompaniment: '伴奏',
  bassist: 'ベース',
  bassists: 'ベース',
  drummer: 'ドラム',
  drummers: 'ドラム',
  guitarist: 'ギター',
  guitarists: 'ギター',
  keyboardist: 'キーボード',
  members: 'メンバー',
  vocalist: 'ボーカル',
  vocalists: 'ボーカル',
  streaming: '配信中',
  testing: 'テスト',
  vocaloid: 'ボカロ',
};

function normalizeRoomTagText(tag: string) {
  return tag
    .replace(/^#/, '')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function formatRoomTagLabel(tag: string) {
  const normalizedText = normalizeRoomTagText(tag);

  if (!normalizedText) {
    return '';
  }

  const compactKey = normalizedText.toLowerCase().replace(/\s+/g, '');
  const spacedKey = normalizedText.toLowerCase();
  const directMatch = ROOM_TAG_LABELS[compactKey] ?? ROOM_TAG_LABELS[spacedKey];

  if (directMatch) {
    return directMatch;
  }

  if (/[ぁ-んァ-ヶー一-龠]/.test(normalizedText)) {
    return normalizedText;
  }

  const translatedTokens = normalizedText
    .toLowerCase()
    .split(' ')
    .map((token) => ROOM_TAG_WORD_LABELS[token] ?? token)
    .filter(Boolean);

  if (translatedTokens.some((token) => /[ぁ-んァ-ヶー一-龠A-Z]/.test(token))) {
    return translatedTokens.join(' / ');
  }

  return normalizedText;
}

export function isOfficialTestRoom(room: Pick<GuestRoom, 'isTestRoom' | 'name'>) {
  return room.isTestRoom || room.name === OFFICIAL_TEST_ROOM_NAME;
}

export function buildJoinLink(
  room: Pick<GuestRoom, 'roomId' | 'name' | 'needPasswd'>,
): string {
  const params = new URLSearchParams({
    roomName: room.name,
    roomId: room.roomId,
    requirePassword: room.needPasswd ? '1' : '0',
  });

  return `https://webapi.syncroom.appservice.yamaha.com/launch_app?${params.toString()}`;
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

      const maybeFavorite = item as Partial<FavoriteSetting> & {
        notifyOnEnter?: boolean;
        notifyOnExit?: boolean;
      };

      return (
        typeof maybeFavorite.targetUserId === 'string' &&
        (typeof maybeFavorite.alertOn === 'boolean' ||
          typeof maybeFavorite.notifyOnEnter === 'boolean' ||
          typeof maybeFavorite.notifyOnExit === 'boolean')
      );
    }).map((item) => {
      const maybeFavorite = item as Partial<FavoriteSetting> & {
        notifyOnEnter?: boolean;
        notifyOnExit?: boolean;
      };
      const fallbackAlert =
        typeof maybeFavorite.alertOn === 'boolean'
          ? maybeFavorite.alertOn
          : Boolean(maybeFavorite.notifyOnEnter || maybeFavorite.notifyOnExit);

      return {
        targetUserId: maybeFavorite.targetUserId as string,
        alertOn: fallbackAlert,
      };
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

export function loadFilterSettings(): RoomFilters {
  if (typeof window === 'undefined') {
    return DEFAULT_FILTERS;
  }

  try {
    const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_FILTERS;
    }

    const parsed = JSON.parse(raw) as Partial<RoomFilters> | null;
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_FILTERS;
    }

    return {
      showJapan:
        typeof parsed.showJapan === 'boolean'
          ? parsed.showJapan
          : DEFAULT_FILTERS.showJapan,
      showKorea:
        typeof parsed.showKorea === 'boolean'
          ? parsed.showKorea
          : DEFAULT_FILTERS.showKorea,
      showUnlocked:
        typeof parsed.showUnlocked === 'boolean'
          ? parsed.showUnlocked
          : DEFAULT_FILTERS.showUnlocked,
      showLocked:
        typeof parsed.showLocked === 'boolean'
          ? parsed.showLocked
          : DEFAULT_FILTERS.showLocked,
      showTestRooms:
        typeof parsed.showTestRooms === 'boolean'
          ? parsed.showTestRooms
          : DEFAULT_FILTERS.showTestRooms,
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function saveFilterSettings(filters: RoomFilters) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
}

export function loadRefreshIntervalSetting(): RefreshIntervalOption {
  if (typeof window === 'undefined') {
    return DEFAULT_REFRESH_INTERVAL;
  }

  try {
    const raw = window.localStorage.getItem(REFRESH_INTERVAL_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_REFRESH_INTERVAL;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (parsed === 'off') {
      return 'off';
    }

    const numericValue = typeof parsed === 'number' ? parsed : Number(parsed);
    const supportedValues: RefreshIntervalOption[] = [0.5, 1, 3, 5, 10, 30, 'off'];

    return supportedValues.includes(numericValue as RefreshIntervalOption)
      ? (numericValue as RefreshIntervalOption)
      : DEFAULT_REFRESH_INTERVAL;
  } catch {
    return DEFAULT_REFRESH_INTERVAL;
  }
}

export function saveRefreshIntervalSetting(
  refreshInterval: RefreshIntervalOption,
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    REFRESH_INTERVAL_STORAGE_KEY,
    JSON.stringify(refreshInterval),
  );
}

export function applyThemeMode(theme: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('data-theme', theme);
}

export function loadThemeSetting(): ThemeMode {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }

    const parsed = JSON.parse(raw ?? 'null') as unknown;
    if (parsed === 'light' || parsed === 'dark' || parsed === 'system') {
      return parsed;
    }
  } catch {
    return DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

export function saveThemeSetting(theme: ThemeMode) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function loadViewModeSetting(): RoomViewMode {
  if (typeof window === 'undefined') {
    return DEFAULT_VIEW_MODE;
  }

  try {
    const raw = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (raw === 'card' || raw === 'list') {
      return raw;
    }

    const parsed = JSON.parse(raw ?? 'null') as unknown;
    if (parsed === 'card' || parsed === 'list') {
      return parsed;
    }
  } catch {
    return DEFAULT_VIEW_MODE;
  }

  return DEFAULT_VIEW_MODE;
}

export function saveViewModeSetting(viewMode: RoomViewMode) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
}

function normalizeListColumnWidth(value: unknown, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(
    LIST_COL_MIN_WIDTH,
    Math.min(LIST_COL_AUTO_MAX_WIDTH, Math.round(value)),
  );
}

export function loadListColumnWidthsSetting(): ListColumnWidthsSetting {
  if (typeof window === 'undefined') {
    return DEFAULT_LIST_COLUMN_WIDTHS;
  }

  try {
    const raw = window.localStorage.getItem(LIST_COLUMN_WIDTHS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_LIST_COLUMN_WIDTHS;
    }

    const parsed = JSON.parse(raw) as Partial<ListColumnWidthsSetting>;
    return {
      name: normalizeListColumnWidth(parsed.name, DEFAULT_LIST_COLUMN_WIDTHS.name),
      members: normalizeListColumnWidth(
        parsed.members,
        DEFAULT_LIST_COLUMN_WIDTHS.members,
      ),
      description: normalizeListColumnWidth(
        parsed.description,
        DEFAULT_LIST_COLUMN_WIDTHS.description,
      ),
      membersShowFullNames: parsed.membersShowFullNames === true,
    };
  } catch {
    return DEFAULT_LIST_COLUMN_WIDTHS;
  }
}

export function saveListColumnWidthsSetting(setting: ListColumnWidthsSetting) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    LIST_COLUMN_WIDTHS_STORAGE_KEY,
    JSON.stringify({
      name: normalizeListColumnWidth(setting.name, DEFAULT_LIST_COLUMN_WIDTHS.name),
      members: normalizeListColumnWidth(
        setting.members,
        DEFAULT_LIST_COLUMN_WIDTHS.members,
      ),
      description: normalizeListColumnWidth(
        setting.description,
        DEFAULT_LIST_COLUMN_WIDTHS.description,
      ),
      membersShowFullNames: setting.membersShowFullNames === true,
    }),
  );
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
    if (sortMode === 'FAVORITE_ALERT_FIRST') {
      if (left.stats.hasAlertTarget !== right.stats.hasAlertTarget) {
        return Number(right.stats.hasAlertTarget) - Number(left.stats.hasAlertTarget);
      }

      if (left.stats.hasFavorite !== right.stats.hasFavorite) {
        return Number(right.stats.hasFavorite) - Number(left.stats.hasFavorite);
      }

      return left.index - right.index;
    }

    if (sortMode === 'FAVORITE_COUNT_FIRST') {
      if (left.stats.favoriteCount !== right.stats.favoriteCount) {
        return right.stats.favoriteCount - left.stats.favoriteCount;
      }

      return left.index - right.index;
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
