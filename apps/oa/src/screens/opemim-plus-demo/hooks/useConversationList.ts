/**
 * 会话列表 Hook
 * 管理会话列表的加载、刷新、操作
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useChatStore, useConversations, useTotalUnread, useCurrentUserID } from '../stores';
import {
  getConversationList,
  pinConversation,
  markConversationAsRead,
  deleteConversation,
  setConversationDraft,
  onIMEvent,
} from '../services';
import type { ConversationItem, ConversationAction } from '../types';

export interface UseConversationListOptions {
  /** 是否在挂载时自动加载 */
  autoLoad?: boolean;
}

export interface UseConversationListResult {
  /** 会话列表 */
  conversations: ConversationItem[];
  /** 总未读数 */
  totalUnread: number;
  /** 是否加载中 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 刷新会话列表 */
  refresh: () => Promise<void>;
  /** 加载更多 */
  loadMore: () => Promise<void>;
  /** 操作会话 */
  operateConversation: (
    conversationID: string,
    action: ConversationAction
  ) => Promise<void>;
}

/**
 * 会话列表 Hook
 */
export function useConversationList(
  options: UseConversationListOptions = {}
): UseConversationListResult {
  const { autoLoad = true } = options;

  const {
    conversations,
    totalUnread,
    isLoadingConversations,
    setConversations,
    setTotalUnread,
    setLoadingConversations,
    updateConversation,
    deleteConversation: removeConversation,
  } = useChatStore();

  const currentUserID = useCurrentUserID();
  const [error, setError] = React.useState<string | null>(null);

  /** 加载会话列表 */
  const refresh = useCallback(async () => {
    try {
      setError(null);
      setLoadingConversations(true);
      const list = await getConversationList(currentUserID || undefined);
      setConversations(list);
      // 计算总未读数
      const total = list.reduce((sum, c) => sum + c.unreadCount, 0);
      setTotalUnread(total);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载会话列表失败';
      setError(message);
      console.error('加载会话列表失败:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUserID, setConversations, setTotalUnread, setLoadingConversations]);

  /** 加载更多（分页） */
  const loadMore = useCallback(async () => {
    // 预留扩展：支持分页加载
    // 目前 IM SDK 可能不支持分页获取会话列表
  }, []);

  /** 操作会话 */
  const operateConversation = useCallback(
    async (conversationID: string, action: ConversationAction) => {
      try {
        switch (action) {
          case 'pin':
            const conv = conversations.find((c: ConversationItem) => c.conversationID === conversationID);
            if (conv) {
              await pinConversation(conversationID, !conv.isPinned);
              updateConversation(conversationID, { isPinned: !conv.isPinned });
            }
            break;

          case 'mute':
            // TODO: 调用 setConversationMuted
            break;

          case 'delete':
            await deleteConversation(conversationID);
            removeConversation(conversationID);
            break;

          case 'markUnread':
            // TODO: 标记未读
            break;

          case 'clearHistory':
            // TODO: 清除历史消息
            break;
        }
      } catch (err) {
        console.error('会话操作失败:', err);
      }
    },
    [conversations, updateConversation, removeConversation]
  );

  // 自动加载
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  // 监听会话变化
  useEffect(() => {
    const unsubConversationChanged = onIMEvent('conversationChanged', () => {
      refresh();
    });

    const unsubUnreadChanged = onIMEvent('totalUnreadChanged', (total: number) => {
      setTotalUnread(total);
    });

    return () => {
      unsubConversationChanged();
      unsubUnreadChanged();
    };
  }, [refresh, setTotalUnread]);

  return {
    conversations,
    totalUnread,
    isLoading: isLoadingConversations,
    error,
    refresh,
    loadMore,
    operateConversation,
  };
}
