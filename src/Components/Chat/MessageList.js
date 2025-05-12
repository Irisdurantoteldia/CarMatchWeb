import React, { useEffect } from "react";
import { List, Spin } from "antd";
import { auth } from "../../FireBase/FirebaseConfig";
import MessageBubble from "../UI/MessageBubble";
import EmptyChat from "./EmptyChat";
import "./MessageList.css";

const MessageList = ({
  messages,
  loading,
  flatListRef,
  currentUserId,
  matchId,
}) => {
  useEffect(() => {
    if (messages.length > 0 && flatListRef?.current) {
      const element = flatListRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, flatListRef]);

  const currentUser = auth.currentUser;

  if (loading) {
    return (
      <div className="messages-container loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="messages-container" ref={flatListRef}>
      <List
        className="messages-list"
        dataSource={messages}
        locale={{ emptyText: <EmptyChat /> }}
        renderItem={(item) => {
          const isMyMessage = item.senderId === currentUserId;
          return (
            <div className={`message-row ${isMyMessage ? 'my-message' : 'other-message'}`}>
              <MessageBubble
                message={item}
                currentUserId={currentUserId}
                matchId={matchId}
                isMyMessage={isMyMessage}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default MessageList;
