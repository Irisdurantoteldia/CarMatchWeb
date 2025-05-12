import React from 'react';
import { Input, Button } from 'antd';
import { SendOutlined, CarOutlined } from '@ant-design/icons';
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

  const handleStartTrip = () => {
    // Aquí se implementará la lógica para iniciar viajes
    console.log('Iniciar');
  };

  return (
    <div className="chat-input-wrapper">
      <Button
        type="primary"
        icon={<CarOutlined />}
        onClick={handleStartTrip}
        className="trip-button"
      >
        Iniciar
      </Button>
      <Input
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder="Escriu un missatge..."
        autoComplete="off"
        className="message-input"
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSendClick}
        disabled={!value?.trim()}
        className="send-button"
      >
        Enviar
      </Button>
    </div>
  );
};

export default ChatInput;
