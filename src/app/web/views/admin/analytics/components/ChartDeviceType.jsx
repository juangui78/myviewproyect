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
    labels: data?.deviceType?.labels || [],
    datasets: [
      {
        label: "Dispositivos",
        data: data?.deviceType?.values || [],
        backgroundColor: "rgba(12, 219, 255, 0.2)",
        borderColor: "rgba(12, 219, 255, 1)",
        pointBackgroundColor: "rgba(12, 219, 255, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(12, 219, 255, 1)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Since there's only one dataset ("Dispositivos"), we can hide the legend to maximize chart space
      },
      tooltip: {
        enabled: true,
      }
    },
    scales: {
      r: {
        grid: {
          color: "rgba(255, 255, 255, 0.08)",
        },
        angleLines: {
          color: "rgba(255, 255, 255, 0.08)",
        },
        pointLabels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 11,
            family: "Outfit, Inter, sans-serif",
            weight: "bold"
          }
        },
        ticks: {
          backdropColor: "transparent",
          color: "rgba(255, 255, 255, 0.4)",
          font: {
            size: 9
          }
        }
      }
    }
  };

  return <Radar data={infoChart} options={options} />;
};

export default ChartDeviceType;
