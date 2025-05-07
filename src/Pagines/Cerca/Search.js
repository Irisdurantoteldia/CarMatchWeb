import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Input, Select, Card, Button, List, Space, Modal, Spin, Tag, Typography } from "antd"
import {
  UserOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import { db } from "../../FireBase/FirebaseConfig"
import { collection, getDocs } from "firebase/firestore"
import "./Search.css"

const { Title } = Typography
const { Option } = Select

const Search = () => {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [searchField, setSearchField] = useState("name")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    role: null,
    origin: "",
    destination: "",
    minSeats: null,
    preference: "",
  })
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  const searchFields = [
    { id: "name", label: "Nom", icon: "person-outline" },
    { id: "car", label: "Vehicle", icon: "car-outline" },
    { id: "location", label: "Ubicació", icon: "location-outline" },
    { id: "destination", label: "Destí", icon: "navigate-outline" },
  ]

  const roles = ["Conductor", "Passatger"]
  const seatOptions = [2, 3, 4, 5, 6, 7, 8]
  const preferenceOptions = ["Matí", "Tarda", "Flexible"]

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users")
        const querySnapshot = await getDocs(usersCollection)
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setUsers(usersData)
        setLoading(false)
      } catch (error) {
        console.error("Error carregant usuaris:", error)
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="search-page">
      <Card className="search-container" bordered={false}>
        <div className="search-header">
          <Title level={3}>Cercar Usuaris</Title>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => setShowFilters(true)}
            className="filter-button"
          >
            Filtres
          </Button>
        </div>

        <Space direction="vertical" className="search-content" size="middle">
          <div className="search-fields">
            <Select
              value={searchField}
              onChange={setSearchField}
              className="search-field-selector"
            >
              {searchFields.map((field) => (
                <Option key={field.id} value={field.id}>
                  <Space>
                    {field.icon === "person-outline" && <UserOutlined />}
                    {field.icon === "car-outline" && <CarOutlined />}
                    {field.icon === "location-outline" && <EnvironmentOutlined />}
                    {field.icon === "navigate-outline" && <CompassOutlined />}
                    {field.label}
                  </Space>
                </Option>
              ))}
            </Select>

            <Input
              placeholder={`Cercar per ${searchFields.find((f) => f.id === searchField)?.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              prefix={<SearchOutlined />}
            />
          </div>

          {loading ? (
            <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <List
              className="users-list"
              dataSource={users}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => navigate("/swipes", { state: { selectedUserId: item.id, userData: item } })}
                  className="user-card"
                  style={{ padding: '12px', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <div className="user-info" style={{ display: 'flex', gap: '16px' }}>
                    <img 
                      src={item.photo || "https://via.placeholder.com/100"} 
                      alt={item.nom} 
                      className="user-photo" 
                      style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="user-details">
                      <Title level={4} style={{ margin: '0 0 4px 0' }}>{item.nom || "Sense nom"}</Title>
                      <Tag color={item.role === "Conductor" ? "blue" : "green"} style={{ marginBottom: '8px' }}>
                        {item.role}
                      </Tag>

                      {item.location && item.desti && (
                        <div className="route-info" style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center' }}>
                          <span>{item.location}</span>
                          <span style={{ margin: '0 8px' }}>→</span>
                          <span>{item.desti}</span>
                        </div>
                      )}

                      {item.role === "Conductor" && item.carInfo && (
                        <div className="car-info" style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                          <CarOutlined style={{ marginRight: '8px' }} />
                          {item.carInfo[0]} - {item.carInfo[1]} · {item.carInfo[2]} places
                        </div>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>

      <Modal
        title="Filtres"
        open={showFilters}
        onCancel={() => setShowFilters(false)}
        footer={[
          <Button
            key="reset"
            onClick={() =>
              setFilters({
                role: null,
                origin: "",
                destination: "",
                minSeats: null,
                preference: "",
              })
            }
            className="reset-button"
          >
            Reiniciar Filtres
          </Button>,
          <Button key="apply" type="primary" onClick={() => setShowFilters(false)} className="apply-button">
            Aplicar Filtres
          </Button>,
        ]}
        className="filters-modal"
      >
        <Space direction="vertical" className="filter-content" size="large">
          <div className="filter-section">
            <Title level={5}>Rol</Title>
            <Select
              value={filters.role}
              onChange={(value) => setFilters({ ...filters, role: value })}
              placeholder="Selecciona un rol"
              allowClear
              style={{ width: "100%" }}
              className="filter-select"
            >
              {roles.map((role) => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-section">
            <Title level={5}>Origen</Title>
            <Input
              placeholder="Introdueix l'origen"
              value={filters.origin}
              onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
              prefix={<EnvironmentOutlined className="filter-icon" />}
              className="filter-input"
            />
          </div>

          <div className="filter-section">
            <Title level={5}>Destí</Title>
            <Input
              placeholder="Introdueix el destí"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              prefix={<CompassOutlined className="filter-icon" />}
              className="filter-input"
            />
          </div>

          <div className="filter-section">
            <Title level={5}>Places mínimes</Title>
            <Select
              value={filters.minSeats}
              onChange={(value) => setFilters({ ...filters, minSeats: value })}
              placeholder="Selecciona places mínimes"
              allowClear
              style={{ width: "100%" }}
              className="filter-select"
            >
              {seatOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-section">
            <Title level={5}>Preferència</Title>
            <Select
              value={filters.preference}
              onChange={(value) => setFilters({ ...filters, preference: value })}
              placeholder="Selecciona preferència"
              allowClear
              style={{ width: "100%" }}
              className="filter-select"
            >
              {preferenceOptions.map((pref) => (
                <Option key={pref} value={pref}>
                  <Space>
                    <ClockCircleOutlined className="filter-icon" />
                    {pref}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  )
}

export default Search
