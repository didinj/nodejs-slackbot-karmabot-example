var mongoose = require('mongoose');

var KarmaSchema = new mongoose.Schema({
  user_id: String,
  receive_from: String,
  receive_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Karma', KarmaSchema);
