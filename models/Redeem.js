var mongoose = require('mongoose');

var RedeemSchema = new mongoose.Schema({
  user_id: String,
  redeem_item: String,
  redeem_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Redeem', RedeemSchema);
