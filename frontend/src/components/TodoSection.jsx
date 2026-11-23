import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';

export default function TodoSection({
  todos,
  selectedDate,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTodo(title.trim(), priority);
    setTitle('');
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const formatDateDisplay = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Goals for Today';
    const parts = dateStr.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    return `Goals for ${dateObj.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  return (
    <section className="card tasks-section">
      <div className="section-header">
        <div>
          <h2>{formatDateDisplay(selectedDate)}</h2>
          <p className="section-desc">Store each day's tasks & track execution</p>
        </div>
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Done
          </button>
        </div>
      </div>

      {/* Add Goal Form */}
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="input-wrap">
          <input
            type="text"
            placeholder="What goal or task are you accomplishing on this date?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="select-priority"
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button type="submit" className="btn-primary">
          <Plus size={18} />
          Add Goal
        </button>
      </form>

      {/* Todo List */}
      <div className="todo-list-wrap">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No goals found for this day</h3>
            <p>Add a goal above to start tracking completion rate for this day.</p>
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li
                key={todo._id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                <div className="todo-left">
                  <button
                    type="button"
                    className="checkbox-custom"
                    onClick={() => onToggleTodo(todo._id, !todo.completed)}
                    aria-label="Toggle goal"
                  >
                    {todo.completed && <Check size={16} strokeWidth={3} />}
                  </button>
                  <span className="todo-text">{todo.title}</span>
                </div>
                <div className="todo-badges">
                  <span className={`priority-badge priority-${todo.priority || 'medium'}`}>
                    {todo.priority || 'medium'}
                  </span>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => onDeleteTodo(todo._id)}
                    title="Delete goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
