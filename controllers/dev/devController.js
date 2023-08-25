const { devHome } = require("./services/devHome");
const { searchStudents } = require("./services/searchStudents/searchStudents");

exports.homepage = devHome;

exports.searchStudents = searchStudents;