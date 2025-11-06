const multer  = require('multer');
const fs = require('fs');

const uploadImage = function (reportId, destPath, filename) {
    const oDestPath = destPath;
    const oFilename = filename;
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            cb(null, oDestPath);
        },
        filename: (req, file, cb) => {
            let filetype = '';            
            if(file.mimetype === 'image/gif') {
                filetype = 'gif';
            }
            if(file.mimetype === 'image/png') {
                filetype = 'png';
            }
            if(file.mimetype === 'image/jpeg') {
                filetype = 'jpg';
            }
            cb(null, `${oFilename}.${filetype}`);
        }
    });
    
    const upload = multer({"storage": storage}).any();
    return upload;
}


exports.uploadImage = uploadImage;