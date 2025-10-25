const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  birthDate: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  alertSettings: {
    humidity: {
      min: {
        type: Number,
        default: 20
      },
      max: {
        type: Number,
        default: 80
      },
      enabled: {
        type: Boolean,
        default: false
      }
    },
    temperature: {
      min: {
        type: Number,
        default: 15
      },
      max: {
        type: Number,
        default: 35
      },
      enabled: {
        type: Boolean,
        default: false
      }
    },
    ph: {
      min: {
        type: Number,
        default: 5.5
      },
      max: {
        type: Number,
        default: 7.5
      },
      enabled: {
        type: Boolean,
        default: false
      }
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    systemNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
