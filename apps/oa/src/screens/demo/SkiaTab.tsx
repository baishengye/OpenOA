/**
 * Skia 组件演示页面
 * 展示 Skia 2D 图形渲染能力
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Rect,
  RoundedRect,
  Line,
  Path,
  LinearGradient,
  RadialGradient,
  SweepGradient,
  TwoPointConicalGradient,
  BoxShadow,
  Blur,
  DiffRect,
  Oval,
  Points,
  Patch,
} from '@itc/skia';
import type { CubicBezierHandle } from '@itc/skia';
import { shared } from './shared';
import type { RunFn } from './shared';

interface Props {
  run: RunFn;
  append: (line: string) => void;
  busy: boolean;
}

export function SkiaTab({ run, append, busy }: Props): React.JSX.Element {
  const [demo, setDemo] = useState<string>('colors');

  const renderDemo = () => {
    switch (demo) {
      case 'colors':
        return <ColorsDemo />;
      case 'shapes':
        return <ShapesDemo />;
      case 'gradient':
        return <GradientDemo />;
      case 'path':
        return <PathDemo />;
      case 'shadow':
        return <ShadowDemo />;
      case 'animation':
        return <AnimationDemo />;
      case 'noise':
        return <NoiseDemo />;
      case 'advanced':
        return <AdvancedDemo />;
      case 'sweep':
        return <SweepGradientDemo />;
      case 'blurEffect':
        return <BlurEffectDemo />;
      case 'particles':
        return <ParticlesDemo />;
      case 'bezier':
        return <BezierDemo />;
      default:
        return <ColorsDemo />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Demo 选择按钮 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        <View style={styles.buttonRow}>
          {DEMOS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.button, demo === d && styles.buttonActive]}
              onPress={() => setDemo(d)}
              disabled={busy}
            >
              <Text style={[styles.buttonText, demo === d && styles.buttonTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Canvas 演示区域 */}
      <View style={styles.canvasContainer}>
        {renderDemo()}
      </View>

      {/* 描述 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>
          {getDemoTitle(demo)}
        </Text>
        <Text style={shared.mono}>{getDemoDesc(demo)}</Text>
      </View>
    </View>
  );
}

const DEMOS = ['colors', 'shapes', 'gradient', 'path', 'shadow', 'animation', 'noise', 'advanced', 'sweep', 'blurEffect', 'particles', 'bezier'] as const;

const getDemoTitle = (key: string): string => {
  const titles: Record<string, string> = {
    colors: '颜色混合 (CMYK)',
    shapes: '基础图形',
    gradient: '渐变填充',
    path: '路径绘制',
    shadow: '阴影效果',
    animation: '动画效果',
    noise: '噪点纹理',
    advanced: '高级组合',
    sweep: '扫描渐变',
    blurEffect: '模糊效果',
    particles: '粒子系统',
    bezier: '贝塞尔曲线',
  };
  return titles[key] || key;
};

const getDemoDesc = (key: string): string => {
  const descs: Record<string, string> = {
    colors: '使用 blendMode="multiply" 混合青、黄、品红三色',
    shapes: 'Canvas 内绘制圆形、矩形、圆角矩形、直线',
    gradient: 'LinearGradient 和 RadialGradient 渐变效果',
    path: '使用 SVG 路径语法绘制复杂图形',
    shadow: 'BoxShadow 组件实现盒阴影效果',
    animation: '使用 React 状态驱动 Skia 图形动画',
    noise: 'FractalNoise 和 Turbulence 生成纹理',
    advanced: '多种效果组合：渐变 + 阴影 + 混合模式',
    sweep: 'SweepGradient 扫描渐变，围绕中心点旋转',
    blurEffect: 'Blur 组件实现模糊滤镜效果',
    particles: '动态粒子系统，随机运动和颜色变化',
    bezier: '使用 Patch 组件绘制贝塞尔曲线曲面',
  };
  return descs[key] || key;
};

/** 颜色混合演示 */
function ColorsDemo(): React.JSX.Element {
  const width = 200;
  const height = 200;
  const r = width * 0.35;

  return (
    <Canvas style={{ width, height }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
}

/** 基础图形演示 */
function ShapesDemo(): React.JSX.Element {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 圆形 */}
      <Circle cx={50} cy={50} r={30} color="#ff6b6b" />
      {/* 矩形 */}
      <Rect x={100} y={20} width={80} height={60} color="#4ecdc4" />
      {/* 圆角矩形 */}
      <RoundedRect x={20} y={100} width={80} height={60} r={10} color="#ffe66d" />
      {/* 直线 */}
      <Line p1={{ x: 120, y: 100 }} p2={{ x: 180, y: 160 }} strokeStyle={{ color: '#1a535c', width: 3 }} />
    </Canvas>
  );
}

/** 渐变演示 */
function GradientDemo(): React.JSX.Element {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 线性渐变 */}
      <Rect x={10} y={10} width={80} height={80}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 80, y: 80 }}
          colors={['#667eea', '#764ba2']}
        />
      </Rect>
      {/* 径向渐变 */}
      <Circle cx={150} cy={80} r={40}>
        <RadialGradient
          c={{ x: 150, y: 80 }}
          r={40}
          colors={['#f093fb', '#f5576c']}
        />
      </Circle>
      {/* 渐变矩形 */}
      <RoundedRect x={60} y={120} width={80} height={60} r={8}>
        <LinearGradient
          start={{ x: 60, y: 120 }}
          end={{ x: 140, y: 180 }}
          colors={['#4facfe', '#00f2fe']}
        />
      </RoundedRect>
    </Canvas>
  );
}

/** 路径演示 */
// PathDemo 使用 stroke 属性
function PathDemo(): React.JSX.Element {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 三角形 */}
      <Path
        path="M 100 20 L 180 180 L 20 180 Z"
        color="#20c997"
        stroke={{ width: 2 }}
      />
      {/* 心形（简化） */}
      <Path
        path="M 100 180 C 60 140, 20 100, 20 60 C 20 20, 60 20, 100 60 C 140 20, 180 20, 180 60 C 180 100, 140 140, 100 180"
        color="#e83e8c"
        stroke={{ width: 2 }}
      />
    </Canvas>
  );
}

/** 阴影演示 */
function ShadowDemo(): React.JSX.Element {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 带阴影的圆 */}
      <Group>
        <Circle cx={80} cy={80} r={50} color="#dee2e6">
          <BoxShadow dx={4} dy={4} blur={8} color="#868e96" />
        </Circle>
      </Group>
      {/* 带阴影的矩形 */}
      <Group>
        <Rect x={110} y={50} width={70} height={60} color="#fab005">
          <BoxShadow dx={-2} dy={2} blur={6} color="rgba(0,0,0,0.3)" />
        </Rect>
      </Group>
      {/* 带阴影的圆角矩形 */}
      <Group>
        <RoundedRect x={60} y={130} width={80} height={50} r={12} color="#20c997">
          <BoxShadow dx={0} dy={4} blur={10} color="rgba(0,0,0,0.25)" />
        </RoundedRect>
      </Group>
    </Canvas>
  );
}

/** 动画演示 - 脉动的圆形 */
function AnimationDemo(): React.JSX.Element {
  const [pulse, setPulse] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 60;
      setPulse(Math.sin((frame / 60) * Math.PI * 2) * 0.3 + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const centerX = 100;
  const centerY = 100;
  const baseRadius = 40;

  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 外圈 */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={baseRadius * pulse * 1.3}
        color="#e3f2fd"
      />
      {/* 中圈 */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={baseRadius * pulse}
        color="#90caf9"
      />
      {/* 内圈 */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={baseRadius * pulse * 0.6}
        color="#1976d2"
      />
      {/* 中心点 */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={8}
        color="#0d47a1"
      />
      {/* 旋转的线条 */}
      <Group>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = centerX + Math.cos(rad) * 20;
          const y1 = centerY + Math.sin(rad) * 20;
          const x2 = centerX + Math.cos(rad) * (baseRadius * pulse * 1.4);
          const y2 = centerY + Math.sin(rad) * (baseRadius * pulse * 1.4);
          return (
            <Line
              key={i}
              p1={{ x: x1, y: y1 }}
              p2={{ x: x2, y: y2 }}
              color={`hsl(${angle + pulse * 30}, 80%, 60%)`}
              strokeStyle={{ width: 2 }}
            />
          );
        })}
      </Group>
    </Canvas>
  );
}

/** 噪点纹理演示 */
function NoiseDemo(): React.JSX.Element {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 背景渐变 */}
      <Rect x={0} y={0} width={200} height={200} color="#1a1a2e" />
      {/* 纹理叠加层 */}
      <Rect x={0} y={0} width={200} height={200}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 200, y: 200 }}
          colors={[
            'rgba(255,107,107,0.3)',
            'rgba(78,205,196,0.3)',
            'rgba(102,126,234,0.3)',
            'rgba(118,75,162,0.3)',
          ]}
          positions={[0, 0.33, 0.66, 1]}
        />
      </Rect>
      {/* 装饰圆形 */}
      <Circle cx={50} cy={50} r={30} color="#ff6b6b" opacity={0.8} />
      <Circle cx={160} cy={80} r={45} color="#4ecdc4" opacity={0.7} />
      <Circle cx={100} cy={150} r={35} color="#667eea" opacity={0.6} />
      {/* 发光效果 */}
      <Group>
        <Circle cx={50} cy={50} r={40} color="rgba(255,107,107,0.3)" />
        <Circle cx={160} cy={80} r={60} color="rgba(78,205,196,0.3)" />
        <Circle cx={100} cy={150} r={50} color="rgba(102,126,234,0.3)" />
      </Group>
    </Canvas>
  );
}

/** 高级组合演示 - 数据可视化卡片 */
function AdvancedDemo(): React.JSX.Element {
  const cardWidth = 180;
  const cardHeight = 140;
  const padding = 10;

  // 模拟数据
  const data = [
    { label: '一月', value: 65, color: '#4ecdc4' },
    { label: '二月', value: 80, color: '#45b7d1' },
    { label: '三月', value: 45, color: '#96ceb4' },
    { label: '四月', value: 90, color: '#ff6b6b' },
  ];

  const maxValue = 100;
  const barWidth = (cardWidth - padding * 2 - (data.length - 1) * 8) / data.length;
  const chartHeight = 70;

  return (
    <Canvas style={{ width: cardWidth, height: cardHeight }}>
      {/* 卡片背景 */}
      <RoundedRect
        x={0}
        y={0}
        width={cardWidth}
        height={cardHeight}
        r={12}
        color="#ffffff"
      >
        <BoxShadow dx={0} dy={2} blur={8} color="rgba(0,0,0,0.1)" />
      </RoundedRect>

      {/* 标题区域 */}
      <Rect x={padding} y={padding} width={60} height={6} color="#e0e0e0" />
      <Rect x={padding} y={padding + 12} width={40} height={4} color="#f0f0f0" />

      {/* 柱状图 */}
      <Group>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = padding + index * (barWidth + 8);
          const y = cardHeight - padding - barHeight - 20;

          return (
            <Group key={index}>
              {/* 柱子 */}
              <RoundedRect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                r={4}
              >
                <LinearGradient
                  start={{ x: x, y: y }}
                  end={{ x: x, y: y + barHeight }}
                  colors={[item.color, `${item.color}88`]}
                />
              </RoundedRect>
              {/* 顶部圆点 */}
              <Circle
                cx={x + barWidth / 2}
                cy={y - 4}
                r={3}
                color={item.color}
              />
            </Group>
          );
        })}
      </Group>

      {/* 底部标签 */}
      <Rect x={padding} y={cardHeight - padding - 8} width={cardWidth - padding * 2} height={4} color="#f5f5f5" />
    </Canvas>
  );
}

/** 扫描渐变演示 - 彩虹色轮效果 */
function SweepGradientDemo(): React.JSX.Element {
  const centerX = 100;
  const centerY = 100;

  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 外圈光环 */}
      <Circle cx={centerX} cy={centerY} r={80} color="#1a1a2e">
        <SweepGradient
          c={{ x: centerX, y: centerY }}
          colors={['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff', '#ff0000']}
        />
      </Circle>
      {/* 内圈 */}
      <Circle cx={centerX} cy={centerY} r={55} color="#1a1a2e">
        <SweepGradient
          c={{ x: centerX, y: centerY }}
          colors={['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff6b6b']}
        />
      </Circle>
      {/* 中心深色圆 */}
      <Circle cx={centerX} cy={centerY} r={30} color="#16213e" />
      {/* 中心亮点 */}
      <Circle cx={centerX} cy={centerY} r={8} color="#fff" opacity={0.9} />
    </Canvas>
  );
}

/** 模糊效果演示 - 玻璃态效果 */
function BlurEffectDemo(): React.JSX.Element {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* 背景渐变 */}
      <Rect x={0} y={0} width={200} height={200}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 200, y: 200 }}
          colors={['#667eea', '#764ba2']}
        />
      </Rect>

      {/* 模糊层1 - 圆形光斑 */}
      <Circle cx={40} cy={50} r={35}>
        <Blur blur={20} />
      </Circle>
      <Circle cx={160} cy={150} r={45}>
        <Blur blur={25} />
      </Circle>

      {/* 模糊层2 - 矩形光斑 */}
      <RoundedRect x={100} y={20} width={60} height={60} r={12}>
        <Blur blur={15} />
      </RoundedRect>

      {/* 前景内容 */}
      <Group>
        {/* 玻璃态卡片 */}
        <RoundedRect x={30} y={70} width={140} height={100} r={16} color="rgba(255,255,255,0.15)">
          <Blur blur={10} />
        </RoundedRect>
        {/* 卡片边框 */}
        <RoundedRect x={30} y={70} width={140} height={100} r={16} color="rgba(255,255,255,0.3)" stroke={{ width: 1 }} />
      </Group>

      {/* 卡片内容 */}
      <Rect x={50} y={90} width={50} height={8} stroke={{ width: 4 }} color="rgba(255,255,255,0.8)" />
      <Rect x={50} y={105} width={80} height={6} stroke={{ width: 3 }} color="rgba(255,255,255,0.5)" />
      <Rect x={50} y={120} width={100} height={6} stroke={{ width: 3 }} color="rgba(255,255,255,0.5)" />
      <Rect x={50} y={135} width={60} height={6} stroke={{ width: 3 }} color="rgba(255,255,255,0.5)" />

      {/* 装饰圆点 */}
      <Circle cx={150} cy={95} r={12} color="rgba(255,255,255,0.9)" />
    
    </Canvas>
  );
}

/** 粒子系统演示 */
function ParticlesDemo(): React.JSX.Element {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 360);
    }, 33);
    return () => clearInterval(interval);
  }, []);

  const { width, height } = { width: 200, height: 200 };
  const centerX = width / 2;
  const centerY = height / 2;

  // 生成粒子数据
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const baseAngle = (i / 50) * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      const size = 2 + Math.random() * 4;
      const hue = (i * 7 + frame) % 360;
      return { baseAngle, speed, size, hue };
    });
  }, [frame]);

  return (
    <Canvas style={{ width, height }}>
      {/* 背景 */}
      <Rect x={0} y={0} width={width} height={height} color="#0f0f23" />

      {/* 粒子群 */}
      {particles.map((p, i) => {
        const angle = p.baseAngle + (frame * p.speed * Math.PI) / 180;
        const radius = 20 + Math.sin(frame * 0.02 + i) * 15;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const opacity = 0.4 + Math.sin(frame * 0.05 + i * 0.2) * 0.3;

        return (
          <Group key={i}>
            <Circle
              cx={x}
              cy={y}
              r={p.size}
              color={`hsla(${p.hue}, 80%, 60%, ${opacity})`}
            />
            {/* 粒子光晕 */}
            <Circle
              cx={x}
              cy={y}
              r={p.size * 2}
              color={`hsla(${p.hue}, 90%, 70%, ${opacity * 0.3})`}
            />
          </Group>
        );
      })}

      {/* 中心星芒 */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = ((angle + frame * 0.5) * Math.PI) / 180;
        const innerR = 15;
        const outerR = 35 + Math.sin(frame * 0.1 + i) * 5;
        const x1 = centerX + Math.cos(rad) * innerR;
        const y1 = centerY + Math.sin(rad) * innerR;
        const x2 = centerX + Math.cos(rad) * outerR;
        const y2 = centerY + Math.sin(rad) * outerR;

        return (
          <Line
            key={i}
            p1={{ x: x1, y: y1 }}
            p2={{ x: x2, y: y2 }}
            color={`hsla(${(i * 45 + frame) % 360}, 80%, 70%, 0.6)`}
            strokeStyle={{ width: 2 }}
          />
        );
      })}

      {/* 中心圆 */}
      <Circle cx={centerX} cy={centerY} r={12} color="#fff" opacity={0.9} />
      <Circle cx={centerX} cy={centerY} r={8} color="#0f0f23" />
    </Canvas>
  );
}

/** 贝塞尔曲线演示 - 3D 曲面效果 */
function BezierDemo(): React.JSX.Element {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const { width, height } = { width: 200, height: 200 };
  const centerX = width / 2;
  const centerY = height / 2;

  // 动态旋转角度
  const rotation = (frame * Math.PI) / 180;

  // 贝塞尔曲面控制点 (4x4 网格，16个点)
  const patchData = useMemo(() => {
    const scale = 1 + Math.sin(frame * 0.03) * 0.2;
    const rotOffset = Math.sin(rotation) * 10;
    return {
      c00: { x: centerX - 50 * scale + rotOffset, y: centerY - 50 },
      c01: { x: centerX - 20 * scale, y: centerY - 50 * scale },
      c02: { x: centerX + 20 * scale, y: centerY - 50 * scale },
      c03: { x: centerX + 50 * scale - rotOffset, y: centerY - 50 },
      c10: { x: centerX - 60 * scale, y: centerY - 15 },
      c11: { x: centerX, y: centerY - 35 },
      c12: { x: centerX, y: centerY - 25 },
      c13: { x: centerX + 60 * scale, y: centerY - 15 },
      c20: { x: centerX - 60 * scale, y: centerY + 15 },
      c21: { x: centerX, y: centerY - 5 },
      c22: { x: centerX, y: centerY + 15 },
      c23: { x: centerX + 60 * scale, y: centerY + 15 },
      c30: { x: centerX - 50 * scale - rotOffset, y: centerY + 50 },
      c31: { x: centerX, y: centerY + 50 * scale },
      c32: { x: centerX, y: centerY + 50 * scale },
      c33: { x: centerX + 50 * scale + rotOffset, y: centerY + 50 },
    };
  }, [frame, rotation, centerX, centerY]);

  // 颜色随角度变化
  const hue = frame % 360;

  // 构建 4x4 Patch 数据：4 个 CubicBezierHandle，每个包含 pos/c1/c2 三个点
  const patchHandles = useMemo<[CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle]>(() => [
    { pos: patchData.c00, c1: { x: patchData.c00.x - 5, y: patchData.c00.y - 5 }, c2: { x: patchData.c00.x + 5, y: patchData.c00.y + 5 } },
    { pos: patchData.c01, c1: { x: patchData.c01.x - 5, y: patchData.c01.y - 5 }, c2: { x: patchData.c01.x + 5, y: patchData.c01.y + 5 } },
    { pos: patchData.c02, c1: { x: patchData.c02.x - 5, y: patchData.c02.y - 5 }, c2: { x: patchData.c02.x + 5, y: patchData.c02.y + 5 } },
    { pos: patchData.c03, c1: { x: patchData.c03.x - 5, y: patchData.c03.y - 5 }, c2: { x: patchData.c03.x + 5, y: patchData.c03.y + 5 } },
  ], [patchData]);

  // 主曲面层（稍微上移）
  const mainPatchHandles = useMemo<[CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle]>(() => [
    { pos: { x: patchData.c00.x, y: patchData.c00.y - 5 }, c1: { x: patchData.c00.x - 5, y: patchData.c00.y - 10 }, c2: { x: patchData.c00.x + 5, y: patchData.c00.y }, },
    { pos: { x: patchData.c01.x, y: patchData.c01.y - 5 }, c1: { x: patchData.c01.x - 5, y: patchData.c01.y - 10 }, c2: { x: patchData.c01.x + 5, y: patchData.c01.y }, },
    { pos: { x: patchData.c02.x, y: patchData.c02.y - 5 }, c1: { x: patchData.c02.x - 5, y: patchData.c02.y - 10 }, c2: { x: patchData.c02.x + 5, y: patchData.c02.y }, },
    { pos: { x: patchData.c03.x, y: patchData.c03.y - 5 }, c1: { x: patchData.c03.x - 5, y: patchData.c03.y - 10 }, c2: { x: patchData.c03.x + 5, y: patchData.c03.y }, },
  ], [patchData]);

  // 控制点中心位置（用于显示控制点）
  const controlPoints = [patchData.c00, patchData.c01, patchData.c02, patchData.c03];

  return (
    <Canvas style={{ width, height }}>
      {/* 背景 */}
      <Rect x={0} y={0} width={width} height={height} color="#1a1a2e" />

      {/* 网格背景 */}
      {Array.from({ length: 10 }, (_, i) => (
        <React.Fragment key={`grid-${i}`}>
          <Line
            p1={{ x: i * 20, y: 0 }}
            p2={{ x: i * 20, y: height }}
            color="rgba(255,255,255,0.05)"
            strokeStyle={{ width: 1 }}
          />
          <Line
            p1={{ x: 0, y: i * 20 }}
            p2={{ x: width, y: i * 20 }}
            color="rgba(255,255,255,0.05)"
            strokeStyle={{ width: 1 }}
          />
        </React.Fragment>
      ))}

      {/* 贝塞尔曲面层1 - 底部阴影 */}
      <Patch
        patch={patchHandles}
        color={`hsla(${hue}, 60%, 30%, 0.5)`}
      />

      {/* 贝塞尔曲面层2 - 主曲面（带颜色） */}
      <Patch
        patch={mainPatchHandles}
        color={`hsla(${hue}, 70%, 55%, 0.9)`}
      />

      {/* 控制点 */}
      {controlPoints.map((p, i) => (
        <Group key={`point-${i}`}>
          <Circle cx={p.x} cy={p.y} r={5} color={`hsla(${hue}, 80%, 60%, 0.8)`} />
          <Circle cx={p.x} cy={p.y} r={2} color="#fff" />
        </Group>
      ))}

      {/* 控制线 */}
      <Line p1={patchData.c00} p2={patchData.c01} strokeStyle={{ color: 'rgba(255,255,255,0.3)', width: 1 }} />
      <Line p1={patchData.c01} p2={patchData.c02} strokeStyle={{ color: 'rgba(255,255,255,0.3)', width: 1 }} />
      <Line p1={patchData.c02} p2={patchData.c03} strokeStyle={{ color: 'rgba(255,255,255,0.3)', width: 1 }} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  scrollRow: {
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
  },
  buttonActive: {
    backgroundColor: '#1456f0',
  },
  buttonText: {
    fontSize: 12,
    color: '#495057',
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  canvasContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
});
