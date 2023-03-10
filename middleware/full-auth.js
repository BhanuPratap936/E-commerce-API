const CustomError = require("../errors");
const { isTokenValid } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
	let token;
	// check header
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer")) {
		token = authHeader.split(" ")[1];
	}
	// check cookies
	else if (req.signedCookies.token) {
		token = req.signedCookies.token;
		// console.log(token);
	}

	if (!token) {
		throw new CustomError.UnauthenticatedError("Authentication invalid");
	}
	try {
		// const payload = isTokenValid({ token });
		// console.log(payload);
		// Attach the user and his permissions to the req object
		const { name, userId, role } = isTokenValid({ token });
		req.user = {
			name,
			userId,
			role,
		};

		next();
	} catch (error) {
		throw new CustomError.UnauthenticatedError("Authentication invalid");
	}
};

const authorizedPermission = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new CustomError.UnauthorizedError(
				"Unauthorized to access this route"
			);
		}
		next();
	};
};

module.exports = { authenticateUser, authorizedPermission };
