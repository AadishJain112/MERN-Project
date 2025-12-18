const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./config/db');

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://mern-frontend-is.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/', (_req, res) => {
  res.json({ message: 'CD-STAR API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/academicRecords'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));

app.use((err, _req, res, _next) => {
  console.error('API error:', err.message);
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    const gracefulShutdown = async (signal) => {
      console.log(`${signal} received. Closing HTTP server.`);
      server.close(async (err) => {
        if (err) {
          console.error('Error closing server:', err);
          process.exit(1);
        }
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

