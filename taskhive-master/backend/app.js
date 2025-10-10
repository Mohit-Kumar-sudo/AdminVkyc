require("dotenv").config();
require("./helpers/init_mongodb");
const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.options('*', cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); 

// CREATE RECEIPTS DIRECTORY ON SERVER STARTUP
const uploadsDir = path.join(__dirname, 'uploads');
const receiptsDir = path.join(__dirname, 'uploads', 'receipts');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Ensure receipts subdirectory exists
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
  console.log('✅ Receipts directory created at:', receiptsDir);
} else {
  console.log('✅ Receipts directory exists at:', receiptsDir);
}

// ROUTES
app.use("/auth", require("./Routes/Auth.Route"));
app.use("/contact", require("./Routes/Contact.Route"));
app.use("/course-query", require("./Routes/Course.Route"));
app.use("/courses", require("./Routes/Courses.Route"));
app.use("/carrier-query", require("./Routes/Carrier-Query.Route"));
app.use("/carriers", require("./Routes/Carriers.Route"));
app.use("/user", require("./Routes/User.Route"));
app.use("/file", require("./Routes/File.Route"));
app.use("/blogs", require("./Routes/Blog.Route"));
app.use("/testimonials", require("./Routes/Testimonials.Route"));
app.use("/teams", require("./Routes/Team.Route"));
app.use("/students", require("./Routes/Student.Route"));
app.use("/certificates", require("./Routes/Certificates.Route"));
app.use("/projects", require("./Routes/Project.Route"));

// SERVE STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", async (req, res, next) => {
  res.send("Server is running...");
});

app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
Database ${process.env.MONGODB_URI}
Server Running on port ${PORT}`
);
});