function scrollToBottom(chatWindowId) {
  var chatWindow = document.getElementById(chatWindowId);
  var lastChatMessage = chatWindow.querySelector('.chat-message:last-child');
  if (lastChatMessage) {
    lastChatMessage.scrollIntoView({ behavior: 'smooth' });
  }
}

window.onload = function() {
  scrollToBottom('chat-scrollable-stegi')
  scrollToBottom('chat-scrollable-di1araas')
}

setInterval(function () {
  location.reload()
  scrollToBottom('chat-scrollable-stegi')
  scrollToBottom('chat-scrollable-di1araas')
}, 15000)