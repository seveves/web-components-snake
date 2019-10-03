const snakeTemplate = document.createElement('template');
snakeTemplate.innerHTML = `
  <style>
    :host {
    }

    .seveves-snake-header {
      display: flex;
      font-family: sans-serif;
    }

    .seveves-snake-score-title {
      font-weight: bold;
    }
  </style>
  <div class="seveves-snake-header">
    <div class="seveves-snake-score-title">Score</div>
    <div id="seveves-snake-score">
  </div>
  </div>
  <div class="seveves-snake-content">
    <canvas id="seveves-snake-canvas" width="300" height="300"></canvas>
  </div>
`;

class Snake extends HTMLElement {

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(snakeTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    const { shadowRoot } = this;
    this.snakeCanvas = shadowRoot.getElementById('seveves-snake-canvas');
    this.snakeCanvasCtx = this.snakeCanvas.getContext('2d');
    document.addEventListener('keydown', this.changeDirection.bind(this));
    this.start();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.changeDirection);
  }

  start() {
    this.score = 0;
    this.speed = 200;
    this.direction = {
      dx: 10,
      dy: 0
    };
    this.changingDirection = false;
    this.food = null;
    this.snake = [
      { x: 150, y: 150 },
      { x: 140, y: 150 },
      { x: 130, y: 150 },
      { x: 120, y: 150 },
      { x: 110, y: 150 }
    ];
    this.tick();
    this.createFood();
  }

  tick() {
    if (this.didGameEnd()) {
      return;
    }
    setTimeout(() => {
      this.changingDirection = false;
      this.clearCanvas();
      this.drawFood();
      this.advanceSnake();
      this.drawSnake();

      this.tick();
    }, this.speed);
  }

  clearCanvas() {
    const snakeCanvas = this.snakeCanvas.getBoundingClientRect();
    this.snakeCanvasCtx.fillStyle = 'white';
    this.snakeCanvasCtx.strokeStyle = '#333';
    this.snakeCanvasCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    this.snakeCanvasCtx.strokeRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  }

  drawSnakePart(snakePart) {
    this.snakeCanvasCtx.fillStyle = 'lightblue';
    this.snakeCanvasCtx.strokeStyle = 'darkblue';
    this.snakeCanvasCtx.fillRect(snakePart.x, snakePart.y, 10, 10);
    this.snakeCanvasCtx.strokeRect(snakePart.x, snakePart.y, 10, 10);
  }

  drawSnake() {
    this.snake.forEach((snakePart) => this.drawSnakePart(snakePart));
  }

  drawFood() {
    this.snakeCanvasCtx.fillStyle = 'lightgreen';
    this.snakeCanvasCtx.strokeStyle = 'darkgreen';
    this.snakeCanvasCtx.fillRect(this.food.x, this.food.y, 10, 10);
    this.snakeCanvasCtx.strokeRect(this.food.x, this.food.y, 10 , 10);
  }

  advanceSnake() {
    const head = {
      x: this.snake[0].x + this.direction.dx,
      y: this.snake[0].y + this.direction.dy
    };
    this.snake.unshift(head);
    const didEatFood = this.food != null
      ? this.snake[0].x === this.food.x && this.snake[0].y === this.food.y
      : false;
    if (didEatFood) {
      this.score += 10;
      setTimeout(() => {
        const scoreElement = this.shadowRoot.getElementById('seveves-snake-score');
        scoreElement.innerText = '' + this.score;
      })
      this.createFood();
    } else {
      this.snake.pop();
    }
  }

  didGameEnd() {
    for (let index = 4; index < this.snake.length; index++) {
      if (this.snake[index].x === this.snake[0].x && this.snake[index].y === this.snake[0].y) {
        return true;
      }

      const snakeCanvas = this.snakeCanvas.getBoundingClientRect();
      const hitLeft = this.snake[0].x < 0;
      const hitRight = this.snake[0].x > snakeCanvas.width - 10;
      const hitTop = this.snake[0].y < 0;
      const hitBottom = this.snake[0].y > snakeCanvas.height - 10;

      return hitLeft || hitRight || hitTop || hitBottom;
    }
  }

  createFood() {
    const snakeCanvas = this.snakeCanvas.getBoundingClientRect();
    const randomCoord = (min, max) => Math.round(Math.random() * (max - min) / 10) * 10;
    const food = {
      x: randomCoord(0, snakeCanvas.width - 10),
      y: randomCoord(0, snakeCanvas.height - 10)
    };

    if(this.snake.some((snakePart) => snakePart.x === food.x && snakePart.y === food.y)) {
      this.createFood();
    } else {
      this.food = food;
    }
  }

  changeDirection(event) {
    if (this.changingDirection) {
      return;
    }
    this.changingDirection = true;

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;

    const up = this.direction.dy === -10;
    const down = this.direction.dy === 10;
    const right = this.direction.dx === 10;
    const left = this.direction.dx === -10;

    if (keyPressed === LEFT_KEY && !right) {
      this.direction = {
        dx: -10,
        dy: 0
      };
    }
    if (keyPressed === UP_KEY && !down) {
      this.direction = {
        dx: 0,
        dy: -10
      };
    }
    if (keyPressed === RIGHT_KEY && !left) {
      this.direction = {
        dx: 10,
        dy: 0
      };
    }
    if (keyPressed === DOWN_KEY && !up) {
      this.direction = {
        dx: 0,
        dy: 10
      };
    }
  }
}

customElements.define('seveves-snake', Snake);
