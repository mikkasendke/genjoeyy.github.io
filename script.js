function scrollToBottom(chatWindowId) {
  var chatWindow = document.getElementById(chatWindowId);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

setInterval(function () {
  location.reload()
  scrollToBottom('chat-scrollable-stegi')
  scrollToBottom('chat-scrollable-di1araas')
}, 15000)