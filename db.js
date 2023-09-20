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
  user: "nunsa",
  // user: "postgres",
  password: process.env.DB_PASSWORD,
  host: "dpg-cjv3a7h5mpss7390r5l0-a",
  // host: "dpg-cjv3a7h5mpss7390r5l0-a.oregon-postgres.render.com",
  port: 5432,
  database: "nunsaunical",
  // ssl: true,
});
module.exports = pool;
