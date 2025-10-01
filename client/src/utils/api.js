import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const postData = async (url, formData) => {
    console.log('🔍 API CALL [POST]:', url, 'with data:', formData);
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
            console.log('✅ API RESPONSE [POST]:', url, 'success:', data);
            return data;
        } else {
            const errorData = await response.json();
            console.error('❌ API ERROR [POST]:', url, 'error:', errorData);
            return errorData;
        }

    } catch (error) {
        console.error('💥 API EXCEPTION [POST]:', url, 'error:', error);
    }

}



export const fetchDataFromApi = async (url) => {
    console.log('🔍 API CALL [GET]:', url);
    try {
        const fullUrl = apiUrl + url;
        
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 

        const response = await axios.get(fullUrl, params);
        console.log('✅ API RESPONSE [GET]:', url, 'success:', response.data);
        
        return response.data;
    } catch (error) {
        console.error("💥 API EXCEPTION [GET]:", url, "error:", error);
        console.error("💥 API: Error details:", error);
        console.error("💥 API: Error response:", error.response?.data);
        console.error("💥 API: Error status:", error.response?.status);
        return error.response?.data || error;
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




export const editData = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.put(apiUrl + url,updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}


export const deleteData = async (url ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(apiUrl +url,params)
    return res;
}