// src/components/ChatListener.js
import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/configs/firebase';

function ChatListener() {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const unsubChat = onSnapshot(collection(db, 'chats'), (snapshot) => {
      const chatsDb = snapshot.docs.map((doc) => doc.id);
      setChats(chatsDb);
    });

    // Limpeza quando o componente desmonta
    return () => unsubChat();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      const snapshot = await getDocs(collection(db, 'chats'));
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (chats.length === 0) return;

    const unsubMessages = chats.map((chatId) => {
      return onSnapshot(collection(db, `chats/${chatId}/messages`), (snapshot) => {
        const messagesDb = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setMessages((prevMessages) => [...prevMessages, ...messagesDb]);
      });
    });

    // Limpeza quando o componente desmonta
    return () => unsubMessages.forEach((unsub) => unsub());
  }, [chats]);

  return (
    <div>
      <h2>Mensagens:</h2>
      <ul>
        {/* {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.from}:</strong> {msg.body}
          </li>
        ))} */}
      </ul>
    </div>
  );
}

export default ChatListener;
