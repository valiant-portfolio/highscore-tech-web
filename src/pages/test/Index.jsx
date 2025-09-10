import React, { useState, useEffect } from 'react';
import { mathQuestions } from './questions/mathQuestions';
import Answers from './Answers';

const Test = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(mathQuestions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmit();
    }
  }, [timeLeft, showResult]);

  const handleAnswerSelect = (option) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = option;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = () => {
    let newScore = 0;
    for (let i = 0; i < mathQuestions.length; i++) {
      if (selectedAnswers[i] === mathQuestions[i].correctAnswer) {
        newScore++;
      }
    }
    setScore(newScore);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < mathQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAllAnswered = () => {
    return selectedAnswers.every(answer => answer !== null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // const restartTest = () => {
  //   setCurrentQuestion(0);
  //   setSelectedAnswers(Array(mathQuestions.length).fill(null));
  //   setShowResult(false);
  //   setShowAnswers(false);
  //   setScore(0);
  //   setTimeLeft(600);
  // }

  const handleViewAnswers = () => {
    setShowAnswers(true);
  };

  const handleBackToScore = () => {
    setShowAnswers(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4 text-[var(--text-primary)]">
        {showAnswers ? (
            <Answers questions={mathQuestions} userAnswers={selectedAnswers} onBackToScore={handleBackToScore} />
        ) : (
            <div className="w-full max-w-2xl bg-[var(--bg-secondary)] rounded-lg shadow-md p-6">
                {showResult ? (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Test Results</h2>
                    <p className="text-xl mb-4">Your score: {score} out of {mathQuestions.length} ({((score / mathQuestions.length) * 100).toFixed(2)}%)</p>
                    <div className="flex justify-center space-x-4">
                        <button
                        onClick={handleViewAnswers}
                        className="bg-[var(--accent-green)] text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                        View Answers
                        </button>
                    </div>
                </div>
                ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Question {currentQuestion + 1} of {mathQuestions.length}</h2>
                    <div className="text-lg font-mono bg-[var(--bg-tertiary)] px-3 py-1 rounded">
                        Time Left: {formatTime(timeLeft)}
                    </div>
                    </div>
                    <div className="mb-4">
                    <p className="text-lg">{mathQuestions[currentQuestion].question}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                    {mathQuestions[currentQuestion].options.map((option, index) => (
                        <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`text-left p-3 rounded border ${
                            selectedAnswers[currentQuestion] === option
                            ? 'bg-[var(--primary-blue)] text-[var(--text-primary)] border-[var(--primary-blue)]'
                            : 'bg-[var(--bg-tertiary)] hover:bg-[var(--color-gray-700)] border-[var(--color-gray-700)]'
                        }`}
                        >
                        {option}
                        </button>
                    ))}
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                            className="bg-[var(--color-gray-700)] text-[var(--text-primary)] px-4 py-2 rounded hover:bg-[var(--color-gray-800)] disabled:opacity-50"
                        >
                            Prev
                        </button>
                    {isAllAnswered() && (
                        <button
                            onClick={handleSubmit}
                            className="bg-[var(--accent-green)] text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Submit
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={currentQuestion === mathQuestions.length - 1}
                        className="bg-[var(--color-gray-700)] text-[var(--text-primary)] px-4 py-2 rounded hover:bg-[var(--color-gray-800)] disabled:opacity-50"
                    >
                        Next
                    </button>
                    </div>
                </>
                )}
            </div>
        )}
    </div>
  );
};

export default Test;
