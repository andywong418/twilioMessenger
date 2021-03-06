$(document).ready(function(){

  setInterval(updateMessages, 3000);
  setInterval(updateUsers, 3000);
  var group_name = $('.message_text_container').attr('id');
  $('#header_title').text(group_name);
  $("#group-message-button").on("click", function(event){
    event.preventDefault();
    $.ajax({
      url: "https://stormy-basin-23393.herokuapp.com/grouptext",
      method: "post",
      data: {
        Body: $("#group-message-input").val()
      },
      success: function(response){
        console.log("RESPONSE", response);
        var content = $("#group-message-input").val();
        var time = (new Date()).toLocaleTimeString();
        var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="${response.admin.user.imgURL}"> [${response.admin.username}]: ${content}</li>`);
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

function updateMessages(){
  $.ajax({
    url: "https://stormy-basin-23393.herokuapp.com/messages",
    method: "get",
    success: function(response){
      if(response.messages !== undefined){
        if(response.messages.length > $("#messages_ul_container").children().length){
          for (var i = $("#messages_ul_container").children().length; i < response.messages.length; i ++){
            var curMessage = response.messages[i];
            var messageLi = $(`<li id="curMessage._id" class="message_to_display"><img class="profile_img" src="${curMessage.sender.imgURL}"> [${curMessage.sender.name}]: ${curMessage.content}</li>`);
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
}
function updateUsers(){
  $.ajax({
    url: "https://stormy-basin-23393.herokuapp.com/users",
    method: "get",
    success: function(response){
      console.log("________________________________");
      console.log(response);
      console.log($("#users_ul_container").children().length);
      if(response.users !== undefined){

        if(response.users.length >($("#users_ul_container").children().length-1)){
          for (var i = ($("#users_ul_container").children().length-1); i < response.users.length; i ++){
            var curUser = response.users[i];
            var messageLi = $(`<li id="${curUser._id}"class="user_to_display"><img class="profile_img" src="${curUser.imgURL}"> ${curUser.name}<span class="delete-user glyphicon glyphicon-remove"></span></li>`);
            $('#users_ul_container').append(messageLi);
          }
        }
        else if(response.users.length < ($("#users_ul_container").children().length-1)){
          // var childrenObjs = Array.prototype.slice.call($("#users_ul_container").children());
          // console.log($("#users_ul_container").children())
          // childrenObjs.forEach(function(obj){
          //   console.log(obj);
          //   if(response.users.indexOf(obj.attr("id")) === -1){
          //       obj.remove();
          //   }
          // });
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });

}
