import React from "react";
import { Spin, Typography } from "antd";

const { Text } = Typography;

const Loader = ({ message = "Carregant..." }) => (
  <div style={{ 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  }}>
    <Spin size="large" />
    <Text style={{ marginTop: 10, fontSize: 16, color: "#666" }}>
      {message}
    </Text>
  </div>
);

export default Loader;
