import React, { useState, useEffect } from "react";
import { Layout, Card, Avatar, Typography, Spin } from "antd";
import { useParams, useLocation } from "react-router-dom";
import MessageList from "../../Components/Chat/MessageList";
import ChatInput from "../../Components/Chat/ChatInput";
import { auth, db } from "../../FireBase/FirebaseConfig";
import { UserOutlined } from "@ant-design/icons";
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import "./Chat.css";

const { Content } = Layout;
const { Text } = Typography;

const Chat = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const matchedUser = location.state?.user;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar mensajes anteriores
  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("matchId", "==", matchId),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(loadedMessages.reverse());
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, "messages");
      await addDoc(messagesRef, {
        matchId,
        text: newMessage,
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
      loadMessages(); // Recargar mensajes después de enviar
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  // Cargar mensajes al montar el componente o cuando cambie el matchId
  useEffect(() => {
    if (matchId) {
      loadMessages();
    }
  }, [matchId]);

  return (
    <Layout className="chat-layout">
      <Content className="chat-content">
        <Card className="chat-card">
          {matchedUser && (
            <div className="chat-header">
              <Avatar src={matchedUser.photo} icon={<UserOutlined />} size={48} />
              <div className="chat-header-info">
                <Text strong>{matchedUser.nom}</Text>
              </div>
            </div>
          )}
          <div className="chat-messages-container">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : (
              <MessageList
                messages={messages}
                loading={loading}
                currentUserId={auth.currentUser?.uid}
                matchId={matchId}
              />
            )}
          </div>
          <div className="chat-input">
            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
              matchId={matchId}
            />
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Chat;
