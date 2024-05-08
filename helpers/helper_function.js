
var multer = require("multer")
var path = require("path")
var fs = require("fs")

var store = multer.diskStorage({

    destination: function (req, file, cb) {
        if (!fs.existsSync('./uploads/' + year)) {
            fs.mkdirSync('./uploads/' + year)
        }
        if (!fs.existsSync('./uploads/')) {
            fs.mkdirSync('./uploads/')
        }
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString() + path.extname(file.originalname))
        // cb(null, req.body.docname + '.jpg')
    }
})

var upload = multer({ storage: store }).single("file")

module.exports = {
    upload: (req, res) => {
        upload(req, res, function (err) {
            if (err) {
                return res.status(501).json({ error: err })
            }
            return res.json({ msg: "Uploaded Successfully", file: req.file, "fileName": req.file.filename })
        })
    },
}