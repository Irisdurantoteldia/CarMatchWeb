import React, { useState, useEffect } from "react";
import { Layout, Card, List, Typography, Spin, Avatar } from "antd";
import { useMatches } from "../../Hooks/useMatches";
import MessageList from "../../Components/Chat/MessageList";
import ChatInput from "../../Components/Chat/ChatInput";
import { auth, db } from "../../FireBase/FirebaseConfig";
import { UserOutlined } from "@ant-design/icons";
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import "./ChatHome.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const ChatHome = () => {
  const { matches, loading: loadingMatches } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [chatState, setChatState] = useState({});
  const [loading, setLoading] = useState(false);

  // Funció per carregar els missatges anteriors
  const loadPreviousMessages = async (matchId) => {
    try {
      setLoading(true);
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("matchId", "==", matchId),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setChatState(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          messages: messages.reverse(),
          loading: false
        }
      }));
    } catch (error) {
      console.error("Error carregant missatges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gestionar selecció del match i carregar missatges
  const handleSelectMatch = async (match) => {
    setSelectedMatch(match);
    if (!chatState[match.matchId]?.messages) {
      await loadPreviousMessages(match.matchId);
    }
  };

  console.log("MATCHES:", matches);

  // Modifiquem l'efecte per escoltar els missatges en temps real
  useEffect(() => {
    if (!selectedMatch?.matchId) return;

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("matchId", "==", selectedMatch.matchId),
      orderBy("timestamp", "asc") // Canviem a asc per mostrar els missatges en ordre cronològic
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() // Convertim el timestamp a Date
      }));

      setChatState(prev => ({
        ...prev,
        [selectedMatch.matchId]: {
          ...prev[selectedMatch.matchId],
          messages: messages,
          loading: false
        }
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedMatch?.matchId]);

  // Modifiquem la funció sendMessage per incloure més informació
  const sendMessage = async (matchId) => {
    const messageText = chatState[matchId]?.newMessage;
    if (!messageText?.trim()) return;

    try {
      const messagesRef = collection(db, "messages");
      const messageData = {
        matchId,
        text: messageText,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Usuari',
        senderPhoto: auth.currentUser.photoURL,
        timestamp: serverTimestamp(),
        read: false
      };

      await addDoc(messagesRef, messageData);

      // Actualitzem l'estat local immediatament per una millor UX
      setChatState(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          messages: [...(prev[matchId]?.messages || []), { ...messageData, id: Date.now().toString() }],
          newMessage: ''
        }
      }));
    } catch (error) {
      console.error("Error enviant missatge:", error);
    }
  };

  return (
    <Layout className="chat-home-layout">
      <Content className="chat-content">
        <div className="chat-container">
          <div className="chat-sidebar">
            <Card className="sidebar-card">
              <Title level={4} className="sidebar-title">Xats</Title>
              {loadingMatches ? (
                <div className="loading-container">
                  <Spin size="large" />
                </div>
              ) : (
                <List
                  className="matches-list-sidebar"
                  dataSource={matches}
                  renderItem={(item) => (
                    <List.Item
                      className={`sidebar-match-item${selectedMatch && selectedMatch.matchId === item.matchId ? ' selected' : ''}`}
                      onClick={() => handleSelectMatch(item)}
                    >
                      <Avatar src={item.photo} icon={<UserOutlined />} size={40} />
                      <div className="sidebar-match-info">
                        <Text strong>{item.nom}</Text>
                        <div className="sidebar-last-message">
                          {item.lastMessage && item.lastMessage.text
                            ? (typeof item.lastMessage.text === 'string'
                                ? item.lastMessage.text
                                : JSON.stringify(item.lastMessage.text))
                            : <span style={{color:'#aaa'}}>Cap missatge</span>}
                        </div>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: <span style={{color:'#aaa'}}>No tens cap match</span> }}
                />
              )}
            </Card>
          </div>
          <div className="chat-main">
            {selectedMatch ? (
              <Card className="chat-main-card">
                <div className="chat-header">
                  <Avatar src={selectedMatch.photo} icon={<UserOutlined />} size={48} />
                  <div className="chat-header-info">
                    <Text strong>{selectedMatch.name || selectedMatch.displayName}</Text>
                    <div className="chat-header-sub">{selectedMatch.email || ''}</div>
                  </div>
                </div>
                <div className="chat-messages-container">
                  <MessageList
                    messages={chatState[selectedMatch.matchId]?.messages || []}
                    loading={loading}
                    currentUserId={auth.currentUser?.uid}
                    matchId={selectedMatch.matchId}
                  />
                </div>
                <div className="chat-input">
                  <ChatInput
                    newMessage={chatState[selectedMatch.matchId]?.newMessage || ''}
                    setNewMessage={(msg) => setChatState((prev) => ({
                      ...prev,
                      [selectedMatch.matchId]: {
                        ...prev[selectedMatch.matchId],
                        newMessage: msg
                      }
                    }))}
                    sendMessage={() => sendMessage(selectedMatch.matchId)}
                    matchId={selectedMatch.matchId}
                  />
                </div>
              </Card>
            ) : (
              <div className="no-chat-selected">
                <Text type="secondary">Selecciona un match per començar a xatejar</Text>
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ChatHome;
