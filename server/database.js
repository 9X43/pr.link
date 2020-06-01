const { is_live } = require("../global/utils.js");
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
      missing.push(JSON.stringify(err));

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