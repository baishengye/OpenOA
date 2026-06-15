import React, { type ReactNode } from 'react';
import { Dialog as TDialog, XStack } from 'tamagui';
import { Button } from './Button';
import { Text } from './Text';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  /** 确认回调；不传则不显确认按钮 */
  onConfirm?: () => void;
  /** 取消回调；不传则不显取消按钮 */
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

/** 模态对话框（标题 + 内容 + 确认/取消）。 */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
}: DialogProps) {
  return (
    <TDialog modal open={open} onOpenChange={onOpenChange}>
      <TDialog.Portal>
        <TDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
        <TDialog.Content
          key="content"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$4"
          padding={20}
          gap={12}
          width="80%"
          maxWidth={400}
        >
          {title ? <Text variant="h3">{title}</Text> : null}
          {typeof children === 'string' ? <Text>{children}</Text> : children}
          <XStack gap={8} justifyContent="flex-end" paddingTop={8}>
            {onCancel ? (
              <Button variant="ghost" onPress={onCancel}>
                {cancelText}
              </Button>
            ) : null}
            {onConfirm ? <Button onPress={onConfirm}>{confirmText}</Button> : null}
          </XStack>
        </TDialog.Content>
      </TDialog.Portal>
    </TDialog>
  );
}
