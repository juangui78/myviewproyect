"use server";
import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";
import Proyect from "@/api/models/proyect";
import Company from "@/api/models/company"; // ensure model is registered for populate

export async function getProjectPresentationData(id) {
  try {
    await dbConnected();
    const findProyect = await Proyect.findById(id).lean();
    if (!findProyect) return null;

    const idProyect = findProyect._id;
    let getModel = await Model.findOne({ idProyect: idProyect }, { __v: 0, idProyect: 0 })
      .sort({ creation_date: -1 })
      .lean();

    if (getModel && (getModel.background360Rotation === undefined || getModel.background360Rotation === 0)) {
      const calibratedModel = await Model.findOne({
        idProyect: idProyect,
        background360Rotation: { $exists: true, $ne: 0 }
      }).lean();

      if (calibratedModel) {
        getModel.background360Rotation = calibratedModel.background360Rotation;
        getModel.background360RotationX = calibratedModel.background360RotationX || 0;
        if (!getModel.background360) {
          getModel.background360 = calibratedModel.background360;
        }
      }
    }

    const getProject = await Proyect.findById(idProyect, { __v: 0, state: 0, creation_date: 0 })
      .populate("idCompany", "name cell email")
      .lean();

    return {
      model: getModel ? JSON.parse(JSON.stringify(getModel)) : null,
      proyect: getProject ? JSON.parse(JSON.stringify(getProject)) : null,
    };
  } catch (error) {
    console.error("Error en getProjectPresentationData:", error);
    return null;
  }
}
