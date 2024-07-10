// put all the important things of website
const express = require("express");
const path = require('path');
// const mysql = require("mysql");
const dotenv = require('dotenv');
const hbs = require("hbs");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');

dotenv.config({ path: './.env' });

const app = express();

const publicDirectory = path.join(__dirname, 'public');
// const uploadsDirectory = path.join(__dirname, 'public/uploads');

app.use(express.static(publicDirectory));
// app.use('/uploads', express.static(path.join(publicDirectory, 'uploads')));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// View engine setup
// app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

// Register the "user" helper
hbs.registerHelper('user', function () {
  return this.user; // Assuming the "user" object is available in the template context
});

// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false, // Set it to true if you're using HTTPS
      maxAge: 3600000 // Session expiration time in milliseconds (e.g., 1 hour)
  }
}));

// Set up error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});


// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder where uploaded files will be stored
    cb(null, 'public/uploads'); // Adjust the folder path as per your requirements
  },
  filename: function (req, file, cb) {
    // Set the file name for the uploaded file
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Import routes
const authRouter = require('./routes/auth');
const pagesRouter = require('./routes/pages');
const submissionsRouter = require('./routes/submissions');

// Import the database connection pool
const { db, getUserByID, getUserByEmail, updateUser } = require('./db');

app.use('/auth', authRouter);
app.use('/', pagesRouter);
app.use('/submissions', submissionsRouter);
// app.use('/contact_us', pagesRouter);

app.listen(5121, () => {
  console.log("Server started");
});
