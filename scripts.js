let currentPlayer = '';
let questions = [];
let dataReady = false;

document.addEventListener('DOMContentLoaded', function() {
    Papa.parse("questions/data.csv", {
        download: true,
        header: true,
        complete: function(results) {
            console.log("CSV Chargé", results);
            if (results.data && results.data.length > 0) {
                questions = results.data;
                dataReady = true;
            } else {
                console.error("Pas de données dans le CSV ou erreur de chargement.");
            }
        }
    });
});

function startGame() {
    if (!dataReady) {
        alert("Données pas encore chargées. Veuillez attendre un instant.");
        return;
    }
    currentPlayer = document.getElementById('nameInput').value;
    if (!currentPlayer) {
        alert("Veuillez entrer un nom avant de commencer.");
        return;
    }
    
    if (!getPlayerScore(currentPlayer)) {
        setPlayerScore(currentPlayer, 0);
    }
    
    displayQuestion();
}

function displayQuestion() {
    if (questions.length === 0) {
        console.error("Aucune question n'est chargée.");
        displayFinalScore();
        return;
    }

    const questionIndex = Math.floor(Math.random() * questions.length);
    const questionData = questions.splice(questionIndex, 1)[0];
    console.log("Question sélectionnée:", questionData);

    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');

    if (!questionElement || !answersElement) {
        console.error("Éléments du DOM non trouvés.");
        return;
    }

    questionElement.textContent = questionData.Question;
    answersElement.innerHTML = '';

    const answers = [questionData.Rep1, questionData.Rep2, questionData.Rep3, questionData.Rep4];
    shuffleArray(answers);
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.onclick = () => handleAnswer(answer, questionData.Rep1);
        answersElement.appendChild(button);
    });
}

window.onload = function() {
    displayQuestion();
}

function handleAnswer(selectedAnswer, correctAnswer) {
    console.log("Réponse choisie:", selectedAnswer, "Réponse correcte:", correctAnswer);
    let score = getPlayerScore(currentPlayer) || 0;
    
    if (selectedAnswer === correctAnswer) {
        score += 1;
    } else {
        score -= 1;
    }
    console.log("Score actuel après ajustement:", score);

    setPlayerScore(currentPlayer, score);

    updateScoreDisplay();
    updateLeaderboards();
    displayQuestion();
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = "Score: " + (getPlayerScore(currentPlayer) || 0);
    } else {
        console.error("L'élément score n'a pas été trouvé dans le DOM");
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updatePlayerScore(name, score) {
    let players = getAllPlayers();
    let player = players.find(player => player.name === name);
    if (!player) {
        player = { name, score };
        players.push(player);
    } else {
        player.score = score;
    }
    players.sort((a, b) => b.score - a.score);
    saveAllPlayers(players);
}

function updateLeaderboards() {
    const players = getAllPlayers();
    const topPlayers = players.slice(0, 5);
    const bottomPlayers = players.slice(-5);

    const topList = document.getElementById('lawyerList');
    const bottomList = document.getElementById('criminalList');

    topList.innerHTML = '';
    bottomList.innerHTML = '';

    topPlayers.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = `${player.name} : ${player.score}`;
        topList.appendChild(listItem);
    });

    bottomPlayers.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = `${player.name} : ${player.score}`;
        bottomList.appendChild(listItem);
    });
}

function displayFinalScore() {
    const mainElement = document.getElementById('main');
    if (mainElement) {
        mainElement.innerHTML = `<h1>Finished !</h1><h2>Your final score is : ${getPlayerScore(currentPlayer)}</h2>`;
        mainElement.classList.add('final');
        confetti({
            particleCount: 1000,
            spread: 100,
            origin: { y: 1 }
        });
    }
}

// Fonctions de gestion de localStorage
function getPlayerScore(name) {
    const players = getAllPlayers();
    const player = players.find(player => player.name === name);
    return player ? player.score : null;
}

function setPlayerScore(name, score) {
    const players = getAllPlayers();
    let player = players.find(player => player.name === name);
    if (!player) {
        players.push({ name, score });
    } else {
        player.score = score;
    }
    saveAllPlayers(players);
}

function getAllPlayers() {
    return JSON.parse(localStorage.getItem('players')) || [];
}

function saveAllPlayers(players) {
    localStorage.setItem('players', JSON.stringify(players));
}

function resetScores() {
    localStorage.removeItem('players');
    players = [];
    updateLeaderboards();  // Met à jour les tableaux des leaders pour refléter les changements
    alert('Scores and names have been reset.');
}
