const express = require("express")
const cors = require("cors")
const {connect} = require("mongoose")
require("dotenv").config()
const upload = require("express-fileupload")

const Routes = require('./routes/Routes')

const {notFound, errorHandler } = require("./middleware/errorMiddleware")

const app = express()
app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(cors({credentials: true, origin: ["http://localhost:3000" , "https://ballotbox-frontend.onrender.com"]}))
app.use(upload())


//debugging
// app.use((req, res, next) => {
//   console.log("🌐 Incoming request:", req.method, req.originalUrl);
//   next();
// });


app.use('/api', Routes)

app.use((req, res, next) => {
  console.log("❌ Route not matched:", req.method, req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});


app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URL).then(app.listen(process.env.PORT, () => console.log(`server started at port ${process.env.PORT}`))).catch(err => console.log(err))

app.get("/", (req, res) => {
  res.send("API is running 🟢");
});








