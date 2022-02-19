const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    creator_id: { type: String },
    creator_name: { type: String },
    date: { type: Date, default: Date.now() },
    title: { type: String },
    subject: { type: String },
    private: { type: Boolean, default: false },
    likes: { type: Number, default: 0, },
    likedby: { type: Array },
    dislikes: { type: Number, default: 0, },
    dislikedby: { type: Array },
    tags: { type: Array },
    featured: { type: Boolean, default: false },
    commentcount: { type: Number, default: 0 },
    comments: [{
        comment: { type: String },
        commentator: { type: String }
    }]
}, { strict: false })

module.exports = mongoose.model('Posts', PostSchema)