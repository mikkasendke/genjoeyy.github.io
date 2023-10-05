setInterval(function () {
  location.reload()
}, 30000)

function scrollToBottom() {
  var sChat = document.getElementsByClassName("chat-scrollable-stegi")
  sChat[0].lastElementChild.scrollIntoView()
  var dChat = document.getElementsByClassName('chat-scrollable-di1araas')
  dChat[0].lastElementChild.scrollIntoView()
}

window.onload = scrollToBottom