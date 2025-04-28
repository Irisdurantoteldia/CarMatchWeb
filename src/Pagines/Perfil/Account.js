import React, { useState, useEffect } from "react";
import { Layout, Card, Avatar, Typography, Button, Space, message, Spin } from "antd";
import { UserOutlined, CarOutlined, MailOutlined, PhoneOutlined, KeyOutlined } from "@ant-design/icons";
import { getUserById } from "../../Services/userService";
import { auth, db } from "../../FireBase/FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useLocation, useNavigate } from 'react-router-dom';
import "./Account.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || auth.currentUser?.uid;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          message.error("No s'ha pogut trobar l'ID de l'usuari");
          setLoading(false);
          return;
        }

        const userData = await getUserById(userId);
        if (userData) {
          setUser(userData);
        } else {
          message.error("No s'ha pogut trobar l'usuari");
        }
      } catch (error) {
        console.error("Error carregant l'usuari:", error);
        message.error("Error carregant les dades de l'usuari");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleRoleSwitch = async (newRole) => {
    try {
      const docId = user.id || user.userId;
      if (!docId) {
        message.error("No s'ha pogut trobar l'ID de l'usuari");
        return;
      }

      const userRef = doc(db, "users", docId);
      await updateDoc(userRef, {
        role: newRole
      });
      
      setUser(prev => ({ ...prev, role: newRole }));
      message.success("S'ha actualitzat el rol correctament");
    } catch (error) {
      console.error("Error updating role:", error);
      message.error("No s'ha pogut actualitzar el rol");
    }
  };

  if (loading) {
    return (
      <Layout className="account-layout">
        <Content className="account-content">
          <Spin size="large" tip="Carregant perfil..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="account-layout">
      <Content className="account-content">
        <Card className="profile-header">
          <Avatar 
            size={120} 
            src={user?.photo || "https://via.placeholder.com/150"}
            icon={<UserOutlined />}
          />
          <Title level={2}>{user?.name}</Title>
          <Text type="secondary">{user?.role}</Text>
        </Card>

        <Card title="Informació Personal" className="info-section">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="info-row">
              <MailOutlined />
              <Text>{user.email}</Text>
            </div>
            {user.phone && (
              <div className="info-row">
                <PhoneOutlined />
                <Text>{user.phone}</Text>
              </div>
            )}
            {user.bio && (
              <div className="bio-container">
                <Text>{user.bio}</Text>
              </div>
            )}
          </Space>
        </Card>

        {userId === auth.currentUser?.uid && (
          <>
            <Card className="role-switcher">
              <Space size="large">
                <Button
                  type={user?.role === "Conductor" ? "primary" : "default"}
                  icon={<CarOutlined />}
                  onClick={() => handleRoleSwitch("Conductor")}
                >
                  Conductor
                </Button>
                <Button
                  type={user?.role === "Passatger" ? "primary" : "default"}
                  icon={<UserOutlined />}
                  onClick={() => handleRoleSwitch("Passatger")}
                >
                  Passatger
                </Button>
              </Space>
            </Card>

            <Button 
              icon={<KeyOutlined />}
              block
              className="change-password-button"
              onClick={() => message.info("Funcionalitat en desenvolupament")}
            >
              Canviar Contrasenya
            </Button>
          </>
        )}

        {user?.role === "Conductor" && (
          <Button
            icon={<CarOutlined />}
            block
            className="manage-vehicle-button"
            onClick={() => navigate("/manage-vehicle")}
          >
            Gestionar Vehicle
          </Button>
        )}
      </Content>
    </Layout>
  );
};

export default Account;