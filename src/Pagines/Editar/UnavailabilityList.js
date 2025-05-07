import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, List, Tag, Button, Popconfirm, Typography, Alert, Spin, Space, Empty, Row, Col, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import './UnavailabilityList.css';

const { Content } = Layout;
const { Text, Title } = Typography;

const UnavailabilityList = () => {
  const navigate = useNavigate();
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnavailabilities();
  }, []);

  const fetchUnavailabilities = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("No user session found");
      }

      const unavailabilityQuery = query(
        collection(db, "dailyOverride"),
        where("driverId", "==", currentUser.uid)
      );

      const unavailabilitySnapshot = await getDocs(unavailabilityQuery);
      const unavailabilityList = unavailabilitySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate
          ? doc.data().startDate.toDate()
          : new Date(doc.data().startDate),
        endDate: doc.data().endDate?.toDate
          ? doc.data().endDate.toDate()
          : new Date(doc.data().endDate),
      }));

      unavailabilityList.sort((a, b) => b.startDate - a.startDate);
      setUnavailabilities(unavailabilityList);
    } catch (error) {
      console.error("Error fetching unavailabilities:", error);
      message.error("No s'han pogut carregar les indisponibilitats");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnavailability = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "dailyOverride", id));
      setUnavailabilities((prev) => prev.filter((item) => item.id !== id));
      message.success("Indisponibilitat eliminada correctament");
    } catch (error) {
      console.error("Error deleting unavailability:", error);
      message.error("No s'ha pogut eliminar la indisponibilitat");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("ca-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isActive = (item) => {
    const now = new Date();
    return item.endDate >= now;
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#EEF5FF" }}>
      <Content style={{ padding: "48px 0" }}>
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16} xxl={14}>
            <Card
              style={{
                borderRadius: 18,
                boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                padding: 56,
                background: "#fff",
                minHeight: 600,
              }}
              bodyStyle={{ padding: 0 }}
              title={
                <Title level={2} style={{ textAlign: "left", marginBottom: 0 }}>
                  Les meves indisponibilitats
                </Title>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/edit/driver-unavailability')}
                >
                  Nova Indisponibilitat
                </Button>
              }
            >
              <Divider />
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                  <Spin size="large" />
                </div>
              ) : (
                <List
                  dataSource={unavailabilities}
                  renderItem={(item) => {
                    const active = isActive(item);
                    return (
                      <Card
                        style={{ marginBottom: 16 }}
                        bodyStyle={{ padding: 16 }}
                        actions={[
                          <Popconfirm
                            title="Estàs segur que vols eliminar aquesta indisponibilitat?"
                            onConfirm={() => handleDeleteUnavailability(item.id)}
                            okText="Sí"
                            cancelText="No"
                          >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<CalendarOutlined style={{ fontSize: '24px' }} />}
                          title={
                            <Space>
                              <Text>{formatDate(item.startDate)} - {formatDate(item.endDate)}</Text>
                              <Tag color={active ? "processing" : "default"}>
                                {active ? "Activa" : "Finalitzada"}
                              </Tag>
                            </Space>
                          }
                          description={
                            <>
                              <Text strong>Motiu: </Text>
                              <Text>
                                {item.cancelledTrips && item.cancelledTrips.length > 0
                                  ? item.cancelledTrips[0].reason
                                  : "No s'ha especificat"}
                              </Text>
                              <br />
                              <Text strong>Viatges afectats: </Text>
                              <Text>{item.cancelledTrips ? item.cancelledTrips.length : 0}</Text>
                            </>
                          }
                        />
                      </Card>
                    );
                  }}
                  locale={{
                    emptyText: (
                      <Empty
                        description="No tens cap indisponibilitat registrada"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default UnavailabilityList;