const { getKickLiveStatus } = require('./kickApi');

function startBackgroundWorker(db) {
  console.log('Background worker started. Polling Kick API every 60s...');

  const pollKickApi = async () => {
    try {
      // Fetch all kick streamers
      const streamers = db.prepare("SELECT id, slug FROM streamers WHERE platform = 'kick' AND approved = 1").all();
      
      if (streamers.length === 0) return;

      // In a real 100M app, we would chunk this to respect rate limits (e.g. 5 concurrent requests)
      // For now, we update them in parallel but it happens in the background, out of the user's request path
      const updates = await Promise.allSettled(streamers.map(async (s) => {
        const liveData = await getKickLiveStatus(s.slug);
        if (liveData) {
          return {
            id: s.id,
            live: liveData.live ? 1 : 0,
            viewers: liveData.viewers || 0
          };
        }
        return null;
      }));

      // Use a transaction for bulk update to be atomic and fast
      const updateStmt = db.prepare('UPDATE streamers SET live = ?, viewers = ? WHERE id = ?');
      const transaction = db.transaction((validUpdates) => {
        for (const update of validUpdates) {
          updateStmt.run(update.live, update.viewers, update.id);
        }
      });

      const validUpdates = updates
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

      if (validUpdates.length > 0) {
        transaction(validUpdates);
      }
    } catch (err) {
      console.error('Background worker error:', err.message);
    }
  };

  // Run immediately on startup
  pollKickApi();

  // Then poll every 60 seconds
  setInterval(pollKickApi, 60 * 1000);
}

module.exports = { startBackgroundWorker };
