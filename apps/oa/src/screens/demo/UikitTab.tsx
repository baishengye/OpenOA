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
  useTheme,
} from '@itc/uikit';

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
