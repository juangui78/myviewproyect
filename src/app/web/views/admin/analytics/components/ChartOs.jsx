import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartOs = ({ data }) => {
  const modernColors = [
    "rgba(112, 0, 255, 0.6)",    // Purple
    "rgba(12, 219, 255, 0.6)",   // Cyan
    "rgba(255, 0, 122, 0.6)",    // Hot Pink
    "rgba(0, 255, 135, 0.6)",    // Emerald
    "rgba(255, 184, 0, 0.6)",    // Amber
    "rgba(99, 102, 241, 0.6)",   // Indigo
  ];

  const modernBorders = [
    "rgba(112, 0, 255, 1)",
    "rgba(12, 219, 255, 1)",
    "rgba(255, 0, 122, 1)",
    "rgba(0, 255, 135, 1)",
    "rgba(255, 184, 0, 1)",
    "rgba(99, 102, 241, 1)",
  ];

  const infoChart = {
    labels: data?.os?.labels || [],
    datasets: [
      {
        label: "Sistemas Operativos",
        data: data?.os?.values || [],
        backgroundColor: modernColors.slice(0, data?.os?.labels?.length || 6),
        borderColor: modernBorders.slice(0, data?.os?.labels?.length || 6),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 10,
            family: "Outfit, Inter, sans-serif"
          },
          padding: 8,
          boxWidth: 12
        }
      },
      tooltip: {
        enabled: true,
      }
    }
  };

  return <Pie data={infoChart} options={options} />;
};

export default ChartOs;
