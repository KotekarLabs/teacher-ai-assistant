import React from "react";
import type {
  WorksheetQuestion,
  QuestionType,
  WorksheetDifficulty,
} from "@teacher-ai/contracts";

interface WorksheetEditorProps {
  title: string;
  instructions: string;
  estimatedTimeMinutes: number;
  questions: WorksheetQuestion[];
  onTitleChange: (title: string) => void;
  onInstructionsChange: (instructions: string) => void;
  onTimeChange: (minutes: number) => void;
  onQuestionsChange: (questions: WorksheetQuestion[]) => void;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  FILL_IN_THE_BLANK: "Fill in the Blank",
  SHORT_ANSWER: "Short Answer",
  MATCH_THE_FOLLOWING: "Match the Following",
};

export const WorksheetEditor: React.FC<WorksheetEditorProps> = ({
  title,
  instructions,
  estimatedTimeMinutes,
  questions,
  onTitleChange,
  onInstructionsChange,
  onTimeChange,
  onQuestionsChange,
}) => {
  const handleQuestionTextChange = (index: number, text: string) => {
    const next = [...questions];
    next[index] = { ...next[index], question: text };
    onQuestionsChange(next);
  };

  const handleExpectedAnswerChange = (index: number, answer: string) => {
    const next = [...questions];
    next[index] = { ...next[index], expectedAnswer: answer };
    onQuestionsChange(next);
  };

  const handleMarksChange = (index: number, marks: number) => {
    const next = [...questions];
    next[index] = { ...next[index], marks: Math.max(1, marks) };
    onQuestionsChange(next);
  };

  const handleDifficultyChange = (
    index: number,
    difficulty: WorksheetDifficulty,
  ) => {
    const next = [...questions];
    next[index] = { ...next[index], difficulty };
    onQuestionsChange(next);
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string,
  ) => {
    const next = [...questions];
    const opts = [...(next[qIndex].options || [])];
    opts[optIndex] = value;
    next[qIndex] = { ...next[qIndex], options: opts };
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
    next[qIndex] = { ...next[qIndex], options: opts };
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
    const newQ: WorksheetQuestion = {
      position: questions.length + 1,
      type: "SHORT_ANSWER",
      question: "New practice question",
      options: [],
      expectedAnswer: "Sample answer",
      marks: 1,
      difficulty: "MEDIUM",
    };
    onQuestionsChange([...questions, newQ]);
  };

  return (
    <div className="space-y-6" data-testid="worksheet-editor">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Worksheet Title
          </label>
          <input
            type="text"
            data-testid="worksheet-title-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-1 rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              General Instructions for Students
            </label>
            <textarea
              rows={2}
              data-testid="worksheet-instructions-editor"
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Answer all questions. Write neatly."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Estimated Completion Time (Minutes)
            </label>
            <input
              type="number"
              min={5}
              max={180}
              data-testid="worksheet-time-editor"
              value={estimatedTimeMinutes}
              onChange={(e) => onTimeChange(Number(e.target.value) || 30)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Questions ({questions.length})
          </h3>
          <button
            type="button"
            data-testid="add-question-btn"
            onClick={handleAddQuestion}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>+ Add Question</span>
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            data-testid={`question-item-${qIndex}`}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {q.position}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {QUESTION_TYPE_LABELS[q.type] || q.type}
                </span>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
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
                    className="w-14 px-2 py-0.5 border border-slate-200 rounded text-center"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  data-testid={`question-difficulty-${qIndex}`}
                  value={q.difficulty}
                  onChange={(e) =>
                    handleDifficultyChange(
                      qIndex,
                      e.target.value as WorksheetDifficulty,
                    )
                  }
                  className="text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                <button
                  type="button"
                  title="Move Up"
                  disabled={qIndex === 0}
                  onClick={() => handleMoveQuestion(qIndex, "up")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={qIndex === questions.length - 1}
                  onClick={() => handleMoveQuestion(qIndex, "down")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                >
                  ▼
                </button>
                <button
                  type="button"
                  title="Delete Question"
                  data-testid={`delete-question-${qIndex}`}
                  disabled={questions.length <= 1}
                  onClick={() => handleDeleteQuestion(qIndex)}
                  className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Text
              </label>
              <textarea
                rows={2}
                data-testid={`question-text-${qIndex}`}
                value={q.question}
                onChange={(e) =>
                  handleQuestionTextChange(qIndex, e.target.value)
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              />
            </div>

            {/* Options (if multiple choice or match or true/false) */}
            {q.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <label className="block text-xs font-semibold text-slate-600">
                  Multiple Choice Options
                </label>
                {(q.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center space-x-2">
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
                      className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(qIndex, optIdx)}
                      className="text-xs text-red-500 hover:text-red-700 px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddOption(qIndex)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-1"
                >
                  + Add Option
                </button>
              </div>
            )}

            {/* Expected Answer */}
            <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Expected Answer / Solution Key
              </label>
              <input
                type="text"
                data-testid={`question-answer-${qIndex}`}
                value={q.expectedAnswer}
                onChange={(e) =>
                  handleExpectedAnswerChange(qIndex, e.target.value)
                }
                className="w-full px-3 py-1.5 text-sm rounded border border-emerald-200 bg-white text-slate-900"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
