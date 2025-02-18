import postgres from 'postgres';

const sql = postgres({
  host: 'postgres',
  port: 5432,
  database: 'uploads',
  username: 'postgres',
  password: 'password',
//   ssl: { rejectUnauthorized: false },
});

export default sql;
