// Education page interactive quiz
const quizQuestions = [
    {
        question: "You receive an email from 'support@paypa1.com' asking you to verify your account. What should you do?",
        options: [
            "Click the link and enter your credentials",
            "Reply with your account information",
            "Delete it - the domain is suspicious (note the '1' instead of 'l')",
            "Forward it to friends for their opinion"
        ],
        correct: 2,
        explanation: "The email address uses '1' instead of 'l' in PayPal, which is a common phishing tactic called typosquatting. Always check sender addresses carefully and never click suspicious links."
    },
    {
        question: "A text message says you've won a $500 gift card and asks you to click a shortened link to claim it. What's the red flag?",
        options: [
            "Nothing - gift cards are commonly given away",
            "Shortened URLs hide the real destination",
            "$500 is too small an amount",
            "Text messages are always safe"
        ],
        correct: 1,
        explanation: "Shortened URLs (like bit.ly links) are often used in phishing to hide malicious destinations. Legitimate companies typically use their official domains and don't send unsolicited prizes."
    },
    {
        question: "An email says 'Your account will be closed in 24 hours unless you verify immediately!' What tactic is this?",
        options: [
            "Legitimate security measure",
            "Customer service",
            "Urgency/fear tactic",
            "Standard procedure"
        ],
        correct: 2,
        explanation: "Creating a false sense of urgency is a common phishing tactic designed to make you act without thinking. Legitimate companies rarely threaten immediate account closure without proper notice."
    },
    {
        question: "Which of these is the MOST secure way to access your bank account after receiving a suspicious email?",
        options: [
            "Click the link in the email",
            "Reply to the email asking if it's legitimate",
            "Type your bank's URL directly into your browser",
            "Search for your bank on Google and click the first result"
        ],
        correct: 2,
        explanation: "Always type the official URL directly into your browser or use a saved bookmark. This ensures you're going to the legitimate site, not a phishing page."
    },
    {
        question: "Your boss sends an urgent email from a new email address asking for employee W-2 forms. What should you do?",
        options: [
            "Send the forms immediately - it's your boss",
            "Verify the request through a different channel (call or in-person)",
            "Reply asking for more details",
            "Forward the request to HR"
        ],
        correct: 1,
        explanation: "This is a common spear phishing attack. Always verify unusual requests for sensitive information through a separate, trusted communication channel, even if they appear to come from someone you know."
    }
];

let currentQuestionIndex = 0;
let score = 0;

// Initialize quiz
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quizQuestion')) {
        loadQuestion();
    }
});

function loadQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showFinalScore();
        return;
    }

    const question = quizQuestions[currentQuestionIndex];
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('quizOptions');
    const resultDiv = document.getElementById('quizResult');

    questionNumber.textContent = currentQuestionIndex + 1;
    questionText.textContent = question.question;
    resultDiv.classList.add('hidden');

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Create option buttons
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selectedIndex) {
    const question = quizQuestions[currentQuestionIndex];
    const resultDiv = document.getElementById('quizResult');
    const resultTitle = document.getElementById('resultTitle');
    const resultExplanation = document.getElementById('resultExplanation');
    const questionDiv = document.getElementById('quizQuestion');

    const isCorrect = selectedIndex === question.correct;
    if (isCorrect) {
        score++;
    }

    // Hide question, show result
    questionDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add(isCorrect ? 'correct' : 'incorrect');

    resultTitle.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect';
    resultExplanation.textContent = question.explanation;
}

// Next question handler
document.getElementById('nextQuestion')?.addEventListener('click', () => {
    currentQuestionIndex++;
    const questionDiv = document.getElementById('quizQuestion');
    const resultDiv = document.getElementById('quizResult');

    questionDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    resultDiv.classList.remove('correct', 'incorrect');

    loadQuestion();
});

function showFinalScore() {
    const questionDiv = document.getElementById('quizQuestion');
    const scoreDiv = document.getElementById('quizScore');
    const finalScore = document.getElementById('finalScore');
    const scoreMessage = document.getElementById('scoreMessage');

    questionDiv.classList.add('hidden');
    scoreDiv.classList.remove('hidden');

    finalScore.textContent = score;

    let message = '';
    if (score === 5) {
        message = 'Perfect score! You have excellent phishing awareness! 🎉';
    } else if (score >= 4) {
        message = 'Great job! You can spot most phishing attempts. Keep learning! 👍';
    } else if (score >= 3) {
        message = 'Good effort! Review the red flags section to improve your detection skills. 📚';
    } else {
        message = 'Keep practicing! Review the education materials to better protect yourself online. 💪';
    }

    scoreMessage.textContent = message;
}

// Restart quiz handler
document.getElementById('restartQuiz')?.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;

    const questionDiv = document.getElementById('quizQuestion');
    const scoreDiv = document.getElementById('quizScore');

    scoreDiv.classList.add('hidden');
    questionDiv.classList.remove('hidden');

    loadQuestion();
});

// Smooth scroll for TOC links
document.querySelectorAll('.toc-list a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Update URL without scrolling
            history.pushState(null, '', targetId);
        }
    });
});

// Highlight section on scroll
const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            const tocLink = document.querySelector(`.toc-list a[href="#${id}"]`);

            // Remove active class from all links
            document.querySelectorAll('.toc-list a').forEach(link => {
                link.style.fontWeight = 'normal';
                link.style.color = 'var(--primary-color)';
            });

            // Add active style to current link
            if (tocLink) {
                tocLink.style.fontWeight = '600';
                tocLink.style.color = 'var(--primary-dark)';
            }
        }
    });
}, observerOptions);

// Observe all education sections
document.querySelectorAll('.education-section[id]').forEach(section => {
    observer.observe(section);
});

// Add copy button to code examples
document.querySelectorAll('.example-item code').forEach(codeBlock => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    codeBlock.parentNode.insertBefore(wrapper, codeBlock);
    wrapper.appendChild(codeBlock);
});

// Animate stats on scroll
const animateStats = () => {
    const stats = document.querySelectorAll('.stat-inline-number');

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const finalValue = entry.target.textContent;
                entry.target.textContent = '0';

                // Animate the number
                setTimeout(() => {
                    entry.target.textContent = finalValue;
                    entry.target.style.transition = 'all 0.5s ease-out';
                }, 100);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));
};

if (document.querySelector('.stat-inline-number')) {
    animateStats();
}
