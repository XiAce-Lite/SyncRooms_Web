export type IdProvider = 'ymid-jp' | 'ymid-kr' | null;

export type PresetAvatar = {
  type: 'preset';
  preset: {
    colorCode: string;
    shapeKey: string;
  };
  url: string;
  special?: Record<string, unknown>;
};

export type UrlAvatar = {
  type: 'url';
  url: string;
};

export type EmptyAvatar = {
  type?: undefined;
  url?: undefined;
  preset?: undefined;
  special?: undefined;
};

export type GuestAvatar = PresetAvatar | UrlAvatar | EmptyAvatar;

export type StandardLastPlayedPart = {
  part: string;
};

export type CustomLastPlayedPart = {
  part: 'custom';
  customPart: string;
};

export type EmptyLastPlayedPart = {
  part?: undefined;
  customPart?: undefined;
};

export type LastPlayedPart =
  | StandardLastPlayedPart
  | CustomLastPlayedPart
  | EmptyLastPlayedPart;

export interface GuestUser {
  userId: string;
  nickname: string;
  idProvider: IdProvider;
  isBeginner: boolean;
  avatar: GuestAvatar;
  lastPlayedPart: LastPlayedPart;
}

export interface RoomMember extends GuestUser {
  roomEnterType: 'normal' | string;
}

export interface GuestRoom {
  roomId: string;
  name: string;
  description: string;
  isTestRoom: boolean;
  needPasswd: boolean;
  members: RoomMember[];
  ownerUser: GuestUser;
  tags: string[];
  customTags: string[];
  onlinedAt: number;
  onlineDurationSecs: number;
  maxMemberCount: number;
  roomPublishType: 'public' | string;
  roomPurpose: string;
  roomStatus: string;
}

export interface GuestRoomsResponse {
  rooms: GuestRoom[];
}

export interface FavoriteSetting {
  targetUserId: string;
  alertOn: boolean;
}

export type SortMode =
  | 'DEFAULT'
  | 'FAVORITE_ALERT_FIRST'
  | 'FAVORITE_COUNT_FIRST';

export interface RoomFilters {
  showJapan: boolean;
  showKorea: boolean;
  showUnlocked: boolean;
  showLocked: boolean;
  showTestRooms: boolean;
}

export type RefreshIntervalOption = 1 | 3 | 5 | 10 | 30 | 'off';

export interface RoomFavoriteStats {
  favoriteCount: number;
  alertCount: number;
  hasFavorite: boolean;
  hasAlertTarget: boolean;
}

export interface RoomPresenceEvent {
  type: 'enter' | 'exit';
  userId: string;
  nickname: string;
  roomId: string;
  roomName: string;
}

export interface PresenceSnapshot {
  prevMembersByRoom: Map<string, Set<string>>;
  prevNicknameByUserId: Map<string, string>;
  prevRoomNameByRoomId: Map<string, string>;
  prevOfficialByRoomId: Map<string, boolean>;
  notifiedEnter: Set<string>;
}
