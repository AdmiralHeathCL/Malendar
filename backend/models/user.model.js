import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    usertype:{
        type: String,
        required: true,
    },
    // isAdmin isTeacher isStudent
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
    },
    profileImg:{
        type: String,
        default: "",
    },

    inClass:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InClass",
            default: [],
        }
    ],

},{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;