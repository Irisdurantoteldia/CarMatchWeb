import React from "react";
import { Card, Avatar, Typography, Space, Badge } from "antd";
import { RightOutlined } from "@ant-design/icons";
import "./UserInfoHeader.css";

const { Text } = Typography;

const UserInfoHeader = ({ user, onProfilePress }) => {
  return (
    <Card className="user-header" onClick={onProfilePress}>
      <div className="user-header-content">
        <Avatar
          size={45}
          src={user.photoURL || require("../../assets/CarMatch.png")}
          className="user-avatar"
        />
        <div className="user-info">
          <Text strong className="user-name">
            {user.displayName || "Usuario"}
          </Text>
          <Space>
            <Badge status="success" />
            <Text className="status-text">Online</Text>
          </Space>
        </div>
        <RightOutlined className="arrow-icon" />
      </div>
    </Card>
  );
};

export default UserInfoHeader;
