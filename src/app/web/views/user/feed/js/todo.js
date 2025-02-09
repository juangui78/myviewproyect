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

export const getTodoUsers = async (ID_USER) => { //get all user from one user => the admin

    try {
        const response = await axios.get(`/api/controllers/users/${ID_USER}`);

        if (response.status !== 200){
            return ["error", []]
        }

        return ["success", response.data]
    } catch (error) {
        console.error(error)
        return ["error", []]
    }
}

export const shareModelToUser = async (email, permissions) => {
    console.log(email, permissions)
    try {
        const response = await axios.post(`/api/controllers/users/share`, {
            email,
            permissions
        });

        
    } catch (error) {
        console.error(error)
    }
}