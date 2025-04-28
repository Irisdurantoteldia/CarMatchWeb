import React from "react";
import { Empty, Button } from "antd";
import { FireOutlined } from "@ant-design/icons";
import "./EmptyMatches.css";

const EmptyMatches = ({ onSwipeNow }) => {
  return (
    <div className="empty-matches-container">
      <Empty
        image={<FireOutlined style={{ fontSize: 60, color: "#FF3B30" }} />}
        description={
          <div>
            <h3>Cap 'match' encara</h3>
            <p>Comença a fer 'swipe' per connectar amb algú</p>
          </div>
        }
      />
      <Button 
        type="primary" 
        danger
        icon={<FireOutlined />}
        size="large"
        onClick={onSwipeNow}
      >
        Fer 'swipe' ara
      </Button>
    </div>
  );
};

export default EmptyMatches;
