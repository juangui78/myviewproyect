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

const ChartQuantyPerDay = ({ data }) => {
  const dataInfo = {
    labels: data?.labels || [],
    datasets: [
      {
        label: "Entradas por día",
        data: data?.values || [],
        borderColor: "rgba(12, 219, 255, 1)",
        backgroundColor: "rgba(12, 219, 255, 0.15)",
        pointBackgroundColor: "#fff",
        pointBorderColor: "rgba(12, 219, 255, 1)",
        pointHoverBackgroundColor: "rgba(12, 219, 255, 1)",
        pointHoverBorderColor: "#fff",
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since there's only one line
      },
      tooltip: {
        enabled: true,
      }
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          font: {
            size: 10,
            family: "Outfit, Inter, sans-serif"
          }
        }
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          font: {
            size: 10,
            family: "Outfit, Inter, sans-serif"
          },
          precision: 0
        }
      }
    }
  };

  return <Line options={options} data={dataInfo} />;
};

export default ChartQuantyPerDay;
