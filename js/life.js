'use strict';
var lifeCells = [
  [0]
];
var CELL_SIZE = 10;
var timer;
var cyclical = true;

$(window).load(function() {
  resizeCanvas($('#lifeCanvas')[0], CELL_SIZE);
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  drawCells(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  for (var f in figures) {
    $('#figuresList').append('<li><a href ="#">' + f + '</a></li>');
  }
  $('#figuresList li a').click(function() {
    var key = $(this).html();
    lifeCells = new Array(figures[key].length);
    for (var i = 0; i < figures[key].length; i++) {
      lifeCells[i] = figures[key][i].slice();
    }
    fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
    drawCells(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  });
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

$('#worldButton').click(function() {
  $(this).toggleClass('active');
  cyclical = !cyclical;
});

$('#playButton').click(function() {
  if (!timer) {
    timer = setTimeout(function tick() {
      nextPopulation(lifeCells, $('#lifeCanvas')[0], CELL_SIZE, cyclical);
      timer = setTimeout(tick, 1000 / $('#speedInput').val());
      // "500 / $('#speedInput').val()" duplicates because it should be calculated on each step
      //              ^ this value can be changed by user while animation
    }, 1000 / $('#speedInput').val());
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
  var i = Math.floor(y / CELL_SIZE);
  var j = Math.floor(x / CELL_SIZE);

  lifeCells[i][j] = +!lifeCells[i][j];
  drawCell(this, i, j, lifeCells[i][j], CELL_SIZE);
});

$('#stepButton').click(function() {
  nextPopulation(lifeCells, $('#lifeCanvas')[0], CELL_SIZE, cyclical);
});

$('#resetButton').click(function() {
  lifeCells = [
    [0]
  ];
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  drawCells(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
});

$('#sizeInput').change(function() {
  CELL_SIZE = $(this).val();
  resizeCanvas($('#lifeCanvas')[0], CELL_SIZE);
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
  drawCells(lifeCells, $('#lifeCanvas')[0], CELL_SIZE);
});

function fitCellsToCanvas(cellsArray, canvasElement, cellSize) {
  var cells = cellsArray;
  var cellsWidth = canvasElement.width / cellSize;
  var cellsHeight = canvasElement.height / cellSize;

  if (cellsHeight > cells.length) {
    cells.push.apply(cells, Array.apply(null, new Array(cellsHeight - cells.length)).map(
      e => Array.apply(null, new Array(cellsWidth)).map(e => 0)));
  }

  if (cellsWidth > cells[0].length) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].push.apply(cells[i], Array.apply(null, new Array(cellsWidth - cells[i].length)).map(e => 0));
    }
  }
  if (cellsHeight < cells.length) {
    cells.splice(cellsHeight, cells.length - cellsHeight);
  }

  if (cellsWidth < cells[0].length) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].splice(cellsWidth, cells[i].length - cellsWidth);
    }
  }
}

function drawCells(cellsArray, canvasElement, cellSize) {
  for (var i = 0; i < cellsArray.length; i++) {
    for (var j = 0; j < cellsArray[0].length; j++) {
      drawCell(canvasElement, i, j, cellsArray[i][j], cellSize);
    }
  }
}

function resizeCanvas(canvasElement, cellSize) {
  var canvas = $(canvasElement);
  var container = canvas.parent();
  canvas.height(container.height() - canvas.position().top - cellSize);
  canvas.height(canvas.height() - canvas.height() % cellSize);
  canvas.width(container.width());
  canvas.width(canvas.width() - canvas.width() % cellSize);
  canvas[0].width = canvas.width();
  canvas[0].height = canvas.height();
}

function nextPopulation(cellsArray, canvasElement, cellSize, isCyclical) {
  var cells = cellsArray.map(e => e.slice());
  for (var i = 0; i < cells.length; i++) {
    for (var j = 0; j < cells[0].length; j++) {
      var sum = 0;
      for (var y = i - 1; y <= i + 1; y++) {
        for (var x = j - 1; x <= j + 1; x++) {
          if (isCyclical) {
            var a = y < 0 ? y + cells.length : y;
            var b = x < 0 ? x + cells[i].length : x;
            a = a >= cells.length ? a - cells.length : a;
            b = b >= cells[i].length ? b - cells[i].length : b;
            if (cells[a][b]) sum++;
          } else {
            if (cells[y] && cells[y][x]) sum++;
          }
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
  var y = iPos * cellSize + cellSize / 2;
  var x = jPos * cellSize + cellSize / 2;

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
