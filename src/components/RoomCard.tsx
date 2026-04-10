import {
  formatDuration,
  formatLastPlayedPart,
  getAvatarUrl,
  isOfficialTestRoom,
} from '../logic';
import type { GuestRoom, RoomFavoriteStats } from '../types';

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
    room.ownerUser.idProvider === 'ymid-jp'
      ? 'JP'
      : room.ownerUser.idProvider === 'ymid-kr'
        ? 'KR'
        : '公開',
    room.needPasswd ? '鍵あり' : '鍵なし',
    isOfficialTestRoom(room) ? 'TEST' : null,
    favoriteStats.hasAlertTarget ? `通知対象 ${favoriteStats.alertCount}` : null,
    favoriteStats.hasFavorite ? `お気に入り ${favoriteStats.favoriteCount}` : null,
  ].filter(Boolean) as string[];

  const roomTags = [...(room.tags ?? []), ...(room.customTags ?? [])];

  return (
    <article
      className={`room-card ${isHighlighted ? 'is-highlighted' : ''}`}
      data-room-id={room.roomId}
    >
      <div className="room-card-top">
        <div>
          <h2 className="room-card-title">{room.name}</h2>
          <div className="room-badges">
            {badges.map((badge) => (
              <span key={badge} className="room-badge">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => onJoin(room.roomId)}>
          入室
        </button>
      </div>

      <dl className="room-stats">
        <div>
          <dt>人数</dt>
          <dd>
            {room.members.length} / {room.maxMemberCount}
          </dd>
        </div>
        <div>
          <dt>オーナー</dt>
          <dd>{room.ownerUser.nickname || 'ゲスト'}</dd>
        </div>
        <div>
          <dt>経過</dt>
          <dd>{formatDuration(room.onlineDurationSecs)}</dd>
        </div>
      </dl>

      <p className="room-description">{room.description || '説明なし'}</p>

      {roomTags.length > 0 && (
        <div className="tag-list">
          {roomTags.map((tag) => (
            <span key={`${room.roomId}-${tag}`} className="tag-chip">
              #{tag}
            </span>
          ))}
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
