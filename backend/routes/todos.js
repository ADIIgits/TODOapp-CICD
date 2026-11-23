const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const { getISOWeekString, getTodayString } = require('../utils/dateHelper');

// GET /api/todos?date=YYYY-MM-DD
// Returns todos for a specific day (defaults to today)
router.get('/', async (req, res) => {
  try {
    const targetDate = req.query.date || getTodayString();
    const todos = await Todo.find({ date: targetDate }).sort({ createdAt: -1 });
    res.json({
      success: true,
      date: targetDate,
      count: todos.length,
      data: todos,
    });
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ success: false, message: 'Server error fetching todos' });
  }
});

// POST /api/todos
// Creates a new todo for a given day (defaults to today)
router.post('/', async (req, res) => {
  try {
    const { title, date, priority } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const todoDate = date || getTodayString();
    const week = getISOWeekString(todoDate);

    const newTodo = new Todo({
      title: title.trim(),
      date: todoDate,
      week: week,
      priority: priority || 'medium',
      completed: false,
    });

    const saved = await newTodo.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ success: false, message: 'Server error creating todo' });
  }
});

// PUT /api/todos/:id
// Toggle completion or update fields
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, title, priority, date } = req.body;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(400).json({ success: false, message: 'Todo not found' });
    }

    if (typeof completed === 'boolean') {
      todo.completed = completed;
      todo.completedAt = completed ? new Date() : null;
    }
    if (title && title.trim()) {
      todo.title = title.trim();
    }
    if (priority) {
      todo.priority = priority;
    }
    if (date) {
      todo.date = date;
      todo.week = getISOWeekString(date);
    }

    const updated = await todo.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ success: false, message: 'Server error updating todo' });
  }
});

// DELETE /api/todos/:id
// Deletes a specific todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Todo.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.json({ success: true, message: 'Todo deleted successfully', data: deleted });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ success: false, message: 'Server error deleting todo' });
  }
});

module.exports = router;
