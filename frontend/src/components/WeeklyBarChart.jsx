import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WeeklyBarChart({ weeklyData = [] }) {
  const formatWeekLabel = (weekStr) => {
    if (!weekStr) return 'Week';
    const parts = weekStr.split('-W');
    if (parts.length === 2) {
      return `Week ${parts[1]} (${parts[0]})`;
    }
    return weekStr;
  };

  const labels = weeklyData.length > 0 
    ? weeklyData.map((w) => formatWeekLabel(w.week)) 
    : ['Current Week'];

  const completionRates = weeklyData.length > 0
    ? weeklyData.map((w) => w.completionRate)
    : [0];

  const totalCounts = weeklyData.length > 0 ? weeklyData.map((w) => w.total) : [0];
  const completedCounts = weeklyData.length > 0 ? weeklyData.map((w) => w.completed) : [0];

  const data = {
    labels,
    datasets: [
      {
        label: 'Goal Completion Rate (%)',
        data: completionRates,
        backgroundColor: completionRates.map((rate) => {
          if (rate >= 80) return 'rgba(16, 185, 129, 0.85)';
          if (rate >= 50) return 'rgba(99, 102, 241, 0.85)';
          return 'rgba(245, 158, 11, 0.85)';
        }),
        borderColor: completionRates.map((rate) => {
          if (rate >= 80) return '#10b981';
          if (rate >= 50) return '#6366f1';
          return '#f59e0b';
        }),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#94a3b8',
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' },
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const idx = context.dataIndex;
            const rate = context.raw;
            const comp = completedCounts[idx] || 0;
            const tot = totalCounts[idx] || 0;
            return [
              ` Completion Rate: ${rate}%`,
              ` Goals Finished: ${comp} / ${tot}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#94a3b8',
          callback: (val) => `${val}%`,
          font: { family: "'Plus Jakarta Sans', sans-serif" },
        },
        title: {
          display: true,
          text: 'Completion Rate (%)',
          color: '#64748b',
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { family: "'Plus Jakarta Sans', sans-serif" },
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
