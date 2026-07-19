import React, { useCallback, useState } from 'react';
import { Text, View, StyleSheet, Pressable, Switch, Image } from 'react-native';
import { FlashList, MessageList } from '@itc/flash-list';
import { describe, shared } from './shared';
import type { RunFn } from './shared';
import { useTranslation } from '@itc/i18n';

type ItemType = 'normal' | 'special' | 'highlight' | 'ad';
type MsgType = 'text' | 'image' | 'voice' | 'file' | 'card' | 'system' | 'recall' | 'forward';

interface DemoItem {
  id: string;
  title: string;
  subtitle: string;
  type: ItemType;
  badge?: string;
  avatar?: string;
  timestamp?: number;
  views?: number;
  comments?: number;
}

interface ChatMessage {
  id: string;
  type: MsgType;
  content: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'read';
  duration?: number; // 语音时长(秒)
  fileName?: string;
  fileSize?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  forwardCount?: number;
}

// 生成 200 条复杂测试数据
const generateDemoData = (t: (key: string) => string): DemoItem[] => {
  const badges = [t('flashlist.badge.new'), t('flashlist.badge.hot'), t('flashlist.badge.recommend'), t('flashlist.badge.top'), t('flashlist.badge.recommend'), '', ''];
  const types: ItemType[] = ['normal', 'normal', 'normal', 'special', 'highlight', 'ad'];
  const users = ['用户A', '用户B', '用户C', '用户D', '用户E', '用户F'];
  const data: DemoItem[] = [];

  for (let i = 1; i <= 200; i++) {
    const badge = i % 7 === 0 ? badges[Math.floor(Math.random() * badges.length)] : '';
    const typeIdx = i % types.length;
    const type = types[typeIdx]!;
    const userIdx = i % users.length;
    const avatarIdx = i % 70;
    data.push({
      id: String(i),
      title: `${t('flashlist.listItem')} ${i} - ${users[userIdx]!}`,
      subtitle: `这是第 ${i} 条数据的详细描述内容，可能包含较长文本、需要换行显示的信息，以及一些附加的元数据说明。${i % 5 === 0 ? '这是一段特别长的描述，用于测试列表项的高度自适应能力和布局表现。' : ''}`,
      type,
      badge: badge || undefined,
      avatar: `https://i.pravatar.cc/40?img=${avatarIdx}`,
      timestamp: Date.now() - i * 3600000 + Math.random() * 3600000,
      views: Math.floor(Math.random() * 10000),
      comments: Math.floor(Math.random() * 500),
    });
  }
  return data;
};

// 生成 100 条复杂消息数据
const generateChatData = (): ChatMessage[] => {
  const users = [
    { id: 'user1', name: '张三', avatar: 'https://i.pravatar.cc/40?img=1' },
    { id: 'user2', name: '李四', avatar: 'https://i.pravatar.cc/40?img=2' },
    { id: 'user3', name: '王五', avatar: 'https://i.pravatar.cc/40?img=3' },
    { id: 'user4', name: '赵六', avatar: 'https://i.pravatar.cc/40?img=4' },
  ];

  const messages: ChatMessage[] = [];
  const baseTime = Date.now();

  const contents: { type: MsgType; content: string; extra?: Partial<ChatMessage> }[] = [
    { type: 'text', content: '大家好，这是一条普通文本消息，用于测试基本的消息展示效果。' },
    { type: 'text', content: '收到！我这边已经处理完成了。' },
    { type: 'text', content: '好的，收到通知。' },
    { type: 'text', content: '请问有什么可以帮助您的吗？我们提供7x24小时的客服支持服务，欢迎随时咨询！' },
    { type: 'image', content: '[图片] IMG_20240115_143022.jpg', extra: { fileName: 'IMG_20240115_143022.jpg', fileSize: '2.3 MB' } },
    { type: 'image', content: '[图片] screenshot_2024.png', extra: { fileName: 'screenshot_2024.png', fileSize: '1.8 MB' } },
    { type: 'voice', content: '[语音消息]', extra: { duration: 5 } },
    { type: 'voice', content: '[语音消息]', extra: { duration: 15 } },
    { type: 'voice', content: '[语音消息]', extra: { duration: 32 } },
    { type: 'voice', content: '[语音消息]', extra: { duration: 58 } },
    { type: 'file', content: '[文件] 项目需求文档.pdf', extra: { fileName: '项目需求文档.pdf', fileSize: '3.2 MB' } },
    { type: 'file', content: '[文件] 会议纪要_2024.01.docx', extra: { fileName: '会议纪要_2024.01.docx', fileSize: '156 KB' } },
    { type: 'file', content: '[文件] 数据分析报告.xlsx', extra: { fileName: '数据分析报告.xlsx', fileSize: '890 KB' } },
    { type: 'card', content: '[名片] 张三 - 产品经理', extra: { cardTitle: '张三', cardSubtitle: '产品经理 | 某某科技有限公司' } },
    { type: 'card', content: '[名片] 李四 - 技术总监', extra: { cardTitle: '李四', cardSubtitle: '技术总监 | 某某科技有限公司' } },
    { type: 'system', content: '"张三" 撤回了一条消息' },
    { type: 'system', content: '您已撤回一条消息' },
    { type: 'system', content: '李四 邀请 王五 加入群聊' },
    { type: 'system', content: '张三 修改群名为 "产品技术交流群"' },
    { type: 'system', content: '王五 被管理员移出群聊' },
    { type: 'forward', content: '[转发] 3 条消息', extra: { forwardCount: 3 } },
    { type: 'forward', content: '[转发] 5 条消息', extra: { forwardCount: 5 } },
    { type: 'text', content: '这是一段比较长的文本内容，用于测试消息气泡的宽度自适应能力和换行显示效果。当消息内容超过一定长度时，应该能够自动换行显示。' },
    { type: 'text', content: '🎉 恭喜！您已完成任务，获得 100 积分奖励！' },
    { type: 'text', content: '📎 请查收附件，有问题随时联系。' },
    { type: 'text', content: '链接: https://example.com/very/long/url/path/to/resource' },
  ];

  for (let i = 0; i < 100; i++) {
    const userIdx = i % users.length;
    const user = users[userIdx]!;
    const msgIdx = i % contents.length;
    const msgTemplate = contents[msgIdx]!;
    messages.push({
      id: `msg_${i + 1}`,
      type: msgTemplate.type,
      content: msgTemplate.content,
      senderId: msgTemplate.type === 'system' || msgTemplate.type === 'recall' ? 'system' : user.id,
      senderName: msgTemplate.type === 'system' || msgTemplate.type === 'recall' ? '系统消息' : user.name,
      avatar: user.avatar,
      timestamp: baseTime - (100 - i) * 60000 + Math.random() * 30000,
      status: i < 95 ? 'read' : i < 98 ? 'sent' : 'sending',
      ...msgTemplate.extra,
    });
  }

  return messages;
};

const CHAT_DATA: ChatMessage[] = generateChatData();

interface Props {
  run: RunFn;
  append: (line: string) => void;
  busy: boolean;
}

function formatTime(timestamp: number, t: (key: string) => string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffDays === 1) {
    return t('flashlist.yesterday');
  } else if (diffDays < 7) {
    const weekdays = [
      t('flashlist.sunday'),
      t('flashlist.monday'),
      t('flashlist.tuesday'),
      t('flashlist.wednesday'),
      t('flashlist.thursday'),
      t('flashlist.friday'),
      t('flashlist.saturday'),
    ];
    return weekdays[date.getDay()] ?? '';
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

function formatViews(views: number): string {
  if (views >= 10000) {
    return `${(views / 10000).toFixed(1)}万`;
  }
  return views.toString();
}

export function FlashListTab({ run, append }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [useMessageList, setUseMessageList] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  // 使用 useState 延迟生成数据，以便获取翻译函数
  const [demoData] = useState(() => generateDemoData(t));

  const handleFlashListPress = useCallback(
    (item: DemoItem) => {
      append(`${t('flashlist.clicked')}: ${item.title}`);
    },
    [append, t],
  );

  const handleMessagePress = useCallback(
    (msg: ChatMessage) => {
      append(`${t('flashlist.message')}: ${msg.content.substring(0, 15)}...`);
    },
    [append, t],
  );

  const handleEndReached = useCallback(() => {
    append(`${t('flashlist.endReached')}`);
  }, [append, t]);

  const renderDemoItem = useCallback(
    ({ item }: { item: DemoItem }) => {
      const showItemBadge = showBadge && item.badge;
      const isSpecial = item.type === 'special';
      const isHighlight = item.type === 'highlight';
      const isAd = item.type === 'ad';

      return (
        <Pressable
          style={[
            styles.listItem,
            isSpecial && styles.listItemSpecial,
            isHighlight && styles.listItemHighlight,
            isAd && styles.listItemAd,
          ]}
          onPress={() => handleFlashListPress(item)}
        >
          {/* 头像 */}
          <View style={[styles.avatar, isAd && styles.avatarAd]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{item.title[0]}</Text>
            )}
          </View>

          {/* 内容区 */}
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemTitle, isAd && styles.itemTitleAd]} numberOfLines={1}>
                {item.title}
              </Text>
              {item.timestamp && (
                <Text style={styles.itemTime}>{formatTime(item.timestamp, t)}</Text>
              )}
            </View>
            <Text style={[styles.itemSubtitle, isAd && styles.itemSubtitleAd]} numberOfLines={2}>
              {item.subtitle || ''}
            </Text>
            <View style={styles.itemFooter}>
              {showItemBadge && item.badge && (
                <View style={[styles.badge, isSpecial && styles.badgeSpecial]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <View style={styles.itemStats}>
                <Text style={styles.statText}>👁 {formatViews(item.views || 0)}</Text>
                <Text style={styles.statText}>💬 {item.comments || 0}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [handleFlashListPress, showBadge, t],
  );

  const renderChatItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isMe = item.senderId === 'user1';
      const isSystem = item.type === 'system' || item.type === 'recall';

      // 系统消息居中显示
      if (isSystem) {
        return (
          <Pressable style={styles.systemItem} onPress={() => handleMessagePress(item)}>
            <Text style={styles.systemText}>{item.content}</Text>
          </Pressable>
        );
      }

      return (
        <Pressable
          style={[
            styles.chatItem,
            isMe ? styles.chatItemRight : styles.chatItemLeft,
          ]}
          onPress={() => handleMessagePress(item)}
        >
          {/* 头像（非自己） */}
          {!isMe && item.avatar && (
            <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
          )}
          {!isMe && !item.avatar && (
            <View style={[styles.chatAvatar, styles.chatAvatarPlaceholder]}>
              <Text style={styles.chatAvatarText}>{item.senderName[0]}</Text>
            </View>
          )}

          {/* 消息内容区 */}
          <View style={styles.chatContentArea}>
            {/* 发送者名称（非自己） */}
            {!isMe && <Text style={styles.chatSender}>{item.senderName}</Text>}

            {/* 消息气泡 */}
            {item.type === 'text' && (
              <View style={[styles.chatBubble, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                <Text style={[styles.chatContent, isMe && styles.chatContentRight]}>{item.content}</Text>
              </View>
            )}

            {item.type === 'image' && (
              <View style={[styles.chatBubble, styles.chatBubbleImage, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>🖼️</Text>
                  <Text style={styles.imageName}>{item.fileName}</Text>
                  <Text style={styles.imageSize}>{item.fileSize}</Text>
                </View>
              </View>
            )}

            {item.type === 'voice' && (
              <View style={[styles.chatBubble, styles.chatBubbleVoice, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                <Text style={styles.voiceIcon}>🎤</Text>
                <Text style={styles.voiceDuration}>{item.duration}"</Text>
              </View>
            )}

            {item.type === 'file' && (
              <View style={[styles.chatBubble, styles.chatBubbleFile, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                <Text style={styles.fileIcon}>📎</Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
                  <Text style={styles.fileSize}>{item.fileSize}</Text>
                </View>
              </View>
            )}

            {item.type === 'card' && (
              <View style={[styles.chatBubble, styles.chatBubbleCard, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                <View style={styles.cardContent}>
                  <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarText}>{item.cardTitle?.[0] || '?'}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.cardTitle}</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>{item.cardSubtitle}</Text>
                  </View>
                </View>
              </View>
            )}

            {item.type === 'forward' && (
              <View style={[styles.chatBubble, styles.chatBubbleForward, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                <Text style={styles.forwardIcon}>🔄</Text>
                <Text style={styles.forwardText}>{t('flashlist.forwardCount').replace('{{count}}', String(item.forwardCount))}</Text>
              </View>
            )}

            {/* 时间戳和状态 */}
            <View style={[styles.chatFooter, isMe && styles.chatFooterRight]}>
              <Text style={styles.chatTime}>{formatTime(item.timestamp, t)}</Text>
              {isMe && (
                <Text style={styles.chatStatus}>
                  {item.status === 'read' ? '✓✓' : item.status === 'sent' ? '✓' : '⏳'}
                </Text>
              )}
            </View>
          </View>

          {/* 自己的头像 */}
          {isMe && item.avatar && (
            <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
          )}
          {isMe && !item.avatar && (
            <View style={[styles.chatAvatar, styles.chatAvatarPlaceholder]}>
              <Text style={styles.chatAvatarText}>{item.senderName[0]}</Text>
            </View>
          )}
        </Pressable>
      );
    },
    [handleMessagePress, t],
  );

  const keyExtractor = useCallback((item: DemoItem) => item.id, []);
  const msgKeyExtractor = useCallback((item: ChatMessage) => item.id, []);
  const getItemType = useCallback((item: DemoItem) => item.type, []);
  const getMsgType = useCallback((item: ChatMessage) => item.type, []);

  return (
    <View style={styles.container}>
      {/* 控制区 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('flashlist.title')}</Text>

        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>{t('flashlist.useMessageList')}</Text>
          <Switch
            value={useMessageList}
            onValueChange={setUseMessageList}
            trackColor={{ false: '#e0e0e0', true: '#1456f0' }}
          />
        </View>

        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>{t('flashlist.showBadge')}</Text>
          <Switch
            value={showBadge}
            onValueChange={setShowBadge}
            trackColor={{ false: '#e0e0e0', true: '#1456f0' }}
          />
        </View>

        <Text style={styles.hint}>
          {useMessageList
            ? t('flashlist.messageListHint')
            : t('flashlist.flashListHint').replace('{{count}}', String(demoData.length))}
        </Text>
      </View>

      {/* 列表区域 */}
      <View style={styles.listContainer}>
        {useMessageList ? (
          <MessageList<ChatMessage>
            data={CHAT_DATA}
            renderItem={renderChatItem}
            keyExtractor={msgKeyExtractor}
            getItemType={getMsgType}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <FlashList<DemoItem>
            data={demoData}
            renderItem={renderDemoItem}
            keyExtractor={keyExtractor}
            getItemType={getItemType}
            estimatedItemSize={100}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>

      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('flashlist.description')}</Text>
        <Text style={styles.infoText}>
          {t('flashlist.itemCount')}: {useMessageList ? CHAT_DATA.length : demoData.length}
        </Text>
        <Text style={styles.infoText}>
          {t('flashlist.clickToViewLog')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  controlLabel: {
    fontSize: 14,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  listContent: {
    padding: 8,
  },

  // ========== DemoList 样式 ==========
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItemSpecial: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  listItemHighlight: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  listItemAd: {
    backgroundColor: '#f3e5f5',
    borderLeftWidth: 3,
    borderLeftColor: '#9c27b0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  avatarAd: {
    backgroundColor: '#9c27b0',
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2329',
    marginRight: 8,
  },
  itemTitleAd: {
    color: '#7b1fa2',
  },
  itemTime: {
    fontSize: 11,
    color: '#999',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#646a73',
    marginTop: 4,
    lineHeight: 18,
  },
  itemSubtitleAd: {
    color: '#7b1fa2',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  badge: {
    backgroundColor: '#1456f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSpecial: {
    backgroundColor: '#ffc107',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  itemStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },

  // ========== Chat 样式 ==========
  systemItem: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  chatItem: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  chatItemLeft: {
    alignSelf: 'flex-start',
  },
  chatItemRight: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  chatAvatarPlaceholder: {
    backgroundColor: '#1456f0',
  },
  chatAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  chatContentArea: {
    maxWidth: '70%',
  },
  chatSender: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
    marginLeft: 4,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 14,
    maxWidth: '100%',
  },
  chatBubbleLeft: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  chatBubbleRight: {
    backgroundColor: '#1456f0',
  },
  chatBubbleImage: {
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  chatBubbleVoice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minWidth: 80,
  },
  chatBubbleFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    minWidth: 160,
  },
  chatBubbleCard: {
    padding: 10,
    minWidth: 180,
  },
  chatBubbleForward: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minWidth: 120,
  },
  chatContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  chatContentRight: {
    color: '#fff',
  },
  imagePlaceholder: {
    width: 120,
    height: 90,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 28,
  },
  imageName: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  imageSize: {
    fontSize: 10,
    color: '#999',
  },
  voiceIcon: {
    fontSize: 16,
  },
  voiceDuration: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 8,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1456f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  forwardIcon: {
    fontSize: 16,
  },
  forwardText: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 6,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  chatFooterRight: {
    justifyContent: 'flex-end',
  },
  chatTime: {
    fontSize: 10,
    color: '#999',
  },
  chatStatus: {
    fontSize: 10,
    color: '#1456f0',
    marginLeft: 4,
  },

  // ========== 底部说明 ==========
  infoText: {
    fontSize: 13,
    color: '#646a73',
    marginTop: 4,
  },
});
