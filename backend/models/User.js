const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if no Google OAuth
    }
  },
  name: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: String,
  watchlist: [{
    type: String, // Node IDs
    ref: 'PNode',
    default: []
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving 
userSchema.pre('save', async function () {
  if (!this.isModified('password'))
    return;
  
  // Hash the password if it exists
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // Google users don't have passwords
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
