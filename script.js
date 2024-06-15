let turn = 'black';
let clicked = 999;
let gridCreated = false;

function createGrid() {
  turn = 'black';
  const size = parseInt(document.getElementById('gridSize').value);
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
}

function changeImage(index) {
  const img = document.getElementById(`box-image-${index}`);
  if (img.src.includes('placeholder_image.jpg')) {
    const size = parseInt(document.getElementById('gridSize').value);
    const [row, col] = rowCol(index);
    //scanDirections(row, col);

    console.log(`Turn before change: ${turn}`);

    //let piecesTurned = scanDirections(row, col);

/*
    if (!piecesTurned) {
      alert('Invalid move - No pieces turned!');
      return;
    }
*/
    if (turn === 'black') {
        img.src = 'black.jpeg';
        img.alt = 'black piece';
        turn = 'white';
    } else {
        img.src = 'white.jpeg';
        img.alt = 'white piece';
        turn = 'black';
    }

    console.log(`Turn after change: ${turn}`);

    clicked += 1;
    lastPlayed(row, col);
    srcDetails(row, col);
    scanDirections(row, col);
    friendOrFoe();
    changeBanner();
    updateScores();

/*
    if (endGame()) {
      if (blackScore > whiteScore) {
        alert('Game over - Black WINS!!!');
      } else if (blackScore < whiteScore) {
        alert('Game over - White WINS!!!');
      } else if (blackScore === whiteScore) {
        alert('Game over - Tie game');
      }
      
    }

    */
  }
}


function changeBanner() {
  const promptElement = document.getElementById('banner');
  if (clicked === 999) {
      promptElement.innerHTML = "Choose board size and click Create Grid";
  } else if (clicked % 2 > 0) {
      promptElement.innerHTML = "White's Turn";
  } else if (clicked % 2 == 0) {
      promptElement.innerHTML = "Black's Turn";
  } else
      promptElement.innerHTML = "something is wrong here in the changeBanner fucntion";
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
  const size = parseInt(document.getElementById('gridSize').value);
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

function getDimensions(size) {
  const halfCube = (size * size) / 2;
  const firstWhite = halfCube - (size/2);
  const firstBlack = halfCube - (size/2) + 1;
  const secondBlack = halfCube + (size/2);
  const secondWhite = halfCube + (size/2) + 1;
  return [firstWhite, firstBlack, secondBlack, secondWhite];
}

function setBoard() {
  const size = parseInt(document.getElementById('gridSize').value);
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
  const size = parseInt(document.getElementById('gridSize').value);
  let whiteScore = 0;
  let blackScore = 0;
  let empty = 0;
  for (let i = 1; i <= size * size; i++) {
    const img = document.getElementById(`box-image-${i}`);
    if (img.src.includes('white.jpeg')) {
      whiteScore += 1;
    } else if (img.src.includes('black.jpeg')) {
      blackScore += 1;
    } else if (img.src.includes('placeholder_image.jpg')) {
      empty += 1;
    }
  }
  return [whiteScore, blackScore, empty];
}

function updateScores() {
  const [whiteScore, blackScore, empty] = calcScore();
  document.getElementById('whiteScore').innerText = whiteScore;
  document.getElementById('blackScore').innerText = blackScore;
  document.getElementById('empty').innerText = empty;
}

function rowCol (index) {
  const size = parseInt(document.getElementById('gridSize').value);
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
// given the index

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
  const size = parseInt(document.getElementById('gridSize').value);
  let index = ((row - 1) * size) + col;
  document.getElementById('index').innerText = index;
  return index;
}

function friendOrFoe(turn) {
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
  const size = parseInt(document.getElementById('gridSize').value);
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

  //return piecesTurned;
}



function endGame() {
  const size = parseInt(document.getElementById('gridSize').value);
  const [whiteScore, blackScore, empty] = calcScore();
  if (clicked === ((size * size) - 4)) {
    return true;
  } else if ((whiteScore + blackScore) === 36) {
    return true;
  }
  return false;
}







/* Execution starts here */
changeBanner();
updateButton();
