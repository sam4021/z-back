const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const timestamps = require('mongoose-timestamp');

//Products Schema
const ProductsSchema = mongoose.Schema({
  category: {
    type: ObjectId,
    ref: 'Category'
  },
  brand: {
    type: ObjectId,
    ref: 'Brand'
  },
  attribute:{
    type: ObjectId,
    ref: 'Attributes'
  },
  title: {
      type: String,
      default:''
  },
  url:{
    type:String,
    unique: true,
    default: ''
  },
  price:{
      type:Number,
      required: true
  },
  cost: {
    type: Number,
    required: true
  },
  is_active:{
    type: Number,
    default: 0
  },
  special_price: {
    type: Number,
    default:0
  },
  descriptions:{
    box_content:{type:String, default:''},
    short:{type:String, default:''},
    full:{type:String, default:''}
  },
  images:{
    type:Array,
    default:[]
  },
  seo:{
    keywords:{type:String, default:''},
    description:{type:String, default:''}
  },
  deleted: {
    type: Number,
    default: 0
  },
  stock:{
    type: Number,
    default: 1
  },
  desc_entity: [{
    entity:{type:ObjectId, ref: 'Entities'},
    value:{type:String, required: true}     
}]
});

ProductsSchema.plugin(timestamps,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Products = module.exports = mongoose.model('products', ProductsSchema);
