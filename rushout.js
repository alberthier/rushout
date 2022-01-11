"use strict";

const BOARD_CELL_SIZE = 40

const CAR_HORIZONTAL = 1;
const CAR_VERTICAL = 2;

const CAR_COLORS = {
    "A": "#8ae234",
    "B": "#f57900",
    "C": "#729fcf",
    "D": "#fa66cb",
    "E": "#75507b",
    "F": "#4e9a06",
    "G": "#b3b3b3",
    "H": "#e9b96e",
    "I": "#edd400",
    "J": "#8f5902",
    "K": "#6c8544",
    "O": "#c4a000",
    "P": "#5c3566",
    "Q": "#204a87",
    "R": "#73d216",
    "X": "#cc0000",
}

class Car {

    constructor(id, x, y, orientation, size, isMain) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.orientation = orientation
    }

    get isMain() {
        return this.id === "X";
    }

    get width() {
        return this.orientation == CAR_HORIZONTAL ? this.size : 1;
    }

    get height() {
        return this.orientation == CAR_VERTICAL ? this.size : 1;
    }

    intersects = (x, y) => {
        if (this.orientation == CAR_HORIZONTAL) {
            if (this.y !== y) {
                return false;
            }
            return this.x <= x && x <= (this.x + this.size - 1)
        } else {
            if (this.x !== x) {
                return false;
            }
            return this.y <= y && y <= (this.y + this.size - 1)
        }
    }
}

class Board {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cars = [];
        this.mainCar = null;
    }

    addCar = (id, x, y, orientation, size) => {
        const car = new Car(id, x, y, orientation, size);
        this.cars.push(car);
        if (car.isMain) {
            this.mainCar = car;
        }
        return car;
    }

    loadBoard = (boardText) => {
        const cars = {};

        for (let lineIdx = 0; lineIdx < 6; lineIdx++) {
            for (let cellIdx = 0; cellIdx < 6; cellIdx++) {
                const cell = boardText[lineIdx * 6 + cellIdx];
                if (cell != ".") {
                    if (cell in cars) {
                        const car = cars[cell];
                        if (car.y != lineIdx) {
                            car.orientation = CAR_VERTICAL;
                        }
                        car.size++;
                    } else {
                        const car = this.addCar(cell, cellIdx, lineIdx, CAR_HORIZONTAL, 1);
                        cars[cell] = car;
                    }
                }
            }
        }
    }

    get isSolved () {
        return this.mainCar.x === (this.width - this.mainCar.size);
    }

    toString = () => {
        let result = [];
        for (let i = 0; i < this.width * this.height; ++i) {
            result.push(".");
        }
        for (let car of this.cars) {
            for (let w = 0; w < car.size; ++w) {
                if (car.orientation === CAR_HORIZONTAL) {
                    result[car.x + w + (car.y * this.width)] = car.id;
                } else {
                    result[car.x + ((car.y + w) * this.width)] = car.id;
                }
            }
        }
        return result.join("");
    }

    toStringLines = () => {
        let result = [];
        for (let j = 0; j < this.height; ++j) {
            let line = [];
            for (let i = 0; i < this.width; ++i) {
                line.push(".");
            }
            result.push(line);
        }
        for (let car of this.cars) {
            for (let w = 0; w < car.size; ++w) {
                if (car.orientation === CAR_HORIZONTAL) {
                    result[car.y][car.x + w] = car.id;
                } else {
                    result[car.y + w][car.x] = car.id;
                }
            }
        }
        return result
    }

    asKey = () => {
        let key = "";
        for (let car of this.cars) {
            key += car.id + car.x + "." + car.y;
        }
        return key;
    }

    clone = () => {
        const board = new Board(this.width, this.height)
        for (let car of this.cars) {
            board.addCar(car.id, car.x, car.y, car.orientation, car.size);
        }
        return board;
    }


    findPossibleMoves = () => {
        let possibleMoves = [];

        for (let car of this.cars) {
            const start = car.orientation === CAR_HORIZONTAL ? car.x : car.y;
            const end = start + (car.orientation == CAR_HORIZONTAL ? car.width : car.height) - 1;

            for (let k = start - 1; k >= 0; --k) {
                const i = car.orientation === CAR_HORIZONTAL ? k : car.x;
                const j = car.orientation === CAR_VERTICAL ? k : car.y;
                if (this.getCarAt(i, j) === null) {
                    const board = this.clone();
                    const newCar = board.getCarById(car.id);
                    newCar.x = i;
                    newCar.y = j;
                    const move = car.orientation === CAR_HORIZONTAL ? newCar.x - car.x : newCar.y - car.y;
                    possibleMoves.push({board: board, car: newCar, move: move});
                } else {
                    break
                }
            }
            const boardEnd = car.orientation === CAR_HORIZONTAL ? this.width : this.height;
            for (let k = end + 1; k < boardEnd; ++k) {
                const i = car.orientation === CAR_HORIZONTAL ? k : car.x;
                const j = car.orientation === CAR_VERTICAL ? k : car.y;
                if (this.getCarAt(i, j) === null) {
                    const ii = car.orientation === CAR_HORIZONTAL ? (k - (car.width - 1)) : car.x;
                    const jj = car.orientation === CAR_VERTICAL ? (k - (car.height - 1)) : car.y;

                    const board = this.clone();
                    const newCar = board.getCarById(car.id);
                    newCar.x = ii;
                    newCar.y = jj;
                    const move = car.orientation === CAR_HORIZONTAL ? newCar.x - car.x : newCar.y - car.y;
                    possibleMoves.push({board: board, car: newCar, move: move});
                } else {
                    break
                }
            }
        }

        return possibleMoves;
    }

    getCarAt = (x, y) => {
        for (let car of this.cars) {
            if (car.intersects(x, y)) {
                return car;
            }
        }
        return null;
    }

    getCarById = (id) => {
        for (let car of this.cars) {
            if (car.id === id) {
                return car;
            }
        }
        return null;
    }

    get isSolved() {
        return this.mainCar.x === this.width - this.mainCar.width;
    }
}

class Solver {

    constructor(board) {
        this.board = board;
        this.states = {}
        this.states[this.board.asKey()] = {parent: null, car: null, move: null};
    }

    solve = () => {
        let queue = [this.board];
        let iterations = 0;
        let maxQueueLength = 0;
        while (queue.length != 0) {
            iterations++;
            maxQueueLength = Math.max(maxQueueLength, queue.length);
            const board = queue.shift();
            if (board.isSolved) {
                // Rebuild moves list
                let movesList = [];
                let thisBoard = board;
                for (let state = this.states[board.asKey()]; state.parent !== null; state = this.states[state.parent.asKey()]) {
                    movesList.splice(0, 0, {board: thisBoard, car: state.car, move: state.move});
                    thisBoard = state.parent;
                }
                movesList.splice(0, 0, {board: this.board, car: null, move: null});
                return movesList;
            }
            for (let move of board.findPossibleMoves()) {
                if (!(move.board.asKey() in this.states)) {
                    this.states[move.board.asKey()] = {parent: board, car: move.car, move: move.move};
                    queue.push(move.board);
                }
            }
        }
        console.log(`${iterations} iterations`);
        console.log(`max queue length ${maxQueueLength}`);
        return null;
    }
}

class BoardView {

    constructor(root) {
        this.root = root;

        this.animationTimer = null;
        this.solution = null;
        this.solutionStep = null;
        this.playing = false;

        this.element = document.createElement("div")
        this.root.appendChild(this.element);
        this.element.classList.add("vbox");

        this.baseBoard = document.createElement("div")
        this.element.appendChild(this.baseBoard);
        this.baseBoard.classList.add("board");

        this.controls = document.createElement("div");
        this.element.appendChild(this.controls);
        this.controls.classList.add("hbox", "controls");

        const toStartButton = document.createElement("button");
        this.controls.appendChild(toStartButton);
        toStartButton.textContent = "\u2595\u25c0\u25c0";
        toStartButton.addEventListener("click", this.toStart);
        const toPreviousButton = document.createElement("button");
        this.controls.appendChild(toPreviousButton);
        toPreviousButton.textContent = "\u2595\u25c0";
        toPreviousButton.addEventListener("click", this.toPrevious);
        this.togglePlayPauseButton = document.createElement("button");
        this.controls.appendChild(this.togglePlayPauseButton);
        this.togglePlayPauseButton.textContent = "\u25b6";
        this.togglePlayPauseButton.addEventListener("click", this.togglePlayPause);
        const toNextButton = document.createElement("button");
        this.controls.appendChild(toNextButton);
        toNextButton.textContent = "\u25b6\u258f";
        toNextButton.addEventListener("click", this.toNext);
        const toEndButton = document.createElement("button");
        this.controls.appendChild(toEndButton);
        toEndButton.textContent = "\u25b6\u25b6\u258f";
        toEndButton.addEventListener("click", this.toEnd);

        this.log = document.createElement("div");
        this.element.appendChild(this.log);
        this.log.classList.add("text");

        this.carElements = {};
        for (let id of "ABCDEFGHIJKOPQRX") {
            const carElement = document.createElement("div")
            carElement.textContent = id;
            carElement.classList.add("car");
            carElement.style.backgroundColor = CAR_COLORS[id];
            this.carElements[id] = carElement;
            this.baseBoard.appendChild(carElement);
        }

        const outArrow = document.createElement("div");
        this.baseBoard.appendChild(outArrow);
        outArrow.classList.add("arrow-out");
        outArrow.style.top = (2 * BOARD_CELL_SIZE) + "px";
        outArrow.style.left = (6 * BOARD_CELL_SIZE) + "px";
    }

    update = (board) => {
        this.baseBoard.style.width = (board.width * BOARD_CELL_SIZE) + "px";
        this.baseBoard.style.height = (board.height * BOARD_CELL_SIZE) + "px";

        for (let id of Object.keys(this.carElements)) {
            const carElement = this.carElements[id];
            const car = board.getCarById(id);
            if (car) {
                carElement.style.display = undefined;
                carElement.style.left = (car.x * BOARD_CELL_SIZE) + "px";
                carElement.style.top = (car.y * BOARD_CELL_SIZE) + "px";
                carElement.style.width = (car.width * BOARD_CELL_SIZE) + "px";
                carElement.style.height = (car.height * BOARD_CELL_SIZE) + "px";
            } else {
                carElement.style.display = "none";
            }
        }
    }

    showSolution = (solution) => {
        clearTimeout(this.animationTimer);
        this.solution = solution;
        this.solutionStep = this.solution ? 0 : null;

        while(this.log.firstChild) {
            this.log.removeChild(this.log.firstChild);
        }
        if (this.solution) {
            for (let move of this.solution) {
                if (move.car === null) {
                    continue;
                }
                let solutionElt = move.car.id;
                if (move.move > 0) {
                    solutionElt += "+";
                }
                const span = document.createElement("span");
                solutionElt += move.move + " ";
                span.textContent = solutionElt;
                this.log.appendChild(span);
            }
        } else {
            const msg = document.createElement("span")
            msg.classList.add("text");
            msg.textContent = "No solution :("
            this.log.appendChild(msg);
        }
    }

    toStep = (step) => {
        if (!this.solution) {
            return;
        }
        this.solutionStep = step;
        this.playing = false;
        clearTimeout(this.animationTimer);
        this.showSolutionStep();
    }

    toStart = () => {
        this.toStep(0);
    }

    toPrevious = () => {
        if (this.solutionStep > 1) {
            this.toStep(this.solutionStep - 2);
        }
    }

    toNext = () => {
        if (this.solutionStep < this.solution.length) {
            this.toStep(this.solutionStep);
        }
    }

    toEnd = () => {
        this.toStep(this.solution.length - 1);
    }

    togglePlayPause = () => {
        if (!this.solution) {
            return;
        }
        this.playing = !this.playing;
        if (!this.playing) {
            this.togglePlayPauseButton.textContent = "\u25b6";
            clearTimeout(this.animationTimer);
        } else {
            this.togglePlayPauseButton.textContent = "\u258e\u258e";
            this.showSolutionStep();
        }
    }

    showSolutionStep = () => {
        const step = this.solution[this.solutionStep];
        this.update(step.board);
        for (let i = 0; i < this.log.children.length; ++i) {
            this.log.children[i].style.fontWeight = i < this.solutionStep ? "bold" : null;
        }
        this.solutionStep++;
        if (this.playing && this.solutionStep < this.solution.length) {
            this.animationTimer = setTimeout(this.showSolutionStep, 1000);
        }
    }

    get isVisible() {
        return this.element.style.display !== "none";
    }

    set isVisible(value) {
        if (value) {
            this.element.style.display = null;
        } else {
            this.element.style.display = "none";
        }
    }
}

class BoardEditor {

    constructor(root) {
        this.root = root;

        this.element = document.createElement("div")
        this.element.classList.add("vbox")
        this.root.appendChild(this.element);

        this.editor = document.createElement("textarea")
        this.editor.classList.add("editor");
        this.editor.setAttribute("placeholder", "......\n......\n......\n......\n......\n......")
        this.editor.value =
            "AA.OOO" +
            "...CBB" +
            "DXXC.Q" +
            "D.PFFQ" +
            "EEP..Q" +
            "..PRRR"
        this.element.appendChild(this.editor);

        const note = document.createElement("span");
        note.classList.add("text");
        note.textContent = "X = Red car";
        this.element.appendChild(note);

        this.button = document.createElement("button");
        this.button.classList.add("button");
        this.button.textContent = "Rush Out !"
        this.element.appendChild(this.button);
    }

    get isVisible() {
        return this.element.style.display !== "none";
    }

    set isVisible(value) {
        if (value) {
            this.element.style.display = null;
        } else {
            this.element.style.display = "none";
        }
    }

    getBoardString = () => {
        let boardString = this.editor.value;
        boardString = boardString.replace("\n", "");
        boardString = boardString.replace(" ", "");
        return boardString.substring(0, 36);
    }

    build = () => {
        const board = new Board(6, 6);
        board.loadBoard(this.getBoardString());
        return board;
    }
}

function loadUrlBoardString() {
    const boardString = location.hash.length !== 0 ? location.hash.substring(1) : null;
    const board = new Board(6, 6);
    try {
        board.loadBoard(boardString);
        return board;
    } catch {
        return null;
    }
}

function main() {
    const root = document.getElementById("app");

    const urlBoard = loadUrlBoardString();

    const boardEditor = new BoardEditor(root)
    boardEditor.isVisible = urlBoard == null;

    const boardView = new BoardView(root);
    boardView.isVisible = !boardEditor.isVisible;

    const runSolver = (board) => {
        const solver = new Solver(board);
        const solution = solver.solve();
        boardView.showSolution(solution);
        if (solution) {
            boardView.togglePlayPause();
        } else {
            boardView.update(board);
        }
    }

    if (urlBoard !== null) {
        runSolver(urlBoard);
    }

    boardEditor.button.addEventListener("click", () => {
        boardEditor.isVisible = false;
        boardView.isVisible = true;
        location.hash = "#" + boardEditor.getBoardString();
        runSolver(boardEditor.build());
    });
}

window.addEventListener('DOMContentLoaded', main);