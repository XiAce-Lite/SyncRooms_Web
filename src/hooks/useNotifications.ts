import { useCallback, useEffect, useState } from 'react';

import type { RoomPresenceEvent } from '../types';

type PermissionState = NotificationPermission | 'unsupported';

interface NotificationOptions {
  notifyOnEnter?: boolean;
  notifyOnExit?: boolean;
}

export function useNotifications(
  onRoomFocus?: (roomId: string) => void,
  options?: NotificationOptions,
) {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState<PermissionState>(
    isSupported ? Notification.permission : 'unsupported',
  );

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return 'unsupported' as const;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    return nextPermission;
  }, [isSupported]);

  const notifyRoomEvent = useCallback(
    (event: RoomPresenceEvent) => {
      if (!isSupported || permission !== 'granted') {
        return;
      }

      if (event.type === 'enter' && options?.notifyOnEnter === false) {
        return;
      }

      if (event.type === 'exit' && options?.notifyOnExit === false) {
        return;
      }

      const body =
        event.type === 'enter'
          ? `${event.nickname} さんが、${event.roomName} に入室しました。`
          : `${event.nickname} さんが、${event.roomName} から退室しました。`;

      const notification = new Notification('SyncRooms', {
        body,
        tag:
          event.type === 'enter'
            ? `enter:${event.userId}:${event.roomId}`
            : `exit:${event.userId}:${event.roomId}:${Date.now()}`,
      });

      notification.onclick = () => {
        window.focus();
        onRoomFocus?.(event.roomId);
        notification.close();
      };
    },
    [isSupported, onRoomFocus, options?.notifyOnEnter, options?.notifyOnExit, permission],
  );

  return {
    isSupported,
    permission,
    requestPermission,
    notifyRoomEvent,
  };
}
