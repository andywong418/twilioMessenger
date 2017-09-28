$(document).ready(function(){

  setInterval(update, 3000);

});

function update(){
  $.ajax({
    url: "https://stormy-basin-23393.herokuapp.com/messages",
    method: "get",
    success: function(response){
      if(response.messages.length > $("#messages_container").children().length){
        for (var i = $("#messages_container").children().length; i < response.messages.length; i ++){
          var curMessage = response.messages[i];
          var messageLi = $(`<li>[${curMessage.sender.name} sent at ${curMessage.receivedAt}]: ${curMessage.content}</li>`);
          $('#messages_container').append(messageLi);
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });
}

function update(){
  $.ajax({
    url: "https://stormy-basin-23393.herokuapp.com/messages",
    method: "get",
    success: function(response){
      if(response.messages.length > $("#messages_container").children().length){
        for (var i = $("#messages_container").children().length; i < response.messages.length; i ++){
          var curMessage = response.messages[i];
          var messageLi = $(`<li>[${curMessage.sender.name} sent at ${curMessage.receivedAt}]: ${curMessage.content}</li>`);
          $('#messages_container').append(messageLi);
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });
}
