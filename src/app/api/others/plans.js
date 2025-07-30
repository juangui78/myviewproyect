const PLANS = [
    {
        typeOfplan: "static",
        visits: { 
            actual: 0,
            total: 1,
            perMonth: 1
        },
        numberOfModels: 1,
        documentation: {
            topographicalPlan: {
                isValid: false,
                urlFile: ""
            },
            urlCadastralFile: {
                isValid: false,
                urlFile: ""
            },
            urlWriting: {
                isValid: false,
                urlFile: ""
            },
            urlCertificateOfFreedom: {
                isValid: false,
                urlFile: ""
            },
            urlLandUse: {
                isValid: false,
                urlFile: ""
            }
        },
        digitalPaut: {
            isValid: false,
            stimatedScope: 0,
            modelViews: 0
        },
        quality: 250000,
        area: {
            from: 500,
            to: 50000
        },
        months: 6,
        totalPayed: 1232000
    },
    
    {
        typeOfplan: "basic",
        visits: { 
            actual: 0,
            total: 3,
            perMonth: 2
        },
        numberOfModels: 3,
        documentation: {
            topographicalPlan: {
                isValid: false,
                urlFile: ""
            },
            urlCadastralFile: {
                isValid: false,
                urlFile: ""
            },
            urlWriting: {
                isValid: false,
                urlFile: ""
            },
            urlCertificateOfFreedom: {
                isValid: false,
                urlFile: ""
            },
            urlLandUse: {
                isValid: false,
                urlFile: ""
            }
        },
        digitalPaut: {
            isValid: false,
            stimatedScope: 0,
            modelViews: 0
        },
        quality: 250000,
        area: {
            from: 500,
            to: 50000
        },
        months: 6,
        discount: 0,
        totalPayed: 2432000
    },

    {
        typeOfplan: "plus",
        visits: { 
            actual: 0,
            total: 3,
            perMonth: 2
        },
        numberOfModels: 3,
        documentation: {
            topographicalPlan: {
                isValid: false,
                urlFile: ""
            },
            urlCadastralFile: {
                isValid: false,
                urlFile: ""
            },
            urlWriting: {
                isValid: false,
                urlFile: ""
            },
            urlCertificateOfFreedom: {
                isValid: false,
                urlFile: ""
            },
            urlLandUse: {
                isValid: false,
                urlFile: ""
            }
        },
        digitalPaut: {
            isValid: true,
            stimatedScope: 250000,
            modelViews: 9500
        },
        quality: 500000,
        area: {
            from: 50000,
            to: 100000
        },
        months: 6,
        discount: 0,
        totalPayed: 4172800
    },

    {
        typeOfplan: "pro",
        visits: { 
            actual: 0,
            total: 3,
            perMonth: 2
        },
        numberOfModels: 3,
        documentation: {
            topographicalPlan: {
                isValid: false,
                urlFile: ""
            },
            urlCadastralFile: {
                isValid: false,
                urlFile: ""
            },
            urlWriting: {
                isValid: false,
                urlFile: ""
            },
            urlCertificateOfFreedom: {
                isValid: false,
                urlFile: ""
            },
            urlLandUse: {
                isValid: false,
                urlFile: ""
            }
        },
        digitalPaut: {
            isValid: true,
            stimatedScope: 330000,
            modelViews: 12000
        },
        quality: 750000,
        area: {
            from: 100000,
            to: 200000
        },
        months: 6,
        discount: 0,
        totalPayed: 6228480
    },

    {
        typeOfplan: "enterprise",
        visits: { 
            actual: 0,
            total: 0,
            perMonth: 0
        },
        numberOfModels: 0,
        documentation: {
            topographicalPlan: {
                isValid: false,
                urlFile: ""
            },
            urlCadastralFile: {
                isValid: false,
                urlFile: ""
            },
            urlWriting: {
                isValid: false,
                urlFile: ""
            },
            urlCertificateOfFreedom: {
                isValid: false,
                urlFile: ""
            },
            urlLandUse: {
                isValid: false,
                urlFile: ""
            }
        },
        digitalPaut: {
            isValid: true,
            stimatedScope: 0,
            modelViews: 0
        },
        quality: 0,
        area: {
            from: 0,
            to: 0
        },
        months: 0,
        discount: 0,
        totalPayed: 0
    },
]




export const getPlanJson = (typeOfPlan) => {

    const filteredPlan = PLANS.find(item => item.typeOfplan === typeOfPlan);
 
    if (!filteredPlan) {
        return null;
    }

    return filteredPlan;
}