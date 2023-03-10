const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

const register = async (req, res) => {
	const { email, name, password } = req.body;
	const emailAlreadyExists = await User.findOne({ email });
	if (emailAlreadyExists) {
		throw new CustomError.BadRequestError("Email already exists");
	}

	// first registered user is an admin
	const isFirstAccount = (await User.countDocuments({})) === 0;
	const role = isFirstAccount ? "admin" : "user";

	const user = await User.create({ name, email, password, role });
	// const tokenUser = { name: user.name, userId: user._id, role: user.role };
	const tokenUser = createTokenUser(user);
	// const token = createJWT({ payload: tokenUser });
	// const oneDay = 1000 * 60 * 60 * 24;
	// res.cookie("token", token, {
	// 	httpOnly: true,
	// 	expires: new Date(Date.now() + oneDay),
	// });
	attachCookiesToResponse({ res, user: tokenUser });
	const signCookie = req.signedCookies;
	res.status(StatusCodes.CREATED).json({ user: tokenUser, signCookie });
};

const logIn = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new CustomError.BadRequestError("Please provide email and password");
	}
	const user = await User.findOne({ email });
	if (!user) {
		throw new CustomError.UnauthenticatedError("Please provide correct email");
	}
	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError(
			"Please provide correct password"
		);
	}
	// const tokenUser = { name: user.name, userId: user._id, role: user.role };
	const tokenUser = createTokenUser(user);
	attachCookiesToResponse({ res, user: tokenUser });
	const signCookie = req.signedCookies;
	res.status(StatusCodes.OK).json({ user: tokenUser, signCookie });
};

const logOut = async (req, res) => {
	res.cookie("token", "logOut", {
		httpOnly: true,
		expires: new Date(Date.now()),
	});
	res.status(StatusCodes.OK).json({ msg: "User logged out !!" });
};

module.exports = {
	register,
	logIn,
	logOut,
};
