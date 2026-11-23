const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /api/analytics
// Returns:
// 1. Overall stats (total, completed, average goal completion rate)
// 2. Weekly stats array (week, total, completed, completionRate) sorted chronologically
// 3. Daily summary for recent days
router.get('/', async (req, res) => {
  try {
    // 1. Aggregate Weekly Stats for Bar Chart
    const weeklyAggregation = await Todo.aggregate([
      {
        $group: {
          _id: '$week',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] },
          },
          minDate: { $min: '$date' },
        },
      },
      {
        $project: {
          _id: 0,
          week: '$_id',
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 1] },
              0,
            ],
          },
          minDate: 1,
        },
      },
      { $sort: { week: 1 } },
    ]);

    // 2. Aggregate Daily Stats to compute average daily completion rate
    const dailyAggregation = await Todo.aggregate([
      {
        $group: {
          _id: '$date',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
          completed: 1,
          rate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { date: -1 } },
    ]);

    // 3. Overall Totals
    const totalGoals = await Todo.countDocuments();
    const completedGoals = await Todo.countDocuments({ completed: true });
    const overallRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 1000) / 10 : 0;

    // Average Daily Completion Rate across all active days
    const activeDaysCount = dailyAggregation.length;
    let avgDailyRate = 0;
    if (activeDaysCount > 0) {
      const sumRates = dailyAggregation.reduce((acc, curr) => acc + curr.rate, 0);
      avgDailyRate = Math.round((sumRates / activeDaysCount) * 10) / 10;
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalGoals,
          completedGoals,
          pendingGoals: totalGoals - completedGoals,
          overallCompletionRate: overallRate,
          avgDailyCompletionRate: avgDailyRate,
          trackedDaysCount: activeDaysCount,
        },
        weekly: weeklyAggregation,
        recentDays: dailyAggregation.slice(0, 14),
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
});

module.exports = router;
