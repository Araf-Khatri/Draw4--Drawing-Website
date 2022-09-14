const toolsCont = document.querySelector('.tools-cont');
const flexMain = document.querySelector('.flexMain');
const optionsCont = document.querySelector('.options-cont');
const pencilToolCont = document.querySelector('.pencil-tool-cont');
const eraserToolCont = document.querySelector('.eraser-tool-cont');
const pencil = document.querySelector('.pencil');
// OR
const eraser = document.querySelector('img[src="./Icons/Eraser.svg"]');
const sticky = document.querySelector('.sticky');
const upload = document.querySelector('.upload');

const isNotPC =
  navigator.userAgentData.mobile || navigator.userAgentData.platform == '';

let optionFlag = false;
let pencilFlag = false;
let eraserFlag = false;

optionsCont.addEventListener('click', (e) => {
  optionFlag = !optionFlag;

  if (optionFlag) openTools();
  else closeTools();
});

function openTools() {
  let iconElem = optionsCont.children[0];
  iconElem.classList.add('fa-times');
  iconElem.classList.remove('fa-bars');
  toolsCont.style.display = 'flex';
  flexMain.style.width = '100vw';
}

function closeTools() {
  let iconElem = optionsCont.children[0];
  iconElem.classList.add('fa-bars');
  iconElem.classList.remove('fa-times');
  toolsCont.style.display = 'none';

  pencilToolCont.style.display = 'none';
  eraserToolCont.style.display = 'none';
  flexMain.style.width = 'auto';
}

function createSticky(HTMLTemplate) {
  let stickyCont = document.createElement('div');
  stickyCont.setAttribute('class', 'sticky-cont');
  stickyCont.innerHTML = `
    <div class="header-cont">
      <div class="minimize"></div>
      <div class="remove"></div>
    </div>
    <div class="note-cont">
      ${HTMLTemplate}
    </div>
  `;
  document.body.appendChild(stickyCont);

  let minimize = stickyCont.querySelector('.minimize');
  let remove = stickyCont.querySelector('.remove');

  noteActions(minimize, remove, stickyCont);

  if (isNotPC) {
    stickyCont.ontouchmove = function (event) {
      dragAndDrop(stickyCont, event);
    };
  } else {
    stickyCont.onmousedown = function (event) {
      dragAndDrop(stickyCont, event);
    };
    stickyCont.ondragstart = function () {
      return false;
    };
  }

}

pencil.addEventListener('click', (e) => {
  pencilFlag = !pencilFlag;
  if (pencilFlag) {
    pencilToolCont.style.display = 'flex';
    pencilToolCont.style.left = `5%`;
    pencilToolCont.style.top = '3rem';
  } else pencilToolCont.style.display = 'none';
});

eraser.addEventListener('click', (e) => {
  eraserFlag = !eraserFlag;
  if (eraserFlag) {
    eraserToolCont.style.display = 'flex';
    eraserToolCont.style.left = `20%`;
    eraserToolCont.style.top = '3rem';
  } else eraserToolCont.style.display = 'none';
});

upload.addEventListener('click', (e) => {
  let input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.click();

  input.addEventListener('change', (e) => {
    let file = input.files[0];
    let url = URL.createObjectURL(file);
    createSticky(`<img src="${url}"/>`);
  });
});

sticky.addEventListener('click', (e) => {
  createSticky('<textarea spellcheck="false"></textarea>');
});

function noteActions(minimize, remove, stickyCont) {
  remove.addEventListener('click', () => {
    stickyCont.remove();
  });
  minimize.addEventListener('click', (e) => {
    let noteCont = stickyCont.querySelector('.note-cont');
    let display = getComputedStyle(noteCont).getPropertyValue('display');

    if (display === 'none') noteCont.style.display = 'block';
    else noteCont.style.display = 'none';
  });
}

function dragAndDrop(element, event) {

  let shiftX;
  let shiftY;

  if (isNotPC) {
    onTouchMove(event)
  } else {
    shiftX = event.clientX - element.getBoundingClientRect().left;
    shiftY = event.clientY - element.getBoundingClientRect().top;
    onMouseMove(event)
  }

  element.style.position = 'absolute';
  element.style.zIndex = 1000;

  function mouseMoveAt(pageX, pageY) {
    element.style.left = pageX - shiftX + 'px';
    element.style.top = pageY - shiftY + 'px';
  }
  function touchMoveAt(pageX, pageY) {
    element.style.left = pageX - 50 + 'px';
    element.style.top = pageY - 20 + 'px';
  }

  
  function onMouseMove(event) {
    mouseMoveAt(event.pageX, event.pageY);
  }
  function onTouchMove(event) {
    touchMoveAt(event.touches[0].pageX, event.touches[0].pageY);
  }

  // move the element on mousemove
  document.addEventListener('mousemove', onMouseMove);
  element.addEventListener('touchmove', onTouchMove);

  // drop the element, remove unneeded handlers
  element.onmouseup = function () {
    document.removeEventListener('mousemove', onMouseMove);
    
    element.onmouseup = null;
  };

  element.ontouchend = function () {
    document.removeEventListener('touchmove', onTouchMove);
    
    element.ontouchend = null;
  };
}
