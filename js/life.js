'use strict';
var lifeCells = [
  [0]
];
var CELL_SIZE = 20;
var timer;

$(window).load(function() {
  resizeCanvas($('#lifeCanvas')[0], CELL_SIZE);
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  drawCells(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
});

$(window).resize(function() {
  resizeCanvas($('#lifeCanvas')[0], CELL_SIZE);
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  drawCells(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
});

$('.play-pause').click(function() {
  $(this).find(':first-child').toggleClass('glyphicon-play');
  $(this).find(':first-child').toggleClass('glyphicon-pause');
});

$('#playButton').click(function() {
  if (!timer) {
    timer = setTimeout(function tick() {
      nextPopulation(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
      timer = setTimeout(tick, 500 / $('#speedInput').val());
      // "500 / $('#speedInput').val()" duplicates because it should be calculated on each step
      //              ^ this value can be changed by user while animation
    }, 500 / $('#speedInput').val());
  } else {
    clearTimeout(timer);
    timer = null;
  }
});

$('#lifeCanvas').click(function(pos) {
  var canvas = $(this);
  var x = pos.clientX - canvas.position().left;
  var y = pos.clientY - canvas.position().top;

  //Ajust to the center of clicked circle
  x = x - x % CELL_SIZE + CELL_SIZE / 2;
  y = y - y % CELL_SIZE + CELL_SIZE / 2;

  //Position in cells matrix
  var i = Math.floor(x / CELL_SIZE);
  var j = Math.floor(y / CELL_SIZE);

  lifeCells[i][j] = +!lifeCells[i][j];
  drawCell(this, i, j, lifeCells[i][j], CELL_SIZE);
});

$('#stepButton').click(function() {
  nextPopulation(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
});

$('#resetButton').click(function() {
  lifeCells = [
    [0]
  ];
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  drawCells(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
});

function fitCellsToCanvas(cellsArray, canvasElement, cellSize) {
  var cells = cellsArray;
  var cellsWidth = canvasElement.width / cellSize;
  var cellsHeight = canvasElement.height / cellSize;
  if (cellsWidth > cells.length || cellsHeight > cells[0].length) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].push.apply(cells[i], Array.apply(null, new Array(cellsHeight - cells[i].length)).map(e => 0));
    }
    cells.push.apply(cells, Array.apply(null, new Array(cellsWidth - cells.length)).map(
      e => Array.apply(null, new Array(cellsHeight)).map(e => 0)));
  }
}

function drawCells(cellsArray, canvasElement, cellSize) {
  for (var i = 0; i < cellsArray.length; i++) {
    for (var j = 0; j < cellsArray[0].length; j++) {
      drawCell(canvasElement, i, j, cellsArray[i][j], cellSize);
    }
  }
}

function resizeCanvas(canvasElement, step) {
  var canvas = $(canvasElement);
  var container = canvas.parent();
  canvas.height(container.height() - canvas.position().top - step);
  canvas.height(canvas.height() - canvas.height() % step);
  canvas.width(container.width());
  canvas.width(canvas.width() - canvas.width() % step);
  canvas[0].width = canvas.width();
  canvas[0].height = canvas.height();
}

function nextPopulation(cellsArray, canvasElement, cellSize) {
  var cells = cellsArray.map(e => e.slice());
  for (var i = 0; i < cells.length; i++) {
    for (var j = 0; j < cells[0].length; j++) {
      var sum = 0;
      for (var x = i - 1; x <= i + 1; x++) {
        for (var y = j - 1; y <= j + 1; y++) {
          if (cells[x] && cells[x][y]) sum++;
        }
      }
      sum -= cells[i][j];
      if (cells[i][j]) {
        if (sum < 2 || sum > 3) {
          cellsArray[i][j] = 0;
          drawCell(canvasElement, i, j, 0, cellSize);
        }
      } else {
        if (sum == 3) {
          cellsArray[i][j] = 1;
          drawCell(canvasElement, i, j, 1, cellSize);
        }
      }
    }
  }
}

function drawCell(canvasElement, iPos, jPos, isAlive, cellSize) {
  var ctx = canvasElement.getContext('2d');
  var width = canvasElement.width;
  var height = canvasElement.height;
  //Calculate center of drawing circle
  var x = iPos * cellSize + cellSize / 2;
  var y = jPos * cellSize + cellSize / 2;

  //Clear existing image
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize, cellSize);

  //Draw new image
  ctx.lineWidth = 1;
  //gradient from RGB(0, 130, 130) to RGB(0, 230, 230)
  ctx.strokeStyle = 'rgb(0,' + Math.floor(100 * x / width + 130) + ',' + Math.floor(100 * y / height + 130) + ')';
  ctx.fillStyle = isAlive ? ctx.strokeStyle : '#fff';
  ctx.beginPath();
  ctx.arc(x, y, cellSize * 0.42, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.stroke();
}
