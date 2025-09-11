import React from 'react';

const Answers = ({ questions, userAnswers, onBackToScore }) => {
  return (
    <div className="w-full max-w-2xl bg-[var(--bg-secondary)] rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Review Answers</h2>
      <div className="space-y-4">
        {questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          return (
            <div key={index} className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
              <p className="font-bold mb-2">{index + 1}. {question.question}</p>
              <p className={`p-2 rounded ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                Your answer: {userAnswer || 'Not Answered'}
              </p>
              {!isCorrect && (
                <p className="p-2 mt-2 rounded bg-green-500/20 text-green-300">
                  Correct answer: {question.correctAnswer}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={onBackToScore}
          className="bg-[var(--primary-blue)] text-[var(--text-primary)] px-4 py-2 rounded hover:bg-[var(--primary-purple)]"
        >
          Back to Score
        </button>
      </div>
    </div>
  );
};

export default Answers;