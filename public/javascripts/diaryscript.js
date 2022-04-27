let questions = document.getElementsByClassName("question");
let previous = document.getElementById("Previous");
let next = document.getElementById("Next");
let submitContainer = document.getElementById("submitContainer");
let submit = document.getElementById("submit");
let dontSubmit = document.getElementById("dontSubmit");
let questionControl = document.getElementById("questionControl");
let inputs = document.getElementsByTagName("input");
let numOfQuestions = questions.length;
let currentQuestion = 0;

let goToNextQuestion = () => {
  if (currentQuestion < numOfQuestions - 1) {
    if (currentQuestion === 0) {
      previous.style.display = "inline";
    }
    questions[currentQuestion].style.display = "none";
    questions[++currentQuestion].style.display = "block";
  } else {
    questions[currentQuestion++].style.display = "none";
    questionControl.style.display = "none";
    submitContainer.style.display = "block";
    submit.disabled = false;
  }
};

let goToPreviousQuestion = () => {
  if (currentQuestion === 1) {
    previous.style.display = "none";
  }

  if (currentQuestion <= numOfQuestions - 1) {
    questions[currentQuestion].style.display = "none";
  } else {
    submit.disabled = true;
    submitContainer.style.display = "none";
    questionControl.style.display = "block";
  }

  questions[--currentQuestion].style.display = "block";
};

window.onload = () => {
  questions[currentQuestion].style.display = "block";
  previous.style.display = "none";
  next.addEventListener("click", goToNextQuestion);
  previous.addEventListener("click", goToPreviousQuestion);
  dontSubmit.addEventListener("click", goToPreviousQuestion);
};
