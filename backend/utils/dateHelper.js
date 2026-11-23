// Helper to compute ISO Week string e.g., '2026-W47' from a YYYY-MM-DD date string
function getISOWeekString(dateString) {
  const d = new Date(dateString + 'T00:00:00Z');
  // ISO-8601 week starts on Monday, find the nearest Thursday
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Format Date object to YYYY-MM-DD in local time
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  getISOWeekString,
  getTodayString,
};
