export const mathQuestions = [
  // 1-linear variable equation
  {
    question: "Solve for x: 2x + 5 = 15",
    options: ["x = 5", "x = 10", "x = 7.5", "x = 2.5"],
    correctAnswer: "x = 5",
  },
  {
    question: "Solve for y: 3y - 7 = 11",
    options: ["y = 6", "y = 3", "y = 18", "y = 4"],
    correctAnswer: "y = 6",
  },
  {
    question: "Solve for z: z / 4 + 3 = 5",
    options: ["z = 8", "z = 2", "z = 12", "z = 32"],
    correctAnswer: "z = 8",
  },

  // 2-linear variable equation
  {
    question: "Solve for x and y: x + y = 8, x - y = 2",
    options: ["x = 5, y = 3", "x = 3, y = 5", "x = 6, y = 2", "x = 2, y = 6"],
    correctAnswer: "x = 5, y = 3",
  },
  {
    question: "Solve for a and b: 2a + b = 7, a - b = -1",
    options: ["a = 2, b = 3", "a = 3, b = 1", "a = 1, b = 5", "a = 4, b = -1"],
    correctAnswer: "a = 2, b = 3",
  },

  // Variance (Statistics)
  {
    question: "What is the variance of the following data set: {2, 4, 6}?",
    options: ["2", "4", "8", "2.67"],
    correctAnswer: "2.67", // Mean is 4. ( (2-4)^2 + (4-4)^2 + (6-4)^2 ) / 3 = (4+0+4)/3 = 8/3 = 2.67
  },
  {
    question: "If a data set has a standard deviation of 5, what is its variance?",
    options: ["25", "10", "5", "sqrt(5)"],
    correctAnswer: "25",
  },
  {
    question: "Which of the following is a measure of the spread of a data set?",
    options: ["Variance", "Mean", "Median", "Mode"],
    correctAnswer: "Variance",
  },

  // Calculus (Differentiation)
  {
    question: "What is the derivative of f(x) = x^2?",
    options: ["2x", "x", "x^2/2", "2"],
    correctAnswer: "2x",
  },
  {
    question: "What is the derivative of f(x) = 5x + 3?",
    options: ["5", "3", "5x", "8"],
    correctAnswer: "5",
  },

  {
    question: "What is the derivative of a constant?",
    options: ["0", "1", "The constant itself", "-1"],
    correctAnswer: "0",
  },

  // Probability
  {
    question: "What is the probability of getting heads when flipping a fair coin?",
    options: ["1/2", "1", "0", "1/4"],
    correctAnswer: "1/2",
  },
  {
    question: "What is the probability of rolling a 6 on a standard six-sided die?",
    options: ["1/6", "1/3", "1/2", "1"],
    correctAnswer: "1/6",
  },
  {
    question: "If a bag contains 3 red balls and 2 blue balls, what is the probability of picking a red ball?",
    options: ["3/5", "2/5", "1/2", "3/2"],
    correctAnswer: "3/5",
  },
];