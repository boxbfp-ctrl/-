// Константы вопросов для тренажера
const QUESTIONS = [
    {
        id: 1,
        text: "Как вы себя чувствуете сегодня?",
        options: ["Отлично", "Хорошо", "Нормально", "Плохо"]
    },
    {
        id: 2,
        text: "Насколько вы уверены в себе?",
        options: ["Очень уверен", "Уверен", "Не очень уверен", "Не уверен"]
    },
    {
        id: 3,
        text: "Как вы справляетесь со стрессом?",
        options: ["Очень хорошо", "Хорошо", "Средне", "Плохо"]
    },
    {
        id: 4,
        text: "Насколько вы довольны своими отношениями с окружающими?",
        options: ["Очень доволен", "Доволен", "Нейтрально", "Не доволен"]
    },
    {
        id: 5,
        text: "Как часто вы занимаетесь тем, что вам нравится?",
        options: ["Каждый день", "Несколько раз в неделю", "Редко", "Почти никогда"]
    }
];

// Состояние приложения
const APP_STATE = {
    currentQuestionIndex: 0,
    userAnswers: [],
    shuffledQuestions: []
};

// Перемешиваем вопросы в случайном порядке
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Инициализация приложения
function initApp() {
    // Перемешиваем вопросы
    APP_STATE.shuffledQuestions = shuffleArray(QUESTIONS);
    APP_STATE.currentQuestionIndex = 0;
    APP_STATE.userAnswers = [];
    
    showQuestion();
    setupEventListeners();
}

// Показываем текущий вопрос
function showQuestion() {
    const currentQuestion = APP_STATE.shuffledQuestions[APP_STATE.currentQuestionIndex];
    const progress = ((APP_STATE.currentQuestionIndex + 1) / QUESTIONS.length) * 100;
    
    // Обновляем прогресс-бар
    document.querySelector('.progress').style.width = `${progress}%`;
    
    // Обновляем номер вопроса
    document.querySelector('.title').textContent = 
        `Вопрос ${APP_STATE.currentQuestionIndex + 1} из ${QUESTIONS.length}`;
    
    // Обновляем текст вопроса
    document.querySelector('.question-text').textContent = currentQuestion.text;
    
    // Обновляем варианты ответов
    const optionsContainer = document.querySelector('.options-container');
    optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(button);
    });
    
    // Обновляем кнопку навигации
    const nextButton = document.getElementById('nextButton');
    if (APP_STATE.currentQuestionIndex === QUESTIONS.length - 1) {
        nextButton.textContent = 'Завершить';
    } else {
        nextButton.textContent = 'Далее';
    }
}

// Выбор варианта ответа
function selectOption(optionIndex) {
    // Снимаем выделение со всех кнопок
    document.querySelectorAll('.option-button').forEach(button => {
        button.classList.remove('selected');
    });
    
    // Выделяем выбранную кнопку
    document.querySelectorAll('.option-button')[optionIndex].classList.add('selected');
    
    // Сохраняем ответ
    const currentQuestion = APP_STATE.shuffledQuestions[APP_STATE.currentQuestionIndex];
    APP_STATE.userAnswers[APP_STATE.currentQuestionIndex] = {
        question: currentQuestion.text,
        answer: currentQuestion.options[optionIndex]
    };
}

// Переход к следующему вопросу или завершение
function nextQuestion() {
    // Проверяем, выбран ли ответ
    if (APP_STATE.userAnswers[APP_STATE.currentQuestionIndex] === undefined) {
        alert('Пожалуйста, выберите ответ');
        return;
    }
    
    if (APP_STATE.currentQuestionIndex < QUESTIONS.length - 1) {
        // Переход к следующему вопросу
        APP_STATE.currentQuestionIndex++;
        showQuestion();
    } else {
        // Завершение тренажера
        completeTraining();
    }
}

// Завершение тренажера и переход к результатам
function completeTraining() {
    // Сохраняем результаты в localStorage
    localStorage.setItem('trainingResults', JSON.stringify({
        answers: APP_STATE.userAnswers,
        questions: APP_STATE.shuffledQuestions
    }));
    
    // Переходим на страницу результатов
    window.location.href = 'results.html';
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('nextButton').addEventListener('click', nextQuestion);
}

// Функции для страницы результатов
function initResultsPage() {
    loadResults();
    setupResultsEventListeners();
}

// Загрузка и отображение результатов
function loadResults() {
    const savedResults = localStorage.getItem('trainingResults');
    
    if (!savedResults) {
        // Если результатов нет, показываем сообщение
        document.querySelector('.results-table').innerHTML = 
            '<div class="no-results">Результаты не найдены</div>';
        return;
    }
    
    const results = JSON.parse(savedResults);
    displayResults(results);
}

// Отображение результатов в таблице
function displayResults(results) {
    const table = document.querySelector('.results-table');
    
    // Создаем заголовок таблицы
    table.innerHTML = `
        <div class="table-header">
            <div class="table-cell">Вопрос</div>
            <div class="table-cell">Ваш ответ</div>
        </div>
    `;
    
    // Добавляем строки с результатами
    results.answers.forEach((answer, index) => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="table-cell">${answer.question}</div>
            <div class="table-cell">${answer.answer}</div>
        `;
        table.appendChild(row);
    });
}

// Настройка обработчиков для страницы результатов
function setupResultsEventListeners() {
    const restartButtons = document.querySelectorAll('#restartButton, #restartMainButton');
    
    restartButtons.forEach(button => {
        button.addEventListener('click', restartTraining);
    });
}

// Перезапуск тренажера
function restartTraining() {
    localStorage.removeItem('trainingResults');
    window.location.href = 'index.html';
}

// Определяем, на какой странице мы находимся
if (window.location.pathname.includes('results.html')) {
    document.addEventListener('DOMContentLoaded', initResultsPage);
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}