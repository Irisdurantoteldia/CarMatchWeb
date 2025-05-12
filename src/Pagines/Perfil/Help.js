import React from 'react';
import { Layout, Card, Typography, Space, Button, Collapse } from 'antd';
import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Com puc canviar el meu rol de passatger a conductor?",
      answer: "Pots canviar el teu rol anant a 'Editar perfil' i seleccionant el nou rol. Hauràs de proporcionar informació addicional com el tipus de vehicle."
    },
    {
      question: "Com funciona el sistema de coincidències?",
      answer: "El sistema busca altres usuaris amb horaris i rutes similars a les teves. Quan hi ha una coincidència, tots dos usuaris rebreu una notificació."
    },
    {
      question: "Com puc modificar el meu horari?",
      answer: "Ves a 'Editar horari' al menú d'edició. Allà podràs afegir, modificar o eliminar els teus horaris setmanals."
    },
    {
      question: "Què passa si cancel·lo un viatge?",
      answer: "Si necessites cancel·lar un viatge, fes-ho amb la màxima antelació possible. Els altres usuaris rebran una notificació de la cancel·lació."
    },
    {
      question: "Com puc veure les meves rutes guardades?",
      answer: "Pots veure i gestionar les teves rutes guardades a la secció 'Les meves rutes' dins del menú d'edició."
    },
    {
      question: "Com funciona el sistema de valoracions?",
      answer: "Després de cada viatge, tant conductors com passatgers poden valorar l'experiència. Aquestes valoracions ajuden a mantenir la qualitat del servei."
    },
    {
      question: "Com puc contactar amb suport?",
      answer: "Si tens problemes o dubtes que no es resolen aquí, pots contactar amb nosaltres a través del correu support@gmail.com"
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#EEF5FF' }}>
      <Content style={{ padding: '40px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <Card
            title={
              <Space>
                <Title level={3} style={{ margin: 0, justifyContent: 'center' }}>Ajuda</Title>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Paragraph>
                Aquí trobaràs respostes a les preguntes més freqüents. Si no trobes el que busques, pots contactar amb el nostre equip de suport.
              </Paragraph>

              <Collapse
                expandIconPosition="end"
                bordered={false}
                style={{ background: 'white' }}
              >
                {faqs.map((faq, index) => (
                  <Panel
                    key={index}
                    header={
                      <Space>
                        <QuestionCircleOutlined />
                        <Text strong>{faq.question}</Text>
                      </Space>
                    }
                  >
                    <Paragraph style={{ margin: 0 }}>
                      {faq.answer}
                    </Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Help;