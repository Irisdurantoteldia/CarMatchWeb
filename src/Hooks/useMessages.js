import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { subscribeToMessages, sendMessage } from "../Services/messageService";

export const useMessages = (matchId) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(matchId, (messagesList) => {
      setMessages(messagesList);
      setLoading(false);

      if (flatListRef.current && messagesList.length > 0) {
        setTimeout(
          () => flatListRef.current.scrollIntoView({ behavior: "smooth" }),
          200
        );
      }
    });

    return unsubscribe;
  }, [matchId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      await sendMessage(matchId, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("No s'ha pogut enviar el missatge. Torna-ho a provar.");
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage: handleSendMessage,
    loading,
    flatListRef,
    inputRef,
  };
};