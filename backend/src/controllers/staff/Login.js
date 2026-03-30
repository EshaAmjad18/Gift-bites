const jwt = require('jsonwebtoken');
const Staff = require('../../models/Staff');

exports.loginStaff = async (req, res) => {
  const { email, password } = req.body;

  const staff = await Staff.findOne({ email }).populate('cafeteria');
  if (!staff) return res.status(401).json({ message: 'Invalid credentials' });

  // (password check skip kar raha hoon abhi speed ke liye)

  const token = jwt.sign(
    {
      id: staff._id,
      cafeteriaId: staff.cafeteria._id
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    staff: {
      name: staff.name,
      cafeteria: staff.cafeteria.name
    }
  });
};
