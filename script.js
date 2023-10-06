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
  const reloadButton = document.getElementById("reload-button");

  if (isReloadEnabled) {
    stopReloadInterval();
    console.log('Auto Reload disabled');
    reloadButton.textContent = "Auto Reload OFF";
    reloadButton.style.backgroundColor = "#9d2933"; 
  } else {
    startReloadInterval();
    console.log('Auto Reload enabled');
    reloadButton.textContent = "Auto Reload ON";
    reloadButton.style.backgroundColor = "#3498db"; 
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