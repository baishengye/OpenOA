/**
 * 认证状态管理 (Zustand)
 * 使用 zustandStorage (MMKV) 作为持久化后端
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/storageAdapter';
import type { UserInfo } from '../types';
import { login as loginAPI } from '../services/authService';

// ── 状态接口 ─────────────────────────────────────────────────────────────────

export interface AuthState {
  // 状态
  user: UserInfo | null;
  token: string | null;
  userID: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  rememberPassword: boolean;

  // 操作
  login: (phone: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  logout: () => void;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRememberPassword: (remember: boolean) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      userID: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
      rememberPassword: false,

      // 登录（只调用后端 API 获取凭证，IM 登录由 LoginScreen 处理）
      login: async (phone: string, password: string) => {
        console.log('[AuthStore] 开始登录流程');
        set({ isLoading: true, error: null });
        try {
          // 调用后端登录接口获取凭证
          console.log('[AuthStore] 调用后端登录 API');
          const response = await loginAPI(phone, password);
          console.log('[AuthStore] 后端登录成功:', { userID: response.userID, tokenPrefix: response.token.substring(0, 20) + '...' });

          // 保存凭证到本地，IM 登录由 LoginScreen 处理
          const user: UserInfo = {
            userID: response.userID,
            phone,
          };
          set({
            user,
            token: response.token,
            userID: response.userID,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : '登录失败';
          console.log('[AuthStore] 登录流程失败:', { message, error: err });
          set({
            error: message,
            isLoading: false,
          });
          throw err;
        }
      },

      // 登出
      logout: () => {
        set({
          user: null,
          token: null,
          userID: null,
          isLoggedIn: false,
          isLoading: false,
          error: null,
        });
      },

      // 生物识别登录（凭证已在本地，IM 连接由 LoginScreen 处理）
      loginWithBiometric: async () => {
        const { token, userID } = get();
        if (!token || !userID) {
          throw new Error('没有存储的登录凭证，请使用密码登录');
        }
        // 直接设置登录状态，IM 连接由 LoginScreen 处理
        set({
          isLoggedIn: true,
        });
      },

      // 更新用户信息
      updateUserInfo: (info: Partial<UserInfo>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...info },
          });
        }
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 设置错误
      setError: (error: string | null) => {
        set({ error });
      },

      // 设置记住密码
      setRememberPassword: (remember: boolean) => {
        set({ rememberPassword: remember });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        userID: state.userID,
        isLoggedIn: state.isLoggedIn,
        rememberPassword: state.rememberPassword,
      }),
    }
  )
);

// ── 便捷 Hooks ───────────────────────────────────────────────────────────────

/** 获取当前用户 ID */
export const useCurrentUserID = () => useAuthStore((state) => state.userID);

/** 获取认证 token */
export const useAuthToken = () => useAuthStore((state) => state.token);

/** 检查是否已登录 */
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);
