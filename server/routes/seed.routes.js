const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
  try {
    // 1. Clear everything for a truly clean slate
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Room.deleteMany({});
    await Batch.deleteMany({});
    await Course.deleteMany({});
    await Timetable.deleteMany({});

    // 2. Create Admin (Using .save() to ensure hashing)
    const admin = new User({
      name: 'Administrator',
      email: 'admin@edusync.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();

    // 3. Create Batches
    const batch = await Batch.create({ name: 'CSE-A', academicYear: '2023-24', studentCount: 45 });

    // 4. Create Rooms
    const room = await Room.create({ name: 'Room 101', capacity: 40, type: 'classroom' });

    // 5. Create Teachers
    const teacher = await Teacher.create({ 
      name: 'Dr. Sarah Wilson', 
      email: 'sarah.wilson@edusync.com',
      availability: [{ day: 'Monday' }, { day: 'Wednesday' }] 
    });

    // 6. Create Courses
    const course = await Course.create({ 
      code: 'PH101', 
      name: 'Physics', 
      hoursPerWeek: 4, 
      courseType: 'theory', 
      requiredRoomType: 'classroom' 
    });

    // 7. Create Teacher User (Using .save() to ensure hashing)
    const teacherUser = new User({
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@edusync.com',
      password: 'password123',
      role: 'teacher',
      teacherId: teacher._id
    });
    await teacherUser.save();

    // 8. Create Student User (Using .save() to ensure hashing)
    const studentUser = new User({
      name: 'John Doe',
      email: 'john.doe@edusync.com',
      password: 'password123',
      role: 'student',
      batchId: batch._id
    });
    await studentUser.save();

    // 9. Generate a Published Timetable
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

    await Timetable.create({
      batch: batch._id,
      weekStartDate: startDate,
      status: 'published',
      slots: [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', course: course._id, teacher: teacher._id, room: room._id }
      ]
    });

    res.json({ 
      success: true, 
      message: 'Production Database Seeded Successfully with properly hashed passwords!',
      counts: {
        users: await User.countDocuments(),
        teachers: await Teacher.countDocuments()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
