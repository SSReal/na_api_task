const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: String,
    phone: String, 
    email: String,
    linkedin_url : String
})

const Contact = mongoose.model('Contact', contactSchema, 'test2');

module.exports = Contact;