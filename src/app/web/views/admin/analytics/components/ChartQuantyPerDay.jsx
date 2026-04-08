import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
    },
  },
};

const ChartQuantyPerDay = ({ data }) => {
  const dataInfo = {
    labels: data.labels,
    datasets: [
      {
        label: "# de entradas",
        data: data.values,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        pointBackgroundColor: "white",
        pointBorderColor: "blue",
        pointRadius: 6,
        tension: 0.3, // suaviza las líneas
      },
    ],
  };

  return <Line options={options} data={dataInfo} />;
};

export default ChartQuantyPerDay;
