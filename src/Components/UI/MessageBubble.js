import React from "react";
import { Typography } from "antd";
import "./MessageBubble.css";

const { Text } = Typography;

const MessageBubble = ({ message, currentUserId }) => {
  const isCurrentUser = message.sender === currentUserId;

  return (
    <div className={`message-container ${isCurrentUser ? 'current-user' : 'other-user'}`}>
      <div className={`message-bubble ${isCurrentUser ? 'current-user-bubble' : 'other-user-bubble'}`}>
        <Text className={`message-text ${isCurrentUser ? 'current-user-text' : 'other-user-text'}`}>
          {message.text}
        </Text>
      </div>
    </div>
  );
};

export default MessageBubble;
