import React from 'react';
import {
  Switch as TSwitch,
  Checkbox as TCheckbox,
  RadioGroup as TRadioGroup,
  XStack,
  SizableText,
} from 'tamagui';

// ── Switch ─────────────────────────────────────────────────────────────────────
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
/** 开关 */
export function Switch({ checked, onChange, disabled }: SwitchProps) {
  // tamagui 的 native Switch 在 checked 态会把轨道背景强制设成 $backgroundActive
  // （在内联 props 之后 spread，会盖掉条件式 backgroundColor）。正确做法：未选态用
  // backgroundColor、选中态用 activeStyle（tamagui 专门用它接 checked 样式）。
  return (
    <TSwitch
      size="$3"
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      backgroundColor="$gray6"
      activeStyle={{ backgroundColor: '$blue9' }}
      borderWidth={0}
      opacity={disabled ? 0.5 : 1}
    >
      <TSwitch.Thumb backgroundColor="white" />
    </TSwitch>
  );
}

// ── Checkbox ───────────────────────────────────────────────────────────────────
export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
/** 复选框（可带标签） */
export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <XStack alignItems="center" gap={8}>
      <TCheckbox
        size="$4"
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        disabled={disabled}
        backgroundColor={checked ? '$blue9' : 'transparent'}
        borderColor={checked ? '$blue9' : '$gray8'}
        borderWidth={1}
        opacity={disabled ? 0.5 : 1}
      >
        <TCheckbox.Indicator>
          <SizableText size="$3" color="white">
            ✓
          </SizableText>
        </TCheckbox.Indicator>
      </TCheckbox>
      {label ? <SizableText size="$3">{label}</SizableText> : null}
    </XStack>
  );
}

// ── Radio ──────────────────────────────────────────────────────────────────────
export interface RadioOption {
  label: string;
  value: string;
}
export interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
}
/** 单选组 */
export function RadioGroup({ value, onChange, options, disabled }: RadioGroupProps) {
  return (
    <TRadioGroup value={value} onValueChange={onChange} disabled={disabled}>
      {options.map((o) => (
        <XStack key={o.value} alignItems="center" gap={8} paddingVertical={4}>
          <TRadioGroup.Item
            value={o.value}
            id={`radio-${o.value}`}
            size="$4"
            borderColor={value === o.value ? '$blue9' : '$gray8'}
            borderWidth={1}
          >
            <TRadioGroup.Indicator backgroundColor="$blue9" />
          </TRadioGroup.Item>
          <SizableText size="$3">{o.label}</SizableText>
        </XStack>
      ))}
    </TRadioGroup>
  );
}
