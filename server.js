const express =require('express')
const app = express()
const userRoutes = require('./routes/userRoutes')
const profileRoutes =require('./routes/profileRoutes')
const mongoose=require('mongoose')
const passport=require('passport')
require('dotenv').config({path:'./config/.env'})

//middlewares
app.use(express.json())
app.use(passport.initialize())
//require passport config
require('./config/passport')(passport)

//setting routes
//users routes
app.use('/api/users',userRoutes)

//profile routes
app.use('/api/profile',profileRoutes)

//setting global variables
PORT=process.env.PORT||6000
DB_URI=process.env.DB_URI


//connecting the DB:
mongoose.connect(DB_URI,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(()=>{console.log('The Database connected successfully')})
.catch((err)=>{console.log('The Database not connected :' + err)})


//Server is listening for request
app.listen(PORT,(err)=>{
    console.log(`The Server is listening for request on PORT: ${PORT}`)
})