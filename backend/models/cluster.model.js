import mongoose from "mongoose";

const clusterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    students: [
        {
        type: mongoose.Schema.Types.ObjectId,
        // index: true,
        // sparse: true,
        ref: "User",
        default: []
        }
    ],
}, {
    timestamps: true
});

const Cluster = mongoose.model('Cluster', clusterSchema);

export default Cluster;