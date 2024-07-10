const { db, getUserByEmail, getUserByID, updateUser } = require('../db');
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ms = require('ms');

// =====================================================REGISTER=================================================

exports.register = (req, res) => {
  console.log(req.body);

const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const passwordConfirm = req.body.repeat_password;

  // Form validation
  const errors = [];

  if (errors.length > 0) {
      return res.render('register', {
          message: "Form validation error",
          errors: errors
      });
  }
  
  if (!name || !email || !phone || !password || !passwordConfirm) {
      errors.push({ 
          message: "All fields are required" 
      });
  }

    if (password !== passwordConfirm) {
      errors.push({ message: "Passwords do not match" });
  }

  if (password.length < 8) {
      errors.push({ message: "Password must be at least 8 characters long" });
  }

    // Custom validation for phone and name fields
  const phoneRegex = /^\d{1,12}$/; // Change here
  if (!phone.match(phoneRegex)) {
      errors.push({ message: "Phone number must be less than or equal to 12 digits" });
  }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name.match(nameRegex)) {
        errors.push({ message: "Name should only contain alphabets" });
    }

  if (errors.length > 0) {
      return res.render('register', {
          errors,
          name,
          email,
          phone
      });
  }

  // Check if the email already exists in the database
  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
      if (error) {
          console.log(error);
          return res.render('register', {
              message: "Something went wrong"
          });
      }

      if (results.length > 0) {
          return res.render('register', {
              message: "That email is already in use"
          });
      }

      try {
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log(hashedPassword);

          // Insert the user data into the database
          db.query('INSERT INTO users SET ?', {
              username: name,
              email: email,
              phone: phone,
              password: password,
              password_hash: hashedPassword
          }, (error, results) => {
              if (error) {
                  console.log(error);
                  return res.render('register', {
                      message: "Something went wrong"
                  });
              }

              console.log(results);
              return res.render('register', {
                  message: "User registered successfully"
              });
          });
      } catch (error) {
          console.log(error);
          return res.render('register', {
              message: "Something went wrong"
          });
      }
  });
};
// ===================================================LOGIN======================================
exports.login = async (req, res) => {
  console.log(req.body);

  const email = req.body.email;
  const password = req.body.password;

// Check if email and password are provided
if (!email || !password) {
  return res.render('login', {
    message: 'Email and password are required'
  });
}


  db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
      if (error) {
          console.log(error);
          return res.render('login', {
              message: "Something went wrong"
          });
      }

      if (results.length === 0) {
          return res.render('login', {
              message: "Email is incorrect"
          });
      }

      const user = results[0];

      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
          return res.render('login', {
              message: "Password is incorrect"
          });
      }

      // Set the authenticated user data in the session
      req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
      };
      console.log('Session data:', req.session.user);

      // Redirect to the dashboard or perform other actions
      res.redirect('/dashboard');
  });
};



// ================================================LOGOUT============================================

exports.logout = async (req, res) => {
  // Clear the user session
  req.session.destroy();
// Redirect to the index page
res.redirect('/'); 
};


// =======================================PERSONAL INFORMATION==============================================

exports.personal_info = async (req, res) => {
  
    try {
        if (!req.session.user) {
          return res.redirect('/login');
        }

    const id = req.session.user.id;
  
    const sql = 'SELECT username, email, phone, password FROM users WHERE id = ?';
    db.query(sql, [id], (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Something went wrong');
      }
  
      console.log('Query result:', result);
  
      if (result.length > 0) {
        const userData = result[0];
        return res.render('personal_info', { userData });
      } else {
        return res.status(404).send('User data not found');
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send('Something went wrong');
  }
};

// ======================================================USER INFORMATION UPDATE==============================================
// exports.update = async (req, res) => {
//     try {
//       const id = req.session.user.id;
  
//       const {
//         new_name,
//         new_phone,
//         current_password,
//         new_password,
//         repeat_password
//       } = req.body;
  
//       // Validation
//       const errors = [];
  
//       // Check if the current password matches the stored password
//       const user = await getUserByID(id);
//       if (!user) {
//         return res.status(404).render('update', {
//           message: 'User not found'
//         });
//       }
  
//       const passwordMatch = await bcrypt.compare(current_password, user.password_hash);
//       if (!passwordMatch) {
//         errors.push({ message: 'Current password is incorrect' });
//       }
  
//       // Check if the new password and confirm password match
//       if (new_password !== repeat_password) {
//         errors.push({ message: 'New password and confirm password do not match' });
//       }
  
//       if (errors.length > 0) {
//         return res.render('update', {
//           errors,
//           user
//         });
//       }
  
//       // Update user information in the database
//       const updates = {
//         username: new_name,
//         phone: new_phone,
//         password: new_password
//       };
  
//       if (new_password) {
//         const passwordHash = await bcrypt.hash(new_password, 10);
//         updates.password_hash = passwordHash;
//       }
  
//       await updateUser(id, updates);
  
//       // Update session data
//       req.session.user.username = new_name;
//       req.session.user.phone = new_phone;
//       req.session.user.password = new_password;
//       req.session.user.password_hash = updates.password_hash || user.password_hash;
  
//       return res.render('update', {
//         message: 'Personal information updated successfully',
//         user: req.session.user
//       });
//     } catch (error) {
//       console.log(error);
//       return res.status(500).render('update', {
//         message: 'Something went wrong',
//         user: req.session.user
//       });
//     }
//   };

exports.update = async (req, res) => {
  try {
      const id = req.session.user.id;

      const {
          new_name,
          new_phone,
          current_password,
          new_password,
          repeat_password
      } = req.body;

      // Validation
      const errors = [];

      // Check if the current password matches the stored password
      const user = await getUserByID(id);
      if (!user) {
          return res.status(404).render('update', {
              message: 'User not found'
          });
      }

      const passwordMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!passwordMatch) {
          errors.push({ message: 'Current password is incorrect' });
      }

      // Check if the new password and confirm password match
      if (new_password !== repeat_password) {
          errors.push({ message: 'New password and confirm password do not match' });
      }

      // Additional validation for username and password
      const usernameRegex = /^[A-Za-z\s]+$/;
      if (!new_name.match(usernameRegex)) {
          errors.push({ message: 'Name must contain alphabets only' });
      }

      const new_phoneRegex = /^\d{1,12}$/;
      if (!new_phone.match(new_phoneRegex)) {
          errors.push({ message: 'Phone number must be less than or equal to 12 characters' });
      }

      if (new_password && new_password.length < 8) {
          errors.push({ message: 'Password must be at least 8 characters long' });
      }

      if (errors.length > 0) {
          return res.render('update', {
              errors,
              user
          });
      }

      // Update user information in the database
      const updates = {
          username: new_name,
          phone: new_phone,
          password: new_password
      };

      if (new_password) {
          const passwordHash = await bcrypt.hash(new_password, 10);
          updates.password_hash = passwordHash;
      }

      await updateUser(id, updates);

      // Update session data
      req.session.user.username = new_name;
      req.session.user.phone = new_phone;
      req.session.user.password = new_password;
      req.session.user.password_hash = updates.password_hash || user.password_hash;

      return res.render('update', {
          message: 'Personal information updated successfully',
          user: req.session.user
      });
  } catch (error) {
      console.log(error);
      return res.status(500).render('update', {
          message: 'Something went wrong',
          user: req.session.user
      });
  }
};