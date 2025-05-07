import React from "react";
import { Card, Menu } from "antd";
import "./DriverOptions.css";
import { driverOptions } from "./optionsConfig";

const DriverOptions = ({ navigation, userData }) => {
  return (
    <Card title="Opcions de conductor" className="driver-options">
      <Menu mode="vertical">
        {driverOptions.map((option) => (
          <Menu.Item
            key={option.key}
            icon={option.icon}
            onClick={() => navigation.navigate(option.route)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu>
    </Card>
  );
};

export default DriverOptions;
