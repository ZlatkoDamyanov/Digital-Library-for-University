import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const sql = fs.readFileSync(path.join(__dirname, 'update-university-id.sql'), 'utf8');

const pool = new Pool();

console.log('Изпълнявам migration за университетски ID...');

pool.query(sql)
  .then(() => {
    console.log('Migration за университетски ID е приложен успешно');
    console.log('Сега admin потребителите могат да се регистрират без университетски номер');
  })
  .catch(err => {
    console.error('Грешка при migration:', err);
  })
  .finally(() => pool.end()); 