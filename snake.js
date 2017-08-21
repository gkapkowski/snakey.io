class Snake {
  constructor(coordinates) {
    this.coordinates = coordinates;
    this[Symbol.iterator] = function* () {
      for (let i = 0; i < this.coordinates.length; i++) {
        yield {
          x: this.coordinates[i][0],
          y: this.coordinates[i][1],
          head: i === 0
        }
      }
    }
  }

  head() {
    return this.coordinates[0];
  }
  die() {
    this.coordinates.length = 0;
  }
  reborn() {
    let validPoint = false;
    let newHead = {};

    /* choose reborn point for new snake*/
    while (!validPoint) {
      newHead.x = rand(0, board.size + 1);
      newHead.y = rand(0, board.size + 1);
      validPoint = true;
      for (let snake of snakes) {
        for (let [x, y] of snake.coordinates) {
          if (newHead.x === x && newHead.y === y) {
            validPoint = false
          }
        }
      }
    }
    this.coordinates.push([newHead.x, newHead.y]);
  }
  move(newHead, tail) {
    // add new head
    this.coordinates.unshift([newHead.x, newHead.y]);

    for(let apple of apples){
      let [x, y] = apple;
      let index = apples.indexOf(apple);

      if (newHead.x === x && newHead.y === y) {
        this.coordinates.push(tail);
        apples.splice(index, 1);
        console.log('snake ate apple');
        break;
      }
    }
  }
}