const { run } = require("../../db/db");

const trackEvent = async (req, eventType, contentId = null, metadata = null) => {
  try {
    const userId = req?.user?.id;
    if (!userId || !eventType) {
      return;
    }
    const payload = metadata ? JSON.stringify(metadata) : null;
    await run(
      "INSERT INTO usage_events (user_id, event_type, content_id, metadata) VALUES (?, ?, ?, ?)",
      [userId, String(eventType), contentId || null, payload]
    );
  } catch (_err) {
    // fail silently
  }
};

module.exports = {
  trackEvent,
};
