import mongoose from "mongoose";

const inclassSchema = mongoose.Schema({

    classcodes: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cluster",
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
    date: {
        type: String,
        required: true
    },
    starttime: {
        type: String,
        required: true
    },
    endtime: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

const Inclass = mongoose.model('Inclass', inclassSchema);

export default Inclass;