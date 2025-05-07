import React, { useState, useEffect } from "react";
import { Layout, Card, Form, Select, Switch, Button, Input, message, Spin, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../FireBase/FirebaseConfig";
import { doc, getDoc, updateDoc, query, collection, getDocs, where } from "firebase/firestore";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const musicOptions = [
  { label: "Cap preferència", value: "none" },
  { label: "Música alta", value: "loud" },
  { label: "Música suau", value: "soft" },
  { label: "Sense música", value: "no_music" },
];

const talkOptions = [
  { label: "Cap preferència", value: "none" },
  { label: "M'agrada parlar", value: "talk" },
  { label: "Prefereixo silenci", value: "silent" },
];

const tempOptions = [
  { label: "Cap preferència", value: "none" },
  { label: "Fresc", value: "cool" },
  { label: "Càlid", value: "warm" },
];

const smokeOptions = [
  { label: "No m'importa", value: "none" },
  { label: "Prefereixo no fumar", value: "no" },
  { label: "Accepto fumadors", value: "yes" },
];

const carTypeOptions = [
  { label: "Cap preferència", value: "none" },
  { label: "Cotxe petit", value: "small" },
  { label: "Cotxe gran", value: "big" },
  { label: "SUV", value: "suv" },
  { label: "Elèctric", value: "electric" },
];

const TravelPreferences = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          message.error("Sessió d'usuari no trobada");
          navigate("/login");
          return;
        }
        const usersQuery = query(
          collection(db, "users"),
          where("userId", "==", user.uid)
        );
        const userSnapshot = await getDocs(usersQuery);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const prefs = userDoc.data().travelPreferences || {};
          form.setFieldsValue({
            music: prefs.music || "none",
            talk: prefs.talk || "none",
            temperature: prefs.temperature || "none",
            pets: prefs.pets || false,
            smoke: prefs.smoke || "none",
            carType: prefs.carType || "none",
            notes: prefs.notes || "",
          });
        }
      } catch (err) {
        message.error("No s'han pogut carregar les preferències");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
    // eslint-disable-next-line
  }, []);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        message.error("Sessió d'usuari no trobada");
        return;
      }
      const usersQuery = query(
        collection(db, "users"),
        where("userId", "==", user.uid)
      );
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userRef = doc(db, "users", userDoc.id);
        await updateDoc(userRef, {
          travelPreferences: values,
        });
        message.success("Preferències de viatge actualitzades correctament!");
      } else {
        message.error("No s'ha trobat el document d'usuari.");
      }
    } catch (err) {
      message.error("Error al guardar les preferències");
    } finally {
      setSaving(false);
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
            >
              <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
                Preferències de viatge
              </Title>
              <Paragraph style={{ textAlign: "center", color: "#888", marginBottom: 32 }}>
                Personalitza la teva experiència de viatge segons les teves preferències.
              </Paragraph>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    music: "none",
                    talk: "none",
                    temperature: "none",
                    pets: false,
                    smoke: "none",
                    carType: "none",
                    notes: "",
                  }}
                >
                  <Form.Item label="Música" name="music">
                    <Select options={musicOptions} size="large" />
                  </Form.Item>
                  <Form.Item label="Conversar durant el viatge" name="talk">
                    <Select options={talkOptions} size="large" />
                  </Form.Item>
                  <Form.Item label="Temperatura preferida" name="temperature">
                    <Select options={tempOptions} size="large" />
                  </Form.Item>
                  <Form.Item label="Accepto animals de companyia" name="pets" valuePropName="checked">
                    <Switch checkedChildren="Sí" unCheckedChildren="No" />
                  </Form.Item>
                  <Form.Item label="Preferència de fumadors" name="smoke">
                    <Select options={smokeOptions} size="large" />
                  </Form.Item>
                  <Form.Item label="Tipus de cotxe preferit" name="carType">
                    <Select options={carTypeOptions} size="large" />
                  </Form.Item>
                  <Form.Item label="Notes addicionals" name="notes">
                    <Input.TextArea rows={3} placeholder="Altres preferències o comentaris" />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      block
                      size="large"
                      style={{ marginTop: 16 }}
                    >
                      Guardar preferències
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

export default TravelPreferences;
