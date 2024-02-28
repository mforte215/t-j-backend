const mongoose = require('mongoose');
const dateFormat = require('../utils/dateFormat');
// Define the Blog schema
const blogSchema = new mongoose.Schema({
    image: {type: String, required: true},
    title: {type: String, required: true},
    subtitle: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: Date, default: Date.now(), get: (timestamp) => dateFormat(timestamp)},
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
        }
    ],
});

// Create the Blog model
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;