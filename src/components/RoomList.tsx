import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import { RoomCard } from './RoomCard';

import {
  LIST_COL_AUTO_MAX_WIDTH,
  LIST_COL_MIN_WIDTH,
  loadListColumnWidthsSetting,
  saveListColumnWidthsSetting,
} from '../logic';
import type { GuestRoom, RoomFavoriteStats, RoomViewMode } from '../types';

interface RoomListProps {
  rooms: GuestRoom[];
  loading: boolean;
  error: string | null;
  viewMode: RoomViewMode;
  highlightedRoomId: string | null;
  favoriteUserIds: Set<string>;
  alertUserIds: Set<string>;
  roomStatsById: Map<string, RoomFavoriteStats>;
  onRetry: () => void;
  onJoin: (room: GuestRoom) => void;
  onToggleFavorite: (userId: string) => void;
  onToggleAlert: (userId: string) => void;
}

export function RoomList({
  rooms,
  loading,
  error,
  viewMode,
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
    return viewMode === 'list' ? <SkeletonRoomTable /> : <SkeletonRoomList />;
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

  if (viewMode === 'list') {
    return (
      <RoomTable
        rooms={rooms}
        onJoin={onJoin}
        favoriteUserIds={favoriteUserIds}
        alertUserIds={alertUserIds}
      />
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

type ResizableColumn = 'name' | 'members' | 'description';

const COL_DRAG_MAX_WIDTH = 720;
const POINTER_DRAG_THRESHOLD = 4;
const HEADER_EXTRA_PX = 32;
const COLUMN_BUFFER_PX = 12;
const CHIP_X_PADDING_PX = 12;
const CHIP_GAP_PX = 6;
const CHIP_BORDER_PX = 2;

let measureCanvasContext: CanvasRenderingContext2D | null = null;

function getMeasureCanvasContext() {
  if (measureCanvasContext) {
    return measureCanvasContext;
  }
  const canvas = document.createElement('canvas');
  measureCanvasContext = canvas.getContext('2d');
  return measureCanvasContext;
}

function measureTextWidth(text: string, font: string) {
  const context = getMeasureCanvasContext();
  if (!context) {
    return text.length * 9;
  }
  context.font = font;
  return context.measureText(text).width;
}

function readCellFont(table: HTMLElement, selector: string, fallback: string) {
  const element = table.querySelector(selector);
  if (!element) {
    return fallback;
  }
  const style = getComputedStyle(element);
  return `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function clampDragWidth(width: number) {
  return Math.max(LIST_COL_MIN_WIDTH, Math.min(COL_DRAG_MAX_WIDTH, width));
}

function clampAutoFitWidth(width: number) {
  return Math.max(LIST_COL_MIN_WIDTH, Math.min(LIST_COL_AUTO_MAX_WIDTH, width));
}

function RoomTable({
  rooms,
  onJoin,
  favoriteUserIds,
  alertUserIds,
}: Pick<RoomListProps, 'rooms' | 'onJoin' | 'favoriteUserIds' | 'alertUserIds'>) {
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = loadListColumnWidthsSetting();
    return {
      name: saved.name,
      members: saved.members,
      description: saved.description,
    };
  });
  const [membersShowFullNames, setMembersShowFullNames] = useState(
    () => loadListColumnWidthsSetting().membersShowFullNames,
  );

  useEffect(() => {
    saveListColumnWidthsSetting({
      ...columnWidths,
      membersShowFullNames,
    });
  }, [columnWidths, membersShowFullNames]);
  const tableRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    key: ResizableColumn;
    startX: number;
    startWidth: number;
    dragging: boolean;
  } | null>(null);

  const autoFitColumn = useCallback(
    (key: ResizableColumn) => {
      const table = tableRef.current;
      if (!table) {
        return;
      }

      const headerFont = readCellFont(
        table,
        '.room-row-head .cell-name',
        '700 0.76rem system-ui, sans-serif',
      );
      const nameFont = readCellFont(
        table,
        '.room-row .cell-name[role="cell"]',
        '700 1rem system-ui, sans-serif',
      );
      const descFont = readCellFont(
        table,
        '.room-row .cell-desc[role="cell"]',
        '400 1rem system-ui, sans-serif',
      );
      const chipFont = readCellFont(
        table,
        '.list-member-chip-text',
        '700 0.78rem system-ui, sans-serif',
      );
      const membersHeaderFont = readCellFont(
        table,
        '.room-row-head .cell-members',
        '700 0.76rem system-ui, sans-serif',
      );

      let nextWidth = LIST_COL_MIN_WIDTH;

      if (key === 'name') {
        const samples = ['部屋名', ...rooms.map((room) => room.name)];
        const maxText = Math.max(
          ...samples.map((text) =>
            measureTextWidth(text, text === '部屋名' ? headerFont : nameFont),
          ),
        );
        nextWidth = maxText + HEADER_EXTRA_PX + COLUMN_BUFFER_PX;
      } else if (key === 'description') {
        const descHeaderFont = readCellFont(
          table,
          '.room-row-head .cell-desc',
          '700 0.76rem system-ui, sans-serif',
        );
        const samples = ['説明', ...rooms.map((room) => formatRoomDescription(room.description))];
        const maxText = Math.max(
          ...samples.map((text) =>
            measureTextWidth(text, text === '説明' ? descHeaderFont : descFont),
          ),
        );
        nextWidth = maxText + HEADER_EXTRA_PX + COLUMN_BUFFER_PX;
      } else {
        let maxRowWidth = measureTextWidth('メンバー', membersHeaderFont) + HEADER_EXTRA_PX;
        for (const room of rooms) {
          const ordered = sortRoomMembersForDisplay(
            room.members,
            room.ownerUser.userId,
            favoriteUserIds,
            alertUserIds,
          );
          let rowWidth = 0;
          for (let index = 0; index < ordered.length; index += 1) {
            const nickname = ordered[index].nickname?.trim() || 'ゲスト';
            rowWidth += CHIP_X_PADDING_PX + CHIP_BORDER_PX + measureTextWidth(nickname, chipFont);
            if (index > 0) {
              rowWidth += CHIP_GAP_PX;
            }
          }
          maxRowWidth = Math.max(maxRowWidth, rowWidth);
        }
        nextWidth = maxRowWidth + COLUMN_BUFFER_PX;
        setMembersShowFullNames(true);
      }

      setColumnWidths((current) => ({
        ...current,
        [key]: clampAutoFitWidth(Math.ceil(nextWidth)),
      }));
    },
    [rooms, favoriteUserIds, alertUserIds],
  );

  const startResize = useCallback(
    (key: ResizableColumn, event: ReactPointerEvent<HTMLSpanElement>) => {
      if (event.detail > 1) {
        return;
      }

      event.preventDefault();
      dragStateRef.current = {
        key,
        startX: event.clientX,
        startWidth: columnWidths[key],
        dragging: false,
      };

      const handleMove = (moveEvent: PointerEvent) => {
        if (!dragStateRef.current) {
          return;
        }
        const { key: currentKey, startX, startWidth, dragging } = dragStateRef.current;
        const deltaX = moveEvent.clientX - startX;
        if (!dragging && Math.abs(deltaX) < POINTER_DRAG_THRESHOLD) {
          return;
        }
        if (!dragging) {
          dragStateRef.current.dragging = true;
          document.body.style.cursor = 'col-resize';
          if (currentKey === 'members') {
            setMembersShowFullNames(false);
          }
        }
        const nextWidth = clampDragWidth(startWidth + deltaX);
        setColumnWidths((current) => ({ ...current, [currentKey]: nextWidth }));
      };

      const handleUp = () => {
        dragStateRef.current = null;
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [columnWidths],
  );

  const handleResizerDoubleClick = useCallback(
    (key: ResizableColumn, event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragStateRef.current = null;
      document.body.style.cursor = '';
      autoFitColumn(key);
    },
    [autoFitColumn],
  );

  return (
    <section className="room-table-wrap">
      <div
        ref={tableRef}
        className={`room-table${membersShowFullNames ? ' fit-members-full' : ''}`}
        role="table"
        aria-label="ルーム一覧"
        style={
          {
            '--col-name': `${columnWidths.name}px`,
            '--col-members': `${columnWidths.members}px`,
            '--col-desc': `${columnWidths.description}px`,
          } as CSSProperties
        }
      >
        <div className="room-table-head" role="rowgroup">
          <div className="room-row room-row-head" role="row">
            <span className="cell-lock" role="columnheader">
              鍵
            </span>
            <span className="cell-name" role="columnheader">
              部屋名
              <span
                className="col-resizer"
                role="separator"
                aria-label="部屋名カラム幅調整（ダブルクリックで内容に合わせて拡張）"
                aria-orientation="vertical"
                onPointerDown={(event) => startResize('name', event)}
                onDoubleClick={(event) => handleResizerDoubleClick('name', event)}
              >
                ↔
              </span>
            </span>
            <span className="cell-count" role="columnheader">
              人数
            </span>
            <span className="cell-members" role="columnheader">
              メンバー
              <span
                className="col-resizer"
                role="separator"
                aria-label="メンバーカラム幅調整（ダブルクリックで内容に合わせて拡張）"
                aria-orientation="vertical"
                onPointerDown={(event) => startResize('members', event)}
                onDoubleClick={(event) => handleResizerDoubleClick('members', event)}
              >
                ↔
              </span>
            </span>
            <span className="cell-desc" role="columnheader">
              説明
              <span
                className="col-resizer"
                role="separator"
                aria-label="説明カラム幅調整（ダブルクリックで内容に合わせて拡張）"
                aria-orientation="vertical"
                onPointerDown={(event) => startResize('description', event)}
                onDoubleClick={(event) => handleResizerDoubleClick('description', event)}
              >
                ↔
              </span>
            </span>
            <span className="cell-join" role="columnheader">
              入室
            </span>
          </div>
        </div>
        <div className="room-table-body" role="rowgroup">
          {rooms.map((room) => (
            <div className="room-row" role="row" key={room.roomId} data-room-id={room.roomId}>
              <span className="cell-lock" role="cell" aria-label={room.needPasswd ? '鍵あり' : '鍵なし'}>
                {room.needPasswd ? '🔒' : ''}
              </span>
              <span className="cell-name" role="cell" title={room.name}>
                {room.name}
              </span>
              <span className="cell-count" role="cell">
                {room.members.length}/{room.maxMemberCount}
              </span>
              <div
                className="cell-members"
                role="cell"
                title={formatMemberNames(room, favoriteUserIds, alertUserIds)}
              >
                <div className="room-member-chip-row" aria-label="メンバー">
                  {renderMemberChips(
                    room,
                    favoriteUserIds,
                    alertUserIds,
                    columnWidths.members,
                  )}
                </div>
              </div>
              <span className="cell-desc" role="cell" title={room.description || undefined}>
                {formatRoomDescription(room.description)}
              </span>
              <span className="cell-join" role="cell">
                <button className="btn join-icon-button" onClick={() => onJoin(room)} title="入室" aria-label="入室">
                  🚪
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatMemberNames(
  room: GuestRoom,
  favoriteUserIds: Set<string>,
  alertUserIds: Set<string>,
) {
  const ordered = sortRoomMembersForDisplay(
    room.members,
    room.ownerUser.userId,
    favoriteUserIds,
    alertUserIds,
  );

  if (!ordered.length) {
    return '—';
  }

  const names = ordered
    .map((member) => member.nickname?.trim())
    .filter((nickname): nickname is string => Boolean(nickname));

  return names.length ? names.join(', ') : '—';
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

function renderMemberChips(
  room: GuestRoom,
  favoriteUserIds: Set<string>,
  alertUserIds: Set<string>,
  memberColumnWidth: number,
) {
  const CHIP_WIDTH = 96;
  const CHIP_GAP = 6;
  const availableWidth = Math.max(memberColumnWidth - 16, CHIP_WIDTH);
  const dynamicLimit = Math.floor((availableWidth + CHIP_GAP) / (CHIP_WIDTH + CHIP_GAP));
  const MAX_CHIPS = Math.max(1, dynamicLimit);
  const ordered = sortRoomMembersForDisplay(
    room.members,
    room.ownerUser.userId,
    favoriteUserIds,
    alertUserIds,
  );

  const total = ordered.length;
  const visible = ordered.slice(0, MAX_CHIPS);

  return (
    <>
      {visible.map((member) => {
        const nickname = member.nickname?.trim() || 'ゲスト';
        const isFavorite = favoriteUserIds.has(member.userId);
        const isOwner = member.userId === room.ownerUser.userId;

        return (
          <span
            key={`${room.roomId}-${member.userId}`}
            className={`list-member-chip ${isFavorite ? 'is-favorite' : ''} ${
              isOwner ? 'is-owner' : ''
            }`.trim()}
            title={nickname}
          >
            <span className="list-member-chip-text">{nickname}</span>
          </span>
        );
      })}
      {total > visible.length && (
        <span
          className="list-member-chip list-member-chip-more"
          title={`+${total - visible.length}`}
        >
          <span className="list-member-chip-text">+{total - visible.length}</span>
        </span>
      )}
    </>
  );
}

function formatRoomDescription(description: string) {
  const normalized = description?.trim();
  return normalized ? normalized : '—';
}

function SkeletonRoomTable() {
  return (
    <section className="room-table-wrap" aria-hidden="true">
      <div className="room-table">
        <div className="room-row room-row-head">
          <span className="cell-lock">鍵</span>
          <span className="cell-name">部屋名</span>
          <span className="cell-count">人数</span>
          <span className="cell-members">メンバー</span>
          <span className="cell-desc">説明</span>
          <span className="cell-join">入室</span>
        </div>
        <div className="room-table-body">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="room-row" key={index}>
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-pill" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
