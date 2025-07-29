import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;

const plans_schema = new Schema({
    typeOfplan: {
        type: String,
        required: true,
        enum: ['static', 'basic', 'plus', 'pro', 'enterprise'],
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
        },
        perMonth: {
            type: Number,
            required: true,
            default: 1,
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
        urlWriting: {
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
        urlCertificateOfFreedom: {
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
        urlLandUse: {
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
    },
    digitalPaut: {
        isValid: {
            type: Boolean,
            required: true,
            default: false
        },
        stimatedScope: {
            type: Number,
            required: true,
            default: 0
        },
        modelViews: {
            type: Number,
            required: true,
            default: 0
        }
    },
    quality: {
        type: Number,
        required: true,
    },
    area: {
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
    discount: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede ser mayor al 100%']
    },
    totalPayed: {
        type: Number,
        required: true
    }
});



const Plans = mongoose.models.Plans || mongoose.model('Plans', plans_schema);
export default Plans;
