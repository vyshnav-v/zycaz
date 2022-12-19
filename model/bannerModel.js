const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  btitle1: {
    type: String,
    required: true,
  },
  bimage1: {
    type: String,
    required: true,
  },
  btitle2: {
    type: String,
    required: true,
  },
  bimage2: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Banner', bannerSchema);
