const mongoose  = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required: true
    },
    email : {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("This is not a correct email format")
            }
        },
        required: true,
        trim: true
    },
    username : {
        type : String,
        trim : true,
        required: true
    },
    slug : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
    userId: {
        type: String,
        required: true,
        trim: true
    },
    date : String,
    datestring : String
})

const Mydatabase = new mongoose.model('newBlogData', schema);

module.exports = Mydatabase;