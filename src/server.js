const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const District = require('./models/District'); 
const authRoutes = require('./routes/auth');
const districtRoutes = require('./routes/districts');
const recordRoutes = require('./routes/record');
const pdfRoutes = require('./routes/pdf');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/user');

const ROLES = require('./utils/roles');
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const cotonouDistricts = [
  { name: "Akpakpa" },
  { name: "Cadjèhoun" },
  { name: "Hèvié" },
  { name: "Zogbo" },
  { name: "Tokpa" },
  { name: "Cotonou Centre" },
];

const seedAdminUserAndDistricts = async () => {
  try {
    const adminExists = await User.findOne({ role: ROLES.ADMIN });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'adminpassword',
        role: ROLES.ADMIN,
        district: null,
      });
      await admin.save();
      console.log('Admin user created successfully without bcrypt.');
    } else {
      console.log('Admin user already exists.');
    }

    for (const districtData of cotonouDistricts) {
      const districtExists = await District.findOne({ name: districtData.name });
      if (!districtExists) {
        const newDistrict = new District(districtData);
        await newDistrict.save();
        console.log(`District ${districtData.name} created successfully.`);
      } else {
        console.log(`District ${districtData.name} already exists.`);
      }
    }
  } catch (error) {
    console.error('Error creating admin user and districts:', error);
  }
};

seedAdminUserAndDistricts();

app.use('/api/auth', authRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
