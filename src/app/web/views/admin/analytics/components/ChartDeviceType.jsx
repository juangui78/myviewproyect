import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const ChartDeviceType = ({ data }) => {
  const infoChart = {
    labels: data.deviceType.labels,
    datasets: [
      {
        label: "# de tipos de dispositivos",
        data: data.deviceType.values,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  return <Radar data={infoChart} />;
};

export default ChartDeviceType;
