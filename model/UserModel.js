const mongoose = require('mongoose');
const plm = require("passport-local-mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
    },
    profilePicture: {
        type: String,
       
    },
    name: {
        type: String,
    },
    contact: {
        type: Number,
        
    },
    boards:{
        type:Array,
        default:[]
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post'
    }]
});

UserSchema.plugin(plm)

const User = mongoose.model('User', UserSchema);

module.exports = User;