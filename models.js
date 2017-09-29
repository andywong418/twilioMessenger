var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema = new Schema ({
  content: String,
  receivedAt: String,
  sender: {
    type: Schema.ObjectId,
    ref: "User"
  },
  group:{
    type: Schema.ObjectId,
    ref: "Group"
  }
});

var userSchema = new Schema ({
  number: String,
  imgURL: String,
  name: String
});

var adminSchema = new Schema ({
  username: String,
  password: String,
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

var groupSchema = new Schema({
  admin: {
    type: Schema.ObjectId,
    ref: 'Admin'
  },
  regulars: [{type: Schema.ObjectId, ref: 'User'}],
  name: {
    type: String
  },
  groupImgURL: String

});



var Message = mongoose.model('Message', messageSchema);
var User = mongoose.model('User', userSchema);
var Admin = mongoose.model('Admin', adminSchema);
var Group = mongoose.model('Group', groupSchema);
module.exports = {
  Message,
  User,
  Admin,
  Group
}
