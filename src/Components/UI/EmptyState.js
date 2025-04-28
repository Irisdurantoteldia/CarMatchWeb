import React from "react";
import { Empty } from "antd";
import { 
  HeartOutlined, 
  MessageOutlined, 
  UserOutlined, 
  CarOutlined,
  SearchOutlined,
  CalendarOutlined
} from "@ant-design/icons";

const iconComponents = {
  heart: HeartOutlined,
  message: MessageOutlined,
  user: UserOutlined,
  car: CarOutlined,
  search: SearchOutlined,
  calendar: CalendarOutlined,
  people: UserOutlined
};

const EmptyState = ({ iconName, title, subtitle }) => {
  const IconComponent = iconComponents[iconName] || UserOutlined;
  
  return (
    <Empty
      image={<IconComponent style={{ fontSize: 60, color: "#ccc" }} />}
      description={
        <div>
          <h3 style={{ color: "#333", fontWeight: "bold" }}>{title}</h3>
          <p style={{ color: "#666" }}>{subtitle}</p>
        </div>
      }
    />
  );
};

export default EmptyState;