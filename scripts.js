let currentPlayer = '';
let scores = {};
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
    scores[currentPlayer] = scores[currentPlayer] || 0;
    displayQuestion();  // Assurez-vous que cette fonction est appelée correctement
}


function displayQuestion() {
    if (questions.length === 0) {
        console.error("Aucune question n'est chargée.");
        displayFinalScore();
        return;
    }

    // Sélection aléatoire de la question et la retirer du tableau
    const questionIndex = Math.floor(Math.random() * questions.length);
    const questionData = questions.splice(questionIndex, 1)[0];  // Cette méthode retire la question du tableau
    console.log("Question sélectionnée:", questionData);

    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');

    if (!questionElement || !answersElement) {
        console.error("Éléments du DOM non trouvés.");
        return;
    }

    questionElement.textContent = questionData.Question;
    answersElement.innerHTML = '';  // Effacez les réponses précédentes

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
    if (typeof scores[currentPlayer] !== 'number') {
        console.error('Erreur : Le score actuel n\'est pas un nombre.');
        scores[currentPlayer] = 0;  // Réinitialise le score si ce n'est pas un nombre
    }

    if (selectedAnswer === correctAnswer) {
        scores[currentPlayer] += 1;
    } else {
        scores[currentPlayer] -= 1;
    }
    console.log("Score actuel après ajustement:", scores[currentPlayer]);
    updateScoreDisplay();
    updateLeaderboards();
    displayQuestion();
}



function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = "Score: " + (scores[currentPlayer] || 0); // Vérifiez que cette ligne fonctionne
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

function updateLeaderboards() {
    updateLeaderboard('lawyerList', true);
    updateLeaderboard('criminalList', false);
}

function updateLeaderboard(listId, ascending) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    const sortedPlayers = Object.entries(scores).sort((a, b) => ascending ? a[1] - b[1] : b[1] - a[1]);
    sortedPlayers.slice(0, 5).forEach(([name, score]) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${name} : ${score}`;
        list.appendChild(listItem);
    });
}

function displayFinalScore() {
    const mainElement = document.getElementById('main');
    if (mainElement) {
        mainElement.innerHTML = `<h1>Finished !</h1><h2>Your final score is : ${scores[currentPlayer]}</h2>`;
        mainElement.classList.add('final');
        // Lancer les confettis
        confetti({
            particleCount: 1000,
            spread: 100,
            origin: { y: 1 } // pour que ça semble partir du bas de l'écran
        });
    }
}