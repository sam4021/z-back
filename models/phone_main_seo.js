const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const bcrypt = require('bcryptjs');
const config = require ('../config/database');
const timestamps = require('mongoose-timestamp');

//Phone Main Seo Schema
const PhoneMainSeoSchema = mongoose.Schema({
    title:{
        type:String, 
        default:''
    },
    keywords:{
        type:String, 
        default:''
    }, 
    description:{
        type:String, 
        default:''
    },
    seo_prefix:{
        type:String, 
        default:''
    },
    seo_suffix:{
        type:String, 
        default:''
    }
});

PhoneMainSeoSchema.plugin(timestamps,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const PhoneMainSeo = module.exports = mongoose.model('phone_main_seo', PhoneMainSeoSchema);
