var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema = new Schema ({
  content: String,
  receivedAt: String,
  sender: {
    type: Schema.ObjectId,
    ref: "User"
  }
})

var userSchema = new Schema ({
  number: String,
  imgURL: String,
  name: String
})

var Message = mongoose.model('Message', messageSchema);
var User = mongoose.model('User', userSchema);


module.exports = {
  Message,
  User
}
