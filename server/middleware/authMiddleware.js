const jwt = require("jsonwebtoken")
const HttpError = require("../models/ErrorModel")

const authMiddleware = async(req,res,next) =>{
    const Authorization = req.headers.Authorization || req.headers.authorization

    if(Authorization && Authorization.startsWith("Bearer")){
        const token = Authorization.split(" ")[1]

        jwt.verify(token,process.env.JWT_SECRET, (error, info) => {
            if (error) {
                return next(new HttpError("Unauthorized: Invalid Token", 401))
            }

            req.user = info;
            next()
        })
    }
    else{
        return next(new HttpError("Unauthorized: No Token", 401))
    }
}

module.exports = authMiddleware