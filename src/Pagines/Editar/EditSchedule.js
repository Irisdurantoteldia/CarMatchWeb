import React, { useState, useEffect } from "react";
import { Layout, Card, TimePicker, Button, Typography, Tabs, Form, Spin, Input, Row, Col } from "antd";
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, query, where, getDocs, collection, updateDoc } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import { ArrowLeftOutlined } from '@ant-design/icons';
import SelectorPreferences from "../../Selectors/SelectorPreferences";
import "./EditSchedule.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const EditSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSortida, setHoraSortida] = useState("");
  const [detailedSchedule, setDetailedSchedule] = useState(
    Array(5).fill({ entrada: "", sortida: "" })
  );
  const [preferencies, setPreferencies] = useState("");
  const [weeklyScheduleId, setWeeklyScheduleId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [styles] = useState({
    dayContainer: { marginBottom: 16 },
    dayTitle: { marginBottom: 8 },
    inputGroup: { display: 'flex', gap: 8 },
    input: { flex: 1 }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (location.state?.userId) {
        try {
          const userQuery = query(
            collection(db, "users"),
            where("userId", "==", location.state.userId)
          );
          const userSnapshot = await getDocs(userQuery);
          const userData = userSnapshot.docs[0].data();

          setUserId(location.state.userId);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [location.state?.userId]);

  const updateGeneralSchedule = () => {
    const updatedSchedule = Array(5).fill({
      horaEntrada,
      horaSortida,
    });
    setDetailedSchedule(updatedSchedule);
  };

  const handleSave = async () => {
    try {
      // Update schedule
      await updateDoc(doc(db, "weeklySchedule", weeklyScheduleId), {
        days: detailedSchedule,
      });

      // Update preferences
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", userId)
      );
      const userSnapshot = await getDocs(userQuery);
      const userDoc = userSnapshot.docs[0];

      await updateDoc(doc(db, "users", userDoc.id), {
        preferences: preferencies,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <Layout className="schedule-layout">
      <Content className="schedule-content">
        <Card className="schedule-card">
          <div className="header">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="link" 
              onClick={() => navigate(-1)}
            />
            <Title level={3}>Editar Horario</Title>
          </div>

          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Horario General" key="1">
              <Form layout="vertical">
                <Form.Item label="Hora de Entrada">
                  <TimePicker
                    value={horaEntrada}
                    onChange={setHoraEntrada}
                    format="HH:mm"
                    className="time-picker"
                  />
                </Form.Item>
                <Form.Item label="Hora de Salida">
                  <TimePicker
                    value={horaSortida}
                    onChange={setHoraSortida}
                    format="HH:mm"
                    className="time-picker"
                  />
                </Form.Item>
                <Button type="primary" block onClick={updateGeneralSchedule}>
                  Aplicar a todos los días
                </Button>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Horario Detallado" key="2">
              {detailedSchedule.map((day, index) => (
                <div key={index} className="day-container">
                  <Typography.Text className="day-title">
                    Dia {index + 1}
                  </Typography.Text>
                  <div className="input-group">
                    <TimePicker
                      value={day.horaEntrada}
                      onChange={(time) => {
                        const updatedSchedule = [...detailedSchedule];
                        updatedSchedule[index] = {
                          ...updatedSchedule[index],
                          horaEntrada: time,
                        };
                        setDetailedSchedule(updatedSchedule);
                      }}
                      format="HH:mm"
                      className="time-input"
                      placeholder="Hora Entrada"
                    />
                    <TimePicker
                      value={day.horaSortida}
                      onChange={(time) => {
                        const updatedSchedule = [...detailedSchedule];
                        updatedSchedule[index] = {
                          ...updatedSchedule[index],
                          horaSortida: time,
                        };
                        setDetailedSchedule(updatedSchedule);
                      }}
                      format="HH:mm"
                      className="time-input"
                      placeholder="Hora Sortida"
                    />
                  </div>
                </div>
              ))}
            </Tabs.TabPane>
          </Tabs>

          <Card title="Preferencias" className="preferences-section">
            <SelectorPreferences
              preferencies={preferencies}
              setPreferencies={setPreferencies}
            />
          </Card>

          <Button 
            type="primary" 
            block 
            size="large" 
            onClick={handleSave}
            className="save-button"
          >
            Guardar Cambios
          </Button>
        </Card>
      </Content>
    </Layout>
  );
};

export default EditSchedule;
