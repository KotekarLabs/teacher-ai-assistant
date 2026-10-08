import React from "react";
import type {
  HomeworkTask,
  HomeworkTaskType,
} from "@teacher-ai/contracts";

interface HomeworkEditorProps {
  title: string;
  instructions: string;
  estimatedTimeMinutes: number;
  tasks: HomeworkTask[];
  onTitleChange: (title: string) => void;
  onInstructionsChange: (instructions: string) => void;
  onEstimatedTimeChange: (minutes: number) => void;
  onTasksChange: (tasks: HomeworkTask[]) => void;
}

export const HomeworkEditor: React.FC<HomeworkEditorProps> = ({
  title,
  instructions,
  estimatedTimeMinutes,
  tasks,
  onTitleChange,
  onInstructionsChange,
  onEstimatedTimeChange,
  onTasksChange,
}) => {
  const handleTaskTitleChange = (index: number, val: string) => {
    const next = [...tasks];
    next[index] = { ...next[index], title: val };
    onTasksChange(next);
  };

  const handleTaskDescriptionChange = (index: number, val: string) => {
    const next = [...tasks];
    next[index] = { ...next[index], description: val };
    onTasksChange(next);
  };

  const handleTaskTypeChange = (index: number, type: HomeworkTaskType) => {
    const next = [...tasks];
    next[index] = { ...next[index], type };
    onTasksChange(next);
  };

  const handleDeleteTask = (index: number) => {
    if (tasks.length <= 1) return;
    const next = tasks
      .filter((_, i) => i !== index)
      .map((t, i) => ({ ...t, position: i + 1 }));
    onTasksChange(next);
  };

  const handleMoveTask = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tasks.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const next = [...tasks];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    const reindexed = next.map((t, i) => ({ ...t, position: i + 1 }));
    onTasksChange(reindexed);
  };

  const handleAddTask = () => {
    const newTask: HomeworkTask = {
      position: tasks.length + 1,
      title: "New Homework Task",
      description: "Describe the task or questions students need to complete.",
      type: "PRACTICE",
    };
    onTasksChange([...tasks, newTask]);
  };

  return (
    <div className="space-y-6" data-testid="homework-editor">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Homework Title
            </label>
            <input
              type="text"
              data-testid="homework-title-input"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-1 rounded"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-3.5 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-900 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                Est. Completion Time
              </span>
              <span
                data-testid="estimated-time-display"
                className="text-lg font-extrabold"
              >
                {estimatedTimeMinutes} min
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              General Instructions for Students
            </label>
            <textarea
              rows={2}
              data-testid="homework-instructions-editor"
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Complete in your notebook. Show all working clearly."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Estimated Time (Minutes)
            </label>
            <input
              type="number"
              min={5}
              max={180}
              data-testid="homework-time-editor"
              value={estimatedTimeMinutes}
              onChange={(e) => onEstimatedTimeChange(Number(e.target.value) || 30)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Tasks & Activities ({tasks.length})
          </h3>
          <button
            type="button"
            data-testid="add-task-btn"
            onClick={handleAddTask}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>+ Add Task</span>
          </button>
        </div>

        {tasks.map((task, tIndex) => (
          <div
            key={tIndex}
            data-testid={`task-item-${tIndex}`}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {task.position}
                </span>

                <select
                  data-testid={`task-type-select-${tIndex}`}
                  value={task.type}
                  onChange={(e) =>
                    handleTaskTypeChange(tIndex, e.target.value as HomeworkTaskType)
                  }
                  className="text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700"
                >
                  <option value="PRACTICE">Practice</option>
                  <option value="WRITTEN">Written</option>
                  <option value="ACTIVITY">Activity</option>
                  <option value="CREATIVE">Creative</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  title="Move Up"
                  disabled={tIndex === 0}
                  onClick={() => handleMoveTask(tIndex, "up")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={tIndex === tasks.length - 1}
                  onClick={() => handleMoveTask(tIndex, "down")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                >
                  ▼
                </button>
                <button
                  type="button"
                  title="Delete Task"
                  data-testid={`delete-task-${tIndex}`}
                  disabled={tasks.length <= 1}
                  onClick={() => handleDeleteTask(tIndex)}
                  className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                data-testid={`task-title-${tIndex}`}
                value={task.title}
                onChange={(e) => handleTaskTitleChange(tIndex, e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Instructions / Description
              </label>
              <textarea
                rows={3}
                data-testid={`task-description-${tIndex}`}
                value={task.description}
                onChange={(e) =>
                  handleTaskDescriptionChange(tIndex, e.target.value)
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-slate-800"
                placeholder="Explain the exercise or activity in detail..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
