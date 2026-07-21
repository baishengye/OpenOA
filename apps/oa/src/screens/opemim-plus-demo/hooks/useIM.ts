/**
 * IM SDK Hook
 * 处理 SDK 初始化与连接
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { initIM, loginIM, logoutIM, getLoginStatus, onIMEvent } from '../services';

export interface UseIMOptions {
  /** 是否在挂载时自动初始化 */
  autoInit?: boolean;
}

export interface UseIMResult {
  /** 是否已初始化 */
  isInitialized: boolean;
  /** 连接状态 (数字: 1=登出, 2=登录中, 3=已登录) */
  status: number | null;
  /** 错误信息 */
  error: string | null;
  /** 初始化 SDK */
  initialize: () => Promise<void>;
  /** 连接 IM */
  connect: (userID: string, token: string) => Promise<void>;
  /** 断开连接 */
  disconnect: () => Promise<void>;
}

/**
 * IM SDK Hook
 * 用于管理 IM SDK 的初始化状态
 */
export function useIM(options: UseIMOptions = {}): UseIMResult {
  const { autoInit = true } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initPromiseRef = useRef<Promise<void> | null>(null);

  /** 初始化 SDK */
  const initialize = useCallback(async () => {
    if (isInitialized) {
      return;
    }

    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    initPromiseRef.current = (async () => {
      try {
        setError(null);
        console.log('[useIM] 开始初始化 SDK');
        await initIM();
        setIsInitialized(true);
        const currentStatus = await getLoginStatus();
        setStatus(currentStatus);
        console.log('[useIM] SDK 初始化完成, status:', currentStatus);
      } catch (err) {
        const message = err instanceof Error ? err.message : '初始化失败';
        setError(message);
        console.error('[useIM] SDK 初始化失败:', err);
      } finally {
        initPromiseRef.current = null;
      }
    })();

    return initPromiseRef.current;
  }, [isInitialized]);

  /** 连接 IM */
  const connect = useCallback(async (userID: string, token: string) => {
    try {
      setError(null);

      // 确保 SDK 已初始化
      if (!isInitialized) {
        console.log('[useIM] SDK 未初始化，先初始化');
        await initialize();
      }

      // 检查当前登录状态
      const currentStatus = await getLoginStatus();
      console.log('[useIM] 当前登录状态:', currentStatus);

      // 3 = Logged (已登录状态)
      if (currentStatus === 3) {
        console.log('[useIM] 用户已登录');
        setStatus(currentStatus);
        return;
      }

      console.log('[useIM] 开始连接 IM:', { userID, tokenPrefix: token.substring(0, 20) + '...' });
      await loginIM(userID, token);
      const newStatus = await getLoginStatus();
      setStatus(newStatus);
      console.log('[useIM] IM 连接成功, status:', newStatus);
    } catch (err) {
      const message = err instanceof Error ? err.message : '连接失败';
      setError(message);
      console.error('[useIM] IM 连接失败:', err);
      throw err;
    }
  }, [isInitialized, initialize]);

  /** 断开连接 */
  const disconnect = useCallback(async () => {
    try {
      console.log('[useIM] 断开 IM 连接');
      await logoutIM();
      const currentStatus = await getLoginStatus();
      setStatus(currentStatus);
    } catch (err) {
      console.error('[useIM] 断开连接失败:', err);
    }
  }, []);

  // 初始化
  useEffect(() => {
    if (autoInit) {
      initialize();
    }
  }, [autoInit, initialize]);

  // 监听状态变化
  useEffect(() => {
    const unsubTokenExpired = onIMEvent('tokenExpired', () => {
      console.log('[useIM] token 过期');
    });

    const unsubKickedOffline = onIMEvent('kickedOffline', () => {
      console.log('[useIM] 被踢下线');
    });

    return () => {
      unsubTokenExpired();
      unsubKickedOffline();
    };
  }, []);

  return {
    isInitialized,
    status,
    error,
    initialize,
    connect,
    disconnect,
  };
}
