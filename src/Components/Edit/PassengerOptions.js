import React from "react";
import { Card, Menu } from "antd";
import "./PassengerOptions.css";
import { passengerOptions } from "./optionsConfig";

const PassengerOptions = ({ navigation, userData }) => {
  return (
    <Card title="Opcions de passatger" className="passenger-options">
      <Menu mode="vertical">
        {passengerOptions.map((option) => (
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

export default PassengerOptions;
