const { Userr , userSchema} = require("../models/userModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const {getEmailContent} = require("../utils/emailContent")
require("dotenv").config()

// Login route
module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const connection = req.databaseConnection;
    const User = connection.model('User', userSchema)
    

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: "User not found", status: false });
    }
    try {
      // Continue with user authentication and other logic...
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({ msg: "Incorrect Username or Password", status: false });
      }
      delete user.password;
      return res.json({ status: true, user });
    } catch (error) {
      console.error(`Error connecting to database for company ${companyPrefix}:`, error);
      return res.status(500).json({ msg: "Internal Server Error", status: false });
    }
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ msg: "Internal Server Error", status: false });
  }
};

// Register endpoint
module.exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, companyPrefix, companyName } = req.body;

    const connection = req.databaseConnection;
    const User = connection.model('User', userSchema);

    // Generate a random password
    const generatedPassword = generatePassword()

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      return res.json({ msg: 'Username already used', status: false });
    }
    const emailCheck = await User.findOne({ email });
    if (emailCheck) {
      return res.json({ msg: 'Email already used', status: false });
    }
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      companyPrefix,
      companyName,
    });

    // Send the generated password to the user's email
    await sendPasswordEmail(firstName , lastName ,email, generatedPassword);

    // Omit the password field from the response
    delete user.password;

    return res.json({ status: true, user });
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ msg: 'Internal Server Error', status: false });
  }
};

const generatePassword = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};

// Function to send email with generated password
const sendPasswordEmail = async (firstName , lastName , email, password) => {
  try {

    const emailContent = getEmailContent(firstName, lastName, email, password);

    // Configure nodemailer transporter (use your own email provider settings)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Email content
    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your New Password',
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // You might want to handle this error differently based on your application's requirements
  }
};


module.exports.logOut = async (req, res, next) => {
  try {

    if (!req.params.id) return res.json({ msg: "User id is required " });
    console.log("User logged out", req.params.id);
    await mongoose.connection.close();
    //onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex); 
  }
};



// Endpoint to check unique fields
module.exports.checkUniqueFields = async (req, res, next) => {
  const { username, email, companyPrefix } = req.body;

  const connection = req.databaseConnection;
  const User = connection.model('User', userSchema)

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { companyPrefix }] });
    if (existingUser) {
      let field;
      if (existingUser.username === username) {
        field = 'username';
      } else if (existingUser.email === email) {
        field = 'email';
      } else if (existingUser.companyPrefix === companyPrefix) {
        field = 'companyPrefix';
      }
      return res.json({ status: false, field });
    }
    return res.json({ status: true });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.json({ status: false, field });
    } else {
      console.error('Error checking unique fields:', error);
      return res.status(500).json({ msg: 'Internal Server Error' });
    }
  }
};


