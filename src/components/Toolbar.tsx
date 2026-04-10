import { REFRESH_INTERVAL_OPTIONS } from '../logic';
import type { RefreshIntervalOption, RoomFilters } from '../types';

interface ToolbarProps {
  title: string;
  filters: RoomFilters;
  refreshInterval: RefreshIntervalOption;
  onFiltersChange: (next: Partial<RoomFilters>) => void;
  onRefreshIntervalChange: (value: RefreshIntervalOption) => void;
  onManualRefresh: () => void;
  onEnableNotifications: () => void;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
  onToggleNotifyOnEnter: () => void;
  onToggleNotifyOnExit: () => void;
  notificationSupported: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  isRefreshing: boolean;
  visibleCount: number;
  totalCount: number;
  favoriteCount: number;
  lastUpdatedLabel: string;
}

export function Toolbar({
  title,
  filters,
  refreshInterval,
  onFiltersChange,
  onRefreshIntervalChange,
  onManualRefresh,
  onEnableNotifications,
  notifyOnEnter,
  notifyOnExit,
  onToggleNotifyOnEnter,
  onToggleNotifyOnExit,
  notificationSupported,
  notificationPermission,
  isRefreshing,
  visibleCount,
  totalCount,
  favoriteCount,
  lastUpdatedLabel,
}: ToolbarProps) {
  const notificationLabel = !notificationSupported
    ? '通知非対応'
    : notificationPermission === 'granted'
      ? '通知ON'
      : notificationPermission === 'denied'
        ? '通知ブロック中'
        : '通知OFF';

  return (
    <section className="toolbar">
      <div className="toolbar-grid">
        <div className="toolbar-title-block">
          <h1 className="toolbar-title">{title}</h1>
        </div>

        <div className="toolbar-section toolbar-filters">
          <span className="field-label">表示フィルタ</span>
          <div className="check-grid">
            <label>
              <input
                type="checkbox"
                checked={filters.showJapan}
                onChange={(event) => onFiltersChange({ showJapan: event.target.checked })}
              />
              日本
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.showKorea}
                onChange={(event) => onFiltersChange({ showKorea: event.target.checked })}
              />
              韓国
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.showUnlocked}
                onChange={(event) => onFiltersChange({ showUnlocked: event.target.checked })}
              />
              鍵なし
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.showLocked}
                onChange={(event) => onFiltersChange({ showLocked: event.target.checked })}
              />
              鍵あり
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.showTestRooms}
                onChange={(event) => onFiltersChange({ showTestRooms: event.target.checked })}
              />
              テストルーム
            </label>
          </div>
        </div>

        <div className="toolbar-section toolbar-refresh">
          <label className="field-label" htmlFor="refreshInterval">
            自動更新
          </label>
          <div className="toolbar-actions toolbar-refresh-row">
            <select
              id="refreshInterval"
              value={String(refreshInterval)}
              onChange={(event) => {
                const value = event.target.value;
                onRefreshIntervalChange(
                  value === 'off' ? 'off' : (Number(value) as RefreshIntervalOption),
                );
              }}
            >
              {REFRESH_INTERVAL_OPTIONS.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={onManualRefresh} disabled={isRefreshing}>
              {isRefreshing ? '更新中…' : '手動更新'}
            </button>
          </div>
          <div className="toolbar-actions toolbar-notify-row">
            <button
              className="btn btn-secondary"
              onClick={onEnableNotifications}
              disabled={!notificationSupported}
            >
              通知を有効化
            </button>
            <button
              className={`btn btn-secondary ${notifyOnEnter ? 'is-toggled' : ''}`}
              onClick={onToggleNotifyOnEnter}
              disabled={!notificationSupported}
            >
              入室通知
            </button>
            <button
              className={`btn btn-secondary ${notifyOnExit ? 'is-toggled' : ''}`}
              onClick={onToggleNotifyOnExit}
              disabled={!notificationSupported}
            >
              退室通知
            </button>
            <span className={`status-pill status-${notificationPermission}`}>
              {notificationLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="toolbar-meta">
        <span>表示 {visibleCount} / 全{totalCount} ルーム</span>
        <span>お気に入り登録 {favoriteCount} 人</span>
        <span>最終更新: {lastUpdatedLabel}</span>
        <span>★/🔔 でお気に入り・通知設定</span>
      </div>
    </section>
  );
}
