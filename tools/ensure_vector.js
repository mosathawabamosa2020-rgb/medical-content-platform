require('dotenv').config({path:'.env.local'});
const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
  console.log('vector extension ensured');
  await client.end();
})();
