require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });
const connectDB = require('../config/db');
const Category = require('../models/Category');
const User = require('../models/User');

const categories = [
  { name: 'Fiction', icon: '📖' },
  { name: 'Non-Fiction', icon: '📘' },
  { name: 'Romance', icon: '💕' },
  { name: 'Science Fiction', icon: '🚀' },
  { name: 'Philosophy', icon: '🧠' },
  { name: 'Kannada Literature', icon: '📚' },
  { name: 'Hindi Literature', icon: '📚' },
];

const seed = async () => {
  await connectDB();

  for (const cat of categories) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  console.log(`Seeded ${categories.length} categories`);

  const adminEmail = 'admin@bookmeup.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'BookMeUp Admin',
      email: adminEmail,
      password: 'Admin@12345',
      role: 'admin',
      isVerified: true,
    });
    console.log(`Created default admin: ${adminEmail} / Admin@12345 (change this password immediately)`);
  } else {
    console.log('Default admin already exists');
  }

  console.log('Seeding complete');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
