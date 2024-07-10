const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const submissionsController = require('../controllers/submissions');
const { db, getUserByID, getUserByEmail, updateUser } = require('../db');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/dashboard', async (req, res) => {
  if (req.session.user) {
    try {
      // Fetch all submitted stories from the database
      const sql = 'SELECT * FROM submissions';
      db.query(sql, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error fetching submitted stories: ' + err.message);
        } else {
          const submittedStories = result;
          res.render('dashboard', { submittedStories });
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error fetching submitted stories');
    }
  } else {
    // User is not logged in, redirect to the login page
    res.redirect('/login');
  }
});

router.get('/about_us', (req, res) => {
    res.render('nav-bar/about_us');
}); 

router.get('/contact_us', (req, res) => {
    res.render('nav-bar/contact_us');
  });

router.get('/privacy_policy', (req, res) => {
    res.render('nav-bar/privacy_policy');
});

router.get('/something', (req, res) => {
    res.render('nav-bar/something');
});

router.get('/personal_info', authController.personal_info);

// Route for rendering dashboard.hbs nav-bar
router.get('/update', (req, res) => {
    res.render('update');
});

router.post('/update', authController.update);


router.get('/logout', authController.logout);

router.get('/story_submission', (req, res) => {
    res.render('story_submission');
});


// GET route for rendering the collection page for the logged-in writer
router.get('/collection', (req, res) => {
  if (req.session.user) {
    const userId = req.session.user.id;
    const sql = 'SELECT * FROM submissions WHERE user_id = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching submitted stories: ' + err.message);
      } else {
        const submittedStories = result;
        res.render('collection', { submittedStories });
      }
    });
  } else {
    // User is not logged in, redirect to the login page
    res.redirect('/login');
  }
});

//can't work with out this code
module.exports = router;
