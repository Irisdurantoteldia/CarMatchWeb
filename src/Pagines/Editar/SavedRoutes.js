import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Typography, Button, Popconfirm, Empty, Spin, message, Row, Col, Badge, Space, Divider, Tooltip } from 'antd';
import { CarOutlined, CloseCircleOutlined, ArrowLeftOutlined, CalendarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../FireBase/FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
import './SavedRoutes.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const SavedRoutes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [expandedDriverInfo, setExpandedDriverInfo] = useState({});

  useEffect(() => {
    fetchUserTrips();
    // eslint-disable-next-line
  }, []);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        message.error("Sessió d'usuari no trobada");
        return;
      }

      // Obtenir només els viatges on l'usuari és passatger i el conductor és una altra persona
      const tripsQuery = query(
        collection(db, "trips"),
        where("passengersId", "array-contains", currentUser.uid)
      );
      const tripsSnapshot = await getDocs(tripsQuery);

      const allTrips = tripsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          key: doc.id,
          role: 'passatger'
        }))
        .filter(trip => trip.driverId !== currentUser.uid);

      // Ordenar per data
      const sortedTrips = allTrips.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });

      console.log('Viatges trobats:', sortedTrips.length);
      console.log('Detalls dels viatges:', sortedTrips);

      setTrips(sortedTrips);
    } catch (error) {
      console.error("Error cercant viatges:", error);
      message.error("Error carregant els viatges");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverInfo = async (driverId) => {
    if (!driverId) return null;
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("userId", "==", driverId)
      );
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        
        // Calcular places disponibles
        const totalPlaces = parseInt(userData.carInfo?.[2]) || 0;
        const activeTrips = userData.activeTrips?.length || 0;
        const availablePlaces = totalPlaces - activeTrips;
        
        return {
          ...userData,
          availablePlaces: availablePlaces > 0 ? availablePlaces : 0
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching driver info:", error);
      return null;
    }
  };

  const handleCancelTrip = async (tripId) => {
    try {
      const tripRef = doc(db, "trips", tripId);
      const tripDoc = await getDoc(tripRef);

      if (!tripDoc.exists()) {
        message.error("No s'ha trobat el viatge");
        return;
      }

      const tripData = tripDoc.data();
      const updatedPassengers = tripData.passengersId.filter(
        id => id !== auth.currentUser.uid
      );

      // Crear notificació pel conductor
      const notificationRef = doc(collection(db, "notifications"));
      const batch = writeBatch(db);

      batch.set(notificationRef, {
        userId: tripData.driverId,
        type: "passenger_cancelled",
        title: "Passatger ha cancel·lat",
        message: `Un passatger s'ha donat de baixa del viatge de ${tripData.from} a ${tripData.to} del ${new Date(tripData.date).toLocaleDateString('ca-ES')}`,
        date: new Date(),
        read: false,
        tripId: tripId
      });

      // Actualitzar passatgers
      batch.update(tripRef, {
        passengersId: updatedPassengers
      });

      await batch.commit();

      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
      message.success("T'has donat de baixa del viatge correctament");
    } catch (error) {
      console.error("Error cancel·lant el viatge:", error);
      message.error("No s'ha pogut cancel·lar el viatge");
    }
  };

  const columns = [
    {
      title: 'Ruta',
      dataIndex: 'route',
      key: 'route',
      render: (_, record) => {
        const getLocationName = (locationId) => {
          const locations = {
            'poligon_riu_dor': 'Polígon industrial Riu d\'Or - Casa Nova',
            'poligon_llobregat': 'Polígon industrial Llobregat - Torroella',
            'poligon_santaanna': 'Polígon industrial Santa Anna',
            'poligon_santisidre': 'Polígon industrial Sant Isidre',
            'poligon_laserreta': 'Polígon industrial La Serreta',
            'poligon_labobila': 'Polígon industrial La Bòbila',
            'poligon_elgrau': 'Polígon industrial El Grau',
            'poligon_carretera_berga': 'Polígon industrial Carretera de Berga',
            'poligon_carretera_dartes': 'Polígon Carretera d\'Artés'
          };
          return locations[locationId] || locationId;
        };
        
        return (
          <div className="route-info">
            <div className="route-horizontal">
              <div className="location">
                <EnvironmentOutlined className="location-icon" />
                <Text strong>{getLocationName(record.from)}</Text>
              </div>
              <div className="route-arrow">
                <div className="arrow-line"></div>
                <div className="arrow-point"></div>
              </div>
              <div className="location">
                <EnvironmentOutlined className="location-icon" />
                <Text strong>{getLocationName(record.to)}</Text>
              </div>
            </div>
          </div>
        );
      },
      width: 400,
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <div className="date-info">
          <CalendarOutlined className="info-icon" />
          <Text>{new Date(date).toLocaleDateString('ca-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </div>
      ),
    },
    {
      title: 'Conductor',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (driverInfo) => (
        <div className="driver-info">
          <UserOutlined className="info-icon" />
          <Text>{driverInfo?.nom || "No especificat"}</Text>
        </div>
      ),
    },
    {
      title: 'Estat',
      key: 'status',
      width: 50,
      align: 'center',
      render: (_, record) => {
        const tripDate = new Date(record.date);
        const today = new Date();
        
        let status = {
          color: '#d9d9d9', // gris per defecte
          tooltip: 'Programat'
        };
        
        if (tripDate < today) {
          status = {
            color: '#52c41a', // verd
            tooltip: 'Viatge realitzat'
          };
        } else if (tripDate.getDate() === today.getDate() && 
                  tripDate.getMonth() === today.getMonth() && 
                  tripDate.getFullYear() === today.getFullYear()) {
          status = {
            color: '#1890ff', // blau
            tooltip: 'Viatge d\'avui'
          };
        }
        
        return (
          <Tooltip title={status.tooltip}>
            <div className="status-dot" style={{ backgroundColor: status.color }} />
          </Tooltip>
        );
      },
    },
    {
      title: 'Places disponibles',
      key: 'availablePlaces',
      render: (_, record) => {
        const driverInfo = expandedDriverInfo[record.driverId];
        if (!driverInfo) {
          // Carregar la informació si no està disponible
          fetchDriverInfo(record.driverId).then(info => {
            if (info) {
              setExpandedDriverInfo(prev => ({
                ...prev,
                [record.driverId]: info
              }));
            }
          });
          return null;
        }
        return (
          <div className="places-info">
            <Text>
              {driverInfo.availablePlaces} de {driverInfo.carInfo[2]} places
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Accions',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Estàs segur que vols cancel·lar aquest viatge?"
          onConfirm={() => handleCancelTrip(record.id)}
          okText="Sí"
          cancelText="No"
        >
          <Button 
            danger 
            icon={<CloseCircleOutlined />}
            className="cancel-button"
          >
            Cancel·lar
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout className="saved-routes-layout">
      <Content className="saved-routes-content">
        <Row justify="space-between" align="middle" className="page-header">
          <Col>
            <Title level={2} className="page-title">Els meus viatges</Title>
          </Col>
        </Row>

        <Card className="trips-card">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="Carregant..." />
            </div>
          ) : trips.length === 0 ? (
            <Empty 
              description={
                <div className="empty-description">
                  <Text>No tens cap viatge reservat</Text>
                </div>
              }
              className="empty-container"
            />
          ) : (
            <Table 
              dataSource={trips} 
              columns={columns} 
              pagination={false}
              className="trips-table"
              rowClassName="trip-row"
              expandable={{
                expandedRowRender: record => {
                  const driverInfo = expandedDriverInfo[record.driverId];
                  if (!driverInfo) {
                    // Carregar la informació si no està disponible
                    fetchDriverInfo(record.driverId).then(info => {
                      if (info) {
                        setExpandedDriverInfo(prev => ({
                          ...prev,
                          [record.driverId]: info
                        }));
                      }
                    });
                    return (
                      <div className="loading-container">
                        <Spin size="large" tip="Carregant informació..." />
                      </div>
                    );
                  }
                  return (
                    <div className="expanded-row-content">
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <Card title="Detalls del viatge" className="details-card">
                            <div>
                              <p>
                                <b>Hora de sortida:</b>{" "}
                                {record.departureTime
                                  ? record.departureTime
                                  : record.date
                                  ? new Date(record.date).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })
                                  : <span style={{ color: "#888" }}>No especificada</span>}
                              </p>
                              <p>
                                <b>Places disponibles:</b>{" "}
                                {driverInfo.availablePlaces} de {driverInfo.carInfo[2]} places
                              </p>
                            </div>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card title="Informació del conductor" className="details-card">
                            <p><strong>Nom:</strong> {driverInfo.nom || "No especificat"}</p>
                            <p><strong>Vehicle:</strong> {driverInfo.carInfo ? `${driverInfo.carInfo[0]} ${driverInfo.carInfo[1]}` : "No especificat"}</p>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  );
                },
                onExpand: async (expanded, record) => {
                  if (expanded && record.driverId && !expandedDriverInfo[record.driverId]) {
                    const info = await fetchDriverInfo(record.driverId);
                    if (info) {
                      setExpandedDriverInfo(prev => ({
                        ...prev,
                        [record.driverId]: info
                      }));
                    }
                  }
                },
                rowExpandable: record => true,
              }}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default SavedRoutes;