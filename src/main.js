
// let's do something after the window has loaded
window.onload = function onLoad() {
    log('window loaded');

    let canvas = document.getElementById('mainCanvas');
    let context = canvas.getContext('2d');

    const size = {
        width: canvas.clientWidth,
        height: canvas.clientHeight
      };

    log(`found canvas: ${size.width} by ${size.height}`);

    const gameBoard = createGameBoard(size);

    drawGameBoard(context, gameBoard);
}

function log(message) {
  console.log(message);
}

function drawGameBoard(context, gameBoard) {
    context.save();

    context.fillStyle = gameBoard.color;
    context.fillRect(0, 0, gameBoard.width, gameBoard.height);
    context.restore();
}

function createGameBoard(size) {
  return {
    width: size.width,
    height: size.height,
    color: "silver"
  };
}
