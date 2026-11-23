import React from 'react';
import { CheckCircle2, Calendar, Target } from 'lucide-react';

export default function MetricsSummary({ summary, dayStats }) {
  const avgDailyRate = summary.avgDailyCompletionRate ?? 0;
  const overallRate = summary.overallCompletionRate ?? 0;
  const dayRate = dayStats.rate ?? 0;

  return (
    <section className="metrics-grid">
      {/* Average Daily Completion Rate */}
      <div className="metric-card highlight-card">
        <div className="metric-icon rate-icon">
          <CheckCircle2 size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Avg Daily Completion Rate</span>
          <div className="metric-value-wrap">
            <span className="metric-value">{avgDailyRate}%</span>
            <span className="metric-trend">Overall: {overallRate}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(avgDailyRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Selected Day's Progress */}
      <div className="metric-card">
        <div className="metric-icon day-icon">
          <Calendar size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Selected Day Progress</span>
          <div className="metric-value-wrap">
            <span className="metric-value">{dayRate}%</span>
            <span className="metric-sub">
              {dayStats.completed} / {dayStats.total} goals
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill accent-fill"
              style={{ width: `${Math.min(dayRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total Goals Tracked */}
      <div className="metric-card">
        <div className="metric-icon total-icon">
          <Target size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Total Goals Tracked</span>
          <div className="metric-value-wrap">
            <span className="metric-value">{summary.totalGoals ?? 0}</span>
            <span className="metric-sub">
              Across {summary.trackedDaysCount ?? 0} active day(s)
            </span>
          </div>
          <p className="metric-caption">
            <span>{summary.completedGoals ?? 0}</span> completed
          </p>
        </div>
      </div>
    </section>
  );
}
