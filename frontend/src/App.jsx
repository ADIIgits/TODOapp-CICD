import React, { useState, useEffect, useCallback } from 'react';
import {
  getTodosByDate,
  createTodo,
  updateTodo,
  deleteTodo,
  getAnalytics,
  checkHealth,
} from './api';
import MetricsSummary from './components/MetricsSummary';
import WeeklyBarChart from './components/WeeklyBarChart';
import TodoSection from './components/TodoSection';
import { CheckSquare, RefreshCw } from 'lucide-react';

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [todos, setTodos] = useState([]);
  const [analytics, setAnalytics] = useState({
    summary: {},
    weekly: [],
    recentDays: [],
  });
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'error' | 'no-db'
  const [loading, setLoading] = useState(false);

  // Health check
  const verifyBackend = useCallback(async () => {
    try {
      const data = await checkHealth();
      if (data && data.status === 'ok') {
        setBackendStatus(data.dbConnected ? 'connected' : 'no-db');
      } else {
        setBackendStatus('error');
      }
    } catch {
      setBackendStatus('error');
    }
  }, []);

  // Fetch todos for selected date
  const fetchTodos = useCallback(async (date) => {
    try {
      const res = await getTodosByDate(date);
      setTodos(res.data || []);
    } catch (err) {
      console.error('Fetch todos failed:', err);
      setTodos([]);
    }
  }, []);

  // Fetch aggregated analytics (Avg Goal Completion Rate & Weekly data)
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await getAnalytics();
      if (res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Fetch analytics failed:', err);
    }
  }, []);

  useEffect(() => {
    verifyBackend();
    fetchTodos(selectedDate);
    fetchAnalytics();
  }, [verifyBackend, fetchTodos, fetchAnalytics, selectedDate]);

  const handleAddTodo = async (title, priority) => {
    try {
      const res = await createTodo({
        title,
        priority,
        date: selectedDate,
      });
      if (res.data) {
        setTodos((prev) => [res.data, ...prev]);
        fetchAnalytics(); // recalculate weekly & avg completion rates
      }
    } catch (err) {
      alert('Failed to add goal. Ensure backend & MongoDB are connected.');
    }
  };

  const handleToggleTodo = async (id, newCompleted) => {
    try {
      const res = await updateTodo(id, { completed: newCompleted });
      if (res.data) {
        setTodos((prev) =>
          prev.map((t) => (t._id === id ? res.data : t))
        );
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
      fetchAnalytics();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Day's stats
  const dayTotal = todos.length;
  const dayCompleted = todos.filter((t) => t.completed).length;
  const dayRate = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
  const dayStats = { total: dayTotal, completed: dayCompleted, rate: dayRate };

  return (
    <div className="app-layout">
      {/* Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <CheckSquare size={24} />
          </div>
          <div>
            <h1>GoalPulse</h1>
            <p className="subtitle">React + Express Daily Goal Tracking Engine</p>
          </div>
        </div>

        <div className="nav-controls">
          <div className={`connection-pill ${backendStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {backendStatus === 'connected' && 'Atlas Connected'}
              {backendStatus === 'no-db' && 'Server Up (No DB)'}
              {backendStatus === 'error' && 'Backend Offline'}
              {backendStatus === 'checking' && 'Connecting...'}
            </span>
          </div>

          <div className="date-picker-wrap">
            <label htmlFor="datePicker">Date:</label>
            <input
              type="date"
              id="datePicker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              className="btn-secondary"
              onClick={() => setSelectedDate(getTodayString())}
            >
              Today
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* Metric Cards */}
        <MetricsSummary
          summary={analytics.summary || {}}
          dayStats={dayStats}
        />

        {/* Weekly Goal Completion Bar Chart */}
        <section className="card chart-section">
          <div className="section-header">
            <div>
              <h2>Weekly Goal Completion</h2>
              <p className="section-desc">
                Bar chart of each week's goal completion rate (%)
              </p>
            </div>
            <button
              className="btn-icon"
              onClick={() => {
                fetchAnalytics();
                fetchTodos(selectedDate);
              }}
              title="Refresh Analytics"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <WeeklyBarChart weeklyData={analytics.weekly || []} />
        </section>

        {/* Daily Goal Management */}
        <TodoSection
          todos={todos}
          selectedDate={selectedDate}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      </main>

      <footer className="app-footer">
        <p>
          GoalPulse &bull; React (Vite) + Express.js Architecture &bull; MongoDB Atlas &bull; AWS Cloud Ready
        </p>
      </footer>
    </div>
  );
}
