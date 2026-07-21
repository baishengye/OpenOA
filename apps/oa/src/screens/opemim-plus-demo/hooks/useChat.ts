/**
 * 聊天 Hook
 * 管理聊天消息的加载、发送、操作
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useChatStore, useCurrentMessages, useTypingUsers } from '../stores';
import { useCurrentUserID } from '../stores/authStore';
import {
  getHistoryMessages,
  sendTextMessage,
  sendImageMessage,
  sendAudioMessage,
  sendVideoMessage,
  sendFileMessage,
  sendLocationMessage,
  revokeMessage,
  deleteLocalMessage,
  markConversationAsRead,
  onIMEvent,
} from '../services';
import { MessageType as IMMessageType, SessionType as IMSessionType } from '@itc/rn-client-sdk-plus';
import type { Message, ConversationType } from '../types';

export interface UseChatOptions {
  /** 会话 ID */
  conversationID: string;
  /** 会话类型 */
  conversationType: ConversationType;
  /** 对方用户 ID（单聊） */
  userID?: string;
  /** 群 ID（群聊） */
  groupID?: string;
  /** 是否在挂载时自动加载消息 */
  autoLoad?: boolean;
}

export interface UseChatResult {
  /** 消息列表 */
  messages: Message[];
  /** 正在输入的用户 */
  typingUsers: string[];
  /** 是否加载中 */
  isLoading: boolean;
  /** 是否发送中 */
  isSending: boolean;
  /** 错误信息 */
  error: string | null;
  /** 加载历史消息 */
  loadMore: () => Promise<void>;
  /** 发送文本消息 */
  sendText: (text: string) => Promise<void>;
  /** 发送图片消息 */
  sendImage: (path: string) => Promise<void>;
  /** 发送语音消息 */
  sendAudio: (path: string, duration: number) => Promise<void>;
  /** 发送视频消息 */
  sendVideo: (path: string, videoType: string, duration: number, size: number) => Promise<void>;
  /** 发送文件消息 */
  sendFile: (path: string, fileName: string, fileSize: number) => Promise<void>;
  /** 发送位置消息 */
  sendLocation: (latitude: number, longitude: number, description: string) => Promise<void>;
  /** 撤回消息 */
  revoke: (msgID: string) => Promise<void>;
  /** 删除本地消息 */
  removeMessage: (msgID: string) => Promise<void>;
  /** 标记已读 */
  markRead: () => Promise<void>;
}

/**
 * 聊天 Hook
 */
export function useChat(options: UseChatOptions): UseChatResult {
  const {
    conversationID,
    conversationType,
    userID,
    groupID,
    autoLoad = true,
  } = options;

  const currentUserID = useCurrentUserID();

  const {
    currentMessages,
    typingUsers,
    isLoadingMessages,
    isSendingMessage,
    setCurrentConversation,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    prependMessages,
    setLoadingMessages,
    setSendingMessage,
  } = useChatStore();

  const [error, setError] = useState<string | null>(null);

  // 构建消息发送选项
  const getSendOptions = useCallback(
    () => ({
      senderID: currentUserID || '',
      receiverID: conversationType === 'single' ? userID || '' : '',
      groupID: conversationType === 'group' ? groupID || '' : undefined,
      conversationID: conversationID,
    }),
    [currentUserID, conversationType, userID, groupID, conversationID]
  );

  /** 加载历史消息 */
  const loadMore = useCallback(async () => {
    if (!currentMessages.length) return;

    try {
      setError(null);
      setLoadingMessages(true);

      const oldestMsg = currentMessages[0];
      // getHistoryMessages 内部已处理 10005 错误，返回空列表表示没有更多消息
      const messages = await getHistoryMessages({
        conversationID: conversationID,
        count: 20,
        startClientMsgID: oldestMsg?.clientMsgID,
      });

      prependMessages(conversationID, messages);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载消息失败';
      setError(message);
      console.error('加载消息失败:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationID, currentMessages, prependMessages, setLoadingMessages]);

  /** 发送文本消息 */
  const sendText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const tempID = `temp_${Date.now()}`;
      console.log('[useChat] sendText 开始:', { tempID, text, conversationID, conversationType, currentUserID });

      try {
        setError(null);
        setSendingMessage(true);

        // 创建本地消息（乐观更新）
        const tempMessage: Message = {
          clientMsgID: tempID,
          serverMsgID: '',
          createTime: Date.now(),
          sendTime: Date.now(),
          sessionType: conversationType === 'single' ? IMSessionType.Single : IMSessionType.Group,
          sendID: currentUserID || '',
          senderNickname: '',
          senderFaceUrl: '',
          content: text,
          contentType: IMMessageType.TextMessage,
          status: 'sending',
          isSelf: true,
        };
        addMessage(conversationID, tempMessage);

        // 发送到服务器
        const sent = await sendTextMessage(text, getSendOptions());
        console.log('[useChat] 发送消息成功:', sent.clientMsgID);

        // 更新消息状态
        updateMessage(conversationID, tempID, {
          clientMsgID: sent.clientMsgID,
          serverMsgID: sent.serverMsgID,
          status: 'succeed',
        });
      } catch (err) {
        console.error('[useChat] 发送消息失败:', err);
        const message = err instanceof Error ? err.message : '发送消息失败';
        setError(message);

        // 更新消息状态为失败
        updateMessage(conversationID, tempID, { status: 'failed' });
      } finally {
        setSendingMessage(false);
      }
    },
    [conversationID, currentUserID, getSendOptions, addMessage, updateMessage, setSendingMessage]
  );

  /** 发送图片消息 */
  const sendImage = useCallback(
    async (path: string) => {
      try {
        setSendingMessage(true);
        const sent = await sendImageMessage(path, getSendOptions());
        addMessage(conversationID, { ...sent, isSelf: true, status: 'succeed' });
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送图片失败');
      } finally {
        setSendingMessage(false);
      }
    },
    [conversationID, getSendOptions, addMessage, setSendingMessage]
  );

  /** 发送语音消息 */
  const sendAudio = useCallback(
    async (path: string, duration: number) => {
      try {
        setSendingMessage(true);
        const sent = await sendAudioMessage(path, duration, getSendOptions());
        addMessage(conversationID, { ...sent, isSelf: true, status: 'succeed' });
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送语音失败');
      } finally {
        setSendingMessage(false);
      }
    },
    [conversationID, getSendOptions, addMessage, setSendingMessage]
  );

  /** 发送视频消息 */
  const sendVideo = useCallback(
    async (path: string, videoType: string, duration: number, size: number) => {
      try {
        setSendingMessage(true);
        const sent = await sendVideoMessage(path, videoType, duration, size, getSendOptions());
        addMessage(conversationID, { ...sent, isSelf: true, status: 'succeed' });
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送视频失败');
      } finally {
        setSendingMessage(false);
      }
    },
    [conversationID, getSendOptions, addMessage, setSendingMessage]
  );

  /** 发送文件消息 */
  const sendFile = useCallback(
    async (path: string, fileName: string, fileSize: number) => {
      try {
        setSendingMessage(true);
        const sent = await sendFileMessage(path, fileName, fileSize, getSendOptions());
        addMessage(conversationID, { ...sent, isSelf: true, status: 'succeed' });
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送文件失败');
      } finally {
        setSendingMessage(false);
      }
    },
    [conversationID, getSendOptions, addMessage, setSendingMessage]
  );

  /** 发送位置消息 */
  const sendLocation = useCallback(
    async (latitude: number, longitude: number, description: string) => {
      try {
        setSendingMessage(true);
        const sent = await sendLocationMessage(latitude, longitude, description, getSendOptions());
        addMessage(conversationID, { ...sent, isSelf: true, status: 'succeed' });
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送位置失败');
      } finally {
        setSendingMessage(false);
      }
    },
    [conversationID, getSendOptions, addMessage, setSendingMessage]
  );

  /** 撤回消息 */
  const revoke = useCallback(
    async (msgID: string) => {
      try {
        const msg = currentMessages.find((m: Message) => m.clientMsgID === msgID);
        if (msg) {
          await revokeMessage(msg, conversationID);
          deleteMessage(conversationID, msgID);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '撤回消息失败');
      }
    },
    [conversationID, currentMessages, deleteMessage]
  );

  /** 删除本地消息 */
  const removeMessage = useCallback(
    async (msgID: string) => {
      try {
        const msg = currentMessages.find((m: Message) => m.clientMsgID === msgID);
        if (msg) {
          await deleteLocalMessage(msg, conversationID);
          deleteMessage(conversationID, msgID);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '删除消息失败');
      }
    },
    [conversationID, currentMessages, deleteMessage]
  );

  /** 标记已读 */
  const markRead = useCallback(async () => {
    try {
      await markConversationAsRead(conversationID);
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  }, [conversationID]);

  // 设置当前会话
  useEffect(() => {
    setCurrentConversation(conversationID);
    return () => {
      setCurrentConversation(null);
    };
  }, [conversationID, setCurrentConversation]);

  // 加载初始消息
  useEffect(() => {
    if (autoLoad && conversationID) {
      const loadInitial = async () => {
        try {
          setError(null);
          setLoadingMessages(true);
          // getHistoryMessages 内部已处理 10005 错误，返回空列表或正常消息
          const messages = await getHistoryMessages({
            conversationID: conversationID,
            count: 20,
          });
          setMessages(conversationID, messages);
        } catch (err) {
          console.error('[useChat] 初始加载消息失败:', err);
          setError(err instanceof Error ? err.message : '加载消息失败');
        } finally {
          setLoadingMessages(false);
        }
      };
      loadInitial();
    }
  }, [autoLoad, conversationID, setMessages, setLoadingMessages]);

  // 监听新消息
  useEffect(() => {
    console.log('[useChat] 订阅 IM 事件, conversationID:', conversationID, 'conversationType:', conversationType, 'userID:', userID, 'groupID:', groupID);

    const unsubNewMessage = onIMEvent('newMessage', (msg: Message) => {
      console.log('[useChat] 收到新消息事件:', {
        msgID: msg.clientMsgID,
        sendID: msg.sendID,
        content: msg.content,
        msgGroupID: msg.groupID,
        recvID: msg.recvID,
        currentUserID,
        userID,
        groupID,
      });
      const isForCurrentConv =
        (conversationType === 'single' && msg.sendID === userID) ||
        (conversationType === 'group' && msg.groupID === groupID);
      console.log('[useChat] 新消息是否属于当前会话:', isForCurrentConv);

      if (isForCurrentConv) {
        addMessage(conversationID, { ...msg, isSelf: msg.sendID === currentUserID });
      }
    });

    const unsubTypingStatus = onIMEvent('typingStatus', (data: { userID: string; isTyping: boolean }) => {
      console.log('[useChat] 收到输入状态事件:', data);
      // 处理正在输入状态
      if (data.isTyping && data.userID !== currentUserID) {
        // TODO: 添加到 typingUsers
      } else {
        // TODO: 从 typingUsers 移除
      }
    });

    return () => {
      console.log('[useChat] 取消订阅 IM 事件');
      unsubNewMessage();
      unsubTypingStatus();
    };
  }, [conversationID, conversationType, userID, groupID, currentUserID, addMessage]);

  // 进入聊天时标记已读
  useEffect(() => {
    markRead();
  }, [conversationID, markRead]);

  return {
    messages: currentMessages,
    typingUsers,
    isLoading: isLoadingMessages,
    isSending: isSendingMessage,
    error,
    loadMore,
    sendText,
    sendImage,
    sendAudio,
    sendVideo,
    sendFile,
    sendLocation,
    revoke,
    removeMessage,
    markRead,
  };
}
