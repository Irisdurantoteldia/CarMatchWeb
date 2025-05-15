import React, { useState, useEffect } from 'react';
import { Layout, Card, List, Typography, Button, Empty, Spin, Row, Col, Tag, Space, Modal, Alert, Popconfirm } from 'antd';
import { EnvironmentOutlined, ArrowLeftOutlined, CarOutlined, CalendarOutlined, UserOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { auth, db } from '../../FireBase/FirebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, writeBatch } from 'firebase/firestore';
import "./ManageRoutes.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const ManageRoutes = ({ navigate }) => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    fetchUserTrips();
  }, []);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      console.log("Fetching trips for user:", auth.currentUser.uid);
      
      const tripsQuery = query(
        collection(db, "trips"),
        where("driverId", "==", auth.currentUser.uid)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      
      const userTrips = [];
      tripsSnapshot.forEach((doc) => {
        const tripData = doc.data();
        console.log("Trip found:", tripData);
        userTrips.push({ id: doc.id, ...tripData });
      });
      
      console.log("Total trips found:", userTrips.length);
      setTrips(userTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCoordinatesForLocation = (location) => {
    const coordinates = {
      'Igualada': { latitude: 41.5786, longitude: 1.6172 },
      'Manresa': { latitude: 41.7289, longitude: 1.8267 },
      'Santpedor': { latitude: 41.7833, longitude: 1.8333 },
      'poligon_riu_dor': { latitude: 41.7312, longitude: 1.8397 },
      'poligon_llobregat': { latitude: 41.7345, longitude: 1.8412 },
      'poligon_santaanna': { latitude: 41.7367, longitude: 1.8434 },
      'poligon_santisidre': { latitude: 41.7389, longitude: 1.8456 },
      'poligon_laserreta': { latitude: 41.7401, longitude: 1.8478 },
      'poligon_labobila': { latitude: 41.7423, longitude: 1.8501 },
      'poligon_elgrau': { latitude: 41.7445, longitude: 1.8523 },
      'poligon_carretera_berga': { latitude: 41.7467, longitude: 1.8545 },
      'poligon_carretera_dartes': { latitude: 41.7489, longitude: 1.8567 }
    };

    const result = coordinates[location];
    if (!result) {
      console.warn(`Ubicació no trobada: ${location}, utilitzant Manresa com a predeterminat`);
      return coordinates['Manresa'];
    }
    return result;
  };

  const calculateRouteDetails = (from, to) => {
    // Distàncies predefinides més precises (en km)
    const routeDistances = {
      'Igualada-Manresa': 33,
      'Manresa-Igualada': 33,
      'Manresa-Poligon 1': 2.5,
      'Poligon 1-Manresa': 2.5,
      'Manresa-Poligon 2': 3.2,
      'Poligon 2-Manresa': 3.2,
      'Manresa-Poligon 3': 3.8,
      'Poligon 3-Manresa': 3.8,
      'Manresa-Poligon 4': 4.2,
      'Poligon 4-Manresa': 4.2,
      'Manresa-Poligon 5': 4.8,
      'Poligon 5-Manresa': 4.8,
      'Manresa-Poligon 6': 5.5,
      'Poligon 6-Manresa': 5.5,
      'Igualada-Poligon 1': 34.5,
      'Poligon 1-Igualada': 34.5,
      'Igualada-Poligon 2': 35.2,
      'Poligon 2-Igualada': 35.2,
      'Igualada-Poligon 3': 35.8,
      'Poligon 3-Igualada': 35.8,
      'Igualada-Poligon 4': 36.2,
      'Poligon 4-Igualada': 36.2,
      'Igualada-Poligon 5': 36.8,
      'Poligon 5-Igualada': 36.8,
      'Igualada-Poligon 6': 37.5,
      'Poligon 6-Igualada': 37.5
    };

    // Buscar la ruta en ambdues direccions
    const routeKey = `${from}-${to}`;
    const reverseRouteKey = `${to}-${from}`;
    
    // Obtenir la distància (intentar ambdues direccions)
    let distance = routeDistances[routeKey] || routeDistances[reverseRouteKey];

    // Si no trobem la distància predefinida, calcular aproximada
    if (!distance) {
      console.warn(`No s'ha trobat distància predefinida per la ruta: ${routeKey}`);
      
      // Obtenir coordenades
      const originCoords = getCoordinatesForLocation(from);
      const destCoords = getCoordinatesForLocation(to);
      
      // Calcular distància utilitzant la fórmula de Haversine
      const R = 6371; // Radi de la Terra en km
      const lat1 = originCoords.latitude * Math.PI / 180;
      const lat2 = destCoords.latitude * Math.PI / 180;
      const dLat = (destCoords.latitude - originCoords.latitude) * Math.PI / 180;
      const dLon = (destCoords.longitude - originCoords.longitude) * Math.PI / 180;

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c;
      
      // Ajustar per rutes reals (factor de correcció de 1.3 per rutes no directes)
      distance = Math.round(distance * 1.3);
    }

    // Calcular temps basat en velocitat mitjana de 60 km/h
    const time = Math.round((distance / 60) * 60);

    return {
      distance: distance,
      time: time
    };
  };

  const handleViewMap = (trip) => {
    setSelectedTrip(trip);
    setMapVisible(true);
  };

  const handleCancelTrip = async (tripId) => {
    Modal.confirm({
      title: "Cancel·lar viatge",
      content: "Estàs segur que vols cancel·lar aquest viatge? Això eliminarà el viatge per a tots els passatgers.",
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // Obtenim la informació del viatge abans d'eliminar-lo
          const tripRef = doc(db, "trips", tripId);
          const tripSnapshot = await getDoc(tripRef);
          
          if (!tripSnapshot.exists()) {
            Modal.error({
              title: "Error",
              content: "No s'ha trobat el viatge"
            });
            return;
          }

          const tripData = tripSnapshot.data();
          
          // Creem les notificacions per a cada passatger
          const batch = writeBatch(db);
          
          for (const passengerId of tripData.passengersId || []) {
            const notificationRef = doc(collection(db, "notifications"));
            batch.set(notificationRef, {
              userId: passengerId,
              type: "trip_cancelled",
              title: "Viatge Cancel·lat",
              message: `El viatge de ${tripData.from} a ${tripData.to} del ${new Date(tripData.date).toLocaleDateString('ca-ES')} ha estat cancel·lat pel conductor.`,
              date: new Date(),
              read: false,
              tripId: tripId
            });
          }

          // Eliminem el viatge i creem les notificacions en una sola operació
          batch.delete(tripRef);
          await batch.commit();

          setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
          
          Modal.success({
            title: "Èxit",
            content: "Viatge cancel·lat correctament i s'han notificat els passatgers"
          });
        } catch (error) {
          console.error("Error cancel·lant el viatge:", error);
          Modal.error({
            title: "Error",
            content: "No s'ha pogut cancel·lar el viatge"
          });
        }
      }
    });
  };

  // Component per mostrar el mapa
  const RouteMap = () => {
    if (!selectedTrip) return null;
    
    const originCoords = getCoordinatesForLocation(selectedTrip.from);
    const destCoords = getCoordinatesForLocation(selectedTrip.to);
    
    return (
      <Modal
        title={`Ruta: ${selectedTrip.from} → ${selectedTrip.to}`}
        open={mapVisible}
        onCancel={() => setMapVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ height: 500, padding: 0 }}
      >
        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-details">
              <div className="map-marker origin">
                <EnvironmentOutlined />
                <Text strong>{selectedTrip.from}</Text>
              </div>
              <div className="map-route-line"></div>
              <div className="map-marker destination">
                <EnvironmentOutlined />
                <Text strong>{selectedTrip.to}</Text>
              </div>
              
              <div className="map-stats">
                {(() => {
                  const details = calculateRouteDetails(selectedTrip.from, selectedTrip.to);
                  return (
                    <>
                      <Tag color="blue" icon={<CarOutlined />}>{details.distance} km</Tag>
                      <Tag color="green" icon={<ClockCircleOutlined />}>{details.time} min</Tag>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <Layout className="routes-layout">
        <Content className="routes-content">
          <Card
            className="routes-card loading-card"
            title={
              <div className="page-header">
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="link"
                  className="back-button"
                  onClick={() => window.history.back()}
                />
                <Title level={2} className="page-title">Les meves rutes</Title>
              </div>
            }
          >
            <div className="loading-container">
              <Spin size="large" />
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="routes-layout">
      <Content className="routes-content">
        <Card
          className="routes-card main-card"
          title={
            <div className="page-header">
              <Button
                icon={<ArrowLeftOutlined />}
                type="link"
                className="back-button"
                onClick={() => window.history.back()}
              />
              <Title level={2} className="page-title">Les meves rutes</Title>
            </div>
          }
        >
          {trips.length === 0 ? (
            <Empty 
              className="empty-state"
              description="No tens cap ruta guardada"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              className="trips-list"
              dataSource={trips}
              renderItem={trip => {
                const routeDetails = calculateRouteDetails(trip.from, trip.to);
                return (
                  <Card
                    className="trip-card"
                    hoverable
                  >
                    <div className="trip-content">
                      <div className="trip-icon">
                        <CarOutlined />
                      </div>
                      <div className="trip-details">
                        <div className="trip-route">
                          <Text strong className="location">{trip.from}</Text>
                          <div className="route-arrow">→</div>
                          <Text strong className="location">{trip.to}</Text>
                        </div>
                        
                        <div className="trip-meta">
                          <div className="meta-item">
                            <CalendarOutlined />
                            <Text className="meta-text">
                              {trip.date ? new Date(trip.date).toLocaleDateString('ca-ES') : "Data no disponible"}
                            </Text>
                          </div>
                          
                          <div className="meta-item">
                            <ClockCircleOutlined />
                            <Text className="meta-text">{routeDetails.distance} km · {routeDetails.time} min</Text>
                          </div>
                          
                          {trip.seats && (
                            <div className="meta-item">
                              <UserOutlined />
                              <Text className="meta-text">{trip.seats} places</Text>
                            </div>
                          )}
                        </div>
                        
                        <div className="trip-actions">
                          <Button 
                            type="primary" 
                            onClick={() => handleViewMap(trip)}
                            icon={<EnvironmentOutlined />}
                          >
                            Veure mapa
                          </Button>
                          
                          <Popconfirm
                            title="Cancel·lar viatge"
                            description="Segur que vols cancel·lar aquesta ruta?"
                            onConfirm={() => handleCancelTrip(trip.id)}
                            okText="Sí"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                          >
                            <Button 
                              danger
                              icon={<CloseCircleOutlined />}
                            >
                              Cancel·lar
                            </Button>
                          </Popconfirm>
                        </div>
                        
                        <Tag className="status-tag" color={trip.status === 'Completada' ? 'blue' : 'green'}>
                          {trip.status || "Actiu"}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                );
              }}
            />
          )}
        </Card>
      </Content>
      <RouteMap />
    </Layout>
  );
};

export default ManageRoutes;