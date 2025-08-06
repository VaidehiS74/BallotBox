const {v4: uuid} = require("uuid")
const cloudinary = require("../utils/cloudinary")
const path = require('path')
const mongoose = require('mongoose')

const HttpError = require("../models/ErrorModel")
const ElectionModel = require('../models/electionModel')
const CandidateModel = require("../models/candidateModel")
const VoterModel = require("../models/voterModel")
const { setEngine } = require("crypto")










//==============ADD CANDIDATE
// POST: api/candidates
//PROTECTED (only admin)
const addCandidates = async (req,res,next) => {
    try{
    //only admin can add election
    if(!req.user.isAdmin){
        return next(new HttpError("Only an admin can perform this action"))
    }

    const {fullName,motto,currentElection} = req.body;
    if(!fullName || !motto){
        return next(new HttpError("Please fill in all fields"),422)
    }

    if(!req.files.image){
        return next(new HttpError("Please upload an image"),422)
    }

    //size check
    const {image} = req.files;
    if(image.size > 1000000){
        return next(new HttpError("Image size should be less than 1mb",422))
    }

    //rename the image 
        let fileName = image.name;
        fileName = fileName.split(".")
        fileName = fileName[0] + uuid() + "." + fileName[fileName.lenngth - 1]

        //upload to cloudinary
        image.mv(path.join(__dirname,'..','uploads',fileName),async (error)=>{
            if(error){
                return next(new HttpError(error,500))
            }

            //if no error store the image
            const result = await cloudinary.uploader.upload(path.join(__dirname,'..','uploads',fileName),{resource_type: "image"})

            if(!result.secure_url){
                return next(new HttpError("Error uploading image on cloudinary",500))
            }

            //add candidate to db
            let newCandidate = await CandidateModel.create({fullName,motto,image: result.secure_url,election: currentElection})

            //add candidate to election
            let election = await ElectionModel.findById(currentElection);

            const session = await mongoose.startSession();
            session.startTransaction()
            await newCandidate.save({session: session});
            election.candidates.push(newCandidate)
            await election.save({session: session});
            await session.commitTransaction()

            res.status(201).json("Candidate added successfully")
        })
    }
    catch(error){
        return next(new HttpError(error,500))
    }
}
















//==============GET CANDIDATE
// GET: api/candidates/id
//PROTECTED 
const getCandidate = async (req,res,next) => {
    try{
        const {id} = req.params;
        const candidate = await CandidateModel.findById(id)
        res.status(200).json(candidate)
    }catch(error){
        return next(new HttpError(error,500))
    }
}














//==============VOTE CANDIDATE
// PATCH: api/candidates/id
//PROTECTED 
const voteCandidate = async (req,res,next) => {
    try{
    console.log("voteCandidate route hit");
    // console.log("candidateId:", req.params.id);
    // console.log("currentVoterId:", req.body.currentVoterId);
    // console.log("selectedElection:", req.body.selectedElection);

    const {id: candidateId} = req.params;
    const {currentVoterId, selectedElection} = req.body;

    //get the candidate
    const candidate = await CandidateModel.findById(candidateId)
    if (!candidate) return next(new HttpError("Candidate not found", 404));
    const newVoteCount = candidate.voteCount + 1;


    //update the candidate's vote
    await CandidateModel.findByIdAndUpdate(candidateId,{voteCount:newVoteCount},{new: true})

    //start a session for relation b/w voter and election
    const sess = await mongoose.startSession();
    sess.startTransaction();

    //get the current voter
    const voter = await VoterModel.findById(req.user.id)
    if (!voter) return next(new HttpError("Voter not found", 404));
    await voter.save({session: sess})

    //get the election
    const election = await ElectionModel.findById(selectedElection)
    if (!election) return next(new HttpError("Election not found", 404));
    election.voters.push(voter);

    voter.votedElections.push(election);

    await election.save({session: sess})
    await voter.save({session: sess})
    await sess.commitTransaction()
    
    res.status(200).json(voter.votedElections);

    }
    catch(error){
        return next(new HttpError(error,500))
    }
}


// const voteCandidate = (req,res,next) => {
//     res.json("vote election hit")
// }
















const removeCandidate = async (req,res,next) => {
    try{
    //only admin can add election
    if(!req.user.isAdmin){
        return next(new HttpError("Only an admin can perform this action"))
    } 

    const {id} = req.params;
    let currentCandidate = await CandidateModel.findById(id).populate('election')

    if(!currentCandidate){
        return next(new HttpError("Candidate not found for deletion"),422)
    }else{
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await currentCandidate.deleteOne({session: sess})
        currentCandidate.election.candidates.pull(currentCandidate);
        await currentCandidate.election.save({session: sess})
        await sess.commitTransaction()

        res.status(200).json("Candidate deleted successfully")
    }

    }
    catch(error){
        return next(new HttpError(error,500))
    }
}








module.exports = {addCandidates, getCandidate,removeCandidate,voteCandidate}