const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'You must provide your name to register an account.']
  },
  email: {
    type: String,
    trim: true,
    unique: [true, 'You cannot use this email address. It may already exist.'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    validate: {
      // This only works on CREATE and SAVE! Updating users should also use SAVE; NOT findOneAndUpdate().
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords must match.'
    }
  }
});

userSchema.pre('save', async function(next) {
  // only run this hook if password was modified.
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = null; // for security
  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
