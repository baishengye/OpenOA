/**
 * @itc/uikit ToastContainer
 * 管理 toast 队列，支持多 toast 垂直堆叠显示
 */
import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Portal } from '@gorhom/portal';
import type { ToastItem, ToastId, ToastOptions, ToastType } from './types';
import {
  DEFAULT_ICONS,
  DEFAULT_COLORS,
  BASE_CONTAINER_STYLE,
  BASE_CONTENT_STYLE,
  BASE_ICON_STYLE,
  BASE_MESSAGE_STYLE,
} from './config';

// ── 容器样式 ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
    zIndex: 9999,
  },
  toastList: {
    position: 'absolute',
    bottom: Dimensions.get('window').height * 0.2,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
});

// ── Reducer 类型 ──────────────────────────────────────────────────────────────

type ToastAction =
  | { type: 'ADD'; payload: ToastItem }
  | { type: 'REMOVE'; payload: ToastId };

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter((item) => item.id !== action.payload);
    default:
      return state;
  }
}

// ── 单个 Toast 项组件 ─────────────────────────────────────────────────────────

interface ToastItemViewProps {
  item: ToastItem;
  onRemove: (id: ToastId) => void;
}

function ToastItemView({ item, onRemove }: ToastItemViewProps) {
  const { options } = item;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const type: ToastType = options.type ?? 'info';
  const icon = options.icon ?? DEFAULT_ICONS[type];
  const iconColor = DEFAULT_COLORS[type];

  // 入场动画
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 自动关闭
    if (options.duration > 0) {
      const timer = setTimeout(() => {
        handleHide();
      }, options.duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleHide = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove(item.id);
    });
  }, [fadeAnim, slideAnim, item.id, onRemove]);

  const containerStyle = {
    ...BASE_CONTAINER_STYLE,
    ...options.style,
  };

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={handleHide}>
        <View style={BASE_CONTENT_STYLE}>
          {options.content ? (
            options.content
          ) : (
            <>
              <Text
                style={[BASE_ICON_STYLE, { color: iconColor }, options.iconStyle]}
              >
                {icon}
              </Text>
              <Text
                style={[
                  BASE_MESSAGE_STYLE,
                  options.messageStyle,
                ]}
                numberOfLines={3}
              >
                {options.message}
              </Text>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

// ── ToastContainer 组件 ───────────────────────────────────────────────────────

export interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: ToastId) => void;
}

/**
 * Toast 容器组件
 * 渲染所有活跃的 toast，支持垂直堆叠
 */
export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <Portal>
      <View style={styles.overlay}>
        <View style={styles.toastList}>
          {toasts.map((item) => (
            <ToastItemView
              key={item.id}
              item={item}
              onRemove={onRemove}
            />
          ))}
        </View>
      </View>
    </Portal>
  );
}
