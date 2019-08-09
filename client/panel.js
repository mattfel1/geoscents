const canvas = window.document.getElementById('panel');
const ctx = canvas.getContext('2d');
const socket = io();
// Connect

const showInfo = (gameState) => {
    ctx.font = "30px Arial";
    ctx.fillText("Hello World", 10, 50);
};

// Draw game for client
socket.on('draw panel', (gameState) => {
  showInfo(gameState)
});
