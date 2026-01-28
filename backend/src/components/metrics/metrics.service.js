const { all, get } = require("../../db/db");

const normalizeDate = (value, fallback) => {
  if (!value) return fallback;
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return fallback;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const buildRange = (from, to) => {
  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const defaultFrom = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const fromDate = normalizeDate(from, defaultFrom);
  const toDate = normalizeDate(to, defaultTo);

  return {
    fromStart: `${fromDate} 00:00:00`,
    toEnd: `${toDate} 23:59:59`,
    fromDate,
    toDate,
  };
};

const getAdoptionMetrics = async ({ from, to }) => {
  const range = buildRange(from, to);

  const activeUsersRow = await get(
    "SELECT COUNT(DISTINCT user_id) as count FROM usage_events WHERE created_at BETWEEN ? AND ?",
    [range.fromStart, range.toEnd]
  );

  const contributorsRow = await get(
    "SELECT COUNT(DISTINCT user_id) as count FROM usage_events WHERE event_type IN ('CREATE','COMMENT') AND created_at BETWEEN ? AND ?",
    [range.fromStart, range.toEnd]
  );

  const consumersRow = await get(
    "SELECT COUNT(DISTINCT user_id) as count FROM usage_events WHERE event_type IN ('VIEW','SEARCH','DOWNLOAD') AND created_at BETWEEN ? AND ?",
    [range.fromStart, range.toEnd]
  );

  const topEvents = await all(
    "SELECT event_type, COUNT(*) as count FROM usage_events WHERE created_at BETWEEN ? AND ? GROUP BY event_type ORDER BY count DESC",
    [range.fromStart, range.toEnd]
  );

  const weeklyTrend = await all(
    `SELECT strftime('%Y-%W', created_at) as week,
            COUNT(DISTINCT user_id) as activeUsers,
            COUNT(DISTINCT CASE WHEN event_type IN ('CREATE','COMMENT') THEN user_id END) as contributors,
            COUNT(DISTINCT CASE WHEN event_type IN ('VIEW','SEARCH','DOWNLOAD') THEN user_id END) as consumers
     FROM usage_events
     WHERE created_at BETWEEN ? AND ?
     GROUP BY week
     ORDER BY week`,
    [range.fromStart, range.toEnd]
  );

  const activeUsers = activeUsersRow?.count || 0;
  const contributors = contributorsRow?.count || 0;
  const consumers = consumersRow?.count || 0;
  const contributorVsConsumerRate =
    consumers === 0 ? 0 : Number((contributors / consumers).toFixed(2));

  return {
    range: { from: range.fromDate, to: range.toDate },
    activeUsers,
    contributors,
    consumers,
    contributorVsConsumerRate,
    topEvents,
    weeklyTrend,
  };
};

module.exports = {
  getAdoptionMetrics,
};
