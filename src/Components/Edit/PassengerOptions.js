import React from "react";
import { Card, Menu } from "antd";
import { 
  CalendarOutlined, 
  BookOutlined, 
  SettingOutlined 
} from "@ant-design/icons";
import "./PassengerOptions.css";

const PassengerOptions = ({ navigation, userData }) => {
  return (
    <Card title="Opcions de passatger" className="passenger-options">
      <Menu mode="vertical">
        <Menu.Item 
          key="unavailability" 
          icon={<CalendarOutlined />}
          onClick={() => navigation.navigate("UnavailabilityList")}
        >
          Gestionar indisponibilitats
        </Menu.Item>

        <Menu.Item 
          key="saved-routes" 
          icon={<BookOutlined />}
          onClick={() => navigation.navigate("SavedRoutes")}
        >
          Rutes guardades
        </Menu.Item>

        <Menu.Item 
          key="preferences" 
          icon={<SettingOutlined />}
          onClick={() => navigation.navigate("TravelPreferences")}
        >
          Preferències de viatge
        </Menu.Item>
      </Menu>
    </Card>
  );
};

export default PassengerOptions;
