import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Button, Space, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Eula.css';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const Eula = () => {
  const [showEULA, setShowEULA] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEULA(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout className="eula-layout">
      <Content className="eula-content">
        {!showEULA ? (
          <div className="logo-container">
            <Spin size="large" />
            <img src={require('../../Assets/CarMatch.png')} alt="Logo" className="logo" />
          </div>
        ) : (
          <Card className="eula-card">
            <Title level={2}>
              Benvingut a <span className="title-red">CarJob</span>!
            </Title>
            
            <Title level={4}>Termes i condicions:</Title>
            
            <div className="terms-content">
              <Paragraph>
                En utilitzar aquesta aplicació, acceptes els següents termes i condicions:
              </Paragraph>

              <Space direction="vertical" size="middle">
                <div>
                  <Text strong>1. Acceptació dels termes:</Text>
                  <Paragraph>
                    L'ús de CarJob constitueix la teva acceptació de tots els termes, condicions i avisos.
                  </Paragraph>
                </div>

                <div>
                  <Text strong>2. Responsabilitats de l'usuari:</Text>
                  <Paragraph>
                    Ets responsable de les teves accions i de qualsevol contingut que comparteixis.
                  </Paragraph>
                </div>

                <div>
                  <Text strong>3. Política de privacitat:</Text>
                  <Paragraph>
                    No es guarden dades personals sensibles ni informació de localització.
                  </Paragraph>
                </div>

                <div>
                  <Text strong>4. Limitació de responsabilitat:</Text>
                  <Paragraph>
                    L'empresa no es fa responsable de cap transacció, incident o dany que es produeixi mentre s'utilitza l'aplicació.
                  </Paragraph>
                </div>

                <div>
                  <Text strong>5. Terminació:</Text>
                  <Paragraph>
                    La violació d'aquests termes pot resultar en la suspensió o terminació del teu compte.
                  </Paragraph>
                </div>
              </Space>

              <Paragraph className="final-note">
                Si no estàs d'acord amb cap d'aquests termes, si us plau, deixa d'utilitzar l'aplicació.
              </Paragraph>
            </div>

            <Button type="primary" block size="large" onClick={() => navigate('/home')}>
              Acceptar
            </Button>
          </Card>
        )}
      </Content>
    </Layout>
  );
};



export default Eula;
