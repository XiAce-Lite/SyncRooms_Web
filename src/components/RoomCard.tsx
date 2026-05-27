import {
  formatLastPlayedPart,
  formatRoomTagLabel,
  getAvatarUrl,
  isOfficialTestRoom,
} from '../logic';
import type { GuestRoom, RoomFavoriteStats } from '../types';

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function renderDescriptionText(text: string) {
  return text.split(URL_PATTERN).map((part, index) => {
    if (!part) {
      return null;
    }

    if (/^https?:\/\/[^\s]+$/i.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(event) => event.stopPropagation()}
        >
          {part}
        </a>
      );
    }

    return <span key={`${index}-${part}`}>{part}</span>;
  });
}

function sortRoomMembersForDisplay(
  members: GuestRoom['members'],
  ownerUserId: string,
  favoriteUserIds: Set<string>,
  alertUserIds: Set<string>,
) {
  const owners: typeof members = [];
  const notifyFav: typeof members = [];
  const favOnly: typeof members = [];
  const others: typeof members = [];

  for (const member of members) {
    const isOwner = member.userId === ownerUserId;
    const isFavorite = favoriteUserIds.has(member.userId);
    const isAlertOn = alertUserIds.has(member.userId);

    if (isOwner) {
      owners.push(member);
    } else if (isFavorite && isAlertOn) {
      notifyFav.push(member);
    } else if (isFavorite) {
      favOnly.push(member);
    } else {
      others.push(member);
    }
  }

  const compareByNickname = (a: (typeof members)[number], b: (typeof members)[number]) => {
    const an = a.nickname?.trim() ?? '';
    const bn = b.nickname?.trim() ?? '';
    const nickCmp = an.localeCompare(bn, 'ja', { sensitivity: 'base' });
    if (nickCmp !== 0) {
      return nickCmp;
    }
    return a.userId.localeCompare(b.userId);
  };

  notifyFav.sort(compareByNickname);
  favOnly.sort(compareByNickname);

  return [...owners, ...notifyFav, ...favOnly, ...others];
}

interface RoomCardProps {
  room: GuestRoom;
  favoriteStats: RoomFavoriteStats;
  favoriteUserIds: Set<string>;
  alertUserIds: Set<string>;
  isHighlighted: boolean;
  onJoin: (room: GuestRoom) => void;
  onToggleFavorite: (userId: string) => void;
  onToggleAlert: (userId: string) => void;
}

export function RoomCard({
  room,
  favoriteStats,
  favoriteUserIds,
  alertUserIds,
  isHighlighted,
  onJoin,
  onToggleFavorite,
  onToggleAlert,
}: RoomCardProps) {
  const badges = [isOfficialTestRoom(room) ? 'TEST' : null].filter(Boolean) as string[];
  const favoriteSet = favoriteUserIds ?? new Set<string>();
  const alertSet = alertUserIds ?? new Set<string>();
  const sortedMembers = sortRoomMembersForDisplay(
    room.members,
    room.ownerUser.userId,
    favoriteSet,
    alertSet,
  );

  const roomTags = [...(room.tags ?? []), ...(room.customTags ?? [])].map((tag) => ({
    raw: tag,
    label: formatRoomTagLabel(tag),
  }));
  const visibleTags = roomTags.slice(0, 4);
  const hiddenTags = roomTags.slice(4);

  return (
    <article
      className={`room-card ${isHighlighted ? 'is-highlighted' : ''} ${
        room.needPasswd ? 'is-locked' : ''
      }`}
      data-room-id={room.roomId}
    >
      <div className="room-card-top">
        <div className="room-card-heading">
          <div className="room-title-main-row">
            <div className="room-title-row">
              {room.needPasswd && (
                <span className="room-lock-slot" aria-hidden="true">
                  <span className="room-lock-icon">🔒</span>
                </span>
              )}
              <h2 className="room-card-title" title={room.name}>{room.name}</h2>
            </div>

            <div className="room-card-actions room-card-actions-inline">
              <span className="room-member-count">
                {room.members.length}/{room.maxMemberCount}
              </span>
              <button
                className="btn join-icon-button"
                onClick={() => onJoin(room)}
                aria-label="入室"
                title="入室"
              >
                🚪
              </button>
            </div>
          </div>

          <div className="room-status-row">
            <div className="room-status-content">
              {badges.map((badge) => (
                <span key={badge} className="room-badge">
                  {badge}
                </span>
              ))}
              {favoriteStats.hasAlertTarget && (
                <span className="room-stat-chip" title={`通知対象 ${favoriteStats.alertCount} 人`}>
                  <span className="room-stat-icon room-stat-icon-alert" aria-hidden="true">
                    🔔
                  </span>
                  <span>{favoriteStats.alertCount}</span>
                </span>
              )}
              {favoriteStats.hasFavorite && (
                <span className="room-stat-chip" title={`お気に入り ${favoriteStats.favoriteCount} 人`}>
                  <span className="room-stat-icon room-stat-icon-favorite" aria-hidden="true">
                    ★
                  </span>
                  <span>{favoriteStats.favoriteCount}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="room-description">
        {renderDescriptionText(room.description || '説明なし')}
      </p>

      {roomTags.length > 0 && (
        <div className="tag-list">
          {visibleTags.map((tag, index) => (
            <span
              key={`${room.roomId}-${tag.raw}-${index}`}
              className="tag-chip"
              title={tag.raw !== tag.label ? tag.raw : undefined}
            >
              {tag.label}
            </span>
          ))}
          {hiddenTags.length > 0 && (
            <span
              className="tag-chip tag-chip-more"
              title={`残りのタグ: ${hiddenTags.map((tag) => tag.label).join(' / ')}`}
            >
              …+{hiddenTags.length}
            </span>
          )}
        </div>
      )}

      <div className="member-grid">
        {sortedMembers.map((member, index) => {
          const isFavorite = favoriteSet.has(member.userId);
          const isAlertOn = alertSet.has(member.userId);
          const isOwner = member.userId === room.ownerUser.userId;
          const avatarUrl = getAvatarUrl(member.avatar);

          return (
            <div
              key={`${room.roomId}-${member.userId}-${index}`}
              className={`member-chip ${isFavorite ? 'is-favorite' : ''} ${isOwner ? 'is-owner' : ''}`.trim()}
            >
              <div className="member-main">
                {avatarUrl ? (
                  <img className="member-avatar" src={avatarUrl} alt="" />
                ) : (
                  <div className="member-avatar member-avatar-fallback" aria-hidden="true">
                    {(member.nickname || '?').slice(0, 1)}
                  </div>
                )}

                <div className="member-meta">
                  <strong title={member.nickname || 'ゲスト'}>{member.nickname || 'ゲスト'}</strong>
                  <div className="member-part-line">
                    <span className="member-part" title={formatLastPlayedPart(member.lastPlayedPart)}>
                      {formatLastPlayedPart(member.lastPlayedPart)}
                    </span>
                    <span
                      className={`mini-badge mini-badge-beginner ${member.isBeginner ? '' : 'is-hidden'}`}
                      title={member.isBeginner ? '初心者' : undefined}
                      aria-hidden={!member.isBeginner}
                    >
                      🔰
                    </span>
                  </div>
                </div>
              </div>

              <div className="member-actions">
                <button
                  type="button"
                  className={`icon-button ${isFavorite ? 'active' : ''}`}
                  title="お気に入り切替"
                  onClick={() => onToggleFavorite(member.userId)}
                >
                  {isFavorite ? '★' : '☆'}
                </button>
                <button
                  type="button"
                  className={`icon-button ${isAlertOn ? 'active active-enter' : ''}`}
                  title="通知切替"
                  onClick={() => onToggleAlert(member.userId)}
                >
                  {isAlertOn ? '🔔' : '🔕'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
