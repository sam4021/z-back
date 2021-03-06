const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const bcrypt = require('bcryptjs');
const config = require ('../config/database');
const timestamps = require('mongoose-timestamp');

//Phone Main Offers Schema
const PhoneMainOfferSchema = mongoose.Schema({
  image: {
      type: String,
      required: true
  },
  products: [{
      type: ObjectId,
       ref: 'Products'
  }],
  seo:{
    title:{type:String, default:''},
    keywords:{type:String, default:''},
    description:{type:String, default:''}
  }
});

PhoneMainOfferSchema.plugin(timestamps,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const PhoneMainOffer = module.exports = mongoose.model('phone_main_offers', PhoneMainOfferSchema);
