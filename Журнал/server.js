const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Настройка middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Для обслуживания статических файлов

// Обработка маршрута для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка маршрута для страницы добавления предмета
app.get('/subjects', (req, res) => {
    res.sendFile(path.join(__dirname, 'subjects.html'));
});

// Обработка маршрута для страницы добавления предмета
app.get('/add_subject', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_subject.html'));
});

// Подключаемся к базе данных
const db1 = new sqlite3.Database('college.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Подключено к базе данных college.db');
});

// Создаем таблицы, если они не существуют
db1.serialize(() => {
    db1.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        surname TEXT NOT NULL,
        password TEXT NOT NULL,
        group_name TEXT NOT NULL
    )`);

    db1.run(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        surname TEXT NOT NULL,
        password TEXT NOT NULL
    )`);
});

// Логика входа
app.post('/login', (req, res) => {
    const { role, surname, password, group } = req.body;

    if (role === 'student') {
        // Логика для студентов
        db1.get(`SELECT * FROM students WHERE surname = ? AND password = ? AND group_name = ?`, [surname, password, group], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (row) {
                return res.send('Успешный вход как студент');
            } else {
                return res.status(401).send('Неверные учетные данные для студента');
            }
        });
    } else if (role === 'teacher') {
        // Логика для преподавателей
        db1.get(`SELECT * FROM teachers WHERE surname = ? AND password = ?`, [surname, password], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (row) {
                return res.send('Успешный вход как преподаватель');
            } else {
                return res.status(401).send('Неверные учетные данные для преподавателя');
            }
        });
    } else {
        return res.status(400).send('Неверная роль');
    }
});

// Создание базы данных для оценок
const gradesDb = new sqlite3.Database('./grades.db', (err) => {
    if (err) {
        console.error('Ошибка при открытии базы данных:', err.message);
    } else {
        console.log('Подключение к базе данных SQLite успешно.');
        gradesDb.run("CREATE TABLE IF NOT EXISTS grades (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, grade INTEGER)", (err) => {
            if (err) {
                console.error('Ошибка при создании таблицы:', err.message);
            }
        });
    }
});

// Получение всех оценок
app.get('/grades', (req, res) => {
    gradesDb.all("SELECT * FROM grades", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Добавление новой оценки
app.post('/grades', (req, res) => {
    const { name, grade } = req.body;
    gradesDb.run("INSERT INTO grades (name, grade) VALUES (?, ?)", [name, grade], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, grade });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
