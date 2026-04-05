require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Service = require('./models/Service');

const seed = async () => {
  await connectDB();

  console.log('🧹 Clearing existing data...');
  await User.deleteMany({});
  await Service.deleteMany({});

  console.log('🌱 Seeding users...');

  // Create admin
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin',
  });

  // Create seller
  const seller = await User.create({
    name: 'City Hospital',
    email: 'seller@test.com',
    password: '123456',
    role: 'seller',
  });

  // Create regular user
  await User.create({
    name: 'Demo User',
    email: 'user@test.com',
    password: '123456',
    role: 'user',
  });

  console.log('✅ Users seeded.');

  console.log('🌱 Seeding services...');

  await Service.create([
    {
      name: 'City General Hospital',
      category: 'Hospital',
      location: '123 Health Ave, Metro City',
      timings: '09:00 AM - 05:00 PM',
      closedDays: [0],
      status: 'Busy',
      description: 'Providing comprehensive healthcare services with a designated urgent care wing.',
      allowsInstantQueue: true,
      hasEmergencyAccess: true,
      slotDurationMins: 30,
      slotPrice: 50.00,
      averageWaitTimePerPerson: 5,
      owner: seller._id,
    },
    {
      name: 'Metropolitan Bank',
      category: 'Bank',
      location: '45 Finance Street, Downtown',
      timings: '09:00 AM - 04:00 PM',
      closedDays: [0, 6],
      status: 'Open',
      description: 'Full-service financial institution offering personal and business banking.',
      allowsInstantQueue: false,
      hasEmergencyAccess: false,
      slotDurationMins: 15,
      slotPrice: 0,
      averageWaitTimePerPerson: 10,
      owner: seller._id,
    },
    {
      name: 'DMV Office Center',
      category: 'Government',
      location: '88 Civic Blvd, Zone 4',
      timings: '08:30 AM - 05:00 PM',
      closedDays: [0, 6],
      status: 'Busy',
      description: 'Department of Motor Vehicles. Licensing, registration, and IDs.',
      allowsInstantQueue: false,
      hasEmergencyAccess: false,
      slotDurationMins: 20,
      slotPrice: 15.50,
      averageWaitTimePerPerson: 8,
      owner: seller._id,
    },
    {
      name: 'Sunrise Clinic',
      category: 'Hospital',
      location: '201 Wellness Park',
      timings: '08:00 AM - 08:00 PM',
      closedDays: [],
      status: 'Open',
      description: 'Specialized clinic for physical therapy and wellness consultation.',
      allowsInstantQueue: true,
      hasEmergencyAccess: true,
      slotDurationMins: 60,
      slotPrice: 120.00,
      averageWaitTimePerPerson: 15,
      owner: seller._id,
    },
  ]);

  console.log('✅ Services seeded.');
  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('   user@test.com   / 123456  (User)');
  console.log('   seller@test.com / 123456  (Seller)');
  console.log('   admin@test.com  / 123456  (Admin)');
  console.log('');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed Error:', err);
  process.exit(1);
});
