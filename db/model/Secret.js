const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const secretSchema = new Schema({
  clientId: { type: String, required: true },
  message: { type: String, required: true }
});

module.exports = mongoose.model('secret', secretSchema);
