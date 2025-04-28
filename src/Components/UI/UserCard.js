import React from "react";
import { Card, Avatar, Badge, Typography, Space } from "antd";
import "./UserCard.css";

const { Text } = Typography;

const UserCard = ({ user, onPress, lastMessage, unreadCount }) => {
  return (
    <Card className="user-card" onClick={onPress}>
      <div className="avatar-container">
        <Avatar size={50} src={user.photo} />
        {user.online && <Badge status="success" className="online-indicator" />}
      </div>

      <div className="info-container">
        <div className="name-row">
          <Text strong ellipsis>{user.nom}</Text>
          <Text type="secondary" className="timestamp">
            {lastMessage?.timestamp
              ? new Date(lastMessage.timestamp).toLocaleDateString([], {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </Text>
        </div>

        <div className="message-row">
          <Text type="secondary" ellipsis className="message-preview">
            {lastMessage?.text || "Inicia una conversa"}
          </Text>
          {unreadCount > 0 && (
            <Badge count={unreadCount} />
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserCard;