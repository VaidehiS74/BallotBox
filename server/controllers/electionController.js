const {v4: uuid} = require("uuid")
const cloudinary = require("../utils/cloudinary")
const ElectionModel = require("../models/electionModel")
const CandidateModel = require('../models/candidateModel')
const path = require("path")
const HttpError = require("../models/ErrorModel")










//==============ADD NEW ELECTION
// POST: api/elections
//PROTECTED (only admin)
const addElection = async (req,res,next) => {
    try{
    //only admin can add election
    if(!req.user.isAdmin){
        return next(new HttpError("Only an admin can perform this action"))
    }

    const {title,description} = req.body;
    if(!title || !description){
        return next(new HttpError("Please provide title and description"),422)
    }

    if(!req.files.thumbnail){
        return next(new HttpError("Please provide a thumbnail"),422)

    }

    const {thumbnail } = req.files;

    //image size must be less than 1mb
    if(thumbnail.size > 1000000){
        return next(new HttpError("Thumbnail size must be less than 1mb"),422)
    }

    //rename the image 
    let fileName = thumbnail.name;
    fileName = fileName.split(".")
    fileName = fileName[0] + uuid() + "." + fileName[fileName.lenngth - 1]

    //upload file to upload folder 
    await thumbnail.mv(path.join(__dirname,"..",'uploads',fileName), 
        async(error) => {
            if(error){
                return next(new HttpError(error))
            }

    //store image on cloudinary
    const result = await cloudinary.uploader.upload(path.join(__dirname,"..",'uploads',fileName),{resource_type: "image"})
    if(!result.secure_url){
        return next(new HttpError("Couldn't upload image to cloudinary"),422)
    }

    //save election to database
    const newElection = await ElectionModel.create({title,description,thumbnail: result.secure_url})
    res.json(newElection)

    })
    }
    catch(error){
        return next(new HttpError(error,500))
    }
}


















//==============GET ALL ELECTION
// GET: api/elections
//PROTECTED 
const getElections = async (req,res,next) => {
    try{
        const elections = await ElectionModel.find();
        res.status(200).json(elections)
    }
    catch(error){
        return next(new HttpError(error,500))
    }
}
















//==============GET SINGLE ELECTION
// GET: api/elections/id
//PROTECTED 
const getElection = async (req,res,next) => {
    try{
        const {id} = req.params;
        const election = await ElectionModel.findById(id);
        res.status(200).json(election)
    }
    catch(error){
        return next(new HttpError(error,500))
    }
}
















//==============GET ELECTION CANDIDATES
// GET: api/elections/id/candidates
//PROTECTED 
const getCandidatesOfElection = async (req,res,next) => {
    try{
        const {id} = req.params;
        const candidates = await CandidateModel.find({election:id});
        res.status(200).json(candidates)
    }catch(error){
        return next(new HttpError(error,500))
    }   
}













//==============GET VOTERS OF ELECTION
// GET: api/elections/id/voters
//PROTECTED 
const getElectionVoters = async (req,res,next) => {
    try{
        const {id} = req.params;
        const response = await ElectionModel.findById(id).populate('voters')
        res.status(200).json(response.voters)
    }
    catch(error){
        return next(new HttpError(error,500))
    }
}




















//==============UPDATE ELECTION
// PATCH: api/elections/id
//PROTECTED (only admin)
const updateElection = async (req,res,next) => {
    try{
    //only admin can add election
    if(!req.user.isAdmin){
        return next(new HttpError("Only an admin can perform this action"))
    }

    const {id} = req.params;
    const {title,description} = req.body;
    if(!title || !description){
        return next(new HttpError("Please provide title and description"),422)
    }
    if(req.files.thumbnail){
        const {thumbnail} = req.files;
        if(thumbnail.size > 1000000) {
            return next(new HttpError("Thumbnail size should be less than 1MB",422))
        }

        //rename the image 
        let fileName = thumbnail.name;
        fileName = fileName.split(".")
        fileName = fileName[0] + uuid() + "." + fileName[fileName.lenngth - 1]

        thumbnail.mv(path.join(__dirname,"..",'uploads',fileName), async (error) => {
            if(error){
                return next(new HttpError(error,500))
            }

            //if no error then upload on cloudinary
            const result = await cloudinary.uploader.upload(path.join(__dirname,"..",'uploads',fileName),{resource_type: "image"})

            //check if cloudinary was successful
            if(!result.secure_url){
                return next(new HttpError("Failed to upload image on cloudinary",500))
            }

            await ElectionModel.findByIdAndUpdate(id, {title,description,thumbnail:result.secure_url})

            res.status(200).json("Election updated successfully")
        })
    }
    }
    catch(error){
        return next(new HttpError(error,500))
    }
}





















//==============DELETE ELECTION
// DELETE: api/elections/id
//PROTECTED (only admin)
const removeElection = async (req,res,next) => {
    try{
    //only admin can add election
    // if(!req.user.isAdmin){
    //     return next(new HttpError("Only an admin can perform this action"))
    // }

    const {id} = req.params;
    await ElectionModel.findByIdAndDelete(id)

    //delete all the candidate that belong to this electiom
    await CandidateModel.deleteMany({election:id})

    res.status(200).json("Election deleted successfully")

    }
    catch(error){
        return next(new HttpError(error,500))
    }
}




module.exports = {addElection, getElections,getElection,updateElection,removeElection,getCandidatesOfElection,getElectionVoters}