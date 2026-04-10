import {
  formatLastPlayedPart,
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

interface RoomCardProps {
  room: GuestRoom;
  favoriteStats: RoomFavoriteStats;
  favoriteUserIds: Set<string>;
  alertUserIds: Set<string>;
  isHighlighted: boolean;
  onJoin: (roomId: string) => void;
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
  const badges = [
    isOfficialTestRoom(room) ? 'TEST' : null,
    favoriteStats.hasAlertTarget ? `通知対象 ${favoriteStats.alertCount}` : null,
    favoriteStats.hasFavorite ? `お気に入り ${favoriteStats.favoriteCount}` : null,
  ].filter(Boolean) as string[];

  const roomTags = [...(room.tags ?? []), ...(room.customTags ?? [])];
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
          <div className="room-title-row">
            <span className="room-lock-slot" aria-hidden="true">
              {room.needPasswd ? <span className="room-lock-icon">🔒</span> : null}
            </span>
            <h2 className="room-card-title">{room.name}</h2>
          </div>
          <div className="room-badges">
            {badges.map((badge) => (
              <span key={badge} className="room-badge">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="room-card-actions">
          <span className="room-member-count">
            {room.members.length}/{room.maxMemberCount}
          </span>
          <button className="btn btn-primary" onClick={() => onJoin(room.roomId)}>
            入室
          </button>
        </div>
      </div>

      <p className="room-owner">オーナー: {room.ownerUser.nickname || 'ゲスト'}</p>

      <p className="room-description">
        {renderDescriptionText(room.description || '説明なし')}
      </p>

      {roomTags.length > 0 && (
        <div className="tag-list">
          {visibleTags.map((tag, index) => (
            <span key={`${room.roomId}-${tag}-${index}`} className="tag-chip">
              #{tag}
            </span>
          ))}
          {hiddenTags.length > 0 && (
            <span
              className="tag-chip tag-chip-more"
              title={`残りのタグ: ${hiddenTags.map((tag) => `#${tag}`).join(' / ')}`}
            >
              …+{hiddenTags.length}
            </span>
          )}
        </div>
      )}

      <div className="member-grid">
        {room.members.map((member) => {
          const isFavorite = favoriteUserIds.has(member.userId);
          const isAlertOn = alertUserIds.has(member.userId);
          const avatarUrl = getAvatarUrl(member.avatar);

          return (
            <div
              key={`${room.roomId}-${member.userId}`}
              className={`member-chip ${isFavorite ? 'is-favorite' : ''}`}
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
                  <strong>{member.nickname || 'ゲスト'}</strong>
                  <span>{formatLastPlayedPart(member.lastPlayedPart)}</span>
                  {member.isBeginner && <span className="mini-badge">初心者</span>}
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
                  className={`icon-button ${isAlertOn ? 'active' : ''}`}
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
