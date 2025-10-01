import React, { useContext, useState } from 'react';
import { FaRegImages } from "react-icons/fa6";
import { uploadImage, uploadImages } from '../../utils/api.js';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';


const UploadBox = (props) => {
    const [uploading, setUploading] = useState(false);
    const context = useContext(MyContext);

    const onChangeFile = async (e, apiEndPoint) => {
        try {
            const files = e.target.files;

            if (!files || files.length === 0) {
                return;
            }

            setUploading(true);

            // Clear the form data for new upload
            const formdata = new FormData();
            let selectedImages = [];

            for (var i = 0; i < files.length; i++) {
                if (files[i] && (files[i].type === "image/jpeg" || files[i].type === "image/jpg" ||
                    files[i].type === "image/png" ||
                    files[i].type === "image/webp" || files[i].type === "image/gif")
                ) {
                    const file = files[i];
                    
                    // Check file size (5MB limit)
                    if (file.size > 5 * 1024 * 1024) {
                        context.alertBox("error", "File size must be less than 5MB. Please choose a smaller image.");
                        setUploading(false);
                        return false;
                    }
                    
                    selectedImages.push(file);
                    formdata.append(props?.name, file);
                } else {
                    context.alertBox("error", "Please select a valid JPG, PNG, WebP, or GIF image file.");
                    setUploading(false);
                    return false;
                }
            }

            try {
                const res = await uploadImages(apiEndPoint, formdata);
                setUploading(false);
                
                if (res?.data?.images && res.data.images.length > 0) {
                    // Update parent component with new images
                    props.setPreviewsFun(res.data.images);
                    
                    // Show success message if provided
                    if (res.data.message) {
                        context.alertBox("success", res.data.message);
                    }
                } else {
                    context.alertBox("error", "Failed to upload images. Please try again.");
                }
            } catch (uploadError) {
                setUploading(false);
                console.error("Upload error:", uploadError);
                
                // Check if server returned a specific error message
                const errorMessage = uploadError?.response?.data?.message || 
                                   "Failed to upload images. Please try again.";
                
                context.alertBox("error", errorMessage);
            }

        } catch (error) {
            setUploading(false);
            console.log(error);
            context.alertBox("error", "An error occurred during upload. Please try again.");
        }
    }


    return (
        <div className={`uploadBox p-3 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative ${props?.className ? props.className : 'h-[150px] w-[100%]'}`}>

            {
                uploading === true ? <>
                <CircularProgress />
                <h4 className="text-center">Uploading...</h4>
                </> :
                    <>
                        <FaRegImages className='text-[40px] opacity-35 pointer-events-none' />
                        <h4 className='text-[14px] pointer-events-none'>Image Upload</h4>

                        <input type="file" accept='image/*' multiple={props.multiple !== undefined ? props.multiple : false} className='absolute top-0 left-0 w-full h-full z-50 opacity-0'
                            onChange={(e) =>
                                onChangeFile(e, props?.url)
                            }
                            name={props?.name}
                        />

                    </>

            }


        </div>
    )
}


export default UploadBox;