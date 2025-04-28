import React, { useState } from 'react';
import { Layout, Card, Steps, Form, Input, Select, Button, Alert, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../../FireBase/FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import './SignUp.css';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const steps = [
    { title: 'Informació Personal', content: 'personal-info' },
    { title: 'Rol i Ubicació', content: 'role-location' },
    { title: 'Vehicle', content: 'vehicle' },
    { title: 'Horari', content: 'schedule' },
    { title: 'Credencials', content: 'credentials' }
  ];

  const handleSignUp = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const weeklyScheduleRef = await addDoc(collection(db, "weeklySchedule"), {
        userId: user.uid,
        days: Array(5).fill({ horaEntrada: values.horaEntrada, horaSortida: values.horaSortida }),
      });

      const userData = {
        userId: user.uid,
        nom: values.name,
        email: values.email,
        location: values.location,
        weeklyScheduleId: weeklyScheduleRef.id,
        activeTrips: [],
        matches: [],
        photo: "",
        role: values.role,
        preferences: values.preferences,
        desti: values.desti,
      };

      if (values.role.toLowerCase() === "conductor") {
        userData.carInfo = [values.carModel, values.carColor, values.carSeats];
      }

      await addDoc(collection(db, "users"), userData);
      navigate("/login");
    } catch (error) {
      setError("Error inesperat. Torna-ho a intentar.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form.Item
            name="name"
            label="Nom"
            rules={[{ required: true, message: 'Si us plau, introdueix el teu nom' }]}
          >
            <Input placeholder="El teu nom" />
          </Form.Item>
        );

      case 1:
        return (
          <>
            <Form.Item
              name="role"
              label="Rol"
              rules={[{ required: true, message: 'Si us plau, selecciona un rol' }]}
            >
              <Select placeholder="Conductor o Passatger">
                <Option value="conductor">Conductor</Option>
                <Option value="passatger">Passatger</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="location"
              label="Ubicació"
              rules={[{ required: true, message: 'Si us plau, introdueix la teva ubicació' }]}
            >
              <Input placeholder="La teva ubicació" />
            </Form.Item>
            <Form.Item
              name="desti"
              label="Destí"
              rules={[{ required: true, message: 'Si us plau, introdueix el teu destí' }]}
            >
              <Input placeholder="El teu destí" />
            </Form.Item>
          </>
        );

      // ... Continua amb la resta de passos ...
    }
  };

  return (
    <Layout className="signup-layout">
      <Content className="signup-content">
        <Card className="signup-card">
          <Title level={2}>Registre</Title>
          
          <Steps current={currentStep} items={steps} className="signup-steps" />

          {error && <Alert message={error} type="error" showIcon className="error-alert" />}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSignUp}
            className="signup-form"
          >
            {renderStepContent()}

            <div className="steps-action">
              {currentStep > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={() => setCurrentStep(currentStep - 1)}>
                  Anterior
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Següent
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  Finalitzar
                </Button>
              )}
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default SignUp;