const { db, getUserByEmail, getUserByID, updateUser, fetchStoryDataFromDatabase } = require('../db');
const path = require('path');
const mysql = require('mysql');

const fs = require('fs');
// ==========================================STORY SUBMISSION=============================================
// exports.story_submission = async (req, res) => {
//   try {
//     const { title, description, genre, username } = req.body;
//     const cover_image = req.files['cover_image'][0];
//     const userId = req.session.user.id;

//     // Check if the required fields are present
//     if (!title || !description || !genre || !username || !cover_image) {
//       return res.status(400).send('Missing required fields');
//     }

//      // Validate fields to contain only alphabets
//      if (!isAlphabet(title) || !isAlphabet(description) || !isAlphabet(genre) || !isAlphabet(username)) {
//       return res.status(400).send('Invalid input. Fields should contain only alphabets.');
//     }

//     const cover_image_path = path.basename(cover_image.path);

//     // Insert a new story without the chapter data
//     const insertStorySql =
//       'INSERT INTO submissions (title, description, genre, username, cover_image, user_id) VALUES (?, ?, ?, ?, ?, ?)';
//     db.query(
//       insertStorySql,
//       [title, description, genre, username, cover_image_path, userId],
//       (err, storyResult) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).send('Error submitting the story: ' + err.message);
//         } else {
//           const storyId = storyResult.insertId;

//           // Retrieve the newly submitted story
//           const selectSql = 'SELECT * FROM submissions WHERE story_id = ?';
//           db.query(selectSql, [storyId], (err, submissionResult) => {
//             if (err) {
//               console.error(err);
//               return res.status(500).send('Error retrieving the submitted story: ' + err.message);
//             } else {
//               const submittedStory = submissionResult[0];
//               // Pass the submitted story data to the session
//               req.session.submittedStory = submittedStory;
//               res.redirect(`/submissions/view/${storyId}`);
//             }
//           });
//         }
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send('Error submitting the story');
//   }
// };
// // Function to check if a string contains only alphabets
// function isAlphabet(input) {
//   const alphabetRegex = /^[A-Za-z\s]+$/;
//   return alphabetRegex.test(input);
// }

function isAlphabet(input) {
  const alphabetRegex = /^[A-Za-z\s]+$/;
  return alphabetRegex.test(input);
}

exports.story_submission = async (req, res) => {
  try {
    const { title, description, genre, username } = req.body;
    const cover_image = req.files['cover_image'][0];
    const userId = req.session.user.id;

    // Check if the required fields are present
    if (!title || !description || !genre || !username || !cover_image) {
      return res.render('story_submission', {
        errorMsg: 'Missing required fields',
        // ... Pass other necessary variables ...
      });
    }

    // Validate fields to contain only alphabets
    if (!isAlphabet(title) || !isAlphabet(description) || !isAlphabet(genre) || !isAlphabet(username)) {
      return res.render('story_submission', {
        errorMsg: 'Invalid input. Fields should contain only alphabets.',
        // ... Pass other necessary variables ...
      });
    }

    const cover_image_path = path.basename(cover_image.path);

    // Insert a new story without the chapter data
    const insertStorySql =
      'INSERT INTO submissions (title, description, genre, username, cover_image, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(
      insertStorySql,
      [title, description, genre, username, cover_image_path, userId],
      (err, storyResult) => {
        if (err) {
          console.error(err);
          return res.render('story_submission', {
            errorMsg: 'Error submitting the story: ' + err.message,
            // ... Pass other necessary variables ...
          });
        } else {
          const storyId = storyResult.insertId;

          // Retrieve the newly submitted story
          const selectSql = 'SELECT * FROM submissions WHERE story_id = ?';
          db.query(selectSql, [storyId], (err, submissionResult) => {
            if (err) {
              console.error(err);
              return res.render('story_submission', {
                errorMsg: 'Error retrieving the submitted story: ' + err.message,
                // ... Pass other necessary variables ...
              });
            } else {
              const submittedStory = submissionResult[0];
              // Pass the submitted story data to the session
              req.session.submittedStory = submittedStory;
              return res.redirect(`/submissions/view/${storyId}`);
            }
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.render('story_submission', {
      errorMsg: 'Error submitting the story',
      // ... Pass other necessary variables ...
    });
  }
};



// ==============================================VIEW STORY=============================================
exports.viewStory = async (req, res) => {
  try {
    const { story_id } = req.params;

    // Retrieve the story details from the database
    const storySql = 'SELECT * FROM submissions WHERE story_id = ?';
    const storyResult = await new Promise((resolve, reject) => {
      db.query(storySql, [story_id], (err, storyResult) => {
        if (err) {
          reject(err);
        } else {
          resolve(storyResult);
        }
      });
    });

    const story = storyResult[0];

    // Retrieve the chapters for the specific story
    const chapterSql = 'SELECT * FROM chapters WHERE story_id = ?';
    const chapterResult = await new Promise((resolve, reject) => {
      db.query(chapterSql, [story_id], (err, chapterResult) => {
        if (err) {
          reject(err);
        } else {
          resolve(chapterResult);
        }
      });
    });

    const chapters = chapterResult;

    // Render the view_story template with story details and chapters
    res.render('view_story', { story, chapters });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error fetching story: ' + error.message);
  }
};

// ==========================================ADD CHAPTER==================================================
exports.addChapter = async (req, res) => {
  try {
    const { story_id } = req.params;
    const { chapter_no } = req.body;
    const chapterFile = req.file;

    // Check if the required fields are present
    if (!chapter_no || !chapterFile) {
      return res.status(400).send('Missing required fields');
    }

    // Get the filename from the uploaded file
    const chapterFilename = chapterFile.originalname;

    // Insert the new chapter data into the database for the specific story_id
    const chapterData = {
      chapter_no: chapter_no,
      chapter_file: chapterFilename, // Store only the filename, not the entire path
      story_id: story_id,
      // Add any other relevant chapter data here
    };

    // Replace "chapters" with your actual table name for chapters in the database
    const sql = 'INSERT INTO chapters SET ?';
    db.query(sql, chapterData, async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error adding chapter: ' + err.message);
      } else {
        // Move the uploaded file to the appropriate directory
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', chapterFilename);
        fs.renameSync(chapterFile.path, uploadPath);

        // Redirect to the view_story page
        res.redirect(`/submissions/view/${story_id}`);
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error adding chapter');
  }
};



// ============================================DELETE CHAPTER============================================
exports.deleteChapter = async (req, res) => {
  try {
    const { story_id } = req.params;
    const { chapter_number } = req.body;
    if (!chapter_number) {
      return res.status(400).send('Missing required fields');
    }
    const deleteSql = 'DELETE FROM chapters WHERE story_id = ? AND chapter_no = ?';
    db.query(deleteSql, [story_id, chapter_number], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting chapter: ' + err.message);
      } else {
        res.redirect(`/submissions/view/${story_id}`);
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error deleting chapter');
  }
};


//==================================================DELETE STORY==========================================

exports.deleteStory = async (req, res) => {
  try {
    const storyId = req.params.story_id;
    const deleteSql = 'DELETE FROM submissions WHERE story_id = ?';
    db.query(deleteSql, [storyId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting the story: ' + err.message);
      } else {
        req.session.submittedStory = null;
        res.redirect('/dashboard');
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error deleting the story');
  }
};

exports.search = async (req, res) => {
  try {
    // ... Rest of your code ...

    res.render('search_results', {
      submittedStories: results,
      searchTerm: searchTerm,
    });
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).send('Error executing search query: ' + error.message);
  }
};



//==========================================DELETE CHAPTERS===============================================
exports.deleteChapter = async (req, res) => {
  try {
    const { story_id } = req.params;
    const { chapter_number } = req.body;
    // Check if the required fields are present
    if (!chapter_number) {
      return res.status(400).send('Missing required fields');
    }
    // Delete the chapter from the chapters table in the database
    const deleteSql = 'DELETE FROM chapters WHERE story_id = ? AND chapter_no = ?';
    db.query(deleteSql, [story_id, chapter_number], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting chapter: ' + err.message);
      } else {
        res.redirect(`/submissions/view/${story_id}`);
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error deleting chapter');
  }
};


//==============================================DELETE STORIES============================================
exports.deleteStory = async (req, res) => {
  try {
    const storyId = req.params.story_id;

    // Delete the entire story from the database
    const deleteSql = 'DELETE FROM submissions WHERE story_id = ?';
    db.query(deleteSql, [storyId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting the story: ' + err.message);
      } else {
        // Remove the submitted story data from the session
        req.session.submittedStory = null;
        res.redirect('/dashboard'); // Redirect to dashboard or any other page after deletion
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error deleting the story');
  }
};

// ================================================SEARCH FUNCTION==========================================

exports.search = async (req, res) => {
  try {
    const searchTerm = req.query.q.trim();

    const connection = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
    });

    connection.connect();

    const sql = `
      SELECT * FROM submissions
      WHERE title LIKE ?
    `;
    const params = [`%${searchTerm}%`];

    const results = await new Promise((resolve, reject) => {
      connection.query(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    connection.end();

    res.render('search_results', {
      submittedStories: results,
      searchTerm: searchTerm,
    });
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).send('Error executing search query: ' + error.message);
  }
};

//================================================USER VIEW===================================== 
exports.viewUserStory = async (req, res) => {
  try {
    const { story_id } = req.params;

    // Retrieve the story details from the database
    const storySql = 'SELECT * FROM submissions WHERE story_id = ?';
    const storyResult = await new Promise((resolve, reject) => {
      db.query(storySql, [story_id], (err, storyResult) => {
        if (err) {
          reject(err);
        } else {
          resolve(storyResult);
        }
      });
    });

    const story = storyResult[0];

    // Retrieve the chapters for the specific story
    const chapterSql = 'SELECT * FROM chapters WHERE story_id = ?';
    const chapterResult = await new Promise((resolve, reject) => {
      db.query(chapterSql, [story_id], (err, chapterResult) => {
        if (err) {
          reject(err);
        } else {
          resolve(chapterResult);
        }
      });
    });

    const chapters = chapterResult;

    // Render the user_view template with story details and chapters
    res.render('user_view', { story, chapters });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error fetching story: ' + error.message);
  }
};


