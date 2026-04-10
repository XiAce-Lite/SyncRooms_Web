import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './App.css';
import { RoomList } from './components/RoomList';
import { Toolbar } from './components/Toolbar';
import { useNotifications } from './hooks/useNotifications';
import {
  buildJoinLink,
  DEFAULT_FILTERS,
  DEFAULT_REFRESH_INTERVAL,
  DEFAULT_SORT_MODE,
  diffRoomSnapshots,
  filterRooms,
  getAlertUserIds,
  getFavoriteUserIds,
  getRoomFavoriteStats,
  loadFavoriteSettings,
  saveFavoriteSettings,
  sortRooms,
  SYNCROOM_GUEST_API,
} from './logic';
import type {
  FavoriteSetting,
  GuestRoom,
  GuestRoomsResponse,
  RefreshIntervalOption,
  RoomFilters,
  SortMode,
} from './types';

function App() {
  const [rooms, setRooms] = useState<GuestRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [filters, setFilters] = useState<RoomFilters>(DEFAULT_FILTERS);
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE);
  const [refreshInterval, setRefreshInterval] =
    useState<RefreshIntervalOption>(DEFAULT_REFRESH_INTERVAL);
  const [favorites, setFavorites] = useState<FavoriteSetting[]>(() =>
    loadFavoriteSettings(),
  );
  const [highlightedRoomId, setHighlightedRoomId] = useState<string | null>(
    null,
  );

  const favoritesRef = useRef<FavoriteSetting[]>(favorites);
  const prevMembersByRoomRef = useRef<Map<string, Set<string>>>(new Map());
  const prevNicknameByUserIdRef = useRef<Map<string, string>>(new Map());
  const prevRoomNameByRoomIdRef = useRef<Map<string, string>>(new Map());
  const prevOfficialByRoomIdRef = useRef<Map<string, boolean>>(new Map());
  const notifiedEnterRef = useRef<Set<string>>(new Set());

  const focusRoom = useCallback((roomId: string) => {
    setHighlightedRoomId(roomId);

    window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-room-id="${roomId}"]`,
      );

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, []);

  const { isSupported, permission, requestPermission, notifyRoomEvent } =
    useNotifications(focusRoom);

  useEffect(() => {
    document.title = 'SyncRooms Web';
  }, []);

  useEffect(() => {
    favoritesRef.current = favorites;
    saveFavoriteSettings(favorites);
  }, [favorites]);

  useEffect(() => {
    if (!highlightedRoomId) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setHighlightedRoomId(null);
    }, 2500);

    return () => window.clearTimeout(timerId);
  }, [highlightedRoomId]);

  const fetchRooms = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(SYNCROOM_GUEST_API, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Partial<GuestRoomsResponse>;
      const nextRooms = Array.isArray(data.rooms) ? data.rooms : [];

      const { events, nextSnapshot } = diffRoomSnapshots(
        nextRooms,
        favoritesRef.current,
        {
          prevMembersByRoom: prevMembersByRoomRef.current,
          prevNicknameByUserId: prevNicknameByUserIdRef.current,
          prevRoomNameByRoomId: prevRoomNameByRoomIdRef.current,
          prevOfficialByRoomId: prevOfficialByRoomIdRef.current,
          notifiedEnter: notifiedEnterRef.current,
        },
      );

      prevMembersByRoomRef.current = nextSnapshot.prevMembersByRoom;
      prevNicknameByUserIdRef.current = nextSnapshot.prevNicknameByUserId;
      prevRoomNameByRoomIdRef.current = nextSnapshot.prevRoomNameByRoomId;
      prevOfficialByRoomIdRef.current = nextSnapshot.prevOfficialByRoomId;

      setRooms(nextRooms);
      setLastUpdatedAt(new Date());

      events.forEach((event) => {
        notifyRoomEvent(event);
      });
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : '不明なエラー';
      setError(`ゲストAPIの取得に失敗しました。(${message})`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [notifyRoomEvent]);

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (refreshInterval === 'off') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void fetchRooms();
    }, refreshInterval * 60_000);

    return () => window.clearInterval(intervalId);
  }, [fetchRooms, refreshInterval]);

  const favoriteUserIds = useMemo(() => getFavoriteUserIds(favorites), [favorites]);
  const alertUserIds = useMemo(() => getAlertUserIds(favorites), [favorites]);

  const visibleRooms = useMemo(
    () => sortRooms(filterRooms(rooms, filters), favorites, sortMode),
    [favorites, filters, rooms, sortMode],
  );

  const roomStatsById = useMemo(
    () =>
      new Map(
        visibleRooms.map((room) => [
          room.roomId,
          getRoomFavoriteStats(room, favorites),
        ]),
      ),
    [favorites, visibleRooms],
  );

  const updateFilters = useCallback((next: Partial<RoomFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  const handleJoin = useCallback((roomId: string) => {
    window.location.href = buildJoinLink(roomId);
  }, []);

  const toggleFavorite = useCallback((userId: string) => {
    setFavorites((current) => {
      const exists = current.some((favorite) => favorite.targetUserId === userId);

      if (exists) {
        return current.filter((favorite) => favorite.targetUserId !== userId);
      }

      return [...current, { targetUserId: userId, alertOn: false }];
    });
  }, []);

  const toggleAlert = useCallback((userId: string) => {
    setFavorites((current) => {
      const target = current.find((favorite) => favorite.targetUserId === userId);

      if (!target) {
        return [...current, { targetUserId: userId, alertOn: true }];
      }

      return current.map((favorite) =>
        favorite.targetUserId === userId
          ? { ...favorite, alertOn: !favorite.alertOn }
          : favorite,
      );
    });
  }, []);

  const lastUpdatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleString('ja-JP')
    : '未取得';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title-row">
          <div>
            <p className="app-kicker">Yamaha SYNCROOM public guest API viewer</p>
            <h1>SyncRooms Web</h1>
            <p className="app-subtitle">
              SYNCROOM の public ルームを定期取得し、お気に入りユーザの入室/退室を
              Web 通知で検知します。
            </p>
          </div>
          <span className="app-badge">guest API only</span>
        </div>
        <p className="app-note">
          「入室」ボタンはプレースホルダ導線です。通知本文には時刻を含めていません。
        </p>
      </header>

      <Toolbar
        filters={filters}
        sortMode={sortMode}
        refreshInterval={refreshInterval}
        onFiltersChange={updateFilters}
        onSortModeChange={setSortMode}
        onRefreshIntervalChange={setRefreshInterval}
        onManualRefresh={() => {
          void fetchRooms();
        }}
        onEnableNotifications={() => {
          void requestPermission();
        }}
        notificationSupported={isSupported}
        notificationPermission={permission}
        isRefreshing={isRefreshing}
        visibleCount={visibleRooms.length}
        totalCount={rooms.length}
        favoriteCount={favorites.length}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      {error && rooms.length > 0 && <div className="inline-error">{error}</div>}

      <RoomList
        rooms={visibleRooms}
        loading={loading}
        error={error}
        highlightedRoomId={highlightedRoomId}
        favoriteUserIds={favoriteUserIds}
        alertUserIds={alertUserIds}
        roomStatsById={roomStatsById}
        onRetry={() => {
          void fetchRooms();
        }}
        onJoin={handleJoin}
        onToggleFavorite={toggleFavorite}
        onToggleAlert={toggleAlert}
      />
    </div>
  );
}

export default App;
