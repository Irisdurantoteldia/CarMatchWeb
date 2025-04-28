import React, { useState, useEffect } from 'react';
import { Layout, Card, List, Tag, Button, Popconfirm, Typography, Alert, Spin, Space, Empty } from "antd";
import { PlusOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import './UnavailabilityList.css';

const { Content } = Layout;
const { Text, Title } = Typography;

const UnavailabilityList = ({ navigate }) => {
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
      Alert.error("No s'han pogut carregar les indisponibilitats");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnavailability = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "dailyOverride", id));
      setUnavailabilities((prev) => prev.filter((item) => item.id !== id));
      Alert.success("Indisponibilitat eliminada correctament");
    } catch (error) {
      console.error("Error deleting unavailability:", error);
      Alert.error("No s'ha pogut eliminar la indisponibilitat");
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
    <Layout className="unavailability-list">
      <Content className="unavailability-content">
        <Card
          title="Les meves indisponibilitats"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/driver-unavailability')}
            >
              Nova Indisponibilitat
            </Button>
          }
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="Carregant..." />
            </div>
          ) : (
            <List
              dataSource={unavailabilities}
              renderItem={(item) => {
                const active = isActive(item);
                return (
                  <List.Item
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
                  </List.Item>
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
      </Content>
    </Layout>
  );
};

export default UnavailabilityList;