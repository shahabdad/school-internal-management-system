const path = require('path');
const dotenv = require('dotenv');

// Load env vars from the project root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const app = require('./app');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const DB = process.env.DATABASE_URI || process.env.MONGODB_URI;

let server;

if (DB) {
  mongoose
    .connect(DB, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('Database connection successful!');
      server = startServer();
    })
    .catch((err) => {
      console.error('Database connection failed:', err.message);
      console.log('Starting server without active DB connection...');
      server = startServer();
    });
} else {
  console.warn('WARNING: DATABASE_URI or MONGODB_URI environment variable is not defined.');
  console.log('Starting server in offline database mode...');
  server = startServer();
}

function startServer() {
  return app.listen(PORT, () => {
    console.log(`Application is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  }
});
