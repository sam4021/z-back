const mongoose = require('mongoose');
const config = require ('../config/database');

//Category Schema
const CategorySchema = mongoose.Schema({
  title: {
      type: String,
      unique: true,
      required: true
  },
  url:{
      type:String,
      unique: true,
      lowercase: true,
      default: ''
  },
  parent: {
    type: String,
    default: 0
  },
  sort: {
    type: Number,
    default: ''
  },
  icon: {
    type: String,
    default: 0
  },
  seo:{
    title:{type:String, default:''},
    keywords:{type:String, default:''},
    description:{type:String, default:''}
  },
  visible:{
    type: Number,
    default: 1
  },
  footer_seo: {
    type: String,
    default: ''
  }
});

const Category = module.exports = mongoose.model('product_category', CategorySchema);
