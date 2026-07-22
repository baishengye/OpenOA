/**
 * 聊天状态管理 (Zustand)
 * 管理会话列表和消息状态
 */
import { create } from 'zustand';
import type {
  ConversationItem,
  Message,
  ConversationType,
} from '../types';

// ── 状态接口 ─────────────────────────────────────────────────────────────────

export interface ChatState {
  // 会话列表
  conversations: ConversationItem[];
  totalUnread: number;

  // 当前聊天
  currentConversationID: string | null;
  currentMessages: Message[];
  typingUsers: string[];

  // 加载状态
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;

  // 操作 - 会话
  setConversations: (conversations: ConversationItem[]) => void;
  addConversation: (conversation: ConversationItem) => void;
  updateConversation: (id: string, updates: Partial<ConversationItem>) => void;
  deleteConversation: (id: string) => void;
  setTotalUnread: (count: number) => void;
  setLoadingConversations: (loading: boolean) => void;

  // 操作 - 消息
  setCurrentConversation: (id: string | null) => void;
  setMessages: (conversationID: string, messages: Message[]) => void;
  addMessage: (conversationID: string, message: Message) => void;
  updateMessage: (conversationID: string, msgID: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationID: string, msgID: string) => void;
  prependMessages: (conversationID: string, messages: Message[]) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSendingMessage: (sending: boolean) => void;

  // 操作 - typing
  setTypingUsers: (conversationID: string, users: string[]) => void;

  // 重置
  reset: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>()((set, get) => ({
  // 初始状态
  conversations: [],
  totalUnread: 0,
  currentConversationID: null,
  currentMessages: [],
  typingUsers: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,

  // ── 会话操作 ────────────────────────────────────────────────────────────────

  setConversations: (conversations: ConversationItem[]) => {
    console.log('[chatStore] setConversations, 数量:', conversations.length);
    conversations.forEach((conv, idx) => {
      console.log(`[chatStore] 保存会话${idx}:`, {
        conversationID: conv.conversationID,
        conversationType: conv.conversationType,
        userID: conv.userID,
        groupID: conv.groupID,
      });
    });
    set({ conversations });
  },

  addConversation: (conversation: ConversationItem) => {
    const exists = get().conversations.some(
      (c) => c.conversationID === conversation.conversationID
    );
    if (!exists) {
      set((state) => ({
        conversations: [conversation, ...state.conversations],
      }));
    }
  },

  updateConversation: (id: string, updates: Partial<ConversationItem>) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationID === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteConversation: (id: string) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.conversationID !== id),
    }));
  },

  setTotalUnread: (count: number) => {
    set({ totalUnread: count });
  },

  setLoadingConversations: (loading: boolean) => {
    set({ isLoadingConversations: loading });
  },

  // ── 消息操作 ────────────────────────────────────────────────────────────────

  setCurrentConversation: (id: string | null) => {
    set({
      currentConversationID: id,
      currentMessages: id ? get().currentMessages : [],
      typingUsers: [],
    });
  },

  setMessages: (conversationID: string, messages: Message[]) => {
    if (get().currentConversationID === conversationID) {
      set({ currentMessages: messages });
    }
  },

  addMessage: (conversationID: string, message: Message) => {
    if (get().currentConversationID === conversationID) {
      set((state) => ({
        currentMessages: [...state.currentMessages, message],
      }));
    }
    // 同时更新会话列表中的最新消息
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationID === conversationID
          ? {
              ...c,
              latestMsgContent: message.content || message.latestMsgContent,
              latestMsgSendTime: message.sendTime || Date.now(),
            }
          : c
      ),
    }));
  },

  updateMessage: (
    conversationID: string,
    msgID: string,
    updates: Partial<Message>
  ) => {
    if (get().currentConversationID === conversationID) {
      set((state) => ({
        currentMessages: state.currentMessages.map((m) =>
          m.clientMsgID === msgID ? { ...m, ...updates } : m
        ),
      }));
    }
  },

  deleteMessage: (conversationID: string, msgID: string) => {
    if (get().currentConversationID === conversationID) {
      set((state) => ({
        currentMessages: state.currentMessages.filter(
          (m) => m.clientMsgID !== msgID
        ),
      }));
    }
  },

  prependMessages: (conversationID: string, messages: Message[]) => {
    if (get().currentConversationID === conversationID) {
      set((state) => ({
        currentMessages: [...messages, ...state.currentMessages],
      }));
    }
  },

  setLoadingMessages: (loading: boolean) => {
    set({ isLoadingMessages: loading });
  },

  setSendingMessage: (sending: boolean) => {
    set({ isSendingMessage: sending });
  },

  // ── Typing 状态 ─────────────────────────────────────────────────────────────

  setTypingUsers: (conversationID: string, users: string[]) => {
    if (get().currentConversationID === conversationID) {
      set({ typingUsers: users });
    }
  },

  // ── 重置 ──────────────────────────────────────────────────────────────────

  reset: () => {
    set({
      conversations: [],
      totalUnread: 0,
      currentConversationID: null,
      currentMessages: [],
      typingUsers: [],
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSendingMessage: false,
    });
  },
}));

// ── 便捷 Hooks ───────────────────────────────────────────────────────────────

/** 获取会话列表 */
export const useConversations = () => {
  const conversations = useChatStore((state) => state.conversations);
  console.log('[useConversations] 获取会话, 数量:', conversations.length);
  conversations.forEach((conv, idx) => {
    console.log(`[useConversations] 会话${idx}:`, {
      conversationID: conv.conversationID,
      conversationType: conv.conversationType,
      userID: conv.userID,
      groupID: conv.groupID,
    });
  });
  return conversations;
};

/** 获取总未读数 */
export const useTotalUnread = () => useChatStore((state) => state.totalUnread);

/** 获取当前消息列表 */
export const useCurrentMessages = () => useChatStore((state) => state.currentMessages);

/** 获取正在输入的用户 */
export const useTypingUsers = () => useChatStore((state) => state.typingUsers);
