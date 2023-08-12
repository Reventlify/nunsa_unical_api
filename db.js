require("dotenv").config();
const Pool = require("pg").Pool;

// const pool = new Pool({
//   user: "postgres",
//   password: process.env.DB_PASSWORD,
//   host: "localhost",
//   port: 5432,
//   database: "nunsaunical",
// });

const pool = new Pool({
  user: "myapp_4hvr_user",
  // user: "postgres",
  password: process.env.DB_PASSWORD,
  host: "dpg-ci30ahrhp8u1a1d74bog-a",
  // host: "dpg-ci30ahrhp8u1a1d74bog-a.oregon-postgres.render.com",
  port: 5432,
  database: "nunsaunicaldev",
  // database: "reventlify",
  // ssl: true,
});
module.exports = pool;
