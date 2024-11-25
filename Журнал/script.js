document.addEventListener('DOMContentLoaded', function() {
    loadGrades(); // Загружаем оценки при загрузке страницы

    document.getElementById('studentForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Предотвращаем перезагрузку страницы

        const studentName = document.getElementById('studentName').value;
        const studentGrade = document.getElementById('studentGrade').value;

        addGradeToDatabase(studentName, studentGrade);

        // Очистка полей ввода
        document.getElementById('studentForm').reset();
    });

    // Обработчик для кнопки "Добавить предмет"
    document.getElementById('addSubjectButton').addEventListener('click', function() {
        window.location.href = 'add_subject.html'; // Переход на страницу добавления предмета
    });
});

function loadGrades() {
    fetch('http://localhost:3000/grades')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('gradesTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Очистка таблицы перед загрузкой новых данных
            data.forEach(grade => {
                addGradeToTable(grade.name, grade.grade);
            });
        })
        .catch(error => console.error('Ошибка при загрузке оценок:', error));
}

function addGradeToDatabase(name, grade) {
    fetch('http://localhost:3000/grades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, grade })
    })
    .then(response => response.json())
    .then(data => {
        addGradeToTable(data.name, data.grade);
    })
    .catch(error => console.error('Ошибка при добавлении оценки:', error));
}

function addGradeToTable(name, grade) {
    const tableBody = document.getElementById('gradesTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();

    const nameCell = newRow.insertCell(0);
    const gradeCell = newRow.insertCell(1);

    nameCell.textContent = name;
    gradeCell.textContent = grade;
}
