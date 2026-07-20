import React, { type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Button } from './Button';
import { Text } from './Text';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 标题 */
  title?: string;
  /** 内容 */
  children?: ReactNode;
  /** 确认回调；不传则不显确认按钮 */
  onConfirm?: () => void;
  /** 取消回调；不传则不显取消按钮 */
  onCancel?: () => void;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 自定义标题渲染 */
  renderHeader?: () => ReactNode;
  /** 自定义内容渲染 */
  renderContent?: () => ReactNode;
  /** 自定义底部渲染（优先级高于默认按钮） */
  renderFooter?: () => ReactNode;
  /** 完全自定义整个对话框内容 */
  renderContainer?: (props: {
    header: ReactNode;
    content: ReactNode;
    footer: ReactNode;
  }) => ReactNode;
}

/**
 * 模态对话框（标题 + 内容 + 确认/取消）。
 *
 * 用 RN 原生 `Modal` 而非 tamagui 的 `Dialog.Portal`：
 * tamagui 的 Portal 在 native 是「同树内绝对定位浮层」，不接管硬件返回键、
 * 且在鸿蒙（RNOH）上浮层触摸事件无法命中按钮。RN `Modal` 在三端（iOS/Android/
 * 鸿蒙 RNOH 均有原生 ModalHostView 实现）都是独立原生窗口：触摸正确路由，
 * 且 `onRequestClose` 接管硬件返回键 —— 返回键收起对话框而非退出页面。
 * 仍用 tamagui 的 YStack/Text/Button 保持样式一致、不暴露 tamagui。
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  renderHeader,
  renderContent,
  renderFooter,
  renderContainer,
}: DialogProps) {
  const close = () => onOpenChange(false);

  // 默认标题
  const defaultHeader = title ? <Text variant="h3">{title}</Text> : null;

  // 默认内容
  const defaultContent =
    typeof children === 'string' ? <Text>{children}</Text> : children;

  // 默认底部按钮
  const defaultFooter = (
    <XStack gap={8} justifyContent="flex-end" paddingTop={8}>
      {onCancel ? (
        <Button variant="ghost" onPress={onCancel}>
          {cancelText}
        </Button>
      ) : null}
      {onConfirm ? <Button onPress={onConfirm}>{confirmText}</Button> : null}
    </XStack>
  );

  const header = renderHeader ? renderHeader() : defaultHeader;
  const content = renderContent ? renderContent() : defaultContent;
  const footer = renderFooter ? renderFooter() : defaultFooter;

  // 完全自定义容器
  if (renderContainer) {
    return (
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {renderContainer({ header, content, footer })}
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      {/* 半透明遮罩：点击空白处关闭（对齐原 Overlay 行为） */}
      <Pressable style={styles.overlay} onPress={close}>
        {/* 阻止点击内容区时冒泡到遮罩而误关闭 */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <YStack
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$4"
            padding={20}
            gap={12}
            width={320}
            maxWidth="90%"
          >
            {header}
            {content}
            {footer}
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
});
