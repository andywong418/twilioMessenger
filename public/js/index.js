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

  $("body").on('click', '.delete-user', function(event){
    var username = $(this).parent().text().trim();
    $(this).parent().remove();
    $.ajax({
      url: "https://stormy-basin-23393.herokuapp.com/connection/" + username,
      method: "delete",
      success: function(response){
        console.log("Removed")
      }
    });
  })
});

function update(){
  $.ajax({
    url: "https://stormy-basin-23393.herokuapp.com/messages",
    method: "get",
    success: function(response){
      if(response.messages !== undefined){
        if(response.messages.length > $("#messages_ul_container").children().length){
          for (var i = $("#messages_ul_container").children().length; i < response.messages.length; i ++){
            var curMessage = response.messages[i];
            var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="${curMessage.sender.imgURL}"> [${curMessage.sender.name}]: ${curMessage.content}</li>`);
            $('#messages_ul_container').append(messageLi);
            $("#messages_ul_container").scrollBottom($("#messages_ul_container")[$("#messages_ul_container").children.length()].scrollHeight);
          }
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });

  $.ajax({
    url: "https://stormy-basin-23393.herokuapp.com/users",
    method: "get",
    success: function(response){
      console.log(response);
      if(response.users !== undefined){

        if(response.users.length > $("#users_ul_container").children().length){
          for (var i = $("#users_ul_container").children().length; i < response.messages.length; i ++){
            var curUser = response.users[i];
            var messageLi = $(`<li class="user_to_display"><img class="profile_img" src="${curUser.imgURL}"> ${curUser.name}<span class="delete-user glyphicon glyphicon-remove"></span></li>`);
            $('#users_ul_container').append(messageLi);
          }
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });
}
