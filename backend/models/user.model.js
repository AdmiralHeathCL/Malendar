import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    usertype:{
        type: String,
        default: "isStudent",
    },
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
    },
    profileImg: {
        type: String,
        default: '/assets/Banana.jpg',
    },

    registerDate: { type: Date, default: Date.now },

    inCluster:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cluster",
            default: [],
        }
    ],

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