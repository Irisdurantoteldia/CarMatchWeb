import React, { useState } from 'react';
import { Layout, Card, Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../FireBase/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import './Login.css';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate("/swipes");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-credential":
          setError("Credencials incorrectes. Revisa el correu i la contrasenya.");
          break;
        default:
          setError("Error inesperat. Torna-ho a intentar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="login-layout">
      <Content className="login-content">
        <Card className="login-card">
          <div className="logo-container">
            <img src={require("../../Assets/CarMatch.png")} alt="Logo" className="logo" />
            <Title level={2}>Benvingut a CarMatch!</Title>
          </div>

          {error && <Alert message={error} type="error" showIcon className="error-alert" />}

          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Si us plau, introdueix el teu email' },
                { type: 'email', message: 'Introdueix un email vàlid' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Si us plau, introdueix la teva contrasenya' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Contrasenya" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Iniciar Sessió
              </Button>
            </Form.Item>
          </Form>

          <div className="register-link">
            <Text>No tens compte? </Text>
            <Button type="link" onClick={() => navigate('/signup')}>
              Registra't
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
