const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb.js')
const cors = require('cors')
const path = require('path') 

const app = express();
app.use(cors())
app.use(morgan('dev'))   
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use('/content', require('./Routes/content.route.js'))
app.use('/question', require('./Routes/questions.route'))
app.use('/timeInterval', require('./Routes/timeInterval.route.js'))
app.use('/deed', require('./Routes/data.route.js'))

app.get('/',  async (req,res,next) =>{
    res.send("Welcome to the Admin Control Panel...")
});

app.use("/",express.static(path.join(__dirname, "public", "admin-control-panel")));

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname,'./public/admin-control-panel/index.html'));
  });
  

app.use(async (req,res,next)=>{  
    next(createError.NotFound('This route does not exist '));

});

app.use((err,req,res,next)=>{
    res.status(err.status || 500)
    res.send({
        error:{
            status: err.status || 500,
            message: err.message,
        }
    })
});


const PORT = process.env.PORT || 4000

app.listen(PORT,() =>{
    console.log(`Server Running on port ${PORT}`)

});