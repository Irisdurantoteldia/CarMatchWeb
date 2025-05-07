import {
  CalendarOutlined,
  CarOutlined,
  EnvironmentOutlined,
  BookOutlined,
  SettingOutlined,
  UserOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

export const generalOptions = [
  {
    key: "account",
    icon: <UserOutlined />,
    label: "Informació Personal",
    route: "account",
    description: "Modifica el teu perfil, foto i dades de contacte"
  },
  {
    key: "schedule",
    icon: <ClockCircleOutlined />,
    label: "Horari",
    route: "edit-schedule",
    description: "Gestiona els teus horaris i disponibilitat"
  },
  {
    key: "preferences",
    icon: <SettingOutlined />,
    label: "Preferències de viatge",
    route: "travel-preferences",
    description: "Configura les preferències per a un millor matching"
  }
];

export const driverOptions = [
  {
    key: "unavailability",
    icon: <CalendarOutlined />,
    label: "Gestionar indisponibilitats",
    route: "driver-unavailability",
    description: "Gestiona els teus horaris i disponibilitat"
  },
  {
    key: "vehicle",
    icon: <CarOutlined />,
    label: "Gestionar vehicle",
    route: "manage-vehicle",
    description: "Gestiona la informació del teu vehicle, capacitat i característiques"
  },
  {
    key: "routes",
    icon: <EnvironmentOutlined />,
    label: "Gestionar rutes",
    route: "manage-routes",
    description: "Configura les teves rutes i trajectes més freqüents"
  }
];

export const passengerOptions = [
  {
    key: "unavailability",
    icon: <CalendarOutlined />,
    label: "Gestionar indisponibilitats",
    route: "unavailability-list",
    description: "Gestiona els teus horaris i disponibilitat"
  },
  {
    key: "saved-routes",
    icon: <BookOutlined />,
    label: "Rutes guardades",
    route: "saved-routes",
    description: "Accedeix a les teves rutes favorites i habituals"
  }
]; 