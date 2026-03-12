# 📚 Digital Library - Университетска библиотечна система

Дигитална библиотечна система за управление на книги, потребители и заемания в университетска среда.

## 🛠️ Технологии

**Backend:**
- Node.js & Express.js
- PostgreSQL база данни
- JWT автентикация
- Multer за файлове

**Frontend:**
- React.js
- React Router
- Context API за state management
- CSS3 за стилизиране

## 📋 Изисквания

Преди да започнете, уверете се че имате инсталирано:

- [Node.js](https://nodejs.org/) (версия 16 или по-нова)
- [PostgreSQL](https://www.postgresql.org/) (версия 12 или по-нова)
- [npm](https://www.npmjs.com/) или [yarn](https://yarnpkg.com/)

## 🚀 Инсталация и стартиране

### 1. Клониране на репозиторията

```bash
git clone <repository-url>
cd "Web University Library"
```

### 2. Настройка на базата данни

#### Създаване на PostgreSQL база данни:

```sql
-- Влезте в PostgreSQL като администратор
sudo -u postgres psql

-- Създайте база данни
CREATE DATABASE university_library;

-- Създайте потребител
CREATE USER library_user WITH PASSWORD 'your_password';

-- Дайте права на потребителя
GRANT ALL PRIVILEGES ON DATABASE university_library TO library_user;

-- Излезте от PostgreSQL
\q
```

#### Стартиране на SQL скрипта за схема:

```bash
# Влезте в backend директорията
cd backend

# Стартирайте SQL скрипта за създаване на таблиците
psql -U library_user -d university_library -f database/schema.sql
```

### 3. Настройка на Backend

```bash
# Влезте в backend директорията
cd backend

# Инсталирайте зависимостите
npm install

# Създайте .env файл с конфигурация
cp .env.example .env
```

#### Редактирайте `.env` файла:

```env
# База данни
DB_HOST=localhost
DB_PORT=5432
DB_NAME=university_library
DB_USER=library_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Сървър
PORT=5000
NODE_ENV=development
```

#### Стартиране на backend сървъра:

```bash
# Развойна среда
npm run dev

# Продукционна среда
npm start
```

Сървърът ще се стартира на `http://localhost:5000`

### 4. Настройка на Frontend

```bash
# Отворете нов терминал и влезте в frontend директорията
cd frontend

# Инсталирайте зависимостите
npm install

# Създайте .env файл за frontend
echo "REACT_APP_API_URL=http://localhost:5000" > .env
```

#### Стартиране на React приложението:

```bash
# Развойна среда
npm start
```

Frontend приложението ще се стартира на `http://localhost:3000`

## 📁 Структура на проекта

```
Web University Library/
├── backend/                    # Express.js API сървър
│   ├── controllers/           # Контролери за бизнес логика
│   ├── database/             # База данни конфигурация и схема
│   ├── middleware/           # Middleware функции
│   ├── migration/            # Database migration скриптове
│   ├── models/               # Data модели
│   ├── routes/               # API рутове
│   ├── uploads/              # Качени файлове (книги, корици)
│   └── index.js              # Главен entry point
├── frontend/                  # React приложение
│   ├── public/               # Статични файлове
│   ├── src/
│   │   ├── components/       # Переизползваеми компоненти
│   │   ├── contexts/         # React Context providers
│   │   ├── pages/            # Страници (User/Admin UI)
│   │   ├── utils/            # Помощни функции
│   │   └── assets/           # Изображения, икони, шрифтове
│   └── package.json
└── README.md
```

## 👤 Първоначална настройка на администратор

### Създаване на първи админ акаунт:

1. Регистрирайте се с имейл адрес завършващ на `@bfu.bg`
2. Влезте в базата данни и одобрете акаунта:

```sql
-- Свържете се към базата данни
psql -U library_user -d university_library

-- Намерете вашия потребител и го одобрете
UPDATE users 
SET status = 'APPROVED', user_type = 'admin' 
WHERE email = 'your-admin@bfu.bg';
```

3. Сега можете да влезете като администратор на `/admin`

## 🔧 Полезни команди

### Backend команди:

```bash
# Стартиране в развойна среда с автоматично рестартиране
npm run dev

# Стартиране в продукционна среда
npm start

# Проверка на базата данни
npm run check-db

# Миграции
npm run migrate
```

### Frontend команди:

```bash
# Стартиране на развойна среда
npm start

# Създаване на production build
npm run build

# Тестване на build локално
npm run preview
```

### Database команди:

```bash
# Резервно копие на базата данни
pg_dump -U library_user university_library > backup.sql

# Възстановяване от резервно копие
psql -U library_user university_library < backup.sql

# Влизане в PostgreSQL конзола
psql -U library_user -d university_library
```

## 🌐 API Endpoints

### Автентикация:
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Потребителски профил

### Книги:
- `GET /api/books` - Списък с книги
- `GET /api/books/search` - Търсене на книги
- `GET /api/books/:id` - Детайли за книга
- `POST /api/books` - Създаване на книга (админ)
- `PUT /api/books/:id` - Редактиране на книга (админ)
- `DELETE /api/books/:id` - Изтриване на книга (админ)

### Администрация:
- `GET /api/admin/users` - Списък с потребители
- `GET /api/admin/requests` - Заявки за регистрация
- `PUT /api/admin/approve/:id` - Одобряване на заявка


### Чести проблеми:

1. **Грешка при свързване към базата данни:**
   - Проверете дали PostgreSQL сървъра работи
   - Проверете credentials в `.env` файла
   - Проверете дали базата данни съществува

2. **CORS грешки:**
   - Уверете се че backend работи на порт 5000
   - Проверете `REACT_APP_API_URL` в frontend `.env`

3. **Файлове не се качват:**
   - Проверете права за писане в `uploads/` директорията
   - Проверете максимален размер на файловете

4. **JWT грешки:**
   - Проверете `JWT_SECRET` в backend `.env`
   - Изчистете localStorage в браузъра

## 📄 Лиценз

Този проект е с образователна цел.