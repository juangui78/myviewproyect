import axios from "axios"

export const getTodoList = async (id) => {
    try {
        const response = await axios.get(`/api/controllers/proyects/${id}`);

        if (response.status !== 200) {
            return ["error", {}]
        }
    
        return ["success", response.data]
        
    } catch (error) {
        return ["error", {}]
    }
  
}


