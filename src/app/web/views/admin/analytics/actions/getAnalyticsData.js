"use server";
import { dbConnected } from "@/api/libs/mongoose";
import { UAParser } from "ua-parser-js";
import Analytics from "@/api/models/analytics";

dbConnected();

export const getAnalyticsData = async () => {
  try {
    const analytics = await Analytics.find(
      {},
      {
        __v: 0,
        _id: 0,
        projectId: 0,
      },
    ).lean();

    const formatData = analytics.map((row) => {
      const userAgent = row?.userAgent;
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      return {
        browser: result.browser.name,
        browserVersion: result.browser.version,
        os: result.os.name,
        osVersion: result.os.version,
        deviceType: result.device.type || "desktop",
        isMobile: row.secChUaMobile,
        createdAt: row.createdAt,
      };
    });

    return {
      status: 200,
      data: formatData,
    };
  } catch (err) {
    return {
      status: 500,
      message: "Error en el servidor",
    };
  }
};
