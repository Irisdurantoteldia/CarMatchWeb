import React from 'react';
import { Layout, Button, Space, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const { Content } = Layout;

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout className="home-layout">
      <Content className="home-content">
        <div className="home-container">
          <Image
            src={require('../../Assets/CarMatch.png')}
            preview={false}
            className="logo"
          />
          
          <Space direction="vertical" size="large" className="button-container">
            <Button type="primary" size="large" block onClick={() => navigate('/login')}>
              Iniciar Sessió
            </Button>
            <Button type="default" size="large" block onClick={() => navigate('/signup')}>
              Registra't
            </Button>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default Home;
