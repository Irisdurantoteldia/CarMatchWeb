import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Form, DatePicker, Input, Select, Button, Spin, Row, Col, Typography, message } from 'antd';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import './DriverUnavailability.css';

const { Content } = Layout;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Paragraph } = Typography;

const DriverUnavailability = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [trips, setTrips] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserTrips();
  }, []);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user session found");
      const tripsQuery = query(
        collection(db, "trips"),
        where("driverId", "==", currentUser.uid)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const tripsList = tripsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrips(tripsList);
    } catch (error) {
      message.error("No s'han pogut carregar els viatges");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUnavailability = async (values) => {
    if (selectedTrips.length === 0) {
      message.error("Si us plau, selecciona almenys un viatge");
      return;
    }
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user session found");
      const [startDate, endDate] = values.dateRange;
      const overrideData = {
        notificationUsers: Array.from(new Set(trips
          .filter(trip => selectedTrips.includes(trip.id))
          .flatMap(trip => trip.passengers?.map(p => p.userId) || [])
        )),
        cancelledTrips: selectedTrips.map((tripId) => ({
          tripId,
          endDate: endDate.toDate(),
          reason: values.reason,
          userId: currentUser.uid,
        })),
        createdAt: new Date(),
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        driverId: currentUser.uid,
      };
      await addDoc(collection(db, "dailyOverride"), overrideData);
      message.success("S'ha registrat la indisponibilitat correctament");
      navigate('/edit/unavailability-list');
    } catch (error) {
      message.error("No s'ha pogut guardar la indisponibilitat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#EEF5FF" }}>
      <Content style={{ padding: "40px 0" }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12} xl={10}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                padding: 32,
                background: "#fff",
              }}
              title={
                <Title level={3} style={{ marginBottom: 0, textAlign: "center" }}>
                  Registrar indisponibilitat
                </Title>
              }
            >
              <Paragraph style={{ textAlign: "center", color: "#888", marginBottom: 32 }}>
                Indica el període i motiu de la teva indisponibilitat i selecciona els viatges afectats.
              </Paragraph>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveUnavailability}
                >
                  <Form.Item
                    name="dateRange"
                    label="Període d'indisponibilitat"
                    rules={[{ required: true, message: 'Si us plau, selecciona les dates' }]}
                  >
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="reason"
                    label="Motiu"
                    rules={[{ required: true, message: 'Si us plau, indica el motiu' }]}
                  >
                    <TextArea rows={3} placeholder="Indica el motiu de la indisponibilitat" />
                  </Form.Item>
                  <Form.Item
                    name="trips"
                    label="Viatges afectats"
                    rules={[{ required: true, message: 'Si us plau, selecciona almenys un viatge' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Selecciona els viatges afectats"
                      onChange={setSelectedTrips}
                      style={{ width: '100%' }}
                    >
                      {trips.map(trip => (
                        <Select.Option key={trip.id} value={trip.id}>
                          {`${trip.from} → ${trip.to} (${new Date(trip.date).toLocaleDateString('ca-ES')})`}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      Guardar indisponibilitat
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default DriverUnavailability;
