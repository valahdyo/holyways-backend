const multer = require("multer");
const maxSize = 2 * 1024 * 1024;

exports.uploadFile = (imageFile) => {

    //Setting up multer (destination storage, image only, limit size)
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "uploads");
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
        },
    });
    
    const fileFilter = (req, file, cb) => {
        if (file.fieldname === imageFile) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
                req.FileValidationError = {
                    message: "Only image file with jpg, jpg, and png format allowed"
                }
                return cb(new Error("Only image file with jpg, jpg, and png format allowed"), false)
            }
        }
        cb(null, true)
    }
    
    const uploadFile = multer({
      storage,
      fileFilter,
      limits: { fileSize: maxSize },
    }).single(imageFile);

    //Return to next middleware / controller if no error
    return (req, res, next) => {        
        uploadFile(req, res, (err) => {
            if (!req.file && !err) {
                if (req.method === "PATCH" && Object.keys(req.body).length === 0) 
                    return res.status(400).send({message: "Please select image file to upload"})
                
                if (req.method === "POST") 
                    return res.status(400).send({message: "Please select image file to upload"})
                              
            }
            if (req.FileValidationError) {
                return res.status(400).send(req.FileValidationError)
            }
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE"){
                    return res.status(400).send({message: `Max image file to upload is ${maxSize/1024} KB`})
                }
            }
            next()
        }) 
    }
}



