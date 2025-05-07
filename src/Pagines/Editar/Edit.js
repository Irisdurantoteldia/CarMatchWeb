import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Typography,
  Spin,
  Alert,
  Row,
  Col,
} from "antd";
import {
  SettingOutlined,
  CarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { query, where, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import { generalOptions, driverOptions, passengerOptions } from "../../Components/Edit/optionsConfig";
import "./Edit.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const Edit = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const usersQuery = query(
          collection(db, "users"),
          where("userId", "==", currentUser.uid)
        );
        const userSnapshot = await getDocs(usersQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const data = userDoc.data();
          setUserData(data);
          setUserRole(data.role || "Passatger");
        } else {
          Alert.error("No s'ha trobat el perfil de l'usuari");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.error("Error al carregar les dades de l'usuari");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleNavigate = (option) => {
    if (option.key === "account") {
      navigate("/account");
    } else {
      navigate(`/edit/${option.route}`);
    }
  };

  const renderOptions = (options) => {
    return (
      <Row gutter={[24, 24]}>
        {options.map((option) => (
          <Col xs={24} md={12} lg={8} key={option.key}>
            <Card
              className="edit-option-block"
              hoverable
              onClick={() => handleNavigate(option)}
            >
              <div className="option-icon">
                {option.icon}
              </div>
              <div className="option-content">
                <Title level={4}>{option.label}</Title>
                <Text>{option.description}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  if (loading) {
    return (
      <div className="edit-loading">
        <Spin size="large" />
        <p>Carregant...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <Layout className="edit-layout">
        <Content className="edit-content">
          <Alert
            message="Error"
            description="No s'han pogut carregar les dades"
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="edit-layout">
      <Content className="edit-content">
        <div className="edit-section">
          <Title level={4} className="section-title">
            <SettingOutlined /> Configuració General
          </Title>
          {renderOptions(generalOptions)}
        </div>

        <div className="edit-section">
          <Title level={4} className="section-title">
            {userRole === "Conductor" ? (
              <>
                <CarOutlined /> Opcions de Conductor
              </>
            ) : (
              <>
                <TeamOutlined /> Opcions de Passatger
              </>
            )}
          </Title>
          {renderOptions(userRole === "Conductor" ? driverOptions : passengerOptions)}
        </div>
      </Content>
    </Layout>
  );
};

export default Edit;
