var numSelected = null;
var tileSelected = null;
var difficulty = "easy";

var errors = 0;

var board = [];

var solution = [];

window.onload = function() {
    getBoard();
}

function isGameOver() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const tile = document.getElementById(`${r}-${c}`);
            if (tile.innerText === "") {
                // Found an empty tile → game not finished
                return false;
            }
        }
    }

    // If we got here, all tiles are filled = game solved
    alert("Nice! You solved it!");

    // Option 1: automatically start a new puzzle
    // resetBoard();

    // Option 2: show a reset button (simpler version)
    let existing = document.getElementById("reset-button");
    if (!existing) {
        const reset = document.createElement("button");
        reset.id = "reset-button";
        reset.textContent = "New Puzzle";
        reset.addEventListener("click", resetBoard);
        // Change "controls" to whatever container makes sense for you
        document.getElementById("controls").appendChild(reset);
    }

    return true;
}


function setDifficultyE() {
    difficulty = "easy";
    resetBoard();
}

function setDifficultyM() {
    difficulty = "medium";
    resetBoard();
}

function setDifficultyH() {
    difficulty = "hard";
    resetBoard();
}

function resetBoard() {
    if(document.getElementById("reset-button")) {
        document.getElementById("reset-button").remove();
    }
    board = [];
    solution = [];
    errors = 0;
    numSelected = null;
    tileSelected = null;
    document.getElementById("errors").innerText = errors;
    //the number tiles with classes must be returned with getElementsByClassName
    //this returns an array
    //so while loop then remove each individual one
    const numbers = document.getElementsByClassName("number");
    while(numbers.length > 0) {
        numbers[0].remove();
    }
    const tiles = document.getElementById("board");
    tiles.innerHTML = "";
    getBoard();
}

// replace your current getBoard with this (and you can remove "async" keyword)
function getBoard() {
    // 1) Base valid solved Sudoku
    let base = [
        [1,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,3,4,5,6,7,8,9,1],
        [5,6,7,8,9,1,2,3,4],
        [8,9,1,2,3,4,5,6,7],
        [3,4,5,6,7,8,9,1,2],
        [6,7,8,9,1,2,3,4,5],
        [9,1,2,3,4,5,6,7,8]
    ];

    // Helper to shuffle an array
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Shuffle rows within each 3-row band
    function shuffleRows(grid) {
        for (let band = 0; band < 3; band++) {
            const rows = shuffleArray([0,1,2]);
            const start = band * 3;
            const original = grid.slice(start, start + 3);
            for (let i = 0; i < 3; i++) {
                grid[start + i] = original[rows[i]];
            }
        }
    }

    // Shuffle columns within each 3-column stack
    function shuffleCols(grid) {
        for (let stack = 0; stack < 3; stack++) {
            const cols = shuffleArray([0,1,2]);
            const start = stack * 3;
            for (let r = 0; r < 9; r++) {
                const original = grid[r].slice(start, start + 3);
                for (let i = 0; i < 3; i++) {
                    grid[r][start + i] = original[cols[i]];
                }
            }
        }
    }

    // Shuffle 3-row bands (0–2, 3–5, 6–8)
    function shuffleBands(grid) {
        const bands = shuffleArray([0,1,2]);
        const newGrid = [];
        for (const b of bands) {
            newGrid.push(...grid.slice(b * 3, b * 3 + 3));
        }
        return newGrid;
    }

    // Shuffle 3-column stacks (0–2, 3–5, 6–8)
    function shuffleStacks(grid) {
        const stacks = shuffleArray([0,1,2]);
        const newGrid = grid.map(row => []);
        for (let r = 0; r < 9; r++) {
            for (const s of stacks) {
                newGrid[r].push(...grid[r].slice(s * 3, s * 3 + 3));
            }
        }
        return newGrid;
    }

    // 2) Apply random transformations to base to get a random valid solution
    shuffleRows(base);
    shuffleCols(base);
    base = shuffleBands(base);
    base = shuffleStacks(base);

    // This is your solved grid
    solution = base.map(row => row.join(""));

    // 3) Decide how many cells to remove based on difficulty
    let removeCount;
    if (difficulty === "easy") {
        removeCount = 40;   // more clues
    } else if (difficulty === "medium") {
        removeCount = 50;
    } else if (difficulty === "hard") {
        removeCount = 60;   // fewer clues
    } else {
        removeCount = 50;   // default to medium-ish
    }

    // 4) Make a copy to turn into the puzzle
    const puzzle = base.map(row => row.slice());

    while (removeCount > 0) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            removeCount--;
        }
    }

    // 5) Save to your global "board" as strings with '0' for blanks
    board = puzzle.map(row => row.join(""));

    // 6) Now build the UI from board + solution
    setGame();
}
 

function setGame() {
    // bottom digits 1 - 9
    for (let i = 1; i <= 9; i++) {
        // new div as js variable 'number'
        // id of that div is set with .id
        // text on the div (<div>here</div>) set with .innerText
        // class of that div is set with .classList.add()
        // placement of this created div is set within another div (div with id 'digits' in html file)
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    // board 9x9
    for(let r = 0; r < 9; r++) {
        for(let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            if(board[r][c] != '0') {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }
            if(r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if(c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);
        }
    }
}

function selectNumber() {
    if(numSelected != null) {
        numSelected.classList.remove("number-selected");
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
}

function selectTile() {
    if(numSelected) {
        if(this.innerText != "") {
            return;
        }
        let coords = this.id.split("-"); //["0", "0"]
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if(solution[r][c] == numSelected.id) {
            this.innerText = numSelected.id;
        }
        else {
            errors += 1;
            document.getElementById("errors").innerText = errors;
        }
    }
    isGameOver();
}