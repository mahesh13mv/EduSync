require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Room = require('./models/Room');
const Course = require('./models/Course');
const Batch = require('./models/Batch');
const Timetable = require('./models/Timetable');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Teacher.deleteMany();
    await Room.deleteMany();
    await Course.deleteMany();
    await Batch.deleteMany();
    await Timetable.deleteMany();

    // 1. Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@edusync.com',
      password: 'Admin@1234',
      role: 'admin'
    });
    console.log('Admin user created');

    // 2. Create Teachers
    const teachers = await Teacher.insertMany([
      {
        name: 'Dr. Smith',
        email: 'smith@edusync.com',
        department: 'Computer Science',
        maxHoursPerWeek: 20,
        availability: [
          { day: 'Monday', slots: ['09:00', '10:00', '11:00', '12:00'] },
          { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '12:00'] },
          { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '12:00'] },
          { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '12:00'] },
          { day: 'Friday', slots: ['09:00', '10:00', '11:00', '12:00'] }
        ]
      },
      {
        name: 'Prof. Johnson',
        email: 'johnson@edusync.com',
        department: 'Mathematics',
        maxHoursPerWeek: 15,
        availability: [
          { day: 'Monday', slots: ['13:00', '14:00', '15:00', '16:00'] },
          { day: 'Wednesday', slots: ['13:00', '14:00', '15:00', '16:00'] },
          { day: 'Friday', slots: ['13:00', '14:00', '15:00', '16:00'] }
        ]
      }
    ]);
    console.log('Teachers created');

    // 3. Create Rooms
    const rooms = await Room.insertMany([
      { name: 'Room 101', capacity: 60, type: 'classroom' },
      { name: 'Room 102', capacity: 40, type: 'classroom' },
      { name: 'Lab A', capacity: 30, type: 'lab', facilities: ['computers'] },
      { name: 'Seminar Hall', capacity: 150, type: 'seminar_hall', facilities: ['AC', 'projector'] }
    ]);
    console.log('Rooms created');

    // 4. Create Batches
    const batches = await Batch.insertMany([
      { name: 'CSE-A', department: 'Computer Science', semester: 4, studentCount: 50 },
      { name: 'CSE-B', department: 'Computer Science', semester: 4, studentCount: 45 }
    ]);
    console.log('Batches created');

    // 5. Create Courses
    const smith = teachers[0];
    const johnson = teachers[1];
    const cseA = batches[0];
    const cseB = batches[1];

    const courses = await Course.insertMany([
      {
        name: 'Data Structures',
        code: 'CS401',
        hoursPerWeek: 4,
        sessionDuration: 60,
        courseType: 'theory',
        requiredRoomType: 'classroom',
        requiredCapacity: 50,
        assignedTeacher: smith._id,
        batches: [cseA._id, cseB._id]
      },
      {
        name: 'Algorithms Lab',
        code: 'CS401L',
        hoursPerWeek: 3,
        sessionDuration: 60,
        courseType: 'lab',
        requiredRoomType: 'lab',
        requiredCapacity: 30,
        assignedTeacher: smith._id,
        batches: [cseA._id]
      },
      {
        name: 'Discrete Mathematics',
        code: 'MA401',
        hoursPerWeek: 3,
        sessionDuration: 60,
        courseType: 'theory',
        requiredRoomType: 'classroom',
        requiredCapacity: 45,
        assignedTeacher: johnson._id,
        batches: [cseA._id, cseB._id]
      }
    ]);
    console.log('Courses created');
    
    // 6. Create Extra Users for testing roles
    const teacherUser = await User.create({
      name: "Dr. Ramesh",
      email: "teacher@edusync.com",
      password: "Teacher@1234",
      role: "teacher",
      teacherId: smith._id
    });
    
    // Update teacher document with userId
    smith.userId = teacherUser._id;
    await smith.save();

    await User.create({
      name: "Ravi Kumar",
      email: "student@edusync.com",
      password: "Student@1234",
      role: "student",
      batchId: cseA._id
    });
    console.log('Extra users created and linked');

    // 7. Create a pre-generated Published Timetable for CSE-A
    const ds = courses[0];
    const math = courses[2];
    const room101 = rooms[0];

    await Timetable.create({
      batch: cseA._id,
      weekStartDate: new Date(),
      status: 'published',
      slots: [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', course: ds._id, teacher: smith._id, room: room101._id },
        { day: 'Monday', startTime: '10:00', endTime: '11:00', course: math._id, teacher: johnson._id, room: room101._id },
        { day: 'Tuesday', startTime: '11:00', endTime: '12:00', course: ds._id, teacher: smith._id, room: room101._id },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:00', course: math._id, teacher: johnson._id, room: room101._id },
        { day: 'Thursday', startTime: '13:00', endTime: '14:00', course: math._id, teacher: johnson._id, room: room101._id }
      ]
    });
    console.log('Sample Published Timetable created');

    console.log('Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
