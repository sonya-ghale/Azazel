// const express = require('express');
// const router = express.Router();
// const submissionsController = require('../controllers/submissions');
// const multer = require('multer');
// const { db, fetchStoryDataFromDatabase,fetchChaptersFromDatabase } = require('../db');

// const path = require('path');
// const fs = require('fs');


const express = require('express');
const router = express.Router();
const submissionsController = require('../controllers/submissions');
const multer = require('multer');
const { fetchStoryDataFromDatabase, fetchChaptersFromDatabase } = require('../db');

const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // Adjust the folder path as per your requirements
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/story_submission', (req, res) => {
  const user = req.session.user; // Retrieve the user information from the session
  const submittedStory = req.session.submittedStory; // Retrieve the submitted story data from the session
  if (submittedStory) {
    // If there is already submitted data, render the story_submission page with the data
    res.render('story_submission', { submittedStory });
  } else {
    // If there is no submitted data, render the story_submission page without any data
    res.render('story_submission');
  }
});

router.get('/story_submission/:story_id', (req, res) => {
  const user = req.session.user; // Retrieve the user information from the session
  const storyId = req.params.story_id;
  // Retrieve the existing story data from the database using the storyId
  // Replace `fetchStoryDataFromDatabase` with your actual function to fetch story data from the database
  fetchStoryDataFromDatabase(storyId)
    .then((story) => {
      if (story) {
        // If the story exists, render the story_submission page with the data
        res.render('story_submission', { story });
      } else {
        // If the story does not exist, render the story_submission page without any data
        res.render('story_submission');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error fetching story data');
    });
});

// router.get('/story_submission', submissionsController.getStorySubmissionPage);
router.post('/story_submission', upload.fields([{ name: 'cover_image', maxCount: 1 }]), submissionsController.story_submission);

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));


router.get('/view/:story_id', submissionsController.viewStory);

router.get('/view_user/:story_id', submissionsController.viewUserStory); // New route for user_view.hbs

// Route for adding a new chapter to a story
router.post('/add_chapter/:story_id', upload.single('chapter_file'), submissionsController.addChapter);

// Route for deleting a chapter
router.post('/delete_chapter/:story_id', submissionsController.deleteChapter);

// Route for deleting a chapter
router.delete('/delete_chapter/:story_id', submissionsController.deleteChapter);

// Route for deleting an entire story
router.post('/delete_story/:story_id', submissionsController.deleteStory);

router.get('/search_results', submissionsController.search);

module.exports = router;

