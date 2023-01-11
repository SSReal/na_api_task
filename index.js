const express = require("express");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const User = require("./userModel");

dotenv.config();

const app = express();

app.use(express.json());

app.post("/login", async (req, res, next) => {
	let { email, password } = req.body;
	let oldUser;
	try {
		oldUser = await User.findOne({ email: email });
	} catch {
		const err = new Error("Something went wrong!");
		return next(error);
	}
	if (!oldUser || oldUser.password != password) {
		const err = Error("wrong details");
		return next(err);
	}

	let token;
	try {
		token = jwt.sign(
			{
				userId: oldUser.id,
				email: oldUser.email,
			},
			process.env.JWT_SECRET_KEY
		);
	} catch (err) {
		console.log(err);
		const error = new Error("something went wrong");
		return next(error);
	}

	res.status(200).json({
		success: true,
		data: {
			userId: oldUser.id,
			email: oldUser.email,
			token,
		},
	});
});

app.post("/signup", async (req, res, next) => {
	const { name, email, password } = req.body;
	const newUser = await User.create({
		name,
		email,
		password,
	});

	try {
		newUser.save();
	} catch (error) {
        console.log(error);
		const err = new Error("something went wrong!");
		return next(err);
	}

	let token;
	try {
		token = jwt.sign(
			{
				userId: newUser.id,
				email: newUser.email,
			},
			process.env.JWT_SECRET_KEY
		);
	} catch (err) {
		const error = new Error("Something went wrong!");
		return next(error);
	}

	res.status(201).json({
		success: true,
		data: {
			userId: newUser.id,
			email: newUser.email,
			token: token,
		},
	});
});


app.get("/auth", (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if(!token) {
        res.status(200).json({
            success:false, message: "Token was not provided."
        });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decodedToken);
    res.status(200).json({
        success:true, 
        message: "access granted"
    })

})

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		app.listen(process.env.PORT || 5000, () => {
			console.log("server is listening on port 5000");
		});
	})
	.catch((err) => {
		console.log("error occurred");
	});
