
// Random int in range
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
 

// Rertrieve an empty cell idx by a given cell id
function getEmptyCellIdxById(id) {
    var idx = 0;
    for (let i = 0; i < gEmptyCells.length; i++) {
        if (gEmptyCells[i].id === id) {
            idx = i;
        }
    }
    return idx;
}


function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  function getNumColor(num) {
    var color;
    switch (num) {
        case 1:
            color = '#1435ef';
            break;
        case 2:
            color = '#528742';
            break;
        case 3:
            color = '#eb3223';
            break;
        case 4:
            color = '#17227f';
            break;
        case 5:
            color = '#72160e';
            break;
        case 6:
            color = '#357a7b';
            break;
        case 7:
            color = '#030303';
            break;
        case 8:
            color = '#7f7f7f';
            break;
        case 0:
            color = '#AARRGGBB';
            break;
        default:
            color = '#AARRGGBB';
            break;
    }
    // 1 '#1435ef'
    // 2 '#528742'
    // 3 '#eb3223'
    // 4 '#17227f'
    // 5 '#72160e'
    // 6 '#357a7b'
    // 7 '#030303'
    // 8 '#7f7f7f'
    return color;
}


function hideElement(id) {
    var element = document.getElementById(id);
    if (!element.classList.contains('hide')) {
        element.classList.add('hide');
    }
}


function showElement(id) {
    var element = document.getElementById(id);
    if (element.classList.contains('hide')) {
        element.classList.remove('hide');
    }
}