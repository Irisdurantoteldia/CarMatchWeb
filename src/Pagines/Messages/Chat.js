import React from "react";
import { Layout } from "antd";
import { useParams } from "react-router-dom";
import MessageList from "../../Components/Chat/MessageList";
import ChatInput from "../../Components/Chat/ChatInput";
import { useMessages } from "../../Hooks/useMessages";
import { auth } from "../../FireBase/FirebaseConfig";
import "./Chat.css";

const { Content } = Layout;

const Chat = () => {
  const { matchId } = useParams();
  const {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    loading,
    flatListRef,
    inputRef,
  } = useMessages(matchId);

  return (
    <Layout className="chat-layout">
      <Content className="chat-content">
        <MessageList
          messages={messages}
          loading={loading}
          flatListRef={flatListRef}
          currentUserId={auth.currentUser?.uid}
          matchId={matchId}
        />
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          inputRef={inputRef}
          matchId={matchId}
        />
      </Content>
    </Layout>
  );
};

export default Chat;
