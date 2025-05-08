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
              <span className="info-text">{user.location}</span>
            </div>
          )}

          {user.desti && (
            <div className="info-item">
              <EnvironmentOutlined />
              <span className="info-text">Destí: {user.desti}</span>
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
                <span className="info-text">{user.carInfo[2]} places</span>
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
