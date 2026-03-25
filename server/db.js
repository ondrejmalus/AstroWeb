import mysql from 'mysql2/promise';

export const db = await mysql.createPool({
  host: 'store6.rosti.cz',
  user: 'ondrama0_3355',
  password: 'Ja2072006.',
  database: 'ondrama0_3355',
  waitForConnections: true,
  connectionLimit: 10
});