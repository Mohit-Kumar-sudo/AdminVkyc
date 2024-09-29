//----importing packages
const express = require('express');
const multer = require('multer');
const router = express();
const {verifyToken} = require('../middleware/verifytokendata.js')

//----multer code ----
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

 // Accept Certain type of file validation
 const fileFilter = (req, file, cb) => {
   
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } 
    else {
        cb(null, false);
    }
};

// Accept Certain size of file validation
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter:fileFilter
});


module.exports = (app) => {

    //---importing controllers --------
    const blogs = require('../controller/blogs.controller.js');

    // Create a new Blogs
    app.post('/blogs', upload.single('image'),verifyToken, blogs.create);

    // // Retrieve all Blogs
    app.get('/blogs', blogs.findAll);

    // // Retrieve a single Blogs with BlogsId
    app.get('/blogs/:blogsId', blogs.findOne);

    // // Update a Blogs with BlogsId
    app.put('/blogs/:blogsId', upload.single('image'), verifyToken, blogs.update);

    // // Delete a Blogs with BlogsId
    app.delete('/blogs/:blogsId',verifyToken, blogs.delete);

    // // Delete all Blogs
    app.delete('/blogs',verifyToken, blogs.deleteAll);
};