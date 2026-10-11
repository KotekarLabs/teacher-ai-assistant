import React from "react";
import type {
  QuizQuestion,
  QuestionType,
  QuizDifficulty,
} from "@teacher-ai/contracts";

interface QuizEditorProps {
  title: string;
  instructions: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  onTitleChange: (title: string) => void;
  onInstructionsChange: (instructions: string) => void;
  onDurationChange: (minutes: number) => void;
  onQuestionsChange: (questions: QuizQuestion[]) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  title,
  instructions,
  durationMinutes,
  questions,
  onTitleChange,
  onInstructionsChange,
  onDurationChange,
  onQuestionsChange,
}) => {
  const calculatedTotalMarks = questions.reduce(
    (sum, q) => sum + (q.marks || 1),
    0,
  );

  const handleQuestionTextChange = (index: number, text: string) => {
    const next = [...questions];
    next[index] = { ...next[index], question: text };
    onQuestionsChange(next);
  };

  const handleCorrectAnswerChange = (index: number, answer: string) => {
    const next = [...questions];
    next[index] = { ...next[index], correctAnswer: answer };
    onQuestionsChange(next);
  };

  const handleExplanationChange = (index: number, explanation: string) => {
    const next = [...questions];
    next[index] = { ...next[index], explanation };
    onQuestionsChange(next);
  };

  const handleMarksChange = (index: number, marks: number) => {
    const next = [...questions];
    next[index] = { ...next[index], marks: Math.max(1, marks) };
    onQuestionsChange(next);
  };

  const handleDifficultyChange = (
    index: number,
    difficulty: QuizDifficulty,
  ) => {
    const next = [...questions];
    next[index] = { ...next[index], difficulty };
    onQuestionsChange(next);
  };

  const handleTypeChange = (
    index: number,
    type: QuestionType,
  ) => {
    const next = [...questions];
    const prev = next[index];
    let newOptions = prev.options || [];
    let newAnswer = prev.correctAnswer;

    if (type === "MULTIPLE_CHOICE") {
      if (!newOptions || newOptions.length < 2) {
        newOptions = ["Option A", "Option B", "Option C", "Option D"];
        newAnswer = newOptions[0];
      }
    } else if (type === "TRUE_FALSE") {
      newOptions = ["True", "False"];
      newAnswer = "True";
    } else {
      newOptions = [];
    }

    next[index] = {
      ...prev,
      type,
      options: newOptions,
      correctAnswer: newAnswer,
    };
    onQuestionsChange(next);
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string,
  ) => {
    const next = [...questions];
    const prevOpt = next[qIndex].options?.[optIndex];
    const opts = [...(next[qIndex].options || [])];
    opts[optIndex] = value;

    // If correctAnswer was exactly the old option, update it too
    let newCorrect = next[qIndex].correctAnswer;
    if (newCorrect === prevOpt) {
      newCorrect = value;
    }

    next[qIndex] = { ...next[qIndex], options: opts, correctAnswer: newCorrect };
    onQuestionsChange(next);
  };

  const handleAddOption = (qIndex: number) => {
    const next = [...questions];
    const opts = [...(next[qIndex].options || []), "New Option"];
    next[qIndex] = { ...next[qIndex], options: opts };
    onQuestionsChange(next);
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const next = [...questions];
    const opts = (next[qIndex].options || []).filter((_, i) => i !== optIndex);
    let newCorrect = next[qIndex].correctAnswer;
    if (!opts.includes(newCorrect) && opts.length > 0) {
      newCorrect = opts[0];
    }
    next[qIndex] = { ...next[qIndex], options: opts, correctAnswer: newCorrect };
    onQuestionsChange(next);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const next = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, position: i + 1 }));
    onQuestionsChange(next);
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const next = [...questions];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    const reindexed = next.map((q, i) => ({ ...q, position: i + 1 }));
    onQuestionsChange(reindexed);
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      position: questions.length + 1,
      type: "MULTIPLE_CHOICE",
      question: "New quiz question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: "Explanation for the correct answer.",
      marks: 1,
      difficulty: "MEDIUM",
    };
    onQuestionsChange([...questions, newQ]);
  };

  return (
    <div className="space-y-6 sm:space-y-8" data-testid="quiz-editor">
      {/* Header Info */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Quiz Title
            </label>
            <input
              type="text"
              data-testid="quiz-title-input"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 focus:border-violet-600 focus:outline-none px-1 py-1.5 rounded transition-colors"
            />
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-2 bg-violet-50/80 rounded-xl border border-violet-100 text-violet-900 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-600">
                Total Marks
              </span>
              <span
                data-testid="calculated-total-marks"
                className="text-lg font-extrabold text-violet-950"
              >
                {calculatedTotalMarks}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quiz Instructions for Students
            </label>
            <textarea
              rows={2}
              data-testid="quiz-instructions-editor"
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              placeholder="e.g. Answer all questions. Choose the most appropriate option."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={180}
              data-testid="quiz-time-editor"
              value={durationMinutes}
              onChange={(e) => onDurationChange(Number(e.target.value) || 20)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Questions ({questions.length})
          </h3>
          <button
            type="button"
            data-testid="add-question-btn"
            onClick={handleAddQuestion}
            className="px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer min-h-[36px]"
          >
            <span>+ Add Question</span>
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            data-testid={`question-item-${qIndex}`}
            className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 relative"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {q.position}
                </span>

                <select
                  data-testid={`question-type-select-${qIndex}`}
                  value={q.type}
                  onChange={(e) =>
                    handleTypeChange(qIndex, e.target.value as QuestionType)
                  }
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>

                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <span>Marks:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    data-testid={`question-marks-${qIndex}`}
                    value={q.marks}
                    onChange={(e) =>
                      handleMarksChange(qIndex, Number(e.target.value))
                    }
                    className="w-14 px-2 py-0.5 border border-slate-300 rounded-lg text-center text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <select
                  data-testid={`question-difficulty-${qIndex}`}
                  value={q.difficulty}
                  onChange={(e) =>
                    handleDifficultyChange(
                      qIndex,
                      e.target.value as QuizDifficulty,
                    )
                  }
                  className="text-xs px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-slate-700 cursor-pointer"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                <button
                  type="button"
                  title="Move Up"
                  aria-label="Move Up"
                  disabled={qIndex === 0}
                  onClick={() => handleMoveQuestion(qIndex, "up")}
                  className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                >
                  ▲
                </button>
                <button
                  type="button"
                  title="Move Down"
                  aria-label="Move Down"
                  disabled={qIndex === questions.length - 1}
                  onClick={() => handleMoveQuestion(qIndex, "down")}
                  className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                >
                  ▼
                </button>
                <button
                  type="button"
                  title="Delete Question"
                  aria-label="Delete Question"
                  data-testid={`delete-question-${qIndex}`}
                  disabled={questions.length <= 1}
                  onClick={() => handleDeleteQuestion(qIndex)}
                  className="p-2 text-rose-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Question Text
              </label>
              <textarea
                rows={2}
                data-testid={`question-text-${qIndex}`}
                value={q.question}
                onChange={(e) =>
                  handleQuestionTextChange(qIndex, e.target.value)
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors font-medium text-slate-900"
              />
            </div>

            {/* Options (for MULTIPLE_CHOICE) */}
            {q.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Multiple Choice Options (Select radio to set Correct Answer)
                </label>
                {(q.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-radio-${qIndex}`}
                      checked={q.correctAnswer === opt}
                      onChange={() => handleCorrectAnswerChange(qIndex, opt)}
                      className="text-violet-600 focus:ring-violet-500 h-4 w-4 cursor-pointer"
                      title="Set as correct answer"
                    />
                    <span className="text-xs font-bold text-slate-400 w-6">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <input
                      type="text"
                      data-testid={`question-${qIndex}-option-${optIdx}`}
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(qIndex, optIdx, e.target.value)
                      }
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(qIndex, optIdx)}
                      className="text-xs text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                      aria-label={`Remove Option ${String.fromCharCode(65 + optIdx)}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddOption(qIndex)}
                  className="text-xs font-semibold text-violet-700 hover:text-violet-900 pt-1 cursor-pointer"
                >
                  + Add Option
                </button>
              </div>
            )}

            {/* True / False Selection */}
            {q.type === "TRUE_FALSE" && (
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Correct Answer
                </label>
                <div className="flex items-center space-x-6">
                  {["True", "False"].map((opt) => (
                    <label key={opt} className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-slate-900">
                      <input
                        type="radio"
                        name={`tf-radio-${qIndex}`}
                        checked={q.correctAnswer === opt}
                        onChange={() => handleCorrectAnswerChange(qIndex, opt)}
                        className="text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer for Fill-in-the-blank & Short Answer */}
            {(q.type === "FILL_IN_THE_BLANK" || q.type === "SHORT_ANSWER") && (
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                <label className="block text-xs font-semibold text-emerald-900 mb-1">
                  Correct Answer
                </label>
                <input
                  type="text"
                  data-testid={`question-answer-${qIndex}`}
                  value={q.correctAnswer}
                  onChange={(e) =>
                    handleCorrectAnswerChange(qIndex, e.target.value)
                  }
                  className="w-full px-3.5 py-1.5 text-sm rounded-lg border border-emerald-200 bg-white text-slate-900"
                />
              </div>
            )}

            {/* Explanation */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Answer Explanation (Teacher & Student Feedback)
              </label>
              <textarea
                rows={2}
                data-testid={`question-explanation-${qIndex}`}
                value={q.explanation || ""}
                onChange={(e) =>
                  handleExplanationChange(qIndex, e.target.value)
                }
                placeholder="Explain why this answer is correct..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
