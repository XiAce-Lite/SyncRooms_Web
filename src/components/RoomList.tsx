import { RoomCard } from './RoomCard';

import type { GuestRoom, RoomFavoriteStats } from '../types';

interface RoomListProps {
  rooms: GuestRoom[];
  loading: boolean;
  error: string | null;
  highlightedRoomId: string | null;
  favoriteUserIds: Set<string>;
  alertUserIds: Set<string>;
  roomStatsById: Map<string, RoomFavoriteStats>;
  onRetry: () => void;
  onJoin: (roomId: string) => void;
  onToggleFavorite: (userId: string) => void;
  onToggleAlert: (userId: string) => void;
}

export function RoomList({
  rooms,
  loading,
  error,
  highlightedRoomId,
  favoriteUserIds,
  alertUserIds,
  roomStatsById,
  onRetry,
  onJoin,
  onToggleFavorite,
  onToggleAlert,
}: RoomListProps) {
  if (loading && rooms.length === 0) {
    return <SkeletonRoomList />;
  }

  if (error && rooms.length === 0) {
    return (
      <div className="retry-panel">
        <h2>ルーム一覧の取得に失敗しました</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={onRetry}>
          再試行
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="empty-state">
        <h2>該当するルームがありません</h2>
        <p>フィルタ条件を調整するか、手動更新をお試しください。</p>
      </div>
    );
  }

  return (
    <section className="room-list">
      {rooms.map((room) => (
        <RoomCard
          key={room.roomId}
          room={room}
          favoriteStats={
            roomStatsById.get(room.roomId) ?? {
              favoriteCount: 0,
              alertCount: 0,
              hasFavorite: false,
              hasAlertTarget: false,
            }
          }
          favoriteUserIds={favoriteUserIds}
          alertUserIds={alertUserIds}
          isHighlighted={highlightedRoomId === room.roomId}
          onJoin={onJoin}
          onToggleFavorite={onToggleFavorite}
          onToggleAlert={onToggleAlert}
        />
      ))}
    </section>
  );
}

function SkeletonRoomList() {
  return (
    <section className="room-list">
      {Array.from({ length: 6 }, (_, index) => (
        <article key={index} className="room-card skeleton-card" aria-hidden="true">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
          <div className="skeleton-grid">
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
          </div>
        </article>
      ))}
    </section>
  );
}
