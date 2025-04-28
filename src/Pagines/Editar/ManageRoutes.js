import React, { useState, useEffect } from 'react';
import { Layout, Card, List, Typography, Button, Empty, Spin } from 'antd';
import { EnvironmentOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { auth, db } from '../../FireBase/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import "./ManageRoutes.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const ManageRoutes = ({ navigate }) => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    fetchUserTrips();
  }, []);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      console.log("Fetching trips for user:", auth.currentUser.uid);
      
      const tripsQuery = query(
        collection(db, "trips"),
        where("driverId", "==", auth.currentUser.uid) // Changed from userId to driverId
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

  const calculateRouteDetails = (origin, destination) => {
    // This is a simplified calculation. In a real app, you'd use a routing service
    const R = 6371; // Earth's radius in km
    const lat1 = origin.latitude * Math.PI / 180;
    const lat2 = destination.latitude * Math.PI / 180;
    const lon1 = origin.longitude * Math.PI / 180;
    const lon2 = destination.longitude * Math.PI / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Estimate time (assuming average speed of 50 km/h)
    const time = distance / 50;

    return {
      distance: Math.round(distance),
      time: Math.round(time * 60) // Convert to minutes
    };
  };

  // Add this function at the top of the component
  const getCoordinatesForLocation = (location) => {
    // Temporary hardcoded coordinates for demo
    const coordinates = {
      'Manresa': { latitude: 41.7289, longitude: 1.8267 },
      'Poligon 2': { latitude: 41.7340, longitude: 1.8350 },
      'Poligon 6': { latitude: 41.7380, longitude: 1.8420 }
    };
    return coordinates[location] || { latitude: 41.7289, longitude: 1.8267 }; // Default to Manresa if not found
  };

  if (loading) {
    return (
      <Layout className="routes-layout">
        <Content className="routes-content">
          <Spin size="large" tip="Cargando..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="routes-layout">
      <Content className="routes-content">
        <Card className="routes-card">
          <div className="header">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="link" 
              onClick={() => navigate(-1)}
            />
            <Title level={3}>Mis Viajes</Title>
          </div>

          {trips.length === 0 ? (
            <Empty
              description="No tienes ningún viaje activo"
              className="empty-state"
            />
          ) : (
            <List
              dataSource={trips}
              renderItem={(trip) => {
                const originCoords = getCoordinatesForLocation(trip.from);
                const destCoords = getCoordinatesForLocation(trip.to);
                const routeDetails = calculateRouteDetails(originCoords, destCoords);
                
                return (
                  <Card 
                    className="trip-card"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div className="trip-header">
                      <EnvironmentOutlined className="location-icon" />
                      <div className="trip-info">
                        <Text strong>{trip.from} → {trip.to}</Text>
                        <Text type="secondary">
                          {routeDetails.distance} km · {routeDetails.time} min
                        </Text>
                        <Text type="secondary" className="trip-date">
                          {new Date(trip.date).toLocaleDateString('ca-ES')}
                        </Text>
                      </div>
                    </div>
                  </Card>
                );
              }}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default ManageRoutes;