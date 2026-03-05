import multer from 'multer';
// multer is used for file uploads 
import path from 'path';
// path is used to extracts file extension like .pdf,.jpg and for handling file paths
import fs from 'fs';
// used to create folders and check if a folder exists or not

// ensure upload directory exists
const uploadDir='uploads/medical-reports';
// uploadDir defines where uploaded files will be stored
if(!fs.existsSync(uploadDir)){  // check if folder exists or not
    fs.mkdirSync(uploadDir, {recursive: true});
}// if folder not exists it creates it. recursive: true means if uploads/ doesn't exist then it creates the whole structure automatically

// Storage config
const storage=multer.diskStorage({
    // multer has two storage types: diskStorage() -> saves files to a folder and memoryStorage() -> keeps files in RAM
    destination: (req,file,cb)=>{
        // file -> file being uploaded
        // cb -> callback function
    cb(null, uploadDir);    
    },
    filename: (req,file,cb)=>{
        const uniqueName=`${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
        // userId_timestamp.extension
        // 5_17122.pdf
        cb(null,uniqueName);
    }
});
// file filter -only allow pdf,jpg,png,docx
const fileFilter=(req,file,cb)=>{
    const allowedTypes=[
        'application/pdf',
        'image/jpeg',
        'image/png',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);
    } else {
        cb(new Error('Only pdf,jpg,png and docx files are allowed'),false);
}    
};

const upload=multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 10*1024*1024   // 10MB max
    }
});

export default upload;
