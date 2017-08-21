var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d');


function draw() {
  let scale = board.scale;

  for (let y = 0; y < board.board.length; y++) {
    let row = board.board[y];
    for (let x = 0; x < row.length; x++) {
      let field = row[x];
      switch (field) {
        case ".":
          ctx.fillStyle = 'rgb(255, 255, 255)';
          ctx.fillRect(x * scale, y * scale, scale, scale);
          break;
        case "#":
          ctx.fillStyle = 'rgb(120, 120, 120)';
          ctx.fillRect(x * scale, y * scale, scale, scale);
          break;
        case "H":
          ctx.fillStyle = 'rgb(0, 0, 0)';
          ctx.fillRect(x * scale, y * scale, scale, scale);
          break;
        case "o":
          ctx.fillStyle = 'rgb(255, 255, 255)';
          ctx.fillRect(x * scale, y * scale, scale, scale);
          ctx.fillStyle = 'rgb(200, 0, 0)';
          ctx.beginPath();
          ctx.arc(x * scale + parseInt(scale/2), y * scale + parseInt(scale/2), scale/2, 0, Math.PI*2);
          ctx.fill();
          break;
      }
    }
  }
  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);