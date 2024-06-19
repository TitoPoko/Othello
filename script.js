let clicked = 999;
let gridCreated = false;
let size = 0;
let undoStack = [];
let blackLegalMoves = true;
let whiteLegalMoves = true;

function createGrid() {
  turn = 'black';
  size = parseInt(document.getElementById('gridSize').value);
  if (size === 'null') {
      alert('Please choose a grid size');
      return;
  }

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
  updateScores();
  lastPlayed(0, 0);
  scanLegalMoves();
}

function changeImage(index) {
  //scanLegalMoves();
  const img = document.getElementById(`box-image-${index}`);
  if (img.src.includes('legal.jpeg')) {
    undoStack.push(captureLayout());          //An array of arrays!!!
    
    const [row, col] = rowCol(index);
    //scanDirections(row, col);

    //console.log(`Turn before change: ${turn}`);

    //let piecesTurned = scanDirections(row, col);

/*
    if (!piecesTurned) {
      alert('Invalid move - No pieces turned!');
      return;
    }
*/
    if (clicked % 2 == 0) {
        img.src = 'black.jpeg';
        img.alt = 'black piece';
        turn = 'white';
    } else {
        img.src = 'white.jpeg';
        img.alt = 'white piece';
        turn = 'black';
    }

    //console.log(`Turn after change: ${turn}`);

    clicked += 1;
    lastPlayed(row, col);
    srcDetails(row, col);
    scanDirections(row, col);
    friendOrFoe();
    changeBanner();
    updateScores();
    scanLegalMoves();

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
    
  //console.log(`LOG: From changeBanner, Endgame = ${endGame()}.`);
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
  if (gridCreated) {
      restartGame();
  } else {
      createGrid();
  }
}

function restartGame() {
  if (size === 'null') {
      alert('Please choose a grid size');
      return;
  }

  gridCreated = false;
  turn = 'black';
  clicked = 0;
  const container = document.querySelector('.image-container');
  container.innerHTML = '';
  changeBanner();
  updateButton();
  createGrid();
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
  const [firstWhite, firstBlack, secondBlack, secondWhite] = getDimensions(size);

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
    lastPlayed(0, 0);     // This is in here because it inc/decrements clicked.
    scanLegalMoves();

    console.log('Move undone.');

  } else {

    console.log('No move to undo.');

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

function srcDetails (row, col) {
  let index = getIndex(row, col);
  let imgElement = document.getElementById(`box-image-${index}`)

  if (imgElement) {
    let srcContent = imgElement.src.split('/').pop(); // Only takes the last part of the file path
    //document.getElementById('srcContent').innerText = srcContent;
    //console.log(srcContent);
    return srcContent;
  } else {
    console.error(`Element with ID 'box-image-${index}' AINT found.`);
    return null;
  }
}


function getIndex(row, col) {
  
  let index = ((row - 1) * size) + col;
  document.getElementById('index').innerText = index;
  return index;
}

function friendOrFoe() {
  let friend, foe;
  const unplayed = 'placeholder_image.jpg';
  //const legal = 'legal.jpeg';

  if (clicked % 2 == 0) {
    friend = 'white.jpeg';
    foe = 'black.jpeg';
  } else if (clicked % 2 > 0) {
    friend = 'black.jpeg';
    foe = 'white.jpeg';
  }

  //document.getElementById('friend').innerText = friend;
  //document.getElementById('foe').innerText = foe;
  return [friend, foe, unplayed];
}

function scanDirections(row, col) {
  
  let [friend, foe, unplayed] = friendOrFoe();
  const directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  //let piecesTurned = false;

  directions.forEach(direction => {
    const [dRow, dCol] = direction;
    let nextRow = row + dRow;
    let nextCol = col + dCol;
    let adjacentFoes = [];

    while ((nextRow >= 1) && (nextRow <= size) && (nextCol >= 1) && (nextCol <= size)) {
      let nextIndex = getIndex(nextRow, nextCol);
      let imgElement = document.getElementById(`box-image-${nextIndex}`);
    
      if (!imgElement) {
        break;
      }

      let src = imgElement.src.split('/').pop(); // removes filepath, leaves only filename and extension

      if (src.includes(friend)) {
        if (adjacentFoes.length > 0) {
          adjacentFoes.forEach(([r, c]) => {
            let index = getIndex(r, c);
            document.getElementById(`box-image-${index}`).src = friend;
          });
          //piecesTurned = true;
        }
        break; // Exit the while loop once friend is found and foes are flipped
      } else if (src.includes(foe)) {
        adjacentFoes.push([nextRow, nextCol]);
      } else if (src === unplayed) {
        break; // Exit if an unplayed cell is found
      }

      nextRow += dRow;
      nextCol += dCol;
    }
  });
}

function scanLegalMoves() {
  let [friend, foe, unplayed] = friendOrFoe();
  const directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  clearLegalMoves();
  let legalMoves = [];

  for (let i = 1; i <= size * size; i++) {
    let imgElement = document.getElementById(`box-image-${i}`);

    if(imgElement) {  //if valid
      let src = imgElement.src.split('/').pop();  //Get the filename of the pic

      if (src.includes(unplayed)) {   //Dont need to check anything other than unplayed
        let [row, col] = rowCol(i);

        directions.forEach(direction => {
          const [dRow, dCol] = direction;
          let nextRow = row + dRow;
          let nextCol = col + dCol;
          let potentialFoes = [];

          while ((nextRow >= 1) && (nextRow <= size) && (nextCol >= 1) && (nextCol <= size)) {
            let nextIndex = getIndex(nextRow, nextCol);
            let nextImgElement = document.getElementById(`box-image-${nextIndex}`);

            if (!nextImgElement) {
              break;
            }

            let nextSrc = nextImgElement.src.split('/').pop();

// Somehow my logic is working ok, but the friend/foe is swapped and the legal moves are marked wrong
            
            if (nextSrc.includes(friend)) {   //This should say "friend"
              potentialFoes.push(nextIndex);
            } else if (nextSrc.includes(foe)) {   //This should say "foe"
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


/* Execution starts here */
changeBanner();
updateButton();
