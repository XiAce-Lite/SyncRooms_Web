import {
  DEFAULT_SORT_MODE,
  REFRESH_INTERVAL_OPTIONS,
} from '../logic';
import type { RefreshIntervalOption, RoomFilters, SortMode } from '../types';

interface ToolbarProps {
  filters: RoomFilters;
  sortMode: SortMode;
  refreshInterval: RefreshIntervalOption;
  onFiltersChange: (next: Partial<RoomFilters>) => void;
  onSortModeChange: (value: SortMode) => void;
  onRefreshIntervalChange: (value: RefreshIntervalOption) => void;
  onManualRefresh: () => void;
  onEnableNotifications: () => void;
  notificationSupported: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  isRefreshing: boolean;
  visibleCount: number;
  totalCount: number;
  favoriteCount: number;
  lastUpdatedLabel: string;
}

export function Toolbar({
  filters,
  sortMode,
  refreshInterval,
  onFiltersChange,
  onSortModeChange,
  onRefreshIntervalChange,
  onManualRefresh,
  onEnableNotifications,
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
        <div className="toolbar-section">
          <label className="field-label" htmlFor="sortMode">
            並び順
          </label>
          <select
            id="sortMode"
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value as SortMode)}
          >
            <option value={DEFAULT_SORT_MODE}>お気に入り通知対象を優先</option>
            <option value="FAVORITE_COUNT_FIRST">お気に入り人数が多い順</option>
            <option value="DEFAULT">API順</option>
          </select>
        </div>

        <div className="toolbar-section">
          <label className="field-label" htmlFor="refreshInterval">
            自動更新
          </label>
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
        </div>

        <div className="toolbar-section toolbar-actions">
          <button className="btn btn-primary" onClick={onManualRefresh} disabled={isRefreshing}>
            {isRefreshing ? '更新中…' : '手動更新'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onEnableNotifications}
            disabled={!notificationSupported}
          >
            通知を有効化
          </button>
          <span className={`status-pill status-${notificationPermission}`}>
            {notificationLabel}
          </span>
        </div>
      </div>

      <div className="toolbar-section">
        <span className="field-label">表示フィルタ</span>
        <div className="check-grid">
          <label>
            <input
              type="checkbox"
              checked={filters.showJapan}
              onChange={(event) => onFiltersChange({ showJapan: event.target.checked })}
            />
            日本側
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showKorea}
              onChange={(event) => onFiltersChange({ showKorea: event.target.checked })}
            />
            韓国側
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
            Test Room 表示
          </label>
        </div>
      </div>

      <div className="toolbar-meta">
        <span>表示 {visibleCount} / 全{totalCount} ルーム</span>
        <span>お気に入り登録 {favoriteCount} 人</span>
        <span>最終更新: {lastUpdatedLabel}</span>
        <span>★/🔔 でローカルお気に入り登録</span>
      </div>
    </section>
  );
}
