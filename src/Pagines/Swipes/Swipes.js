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
  const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);
  const [position, setPosition] = useState(null);
  const [rotation, setRotation] = useState(0);

  const {
    users,
    currentIndex,
    detailedView,
    loading,
    handleLike,
    handleDislike,
    toggleDetailedView,
    resetPosition,
    SWIPE_THRESHOLD,
    refreshUsers,
  } = useSwipes(selectedUserId, userData);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!startX || !startY) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    setPosition({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleTouchEnd = () => {
    if (!position) return;
    
    if (position.x > SWIPE_THRESHOLD) {
      handleDislike();
    } else if (position.x < -SWIPE_THRESHOLD) {
      handleLike();
    }
    setPosition(null);
    setRotation(0);
    setStartX(null);
    setStartY(null);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (!startX || !startY) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    setPosition({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    if (!position) return;
    
    if (position.x > SWIPE_THRESHOLD) {
      handleDislike();
    } else if (position.x < -SWIPE_THRESHOLD) {
      handleLike();
    }
    setPosition(null);
    setRotation(0);
    setStartX(null);
    setStartY(null);
  };

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
        <div
          className="card-container"
          style={{
            transform: position
              ? `translateX(${position.x}px) translateY(${position.y}px) rotate(${rotation}deg)`
              : "none",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={startX ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          data-dragging={position?.x < 0 ? "left" : position?.x > 0 ? "right" : ""}
        >
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
