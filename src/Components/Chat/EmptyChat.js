import React from "react";
import { Empty } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const EmptyChat = () => (
  <Empty
    image={<MessageOutlined style={{ fontSize: 64 }} />}
    description={
      <div>
        <h3>Cap missatge encara</h3>
        <p>Inicia una conversa amb aquest 'match'</p>
      </div>
    }
  />
);

export default EmptyChat;