import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const ChartBrowsers = ({ data }) => {
  const modernColors = [
    "rgba(12, 219, 255, 0.6)",   // Cyan
    "rgba(255, 0, 122, 0.6)",    // Hot Pink
    "rgba(112, 0, 255, 0.6)",    // Purple
    "rgba(0, 255, 135, 0.6)",    // Emerald
    "rgba(255, 184, 0, 0.6)",    // Amber
    "rgba(255, 99, 71, 0.6)",     // Tomato
    "rgba(99, 102, 241, 0.6)",   // Indigo
    "rgba(236, 72, 153, 0.6)",   // Pink
    "rgba(20, 184, 166, 0.6)",   // Teal
    "rgba(245, 158, 11, 0.6)"    // Orange
  ];

  const modernBorders = [
    "rgba(12, 219, 255, 1)",
    "rgba(255, 0, 122, 1)",
    "rgba(112, 0, 255, 1)",
    "rgba(0, 255, 135, 1)",
    "rgba(255, 184, 0, 1)",
    "rgba(255, 99, 71, 1)",
    "rgba(99, 102, 241, 1)",
    "rgba(236, 72, 153, 1)",
    "rgba(20, 184, 166, 1)",
    "rgba(245, 158, 11, 1)"
  ];

  const structDataForGraphic = {
    labels: data?.browser?.labels,
    datasets: [
      {
        label: "Cantidad",
        data: data?.browser?.values,
        backgroundColor: modernColors.slice(0, data?.browser?.labels?.length || 6),
        borderColor: modernBorders.slice(0, data?.browser?.labels?.length || 6),
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
    },
    scales: {
      r: {
        grid: {
          color: "rgba(255, 255, 255, 0.08)",
        },
        angleLines: {
          color: "rgba(255, 255, 255, 0.08)",
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

  return <PolarArea data={structDataForGraphic} options={options} />;
};

export default ChartBrowsers;
