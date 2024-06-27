let clicked = 999;
let gridCreated = false;
let size = -1;
let undoStack = [];
const directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const player = ['black.jpeg', 'white.jpeg'];

function setSize() {
  size = parseInt(document.getElementById('gridSize').value);

  if (isNaN(size)) {
    alert('Please choose a grid size');
    return false;
  }
  return true;
}

function createGrid() {
  size = parseInt(document.getElementById('gridSize').value);
  if (!setSize()) return;

  const container = document.querySelector('.image-container');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  const cellSize = 600 / size;

  for (let i = 1; i <= size * size; i++) {
      const div = document.createElement('div');
      div.className = 'image-box';
      div.style.width = `${cellSize}px`;
      div.style.height = `${cellSize}px`;
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
  lastPlayed(0, 0);
  scanLegalMoves();
  updateScores();
}

// the below ChangeImage function tries to incorporate noLegalMovesAvailale logic. It's not there yet.
/*
function changeImage(index) {
  updateScores();
  if (!legalMovesAvailable()) {
    alert('No legal moves available, your turn is skipped');
    skipped += 1;
    clicked += 1;
    changeBanner();
    scanLegalMoves();
    updateScores();
     // Increment clicked for the skipped turn
    scanLegalMoves();
  } else {
    const img = document.getElementById(`box-image-${index}`);
    if (img.src.includes('legal.jpeg')) {
      undoStack.push(captureLayout());          //An array of arrays!!!
      
      const [row, col] = rowCol(index);
      let [friend, foe, unplayed, legal] = friendOrFoe();
      
      if (clicked % 2 == 0) {
          img.src = 'black.jpeg';
          img.alt = 'black piece';
      } else {
          img.src = 'white.jpeg';
          img.alt = 'white piece';
      }


      clicked += 1;
      lastPlayed(row, col)
      scanDirections(row, col, friend, foe);
      changeBanner();
      scanLegalMoves();
      updateScores();
    }
  }
}
*/

function changeImage(index) {
  updateScores();
  const img = document.getElementById(`box-image-${index}`);
  if (img.src.includes('legal.jpeg')) {
    undoStack.push(captureLayout());                    //An array of arrays!!!
    
    const [row, col] = rowCol(index);
    let [friend, foe, unplayed, legal] = friendOrFoe();
    setImageSrc(img);                                   // refactored/added
    clicked += 1;
    lastPlayed(row, col)
    scanDirections(row, col, friend, foe);
    changeBanner();
    scanLegalMoves();
    updateScores();
  }
}

// I think this function can be tied to whomever is friend. It works now but it can probably be better?

function setImageSrc(img) {
  if (clicked % 2 == 0) {
    img.src = 'black.jpeg';
    img.alt = 'black piece';
  } else {
    img.src = 'white.jpeg';
    img.alt = 'white piece';
  }
  return [img.src, img.alt];
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
  if (!setSize()) {
      alert('Please choose a grid size');
      return;
  }

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
  const firstBlack = halfCube - (size/2) + 1;
  const secondBlack = halfCube + (size/2);
  const secondWhite = halfCube + (size/2) + 1;
  return [firstWhite, firstBlack, secondBlack, secondWhite];
}

function setBoard() {
  const [firstWhite, firstBlack, secondBlack, secondWhite] = getDimensions();

  document.getElementById(`box-image-${firstWhite}`).src = 'white.jpeg';
  document.getElementById(`box-image-${firstWhite}`).alt = 'white piece';
  
  document.getElementById(`box-image-${firstBlack}`).src = 'black.jpeg';
  document.getElementById(`box-image-${firstBlack}`).alt = 'black piece';
  
  document.getElementById(`box-image-${secondBlack}`).src = 'black.jpeg';
  document.getElementById(`box-image-${secondBlack}`).alt = 'black piece';
  
  document.getElementById(`box-image-${secondWhite}`).src = 'white.jpeg';
  document.getElementById(`box-image-${secondWhite}`).alt = 'white piece';

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

// Tester function to display contents of the .src for the last played,
// given the row, col
/*
function srcDetails (row, col) {
  let index = getIndex(row, col);
  let imgElement = document.getElementById(`box-image-${index}`)

  if (imgElement) {
    let srcContent = imgElement.src.split('/').pop(); // Only takes the last part of the file path
    return srcContent;
  } else {
    return null;
  }
}
*/

function getIndex(row, col) {
  
  let index = ((row - 1) * size) + col;
  document.getElementById('index').innerText = index;
  return index;
}

function friendOrFoe() {
  const unplayed = 'placeholder_image.jpg';
  const legal = 'legal.jpeg';
  let friend = player[clicked % 2];
  let foe = player[(clicked % 2 + 1) % 2];

  return [friend, foe, unplayed, legal];
}

function boundaries(nextRow, nextCol) {
  return ((nextRow >= 1) && (nextRow <= size) && (nextCol >= 1) && (nextCol <= size));
}

function processDirections(row, col, callback) {
  directions.forEach(direction => {
    const [dRow, dCol] = direction;
    let nextRow = row + dRow;
    let nextCol = col + dCol;
    callback(nextRow, nextCol, dRow, dCol);
  });
}

function scanDirections(row, col, friend, foe) {
  processDirections(row, col, (nextRow, nextCol, dRow, dCol) => {
  
    let adjacentFoes = [];

    while (boundaries(nextRow, nextCol)) {
      let nextIndex = getIndex(nextRow, nextCol);
      let imgElement = document.getElementById(`box-image-${nextIndex}`);
    
      if (!imgElement) {
        break;
      }

      let src = imgElement.src.split('/').pop();

      if (src.includes(friend)) {
        flipCellToFriend(adjacentFoes, friend);

        break; // Exit the while loop once friend is found and foes are flipped
      } else if (src.includes(foe)) {
        adjacentFoes.push(nextIndex);
      } else {

        break; // Exit if an unplayed or legal cell is found
      }

      nextRow += dRow;
      nextCol += dCol;
    }
  });
}

function flipCellToFriend(adjacentFoes, friend) {
  if (adjacentFoes.length > 0) {
    adjacentFoes.forEach(index => {
      document.getElementById(`box-image-${index}`).src = friend;
    });
  }
}

function scanLegalMoves() {
  let [friend, foe, unplayed, legal] = friendOrFoe();
  clearLegalMoves();
  let legalMoves = [];

  for (let i = 1; i <= size * size; i++) {
    let imgElement = document.getElementById(`box-image-${i}`);

    if(imgElement) {  //if valid
      let src = imgElement.src.split('/').pop();  //Get the filename of the pic

      if (src.includes(unplayed)) {   //Dont need to check anything other than unplayed
        let [row, col] = rowCol(i);

        processDirections(row, col, (nextRow, nextCol, dRow, dCol) => {
          let potentialFoes = [];

          while (boundaries(nextRow, nextCol)) {
            let nextIndex = getIndex(nextRow, nextCol);
            let nextImgElement = document.getElementById(`box-image-${nextIndex}`);

            if (!nextImgElement) {
              break;
            }

            let nextSrc = nextImgElement.src.split('/').pop();

            if (nextSrc.includes(foe)) {
              potentialFoes.push(nextIndex);
            } else if (nextSrc.includes(friend)) {
              if (potentialFoes.length > 0) {
                imgElement.src = 'legal.jpeg';
              }
              break;
            } else {
              break;
            }

            nextRow += dRow;
            nextCol += dCol;
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

function legalMovesAvailable() {
  const [whiteScore, blackScore, empty, legalScore] = calcScore();
  console.log(`Legal moves available: ${legalScore > 0}`); // Debugging log
  return (legalScore > 0);
}


/* Execution starts here */
changeBanner();
updateButton();
