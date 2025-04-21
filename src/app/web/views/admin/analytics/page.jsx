"use client"

import React, { Suspense } from "react"
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const Analytics = () => {

    const z1 = [
        [8.83, 8.89, 8.81, 8.87, 8.9, 8.87],
        [8.89, 8.94, 8.85, 8.94, 8.96, 8.92],
        [8.84, 8.9, 8.82, 8.92, 8.93, 8.91],
        [8.79, 8.85, 8.79, 8.9, 8.94, 8.92],
        [8.79, 8.88, 8.81, 8.9, 8.95, 8.92],
        [8.8, 8.82, 8.78, 8.91, 8.94, 8.92],
        [8.75, 8.78, 8.77, 8.91, 8.95, 8.92],
        [8.8, 8.8, 8.77, 8.91, 8.95, 8.94],
        [8.74, 8.81, 8.76, 8.93, 8.98, 8.99],
        [8.89, 8.99, 8.92, 9.1, 9.13, 9.11],
        [8.97, 8.97, 8.91, 9.09, 9.11, 9.11],
        [9.04, 9.08, 9.05, 9.25, 9.28, 9.27],
        [9, 9.01, 9, 9.2, 9.23, 9.2],
        [8.99, 8.99, 8.98, 9.18, 9.2, 9.19],
        [8.93, 8.97, 8.97, 9.18, 9.2, 9.18],
      ];
    
      const z2 = z1.map(row => row.map(val => val + 1));
      const z3 = z1.map(row => row.map(val => val - 1));
    
      const data = [
        { z: z1, type: "surface", name: "z1" },
        { z: z2, type: "surface", opacity: 0.9, showscale: false, name: "z2" },
        { z: z3, type: "surface", opacity: 0.9, showscale: false, name: "z3" },
      ];

    return (
        <Plot
        data={data}
        layout={{
          title: "Superficies 3D z1, z2, z3",
          autosize: true,
          scene: {
            xaxis: { title: "X" },
            yaxis: { title: "Y" },
            zaxis: { title: "Z" },
          },
          margin: { l: 0, r: 0, b: 0, t: 50 },
        }}
        style={{ width: "100%", height: "100%" }}
      />
    )
}


const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Analytics />  
        </Suspense>
    )
}

export default Page