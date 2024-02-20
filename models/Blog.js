const mongoose = require('mongoose');

// Define the Blog schema
const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

});

// Create the Blog model
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;