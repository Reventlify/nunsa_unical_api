const { register } = require("./services/createUser");
const { sendVerificationCode, verifyCode } = require("./services/verifyEmail");

// send code for email verification
exports.sendCode = sendVerificationCode;

// verifies code
exports.verifyEmail = verifyCode;

// registers user
exports.register = register;