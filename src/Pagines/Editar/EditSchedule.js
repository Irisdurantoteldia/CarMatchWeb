import React, { useState, useEffect } from "react";
import { Layout, Card, TimePicker, Button, Typography, Tabs, Form, Spin, Input, Row, Col, message } from "antd";
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, query, where, getDocs, collection, updateDoc } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import { ArrowLeftOutlined } from '@ant-design/icons';
import SelectorPreferences from "../../Selectors/SelectorPreferences";
import moment from 'moment';
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

  const fetchUserSchedule = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const scheduleQuery = query(
        collection(db, "weeklySchedule"),
        where("userId", "==", currentUser.uid)
      );
      const scheduleSnapshot = await getDocs(scheduleQuery);
      
      if (!scheduleSnapshot.empty) {
        const scheduleData = scheduleSnapshot.docs[0].data();
        setWeeklyScheduleId(scheduleSnapshot.docs[0].id);
        
        if (scheduleData.days) {
          const scheduleArray = scheduleData.days.map(day => ({
            horaEntrada: day.horaEntrada ? moment(day.horaEntrada, 'HH:mm') : null,
            horaSortida: day.horaSortida ? moment(day.horaSortida, 'HH:mm') : null
          }));
          setDetailedSchedule(scheduleArray);

          const horaEntradaMesComu = trobaMesComu(scheduleData.days.map(d => d.horaEntrada));
          const horaSortidaMesComu = trobaMesComu(scheduleData.days.map(d => d.horaSortida));

          setHoraEntrada(horaEntradaMesComu ? moment(horaEntradaMesComu, 'HH:mm') : null);
          setHoraSortida(horaSortidaMesComu ? moment(horaSortidaMesComu, 'HH:mm') : null);
        }
      }

      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", currentUser.uid)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setPreferencies(userData.preferences || "");
        setUserId(currentUser.uid);
      }

    } catch (error) {
      console.error("Error carregant l'horari:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSchedule();
  }, []);

  // Funció auxiliar per trobar el valor més comú en un array
  const trobaMesComu = (arr) => {
    if (!arr || arr.length === 0) return null;
    
    const frequency = {};
    let maxFreq = 0;
    let maxValue = arr[0];

    arr.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        maxValue = value;
      }
    });

    return maxValue;
  };

  const updateGeneralSchedule = () => {
    const updatedSchedule = Array(5).fill({
      horaEntrada,
      horaSortida,
    });
    setDetailedSchedule(updatedSchedule);
  };

  const handleSave = async () => {
    try {
      // Convert Moment objects to string format before saving
      const formattedSchedule = detailedSchedule.map(day => ({
        horaEntrada: day.horaEntrada ? day.horaEntrada.format('HH:mm') : null,
        horaSortida: day.horaSortida ? day.horaSortida.format('HH:mm') : null
      }));

      // Update schedule with formatted times
      await updateDoc(doc(db, "weeklySchedule", weeklyScheduleId), {
        days: formattedSchedule,
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

      message.success("Els canvis s'han guardat correctament!");
      
      // Recarregar les dades
      await fetchUserSchedule();
    } catch (error) {
      console.error("Error saving changes:", error);
      message.error("Hi ha hagut un error guardant els canvis");
    }
  };

  return (
    <Layout className="schedule-layout">
      <Content className="schedule-content">
        <Card className="schedule-card">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <Text>Carregant horari...</Text>
            </div>
          ) : (
            <>
              <div className="header">
                <Title level={3}>Editar Horari</Title>
              </div>

              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Horari General" key="1">
                  <Form layout="vertical">
                    <Form.Item label="Hora d'Entrada">
                      <TimePicker
                        value={horaEntrada}
                        onChange={setHoraEntrada}
                        format="HH:mm"
                        className="time-picker"
                      />
                    </Form.Item>
                    <Form.Item label="Hora de Sortida">
                      <TimePicker
                        value={horaSortida}
                        onChange={setHoraSortida}
                        format="HH:mm"
                        className="time-picker"
                      />
                    </Form.Item>
                    <Button type="primary" block onClick={updateGeneralSchedule}>
                      Aplicar a tots els dies
                    </Button>
                  </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Horari Detallat" key="2">
                  {detailedSchedule.map((day, index) => (
                    <div key={index} className="day-container">
                      <Typography.Text className="day-title">
                        {['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres'][index]}
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
                Guardar Canvis
              </Button>
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default EditSchedule;
