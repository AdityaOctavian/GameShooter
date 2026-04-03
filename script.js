var username = '';
var level = '';
var selectedGun = '';
var selectedTarget = '';
var currentGunIndex = 0;
var gunList = ['gun1', 'gun2'];
var score = 0;
var timeLeft = 0;
var maxTime = 0;
var isPlaying = false;
var isPaused = false;
var timerInterval = null;
var spawnInterval = null;
var matchHistory = JSON.parse(localStorage.getItem('shooterMatchHistory')) || [];

var levelTimes = { easy: 30, medium: 20, hard: 15 };
var scorePerHit = 10;
var penaltySeconds = 5;
var spawnIntervalMs = 3000;
var initialTargets = 3;
var targetSize = 90;

var welcomeScreen = document.getElementById('welcome-screen');
var usernameInput = document.getElementById('username-input');
var levelSelect = document.getElementById('level-select');
var playBtn = document.getElementById('play-btn');
var instructionBtn = document.getElementById('instruction-btn');
var historyBtn = document.getElementById('history-btn');

var instructionModal = document.getElementById('instruction-modal');
var instructionClose = document.getElementById('instruction-close');
var countdownOverlay = document.getElementById('countdown-overlay');
var countdownNumber = document.getElementById('countdown-number');
var gameArea = document.getElementById('game-area');
var gameCanvas = document.getElementById('game-canvas');
var gameGun = document.getElementById('game-gun');
var gunContainer = document.getElementById('gun-container');
var gamePointer = document.getElementById('game-pointer');
var hudUsername = document.getElementById('hud-username');
var hudScore = document.getElementById('hud-score');
var hudTimer = document.getElementById('hud-timer');
var pauseBtn = document.getElementById('pause-btn');
var sortSelect = document.getElementById('sort-select');
var leaderboardList = document.getElementById('leaderboard-list');

var pauseModal = document.getElementById('pause-modal');
var continueBtn = document.getElementById('continue-btn');
var quitBtn = document.getElementById('quit-btn');

var gameoverModal = document.getElementById('gameover-modal');
var goUsername = document.getElementById('go-username');
var goScore = document.getElementById('go-score');
var goLevel = document.getElementById('go-level');
var saveScoreBtn = document.getElementById('save-score-btn');
var restartBtn = document.getElementById('restart-btn');

var historyModal = document.getElementById('history-modal');
var historyClose = document.getElementById('history-close');
var historySort = document.getElementById('history-sort');
var historyList = document.getElementById('history-list');

document.addEventListener('DOMContentLoaded', function () {
    setupWelcome();
    setupModals();
    setupGame();
    // Tampilkan instruksi saat pertama kali buka
    instructionModal.classList.remove('hidden');
});

function setupWelcome() {
    usernameInput.addEventListener('input', validateForm);
    levelSelect.addEventListener('change', validateForm);

    var gunRadios = document.querySelectorAll('input[name="gun"]');
    for (var i = 0; i < gunRadios.length; i++) {
        gunRadios[i].addEventListener('change', function (e) {
            // Hapus selected dari semua card gun
            var gunCards = document.querySelectorAll('#welcome-screen .option-card');
            for (var j = 0; j < gunCards.length; j++) {
                if (gunCards[j].querySelector('input[name="gun"]')) {
                    gunCards[j].classList.remove('selected');
                }
            }
            e.target.closest('.option-card').classList.add('selected');
            selectedGun = e.target.value;
            validateForm();
        });
    }
    var targetRadios = document.querySelectorAll('input[name="target"]');
    for (var i = 0; i < targetRadios.length; i++) {
        targetRadios[i].addEventListener('change', function (e) {
            var targetCards = document.querySelectorAll('#welcome-screen .option-card');
            for (var j = 0; j < targetCards.length; j++) {
                if (targetCards[j].querySelector('input[name="target"]')) {
                    targetCards[j].classList.remove('selected');
                }
            }
            e.target.closest('.option-card').classList.add('selected');
            selectedTarget = e.target.value;
            validateForm();
        });
    }

    playBtn.addEventListener('click', startCountdown);
    instructionBtn.addEventListener('click', function () {
        instructionModal.classList.remove('hidden');
    });

    historyBtn.addEventListener('click', function () {
        renderMatchHistory();
        historyModal.classList.remove('hidden');
    });
}

function validateForm() {
    var name = usernameInput.value.trim();
    var lvl = levelSelect.value;
    var isValid = name.length > 0 && lvl !== '' && selectedGun !== '' && selectedTarget !== '';
    playBtn.disabled = !isValid;
}
function setupModals() {
    instructionClose.addEventListener('click', function () {
        instructionModal.classList.add('hidden');
    });

    continueBtn.addEventListener('click', resumeGame);
    quitBtn.addEventListener('click', quitGame);
    saveScoreBtn.addEventListener('click', saveScore);
    restartBtn.addEventListener('click', restartGame);

    historyClose.addEventListener('click', function () {
        historyModal.classList.add('hidden');
    });

    historySort.addEventListener('change', function () {
        renderMatchHistory();
    });

    sortSelect.addEventListener('change', function () {
        renderLeaderboard();
    });
}
function startCountdown() {
    username = usernameInput.value.trim();
    level = levelSelect.value;
    currentGunIndex = gunList.indexOf(selectedGun);
    if (currentGunIndex === -1) currentGunIndex = 0;
    
    welcomeScreen.classList.add('hidden');
    countdownOverlay.classList.remove('hidden');

    var count = 3;
    countdownNumber.textContent = count;

    var interval = setInterval(function () {
        count--;
        if (count <= 0) {
            clearInterval(interval);
            countdownOverlay.classList.add('hidden');
            startGame();
        } else {
            countdownNumber.textContent = count;
        }
    }, 1000);
}

function resumeCountdown() {
    pauseModal.classList.add('hidden');
    countdownOverlay.classList.remove('hidden');
    
    var count = 3;
    countdownNumber.textContent = count;
    var interval = setInterval(function () {
        count--;
        if (count <= 0) {
            clearInterval(interval);
            countdownOverlay.classList.add('hidden');
            isPaused = false;
        } else {
            countdownNumber.textContent = count;
        }
    }, 1000);
}
function startGame() {
    score = 0;
    maxTime = levelTimes[level];
    timeLeft = maxTime;
    isPlaying = true;
    isPaused = false;
    hudUsername.textContent = username;
    hudScore.textContent = score;
    updateTimerDisplay();

    gameGun.src = 'image/' + gunList[currentGunIndex] + '.png';
    gameArea.classList.remove('hidden');
    gamePointer.style.display = 'block';
    gameCanvas.innerHTML = '';

    for (var i = 0; i < initialTargets; i++) {
        spawnTarget();
    }
    timerInterval = setInterval(function () {
        if (!isPaused && isPlaying) {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                gameOver();
            }
        }
    }, 1000);
    spawnInterval = setInterval(function () {
        if (!isPaused && isPlaying) {
            spawnTarget();
        }
    }, spawnIntervalMs);

    renderLeaderboard();
}

function updateTimerDisplay() {
    var t = Math.max(0, timeLeft);
    var minutes = Math.floor(t / 60);
    var seconds = t % 60;
    var mm = minutes < 10 ? '0' + minutes : '' + minutes;
    var ss = seconds < 10 ? '0' + seconds : '' + seconds;
    hudTimer.textContent = mm + ':' + ss;

    if (timeLeft <= 5) {
        hudTimer.classList.add('warning');
    } else {
        hudTimer.classList.remove('warning');
    }
}
function spawnTarget() {
    if (!isPlaying) return;

    var canvasRect = gameCanvas.getBoundingClientRect();
    var maxX = canvasRect.width - targetSize - 20;
    var maxY = canvasRect.height - targetSize - 120;

    var x = Math.random() * Math.max(maxX, 100) + 10;
    var y = Math.random() * Math.max(maxY, 100) + 10;

    var target = document.createElement('div');
    target.className = 'target';
    target.style.left = x + 'px';
    target.style.top = y + 'px';

    var img = document.createElement('img');
    img.src = 'image/' + selectedTarget + '.png';
    img.alt = 'Target';
    target.appendChild(img);
    target.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!isPlaying || isPaused) return;
        hitTarget(target, e);
    });

    gameCanvas.appendChild(target);
}
function hitTarget(target, event) {
    if (target.classList.contains('hit')) return;

    target.classList.add('hit');
    score += scorePerHit;
    hudScore.textContent = score;
    
    var popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + scorePerHit;
    popup.style.left = (target.offsetLeft + targetSize / 2) + 'px';
    popup.style.top = target.offsetTop + 'px';
    gameCanvas.appendChild(popup);

    var boom = document.createElement('img');
    boom.className = 'boom-effect';
    boom.src = 'image/boom.png';
    boom.style.left = (target.offsetLeft + targetSize / 2) + 'px';
    boom.style.top = (target.offsetTop + targetSize / 2) + 'px';
    gameCanvas.appendChild(boom);
    
    setTimeout(function () {
        target.remove();
        popup.remove();
        boom.remove();
    }, 500);
    triggerRecoil();
    triggerMuzzleFlash(event);
}

function missShot(e) {
    timeLeft = Math.max(0, timeLeft - penaltySeconds);
    updateTimerDisplay();
    if (timeLeft <= 0) {
        gameOver();
        return;
    }

    var canvasRect = gameCanvas.getBoundingClientRect();
    var missX = e.clientX - canvasRect.left;
    var missY = e.clientY - canvasRect.top;

    var miss = document.createElement('div');
    miss.className = 'miss-effect';
    miss.textContent = '-' + penaltySeconds + 's';
    miss.style.left = missX + 'px';
    miss.style.top = missY + 'px';
    gameCanvas.appendChild(miss);
    
    var flash = document.createElement('div');
    flash.className = 'penalty-flash';
    document.body.appendChild(flash);

    setTimeout(function () {
        miss.remove();
        flash.remove();
    }, 1000);

    triggerRecoil();
    triggerMuzzleFlash(e);
}

function triggerRecoil() {
    gunContainer.classList.remove('shooting');
    void gunContainer.offsetWidth; // paksa reflow
    gunContainer.classList.add('shooting');
    setTimeout(function () {
        gunContainer.classList.remove('shooting');
    }, 150);
}

function triggerMuzzleFlash(e) {
    var flash = document.createElement('div');
    flash.className = 'muzzle-flash';
    flash.style.setProperty('--mx', e.clientX + 'px');
    flash.style.setProperty('--my', e.clientY + 'px');
    document.body.appendChild(flash);
    setTimeout(function () {
        flash.remove();
    }, 100);
}

function switchGun() {
    if (!isPlaying || isPaused) return;

    gunContainer.classList.add('switching');

    setTimeout(function () {
        currentGunIndex = (currentGunIndex + 1) % gunList.length;
        gameGun.src = 'image/' + gunList[currentGunIndex] + '.png';
    }, 200);

    setTimeout(function () {
        gunContainer.classList.remove('switching');
    }, 400);
}

function pauseGame() {
    if (!isPlaying || isPaused) return;
    isPaused = true;
    pauseModal.classList.remove('hidden');
}

function resumeGame() {
    if (!isPaused) return;
    resumeCountdown();
}

function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function gameOver() {
    isPlaying = false;
    timeLeft = 0;
    updateTimerDisplay();

    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    gamePointer.style.display = 'none';

    goUsername.textContent = username;
    goScore.textContent = score;
    goLevel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
    saveScoreBtn.disabled = false;
    saveScoreBtn.textContent = 'Save Score';
    gameoverModal.classList.remove('hidden');
}
function saveScore() {
    var record = {
        id: Date.now(),
        username: username,
        score: score,
        level: level,
        gun: gunList[currentGunIndex],
        target: selectedTarget,
        date: new Date().toISOString()
    };
    matchHistory.push(record);
    localStorage.setItem('shooterMatchHistory', JSON.stringify(matchHistory));
    saveScoreBtn.textContent = '✓ Saved!';
    saveScoreBtn.disabled = true;
    renderLeaderboard();
}


// restart
function restartGame() {
    gameoverModal.classList.add('hidden');
    gameArea.classList.add('hidden');
    gamePointer.style.display = 'none';

    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    gameCanvas.innerHTML = '';

    isPlaying = false;
    isPaused = false;
    score = 0;

    welcomeScreen.classList.remove('hidden');
}
function quitGame() {
    pauseModal.classList.add('hidden');
    gameArea.classList.add('hidden');
    gamePointer.style.display = 'none';

    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    gameCanvas.innerHTML = '';

    isPlaying = false;
    isPaused = false;
    score = 0;
    welcomeScreen.classList.remove('hidden');
}
function renderLeaderboard() {
    var sortBy = sortSelect.value;
    var data = matchHistory.slice(); // copy array

    if (sortBy === 'score') {
        data.sort(function (a, b) { return b.score - a.score; });
    } else {
        data.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    }

    leaderboardList.innerHTML = '';
    if (data.length === 0) {
        leaderboardList.innerHTML = '<div style="text-align:center;color:#888;padding:20px;font-size:0.85rem;">No matches yet</div>';
        return;
    }

    for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        var el = document.createElement('div');
        el.className = 'lb-entry';
        el.innerHTML =
            '<div class="lb-info">' +
                '<span class="lb-name">' + escapeHtml(entry.username) + '</span>' +
                '<span class="lb-score">Score: ' + entry.score + '</span>' +
            '</div>' +
            '<button class="lb-detail-btn" onclick="showMatchDetail(' + entry.id + ')">Detail</button>';
        leaderboardList.appendChild(el);
    }
}

function showMatchDetail(matchId) {
    var match = null;
    for (var i = 0; i < matchHistory.length; i++) {
        if (matchHistory[i].id === matchId) {
            match = matchHistory[i];
            break;
        }
    }
    if (!match) return;

    var dateStr = new Date(match.date).toLocaleString();
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'detail-modal';
    overlay.innerHTML =
        '<div class="modal-content detail-content">' +
            '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">&times;</button>' +
            '<h2>📊 Match Detail</h2>' +
            '<div class="gameover-stats">' +
                '<div class="stat-row"><span>Player</span><span>' + escapeHtml(match.username) + '</span></div>' +
                '<div class="stat-row"><span>Score</span><span>' + match.score + '</span></div>' +
                '<div class="stat-row"><span>Level</span><span>' + match.level.charAt(0).toUpperCase() + match.level.slice(1) + '</span></div>' +
                '<div class="stat-row"><span>Date</span><span style="font-size:0.85rem">' + dateStr + '</span></div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.remove();
    });
}

function renderMatchHistory() {
    var sortBy = historySort.value;
    var data = matchHistory.slice();

    if (sortBy === 'score') {
        data.sort(function (a, b) { return b.score - a.score; });
    } else {
        data.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    }

    historyList.innerHTML = '';
    if (data.length === 0) {
        historyList.innerHTML = '<div class="no-history">No match history yet. Play some games first!</div>';
        return;
    }

    for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        var dateStr = new Date(entry.date).toLocaleDateString();
        var el = document.createElement('div');
        el.className = 'history-entry';
        el.innerHTML =
            '<div class="history-info">' +
                '<span class="history-name">' + escapeHtml(entry.username) + '</span>' +
                '<span class="history-details">' + entry.level.charAt(0).toUpperCase() + entry.level.slice(1) + ' • ' + dateStr + '</span>' +
            '</div>' +
            '<span class="history-score">' + entry.score + '</span>';
        historyList.appendChild(el);
    }
}
function setupGame() {
    document.addEventListener('mousemove', function (e) {
        if (!isPlaying) return;

        gamePointer.style.left = e.clientX + 'px';
        gamePointer.style.top = e.clientY + 'px';

        var canvasRect = gameCanvas.getBoundingClientRect();
        var centerX = canvasRect.left + canvasRect.width / 2;
        var deltaX = (e.clientX - centerX) / canvasRect.width;
        var rotateAngle = deltaX * 15;
        var translateX = deltaX * 80;
        gunContainer.style.transform = 'translateX(' + translateX + 'px) rotate(' + rotateAngle + 'deg)';
    });

    gameCanvas.addEventListener('click', function (e) {
        if (!isPlaying || isPaused) return;

        var target = e.target.closest('.target');
        if (!target) {
            missShot(e);
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && isPlaying) {
            e.preventDefault();
            switchGun();
        }
        if (e.code === 'Escape' && isPlaying) {
            e.preventDefault();
            togglePause();
        }
    });
    pauseBtn.addEventListener('click', function () {
        if (isPlaying) togglePause();
    });
}


// utility
function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
