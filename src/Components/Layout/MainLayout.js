import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CarOutlined,
  SearchOutlined,
  EditOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "./MainLayout.css";

const { Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/swipes",
      icon: <CarOutlined />,
      label: "Swipes",
    },
    {
      key: "/search",
      icon: <SearchOutlined />,
      label: "Cerca",
    },
    {
      key: "/edit",
      icon: <EditOutlined />,
      label: "Editar",
    },
    {
      key: "/matches",
      icon: <MessageOutlined />,
      label: "Matches",
    },
    {
      key: "/account",
      icon: <UserOutlined />,
      label: "Compte",
    },
  ];

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo-container-ML">
          <img
            src={require("../../Assets/CarMatch.png")}
            alt="Logo"
            className="logo-ML"
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Button
          className="collapse-button"
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
        <Content className="main-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
