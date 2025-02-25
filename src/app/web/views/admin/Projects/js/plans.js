

const PLANS = [
    {
        typeOfplan: "static",
        visits: { 
            actual: 0,
            total: 3
        },
        numberOfModels: 3,
        documentation: {
            topographicalPlan: {
                isValid: false,
                urlFile: ""
            },
            urlCadastralFile: "",
            urlWriting: "",
            urlCertificateOfFreedom: "",
            urlLandUse: ""
        },
        digitalPaut: false,
        hectares: {
            from: 0.05,
            to: 5
        },
        months: 3,
        price: 277333,
        totalPayed: 832000
    },
    {
        typeOfplan: "basic",
        visits: { 
            actual: 0,
            total: 3
        },
        numberOfModels: 3,
        documentation: {
            topographicalPlan: {
                isValid: false,
                urlFile: ""
            },
            urlCadastralFile: "",
            urlWriting: "",
            urlCertificateOfFreedom: "",
            urlLandUse: ""
        },
        digitalPaut: true,
        hectares: {
            from: 0.05,
            to: 5
        },
        months: 3,
        price: 277333,
        totalPayed: 832000
    }
]




export const getPlans = async () => {



}