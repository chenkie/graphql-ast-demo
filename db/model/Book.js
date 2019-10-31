const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publishDate: { type: String, required: true }
});

module.exports = mongoose.model('book', bookSchema);
