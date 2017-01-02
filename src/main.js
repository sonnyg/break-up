
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
    const paddle = createPaddle(gameBoard);
    const ball = createBall();

    const game = createGame(gameBoard, paddle, ball);

    const paddleController = createPaddleController(paddle, gameBoard);
    const ballController = createBallController(ball, gameBoard);

    startGame();

    function startGame() {
      paddleController.resetPaddle();
      ballController.resetBall();

      drawFrame();
    }

    function drawFrame(timestamp) {
        if (game.active) {
          drawGame(context, game);

          ballController.moveBall();
          window.requestAnimationFrame(drawFrame);
        }
    }

    // listen for mouse events on the document
    document.onmousemove = function onMouseMove(event) {
      // since we want the user to be able to control the paddle from anywhere
      // in the document, we have to do some math to see if the mouse pointer
      // "lines" up, vertically, with the canvas. Since the paddle can only move
      // left and right, we only care about the mouse's x coordinate.

      // start by getting the x coordinate relative to the document
      const mouseX = event.clientX;

      // now find out what the mouse's x coordinate is 'inside' the canvas
      const canvasX = mouseX - canvas.offsetLeft;

      // log(`mouseX: ${mouseX}, canvasX: ${canvasX}`);
      // now update the paddle
      paddleController.movePaddle(canvasX);
    }
}

function log(message) {
  console.log(message);
}

function drawGame(context, game) {
  context.save();

  context.clearRect(0, 0, game.board.width, game.board.height);

  drawGameBoard(context, game.board);
  drawPaddle(context, game.paddle);
  drawBall(context, game.ball);

  context.restore();
}

function drawGameBoard(context, gameBoard) {
    context.save();

    context.fillStyle = gameBoard.color;
    context.fillRect(0, 0, gameBoard.width, gameBoard.height);

    context.restore();
}

function drawPaddle(context, paddle) {
    context.save();

    context.fillStyle = paddle.color;
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    context.restore();
}

function drawBall(context, ball) {
  context.save();

  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
  context.closePath();

  context.fillStyle = ball.color;
  context.fill();

  context.restore();
}

function createGame(gameBoard, paddle, ball) {
  return {
    active: true,
    board: gameBoard,
    paddle: paddle,
    ball: ball
  };
}

function createGameBoard(size) {
  return {
    width: size.width,
    height: size.height,
    color: "silver"
  };
}

function createPaddle(gameBoard) {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 12,
    color: "blue",
    moveTo : function moveTo(dx, dy) {
      this.x = dx;
      this.y = dy;
    }
  };
}

function createBall() {
  return {
    x: 0,
    y: 0,
    radius: 20,
    color: "red",
    moveTo : function moveTo(dx, dy) {
      this.x = dx;
      this.y = dy;
    }
  };
}

function createPaddleController(paddle, gameBoard) {
  return {
    paddle: paddle,
    board: gameBoard,
    resetPaddle : function resetPaddle() {
      const paddle = this.paddle;
      const board = this.board;

      // move paddle to bottom, center of gameBoard
      const paddleX = board.width / 2 - paddle.width / 2;
      const paddleY = board.height - paddle.height - 2; // small bottom gap

      paddle.moveTo(paddleX, paddleY);
    },
    movePaddle : function movePaddle(dx) {
      const paddle = this.paddle;
      const board = this.board;

      // move the paddle if it fits on the game board
      if (dx < 0) {
        paddle.moveTo(0, paddle.y);
      } else if (dx + paddle.width > board.width) {
        paddle.moveTo(board.width - paddle.width, paddle.y);
      } else {
        paddle.moveTo(dx, paddle.y);
      }
    }
  }
}

function createBallController(ball, gameBoard) {
  return {
    ball: ball,
    board: gameBoard,
    velocityX : 2,
    velocityY : 2,
    resetBall : function resetBall() {
      const ball = this.ball;
      const board = this.board;

      // move ball to center of board
      const ballX = board.width / 2 - ball.x;
      const ballY = board.height / 2 - ball.y;

      ball.moveTo(ballX, ballY);
    },
    moveBall : function moveBall() {
      const ball = this.ball;
      const board = this.board;

      // keep ball inside the game board
      if ((ball.x - ball.radius) <= 0) {                    // left side
        this.velocityX = -this.velocityX;
      } else if ((ball.x + ball.radius) >= board.width) {   // right side
        this.velocityX = -this.velocityX;
      } else if ((ball.y - ball.radius) <= 0) {             // top side
        this.velocityY = -this.velocityY;
      } else if ((ball.y + ball.radius) >= board.height) {  // bottom side
        console.trace("uh-oh! ball hit bottom of board");
        this.velocityY = -this.velocityY;
      }

      ball.moveTo(ball.x + this.velocityX, ball.y + this.velocityY);
    }
  }
}

/*
,
moveTo : function moveTo(dx, dy) {
  this.x = dx;
  this.y = dy;
}

color: "0095DD",
font: "16px Arial",
score: 0,
lives: 3

drawScore(context, game);
drawLives(context, game);

function drawScore(context, game) {
  context.save();

  context.font = game.font;
  context.fillStyle = game.color;
  context.fillText(`Score: ${game.score}`, 8, 20);

  context.restore();
}

function drawLives(context, game) {
  context.save();

  context.font = game.font;
  context.fillStyle = game.color;
  context.fillText(`Lives: ${game.lives}`, game.board.width - 65, 20);

  context.restore();
}
*/
