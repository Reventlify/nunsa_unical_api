const pool = require("../db");

exports.neat = function (yourName) {
  let firstChar = yourName.slice(0, 1);
  firstChar = firstChar.toUpperCase();
  let restChar = yourName.slice(1, yourName.length);
  restChar = restChar.toLowerCase();
  const newName = firstChar + restChar;

  return newName;
};

exports.levelHandler = (level) => {
  let refinedLevel;
  if (typeof level === "string") {
    const isANumber_from_1_to_5 = /[12345]/.test(level);
    if (level.length === 1 && isANumber_from_1_to_5) {
      refinedLevel = `${level}00`;
      return refinedLevel;
    } else if (
      level.length === 3 &&
      /[12345]/.test(level.slice(0, 1)) &&
      /[0]/.test(level.slice(1, 2)) &&
      /[0]/.test(level.slice(2, 3))
    ) {
      refinedLevel = level;
      return refinedLevel;
    } else if (
      level.length === 6 &&
      /[12345]/.test(level.slice(-1)) &&
      level.slice(0, 4).toLowerCase() === "year" &&
      (level.slice(4, 5) === "_" || level.slice(4, 5) === " ")
    ) {
      refinedLevel = `${level.slice(-1)}00`;
      return refinedLevel;
    } else {
      return "Syntax error: Please enter year_X or year X, or X00 or X. Where X is a number from 1 to 5.";
    }
  }
  return "Syntax error: Please enter a string for the level or year";
};

exports.materialNameHandler = async (name, session_id) => {
  try {
    const material_name = await pool.query(
      "SELECT * FROM materials WHERE topic like $1 AND sch_session_id = $2",
      [`${name.toLowerCase()}%`, session_id]
    );
    if (material_name.rows.length === 0) {
      return name.toLowerCase();
    } else if (material_name.rows.length === 2) {
      if (/[1234567890]/.test(name.slice(-1))) {
        const refinery = 1;
        const refined = `${name.slice(
          0,
          name.length
        )}_${refinery}`.toLowerCase();
        return refined;
      } else {
        return `${name}_1`;
      }
    } else {
      const refinery = material_name.rows.length - 1;
      const refined = `${name.slice(0, name.length)}_${refinery}`.toLowerCase();
      return refined;
    }
  } catch (error) {
    console.log(error);
  }
};
