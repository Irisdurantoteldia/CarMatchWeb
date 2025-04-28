import React, { useState, useEffect } from "react";
import { Layout, Menu, Card, Typography, Spin, Alert } from "antd";
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  SettingOutlined, 
  QuestionCircleOutlined 
} from "@ant-design/icons";
import { doc, getDoc, query, where, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import DriverOptions from "../../Components/Edit/DriverOptions";
import PassengerOptions from "../../Components/Edit/PassengerOptions";
import "./Edit.css";

const { Content } = Layout;
const { Title } = Typography;

const Edit = ({ navigate }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Buscar el usuario por userId en lugar de uid
          const usersQuery = query(
            collection(db, "users"),
            where("userId", "==", user.uid)
          );
          const userSnapshot = await getDocs(usersQuery);
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const data = userDoc.data();
            setUserData(data);
            setUserRole(data.role || "Passatger");
          } else {
            Alert.alert(
              "Error",
              "No s'ha trobat el perfil de l'usuari. Si us plau, torna a iniciar sessió."
            );
            navigate('/login');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.error(
            "No s'han pogut carregar les dades de l'usuari. Si us plau, torna-ho a provar més tard."
          );
          navigate('/login');  // Replace navigation with navigate
        }
      } else {
        navigate('/login');  // Replace navigation with navigate
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <Layout className="edit-layout">
        <Content className="edit-content">
          <Spin size="large" tip="Cargando..." />
        </Content>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout className="edit-layout">
        <Content className="edit-content">
          <Title level={4}>No se han podido cargar los datos</Title>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="edit-layout">
      <Content className="edit-content">
        <Card title="Perfil" className="profile-section">
          <Menu mode="vertical">
            <Menu.Item 
              key="profile" 
              icon={<UserOutlined />}
              onClick={() => navigate("/account", { state: { userData } })}
            >
              Editar perfil
            </Menu.Item>
            <Menu.Item 
              key="schedule" 
              icon={<ClockCircleOutlined />}
              onClick={() => navigate("/edit-schedule", { state: { userId: auth.currentUser.uid } })}
            >
              Editar horario
            </Menu.Item>
          </Menu>
        </Card>

        {userRole === "Conductor" ? (
          <DriverOptions navigate={navigate} userData={userData} />
        ) : (
          <PassengerOptions navigate={navigate} userData={userData} />
        )}

        <Card title="Configuración" className="settings-section">
          <Menu mode="vertical">
            <Menu.Item 
              key="settings" 
              icon={<SettingOutlined />}
              onClick={() => navigate("/settings")}
            >
              Configuración
            </Menu.Item>
            <Menu.Item 
              key="help" 
              icon={<QuestionCircleOutlined />}
              onClick={() => navigate("/help")}
            >
              Ayuda
            </Menu.Item>
          </Menu>
        </Card>
      </Content>
    </Layout>
  );
};

export default Edit;
