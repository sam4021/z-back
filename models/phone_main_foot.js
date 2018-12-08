const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const bcrypt = require('bcryptjs');
const config = require ('../config/database');
const timestamps = require('mongoose-timestamp');

//Phone Main Foot Schema
const PhoneMainFootSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  details: {
      type: String,
      default: ''
  },
  sort: {
    type: Number,
    default: 0
  },
});

PhoneMainFootSchema.plugin(timestamps,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const PhoneMainFoot = module.exports = mongoose.model('phone_main_foot', PhoneMainFootSchema);
