const mongoose  = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: [true, "Username already exists"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: [true, "Email already exists"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email format");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

authSchema.pre('save', async function (next) {
      if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
      }

      next();
})

authSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({_id: this._id}, process.env.SECRET_KEY, {
            expiresIn: '900000'
        });

        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

const authModel = new mongoose.model('authData', authSchema);

module.exports = authModel;