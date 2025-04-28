import React from "react";
import { Card, Avatar, Typography, Space } from "antd";
import { EnvironmentOutlined, MessageOutlined } from "@ant-design/icons";
import "./MatchCard.css";

const { Text } = Typography;

const MatchCard = ({ item, onPress }) => (
  <Card className="match-card" onClick={() => onPress(item)}>
    <div className="match-content">
      <Avatar size={70} src={item.photo} className="match-photo" />
      <div className="match-info">
        <Text strong className="match-name">{item.nom}</Text>
        <Text type="secondary" className="match-role">{item.role}</Text>
        <Space className="location-container">
          <EnvironmentOutlined />
          <Text type="secondary">
            {item.location} → {item.desti}
          </Text>
        </Space>
        {item.lastMessage && (
          <Text type="secondary" italic className="last-message">
            {item.lastMessage.sender === item.currentUserId ? "Tu: " : ""}
            {item.lastMessage.text}
          </Text>
        )}
      </div>
      <MessageOutlined className="chat-icon" />
    </div>
  </Card>
);

export default MatchCard;