const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true }
  }
});

module.exports = mongoose.model('contact', contactSchema);
