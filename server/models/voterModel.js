const {Schema, model, Types} = require('mongoose')

const voterSchema = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    aadharNumber: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    votedElections: [{type: Types.ObjectId, ref: 'Election', required: true}],
    isAdmin: {type: Boolean, default: false}
}, {timestamps: true})

module.exports = model('Voter', voterSchema)