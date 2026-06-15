import React from 'react';
import { Input as TInput } from 'tamagui';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  /** 密码输入 */
  secureTextEntry?: boolean;
  disabled?: boolean;
  size?: InputSize;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
  autoFocus?: boolean;
}

const SIZE = { sm: '$3', md: '$4', lg: '$5' } as const;

/** 文本输入框（EditText）。受控（value+onChangeText）或非受控（defaultValue）。 */
export function Input({
  value,
  defaultValue,
  placeholder,
  onChangeText,
  secureTextEntry,
  disabled,
  size = 'md',
  keyboardType,
  autoFocus,
}: InputProps) {
  return (
    <TInput
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      disabled={disabled}
      size={SIZE[size]}
      keyboardType={keyboardType}
      autoFocus={autoFocus}
    />
  );
}
