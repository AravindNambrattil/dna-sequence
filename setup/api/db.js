const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'secret123',
  database: 'dna_sequence',
});

module.exports = pool;
