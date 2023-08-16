const dayjs = require("dayjs");
const pool = require("../db");
const { sessionID } = require("./IDGenerator");

const syntaxErrorMsg = "Please enter a string with the correct syntax";

// checks if the session inputed is in the correct syntax
const sessionSyntax = (text) => {
  const theSyntax = /[1234567890]/.test(text);
  //   checks if the text contains the numbers 0-9
  if (theSyntax === true && text.slice(2, 3) === "/") {
    // checks if the first two and the last two characters are numbers
    if (
      /[1234567890]/.test(text.slice(0, 2)) !== true ||
      /[1234567890]/.test(text.slice(-2)) !== true
    ) {
      return syntaxErrorMsg;
    } else {
      return true;
    }
  } else {
    return syntaxErrorMsg;
  }
};

// checks if two characters are numbers for when the inputed character is equals to 2 in length
const twoCharactersAreNumbersChecker = (characters) => {
  if (
    /[1234567890]/.test(characters.slice(0, 1)) !== true ||
    /[1234567890]/.test(characters.slice(-1)) !== true
  ) {
    return syntaxErrorMsg;
  } else {
    return true;
  }
};

// actively grooms 2 characters inputs into session syntax and returns the correct syntax
const inputGroomer = (victim) => {
  let groomed;
  if (victim.length === 2 && twoCharactersAreNumbersChecker(victim) === true) {
    const grooming = Number(victim) + 1;
    groomed = `${victim}/${grooming}`;
    return groomed;
  } else if (victim.length === 4 && sessionSyntax(victim) === true) {
    return victim;
  } else {
    return syntaxErrorMsg;
  }
};

// handles session creation
exports.sessionExistence = async (input) => {
  const sessionGotten = inputGroomer(input);
  try {
    if (sessionGotten === syntaxErrorMsg) {
      return {
        success: false,
      };
    } else {
      const sch_session = await pool.query(
        `SELECT * FROM sch_sessions WHERE sch_session = $1`,
        [sessionGotten]
      );
      if (sch_session.rows.length === 0) {
        const createSession = await pool.query(
          `INSERT INTO sch_sessions(sch_session_id, sch_session, createdat) VALUES($1, $2, $3) RETURBING *`,
          [sessionID(), sessionGotten, dayjs().format()]
        );

        return {
          success: true,
          session_id: createSession.rows[0].sch_session_id,
          existedPrev: false,
        };
      }
      return {
        success: true,
        session_id: sch_session.rows[0].sch_session_id,
        existedPrev: true,
      };
    }
  } catch (error) {
    return console.log(error);
  }
};
