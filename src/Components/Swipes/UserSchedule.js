import { Table } from "antd";
import "./UserSchedule.css";

const UserSchedule = ({ schedule }) => {
  const columns = [
    {
      title: "Dia",
      dataIndex: "day",
      key: "day",
      width: "40%",
    },
    {
      title: "Entrada",
      dataIndex: "entrada",
      key: "entrada",
      width: "30%",
    },
    {
      title: "Sortida",
      dataIndex: "sortida",
      key: "sortida",
      width: "30%",
    },
  ];

  const dies = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres"];

  const data = dies.map((dia, index) => ({
    key: index,
    day: dia,
    entrada: schedule[index]?.horaEntrada || "-",
    sortida: schedule[index]?.horaSortida || "-",
  }));

  return (
    <div className="schedule-container">
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
        className="schedule-table"
        bordered
      />
    </div>
  );
};

export default UserSchedule;
