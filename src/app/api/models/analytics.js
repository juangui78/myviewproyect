import mongoose from "mongoose";

mongoose.models = {};

const schema = mongoose.Schema;
const AnalyticsSchema = new schema({
    withSession: {
        type: Boolean,
        required: true,
        default: false
    },
    projectId : {
        type: schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    secChUaMobile: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Analytics = mongoose.model.Analytics ?? mongoose.model('Analytics', AnalyticsSchema);
export default Analytics;