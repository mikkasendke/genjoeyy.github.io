let reloadInterval;
let isReloadEnabled = true

function startReloadInterval() {
  reloadInterval = setInterval(function () {
    location.reload()
  }, 30000)
}
function stopReloadInterval() {
  clearInterval(reloadInterval)
}

function toggleReload() {
  if (isReloadEnabled) {
    stopReloadInterval()
    document.getElementById("reloadButton").textContent = "Auto Reload OFF"
  } else {
    startReloadInterval()
    document.getElementById("reloadButton").textContent = "Auto Reload ON"
  }
  isReloadEnabled = !isReloadEnabled;
}

startReloadInterval()

function scrollToBottom() {
  var sChat = document.getElementsByClassName("chat-scrollable-stegi")
  sChat[0].lastElementChild.scrollIntoView()
  var dChat = document.getElementsByClassName('chat-scrollable-di1araas')
  dChat[0].lastElementChild.scrollIntoView()
}

window.onload = scrollToBottom