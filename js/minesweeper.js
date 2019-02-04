// <!-- /////////// -->
// <!-- Mine Sweepr -->
// <!-- /////////// -->

'use strict';
console.clear();
localStorage.clear();

const MINE = '<img class="mine" src="img/MINE2.png"/>'
const audioPop = new Audio('sound/minepop.mp3');
const gLevels = [
    { idx: 0, name: 'easy', size: 5, mines: 2 },
    { idx: 1, name: 'intermediate', size: 6, mines: 5 },
    { idx: 2, name: 'hard', size: 8, mines: 15 },
    { idx: 3, name: 'hardcore', size: 10, mines: 30 },
]
var gLevel = gLevels[0];

var gBoardSize = gLevel.size;
var gNumOfMines = gLevel.mines;
var gEmptyCells = [];
var gMines = [];
var gModel;
var gUserMoves;
var gInitNegs;
var gNextCellIdx;
var startTime;
var gUpdateTime;
var gHintModeOn;
var gHintUsed;
var gHintsLeft;
var gShowMines;

var gBoard;


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hideEndModal: false
}



////////////////////
//// initGame //////
////////////////////

function initGame() {
    console.log('end modal should be closed?', gGame.hideEndModal)
    // if (!gGame.hideEndModal) toggleEndModal();
    // hideEndModal();

    hideElement('end-modal-container');
    hideElement('hint');
    hideElement('player-name');
    changeSmiley('Default');
    gHintModeOn = false;
    gHintUsed = 0;
    gHintsLeft = 4;
    clearTimeOnDom();
    console.log('gShowMines: ', gShowMines)
    clearTimeout(gShowMines);
    gShowMines = null;
    console.log('gShowMines: ', gShowMines)
    gNextCellIdx = 100;
    startTime = 0;
    gUserMoves = 0;
    gMines = [];
    gEmptyCells = [];
    gModel = [];
    gGame.markedCount = 0;
    gBoard = createEmptyBoard();
    stopTimer();
    console.table(gBoard);
    updateMinesCounter()
    renderBoard(gBoard);
    gGame.isOn = true;
}



function updateMinesCounter() {
    var elMinesCounter = document.querySelector('.mines-counter');
    elMinesCounter.innerText = gNumOfMines - gGame.markedCount;
}

function toggleSmiley() {
    var elSmiley = document.getElementById('smiley-container');
    elSmiley.innerHTML = `<img id="smiley" onclick="toggleSmiley()" class="smiley" src="img/smileyOh.png">`
    if (gGame.isOn) {
        setTimeout(() => {
            elSmiley.innerHTML = `<img id="smiley" onclick="toggleSmiley()" class="smiley" src="img/smileyDefault.png">`
        }, 300);
    }
}

function changeSmiley(state) {
    var elSmiley = document.getElementById('smiley-container');
    elSmiley.innerHTML = `<img id="smiley" onclick="toggleSmiley()" class="smiley" src="img/smiley${state}.png">`
    console.log(`i am ${state} now!`)
}




/* 
Builds the board
Set mines at random locations Call setMinesNegsCount() Return the created board
*/

function createEmptyBoard() {
    var board = [];
    for (let i = 0; i < gBoardSize; i++) {
        board.push([]);
        for (let j = 0; j < gBoardSize; j++) {
            var cell = {
                id: gNextCellIdx++,
                position: { i: i, j: j },
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                color: null
            };
            board[i][j] = cell;
            gEmptyCells.push(cell);
        }
    }
    return board;
}


//TO_DO buildBoard - Builds the board  (maybe placeMinesOnboard is a better name)
//Set mines at random locations Call setMinesNegsCount() Return the created board
// placing mines except for the first clicked cell and it's immediate neighbors (!)


function placeMinesOnBoardModel(gNumOfMines) {
    for (let i = 0; i < gNumOfMines; i++) {
        var randEmptyCellIdx = getRandomInt(0, gEmptyCells.length - 1);
        var randCellI = gEmptyCells[randEmptyCellIdx].position.i;
        var randCellJ = gEmptyCells[randEmptyCellIdx].position.j;
        var newMineCell = gBoard[randCellI][randCellJ];
        newMineCell.isMine = true;
        gMines.push(newMineCell);
        gEmptyCells.splice(randEmptyCellIdx, 1);
    }
}


// Counts for each cell the number of neigbors containing mines
function setMinesNegsCount() {
    for (let i = 0; i < gBoardSize; i++) {
        for (let j = 0; j < gBoardSize; j++) {
            var negMines = countNegsMines(gBoard, i, j);
            var cell = gBoard[i][j];
            cell.minesAroundCount = negMines;
            cell.color = getNumColor(negMines);
        }
    }
}



// Creating an assisting model of only the cell items (MINE/FLOOR/COUNT)
function renderOnlyModel() {
    var model = [];
    for (let i = 0; i < gBoardSize; i++) {
        model.push([])
        for (let j = 0; j < gBoardSize; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine) {
                model[i][j] = MINE;
            } else if (cell.minesAroundCount === 0) {
                model[i][j] = '';
            } else {
                model[i][j] = cell.minesAroundCount;
            }
        }
    }
    console.log('Final model :')
    console.table(model);
    return model;
}




// Renders the board as a <table> to the page
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var domItem;
            if (cell.isMine) {
                domItem = MINE
            } else if (cell.minesAroundCount === 0) {
                domItem = '';
            } else {
                domItem = cell.minesAroundCount;
            }
            strHTML +=
                `<td  
                class="cell"
                oncontextmenu="cellRightClicked(this,event,${i},${j})" 
                onclick="cellClicked(${i},${j})"
                onDblclick="cellDbClicked(${i},${j})"
                >
                <img id="cover-${i}-${j}" onclick="cellClicked(${i},${j})"  class="cover show" src="img/cover40.png"/>
                    <span class="num" style="color:${cell.color}">${domItem}</span>
                </td>`;
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}



// Creating an array of all possible neighbors of a given cell
// useful in order to exclude all the first clicked cell negs from placing mines initially 
// also in order to reveal all negs of a double clicked cell
function getCellNegs(cellI, cellJ) {
    var cellNegs = [];
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // if (i === initI && j === initJ) continue;
            if (j < 0 || j >= gBoard[0].length) continue;
            var cellNeg = gBoard[i][j];
            cellNegs.push(cellNeg);
        }
    }
    // console.log('cell: ', cellI, ',', cellJ);
    // console.log('negs: ', cellNegs);
    return cellNegs;
}



function revealAllNegs(negs) {
    for (let i = 0; i < negs.length; i++) {
        var negI = negs[i].position.i;
        var negJ = negs[i].position.j;
        var cell = gBoard[negI][negJ];
        if (cell.isShown) continue;
        if (cell.isMarked) continue;
        showCell(negI, negJ);
        // if (cellDbClicked) {
        //     cellClicked()
        // }
    }
    // print('done exposing negs');
}

function coverAllNegs(negs) {
    for (let i = 0; i < negs.length; i++) {
        var negI = negs[i].position.i;
        var negJ = negs[i].position.j;
        var cell = gBoard[negI][negJ];
        if (cell.isShown) continue;
        coverCell(negI, negJ);
    }
    // print('done covering negs');
}


function print(msg) {
    console.log(msg);
}




// Removing the initial cell and its neighbors from the empty cells array
function removeInitNegsFromEmptyCells() {
    for (let idx = 0; idx < gInitNegs.length; idx++) {
        var initCellId = gInitNegs[idx].id;
        var emptyCellIdx = getEmptyCellIdxById(initCellId);
        gEmptyCells.splice(emptyCellIdx, 1);
    }

}


//////////////////////
//Click Functions
//////////////////////


// Called when a cell (td) is clicked
function cellClicked(i, j) {
    // debugger;
    var cell = gBoard[i][j]
    if (!gGame.isOn || cell.isMarked || cell.isShown) return;
    if (gUserMoves === 0) firstClickProcedures(i, j);
    if (gHintModeOn) {
        gHintUsed++
        gHintsLeft--
        useHint(i, j);
        return;
    }
    if (!cell.isShown) {
        showCell(i, j);
        revealNonMineCells(i, j);
    }
    if (cell.isMine && !gHintModeOn && gGame.isOn) {
        showCell(i, j);
        gShowMines = setInterval(showAllMines, 300);
        gameOver('deadMine')
        // declareDead()
    }
    // toggleSmiley();
    if (areAllFloorShown()) {
        setTimeout(() => {
            gameOver('winFloor');
        }, 1000);
    }
    gUserMoves++;
}


function firstClickProcedures(i, j) {
    startTime = Date.now();
    localStorage.setItem('startTime', startTime);
    gUpdateTime = setInterval(showTime, 1000);
    gInitNegs = getCellNegs(i, j);
    removeInitNegsFromEmptyCells();
    placeMinesOnBoardModel(gNumOfMines);
    setMinesNegsCount();
    gModel = renderOnlyModel();
    renderBoard(gBoard);
    showElement('hint');
}



// Right click behavior toggles marked cell
function cellRightClicked(elCell, ev, i, j) {
    var cell = gBoard[i][j]
    if (cell.isShown) return;
    var coverImg = (!cell.isMarked) ? 'mark40' : 'cover40';
    (cell.isMarked) ? gGame.markedCount-- : gGame.markedCount++;
    cell.isMarked = !cell.isMarked;
    updateMinesCounter();
    renderCell(elCell, i, j, coverImg);
    if (areAllMinesMarked()) {
        setTimeout(() => {
            gameOver('winMark')
        }, 1000);
    }
}



// Cell is doubleClicked --> exposing all unmarked neighbors, including mines
function cellDbClicked(i, j) {
    var cell = gBoard[i][j];
    if (!cell.isShown) return;
    if (cell.minesAroundCount === 0) return;
    var markedNegs = countNegsMarks(gBoard, i, j);
    if (cell.minesAroundCount == markedNegs) {
        var cellNegs = getCellNegs(i, j)
        for (let n = 0; n < cellNegs.length; n++) {
            var negI = cellNegs[n].position.i;
            var negJ = cellNegs[n].position.j;
            var negCell = gBoard[negI][negJ];
            if (negCell.isShown) continue;
            if (negCell.isMarked) continue;
            cellClicked(negI, negJ);
        }
    }
}

function renderCell(elCell, i, j, coverImg) {
    var domItem = gModel[i][j];
    var cell = gBoard[i][j]
    var strHTML =
        `<td  
        class="cell"
        oncontextmenu="cellRightClicked(this,event,${i},${j})" 
        onclick="cellClicked(${i},${j})"
        onDblclick="cellDbClicked(${i},${j})"
        >
        <img id="cover-${i}-${j}" onclick="cellClicked(${i},${j})"  class="cover show" src="img/${coverImg}.png"/>
            <span class="num" style="color:${cell.color}">${domItem}</span>
        </td>`;
    elCell.innerHTML = strHTML;
}



// Exposing all floor cells until we reach a cell with 
// This is kind of magic
function revealNonMineCells(cellI, cellJ) {
    if (countNegsMines(gBoard, cellI, cellJ) !== 0) return;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[0].length) continue;
            var cell = gBoard[i][j];
            if (cell.isShown || cell.isMine) continue;
            //if (cell.isMine) continue;
            if (cell.minesAroundCount === 0) {
                showCell(i, j);
                revealNonMineCells(i, j);
            } else {
                showCell(i, j);
            }
        }
    }
}





//////////////////////
//Game over functions
//////////////////////


function gameOver(result) {
    var endMsg = 'Game Over \n'
    switch (result) {
        case 'winMark':
            changeSmiley('Win');
            checkRecord();
            endMsg += 'Well Done! - You\'ve successfully marked all the mines';
            break;
        case 'winFloor':
            changeSmiley('Win');
            checkRecord();
            endMsg += 'Well Done! - You\'ve found all the cells with no mines';
            break;
        case 'deadMine':
            changeSmiley('Dead');
            endMsg += 'Oh no! You\'ve stepped on a mine!';
            break;
        case 'deadMark':
            changeSmiley('Dead');
            endMsg += 'Oh no! You\'ve exposed a mine by mistake';
            break;
    }
    toggleEndModal(endMsg);
    gGame.isOn = false;
    stopTimer();
    clearTimeOnDom();
}


function checkRecord() {
    var endTime = Date.now();
    var gameTime = Math.round((endTime - localStorage.getItem('startTime')) / 1000);
    var bestTime = localStorage.getItem(`bestTime-${gLevel.name}`);
    if (bestTime === null) bestTime = gameTime
    if (gameTime <= +bestTime) {
        bestTime = gameTime;
        showElement('player-name');
        var elBestTime = document.getElementById(`best-time-${gLevel.name}`);
        var playerName;
        var elPlayerNameInput = document.getElementById('player-name') //.value?
        elPlayerNameInput.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                playerName = elPlayerNameInput.value;
                var elBestPlayer = document.getElementById(`best-player-${gLevel.name}`);
                localStorage.setItem(`bestTime-${gLevel.name}`, gameTime);
                localStorage.setItem(`bestPlayer-${gLevel.name}`, playerName);
                elBestTime.innerText = `${gameTime} seconds`
                elBestPlayer.innerText = playerName
            }
        });
    } else {
        hideElement('player-name');
        return;
    }
}


function stopTimer() {
    if (gUpdateTime) clearInterval(gUpdateTime);
    gUpdateTime = null;
}

function clearTimeOnDom() {
    var elTimeCounter = document.querySelector('.time-counter');
    elTimeCounter.innerText = '000'
}


function showAllMines() {
    if (gMines.length === 0) {
        clearInterval(gShowMines);
        gShowMines = null;
    } else {
        var mineI = gMines[0].position.i;
        var mineJ = gMines[0].position.j;
        audioPop.play();
        showCell(mineI, mineJ);
        gMines.shift()
        console.log('gMines: ', gMines)
    }
}


function toggleEndModal(message) {
    var elEndModal = document.querySelector('.end-modal-container');
    elEndModal.classList.toggle('hide');
    var elEndMsg = document.querySelector('.endMsg');
    elEndMsg.innerText = message;
    var elBoardContainer = document.querySelector('.board-container');
    elBoardContainer.classList.toggle('blur');
    gGame.hideEndModal = true;
}


function hideEndModal() {
    var elEndModal = document.querySelector('.end-modal-container');
    elEndModal.classList.add('hide');
    // var elEndMsg = document.querySelector('.endMsg');
    // elEndMsg.innerText = message;
    var elBoardContainer = document.querySelector('.board-container');
    elBoardContainer.classList.remove('blur');
    gGame.hideEndModal = true;
}




//////////////////////
//Basic Functions
//////////////////////

// Count nieghboring mines
function countNegsMines(board, cellI, cellJ) {
    var negsMinesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[0].length) continue;
            var cell = board[i][j];
            if (cell.isMine === true) negsMinesCount++
        }
    }
    return negsMinesCount;
}


// Count neighboring marks
function countNegsMarks(board, cellI, cellJ) {
    var negsMarksCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[0].length) continue;
            var cell = board[i][j];
            if (cell.isMarked === true) negsMarksCount++
        }
    }
    return negsMarksCount;
}


// Exposing a cell on model and dom. 
function showCell(i, j) {
    var cell = gBoard[i][j]
    if (!gHintModeOn) cell.isShown = true;
    var coverImg = document.getElementById(`cover-${i}-${j}`);
    coverImg.classList.remove('show');
    coverImg.classList.add('hide');
    // if (!gGame.isOn) return;
    // debugger;
    // if (cell.isMine && !gHintModeOn && gGame.isOn) gameOver('deadMark');
    // if (cell.isMine && !gShowMines) gameOver('deadMark');
}



// Covering up a cell (for hint mode)
function coverCell(i, j) {
    var cell = gBoard[i][j]
    cell.isShown = false;
    var coverImg = document.getElementById(`cover-${i}-${j}`);
    coverImg.classList.remove('hide');
    coverImg.classList.add('show');
}



// Hint Mode

function useHint(i, j) {
    var elHint = document.getElementById('hint');
    if (gHintsLeft === -1) {
        elHint.style.display = 'none';
        elHint.classList.add('hide');
        console.log('all hints are used')
        return;
    }
    var cellNegs = getCellNegs(i, j);
    elHint.innerText = gHintsLeft + ' hints left'
    revealAllNegs(cellNegs);
    setTimeout(() => {
        coverAllNegs(cellNegs)
        gHintModeOn = false;
    }, 1000);
}


//TO_DO - Add indication for Hint Mode being ON and that the user can safely explore
function activateHintMode() {
    console.log('hint mode on!');
    gHintModeOn = true;
}



function showTime() {
    var elTimeCounter = document.querySelector('.time-counter');
    var currTime = Date.now();
    var gameTime = ((currTime - startTime) / 1000).toFixed(0);
    if (gameTime < 10) {
        gameTime = '00' + gameTime;
    } else if (gameTime > 9 && gameTime < 100) {
        gameTime = '0' + gameTime;
    }
    document.querySelector(".time-counter").classList.remove("hidden");
    elTimeCounter.innerText = gameTime;
}



function areAllMinesMarked() {
    for (let i = 0; i < gMines.length; i++) {
        if (!gMines[i].isMarked) return false;
    }
    if (gGame.markedCount !== gNumOfMines) return false;
    return true;
}


function areAllFloorShown() {
    for (let i = 0; i < gEmptyCells.length; i++) {
        if (!gEmptyCells[i].isShown) return false
    }
    return true;
}



/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function chooseLevel() {
    console.log('i was clicked!')
    document.getElementById("myDropdown").classList.toggle("show-drop-down-menu");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show-drop-down-menu')) {
                openDropdown.classList.remove('show-drop-down-menu');
            }
        }
    }
}


function iWasClicked() {
    console.log('I was clicked!');
}


function changeLevel(gLevelIdx) {
    gLevel = gLevels[gLevelIdx];
    gBoardSize = gLevel.size;
    gNumOfMines = gLevel.mines;
    gGame.hideEndModal = true;
    initGame();
}


function nextLevel() {
    var currLevel = gLevel.idx;
    if (gLevel.idx === 3) {
        gBoardSize = +prompt('Choose board size');
        gNumOfMines = +prompt('Choose number of mines');
    } else {
        gLevel = gLevels[currLevel + 1];
        gBoardSize = gLevel.size;
        gNumOfMines = gLevel.mines;
    }
    hideElement('hint');
    initGame();
}