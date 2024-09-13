import mongoose from "mongoose";

const inclassSchema = mongoose.Schema({

    classcodes: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cluster",
        // required: true,
        default: []
        }
    ],
    type: {
        type: String,
        required: true
    },
    classroom: {
        type: String,
        default: ""
    },
    teachers: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
        }
    ],
    students: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
        }
    ],
    time: {
        type: String,
        required: true
    },
    // description: {
    //     type: String,
    //     default: ""
    // }

}, {
    timestamps: true
});

const Inclass = mongoose.model('Inclass', inclassSchema);

export default Inclass;