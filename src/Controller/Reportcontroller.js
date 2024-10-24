const Event = require('../Models/Events');

const getReport = async (req, res) => {
  const { eventId, reportType } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const now = new Date();
    let startDate;

    switch (reportType) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'lifetime':
      default:
        startDate = event.date;
    }

    const report = {
      title: event.title,
      sales: event.sales, // Filtered sales for the report range can be added
      revenue: event.revenue,
      dateRange: { from: startDate, to: now },
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getReport };
