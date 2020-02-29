const { is_live } = require("../globals.js");
const { Pool } = require("pg");

const pool = new Pool({
  connectionTimeoutMillis: 2000,
  max: 20,
  ssl: is_live ? true : false,
  connectionString: is_live
    ? process.env.DATABASE_URL
    : "postgresql://ptrckr:@localhost:5432/ptrckr"
});

function assert_tables_exist(tables, cb) {
  function assert_table(tables, idx, done, missing = []) {
    const table = tables[idx];

    pool.query(`SELECT * FROM ${table};`, [], (err) => {
      if (err)
        missing.push(table);

      if (idx === tables.length - 1)
        done(missing);
      else
        assert_table(tables, ++idx, done, missing);
    });
  }

  assert_table(tables, 0, missing => {
    if (missing.length)
      cb(`Table(s) \`${missing.join("', \`")}' do not exist.`);
    else
      cb(0);
  });
};

module.exports = {
  assert: assert_tables_exist,
  query: (text, values, cb) => pool.query(text, values, cb),
  query_row: (text, values, cb) => {
    pool.query(text, values, (err, res) => {
      if (err)
        return cb(err);

      if (res.rows.length > 1)
        return cb(`Expected one row, got \`${res.rows.length}'.`);

      return cb(0, res.rows[0]);
    });
  }
}




// pool.query('SELECT * FROM users WHERE id = $1', [1], (err, res) => {
//   if (err) {
//     throw err
//   }
//   console.log('user:', res.rows[0])
// })





// pool.query("create table users (uid serial primary key, uname text unique, upass text);", (err, res) => {
//   console.log(err, res)
//   pool.end();
// });

// pool.query("insert into prxl (uname, upass) values ('^prxl', 'secret!')", (err, res) => {
//   if (err) {
//     pool.end();
//     throw err;
//   }
//
//   console.log("INSERT done!");
//
//   pool.end();
// });

// pool.query("select * from prxl where uname like '^prxl'", (err, res) => {
//   if (err) {
//     pool.end();
//     throw err;
//   }
//
//   console.log("INSERT done!", res);
//
//   pool.end();
// });