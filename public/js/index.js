$(document).ready(function(){

  setInterval(update, 3000);

  $("#group-message-button").on("click", function(err){
    $.ajax({
      url: "https://stormy-basin-23393.herokuapp.com/grouptext",
      method: "post",
      data: {
        Body: $("#group-message-input").val()
      },
      success: function(response){
        var content = $("#group-message-input").val();
        var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="https://media1.giphy.com/media/UqxVRm1IaaIGk/giphy.gif"> [Admin]: ${content} <span class="time_date">${this.receivedAt}</span></li>`);
        $('#messages_ul_container').append(messageLi);
        $("#group-message-input").val("");
        $("#messages_ul_container").scrollTop($("#messages_ul_container")[0].scrollHeight);
      }
    })
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
          var messageLi = $(`<li class="message_to_display"><img class="profile_img" src="${curMessage.sender.imgURL}"> [${curMessage.sender.name}]: ${curMessage.content} <span class="time_date">${this.receivedAt}</span></li>`);
          $('#messages_ul_container').append(messageLi);
          $("#messages_ul_container").scrollTop($("#messages_ul_container")[0].scrollHeight);
        }
      }
    },
    error: function(err){
      console.log(err);
    }
  });
}
