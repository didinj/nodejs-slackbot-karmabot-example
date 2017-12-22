'use strict';

var SlackBot = require('slackbots'); // import slackbot library
var mongoose = require('mongoose');  // import mongoose library for accessing MongoDB
var Karma = require('../models/Karma.js'); // import karma data model
var Redeem = require('../models/Redeem.js'); // import redeem data model
var users = []; // user list
var channels = []; // channel list
var redeemamt = 20;
var redeemitem = ':ice_cream:';

/* Create MongoDB Connection */
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://didinj:fadhilah_07@ds163656.mlab.com:63656/karmabot', { useMongoClient: true, promiseLibrary: require('bluebird') })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

// mongoose.connect('mongodb://localhost/karmabot', { useMongoClient: true, promiseLibrary: require('bluebird') })
//   .then(() =>  console.log('connection succesful'))
//   .catch((err) => console.error(err));

/* Create Bot using My Slack Team API KEY */
var bot = new SlackBot({
    token: process.env.BOT_API_KEY, // BOT_API_KEY taken from Slack Team Bot
    name: 'KarmaBot'
});

/* Starting bot connection */
bot.on('start', function() {
  users = [];
  channels = [];
  var botUsers = bot.getUsers();
  users = botUsers._value.members;
  var botChannels = bot.getChannels();
  channels = botChannels._value.channels;
  // console.log(users);
});

/* Open bot connection */
bot.on('open', function() {
  users = [];
  channels = [];
  var botUsers = bot.getUsers();
  users = botUsers._value.members;
  var botChannels = bot.getChannels();
  channels = botChannels._value.channels;
});

/* Listen bot message */
bot.on('message', function(data) {
    users = [];
    channels = [];
    var botUsers = bot.getUsers();
    users = botUsers._value.members;
    var botChannels = bot.getChannels();
    channels = botChannels._value.channels;
    // check if message type is message and text not null
    if(data.type === 'message' && Boolean(data.text)) {
      var channel = channels.find(channel => channel.id === data.channel);
      var usr = users.find(user => user.id === data.user);

      // check if channel not exist treat as Direct Message to Karmabot
      if(channel === undefined) {
        // check if message text contains karma keyword
        if(data.text.substring(data.text.toLowerCase().indexOf('karma'),data.text.toLowerCase().indexOf('karma')+6) === 'karma') {
          var receiveKarmas = 0;
          var todayKarmaLeft = 0;
          var d = new Date();
          d.setHours(0,0,0,0);
          var d2 = new Date();
          d2.setHours(23,59,59,59);
          // find today karma sent
          Karma.find({receive_from:userid, receive_date:{"$gte": d, "$lt": d2}}).exec(function(err, senderkarmas) {
            if (err) {
              console.log(err);
            } else {
              if(senderkarmas.length <= 5) {
                todayKarmaLeft = 5 - senderkarmas.length;
                // find current user total karma
                Karma.find({user_id:data.user}).exec(function(err, curkarmas) {
                  if (err) {
                    console.log(err);
                  } else {
                    if(curkarmas.length > 0) {
                      receiveKarmas = curkarmas.length;
                      // send back total karma receive to user
                      bot.postMessageToUser(usr.name, 'You have receive '+receiveKarmas+' karma and '+todayKarmaLeft+' karma left for send today', {as_user: true});
                    }
                  }
                });
              }
            }
          });
        }
      } else {
        // check if message text contains metioned user id
        var keywords = data.text.substring(data.text.indexOf('<@'),data.text.indexOf('<@')+24);
        if(Boolean(keywords) && data.text.substring(data.text.indexOf('<@')+13,data.text.indexOf('<@')+24) === 'leaderboard') {
          var karmabotid = keywords.substring(2,11);
          var leaderboard = keywords.substring(13,24);
          var karmabotuser = users.find(user => user.id === karmabotid);
          // check if user karma found and other keywords contains 'leaderboard' keyword
          if(karmabotuser.name === 'karmabot') {
            // find karma group by user_id and sort by karma count
            Karma.aggregate([
              {
                $group: {
                  _id: '$user_id',
                  count: {$sum: 1}
                }
              },
              {
                $sort: {
                  'count':-1
                }
              }
            ], function (err, result) {
              if (err) {
                console.log(err);
              } else {
                // create message text header
                var msgtext = '*Karma Top 10 Leaderboard:*\n';
                if(result.length <= 10) {
                  for(var j=0;j<result.length;j++) {
                    var lduser = users.find(user => user.id === result[j]._id);
                    if(lduser !== undefined) {
                      // add top karma list to message text
                      msgtext += ':white_check_mark: '+lduser.name+' with '+result[j].count+' karma\n';
                    }
                  }
                  // send back leaderboard to channel
                  bot.postMessageToChannel(channel.name, msgtext, {as_user: true});
                } else {
                  for(var j=0;j<10;j++) {
                    var lduser = users.find(user => user.id === result[j]._id);
                    if(lduser !== undefined) {
                      // add top karma list to message text
                      msgtext += ':white_check_mark: '+lduser.name+' with '+result[j].count+' karma\n';
                    }
                  }
                  // send back leaderboard to channel
                  bot.postMessageToChannel(channel.name, msgtext, {as_user: true});
                }
              }
            });
          }
        }
        // check if message text contains mentioned user id and keyword 'thanks'
        if(data.text.substring(data.text.indexOf('thanks <@'),data.text.indexOf('thanks')+9) === 'thanks <@') {
          var thanks_msg = data.text.substring(data.text.indexOf('thanks <@'),data.text.indexOf('thanks')+19);
          var userid = thanks_msg.substring(thanks_msg.indexOf('<@')+2,thanks_msg.indexOf('<@')+11);
          var rcvUser = users.find(user => user.id === data.user);
          var sendUser = users.find(user => user.id === userid);
          var karmaReceiver = sendUser.profile.real_name;
          var karmaSender = rcvUser.profile.real_name;
          if(userid.length > 0) {
            // find existing karma by user id and receive from id
            Karma.find({user_id:data.user,receive_from:userid}).exec(function(err, curkarmas) {
              if (err) {
                console.log(err);
              } else {
                // if existing karma found
                if(curkarmas.length > 0) {
                  var d = new Date();
                  d.setHours(0,0,0,0);
                  var d2 = new Date();
                  d2.setHours(23,59,59,59);
                  // find karma sender limit by 5 karma a day
                  Karma.find({user_id:userid, receive_date:{"$gte": d, "$lt": d2}}).exec(function(err, senderkarmas) {
                    if (err) {
                      console.log(err);
                    } else {
                      if(senderkarmas.length >= 5) {
                        // send back message of reach limit
                        bot.postMessageToChannel(channel.name, 'Sorry, '+karmaSender+' already send 5 karmas today', {as_user: true});
                      } else {
                        // save karma to database
                        Karma.create({user_id:userid,receive_from:data.user}, function (err, post) {
                          if (err) {
                            console.log(err);
                          } else {
                            // find karma by current user then send back message to channel
                            Karma.find({user_id:userid}).exec(function(err, karmas) {
                              if (err) {
                                console.log(err);
                              } else {
                                bot.postMessageToChannel(channel.name, karmaReceiver+' receives 1 point from '+karmaSender+'. He now has '+karmas.length+' points.', {as_user: true});
                              }
                            });
                          }
                        });
                      }
                    }
                  });
                } else {
                  // if exisiting karma not found then create one
                  Karma.create({user_id:data.user,receive_from:userid}, function (err, post) {
                    if (err) {
                      console.log(err);
                    } else {
                      // find karma by current user then send back message to channel
                      Karma.find({user_id:data.user}).exec(function(err, karmas) {
                        if (err) {
                          console.log(err);
                        } else {
                          bot.postMessageToChannel(channel.name, karmaReceiver+' receives 1 point from '+karmaSender+'. He now has '+karmas.length+' points.', {as_user: true});
                        }
                      });
                    }
                  });
                }
              }
            });
          }
        }
        // Additional function for redeem karma points (1 item for 20 karma points)
        if(data.text.substring(0,6) === 'redeem') {
          var redeemkw = data.text.substring(data.text.indexOf('<@'),data.text.indexOf('<@')+19);
          var karmabotid = redeemkw.substring(2,11);
          var redeemtext = data.text.substring(0,6);
          var karmabotuser = users.find(user => user.id === karmabotid);
          // check if user karma found and other keywords contains 'redeem' keyword
          if(karmabotuser.name === 'karmabot' && redeemtext === 'redeem') {
            Karma.find({user_id:data.user}).exec(function(err, karmas) {
              if (err) {
                console.log(err);
              } else {
                var totalkarma = karmas.length;
                if(totalkarma >= redeemamt) {
                  Redeem.find({user_id:data.user}).exec(function(err, redeems) {
                    if (err) {
                      console.log(err);
                    } else {
                      var totalredeem = redeems.length;
                      if(totalredeem > 0) {
                        var karmaleft = totalkarma - (totalredeem*redeemamt);
                        if(karmaleft >= redeemamt) {
                          Redeem.create({user_id:data.user,redeem_item:redeemitem}, function (err, post) {
                            if (err) {
                              console.log(err);
                            } else {
                              karmaleft = totalkarma - ((totalredeem+1)*redeemamt);
                              bot.postMessageToChannel(channel.name, 'You have redeem your Karma points successfully. \n Now you have '+karmaleft+' karma points left.', {as_user: true, icon_emoji: redeemitem});
                            }
                          });
                        } else {
                          bot.postMessageToChannel(channel.name, 'You don\'t have enough Karma points to redeem', {as_user: true});
                        }
                      } else {
                        Redeem.create({user_id:data.user,redeem_item:redeemitem}, function (err, post) {
                          if (err) {
                            console.log(err);
                          } else {
                            karmaleft = totalkarma - redeemamt;
                            bot.postMessageToChannel(channel.name, 'You have redeem your Karma points successfully. \n Now you have '+karmaleft+' karma points left.', {as_user: true, icon_emoji: redeemitem});
                          }
                        });
                      }
                    }
                  });
                } else {
                  bot.postMessageToChannel(channel.name, 'You don\'t have enough Karma points to redeem', {as_user: true});
                }
              }
            });
          }
        }
      }
    }
});

module.exports = bot;
