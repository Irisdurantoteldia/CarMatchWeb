import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Input, Select, Card, Button, List, Space, Modal, Spin, Tag, Typography } from "antd"
import {
  UserOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  HeartOutlined,
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
      <Card className="search-container">
        <div className="search-header">
          <Title level={2}>Cercar Usuaris</Title>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => setShowFilters(true)}
            className="filter-button"
          >
            Filtres
          </Button>
        </div>

        <Space direction="vertical" className="search-content" size="large">
          <div className="search-fields">
            <Select
              value={searchField}
              onChange={setSearchField}
              className="search-field-selector"
              dropdownClassName="search-dropdown"
            >
              {searchFields.map((field) => (
                <Option key={field.id} value={field.id}>
                  <Space>
                    {field.icon === "person-outline" && <UserOutlined />}
                    {field.icon === "car-outline" && <CarOutlined />}
                    {field.icon === "location-outline" && <EnvironmentOutlined />}
                    {field.icon === "navigate-outline" && <CompassOutlined />}
                    {field.icon === "heart-outline" && <HeartOutlined />}
                    {field.label}
                  </Space>
                </Option>
              ))}
            </Select>

            <Input.Search
              placeholder={`Cercar per ${searchFields.find((f) => f.id === searchField)?.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={() => {}}
              className="search-input"
              allowClear
            />
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <List
              className="users-list"
              dataSource={users}
              locale={{
                emptyText: (
                  <div className="empty-state">
                    <SearchOutlined style={{ fontSize: 48 }} />
                    <p>
                      {searchTerm || Object.values(filters).some((v) => v)
                        ? "No s'han trobat usuaris"
                        : "Utilitza els filtres per cercar usuaris"}
                    </p>
                  </div>
                ),
              }}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() =>
                    navigate("/swipes", {
                      state: {
                        selectedUserId: item.id,
                        userData: item,
                      },
                    })
                  }
                  className="user-card"
                >
                  <div className="user-info">
                    <img src={item.photo || "https://via.placeholder.com/100"} alt={item.nom} className="user-photo" />
                    <div className="user-details">
                      <Title level={4} className="user-name">
                        {item.nom || "Sense nom"}
                      </Title>
                      <Tag color={item.role === "Conductor" ? "blue" : "green"} className="role-tag">
                        {item.role}
                      </Tag>

                      {item.location && (
                        <div className="info-row">
                          <EnvironmentOutlined className="info-icon" />
                          <span>{item.location}</span>
                        </div>
                      )}

                      {item.desti && (
                        <div className="info-row">
                          <CompassOutlined className="info-icon" />
                          <span>{item.desti}</span>
                        </div>
                      )}

                      {item.role === "Conductor" && item.carInfo && (
                        <div className="car-info">
                          <div className="info-row">
                            <CarOutlined className="info-icon" />
                            <span>
                              {item.carInfo[0]} - {item.carInfo[1]}
                            </span>
                          </div>
                          <div className="info-row">
                            <TeamOutlined className="info-icon" />
                            <span>{item.carInfo[2]} places</span>
                          </div>
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
