/**
 * @itc/uikit ToastProvider
 * 全局 Toast 状态管理 + API 暴露
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { ToastContainer } from './ToastContainer';
import type {
  ToastOptions,
  ToastItem,
  ToastId,
  ToastInterface,
  ToastType,
  ToastTypeDefaults,
} from './types';
import { DEFAULT_TOAST_OPTIONS } from './config';

// ── Context ───────────────────────────────────────────────────────────────────

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  hide: () => void;
  setDefaultOptions: (options: ToastOptions) => void;
  setTypeDefaultOptions: (options: ToastTypeDefaults) => void;
  resetDefaultOptions: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── 全局 Context 引用 ─────────────────────────────────────────────────────────

// 用于静态 Toast API（Toast.show()）访问当前 context
const globalContextRef = { current: null as ToastContextValue | null };

// ── Reducer ───────────────────────────────────────────────────────────────────

type ToastAction =
  | { type: 'ADD'; payload: ToastItem }
  | { type: 'REMOVE'; payload: ToastId }
  | { type: 'REMOVE_ALL' };

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter((item) => item.id !== action.payload);
    case 'REMOVE_ALL':
      return [];
    default:
      return state;
  }
}

// ── Provider Props ─────────────────────────────────────────────────────────────

export interface ToastProviderProps {
  children: ReactNode;
  /** 全局默认配置 */
  defaultOptions?: ToastOptions;
  /** 按类型区分的默认 content */
  defaultTypeOptions?: ToastTypeDefaults;
}

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Toast Provider
 * 在 App 根节点包一层，自动挂载 Toast 容器层
 */
export function ToastProvider({
  children,
  defaultOptions = {},
  defaultTypeOptions = {},
}: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const defaultOptionsRef = useRef({ ...DEFAULT_TOAST_OPTIONS, ...defaultOptions });
  const defaultTypeOptionsRef = useRef<ToastTypeDefaults>({ ...defaultTypeOptions });

  // 生成唯一 id
  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  // 根据类型获取对应的默认 content
  const getTypeDefaultContent = useCallback((type: ToastType): ReactNode | undefined => {
    const typeDefaults = defaultTypeOptionsRef.current;
    switch (type) {
      case 'info':
        return typeDefaults.contentInfo;
      case 'warn':
        return typeDefaults.contentWarn;
      case 'success':
        return typeDefaults.contentSuccess;
      case 'fail':
        return typeDefaults.contentFail;
      default:
        return undefined;
    }
  }, []);

  // 合并默认配置和用户配置
  const mergeOptions = useCallback(
    (options: ToastOptions): ToastItem => {
      const type = options.type ?? 'info';
      const typeDefaultContent = getTypeDefaultContent(type);

      // 基础配置合并
      const baseMerged = {
        ...DEFAULT_TOAST_OPTIONS,
        ...defaultOptionsRef.current,
        ...options,
      };

      // 如果没有显式传入 content，且该类型有默认 content，则使用默认
      if (options.content === undefined && typeDefaultContent !== undefined) {
        baseMerged.content = typeDefaultContent;
      }

      return {
        id: generateId(),
        options: baseMerged as Required<ToastOptions>,
      };
    },
    [generateId, getTypeDefaultContent]
  );

  // 显示 toast
  const show = useCallback((options: ToastOptions) => {
    const item = mergeOptions(options);
    dispatch({ type: 'ADD', payload: item });
  }, [mergeOptions]);

  // 隐藏所有 toast
  const hide = useCallback(() => {
    dispatch({ type: 'REMOVE_ALL' });
  }, []);

  // 设置全局默认配置
  const setDefaultOptions = useCallback((options: ToastOptions) => {
    defaultOptionsRef.current = {
      ...defaultOptionsRef.current,
      ...options,
    };
  }, []);

  // 设置按类型区分的默认配置
  const setTypeDefaultOptions = useCallback((options: ToastTypeDefaults) => {
    defaultTypeOptionsRef.current = {
      ...defaultTypeOptionsRef.current,
      ...options,
    };
  }, []);

  // 重置全局默认配置
  const resetDefaultOptions = useCallback(() => {
    defaultOptionsRef.current = { ...DEFAULT_TOAST_OPTIONS };
    defaultTypeOptionsRef.current = {};
  }, []);

  // 移除单个 toast
  const removeToast = useCallback((id: ToastId) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      show,
      hide,
      setDefaultOptions,
      setTypeDefaultOptions,
      resetDefaultOptions,
    }),
    [show, hide, setDefaultOptions, setTypeDefaultOptions, resetDefaultOptions]
  );

  // 注册 context 到全局引用，供静态 Toast API 使用
  useEffect(() => {
    globalContextRef.current = contextValue;
    return () => {
      globalContextRef.current = null;
    };
  }, [contextValue]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ── 导出 Toast API ────────────────────────────────────────────────────────────

/**
 * Toast 静态 API
 * 通过全局 context 引用调用
 */
export const Toast: ToastInterface = {
  show: (options: ToastOptions) => {
    const ctx = globalContextRef.current;
    if (ctx) {
      ctx.show(options);
    }
  },
  hide: () => {
    const ctx = globalContextRef.current;
    if (ctx) {
      ctx.hide();
    }
  },
  setDefaultOptions: (options: ToastOptions) => {
    const ctx = globalContextRef.current;
    if (ctx) {
      ctx.setDefaultOptions(options);
    }
  },
  setTypeDefaultOptions: (options: ToastTypeDefaults) => {
    const ctx = globalContextRef.current;
    if (ctx) {
      ctx.setTypeDefaultOptions(options);
    }
  },
  resetDefaultOptions: () => {
    const ctx = globalContextRef.current;
    if (ctx) {
      ctx.resetDefaultOptions();
    }
  },
};
