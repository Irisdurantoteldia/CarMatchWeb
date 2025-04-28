import React, { useState, useEffect } from "react";
import { Layout, Card, Form, Input, Button, Alert, Typography, Spin } from "antd";
import { CarOutlined } from "@ant-design/icons";
import { auth, db } from "../../FireBase/FirebaseConfig";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./ManageVehicle.css";

const { Title } = Typography;
const { Content } = Layout;

const ManageVehicle = ({ navigation }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarInfo();
  }, []);

  const fetchCarInfo = async () => {
    try {
      setLoading(true);
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", auth.currentUser.uid)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        if (userData.carInfo && Array.isArray(userData.carInfo)) {
          const [model, color, seats] = userData.carInfo;
          form.setFieldsValue({
            name: model || "",
            color: color || "",
            seats: seats?.toString() || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching car info:", error);
      Alert.error("No s'ha pogut carregar la informació del vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", auth.currentUser.uid)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const carInfo = [
          values.name,
          values.color,
          parseInt(values.seats) || 0
        ];
        
        await updateDoc(doc(db, "users", userDoc.id), {
          carInfo: carInfo
        });
        Alert.success("Informació del vehicle actualitzada correctament");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating car info:", error);
      Alert.error("No s'ha pogut actualitzar la informació del vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="manage-vehicle-layout">
      <Content className="manage-vehicle-content">
        <Card>
          <Title level={2}>
            <CarOutlined /> Informació del Vehicle
          </Title>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="Carregant..." />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              className="vehicle-form"
            >
              <Form.Item
                label="Nom del Vehicle"
                name="name"
                rules={[{ required: true, message: "Si us plau, introdueix el nom del vehicle" }]}
              >
                <Input placeholder="Ex: Seat Ibiza" />
              </Form.Item>

              <Form.Item
                label="Color"
                name="color"
                rules={[{ required: true, message: "Si us plau, introdueix el color" }]}
              >
                <Input placeholder="Ex: Negre" />
              </Form.Item>

              <Form.Item
                label="Places"
                name="seats"
                rules={[{ required: true, message: "Si us plau, introdueix el número de places" }]}
              >
                <Input type="number" placeholder="Ex: 5" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Guardar Canvis
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default ManageVehicle;