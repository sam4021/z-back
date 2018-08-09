const mongoose = require('mongoose');
const config = require ('../config/database');

//Products Brands Schema
const BrandSchema = mongoose.Schema({
  title: {
    type: String,
    unique:true,
    required: true
  },
  url:{
    type:String,
    unique: true,
    default: ''
  },
  logo:{
    type: String,
    default:''
  },
  description:{
    type: String,
    default:''
  }
});


const Brand = module.exports = mongoose.model('product_brands', BrandSchema);