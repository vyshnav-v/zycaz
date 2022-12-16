const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  brand:
    {
      type: String,
    },
  
  stock: {
    type: Number,
    // required:true
  },
  gender: 
    {
      type: String,
    },
  
  category: 
    {
      type: String,
      required: true,
    },
  
  description: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isProduct: {
    type: Number,
    default: 1,
    required: true,
  },
  isDelete:{
    type: Number,
    default: 1,
    required: true,
  },
  isAvailable:{
    type:Number,
    default:1
}
});

module.exports = mongoose.model('Product', productSchema);
