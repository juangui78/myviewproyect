import axios from "axios";

export const getQr = async (id) => {
    try {
        const response = await axios.get(`/api/controllers/users/share`, {
            params: { idProyect: id }
        })

        if (response.status === 200) { 
            return {
                data: response.data.qrCode,
                status: true
             } 
        }
        
    } catch (error) {
        return {
            data: error.response.data.message,
            status: false
        }
    }
}


