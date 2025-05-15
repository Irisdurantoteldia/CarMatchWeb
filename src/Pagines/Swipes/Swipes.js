import React, { useState } from "react";
import { Card, Empty, Spin, Layout } from "antd";
import { HeartOutlined, CloseOutlined } from "@ant-design/icons";
import { useSwipes } from "../../Hooks/useSwipes";
import SwipeCard from "../../Components/Swipes/SwipeCard";
import { useNavigate, useLocation } from "react-router-dom";
import "./Swipes.css";

const { Content } = Layout;

export default function Swipes() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedUserId = location.state?.selectedUserId;
  const userData = location.state?.userData;

  const {
    users,
    currentIndex,
    detailedView,
    loading,
    handleLike,
    handleDislike,
    toggleDetailedView,
    refreshUsers,
  } = useSwipes(selectedUserId, userData);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loader-container">
          <Spin size="large">
            <div style={{ padding: '50px' }}>Carregant usuaris...</div>
          </Spin>
        </div>
      );
    }

    if (selectedUserId && userData) {
      return (
        <>
          <div className="card-container">
            <Card className="swipe-card">
              <SwipeCard
                user={userData}
                detailedView={detailedView}
                onToggleDetailedView={toggleDetailedView}
              />
            </Card>
          </div>
          <div className="button-container">
            <div className="swipe-buttons">
              <button
                className="swipe-button dislike"
                onClick={() => {
                  handleDislike();
                  navigate(-1);
                }}
              >
                <CloseOutlined />
              </button>
              <button
                className="swipe-button like"
                onClick={() => {
                  handleLike();
                  navigate(-1);
                }}
              >
                <HeartOutlined />
              </button>
            </div>
          </div>
        </>
      );
    }
    if (users.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <h3>No hi ha usuaris per mostrar</h3>
              <p>Torna més tard per veure nous usuaris</p>
            </div>
          }
        />
      );
    }

    if (currentIndex >= users.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <h3>Has vist tots els usuaris</h3>
              <p>Torna més tard per veure nous usuaris</p>
            </div>
          }
        />
      );
    }

    const user = users[currentIndex];

    return (
      <>
        <div className="card-container">
          <Card className="swipe-card">
            <SwipeCard
              user={user}
              detailedView={detailedView}
              onToggleDetailedView={toggleDetailedView}
            />
          </Card>
        </div>

        <div className="button-container">
          <div className="swipe-buttons">
            <button className="swipe-button like" onClick={handleLike}>
              <HeartOutlined />
            </button>
            <button className="swipe-button dislike" onClick={handleDislike}>
              <CloseOutlined />
            </button>
          </div>
        </div>
      </>
    );
  };

  React.useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <Layout className="swipes-layout">
      <Content className="swipes-content">{renderContent()}</Content>
    </Layout>
  );
}
