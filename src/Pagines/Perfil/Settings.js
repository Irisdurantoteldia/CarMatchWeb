import React, { useState } from 'react';
import { Layout, Card, Switch, Button, Typography, Space, Modal } from 'antd';
import { ArrowLeftOutlined, BellOutlined, UserDeleteOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../FireBase/FirebaseConfig';

const { Content } = Layout;
const { Title, Text } = Typography;

const Settings = () => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      Modal.error({
        title: 'Error',
        content: 'No s\'ha pogut tancar la sessió. Torna-ho a provar.'
      });
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Eliminar compte',
      content: 'Estàs segur que vols eliminar el teu compte? Aquesta acció no es pot desfer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancel·lar',
      onOk: async () => {
        try {
          await auth.currentUser.delete();
          navigate('/login');
        } catch (error) {
          Modal.error({
            title: 'Error',
            content: 'No s\'ha pogut eliminar el compte. Torna-ho a provar.'
          });
        }
      }
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#EEF5FF' }}>
      <Content style={{ padding: '40px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <Card
            title={
              <Space>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate(-1)}
                />
                <Title level={3} style={{ margin: 0 }}>Configuració</Title>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card type="inner" title="Notificacions">
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <BellOutlined />
                    <Text>Notificacions push</Text>
                  </Space>
                  <Switch
                    checked={notificationsEnabled}
                    onChange={setNotificationsEnabled}
                  />
                </Space>
              </Card>

              <Card type="inner" title="Compte">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    block
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                  >
                    Tancar sessió
                  </Button>
                  <Button
                    block
                    danger
                    icon={<UserDeleteOutlined />}
                    onClick={handleDeleteAccount}
                  >
                    Eliminar compte
                  </Button>
                </Space>
              </Card>
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Settings;