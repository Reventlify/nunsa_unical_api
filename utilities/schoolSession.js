const dayjs = require("dayjs");
const pool = require("../db");
const { sessionID } = require("./IDGenerator");

const syntaxErrorMsg = "Please enter a string with the correct syntax";
const currentYear = new Date().getFullYear();
const currentYearLastDigits = currentYear.toString().slice(-2);

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

// actively grooms 2 or 5 characters inputs into session syntax and returns the correct syntax
const inputGroomer = (victim) => {
  let groomed;
  if (typeof victim === "string") {
    if (
      victim.length === 2 &&
      twoCharactersAreNumbersChecker(victim) === true
    ) {
      const grooming = Number(victim) + 1;
      groomed = `${victim}/${grooming}`;
      return groomed;
    } else if (victim.length === 5 && sessionSyntax(victim) === true) {
      return victim;
    } else {
      return syntaxErrorMsg;
    }
  }
  return syntaxErrorMsg;
};

// active sessions manager
// (on sesion creation)
const updateSessions = async (sessionGiven) => {
  const session = inputGroomer(sessionGiven);
  try {
    // Query rows with the provided session format (e.g., '16/17')
    const queryResult = await pool.query(
      "SELECT sch_session, sch_session_id FROM sch_sessions WHERE sch_session = $1",
      [session]
    );
    // if (queryResult.rows.length === 1) {
    const schSession = queryResult.rows[0];
    // console.log(`firstGate: ${schSession.sch_session}`);
    const firstTwoDigits = Number(schSession.sch_session.slice(0, 2));

    //   if this year is the current school session
    // if (firstTwoDigits === Number(currentYearLastDigits)) {
    // checks for all sessions before this session
    const secondQueryResult = await pool.query(
      "SELECT sch_session FROM sch_sessions WHERE sch_session like $1",
      [`${firstTwoDigits - 1}%`]
    );
    const thirdQueryResult = await pool.query(
      "SELECT sch_session FROM sch_sessions WHERE sch_session like $1",
      [`${firstTwoDigits - 2}%`]
    );
    const fourthQueryResult = await pool.query(
      "SELECT sch_session FROM sch_sessions WHERE sch_session like $1",
      [`${firstTwoDigits - 3}%`]
    );
    const fifthQueryResult = await pool.query(
      "SELECT sch_session FROM sch_sessions WHERE sch_session like $1",
      [`${firstTwoDigits - 4}%`]
    );

    // if any is not available
    if (
      secondQueryResult.rows.length === 0 ||
      thirdQueryResult.rows.length === 0 ||
      fourthQueryResult.rows.length === 0 ||
      fifthQueryResult.rows.length === 0
    ) {
      for (let i = 1; i <= 4; i++) {
        const firstPart = Number(firstTwoDigits) - i;
        const secondPart = Number(firstTwoDigits) - (i - 1);
        const newSession = `${firstPart}/${secondPart}`;
        // console.log(`secondGate: ${newSession}`);
        const checkIndividually = await pool.query(
          "SELECT sch_session FROM sch_sessions WHERE sch_session = $1",
          [newSession]
        );
        // insert the absent session
        if (checkIndividually.rows.length === 0) {
          // console.log(`thirdGate: ${newSession}`);
          await pool.query(
            "INSERT INTO sch_sessions(sch_session_id, sch_session, createdat) VALUES($1, $2, $3) RETURNING *",
            [await sessionID(), newSession, dayjs().format()]
          );
        }
      }
    }
    // }
    return `sessionUpdate result: ${schSession.sch_session_id}`;
    // }
    // return "Session update handler error";
  } catch (error) {
    return console.error("Error:", error);
  }
};

/**
 * This is a function that handles session creation and also checks if
 * the session already exists.
 *
 * @param {string} input - This can either be XX/XX or XX.
 * @returns {object} 
 *    {
 *      success: boolean;
 *      session_id: string;
 *      existedPrev: boolean;
 *    }
 */
exports.sessionExistence = async (input) => {
  const sessionGotten = inputGroomer(input.slice(0, 2));
  // try {
  if (sessionGotten === syntaxErrorMsg) {
    return {
      success: false,
      session_id: "",
      existedPrev: false,
    };
  } else {
    const theSession = await pool.query(
      "SELECT sch_session, sch_session_id FROM sch_sessions WHERE sch_session = $1",
      [sessionGotten]
    );
    if (theSession.rows.length === 0) {
      const sch_session = await pool.query(
        "INSERT INTO sch_sessions(sch_session_id, sch_session, createdat) VALUES($1, $2, $3) RETURNING *",
        [await sessionID(), sessionGotten, dayjs().format()]
      );
      // Call the function with a session parameter (e.g., '16/17')
      const theResult = await updateSessions(sessionGotten);
      console.log(theResult);
      return {
        success: true,
        session_id: sch_session.rows[0].sch_session_id,
        existedPrev: true,
      };
    }
    // Call the function with a session parameter (e.g., '16/17')
    await updateSessions(sessionGotten);
    return {
      success: true,
      session_id: theSession.rows[0].sch_session_id,
      existedPrev: true,
    };
  }
};

/**
 * This is a function that converts 20XX/20XX to XX/XX format.
 *
 * @param {string} year - This can either be 20XX/20XX, XX/XX or XX.
 * @returns {string} The 20XX/20XX format.
 */
exports.year_to_session_converter = async (year) => {
  if (typeof year === "string") {
    const theSyntax = /[1234567890]/.test(year);
    if (year.slice(2, 3) === "/") {
      const sessionGotten = inputGroomer(year);
      return sessionGotten;
    } else {
      if (theSyntax === true && year.slice(4, 5) === "/") {
        const first = year.slice(2, 3);
        const second = year.slice(3, 4);
        const third = year.slice(7, 8);
        const fourth = year.slice(-1);
        if (
          /[1234567890]/.test(first) === true &&
          /[1234567890]/.test(second) === true &&
          /[1234567890]/.test(third) === true &&
          /[1234567890]/.test(fourth) === true
        ) {
          const sessionGotten = `${first}${second}/${third}${fourth}`;
          const sch_session = await pool.query(
            "SELECT sch_session_id FROM sch_sessions WHERE sch_session = $1",
            [sessionGotten]
          );

          if (sch_session.rows.length === 0) {
            const createSession = await pool.query(
              `INSERT INTO sch_sessions(sch_session_id, sch_session, createdat) VALUES($1, $2, $3) RETURNING *`,
              [await sessionID(), sessionGotten, dayjs().format()]
            );
            return sessionGotten;
          }
          return sessionGotten;
        } else {
          return syntaxErrorMsg;
        }
      }
      return syntaxErrorMsg;
    }
  }
  return syntaxErrorMsg;
};

/**
 * This is a function that determines the level of a student
 *
 * @param {string} session - This can either be XX/XX or XX.
 * @returns {string} the level assigned to the user after evaluation
 */
exports.levelDeterminant = async (session) => {
  try {
    const sessionGotten = inputGroomer(session);
    // const activeSessions = await pool.query(`
    // SELECT sch_session_id, sch_session, createdat
    //  FROM sch_sessions
    //  ORDER BY LEFT(sch_session, 2) DESC
    //  FETCH FIRST 5 ROW ONLY
    //  `);

    if (sessionGotten === "22/23") {
      return "100";
    } else if (sessionGotten === "21/22") {
      return "200";
    } else if (sessionGotten === "20/21") {
      return "200";
    } else if (sessionGotten === "19/20") {
      return "300";
    } else if (sessionGotten === "18/19") {
      return "400";
    } else if (sessionGotten === "17/18") {
      return "500";
    } else {
      return "Alumni";
    }
  } catch (error) {
    return console.log(error);
  }
};

exports.sessionIncrementor = (session, increment) => {
  const core = (no, byte) => {
    const part1 = byte.slice(0, 2);
    const part2 = byte.slice(-2);

    return `${Number(part1) + no}/${Number(part2) + no}`;
  };
  if (Number(increment) === 1) {
    return session;
  } else if (Number(increment) === 2) {
    return core(1, session);
  } else if (Number(increment) === 3) {
    return core(2, session);
  } else if (Number(increment) === 4) {
    return core(3, session);
  } else if (Number(increment) === 5) {
    return core(4, session);
  } else {
    console.log("sessionIncrementor error: something went wrong");
  }
};
