import React from "react";
import { Button, Space } from "antd";
import { CloseOutlined, HeartOutlined } from "@ant-design/icons";
import "./SwipeButtons.css";

const SwipeButtons = ({ onLike, onDislike }) => {
  return (
    <Space className="swipe-buttons-container">
      <Button
        className="swipe-button like"
        shape="circle"
        icon={<HeartOutlined />}
        onClick={onLike}
      />
      <Button
        className="swipe-button dislike"
        shape="circle"
        icon={<CloseOutlined />}
        onClick={onDislike}
      />
    </Space>
  );
};

export default SwipeButtons;