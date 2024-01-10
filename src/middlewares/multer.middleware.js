import multer from "multer"

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function (req, file, cb){
        // the safest way to upload files, but the files are staying in temp for low amounnt of time, so we will come up with lesser complex approach
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1e9)
        // cb(null,file.fieldname + '-' + uniqueSuffix)
        cb(null, file.originalname)                     //upload with whatever name user gives to the file
    }
})

export const upload = multer({storage:storage})     // export const upload = multer({storage}) , this works too