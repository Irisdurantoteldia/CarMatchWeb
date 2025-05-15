import React, { useState } from "react";
import {
  Layout,
  Card,
  Steps,
  Form,
  Input,
  Select,
  Button,
  Alert,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../FireBase/FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import "./SignUp.css";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedRole, setSelectedRole] = useState("passatger");
  const navigate = useNavigate();

  const steps = [
    { title: "Informació Personal", content: "personal-info" },
    { title: "Rol i Ubicació", content: "role-location" },
    { title: "Vehicle", content: "vehicle" },
    { title: "Horari", content: "schedule" },
    { title: "Credencials", content: "credentials" },
  ];

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    form.setFieldsValue({ role: value });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form.Item
            name="name"
            label="Nom"
            rules={[
              { required: true, message: "Si us plau, introdueix el teu nom" },
            ]}
          >
            <Input placeholder="El teu nom" />
          </Form.Item>
        );

      case 1:
        return (
          <>
            <Form.Item
              name="role"
              label="Rol"
              rules={[
                { required: true, message: "Si us plau, selecciona un rol" },
              ]}
            >
              <Select
                placeholder="Conductor o Passatger"
                onChange={handleRoleChange}
              >
                <Option value="conductor">Conductor</Option>
                <Option value="passatger">Passatger</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="location"
              label="Ubicació"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix la teva ubicació",
                },
              ]}
            >
              <Input placeholder="La teva ubicació" />
            </Form.Item>
            <Form.Item
              name="desti"
              label="Destí"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix el teu destí",
                },
              ]}
            >
              <Input placeholder="El teu destí" />
            </Form.Item>
          </>
        );

      case 2:
        return selectedRole === "conductor" ? (
          <>
            <Form.Item
              name="carModel"
              label="Model del Vehicle"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix el model del vehicle",
                },
              ]}
            >
              <Input placeholder="Model del vehicle" />
            </Form.Item>
            <Form.Item
              name="carColor"
              label="Color del Vehicle"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix el color del vehicle",
                },
              ]}
            >
              <Input placeholder="Color del vehicle" />
            </Form.Item>
            <Form.Item
              name="carSeats"
              label="Places Disponibles"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix el número de places",
                },
              ]}
            >
              <Select placeholder="Selecciona el número de places">
                {[2, 3, 4, 5, 6, 7].map((num) => (
                  <Option key={num} value={num}>
                    {num} places
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        ) : (
          <div className="step-skip">
            <Alert
              message="No es requereix informació del vehicle per a passatgers"
              type="info"
              showIcon
            />
          </div>
        );

      case 3:
        return (
          <>
            <Form.Item
              name="horaEntrada"
              label="Hora d'Entrada"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix l'hora d'entrada",
                },
              ]}
              initialValue="09:00"
            >
              <Input 
                type="time" 
                defaultValue="09:00"
                onChange={(e) => {
                  console.log('Hora entrada canviada:', e.target.value);
                  form.setFieldsValue({ horaEntrada: e.target.value });
                }}
              />
            </Form.Item>
            <Form.Item
              name="horaSortida"
              label="Hora de Sortida"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix l'hora de sortida",
                },
              ]}
              initialValue="17:00"
            >
              <Input 
                type="time"
                defaultValue="17:00"
                onChange={(e) => {
                  console.log('Hora sortida canviada:', e.target.value);
                  form.setFieldsValue({ horaSortida: e.target.value });
                }}
              />
            </Form.Item>
            <Form.Item
              name="preferences"
              label="Preferències"
              rules={[
                {
                  required: true,
                  message: "Si us plau, selecciona les teves preferències",
                },
              ]}
            >
              <Select placeholder="Selecciona les teves preferències">
                <Option value="matí">Matí</Option>
                <Option value="tarda">Tarda</Option>
                <Option value="flexible">Flexible</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 4:
        return (
          <>
            <Form.Item
              name="email"
              label="Correu Electrònic"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix el teu correu",
                },
                {
                  type: "email",
                  message: "Si us plau, introdueix un correu vàlid",
                },
              ]}
            >
              <Input placeholder="El teu correu electrònic" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Contrasenya"
              rules={[
                {
                  required: true,
                  message: "Si us plau, introdueix una contrasenya",
                },
                {
                  min: 6,
                  message: "La contrasenya ha de tenir almenys 6 caràcters",
                },
              ]}
            >
              <Input.Password placeholder="La teva contrasenya" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirma la Contrasenya"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Si us plau, confirma la teva contrasenya",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Les contrasenyes no coincideixen")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirma la teva contrasenya" />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  const handleNext = async () => {
    try {
      // Validar els camps del pas actual
      await form.validateFields(getFieldsForStep(currentStep));
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Error de validació:", error);
    }
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ["name"];
      case 1:
        return ["role", "location", "desti"];
      case 2:
        return selectedRole === "conductor"
          ? ["carModel", "carColor", "carSeats"]
          : [];
      case 3:
        return ["horaEntrada", "horaSortida", "preferences"];
      case 4:
        return ["email", "password", "confirmPassword"];
      default:
        return [];
    }
  };

  const handleSignUp = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Obtenim tots els valors del formulari
      const allValues = form.getFieldsValue(true);
      console.log('Tots els valors del formulari:', allValues);

      // Create user auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Crear horari setmanal amb les hores actualitzades
      const weeklyScheduleData = {
        userId: userCredential.user.uid,
        days: Array(5).fill({
          horaEntrada: allValues.horaEntrada || "09:00",
          horaSortida: allValues.horaSortida || "17:00"
        })
      };
      
      const weeklyScheduleRef = await addDoc(collection(db, "weeklySchedule"), weeklyScheduleData);

      // Preparar dades d'usuari amb tots els camps
      const userData = {
        userId: userCredential.user.uid,
        nom: allValues.name,
        email: allValues.email,
        role: selectedRole === "conductor" ? "Conductor" : "Passatger",
        location: allValues.location,
        desti: allValues.desti,
        weeklyScheduleId: weeklyScheduleRef.id,
        activeTrips: [],
        matches: [],
        photo: "",
        preferences: allValues.preferences
      };

      // Afegir informació del vehicle si és conductor
      if (selectedRole === "conductor") {
        userData.carInfo = {
          marca: allValues.carModel?.split(" ")[0] || "",
          model: allValues.carModel,
          places: allValues.carSeats
        };
      }

      await addDoc(collection(db, "users"), userData);
      navigate("/swipes");
    } catch (error) {
      console.error("Error complet durant el registre:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="signup-layout">
      <Content className="signup-content">
        <Card className="signup-card">
          <Title level={2}>Registre</Title>

          <Steps current={currentStep} items={steps} className="signup-steps" />

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="error-alert"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSignUp}
            className="signup-form"
          >
            {renderStepContent()}

            <div className="steps-action">
              {currentStep > 0 && (
                <Button
                  style={{ margin: "0 8px" }}
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Anterior
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  Següent
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  Finalitzar
                </Button>
              )}
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default SignUp;
