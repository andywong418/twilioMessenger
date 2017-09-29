$(document).ready(function(){

  setInterval(update, 3000);

  $("#group-message-button").on("click", function(event){
    event.preventDefault();
    $.ajax({
      url: "https://stormy-basin-23393.herokuapp.com/grouptext",
      method: "post",
      data: {
        Body: $("#group-message-input").val()
      },
      success: function(response){
        var content = $("#group-message-input").val();
        var time = (new Date()).toLocaleTimeString();
        var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="https://media1.giphy.com/media/UqxVRm1IaaIGk/giphy.gif"> [Admin]: ${content}</li>`);
        $('#messages_ul_container').append(messageLi);
        $("#group-message-input").val("");
        $("#messages_ul_container").scrollBottom($("#messages_ul_container")[$("#messages_ul_container").children.length()].scrollHeight);
      }
    });
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
          var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="${curMessage.sender.imgURL}"> [${curMessage.sender.name}]: ${curMessage.content}</li>`);
          $('#messages_ul_container').append(messageLi);
          $("#messages_ul_container").scrollBottom($("#messages_ul_container")[$("#messages_ul_container").children.length()].scrollHeight);
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });
}
