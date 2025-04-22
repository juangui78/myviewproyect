"use client";
import React, { Suspense, useEffect, useState, useMemo } from "react";
import { getAnalyticsData } from "./actions/getAnalyticsData";
import ChartBrowsers from "./components/ChartBrowsers";
import ChartDeviceType from "./components/ChartDeviceType";
import ChartOs from "./components/ChartOs";

const Analytics = () => {
  const [dataAnalytics, setDataAnalytics] = useState([]);

  useEffect(() => {
    document.title = "MyView_ | Analíticas";

    const getData = async () => {
      try {
        const response = await getAnalyticsData();
        if (!response.status === 200) {
          alert("error al traer los datos");
          return;
        }

        setDataAnalytics(response.data);
      } catch (err) {
        console.error("Errror", err);
      }
    };

    getData();
  }, []);

  const formatDataPerGraphic = useMemo(() => {
    // get all the info formated
    const info = {
      browser: {
        labels: [],
        values: [],
      },
      deviceType: {
        labels: [],
        values: [],
      },
      os: {
        labels: [],
        values: [],
      },
    };

    for (const i in dataAnalytics) {
      const browser = dataAnalytics[i].browser;
      const deviceType = dataAnalytics[i].deviceType;
      const os = dataAnalytics[i].os;

      if (browser !== undefined) {
        const filterBrowser = info.browser.labels.findIndex(
          (item) => item === browser,
        );

        if (filterBrowser === -1) {
          info.browser.labels.push(browser);
          info.browser.values.push(1);
        } else if (filterBrowser != 1) info.browser.values[filterBrowser]++;
      }

      if (deviceType !== undefined) {
        const filterDeviceType = info.deviceType.labels.findIndex(
          (item) => item === deviceType,
        );
        if (filterDeviceType === -1) {
          info.deviceType.labels.push(deviceType);
          info.deviceType.values.push(1);
        } else if (filterDeviceType != -1)
          info.deviceType.values[filterDeviceType]++;
      }

      if (os !== undefined) {
        const filterOs = info.os.labels.findIndex((item) => item === os);
        if (filterOs === -1) {
          info.os.labels.push(os);
          info.os.values.push(1);
        } else if (os != -1) info.os.values[filterOs]++;
      }
    }

    return info;
  }, [dataAnalytics]);

  return (
    <section className="flex m-auto w-full justify-center">
      <section className="w-[70%] mt-[30px] grid grid-cols-3 gap-4">
        <div className="col-span-1 h-[48vh] bg-white rounded-lg ... flex flex-col items-center">
          <p>Navegadores</p>
          <ChartBrowsers data={formatDataPerGraphic} />
        </div>
        <div className="col-span-1 h-[48vh] bg-white rounded-lg ... flex flex-col items-center">
          <p>Tipos de dispositivo</p>
          <ChartDeviceType data={formatDataPerGraphic} />
        </div>
        <div className="col-span-1 h-[48vh] bg-white rounded-lg ... flex flex-col items-center">
          <p>Sistemas operativos</p>
          <ChartOs data={formatDataPerGraphic} />
        </div>
      </section>
    </section>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Analytics />
    </Suspense>
  );
};

export default Page;
