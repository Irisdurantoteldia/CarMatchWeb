import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, DatePicker, Input, Select, Button, Alert, Spin } from 'antd';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import './DriverUnavailability.css';

const { Content } = Layout;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const DriverUnavailability = ({ navigate }) => {
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

      if (!currentUser) {
        throw new Error("No user session found");
      }

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
      console.error("Error fetching trips:", error);
      Alert.error("No s'han pogut carregar els viatges");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUnavailability = async (values) => {
    if (selectedTrips.length === 0) {
      Alert.error("Si us plau, selecciona almenys un viatge");
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("No user session found");
      }

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

      // Create notifications
      const notifications = overrideData.notificationUsers.map(userId => ({
        userId,
        type: "driver_unavailability",
        title: "Conductor no disponible",
        message: `El conductor no estarà disponible del ${startDate.format('DD/MM/YYYY')} al ${endDate.format('DD/MM/YYYY')}. Motiu: ${values.reason}`,
        createdAt: new Date(),
        read: false,
        tripIds: selectedTrips
      }));

      await Promise.all(
        notifications.map(notification => 
          addDoc(collection(db, "notifications"), notification)
        )
      );

      Alert.success("S'ha registrat la indisponibilitat correctament");
      navigate(-1);
    } catch (error) {
      console.error("Error saving unavailability:", error);
      Alert.error("No s'ha pogut guardar la indisponibilitat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="driver-unavailability">
      <Content className="driver-unavailability-content">
        <Card title="Registrar Indisponibilitat">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="Carregant..." />
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
                <TextArea rows={4} placeholder="Indica el motiu de la indisponibilitat" />
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
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Guardar
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default DriverUnavailability;
