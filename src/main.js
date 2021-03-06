
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
    const player = createPlayer(gameBoard);

    const game = createGame(gameBoard, paddle, ball, player);

    const paddleController = createPaddleController(paddle, gameBoard);
    const ballController = createBallController(ball, paddle, gameBoard);

    startGame();

    function startGame() {
      resetGameBoard();
      drawFrame();
    }

    function resetGameBoard() {
      paddleController.resetPaddle();
      ballController.resetBall();
    }

    function drawFrame(timestamp) {
        if (game.active) {
          if (ball.isDead) {
              player.lives -= 1;
              resetGameBoard();
          }

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
  drawPlayer(context, game.player);

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

  context.fillStyle = ball.isDead ? ball.deadColor : ball.color;
  context.fill();

  context.restore();
}

function drawPlayer(context, player) {
    context.save();

    context.font = player.font;
    context.fillStyle = player.color;

    context.fillText(`Score: ${player.score}`, 8, 20);
    context.fillText(`Lives: ${player.lives}`, player.board.width - 65, 20);

    context.restore();
}

function createGame(gameBoard, paddle, ball, player) {
  return {
    active: true,
    board: gameBoard,
    paddle: paddle,
    ball: ball,
    player: player
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
    isDead: false,
    deadColor: "gray",
    moveTo : function moveTo(dx, dy) {
      this.x = dx;
      this.y = dy;
    }
  };
}

function createPlayer(gameBoard) {
    return {
      lives: 3,
      score: 0,
      color: "blue",
      font: "16px Arial",
      board: gameBoard
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

function createBallController(ball, paddle, gameBoard) {
  return {
    ball: ball,
    paddle: paddle,
    board: gameBoard,
    velocityX : 2,
    velocityY : 2,
    resetBall : function resetBall() {
      const ball = this.ball;
      const board = this.board;

      // move ball to center of board
      const ballX = board.width / 2 - ball.radius;
      const ballY = board.height / 2 - ball.radius;

      ball.moveTo(ballX, ballY);
      ball.isDead = false;
    },
    moveBall : function moveBall() {
      const ball = this.ball;
      const board = this.board;
      const paddle = this.paddle;

      const ballAbovePaddle = ball.x > paddle.x && ball.x < (paddle.x + paddle.width);
      const ballAtPaddleHeight = (ball.y + ball.radius) >= paddle.y;

      if ((ball.x - ball.radius) <= 0) {                    // left side
        this.velocityX = -this.velocityX;
      } else if ((ball.x + ball.radius) >= board.width) {   // right side
        this.velocityX = -this.velocityX;
      } else if ((ball.y - ball.radius) <= 0) {             // top side
        this.velocityY = -this.velocityY;
      } else if ((ball.y + ball.radius) >= board.height) {  // bottom side
        ball.isDead = true;
      } else if (ballAbovePaddle && ballAtPaddleHeight) {   // ball hit paddle
        this.velocityY = -this.velocityY;
      }

      if (!ball.isDead) {
        ball.moveTo(ball.x + this.velocityX, ball.y + this.velocityY);
      }
    }
  }
}
