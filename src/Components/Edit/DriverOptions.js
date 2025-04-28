import React from "react";
import { Card, Menu } from "antd";
import { CalendarOutlined, CarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import "./DriverOptions.css";

const DriverOptions = ({ navigation, userData }) => {
  return (
    <Card title="Opcions de conductor" className="driver-options">
      <Menu mode="vertical">
        <Menu.Item 
          key="unavailability" 
          icon={<CalendarOutlined />}
          onClick={() => navigation.navigate("UnavailabilityList")}
        >
          Gestionar indisponibilitats
        </Menu.Item>

        <Menu.Item 
          key="vehicle" 
          icon={<CarOutlined />}
          onClick={() => navigation.navigate("ManageVehicle")}
        >
          Gestionar vehicle
        </Menu.Item>

        <Menu.Item 
          key="routes" 
          icon={<EnvironmentOutlined />}
          onClick={() => navigation.navigate("ManageRoutes")}
        >
          Gestionar rutes
        </Menu.Item>
      </Menu>
    </Card>
  );
};

export default DriverOptions;
