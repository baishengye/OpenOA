import React, { type ReactNode } from 'react';
import { Button as TButton, Spinner } from 'tamagui';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

const SIZE = { sm: '$3', md: '$4', lg: '$5' } as const;

/** 按钮。variant: solid(主色) / outline(描边) / ghost(无背景)。loading 时显 Spinner 并禁用。 */
export function Button({
  children,
  variant = 'solid',
  size = 'md',
  disabled,
  loading,
  onPress,
}: ButtonProps) {
  const tone =
    variant === 'ghost'
      ? { backgroundColor: 'transparent' as const, borderWidth: 0, color: '$blue9' as const }
      : variant === 'outline'
        ? {
            backgroundColor: 'transparent' as const,
            borderWidth: 1,
            borderColor: '$blue9' as const,
            color: '$blue9' as const,
          }
        : { backgroundColor: '$blue9' as const, borderWidth: 0, color: 'white' as const };

  return (
    <TButton
      size={SIZE[size]}
      disabled={disabled || loading}
      opacity={disabled ? 0.5 : 1}
      onPress={onPress}
      icon={loading ? <Spinner /> : undefined}
      {...tone}
    >
      {children}
    </TButton>
  );
}
