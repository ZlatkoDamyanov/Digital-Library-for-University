import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');

const pool = new Pool();

pool.query(sql)
  .then(() => {
    console.log('Миграциите са приложени успешно');
  })
  .catch(err => {
    console.error('Грешка при миграции:', err);
  })
  .finally(() => pool.end());
