import postgres from 'postgres';

console.log('host: ', process.env.DB_HOST);

const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
//   ssl: { rejectUnauthorized: false },
});

export default sql;
