"use client";
import React, { useEffect } from "react";
import { Chrono } from "react-chrono";

const theme = {
  primary: "#dedede",
  secondary: "#006FEE",
  cardBgColor: "#ffffff",
  cardForeColor: "#000000",
  titleColor: "#000000",
  titleColorActive: "#ffffff",
};

export default function Timeline({ items }) {
  useEffect(() => {
    document.title = "Myview | Historia - Timeline";
  }, []);

  return (
    <Chrono
      disableToolbar={true}
      theme={theme}
      items={items}
      mode="VERTICAL_ALTERNATING"
      scrollable={{ scrollbar: false }}
    ></Chrono>
  );
}
