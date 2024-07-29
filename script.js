
document.addEventListener('DOMContentLoaded', (event) => {
  console.log("DOM fully loaded and parsed");
  changeBanner();
  updateButton();
});

let clicked = 999;
let gridCreated = false;
let size = -1;
let undoStack = [];
const directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const players = ['black.jpeg', 'white.jpeg'];

function gridSize() {
  return parseInt(document.getElementById('gridSize').value)
} 
function setSize() {

  if (isNaN(gridSize())) {
    alert('Please choose a grid size');
    return false;
  }
  return true;
}

function postMoveWrapUp() {
  lastPlayed(0, 0);
  scanLegalMoves();
  updateScores();
}

function createGrid() {
  size = gridSize();
  if (!setSize()) return;

  const container = document.querySelector('.image-container');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  const cellSize = 600 / size;

  for (let i = 1; i <= size * size; i++) {
      const div = document.createElement('div');
      div.className = 'image-box';
      div.style.width = div.style.height = `${cellSize}px`;
      div.onclick = () => changeImage(i);
      const img = document.createElement('img');
      img.id = `box-image-${i}`;
      img.src = 'placeholder_image.jpg';
      img.alt = 'placeholder image';
      div.appendChild(img);
      container.appendChild(div);
  }
  clicked = 0;
  changeBanner();
  gridCreated = true;
  updateButton();
  setBoard();
  postMoveWrapUp();
}

function changeImage(index) {
  updateScores();
  const img = document.getElementById(`box-image-${index}`);
  if (img.src.includes('legal.jpeg')) {
    undoStack.push(captureLayout());
    
    const [row, col] = rowCol(index);
    setImageSrc(img);
    scanDirections(row, col);
    clicked += 1;
    postMoveWrapUp();
  }
}

function blacksTurn() {
  return(clicked % 2 == 0);
}

function setImageSrc(img) {
  if (blacksTurn()) {
    img.src = 'black.jpeg';
    img.alt = 'black piece';
  } else {
    img.src = 'white.jpeg';
    img.alt = 'white piece';
  }
}

function changeBanner() {
  const promptElement = document.getElementById('banner');
  const [whiteScore, blackScore, empty, legalScore] = calcScore();
  
  if (endGame()){
    if (blackScore > whiteScore) {
      promptElement.innerHTML = 'Game over - Black WINS!!!';
    } else if (blackScore < whiteScore) {
      promptElement.innerHTML = 'Game over - White WINS!!!';
    } else {
      promptElement.innerHTML = 'Game over - Tie game';
    }
  } else {
    if (clicked === 999) {
      promptElement.innerHTML = "Choose board size and click Create Grid";
    } else if (clicked % 2 > 0) {
        promptElement.innerHTML = "White's Turn";
    } else {
        promptElement.innerHTML = "Black's Turn";
    }
  } 
}

function endGame() {
  size = gridSize();
  const [whiteScore, blackScore, empty, legalScore] = calcScore();
  return (clicked === ((size * size) - 4)) || ((whiteScore + blackScore) === (size * size));
}

function updateButton() {
  const button = document.getElementById('gridButton');
  button.innerText = gridCreated ? "Restart Game" : "Create Grid";
}

function handleButtonClick() {
  gridCreated ? restartGame() : createGrid();
}

function restartGame() {

  gridCreated = false;
  clicked = 0;
  undoStack = [];   //Clears out the array so an "undo move" click doesnt ruin the layout when pressed
  const container = document.querySelector('.image-container');
  container.innerHTML = '';
  createGrid();
  changeBanner();
  updateButton();
  lastPlayed(0, 0);
}

function getDimensions() {
  const halfCube = (size * size) / 2;
  const firstWhite = halfCube - (size/2);
  const firstBlack = firstWhite + 1;
  const secondBlack = halfCube + (size/2);
  const secondWhite = secondBlack + 1;
  return [firstWhite, firstBlack, secondBlack, secondWhite];
}

function setWhiteSrc(index) {
  document.getElementById(`box-image-${index}`).src = 'white.jpeg';
}

function setWhiteAlt(index) {
  document.getElementById(`box-image-${index}`).alt = 'white.jpeg';
}

function setBlackSrc(index) {
  document.getElementById(`box-image-${index}`).src = 'black.jpeg';
}

function setBlackAlt(index) {
  document.getElementById(`box-image-${index}`).alt = 'black.jpeg';
}

function setBoard() {
  const [firstWhite, firstBlack, secondBlack, secondWhite] = getDimensions();

  setWhiteSrc(firstWhite);
  setWhiteAlt(firstWhite);
  setWhiteSrc(secondWhite);
  setWhiteAlt(secondWhite);
  setBlackSrc(firstBlack);
  setBlackAlt(firstBlack);
  setBlackSrc(secondBlack);
  setBlackAlt(secondBlack);

  updateScores();
}

function calcScore () {
  let whiteScore = 0;
  let blackScore = 0;
  let legalScore = 0;
  let empty = 0;
  for (let i = 1; i <= size * size; i++) {
    const img = document.getElementById(`box-image-${i}`);
    if (img.src.includes('white.jpeg')) {
      whiteScore += 1;
    } else if (img.src.includes('black.jpeg')) {
      blackScore += 1;
    } else if (img.src.includes('placeholder_image.jpg')) {
      empty += 1;
    } else if (img.src.includes('legal.jpeg')) {
      legalScore += 1;
    }
  }
  return [whiteScore, blackScore, empty, legalScore];
}

function captureLayout() {
  let boardLayout = [];
  for (let i = 1; i <= size * size; i++) {
    const img = document.getElementById(`box-image-${i}`);
    boardLayout.push(img.src);
  }
  return boardLayout;
}

function restoreLayout(boardLayout) {
  for (let i = 1; i <= size * size; i++) {
    const img = document.getElementById(`box-image-${i}`);
    img.src = boardLayout[i-1];
  }
  updateScores();
}

function undoMove() {
  if (undoStack.length > 0) {
    const previousLayout = undoStack.pop();
    restoreLayout(previousLayout);
    clicked -= 1;
    changeBanner();
    scanLegalMoves();
  } else {
    alert('Cannot undo move (no previous moves).')
  }

  return clicked;
}

function updateScores() {
  const [whiteScore, blackScore, empty, legalScore] = calcScore();
  document.getElementById('whiteScore').innerText = whiteScore;
  document.getElementById('blackScore').innerText = blackScore;
  document.getElementById('empty').innerText = empty;
  document.getElementById('legalScore').innerText = legalScore;
}

function rowCol (index) {
  const row = Math.floor((index - 1) / size) + 1;
  const col = (index - 1) % size + 1;
  return [row, col];
}

function lastPlayed (row, col) {
  if(clicked === 0) {
    row = 0;
    col = 0;
  } 

  document.getElementById('lastRow').innerText = row;
  document.getElementById('lastColumn').innerText = col;
  document.getElementById('clicked').innerText = clicked;
}

function getIndex(row, col) {
  let index = ((row - 1) * size) + col;
  document.getElementById('index').innerText = index;
  return index;
}

function friend() {
  return players[clicked % 2];
}

function foe() {
  return players[(clicked % 2 + 1) % 2];
}

function isFriend(src) {
  return src.includes(friend());
}

function isFoe(src) {
  return src.includes(foe());
}

function isUnplayed(src) {
  return src.includes('placeholder_image.jpg');
}

function boundaries(nextRow, nextCol) {
  return ((nextRow >= 1) && (nextRow <= size) && (nextCol >= 1) && (nextCol <= size));
}

function processDirections(row, col) {
  let positions = [];
  directions.forEach(direction => {
    const [dRow, dCol] = direction;
    const [nextRow, nextCol] = nextRowCol(row, col, dRow, dCol);
    positions.push([nextRow, nextCol, dRow, dCol]);
  });
  return positions;
}

function nextRowCol(row, col, dRow, dCol) {
  let nextRow = row + dRow;
  let nextCol = col + dCol;
  return[nextRow, nextCol];
}

function imgSrc(index) {
  let imgElement = document.getElementById(`box-image-${index}`);
  return imgElement.src.split('/').pop();
}

function scanDirections(row, col) {
  //let positions = processDirections(row, col);
  
  processDirections(row, col).forEach(([nextRow, nextCol, dRow, dCol]) => {
    let adjacentFoes = [];

    [nextRow, nextCol] = nextRowCol(nextRow, nextCol, dRow, dCol);

    while (boundaries(nextRow, nextCol)) {
      let nextIndex = getIndex(nextRow, nextCol);
      let src = imgSrc(nextIndex);

      if (isFriend(src)) {
        flipCellToFriend(adjacentFoes);

        break;
      } else if (isFoe(src)) {
        adjacentFoes.push(nextIndex);
      } else {

        break;
      }

      [nextRow, nextCol] = nextRowCol(nextRow, nextCol, dRow, dCol);
    }
  });
}

function flipCellToFriend(adjacentFoes) {
  const currentFriend = friend(); //Had to initiate this because "imgElement.src = friend()" wasnt working
  if (adjacentFoes.length > 0) {
    adjacentFoes.forEach(index => {
      const imgElement = document.getElementById(`box-image-${index}`);
      imgElement.src = currentFriend;
    });
  }
}


function scanLegalMoves() {
  clearLegalMoves();
  let legalMoves = [];

  for (let i = 1; i <= size * size; i++) {
    let imgElement = document.getElementById(`box-image-${i}`);

    if(imgElement) {
      let src = imgSrc(i);

      if (isUnplayed(src)) {
        //let [row, col] = rowCol(i);
        //let positions = processDirections(row, col);
        //let positions = processDirections(...rowCol(i)); //I got the spread operator in there!...
        //"The spread operator allows an array to be expanded in places where multiple arguments are expected."
        //Array "destructuring" passes the returned values as separate arguments.
        processDirections(...rowCol(i)).forEach(([nextRow, nextCol, dRow, dCol]) => {
          let potentialFoes = [];

          while (boundaries(nextRow, nextCol)) {
            let nextSrc = imgSrc(getIndex(nextRow, nextCol));

            if (isFoe(nextSrc)) {
              potentialFoes.push(getIndex(nextRow, nextCol));
            } else if (isFriend(nextSrc)) {
              if (potentialFoes.length > 0) {
                imgElement.src = 'legal.jpeg';
              }

              break;
            } else {

              break;
            }

            [nextRow, nextCol] = nextRowCol(nextRow, nextCol, dRow, dCol);
          }
        });
      }
    }
  }
}

function clearLegalMoves() {
  for (let i = 1; i <= (size * size); i++) {
    let imgElement = document.getElementById(`box-image-${i}`);
    if (imgElement && imgElement.src.includes('legal.jpeg')) {
      imgElement.src = 'placeholder_image.jpg';
    }
  }
}

/*

/// The logic/code that calls this function is not working... yet. The goal is to increment 'clicked' when a player
// has no legal moves available. This will cause the current player to lose their turn.

function legalMovesAvailable() {
  const [whiteScore, blackScore, empty, legalScore] = calcScore();
  console.log(`Legal moves available: ${legalScore > 0}`);            // Console log
  return (legalScore > 0);
}
*/

/* Execution starts here */
changeBanner();
updateButton();
