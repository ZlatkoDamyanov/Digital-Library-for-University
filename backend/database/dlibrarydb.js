// Конфигурация на PostgreSQL база данни
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

// Създаваме connection pool за управление на връзки към БД
const pool = new Pool();

// Обработваме неочаквани грешки в connection pool-а
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Тестваме връзката към базата данни при стартиране
pool
  .connect()
  .then(client => {
    client.release();
  })
  .catch(err => {
    console.error('Failed to connect to PostgreSQL:', err);
  });

// Експортираме database обект с query функция и pool обект
export default {
  query: (text, params) => pool.query(text, params),
  pool: pool
};