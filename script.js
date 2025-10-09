// ===== КОНСТАНТЫ =====
const TOTAL_QUESTIONS = 5;

// ===== МАССИВ ВОПРОСОВ =====
const QUESTIONS_POOL = [
    {
        id: 1,
        question: "Какого цвета солнышко?",
        options: ["🔴 Красное", "🟡 Жёлтое", "🔵 Синее", "🟢 Зелёное"],
        correctAnswer: 1,
        emoji: "☀️",
        successSound: "Молодец! Солнышко жёлтое!"
    },
    {
        id: 2,
        question: "Сколько лапок у кошки?",
        options: ["2️⃣ Две", "3️⃣ Три", "4️⃣ Четыре", "5️⃣ Пять"],
        correctAnswer: 2,
        emoji: "🐱",
        successSound: "Правильно! У кошки четыре лапки!"
    },
    {
        id: 3,
        question: "Что любит кушать зайчик?",
        options: ["🍎 Яблоко", "🥕 Морковку", "🍕 Пиццу", "🍭 Конфету"],
        correctAnswer: 1,
        emoji: "🐰",
        successSound: "Умница! Зайчик любит морковку!"
    },
    {
        id: 4,
        question: "Какая фигура круглая?",
        options: ["⬜ Квадрат", "🔺 Треугольник", "⭕ Круг", "⭐ Звезда"],
        correctAnswer: 2,
        emoji: "⭕",
        successSound: "Отлично! Круг круглый!"
    },
    {
        id: 5,
        question: "Когда мы спим?",
        options: ["🌅 Утром", "☀️ Днём", "🌙 Ночью", "🍽️ За обедом"],
        correctAnswer: 2,
        emoji: "🌙",
        successSound: "Правильно! Мы спим ночью!"
    },
    {
        id: 6,
        question: "Что делает собачка?",
        options: ["🐱 Мяукает", "🐶 Гавкает", "🐮 Мычит", "🐔 Кукарекает"],
        correctAnswer: 1,
        emoji: "🐕",
        successSound: "Молодец! Собачка гавкает!"
    },
    {
        id: 7,
        question: "Где живут рыбки?",
        options: ["🏠 В домике", "🌳 На дереве", "💧 В воде", "☁️ На облаке"],
        correctAnswer: 2,
        emoji: "🐠",
        successSound: "Умница! Рыбки живут в воде!"
    }
];

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let questions = [];
let currentStep = 0;
let answers = [];
let selectedOption = null;
let soundEnabled = true;

// ===== ФУНКЦИЯ ПЕРЕМЕШИВАНИЯ МАССИВА =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ===== ФУНКЦИЯ ОЗВУЧИВАНИЯ =====
function speak(text) {
    if (!soundEnabled) {
        console.log('Звук выключен');
        return;
    }

    if (!('speechSynthesis' in window)) {
        console.error('Speech Synthesis не поддерживается');
        return;
    }

    try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.85;
        utterance.pitch = 1.3;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        
        const femaleVoice = voices.find(v => 
            v.lang.startsWith('ru') && v.name.includes('Elena')
        ) || voices.find(v => 
            v.lang.startsWith('ru') && v.name.includes('Milena')
        ) || voices.find(v => 
            v.lang.startsWith('ru') && v.name.includes('Anna')
        ) || voices.find(v => 
            v.lang.startsWith('ru') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
        ) || voices.find(v => 
            v.lang.startsWith('ru')
        ) || voices[0];

        if (femaleVoice) {
            utterance.voice = femaleVoice;
            console.log('Выбран голос:', femaleVoice.name);
        }

        utterance.onstart = () => console.log('Озвучка:', text);
        utterance.onerror = (e) => console.error('Ошибка озвучки:', e);

        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Ошибка при озвучивании:', error);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initializeTrainer() {
    const shuffled = shuffleArray(QUESTIONS_POOL);
    questions = shuffled.slice(0, TOTAL_QUESTIONS);
    answers = [];
    currentStep = 0;
    selectedOption = null;
}

// ===== ПОКАЗ ЭКРАНА =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ===== ОБНОВЛЕНИЕ БОКОВОЙ ПАНЕЛИ =====
function updateSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.className = 'sidebar-number';
        
        if (i < currentStep) {
            numberDiv.classList.add('completed');
            numberDiv.textContent = '✓';
        } else {
            numberDiv.classList.add('pending');
            numberDiv.textContent = i + 1;
        }
        
        sidebar.appendChild(numberDiv);
    }
}

// ===== ОТОБРАЖЕНИЕ ВОПРОСА =====
function displayQuestion() {
    const question = questions[currentStep];
    
    document.getElementById('question-emoji').textContent = question.emoji;
    document.getElementById('question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => selectOption(index);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('next-btn').disabled = true;
    updateSidebar();
}

// ===== ВЫБОР ВАРИАНТА ОТВЕТА =====
function selectOption(index) {
    selectedOption = index;
    
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    document.getElementById('next-btn').disabled = false;
    
    // Озвучка выбранного варианта
    const question = questions[currentStep];
    speak(question.options[index]);
}

// ===== ПОКАЗ АНИМАЦИИ УСПЕХА =====
function showSuccessAnimation() {
    const overlay = document.getElementById('success-overlay');
    overlay.classList.add('show');
    
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 2500);
}

// ===== ПЕРЕХОД К СЛЕДУЮЩЕМУ ВОПРОСУ =====
function handleNext() {
    if (selectedOption === null) return;
    
    const question = questions[currentStep];
    const isCorrect = selectedOption === question.correctAnswer;
    
    answers.push({
        questionNumber: currentStep + 1,
        question: question.question,
        userAnswer: question.options[selectedOption],
        correctAnswer: question.options[question.correctAnswer],
        isCorrect: isCorrect,
        emoji: question.emoji
    });
    
    if (isCorrect) {
        showSuccessAnimation();
        speak(question.successSound);
        
        setTimeout(() => {
            if (currentStep < TOTAL_QUESTIONS - 1) {
                currentStep++;
                selectedOption = null;
                displayQuestion();
                setTimeout(() => {
                    const nextQuestion = questions[currentStep];
                    speak(nextQuestion.question);
                }, 500);
            } else {
                showResults();
            }
        }, 2500);
    } else {
        speak("Попробуй ещё раз, у тебя обязательно получится!");
        setTimeout(() => {
            selectedOption = null;
            const buttons = document.querySelectorAll('.option-button');
            buttons.forEach(btn => btn.classList.remove('selected'));
            document.getElementById('next-btn').disabled = true;
        }, 2000);
    }
}

// ===== ПОКАЗ РЕЗУЛЬТАТОВ =====
function showResults() {
    showScreen('results-screen');
    
    const correctCount = answers.filter(a => a.isCorrect).length;
    
    // Эмодзи и заголовок
    const resultsEmoji = document.getElementById('results-emoji');
    const resultsTitle = document.getElementById('results-title');
    
    if (correctCount === TOTAL_QUESTIONS) {
        resultsEmoji.textContent = '🎉🏆🎊';
        resultsTitle.textContent = 'СУПЕР! ВСЁ ПРАВИЛЬНО!';
    } else if (correctCount >= 3) {
        resultsEmoji.textContent = '😊👍✨';
        resultsTitle.textContent = 'МОЛОДЕЦ! ОТЛИЧНЫЙ РЕЗУЛЬТАТ!';
    } else {
        resultsEmoji.textContent = '💪🌟😄';
        resultsTitle.textContent = 'УМНИЦА! ПРОДОЛЖАЙ СТАРАТЬСЯ!';
    }
    
    // Счёт
    document.getElementById('results-score').innerHTML = 
        `Правильных ответов: <span class="score-number">${correctCount}</span> из ${TOTAL_QUESTIONS}`;
    
    // Таблица
    const tbody = document.getElementById('results-tbody');
    tbody.innerHTML = '';
    
    answers.forEach((answer) => {
        const row = document.createElement('tr');
        row.className = answer.isCorrect ? 'correct' : 'incorrect';
        
        row.innerHTML = `
            <td>${answer.questionNumber}</td>
            <td>${answer.emoji} ${answer.question}</td>
            <td>
                ${answer.userAnswer}
                ${!answer.isCorrect ? `<div class="correct-answer-hint">Правильно: ${answer.correctAnswer}</div>` : ''}
            </td>
            <td><span class="result-icon">${answer.isCorrect ? '✅' : '❌'}</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Озвучка результатов
    setTimeout(() => {
        speak("Ура! Ты прошёл весь тренажёр! Давай посмотрим твои результаты!");
    }, 500);
}

// ===== ПЕРЕЗАПУСК =====
function handleRestart() {
    speak("Начинаем сначала! Будет весело!");
    setTimeout(() => {
        initializeTrainer();
        showScreen('start-screen');
    }, 1000);
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЗВУКА =====
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    const soundButtons = document.querySelectorAll('.sound-button');
    soundButtons.forEach(btn => {
        if (soundEnabled) {
            btn.classList.remove('disabled');
            btn.style.backgroundColor = '#FFD700';
        } else {
            btn.classList.add('disabled');
            btn.style.backgroundColor = '#CCC';
        }
    });
    
    if (soundEnabled) {
        speak("Звук включён!");
    } else {
        window.speechSynthesis.cancel();
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Тренажёр загружен');
    
    // Загрузка голосов
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('Доступные голоса:', voices.map(v => v.name));
        };
        window.speechSynthesis.getVoices();
    }
    
    // Инициализация
    initializeTrainer();
    
    // Кнопка "Начать"
    document.getElementById('start-btn').addEventListener('click', function() {
        showScreen('question-screen');
        displayQuestion();
        setTimeout(() => {
            speak("Привет! Давай поиграем и ответим на весёлые вопросы!");
            setTimeout(() => {
                const firstQuestion = questions[0];
                speak(firstQuestion.question);
            }, 2000);
        }, 300);
    });
    
    // Кнопка "Далее"
    document.getElementById('next-btn').addEventListener('click', handleNext);
    
    // Кнопка озвучки на стартовом экране
    document.getElementById('sound-btn-start').addEventListener('click', function() {
        speak("Весёлый тренажёр для умных ребят! Давай проверим твои знания!");
    });
    
    // Кнопка переключения звука на экране вопросов
    document.getElementById('sound-btn-question').addEventListener('click', toggleSound);
    
    // Кнопка переключения звука на экране результатов
    document.getElementById('sound-btn-results').addEventListener('click', toggleSound);
    
    // Кнопка перезапуска
    document.getElementById('restart-btn').addEventListener('click', handleRestart);
    
    console.log('Все обработчики событий установлены');
});
