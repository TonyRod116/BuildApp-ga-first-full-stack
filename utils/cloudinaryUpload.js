import { cloudinary } from "./cloudinary.js"
import { createReadStream } from "streamifier"

export function cloudinaryUpload(fileBuffer, type = 'image'){
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'image-upload-lab-buildapp',
        resource_type: type
      }, // Options object - allows us to specify the folder to store it in on cloudinary
      (err, result) => {
        if (result) resolve(result)
        else reject(err)
      }
    )
    createReadStream(fileBuffer).pipe(stream)
  })
}