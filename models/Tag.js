const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {type: String, required: true},
});

// Create the Blog model
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;