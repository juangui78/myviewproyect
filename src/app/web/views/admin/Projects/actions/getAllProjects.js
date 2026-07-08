"use server"
import project from "@/api/models/proyect";
import Analytics from "@/api/models/analytics";
import { dbConnected } from "@/api/libs/mongoose";
import { decrypt } from "@/api/libs/crypto";

dbConnected();

export async function getAllProjects(id) {
    try {
        const idDecrypted = decrypt(id);
        const projects = await project.find({ idCompany: idDecrypted }, { idCompany: 0,  creation_date: 0, __v : 0 }).lean();
        
        // Fetch views from Analytics
        const projectIds = projects.map(proj => proj._id);
        const viewsData = await Analytics.aggregate([
            { $match: { projectId: { $in: projectIds } } },
            { $group: { _id: "$projectId", count: { $sum: 1 } } }
        ]);

        // Map views to project ID
        const viewsMap = {};
        viewsData.forEach(item => {
            viewsMap[item._id.toString()] = item.count;
        });

        const plainProjects = projects.map(proj => ({
            ...proj,
            _id: proj._id.toString(),
            views: viewsMap[proj._id.toString()] || 0
        }));

        return {
            success: true,
            data: plainProjects
        }

    } catch (error) {
        console.log(error)
        return {
            message: "Error en el servidor.",
            success: false
        }
    }
}

export async function getProjectsTimelineStats(id, range = "30") {
    try {
        await dbConnected();
        const idDecrypted = decrypt(id);
        const projects = await project.find({ idCompany: idDecrypted }, { _id: 1 }).lean();
        const projectIds = projects.map(p => p._id);
        
        let matchQuery = { projectId: { $in: projectIds } };
        let groupingType = "day"; // "hour" or "day"
        let limitDate = null;
        
        if (range === "1") {
            // Last 24 hours
            limitDate = new Date();
            limitDate.setHours(limitDate.getHours() - 24);
            matchQuery.createdAt = { $gte: limitDate };
            groupingType = "hour";
        } else if (range === "15") {
            limitDate = new Date();
            limitDate.setDate(limitDate.getDate() - 15);
            limitDate.setHours(0, 0, 0, 0);
            matchQuery.createdAt = { $gte: limitDate };
        } else if (range === "30") {
            limitDate = new Date();
            limitDate.setDate(limitDate.getDate() - 30);
            limitDate.setHours(0, 0, 0, 0);
            matchQuery.createdAt = { $gte: limitDate };
        } else if (range === "all") {
            // All time: no date limit!
        }
        
        const analytics = await Analytics.find(matchQuery, { createdAt: 1 }).sort({ createdAt: 1 }).lean();
        
        let chartData = [];
        
        if (groupingType === "hour") {
            // Populate last 24 hours
            const viewsPerHour = {};
            for (let i = 23; i >= 0; i--) {
                const date = new Date();
                date.setHours(date.getHours() - i);
                const hourStr = `${date.getHours().toString().padStart(2, '0')}:00`;
                viewsPerHour[hourStr] = { count: 0, dateKey: hourStr };
            }
            
            analytics.forEach(record => {
                if (record.createdAt) {
                    const hr = `${record.createdAt.getHours().toString().padStart(2, '0')}:00`;
                    if (viewsPerHour[hr] !== undefined) {
                        viewsPerHour[hr].count++;
                    }
                }
            });
            
            chartData = Object.keys(viewsPerHour).map(hour => ({
                label: hour,
                views: viewsPerHour[hour].count
            }));
        } else {
            // Group by day
            const viewsPerDay = {};
            
            if (range === "all") {
                if (analytics.length === 0) {
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toISOString().split('T')[0];
                        viewsPerDay[dateStr] = 0;
                    }
                } else {
                    const oldestDate = new Date(analytics[0].createdAt);
                    oldestDate.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    let curr = new Date(oldestDate);
                    while (curr <= today) {
                        const dateStr = curr.toISOString().split('T')[0];
                        viewsPerDay[dateStr] = 0;
                        curr.setDate(curr.getDate() + 1);
                    }
                }
            } else {
                const numDays = parseInt(range, 10);
                for (let i = numDays - 1; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    viewsPerDay[dateStr] = 0;
                }
            }
            
            analytics.forEach(record => {
                if (record.createdAt) {
                    const dateStr = record.createdAt.toISOString().split('T')[0];
                    if (viewsPerDay[dateStr] !== undefined) {
                        viewsPerDay[dateStr]++;
                    }
                }
            });
            
            chartData = Object.keys(viewsPerDay).map(date => {
                const parts = date.split("-");
                return {
                    label: `${parts[2]}/${parts[1]}`, // DD/MM format
                    views: viewsPerDay[date]
                };
            });
        }
        
        return {
            success: true,
            data: chartData
        };
    } catch (error) {
        console.error("Error in getProjectsTimelineStats server action:", error);
        return { success: false, message: "Error al cargar estadísticas de visualizaciones." };
    }
}