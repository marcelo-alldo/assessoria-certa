import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  name: string;
  type: string;
  body: string;
  timestamp: number;
  user?: {
    profile: {
      name: string;
    };
  };
  userTransfered?: {
    profile: {
      name: string;
    };
  };
  userUid?: string;
}

export interface MessageAttendantHistoryType {
  createdAt: string;
  description: string;
  masterUid: string;
  note: string;
  remoteJid: string;
  status: string;
  timestamp: number;
  messageTimestamp: number;
  transferTo: string;
  type: string;
  uid: string;
  updatedAt: string;
  userUid: string;
}

export interface Chat {
  id: string;
  remoteJid: string;
  pushName: string;
  profilePicUrl: string;
  updatedAt: string;
  windowStart: string;
  isClient: boolean;
  isLead: boolean;
  windowExpires: string;
  windowActive: boolean;
  unreadMessages: number;
  isMine: boolean;
  attendant: {
    uid: string;
    name: string;
  };
  attendantStatus: string;
  messages: {
    records: Message[];
    total: number;
    pages: number;
    currentPage: number;
  };
}

const initialState: Chat[] = [];

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    // Define os chats disponíveis
    setChats: (state, action: PayloadAction<Chat[]>) => {
      return action.payload;
    },

    setChat: (state, action: PayloadAction<Chat>) => {
      const newChat = action.payload;
      const existingChatIndex = state.findIndex((chat) => chat.id === newChat.id || chat.remoteJid === newChat.remoteJid);

      if (existingChatIndex !== -1) {
        // Atualiza o chat existente
        state[existingChatIndex] = newChat;
      } else {
        // Adiciona um novo chat
        state.push(newChat);
      }

      // Ordena os chats pelo updatedAt (mais recente primeiro)
      state.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    // Adiciona uma nova mensagem ao chat
    addMessageToChat: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;

      let chat = state.find((c) => c.id === chatId || c.remoteJid === chatId);

      // Se não existir, crie um novo chat básico (ajuste os campos conforme necessário)
      if (!chat) {
        chat = {
          id: chatId,
          remoteJid: chatId,
          pushName: '',
          profilePicUrl: '',
          updatedAt: new Date().toISOString(),
          windowStart: '',
          isClient: false,
          isLead: false,
          windowExpires: '',
          windowActive: false,
          unreadMessages: 0,
          isMine: false,
          attendant: {
            uid: '',
            name: '',
          },
          attendantStatus: '',
          messages: {
            records: [],
            total: 0,
            pages: 0,
            currentPage: 0,
          },
        };
        state.push(chat);
      }

      if (!chat.messages || !Array.isArray(chat.messages.records)) {
        chat.messages = {
          records: [],
          total: 0,
          pages: 0,
          currentPage: 0,
        };
      }

      // Identifica o id da mensagem
      const messageId = 'key' in message ? message.key.id : (message as MessageAttendantHistoryType).uid;

      if (
        chat.messages.records.some((msg) => {
          if ('key' in msg) return msg.key.id === messageId;

          return (msg as MessageAttendantHistoryType).uid === messageId;
        })
      ) {
        return;
      }

      chat.messages.records.push(message as Message);

      // Atualiza o updatedAt do chat para o timestamp da mensagem
      if ('messageTimestamp' in message && message.messageTimestamp) {
        chat.updatedAt = new Date(message.messageTimestamp * 1000).toISOString();
      } else if ('timestamp' in message && message.timestamp) {
        chat.updatedAt = new Date((message.timestamp as number) * 1000).toISOString();
      }

      // Ordena os chats pelo updatedAt (mais recente primeiro)
      state.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    // Edita um chat específico
    editChat: (state, action: PayloadAction<{ id: string; changes: Partial<Chat> }>) => {
      const { id, changes } = action.payload;
      const chat = state.find((c) => c.id === id || c.remoteJid === id);

      if (chat) {
        Object.assign(chat, changes);
      }
    },

    // Reseta o estado dos chats e messages
    resetChats: () => initialState,
  },
});

export const { setChats, setChat, addMessageToChat, editChat, resetChats } = chatsSlice.actions;

export default chatsSlice.reducer;
