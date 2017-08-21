'use strict'
// snake's head is BLACK!

class Board {
  constructor(size, snakes, apples) {
    this.size = size;
    this.board = [];
    this.scale = 600/this.size;
    this.snakes = snakes;
    this.apples = apples;

    this.generate();

    // TODO: fix in the future
    setInterval(() => {
      moveSnakes(this.snakes);
      this.generate();
    }, 500);
  }
  generate() {
    this.board.length = 0;

    // create empty board
    for (var i = 0; i < this.size; i++) {
      let row = new Array(this.size);
      row.fill('.');
      this.board.push(row);
    }

    for(let apple of this.apples) {
      let [x, y] = apple;
      this.board[y][x] = 'o';
    }

    for(let snake of this.snakes) {
      for (let element of snake) { 
        let {x, y, head} = element;
        this.board[y][x] = head ? 'H' : '#';
      }
    }
  }
}


let snakes = [
  new Snake([[2, 2], [2, 1], [2, 0]]), // each snake is an array of snake elements' coordinates
  new Snake([[5, 5], [5, 4], [5, 3]])
];
let apples = [[4, 4], [0, 0], [1, 3], [2, 5], [3, 10], [4, 11], [5, 15], [6,8]];

var board = new Board(20, snakes, apples);

function moveSnakes(snakes) {
  console.log('moving');
  for (let snake of snakes) {
    if (snake.coordinates.length > 0) {
      let head = snake.head();
      let direction = snake1(board, head);
      /*
      when moving a snake, snake array must be updated as follows:
      - calculate new snake head position
      - add new head to snake array
      - remove last element from snake array
      */
      console.log(direction);

      let newHead = getNewHead(head, direction);

      /*
      remove last pair of coordinates, and add new ones as a new snake's head if move is possible
      */
      
      let tail = snake.coordinates.pop();

      let validMove = isOnBoard(newHead) && !isSteppingOnOtherSnakes(newHead);

      if (validMove) {
        snake.move(newHead, tail);
      } else {
        /* snake dies here */
        snake.die();
        /*
        reborn snake after it's death
        */
        snake.reborn();
      }
    }
  }
}

function isSteppingOnOtherSnakes(newHead) {
  /*
  is move possible? - collision check with itself and other snakes
  */
  for (let otherSnake of snakes) {
    for (let [x, y] of otherSnake.coordinates) {
      if (newHead.x === x && newHead.y === y) {
        console.log('snake stepped on another snake or on itself');
        return true;
      }
    }
  }
  return false;
}

function getNewHead(head, direction) {
  let [x, y] = head;
  let newHead = {};

  switch (direction) {
    case 'up':
      newHead.x = x;
      newHead.y = y - 1;
      break;
    case 'down':
      newHead.x = x;
      newHead.y = y +1;
      break;
    case 'left':
      newHead.x = x - 1;
      newHead.y = y;
      break;
    case 'right':
      newHead.x = x + 1;
      newHead.y = y;
      break;
  }
  return newHead;
}

function isOnBoard(point) {
  /*
  is move possible? - collision check with board edges
  */
  let {x, y} = point;

  return !(x < 0 || x >= board.size || y < 0 || y >= board.size);
}

// snake1 is temporary name
function snake1() {
  let directions = ['right', 'left', 'up', 'down'];
  let direction = directions[rand(0, directions.length)];

  return direction;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}