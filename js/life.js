'use strict';
var lifeCells = [
  [0]
];
var STEP = 20;
var timer;
$('.play-pause').click(function() {
  $(this).find(':first-child').toggleClass('glyphicon-play');
  $(this).find(':first-child').toggleClass('glyphicon-pause');
});

$(window).load(function() {
  resizeCanvas($('#lifeCanvas')[0], STEP);
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], STEP);
  drawCells(lifeCells, $('#lifeCanvas')[0], STEP);
});

$(window).resize(function() {
  resizeCanvas($('#lifeCanvas')[0], STEP);
  fitCellsToCanvas(lifeCells, $('#lifeCanvas')[0], STEP);
  drawCells(lifeCells, $('#lifeCanvas')[0], STEP);
});

function fitCellsToCanvas(cellsArray, canvasElement, step) {
  var canvas = $(canvasElement);
  var cells = cellsArray;
  var cellsX = canvas.width() / step;
  var cellsY = canvas.height() / step;
  if (cellsX > cells.length || cellsY > cells[0].length) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].push.apply(cells[i], Array.apply(null, new Array(cellsY - cells[i].length)).map(e => 0));
    }
    cells.push.apply(cells, Array.apply(null, new Array(cellsX - cells.length)).map(
      e => Array.apply(null, new Array(cellsY)).map(e => 0)));
  }
}

function drawCells(cellsArray, canvasElement, step) {
  var canvas = $(canvasElement);
  var cells = cellsArray;
  var ctx = canvas[0].getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width(), canvas.height());
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000';
  for (var i = 0; i < cells.length; i++) {
    for (var j = 0; j < cells[0].length; j++) {
      var x = i * step + step / 2;
      var y = j * step + step / 2;
      ctx.strokeStyle = 'rgb(0,' +
        Math.floor(100 * i * step / canvas.width() + 130) + ',' +
        Math.floor(100 * j * step / canvas.height() + 130) + ')';
      ctx.beginPath();
      ctx.arc(x, y, step * 0.42, 0, Math.PI * 2, true);
      if (cells[i][j] == 1) {
        ctx.fillStyle = 'rgb(0,' + Math.floor(100 * x / canvas.width() + 130) + ',' + Math.floor(100 * y / canvas.height() + 130) + ')';
      } else {
        ctx.fillStyle = '#fff';
      }
      ctx.fill();
      ctx.stroke();
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

$('#lifeCanvas').click(function(pos) {
  var canvas = $(this);
  var x = pos.clientX - canvas.position().left;
  var y = pos.clientY - canvas.position().top;
  x = x - x % STEP + STEP / 2;
  y = y - y % STEP + STEP / 2;
  var ctx = canvas[0].getContext('2d');
  var cell = lifeCells[Math.floor(x / STEP)][Math.floor(y / STEP)];
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - STEP / 2, y - STEP / 2, STEP, STEP);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgb(0,' + Math.floor(100 * x / canvas.width() + 130) + ',' + Math.floor(100 * y / canvas.height() + 130) + ')';
  if (cell == 0) {
    ctx.fillStyle = 'rgb(0,' + Math.floor(100 * x / canvas.width() + 130) + ',' + Math.floor(100 * y / canvas.height() + 130) + ')';
    cell = 1;
  } else {
    ctx.fillStyle = '#fff';
    cell = 0;
  }
  lifeCells[Math.floor(x / STEP)][Math.floor(y / STEP)] = cell;
  ctx.beginPath();
  ctx.arc(x, y, 8.5, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.stroke();
});

function nextPopulation(cellsArray) {
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
        if (sum < 2 || sum > 3) cellsArray[i][j] = 0;
      } else {
        if (sum == 3) cellsArray[i][j] = 1;
      }
    }
  }
}

function doStep(cellsArray, canvasElement, step) {
  nextPopulation(cellsArray);
  drawCells(cellsArray, canvasElement, step);
}
$('#stepButton').click(function() {
  doStep(lifeCells, $('#lifeCanvas')[0], STEP);
});

$('#playButton').click(function() {
  if (!timer) {
    timer = setTimeout(function tick() {
      doStep(lifeCells, $('#lifeCanvas')[0], STEP);
      timer = setTimeout(tick, 100 / $('#speedInput').val());
    }, 100 / $('#speedInput').val());
  } else {
    clearTimeout(timer);
    timer = null;
  }
});
