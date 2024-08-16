const User = require("../models/auth_model");
const jwt = require("jsonwebtoken");


const Authenticate = async (req, res, next) => {

    try {
        const token = req.cookies.jwtoken;

        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

        console.log(token);

        const rootUser = await User.findOne({_id: verifyToken._id, "tokens.token": token});

        if (!rootUser) {
            throw new Error("User not found");
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();

    } catch (error) {
        res.status(401).send("Please sign in first!!!");
        console.log(error);
    }
}

module.exports = Authenticate;