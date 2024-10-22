const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./helpers/init_mongodb");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", require("./Routes/Auth.Route"));
app.use("/contact", require("./Routes/Contact.Route"));
app.use("/user", require("./Routes/User.Route"));
app.use("/file", require("./Routes/File.Route"));
app.use("/blogs", require("./Routes/Blog.Route"));

app.use("/uploads", express.static(path.join("backend/images")));


app.use("/auth/login",express.static(path.join(__dirname, 'public',"admin")));
app.use("/",express.static(path.join(__dirname, "public", "smlawfirm")));

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname,'./public/laa/index.html'));
});

app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist "));
});

app.use((err, req, res, next) => {
  const urlVars = req.url.split('/')
  console.log(urlVars)
  if (urlVars[2] && urlVars[2] == 'download' && urlVars[3] == 'https:') {
    return res.redirect(`${urlVars[3]}//${urlVars[5]}/${urlVars[6]}/${urlVars[7]}/${urlVars[8]}`)
  }
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
Database ${process.env.MONGODB_URI}
Server Running on port ${PORT}`
);
});
