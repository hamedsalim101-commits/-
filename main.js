const allArabicLetters = [
    'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص',
    'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'
];

const playerColors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

let playerNames = [];
let playerScores = [];
let roundLetters = [];
let currentRound = 0;
let totalPlayers = 4;
let finishedOrder = [];
let timeLeft = 60;
let timerInterval = null;

const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const playerCountSelect = document.getElementById('player-count');
const namesInputsContainer = document.getElementById('names-inputs-container');
const startGameBtn = document.getElementById('start-game-btn');

const sideRight = document.getElementById('side-right');
const sideLeft = document.getElementById('side-left');

const activeLetterEl = document.getElementById('active-letter');
const currentRoundEl = document.getElementById('current-round');
const timerEl = document.getElementById('timer');

const resultsModal = document.getElementById('results-modal');
const modalTitle = document.getElementById('modal-title');
const winnerCongratBox = document.getElementById('winner-congrat-box');
const scoresTable = document.getElementById('scores-table');
const footerSignature = document.getElementById('footer-signature');
const nextRoundBtn = document.getElementById('next-round-btn');
const confettiContainer = document.getElementById('confetti-container');

function generateNameInputs() {
    totalPlayers = parseInt(playerCountSelect.value);
    namesInputsContainer.innerHTML = '';
    for (let i = 0; i < totalPlayers; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `اسم اللاعب ${i + 1}`;
        input.id = `player-name-input-${i}`;
        input.value = `لاعب ${i + 1}`;
        namesInputsContainer.appendChild(input);
    }
}

playerCountSelect.addEventListener('change', generateNameInputs);
generateNameInputs();

startGameBtn.addEventListener('click', () => {
    playerNames = [];
    for (let i = 0; i < totalPlayers; i++) {
        const inputEl = document.getElementById(`player-name-input-${i}`);
        const val = inputEl ? inputEl.value.trim() : '';
        playerNames.push(val !== '' ? val : `لاعب ${i + 1}`);
    }

    playerScores = Array(totalPlayers).fill(0);
    roundLetters = [...allArabicLetters].sort(() => Math.random() - 0.5).slice(0, 10);
    
    currentRound = 0;
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    startNewRound();
});

function startNewRound() {
    if (currentRound >= 10) {
        showFinalResults();
        return;
    }

    currentRound++;
    currentRoundEl.textContent = currentRound;
    activeLetterEl.textContent = roundLetters[currentRound - 1];
    
    finishedOrder = [];
    clearInputs();
    renderPlayerCircles();

    timeLeft = 60;
    timerEl.textContent = timeLeft;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishRound();
        }
    }, 1000);
}

function renderPlayerCircles() {
    sideRight.innerHTML = '';
    sideLeft.innerHTML = '';

    for (let i = 0; i < totalPlayers; i++) {
        const btn = document.createElement('button');
        btn.classList.add('player-circle-btn');
        btn.style.backgroundColor = playerColors[i];
        btn.innerHTML = `<span>${playerNames[i]}</span>`;
        btn.onclick = () => playerFinished(i, btn);

        if (i % 2 === 0) {
            sideRight.appendChild(btn);
        } else {
            sideLeft.appendChild(btn);
        }
    }
}

function playerFinished(playerIndex, buttonElement) {
    if (finishedOrder.includes(playerIndex)) return;

    finishedOrder.push(playerIndex);
    buttonElement.disabled = true;
    buttonElement.innerHTML = `<span>${playerNames[playerIndex]}</span><small>#${finishedOrder.length}</small>`;

    if (finishedOrder.length === totalPlayers) {
        clearInterval(timerInterval);
        finishRound();
    }
}

function finishRound() {
    clearInterval(timerInterval);

    // النقاط: الأول 6، الثاني 5، الثالث 4، الرابع 3، الخامس 2، السادس 1
    const pointsMap = [6, 5, 4, 3, 2, 1];

    finishedOrder.forEach((playerIdx, order) => {
        const points = pointsMap[order] !== undefined ? pointsMap[order] : 0;
        playerScores[playerIdx] += points;
    });

    showRoundResults();
}

function showRoundResults() {
    modalTitle.textContent = `نتائج المرحلة ${currentRound}`;
    winnerCongratBox.classList.add('hidden');
    footerSignature.classList.add('hidden');
    scoresTable.innerHTML = '';

    playerScores.forEach((score, idx) => {
        const row = document.createElement('div');
        row.classList.add('score-row');
        
        let orderIndex = finishedOrder.indexOf(idx);
        let orderText = orderIndex !== -1 ? `المركز ${orderIndex + 1}` : 'لم يضغط';
        row.innerHTML = `<span>${playerNames[idx]} (${orderText})</span> <strong>${score} نقطة</strong>`;
        scoresTable.appendChild(row);
    });

    nextRoundBtn.textContent = currentRound === 10 ? "عرض الترتيب النهائي 🏆" : "المرحلة التالية ➔";
    resultsModal.classList.remove('hidden');
}

function showFinalResults() {
    modalTitle.textContent = "🏆 النتيجة النهائية والتكريم 🏆";
    scoresTable.innerHTML = '';

    let sorted = playerScores.map((score, idx) => ({ name: playerNames[idx], score }))
                             .sort((a, b) => b.score - a.score);

    const winner = sorted[0];

    winnerCongratBox.innerHTML = `🎉 ألف مبروك للفائز بالمركز الأول!<br>🌟 <strong>${winner.name}</strong> 🌟`;
    winnerCongratBox.classList.remove('hidden');

    sorted.forEach((item, index) => {
        const row = document.createElement('div');
        row.classList.add('score-row');
        let icon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
        row.innerHTML = `<span>${icon} المركز ${index + 1}: <strong>${item.name}</strong></span> <strong>${item.score} نقطة</strong>`;
        scoresTable.appendChild(row);
    });

    footerSignature.classList.remove('hidden');

    // تشغيل المفرقعات الاحتفالية
    createConfetti();

    nextRoundBtn.textContent = "لعبة جديدة 🔄";
    nextRoundBtn.onclick = () => location.reload();
    resultsModal.classList.remove('hidden');
}

// دالة نِثار المفرقعات المحلية الذاتية
function createConfetti() {
    confettiContainer.innerHTML = '';
    const colors = ['#f43f5e', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(piece);
    }
}

nextRoundBtn.onclick = () => {
    resultsModal.classList.add('hidden');
    startNewRound();
};

function clearInputs() {
    document.getElementById('input-human').value = '';
    document.getElementById('input-animal').value = '';
    document.getElementById('input-plant').value = '';
    document.getElementById('input-thing').value = '';
    document.getElementById('input-country').value = '';
          }

