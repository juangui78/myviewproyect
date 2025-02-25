import mongoose from 'mongoose';

mongoose.model = {}

const Schema = mongoose.Schema;
const PlanSchema = new Schema({
    typeOfplan: {
        type: String,
        required: true,
        enum: ['static', 'basic', 'medium', 'pro', 'enterprise'],
    },
    visits: { // visit and flying with the drone depens of the typeOfPlan
        actual: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'min value exceded']
        },
        total: {
            type: Number,
            required: true,
            min: [1, 'min value exceded']
        }
    },
    numberOfModels: {
        type: Number,
        required: true
    },
    documentation: {
        topographicalPlan: {
            isValid: {
                type: Boolean,
                required: true,
                default: false
            },
            urlFile: {
                type: String,
                required: false
            }
        },
        urlCadastralFile: {
            type: String,
            required: false
        },
        urlWriting: {
            type: String,
            required: false
        },
        urlCertificateOfFreedom: {
            type: String,
            required: false
        },
        urlLandUse: {
            type: String,
            required: false
        },
    },
    digitalPaut: {
        type: Boolean,
        default: false,
        required: true
    },
    hectares : {
        from: {
            type: Number,
            required: true
        },
        to: {
            type: Number,
            required: true
        }
    },
    months: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalPayed: {
        type: Number,
        required: true
    }
})

const Plan = mongoose.model.Plan ??  mongoose.model('Plan', PlanSchema);
export default Plan;