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
      // Canviem la referència per accedir a la subcol·lecció
      const messagesRef = collection(db, "matches", matchId, "messages");
      const q = query(
        messagesRef,
        orderBy("date", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }));

      setChatState(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          messages: messages,
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
    // Inicialitzem l'estat del xat si no existeix
    if (!chatState[match.matchId]) {
      setChatState(prev => ({
        ...prev,
        [match.matchId]: {
          messages: [],
          loading: true,
          newMessage: ''
        }
      }));
      await loadPreviousMessages(match.matchId);
    }
  };

  console.log("MATCHES:", matches);

  // Modifiquem l'efecte per escoltar els missatges en temps real
  useEffect(() => {
    if (!selectedMatch?.matchId) return;

    // Canviem la referència per accedir a la subcol·lecció
    const messagesRef = collection(db, "matches", selectedMatch.matchId, "messages");
    const q = query(
      messagesRef,
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
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
      // Canviem la referència per enviar a la subcol·lecció
      const messagesRef = collection(db, "matches", matchId, "messages");
      const messageData = {
        text: messageText,
        sender: auth.currentUser.uid,
        date: serverTimestamp(),
      };

      await addDoc(messagesRef, messageData);

      // Netejem el camp de missatge
      setChatState(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
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
                    <Text strong>{selectedMatch.nom}</Text>
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
                <div className="chat-input-container">
                  <ChatInput
                    value={chatState[selectedMatch.matchId]?.newMessage || ''}
                    onChange={(e) => setChatState(prev => ({
                      ...prev,
                      [selectedMatch.matchId]: {
                        ...prev[selectedMatch.matchId],
                        newMessage: e.target.value
                      }
                    }))}
                    onSend={() => sendMessage(selectedMatch.matchId)}
                  />
                </div>
              </Card>
            ) : (
              <div className="no-chat-selected">
                <Text type="secondary">Selecciona un xat per començar a parlar</Text>
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ChatHome;
