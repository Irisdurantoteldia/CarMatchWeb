"use client";

import { Tag } from "antd";
import {
  EnvironmentOutlined,
  CarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import UserSchedule from "./UserSchedule";

const SwipeCard = ({ user, detailedView, onToggleDetailedView }) => {
  const getLocationName = (locationId) => {
    const locations = {
      'poligon_riu_dor': "Polígon industrial Riu d'Or - Casa Nova",
      'poligon_llobregat': 'Polígon industrial Llobregat - Torroella',
      'poligon_santaanna': 'Polígon industrial Santa Anna',
      'poligon_santisidre': 'Polígon industrial Sant Isidre',
      'poligon_laserreta': 'Polígon industrial La Serreta',
      'poligon_labobila': 'Polígon industrial La Bòbila',
      'poligon_elgrau': 'Polígon industrial El Grau',
      'poligon_carretera_berga': 'Polígon industrial Carretera de Berga',
      'poligon_carretera_dartes': "Polígon Carretera d'Artés"
    };
    return locations[locationId] || locationId;
  };
  const renderScheduleSummary = () => {
    if (!user.detailedSchedule || !user.detailedSchedule.days || user.detailedSchedule.days.length === 0) {
      return <p className="no-schedule">No hi ha horari disponible</p>;
    }

    const dies = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres"];
    return (
      <div className="schedule-summary">
        {user.detailedSchedule.days.map((horari, index) => (
          <div key={index} className="schedule-item">
            <div className="day-info">
              <strong>{dies[index]}</strong>
            </div>
            <div className="time-info">
              <span>{horari.horaEntrada} - {horari.horaSortida}</span>
            </div>
          </div>
        ))}
        <div className="preferences-info">
          <strong>Preferència:</strong> {user.preferences}
        </div>
      </div>
    );
  };

  // Calculem les places disponibles basant-nos en els viatges actius
  const calculateAvailableSeats = () => {
    if (!user.carInfo || !user.activeTrips) return 0;
    const totalSeats = user.carInfo[2];
    const occupiedSeats = user.activeTrips.length;
    return totalSeats - occupiedSeats;
  };

  return (
    <div className="swipe-card-content">
      {/* Sección superior con foto e información del usuario */}
      <div className="user-header-section">
        <div className="profile-photo-container">
          <img
            src={user.photo || "https://via.placeholder.com/80"}
            alt={user.nom}
            className="profile-photo"
          />
        </div>

        <div className="user-basic-info">
          <h2 className="user-name">{user.nom}</h2>
          <Tag
            color={user.role === "Conductor" ? "blue" : "green"}
            className="role-tag"
          >
            {user.role}
          </Tag>

          {user.location && (
            <div className="info-item">
              <EnvironmentOutlined />
              <span className="info-text">{getLocationName(user.location)}</span>
            </div>
          )}

          {user.desti && (
            <div className="info-item">
              <EnvironmentOutlined />
              <span className="info-text">Destí: {getLocationName(user.desti)}</span>
            </div>
          )}

          {user.role === "Conductor" && user.carInfo && (
            <>
              <div className="info-item">
                <CarOutlined />
                <span className="info-text">
                  {user.carInfo[0]} - {user.carInfo[1]}
                </span>
              </div>
              <div className="info-item">
                <TeamOutlined />
                <span className="info-text">
                  {calculateAvailableSeats()} places disponibles de {user.carInfo[2]}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sección de horario separada */}
      <div className="schedule-section">
        <div className="schedule-header">
          <ClockCircleOutlined />
          <h3 className="schedule-title">Horari</h3>
        </div>
        {renderScheduleSummary()}
      </div>
    </div>
  );
};

export default SwipeCard;
