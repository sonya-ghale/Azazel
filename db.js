const mysql = require("mysql");
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MYSQL CONNECTED");
  }
});

const getUserByID = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      db.query(sql, [id], (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length > 0) {
            resolve(result[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  };

const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.query(sql, [email], (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length > 0) {
            resolve(result[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  };

  const updateUser = (id, updates) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET ? WHERE id = ?';
      db.query(sql, [updates, id], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  const fetchStoryDataFromDatabase = (storyId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM submissions WHERE story_id = ?';
      db.query(sql, [storyId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length > 0) {
            resolve(result[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  };

const fetchChaptersFromDatabase = (storyId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM chapters WHERE story_id = ?';
    db.query(sql, [storyId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};


module.exports = {
    db,
    getUserByID,
    getUserByEmail,
updateUser,
fetchStoryDataFromDatabase,
fetchChaptersFromDatabase,
}
