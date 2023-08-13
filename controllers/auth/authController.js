const { sendVerificationCode, verifyCode } = require("./services/verifyEmail");

exports.sendCode = sendVerificationCode;

exports.verifyEmail = verifyCode;