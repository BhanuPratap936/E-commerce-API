const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
	createTokenUser,
	attachCookiesToResponse,
	checkPermissions,
	createJWT,
} = require("../utils");

const getAllUsers = async (req, res) => {
	// console.log(req.user);
	const users = await User.find({ role: "user" }).select("-password");

	res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
	// const user = await User.findOne({ _id: req.params.id }).select("-password");
	const { id } = req.params;
	const user = await User.findOne({ _id: id }).select("-password");
	if (!user) {
		throw new CustomError.NotFoundError(`Found no user with id: ${id}`);
	}
	checkPermissions(req.user, user._id);
	res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with user.save()
// and with findOneAndUpdate is at bottom
const updateUser = async (req, res) => {
	const { name, email } = req.body;
	if (!name || !email) {
		throw new CustomError.BadRequestError("Please provide both name and email");
	}

	const user = await User.findOne({ _id: req.user.userId });

	user.email = email;
	user.name = name;
	await user.save();
	const tokenUser = createTokenUser(user);
	// attachCookiesToResponse({ res, user: tokenUser });
	const token = createJWT({ payload: tokenUser });
	const oneDay = 1000 * 60 * 60 * 24;
	res.cookie("token", token, {
		httpOnly: true,
		expires: new Date(Date.now() + oneDay),
		secure: process.env.NODE_ENV === "production",
		signed: true,
	});
	res.status(StatusCodes.OK).json({ user: tokenUser, token });
};

const updateUserPassword = async (req, res) => {
	const { userId } = req.user;
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		throw new CustomError.BadRequestError("Please provide both values");
	}
	// const user = await User.findOne({_id: req.user.userId})
	const user = await User.findOne({ _id: userId });
	const isPasswordCorrect = await user.comparePassword(oldPassword);

	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError(
			"Please enter a correct password"
		);
	}

	user.password = newPassword;
	await user.save();
	res.status(StatusCodes.OK).json({
		msg: "Success! Password got updated",
	});
};

// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
// 	const { name, email } = req.body;
// 	if (!name || !email) {
// 		throw new CustomError.BadRequestError("Please provide both name and email");
// 	}
// const user = await User.findOneAndUpdate({ _id: req.user.userId }, {email, name}, {
// 	new: true,
// 	runValidators: true,
// });
// 	const user = await User.findOneAndUpdate({ _id: req.user.userId }, req.body, {
// 		new: true,
// 		runValidators: true,
// 	});

// 	const tokenUser = createTokenUser(user);
// 	attachCookiesToResponse({ res, user: tokenUser });
// 	res.status(StatusCodes.OK).json({ user: tokenUser });
// };

module.exports = {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
};
