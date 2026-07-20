import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Switch,
  Checkbox,
  RadioGroup,
  Card,
  Badge,
  Avatar,
  Spinner,
  Divider,
  Dialog,
  List,
  Toast,
  useTheme,
} from '@itc/uikit';
import type { ToastType, ToastTypeDefaults } from '@itc/uikit';

interface Row {
  id: string;
  title: string;
}
const page = (start: number): Row[] =>
  Array.from({ length: 10 }, (_, i) => ({ id: String(start + i), title: `列表项 #${start + i}` }));

/**
 * 展示 @itc/uikit 全部控件 + 主题切换 + 列表（下拉刷新/上拉加载/没有更多）。
 * 整个 tab 以 List 为根（控件放 List header），避免 FlatList 再嵌 DemoScreen 的 ScrollView。
 */
export function UikitTab() {
  const { mode, toggle } = useTheme();
  const [text, setText] = useState('');
  const [pwd, setPwd] = useState('');
  const [sw, setSw] = useState(false);
  const [cb, setCb] = useState(true);
  const [radio, setRadio] = useState('a');
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState<Row[]>(page(1));
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRows(page(1));
      setHasMore(true);
      setRefreshing(false);
    }, 800);
  }, []);

  const onLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setRows((r) => {
        const next = [...r, ...page(r.length + 1)];
        if (next.length >= 30) setHasMore(false);
        return next;
      });
      setLoadingMore(false);
    }, 800);
  }, []);

  const header = (
    <YStack gap={14} padding={16}>
      <Card>
        <YStack gap={8}>
          <Text variant="h3">主题（当前：{mode === 'light' ? '浅色' : '深色'}）</Text>
          <Button onPress={toggle}>切换主题</Button>
        </YStack>
      </Card>

      <Card>
        <YStack gap={6}>
          <Text variant="h1">Text H1</Text>
          <Text variant="h2">Text H2</Text>
          <Text variant="h3">Text H3</Text>
          <Text variant="body">正文 body</Text>
          <Text variant="caption">说明 caption</Text>
        </YStack>
      </Card>

      <Card>
        <YStack gap={8}>
          <Text variant="h3">Button</Text>
          <XStack gap={8}>
            <Button>Solid</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </XStack>
          <XStack gap={8} align="center">
            <Button size="sm">小</Button>
            <Button size="md">中</Button>
            <Button size="lg">大</Button>
          </XStack>
          <Button loading>加载中</Button>
          <Button disabled>禁用</Button>
        </YStack>
      </Card>

      <Card>
        <YStack gap={8}>
          <Text variant="h3">Input</Text>
          <Input placeholder="请输入文本" value={text} onChangeText={setText} />
          <Input placeholder="密码" value={pwd} onChangeText={setPwd} secureTextEntry />
        </YStack>
      </Card>

      <Card>
        <YStack gap={10}>
          <Text variant="h3">表单</Text>
          <XStack gap={8} align="center">
            <Text>开关</Text>
            <Switch checked={sw} onChange={setSw} />
          </XStack>
          <Checkbox checked={cb} onChange={setCb} label="复选框" />
          <RadioGroup
            value={radio}
            onChange={setRadio}
            options={[
              { label: '选项 A', value: 'a' },
              { label: '选项 B', value: 'b' },
              { label: '选项 C', value: 'c' },
            ]}
          />
        </YStack>
      </Card>

      <Card>
        <YStack gap={10}>
          <Text variant="h3">展示</Text>
          <XStack gap={8} align="center">
            <Badge tone="info">信息</Badge>
            <Badge tone="success">成功</Badge>
            <Badge tone="warning">警告</Badge>
            <Badge tone="danger">危险</Badge>
          </XStack>
          <XStack gap={12} align="center">
            <Avatar fallback="张" />
            <Avatar src="https://i.pravatar.cc/80" />
            <Spinner />
          </XStack>
          <Divider />
          <Text variant="caption">↑ 分割线</Text>
        </YStack>
      </Card>

      <Card>
        <YStack gap={8}>
          <Text variant="h3">反馈</Text>
          <Text variant="caption">基础类型</Text>
          <XStack gap={8}>
            <Button size="sm" onPress={() => Toast.show({ type: 'info', message: '这是一条信息提示' })}>Info</Button>
            <Button size="sm" onPress={() => Toast.show({ type: 'warn', message: '这是一条警告提示' })}>Warn</Button>
            <Button size="sm" onPress={() => Toast.show({ type: 'success', message: '操作成功！' })}>Success</Button>
            <Button size="sm" onPress={() => Toast.show({ type: 'fail', message: '操作失败，请重试' })}>Fail</Button>
          </XStack>
          <Text variant="caption">自定义图标</Text>
          <XStack gap={8}>
            <Button size="sm" onPress={() => Toast.show({ type: 'info', message: '自定义图标', icon: '🔔' })}>🔔</Button>
            <Button size="sm" onPress={() => Toast.show({ type: 'success', message: '星星', icon: '⭐' })}>⭐</Button>
          </XStack>
          <Text variant="caption">手动关闭（duration=0）</Text>
          <XStack gap={8}>
            <Button size="sm" onPress={() => Toast.show({ type: 'info', message: '点击 Hide 关闭', duration: 0 })}>显示</Button>
            <Button size="sm" onPress={() => Toast.hide()}>Hide All</Button>
          </XStack>
          <Text variant="caption">连续触发（竖直堆叠）</Text>
          <Button size="sm" onPress={() => {
            const types: ToastType[] = ['info', 'warn', 'success', 'fail'];
            types.forEach((type, i) => {
              setTimeout(() => Toast.show({ type, message: `Toast #${i + 1}` }), i * 300);
            });
          }}>连续显示 4 个</Button>
          <Text variant="caption">自定义内容（content）</Text>
          <XStack gap={8}>
            <Button size="sm" onPress={() => Toast.show({
              type: 'success',
              content: (
                <YStack gap={12} padding={4}>
                  <XStack gap={8} align="center">
                    <Text variant="h1">🎉</Text>
                    <YStack gap={2}>
                      <Text variant="body" color="#fff">恭喜完成！</Text>
                      <Text variant="caption" color="rgba(255,255,255,0.8)">任务已全部达成</Text>
                    </YStack>
                  </XStack>
                  <XStack gap={4}>
                    <Badge tone="success">+100</Badge>
                    <Badge tone="success">+20</Badge>
                  </XStack>
                </YStack>
              ),
            })}>任务完成</Button>
            <Button size="sm" onPress={() => Toast.show({
              type: 'info',
              content: (
                <YStack gap={8} padding={4}>
                  <XStack gap={8} align="center">
                    <Avatar fallback="张" />
                    <YStack gap={2}>
                      <Text variant="body" color="#fff">张三</Text>
                      <Text variant="caption" color="rgba(255,255,255,0.8)">邀请你加入群聊</Text>
                    </YStack>
                  </XStack>
                  <XStack gap={8}>
                    <Button size="sm" variant="outline">拒绝</Button>
                    <Button size="sm">同意</Button>
                  </XStack>
                </YStack>
              ),
            })}>邀请卡片</Button>
          </XStack>
          <Text variant="caption">全局默认 content（setDefaultOptions）</Text>
          <XStack gap={8}>
            <Button size="sm" onPress={() => {
              Toast.setDefaultOptions({
                content: (
                  <XStack gap={8} align="center">
                    <Text variant="h2">📢</Text>
                    <Text variant="body" color="#fff">全局默认内容</Text>
                  </XStack>
                ),
              });
              Toast.show({ type: 'info' }); // 不传 content，使用默认
            }}>设置默认</Button>
            <Button size="sm" onPress={() => {
              Toast.resetDefaultOptions();
              Toast.show({ type: 'info', message: '已恢复默认' });
            }}>恢复默认</Button>
          </XStack>
          <Text variant="caption">按类型默认 content（setTypeDefaultOptions）</Text>
          <XStack gap={8}>
            <Button size="sm" onPress={() => {
              const typeDefaults: ToastTypeDefaults = {
                contentInfo: (
                  <XStack gap={8} align="center">
                    <Text variant="h2">ℹ️</Text>
                    <Text variant="body" color="#fff">信息通知</Text>
                  </XStack>
                ),
                contentSuccess: (
                  <XStack gap={8} align="center">
                    <Text variant="h2">🎉</Text>
                    <Text variant="body" color="#fff">操作成功！</Text>
                  </XStack>
                ),
                contentWarn: (
                  <XStack gap={8} align="center">
                    <Text variant="h2">⚠️</Text>
                    <Text variant="body" color="#fff">注意警告</Text>
                  </XStack>
                ),
                contentFail: (
                  <XStack gap={8} align="center">
                    <Text variant="h2">❌</Text>
                    <Text variant="body" color="#fff">操作失败</Text>
                  </XStack>
                ),
              };
              Toast.setTypeDefaultOptions(typeDefaults);
              Toast.show({ type: 'info' });
            }}>设置类型默认</Button>
            <Button size="sm" onPress={() => Toast.show({ type: 'success' })}>Success</Button>
            <Button size="sm" onPress={() => Toast.show({ type: 'warn' })}>Warn</Button>
            <Button size="sm" onPress={() => Toast.show({ type: 'fail' })}>Fail</Button>
          </XStack>
          <Button onPress={() => setOpen(true)}>打开 Dialog</Button>
        </YStack>
      </Card>

      <Text variant="h3">List（下拉刷新 / 上拉加载 / 没有更多）↓</Text>
    </YStack>
  );

  return (
    <>
      <List<Row>
        header={header}
        data={rows}
        keyExtractor={(it) => it.id}
        renderItem={(it) => (
          <View style={styles.row}>
            <Text>{it.title}</Text>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="提示"
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        这是一个对话框示例。
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e6eb',
  },
});
