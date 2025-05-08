import React from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './ChatInput.css';

const ChatInput = ({ value = '', onChange, onSend }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      onSend();
    }
  };

  const handleSendClick = () => {
    if (value.trim()) {
      onSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <Input
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder="Escriu un missatge..."
        autoComplete="off"
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSendClick}
        disabled={!value?.trim()}
      >
        Enviar
      </Button>
    </div>
  );
};

export default ChatInput;
