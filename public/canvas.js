const body = document.querySelector('body');

const canvas = document.querySelector('canvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const pencilColor = document.querySelectorAll('.pencil-color');
const pencilWidthElem = document.querySelector('.pencil-width');
const eraserWidthElem = document.querySelector('.eraser-width');
const download = document.querySelector('.download');
const redo = document.querySelector('.redo');
const undo = document.querySelector('.undo');

let penColor = '#222';
let eraserColor = 'white';
let penWidth = pencilWidthElem.value / 10;
let eraserWidth = eraserWidthElem.value / 10;

let undoRedoTracker = []; // Data
let track = 0; // Represent which from tracker array

let mouseDown = false;

// API
const tool = canvas.getContext('2d');

tool.lineCap = "round"
tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

const isMobile = navigator.userAgentData.mobile;
canvas.addEventListener(isMobile || navigator.userAgentData.platform == '' ? 'touchstart': 'mousedown', (e) => {
  let data;
  mouseDown = true;
  if (isMobile) {
    data = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  } else {
    data = {
      x: e.clientX,
      y: e.clientY,
    };
  } 
  socket.emit('beginPath', data);
});

canvas.addEventListener(isMobile || navigator.userAgentData.platform == '' ? 'touchmove' : 'mousemove', (e) => {
  let data;
  if (mouseDown) {
    if (isMobile || navigator.userAgentData.platform === '') {
      data = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        color: eraserFlag ? eraserColor : penColor,
        width: eraserFlag ? eraserWidth : penWidth,
      }
    }
    else {
      data = {
        x: e.clientX,
        y: e.clientY,
        color: eraserFlag ? eraserColor : penColor,
        width: eraserFlag ? eraserWidth : penWidth,
      };
    } 

    socket.emit('drawStroke', data);
  }
});

canvas.addEventListener(isMobile ? 'touchend':'mouseup', () => {
  mouseDown = false;

  const url = canvas.toDataURL();
  undoRedoTracker.push(url);
  track = undoRedoTracker.length - 1;
});

undo.addEventListener('click', (e) => {
  if (track > 0) track--;

  const data = {
    trackValue: track,
    undoRedoTracker,
  };

  socket.emit('redoUndo', data);
});

redo.addEventListener('click', (e) => {
  if (track < undoRedoTracker.length - 1) track++;
  // track action
  const trackObj = {
    trackValue: track,
    undoRedoTracker,
  };
  undoRedoCanvas(trackObj);
});

function undoRedoCanvas(trackObj) {
  track = trackObj.trackValue;
  undoRedoTracker = trackObj.undoRedoTracker;

  let url = undoRedoTracker[track];
  const img = new Image(); // new image reference element
  img.src = url;
  img.onload = (e) => {
    tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    // to place image in canvas
  };
}
function setWidth(width, flag, size) {
  if (flag) {
    eraserWidthElem.value = width;
    tool.lineWidth = size;
  } else {
    pencilWidthElem.value = width;
    tool.lineWidth = size;
  }
  
}

function beginPath(strokeObj) {
  tool.beginPath();
  tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
  tool.strokeStyle = strokeObj.color;
  tool.linewidth = strokeObj.width;
  tool.lineTo(strokeObj.x, strokeObj.y);
  tool.stroke();
}

pencilColor.forEach((colorElem) => {
  colorElem.addEventListener('click', (e) => {
    const color = colorElem.dataset.color;
    penColor = color;
    tool.strokeStyle = penColor;
  });
});

pencilWidthElem.addEventListener('change', (e) => {
  penWidth = Math.floor(+pencilWidthElem.value / 10);
  socket.emit('width', pencilWidthElem.value, eraserFlag, penWidth);
  tool.lineWidth = penWidth;
});

eraserWidthElem.addEventListener('change', (e) => {
  eraserWidth = +eraserWidthElem.value / 5;
  socket.emit('width', eraserWidthElem.value, eraserFlag, eraserWidth);
  tool.lineWidth = eraserWidth;
});

eraser.addEventListener('click', (e) => {
  if (eraserFlag) {
    tool.strokeStyle = eraserColor;
    tool.lineWidth = eraserWidth;
  } else {
    tool.strokeStyle = penColor;
    tool.lineWidth = penWidth;
  }
});

download.addEventListener('click', (e) => {
  const url = canvas.toDataURL(); // it will convert all the pixel graphics to url.

  const a = document.createElement('a');
  a.href = url;
  const save = prompt('Save as?');
  a.download = `${!save ? 'board' : save}.jpg`;
  a.click();
});

socket.on('beginPath', (data) => {
  // data from server
  beginPath(data);
});

socket.on('drawStroke', (data) => {
  // data from server
  drawStroke(data);
});

socket.on('redoUndo', (data) => {
  // data from server
  undoRedoCanvas(data);
});

socket.on('width', (width, flag, size) => {
  // data from server
  setWidth(width, flag,size);
});
