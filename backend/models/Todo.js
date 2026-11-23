const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // YYYY-MM-DD representing the day this goal/todo is scheduled for
    date: {
      type: String,
      required: true,
      index: true,
    },
    // ISO week string e.g. "2026-W47" for aggregation
    week: {
      type: String,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Todo', TodoSchema);
