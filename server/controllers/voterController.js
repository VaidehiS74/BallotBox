const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken')

const VoterModel = require('../models/voterModel')
const HttpError = require('../models/ErrorModel')


//==============REGISTER NEW VOTER
// POST: api/voters/register
//UNPROTECTED
const registerVoter = async (req,res,next) => {
    try{
        const {fullName,aadharNumber, email, password, password2} = req.body;
        

        //debugging
        console.log(req.body);

        if (!fullName?.trim() || !aadharNumber?.trim() || !email?.trim() || !password?.trim() || !password2?.trim()) {
            return next(new HttpError('Please fill in all fields', 422));
        }


        //validate aadhar & check pattern
        if (!/^[2-9]{1}[0-9]{11}$/.test(aadharNumber)) {
            return next(new HttpError('Invalid Aadhaar number. It must be 12 digits and cannot start with 0 or 1.', 400));
        }

        const aadhaarExists = await VoterModel.findOne({ aadharNumber });
        if (aadhaarExists) {
            return next(new HttpError('Aadhaar number already registered.', 422));
        }

        //all email should be lower cased
        const newEmail = email.toLowerCase()

        //check if email is already in db
        //should validate first before hitting db
        if (!validator.isEmail(newEmail)) {
            return next(new HttpError('Invalid email format', 400));
        }

        const emailExists = await VoterModel.findOne({email: newEmail})

        if(emailExists){
            return next(new HttpError('Email already exists', 422))
        }

        //make sure password is 6+ char
        if(password.trim().length < 6){
            return next(new HttpError('Password must be at least 6 characters long', 422))
        }

        //password and confirm password must be same
        if(password.trim() !== password2.trim()){
            return next(new HttpError('Passwords do not match', 422))
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //no user/voter should be admin other than admin@gmail.com
        let isAdmin = false;
        if(newEmail == 'webdevmsit@gmail.com'){
            isAdmin = true;
        }

        //add user in db
        const newVoter = await VoterModel.create({
            fullName,
            email: newEmail,
            aadharNumber,
            password: hashedPassword,
            isAdmin
        })
        res.status(201).json(`New Voter ${fullName} created.`)

    }catch(error){
        console.error("ERROR:", error);
        return next(new HttpError(error.message || "Voter registration failed", 500));
    }
}












//function to generate token

const generateToken = (payload) => {
    const token = jwt.sign(payload,process.env.JWT_SECRET, {expiresIn: '1d'})
    return token
}





//==============LOGIN VOTER
// POST: api/voters/login
//UNPROTECTED
const loginVoter = async (req,res,next) => {
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return newxt(new HttpError('Fill all details',422))
        }

        const newEmail = email.toLowerCase()
        const voter = await VoterModel.findOne({email:newEmail})

        //check if voter exists
        if(!voter){
            return next(new HttpError('Invalid Credentials',401))
        }

        //check is password is correct
        const comparePass = await bcrypt.compare(password,voter.password)   

        if(!comparePass){
            return next(new HttpError('Invalid Credentials',401))
        }

        //send token is password matches
        const {_id: id, isAdmin, votedElections } = voter;

        const token = generateToken({id,isAdmin})

        res.json({token,id,votedElections, isAdmin})

    }catch{
        console.error("ERROR:", error);
        return next(new HttpError(error.message || "Login failed. Please check credentials and try again.", 422));
    }
}

















//==============GET VOTER BY ID
// POST: api/voters/:id
//PROTECTED
const getVoter = async (req,res,next) => {
    try{
        const {id} = req.params;
        const voter = await VoterModel.findById(id).select("-password")
        res.json(voter)
    }
    catch(error){
        return next(HttpError("Couldn't get voter",404))
    }
}











module.exports = {registerVoter,loginVoter, getVoter}