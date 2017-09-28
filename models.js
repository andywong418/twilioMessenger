var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema = new Schema ({
  from: String,
  content: String
})

var userSchema = new Schema ({
  number: String,
  name: String
})

var Message = mongoose.model('Message', messageSchema);
var User = mongoose.model('User', userSchema);


module.exports = {
  Message,
  User
}
