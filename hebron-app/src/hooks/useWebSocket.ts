import { isAuthenticated, readToken } from '@/utils/helper/local-storagte.helper';
import { configureEcho, echo, echoIsConfigured, useConnectionStatus, useSocketId } from '@laravel/echo-react';
import type Echo from 'laravel-echo';
import type { BroadcastDriver } from 'laravel-echo';
import Pusher from 'pusher-js';
import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<BroadcastDriver>;
  }
}

export type WebSocketStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'FAILED';

export type EchoSetupConfig = {
  key?: string;
  wsHost?: string;
  wsPort?: number;
  wssPort?: number;
  scheme?: 'http' | 'https' | 'ws' | 'wss';
  forceTLS?: boolean;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const resolveReverbConfig = (custom?: EchoSetupConfig) => {
  const isSecure = custom?.forceTLS ?? (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https';
  const port = Number(custom?.wsPort ?? custom?.wssPort ?? import.meta.env.VITE_REVERB_PORT ?? (isSecure ? 443 : 80));
  const authEndpoint = `${import.meta.env.VITE_API_ENDPOINT}/broadcasting/auth`;
  const headers = getAuthHeaders();

  return {
    broadcaster: 'reverb' as const,
    key: custom?.key ?? import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: custom?.wsHost ?? import.meta.env.VITE_REVERB_HOST,
    wsPort: port,
    wssPort: port,
    forceTLS: isSecure,
    enabledTransports: ['ws', 'wss'],
    authEndpoint,
    channelAuthorization: {
      endpoint: authEndpoint,
      headers,
      headersProvider: getAuthHeaders,
    },
    bearerToken: readToken() || undefined,
    auth: { headers },
  };
};

export function setupEcho(customConfig?: EchoSetupConfig): void {
  if (typeof window === 'undefined' || !isAuthenticated()) return;

  if (window.Echo && echoIsConfigured()) {
    return;
  }

  if (import.meta.env.DEV) {
    Pusher.logToConsole = true;
  }
  window.Pusher = Pusher;

  try {
    window.Echo?.disconnect();
  } catch (error) {
    console.error('Failed to disconnect previous Echo instance:', error);
  }

  configureEcho(resolveReverbConfig(customConfig) as any);

  try {
    const instance = echo();
    window.Echo = instance;
    (instance.connector as any)?.pusher?.connect();
  } catch {
    console.error('Config setup Echo is Error!');
  }
}

export function disconnectEcho(): void {
  if (typeof window === 'undefined') return;

  try {
    if (echoIsConfigured()) {
      echo().disconnect();
    }
  } catch {
    console.error('Config disconnect Echo is Error!');
  }
  delete (window as Partial<Window>).Echo;
}

setupEcho();

export type UseWebSocketOptions = {
  channel?: string;
  isPrivate?: boolean;
  autoConnect?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error?: unknown) => void;
};

const getChannelInstance = (target: string, isPrivateChannel: boolean) => {
  const instance = echo();
  return isPrivateChannel ? instance.private(target) : instance.channel(target);
};

export const useWebSocket = (options?: UseWebSocketOptions) => {
  const { channel, isPrivate = false, autoConnect = true, onOpen, onClose, onError } = options || {};

  const rawStatus = useConnectionStatus();
  const socketId = useSocketId();

  const status = (rawStatus ? rawStatus.toUpperCase() : 'DISCONNECTED') as WebSocketStatus;
  const isConnected = status === 'CONNECTED';
  const isConnecting = status === 'CONNECTING' || status === 'RECONNECTING';

  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current !== status) {
      if (status === 'CONNECTED') onOpen?.();
      else if (status === 'DISCONNECTED') onClose?.();
      else if (status === 'FAILED') onError?.(new Error('WebSocket connection failed'));
      prevStatusRef.current = status;
    }
  }, [status, onOpen, onClose, onError]);

  useEffect(() => {
    if (!autoConnect || !isAuthenticated()) return;
    try {
      (echo().connector as any)?.pusher?.connect();
    } catch (error) {
      console.error('Failed to auto-connect Echo:', error);
    }
  }, [autoConnect]);

  useEffect(() => {
    if (!autoConnect || !channel || !isAuthenticated()) return;

    getChannelInstance(channel, isPrivate);

    return () => {
      echo().leave(channel);
    };
  }, [channel, isPrivate, autoConnect]);

  const listen = useCallback(
    <T = unknown>(event: string, callback: (data: T) => void, channelName?: string, isChannelPrivate = isPrivate) => {
      const target = channelName || channel;
      if (!target) return () => {};

      const ch = getChannelInstance(target, isChannelPrivate);
      ch.listen(event, callback as (data: unknown) => void);

      return () => {
        ch.stopListening(event, callback as (data: unknown) => void);
      };
    },
    [channel, isPrivate],
  );

  const listenToAll = useCallback(
    <T = unknown>(callback: (event: string, data: T) => void, channelName?: string, isChannelPrivate = isPrivate) => {
      const target = channelName || channel;
      if (!target) return () => {};

      const ch = getChannelInstance(target, isChannelPrivate);
      (ch as any).listenToAll(callback);

      return () => {
        (ch as any).stopListeningToAll(callback);
      };
    },
    [channel, isPrivate],
  );

  const listenNotification = useCallback(
    <T = unknown>(callback: (data: T) => void, channelName?: string, isChannelPrivate = isPrivate) => {
      const target = channelName || channel;
      if (!target) return () => {};

      const ch = getChannelInstance(target, isChannelPrivate);
      ch.notification(callback as (data: unknown) => void);

      return () => {
        ch.stopListeningForNotification(callback as (data: unknown) => void);
      };
    },
    [channel, isPrivate],
  );

  const whisper = useCallback(
    (eventName: string, data: Record<string, unknown>, channelName?: string, isChannelPrivate = isPrivate) => {
      const target = channelName || channel;
      if (!target || !isChannelPrivate) return;

      const instance = echo<'reverb'>();
      instance.private(target).whisper(eventName, data);
    },
    [channel, isPrivate],
  );

  const connect = useCallback(() => {
    if (!isAuthenticated()) return;
    try {
      (echo().connector as any)?.pusher?.connect();
    } catch (error) {
      console.error('Failed to connect Echo:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectEcho();
  }, []);

  return {
    echo: echo(),
    status,
    rawStatus,
    isConnected,
    isConnecting,
    socketId,
    connect,
    disconnect,
    listen,
    listenToAll,
    listenNotification,
    whisper,
  };
};

export { configureEcho, echo, echoIsConfigured, useConnectionStatus, useSocketId };
