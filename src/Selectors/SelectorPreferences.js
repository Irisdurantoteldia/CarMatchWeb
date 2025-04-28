import { useState } from 'react';
import { Select, Typography, Modal, List } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const options = [
    { label: "Horari d'entrada - Només anada", value: "Horari d'entrada" },
    { label: "Horari de sortida - Només tornada", value: "Horari de sortida" },
    { label: "Ambdós - Entrada i sortida", value: "Ambdós" },
    { label: "Sense preferències - Flexible", value: "Sense preferències" }
];

const SelectorPreferences = ({ preferencies, setPreferencies }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <div>
            <Text>
                Aquí hauries d'especificar quin horari per compartir voldries fer:
            </Text>

            <Select
                style={{ width: '100%', marginTop: 8 }}
                value={preferencies}
                onChange={setPreferencies}
                placeholder="Selecciona una opció..."
            >
                {options.map(option => (
                    <Option key={option.value} value={option.value}>
                        {option.label}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default SelectorPreferences;
