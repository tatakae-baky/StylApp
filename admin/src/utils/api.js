import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const postData = async (url, formData) => {
    try {
        
        const response = await fetch(apiUrl + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },

            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }

}

export const putData = async (url, formData) => {
    try {
        const response = await fetch(apiUrl + url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }
    } catch (error) {
        console.error('Error:', error);
        return { error: true, message: error.message };
    }
}



export const fetchDataFromApi = async (url) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 

        const { data } = await axios.get(apiUrl + url,params)
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}


export const uploadImage = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'multipart/form-data', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.put(apiUrl + url,updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}


export const uploadImages = async (url, formData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'multipart/form-data', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.post(apiUrl + url,formData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}



export const editData = async (url, updatedData) => {
    try {
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        };

        // If updatedData is FormData, don't set Content-Type (let browser set it with boundary)
        if (!(updatedData instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const params = { headers };

        const response = await axios.put(apiUrl + url, updatedData, params);
        return response.data;
    } catch (error) {
        console.error('Edit error:', error);
        return error.response?.data || { error: true, message: error.message };
    }
};

// PATCH helper for partial updates or action endpoints
export const patchData = async (url, updatedData) => {
    try {
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        };
        if (!(updatedData instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        const params = { headers };
        const response = await axios.patch(apiUrl + url, updatedData, params);
        return response.data;
    } catch (error) {
        console.error('Patch error:', error);
        return error.response?.data || { error: true, message: error.message };
    }
}





export const deleteImages = async (url, image) => {
    try {
        const params = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            },
        };
        
        const response = await axios.delete(apiUrl + url, params);
        return response.data;
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};


export const deleteData = async (url ) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 
        const { data } = await axios.delete(apiUrl + url,params)
        return data;
    } catch (error) {
        console.log(error);
        return error.response?.data || error;
    }
}

export const deleteMultipleData = async (url,data ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(apiUrl + url,data,params)
    return res;
}
