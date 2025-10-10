var multer = require("multer")
var path = require("path")
var fs = require("fs")
const dateObj = new Date()
const month = dateObj.getUTCMonth() + 1
const day = dateObj.getUTCDate()
const year = dateObj.getUTCFullYear()

// Path normalization helper function
const normalizePath = (filePath) => {
    if (!filePath) return filePath;
    // Replace all backslashes with forward slashes and remove any double slashes
    return filePath.replace(/\\/g, '/').replace(/\/\//g, '/');
};

var store = multer.diskStorage({
    destination: function(req, file, cb) {
        if (!fs.existsSync('./uploads/' + year)) {
            fs.mkdirSync('./uploads/' + year)
        }
        if (!fs.existsSync('./uploads/' + year + '/' + month)) {
            fs.mkdirSync('./uploads/' + year + '/' + month)
        }
        cb(null, './uploads/' + year + '/' + month)
    },
    filename: function(req, file, cb) {
        cb(null, Date.now().toString() + path.extname(file.originalname))
    }
})

var Studentstorage = multer.diskStorage({
    destination: function(req, file, cb) {
        var url_string = req.params.id;
        var urlInArray = url_string.split(',');

        /**
         * converting array url in directory structure to check the avaialbilty of the directory
         */
        var directory_path = '';
        urlInArray.forEach(element => {
            directory_path = directory_path + '/' + element;
        });
        if (fs.existsSync('./uploads/' + directory_path)) {
            //file exists
        } else {
            var recurring_path = ''
            urlInArray.forEach(element => {
                recurring_path = recurring_path + '/' + element;
                fs.mkdirSync('./uploads/' + recurring_path);
            });
        }
        cb(null, "./uploads/" + directory_path);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

var StudentUpload = multer({ storage: Studentstorage }).single("file");
var upload = multer({ storage: store }).single("file")

module.exports = {
    upload: (req, res) => {
        upload(req, res, function(err) {
            if (err) {
                return res.status(501).json({ error: err })
            }
            
            // Normalize the file path before sending response
            const originalPath = req.file.path;
            const normalizedPath = normalizePath(originalPath);
            
            console.log("Original file path:", originalPath);
            console.log("Normalized file path:", normalizedPath);
            
            // Create response with normalized path
            const responseFile = {
                ...req.file,
                path: normalizedPath
            };
            
            return res.json({ 
                msg: "Uploaded Successfully", 
                file: responseFile, 
                fileName: req.file.filename,
                path: normalizedPath // Additional path field for easy access
            })
        })
    },

    uploadDocument: (req, res) => {
        StudentUpload(req, res, function(err) {
            if (err) {
                return res.status(501).json({ error: err });
            }
            
            // Normalize the file path for document uploads
            if (req.file && req.file.path) {
                const originalPath = req.file.path;
                const normalizedPath = normalizePath(originalPath);
                
                console.log("Original document path:", originalPath);
                console.log("Normalized document path:", normalizedPath);
                
                req.file.path = normalizedPath;
            }
            
            return res.json({ 
                msg: "Uploaded Successfully", 
                file: req.file 
            });
        });
    },

    download: (req, res) => {
        // Build file path and normalize it
        let filepath = path.join(__dirname, "/../") + req.params.folder1 + '/' + req.params.folder2 + '/' + req.params.folder3 + '/' + req.params.filename;
        filepath = normalizePath(filepath);
        
        let defaultfilepath = path.join(__dirname, "/../public/uploads") + "/no-image.png";
        defaultfilepath = normalizePath(defaultfilepath);
        
        console.log("Download file path:", filepath);
        console.log("Default file path:", defaultfilepath);
        
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath)
        } else {
            res.sendFile(defaultfilepath)
        }
    },

    folderDownload: (req, res) => {
        // Build file path and normalize it
        let filepath = path.join(__dirname, "/../uploads") + "/" + req.params.folder + "/" + req.params.filename;
        filepath = normalizePath(filepath);
        
        let defaultfilepath = path.join(__dirname, "/../public/uploads") + "/no-image.png";
        defaultfilepath = normalizePath(defaultfilepath);
        
        console.log("Folder download file path:", filepath);
        console.log("Default file path:", defaultfilepath);
        
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath)
        } else {
            res.sendFile(defaultfilepath)
        }
    }
}