"use server"
import { dbConnected } from "@/api/libs/mongoose";
import User from "@/api/models/users";
import Company from "@/api/models/company";
import Proyect from "@/api/models/proyect";
import Analytics from "@/api/models/analytics";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/api/auth/[...nextauth]/route";

// Helper strictly validating that the user is the superadmin
async function checkSuperadmin() {
  await dbConnected();
  const session = await getServerSession(AuthOptions);
  if (!session || session.user?.email !== "darksus78@gmail.com") {
    throw new Error("No autorizado: Solo el superadmin puede realizar esta acción.");
  }
  return session;
}

export async function getSuperadminStats() {
  try {
    await checkSuperadmin();

    const [totalUsers, totalCompanies, totalProjects, activeProjects, totalAnalytics] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Proyect.countDocuments(),
      Proyect.countDocuments({ state: { $regex: /^activ/i } }),
      Analytics.countDocuments()
    ]);

    // Aggregate projects per company for dashboard visualization
    const projectsPerCompanyRaw = await Proyect.aggregate([
      {
        $group: {
          _id: "$idCompany",
          projectCount: { $sum: 1 }
        }
      },
      { $sort: { projectCount: -1 } },
      { $limit: 5 }
    ]);

    const projectsPerCompany = await Promise.all(
      projectsPerCompanyRaw.map(async (item) => {
        if (!item._id) return { companyName: "Sin Inmobiliaria", count: item.projectCount };
        const company = await Company.findById(item._id).select("name").lean();
        return {
          companyName: company ? company.name : "Desconocida",
          count: item.projectCount
        };
      })
    );

    // Aggregate project views/analytics
    const popularProjectsRaw = await Analytics.aggregate([
      {
        $group: {
          _id: "$projectId",
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    const popularProjects = await Promise.all(
      popularProjectsRaw.map(async (item) => {
        if (!item._id) return { projectName: "Desconocido", count: item.views };
        const project = await Proyect.findById(item._id).select("name").lean();
        return {
          projectName: project ? project.name : "Desconocido",
          count: item.views
        };
      })
    );

    return {
      success: true,
      stats: {
        totalUsers,
        totalCompanies,
        totalProjects,
        activeProjects,
        totalAnalytics,
        projectsPerCompany,
        popularProjects
      }
    };
  } catch (error) {
    console.error("Error in getSuperadminStats:", error);
    return { success: false, message: error.message };
  }
}

export async function getSuperadminUsers(page = 1, limit = 10, search = "") {
  try {
    await checkSuperadmin();

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ created: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const populatedUsers = await Promise.all(
      users.map(async (u) => {
        let companyName = "Ninguna";
        if (u.id_Company) {
          const company = await Company.findById(u.id_Company).select("name").lean();
          if (company) companyName = company.name;
        }
        return {
          ...u,
          _id: u._id.toString(),
          id_Company: u.id_Company ? u.id_Company.toString() : null,
          companyName,
          created: u.created ? u.created.toISOString() : null,
          age: u.age ? u.age.toISOString() : null
        };
      })
    );

    return {
      success: true,
      data: populatedUsers,
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error("Error in getSuperadminUsers:", error);
    return { success: false, message: error.message };
  }
}

export async function createUserBySuperadmin(data) {
  try {
    await checkSuperadmin();

    const { name, lastName, email, password, type, id_Company } = data;
    if (!name || !email || !password || !type) {
      return { success: false, message: "Campos obligatorios faltantes" };
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return { success: false, message: "El correo ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      lastName: lastName || "",
      email,
      password: hashedPassword,
      type,
      id_Company: id_Company || null,
      configurations: { feed: "cards" }
    });

    await newUser.save();
    return { success: true, message: "Usuario creado exitosamente" };
  } catch (error) {
    console.error("Error in createUserBySuperadmin:", error);
    return { success: false, message: error.message };
  }
}

export async function updateUserBySuperadmin(userId, data) {
  try {
    await checkSuperadmin();

    const { name, lastName, email, type, id_Company, password } = data;
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Verify if email is changing and if the new email is already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return { success: false, message: "El correo ya está en uso por otro usuario" };
      }
      user.email = email;
    }

    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.type = type || user.type;
    user.id_Company = id_Company || null;

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();
    return { success: true, message: "Usuario actualizado exitosamente" };
  } catch (error) {
    console.error("Error in updateUserBySuperadmin:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteUserBySuperadmin(userId) {
  try {
    const session = await checkSuperadmin();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    if (user.email === "darksus78@gmail.com" || user.email === session.user.email) {
      return { success: false, message: "No se puede eliminar la cuenta del Superadmin" };
    }

    await User.findByIdAndDelete(userId);
    return { success: true, message: "Usuario eliminado exitosamente" };
  } catch (error) {
    console.error("Error in deleteUserBySuperadmin:", error);
    return { success: false, message: error.message };
  }
}

export async function getAllCompaniesList() {
  try {
    await checkSuperadmin();
    const companies = await Company.find({}, { name: 1 }).sort({ name: 1 }).lean();
    return {
      success: true,
      data: companies.map(c => ({
        _id: c._id.toString(),
        name: c.name
      }))
    };
  } catch (error) {
    console.error("Error in getAllCompaniesList:", error);
    return { success: false, message: error.message };
  }
}

export async function getCompaniesWithActiveProjects() {
  try {
    await checkSuperadmin();

    const companies = await Company.find().sort({ name: 1 }).lean();

    const data = await Promise.all(
      companies.map(async (c) => {
        const companyId = c._id;

        // Find active projects for this company
        const activeProjectsRaw = await Proyect.find({
          idCompany: companyId,
          state: { $regex: /^activ/i }
        })
          .select("name description city department address areaOfThisproyect urlImage linkWeb creation_date state")
          .sort({ creation_date: -1 })
          .lean();

        const totalProjects = await Proyect.countDocuments({ idCompany: companyId });

        return {
          _id: companyId.toString(),
          name: c.name || "Inmobiliaria sin nombre",
          email: c.email || "",
          city: c.city || "",
          department: c.department || "",
          country: c.country || "Colombia",
          active: c.active ?? true,
          activeProjectsCount: activeProjectsRaw.length,
          totalProjectsCount: totalProjects,
          activeProjects: activeProjectsRaw.map(p => ({
            _id: p._id.toString(),
            name: p.name || "Proyecto sin nombre",
            description: p.description || "",
            city: p.city || "",
            department: p.department || "",
            address: p.address || "",
            areaOfThisproyect: p.areaOfThisproyect || 0,
            urlImage: p.urlImage || "",
            linkWeb: p.linkWeb || "",
            state: p.state || "Actived",
            creation_date: p.creation_date ? p.creation_date.toISOString() : null
          }))
        };
      })
    );

    // Also check for any active projects without assigned company (orphaned)
    const unassignedProjectsRaw = await Proyect.find({
      $or: [{ idCompany: null }, { idCompany: { $exists: false } }],
      state: { $regex: /^activ/i }
    })
      .select("name description city department address areaOfThisproyect urlImage linkWeb creation_date state")
      .lean();

    if (unassignedProjectsRaw.length > 0) {
      data.push({
        _id: "unassigned",
        name: "Proyectos sin Inmobiliaria asignada",
        email: "N/A",
        city: "Varios",
        department: "",
        country: "",
        active: true,
        activeProjectsCount: unassignedProjectsRaw.length,
        totalProjectsCount: unassignedProjectsRaw.length,
        activeProjects: unassignedProjectsRaw.map(p => ({
          _id: p._id.toString(),
          name: p.name || "Proyecto sin nombre",
          description: p.description || "",
          city: p.city || "",
          department: p.department || "",
          address: p.address || "",
          areaOfThisproyect: p.areaOfThisproyect || 0,
          urlImage: p.urlImage || "",
          linkWeb: p.linkWeb || "",
          state: p.state || "Actived",
          creation_date: p.creation_date ? p.creation_date.toISOString() : null
        }))
      });
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error in getCompaniesWithActiveProjects:", error);
    return { success: false, message: error.message };
  }
}
