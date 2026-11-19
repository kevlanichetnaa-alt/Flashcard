document.addEventListener('DOMContentLoaded', () => {
  // --- State Management ---
  let cards = [];
  let currentIndex = 0;
  let stats = {
       studied: 0,
       correct: 0,
       incorrect: 0
  };

  // --- DOM Elements ---
  const cardContainer = document.getElementById('card-container');
  const flashcard = document.getElementById('flashcard');
  const questionEl = document.getElementById('card-question');
  const answerEl = document.getElementById('card-answer');
  const currentNumEl = document.getElementById('current-card-num');
  const totalNumEl = document.getElementById('total-cards-num');

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const flipBtn = document.getElementById('flip-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');

  const quizControls = document.getElementById('quiz-controls');
  const markCorrectBtn = document.getElementById('mark-correct');
  const markWrongBtn = document.getElementById('mark-wrong');

  const form = document.getElementById('add-card-form');
const questionInput = document.getElementById('input-question');
const answerInput = document.getElementById('input-answer');
const cardListEl = document.getElementById('card-list');

// Stats Elements
const statTotalEl = document.getElementById('stat-total');
const statStudiedEl = document.getElementById('stat-studied');
const statAccuracyEl = document.getElementById('stat-accuracy');
const progressBar = document.getElementById('study-progress-bar');
const resetStatsBtn = document.getElementById('reset-stats-btn');

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// --- Initialization ---
function init() {
    loadData();
    renderCard();
    renderCardList();
    updateStatsUI();
    checkTheme();
}

// --- Data Persistence ---
function saveData() {
    localStorage.setItem('flashcards', JSON.stringify(cards));
    localStorage.setItem('flashcardStats', JSON.stringify(stats));
  }

  function loadData() {
      const storedCards = localStorage.getItem('flashcards');
      const storedStats = localStorage.getItem('flashcardStats');

      if (storedCards) {
          cards = JSON.parse(storedCards);
      } else {
          // Default dummy data if empty
          cards = [
       { id: 1, question: "What does HTML stand for?", answer: "HyperText Markup Language" },
          { id: 2, question: "What is the CSS property for changing text color?", answer: "color" },
         { id: 3, question: "Which symbol is used for comments in JavaScript?", answer: "//" }
          ];
      }

      if (storedStats) {
          stats = JSON.parse(storedStats);
      }
  }

  // --- Core Logic ---

  function renderCard() {
      if (cards.length === 0) {
        questionEl.textContent = "No cards available. Add one!";
        answerEl.textContent = "";
        currentNumEl.textContent = 0;
        totalNumEl.textContent = 0;
        flipBtn.disabled = true;
        quizControls.classList.add('hidden');
        return;
    }

    flipBtn.disabled = false;
    const card = cards[currentIndex];

    // Reset flip state
    flashcard.classList.remove('is-flipped');
    quizControls.classList.add('hidden');

    // Update Content with slight delay to allow flip reset if needed
    setTimeout(() => {
        questionEl.textContent = card.question;
        answerEl.textContent = card.answer;
        currentNumEl.textContent = currentIndex + 1;
        totalNumEl.textContent = cards.length;
    }, 150);
}

function flipCard() {
    if (cards.length === 0) return;
    flashcard.classList.toggle('is-flipped');
    // Show quiz controls only after flipping
    if (flashcard.classList.contains('is-flipped')) {
        setTimeout(() => {
          quizControls.classList.remove('hidden');
        }, 300);
    } else {
        quizControls.classList.add('hidden');
    }
}

function nextCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex + 1) % cards.length;
    renderCard();
}

function prevCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    renderCard();
}

function shuffleCards() {
    if (cards.length <= 1) return;
    // Fisher-Yates Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      currentIndex = 0;
      renderCard();
      // Visual feedback
      shuffleBtn.innerHTML = '<i class="fa-solid fa-check"></i> Shuffled';
     setTimeout(() => shuffleBtn.innerHTML = '<i class="fa-solid fa-shuffle"></i> Shuffle', 1500);
  }

  // --- Quiz Logic ---

  function handleQuizResult(isCorrect) {
      stats.studied++;
      if (isCorrect) {
          stats.correct++;
      } else {
          stats.incorrect++;
      }

      saveData();
      updateStatsUI();
      nextCard();
  }

  function updateStatsUI() {
      statTotalEl.textContent = cards.length;
      statStudiedEl.textContent = stats.studied;
      const totalAttempts = stats.correct + stats.incorrect;
     const accuracy = totalAttempts === 0 ? 0 : Math.round((stats.correct / totalAttempts) * 100);

      statAccuracyEl.textContent = `${accuracy}%`;

      // Progress bar based on studied vs total cards (capped at 100%)
      // Note: This logic assumes you study each card once.
      // For infinite looping, we just show a generic progress or disable bar.
      // Here we show progress relative to total deck size for visual flair.
      let progressPercent = (stats.studied / (cards.length || 1)) * 100;
      if(progressPercent > 100) progressPercent = 100;
      progressBar.style.width = `${progressPercent}%`;
  }

  // --- Card Management ---

  function addCard(e) {
      e.preventDefault();
      const question = questionInput.value.trim();
      const answer = answerInput.value.trim();

      if (!question || !answer) return;

      const newCard = {
        id: Date.now(),
        question,
         answer
    };

    cards.push(newCard);
    saveData();

    // Reset form
    questionInput.value = '';
    answerInput.value = '';

    renderCardList();

    // If it was the first card, render it immediately
    if (cards.length === 1) {
         currentIndex = 0;
         renderCard();
    }
    updateStatsUI(); // Update total count
}

function deleteCard(id) {
    cards = cards.filter(card => card.id !== id);
    saveData();

    // Adjust index if we deleted the current card or one before it
    if (currentIndex >= cards.length) {
         currentIndex = Math.max(0, cards.length - 1);
    }
      renderCardList();
      renderCard();
      updateStatsUI();
  }

  function renderCardList() {
      cardListEl.innerHTML = '';
      cards.forEach(card => {
        const li = document.createElement('li');
        li.innerHTML = `
             <span>${card.question.substring(0, 20)}...</span>
          <button class="delete-btn" onclick="window.deleteCard(${card.id})">
               <i class="fa-solid fa-trash"></i>
             </button>
        `;
        cardListEl.appendChild(li);
      });
  }

  // Expose delete function to window for inline onclick
  window.deleteCard = deleteCard;

  function resetStats() {
      if(confirm("Are you sure you want to reset your study progress?")) {
        stats = { studied: 0, correct: 0, incorrect: 0 };
        saveData();
          updateStatsUI();
      }
  }

  // --- Theme Logic ---
  function checkTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          themeIcon.classList.replace('fa-moon', 'fa-sun');
      }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('theme', 'light');
          themeIcon.classList.replace('fa-sun', 'fa-moon');
      } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
          themeIcon.classList.replace('fa-moon', 'fa-sun');
      }
  }

  // --- Event Listeners ---

  // Navigation
  flipBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent bubbling if nested
    flipCard();
  });

  cardContainer.addEventListener('click', flipCard);
  nextBtn.addEventListener('click', nextCard);
  prevBtn.addEventListener('click', prevCard);
  shuffleBtn.addEventListener('click', shuffleCards);

  // Quiz
  markCorrectBtn.addEventListener('click', () => handleQuizResult(true));
  markWrongBtn.addEventListener('click', () => handleQuizResult(false));

  // Form
  form.addEventListener('submit', addCard);
  resetStatsBtn.addEventListener('click', resetStats);

  // Theme
  themeToggle.addEventListener('click', toggleTheme);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in inputs
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

       if (e.code === 'Space') {
           e.preventDefault(); // Prevent scrolling
           flipCard();
       } else if (e.code === 'ArrowRight') {
           nextCard();
       } else if (e.code === 'ArrowLeft') {
           prevCard();
       }
  });

  // Run Init
  init();
});