$(document).ready(function(){

  setInterval(update, 3000);

  $("#group-message-button").on("click", function(err){
    alert();
  });

});

function update(){
  $.ajax({
    url: "https://stormy-basin-23393.herokuapp.com/messages",
    method: "get",
    success: function(response){
      if(response.messages.length > $("#messages_ul_container").children().length){
        for (var i = $("#messages_ul_container").children().length; i < response.messages.length; i ++){
          var curMessage = response.messages[i];
          var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="${this.sender.imgURL}"> [${this.sender.name}]: ${this.content}</li>`);
          $('#messages_ul_container').append(messageLi);
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
      if(response.messages.length > $("#messages_ul_container").children().length){
        for (var i = $("#messages_ul_container").children().length; i < response.messages.length; i ++){
          var curMessage = response.messages[i];
          var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="${curMessage.sender.imgURL}"> [${curMessage.sender.name}]: ${curMessage.content}</li>`);
          $('#messages_ul_container').append(messageLi);
          updateScroll();
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });
}
function updateScroll(){
    var element = document.getElementById("messages_ul_container");
    element.scrollTop = element.scrollHeight;
}
