const AdminReport = require('../../models/AdminReport');
const User = require('../../models/User');

const getReports = async (req, res) => {
  try {
    // Optional: filter by cafeteria if you store cafeteria in user
    const reports = await AdminReport.find({ resolved: false })
      .populate('user', 'name email cafeteria');

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error.message);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

module.exports = { getReports };
