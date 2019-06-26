// bg #009223
// square type 1 #36c657
// square type 2 #2cb251
//window.onload = initializeWorld();
initializeWorld();

// jsdocs + readme
var canvas;
var ctx;

var squareSize;

var youDied;
var foodPosition;
var eatenGoats;
var goat;
var drogon;
var drogonHead;
var drogonPosition;
var deathCount;

var direction;

var ArrowDirections;
var evenSquare;
var evenSquareColor;
var oddSquareColor;

function setup() {
	ArrowDirections = {
		ArrowUp: 0,
		ArrowDown: 1,
		ArrowRight: 2,
		ArrowLeft: 3
	};
	deathCount = 0;
	squareSize = 20;
	offset = 2 * squareSize;
	youDied = false;
	foodPosition = [0, 0];
	direction = ArrowDirections.ArrowRight;

	drogonPosition = [100, 60];
	drogon = [];

	evenSquare = true;
	evenSquareColor = '#36c657';
	oddSquareColor = '#2cb251';

	document.addEventListener('keydown', setDirection);
	document.addEventListener('mousedown', () => {
		if (youDied) {
			direction = ArrowDirections.ArrowRight;
			deathCount++;
			eatenGoats = 0;
			youDied = false;
		}
	});
}

function setDirection(e) {
	let keyCode = e.keyCode;
	switch (keyCode) {
		case 38:
		case 87:
			if (direction !== ArrowDirections.ArrowDown)
				direction = ArrowDirections.ArrowUp;
			break;
		case 37:
		case 65:
			if (direction !== ArrowDirections.ArrowRight)
				direction = ArrowDirections.ArrowLeft;
			break;
		case 40:
		case 83:
			if (direction !== ArrowDirections.ArrowUp)
				direction = ArrowDirections.ArrowDown;
			break;
		case 39:
		case 68:
			if (direction !== ArrowDirections.ArrowLeft)
				direction = ArrowDirections.ArrowRight;
			break;
		default:
			break;
	}
}

//#region Canvas Utils

function computeWindowBoundaries() {
	windowWidth = Math.round(window.innerWidth / 10) * 10;
	windowHeight = Math.round(window.innerHeight / 10) * 10;

	if (windowWidth % squareSize !== 0) windowWidth -= 10;
	if (windowHeight % squareSize !== 0) windowHeight -= 10;

	windowWidth -= offset;
	windowHeight -= offset;
}

function getAndInitializeCanvas(name) {
	let canvas = document.getElementById(name);

	canvas.width = windowWidth;
	canvas.height = windowHeight;

	return canvas;
}

function getCanvas2DContext(canvas) {
	return canvas.getContext('2d');
}
//#endregion

function initializeWorld() {
	setup();
	computeWindowBoundaries();

	drawBoard(getCanvas2DContext(getAndInitializeCanvas('b')));

	canvas = getAndInitializeCanvas('f');
	ctx = getCanvas2DContext(canvas);

	catchGoat();
	generateDrogon(drogonPosition[0], drogonPosition[1]);
	findDrogon();
	//renderDrogon();

	StartGame();
}

function findDrogon() {
	drogonHead = new Image();
	drogonHead.onload = renderDrogon;
	drogonHead.src = './drogon.png';
}

function catchGoat() {
	goat = new Image();
	goat.onload = generateFood;
	goat.src = './WhiteGoat.min.png';
}

function drawBoard(ctx) {
	let squaresVertical = windowHeight / squareSize
		, squaresHorizontal = windowWidth / squareSize
		, x = y = 0;

	ctx.fillStyle = oddSquareColor;
	ctx.fillRect(x, y, windowWidth, windowHeight);

	for (let i = 0; i < squaresVertical; i++) {
		for (let j = 0; j < squaresHorizontal; j++) {

			if ((i + j) % 2 == 0) {
				ctx.fillStyle = evenSquareColor;
				ctx.fillRect(x, y, squareSize, squareSize);
			}

			x += squareSize;
		}
		x = 0;
		y += squareSize;
	}
}

function StartGame() {
	setInterval(() => {
		renderDrogon();
		moveDrogon();
		eatFood();
	}, 1000 / 30);
}

function eatFood() {
	if (drogonPosition[0] === foodPosition[0] && drogonPosition[1] === foodPosition[1]) {
		generateFood();
		eatenGoats++;

		// increase drogon size
		drogon.splice(1, 0, drogon[1]);
	}
}


function displayMessage(message) {
	ctx.fillStyle = '#000';
	ctx.font = "25px Comic Sans MS";
	ctx.fillText(message, canvas.width / 2 - 300, canvas.height / 2 - 50);
	ctx.fillText("Click to continue", canvas.width / 2 - 100, canvas.height / 2 + 60);
}

function generateFood() {
	// ToDo: do not generate food on top of drogon :/
	foodPosition = [
		Math.floor(Math.random() * canvas.width / squareSize) * squareSize,
		Math.floor(Math.random() * canvas.height / squareSize) * squareSize
	];
	ctx.drawImage(goat, foodPosition[0], foodPosition[1], squareSize, squareSize);
}

//remove this? create an array instead?
function generateDrogon(x, y, length = 3) {
	for (let i = 0; i < length; i++) {
		drogon.push([x - i * squareSize, y]);
	}
	//console.log(drogon);
}

function renderDrogon() {
	// add new position on top of the array
	drogon.splice(0, 0, [drogonPosition[0], drogonPosition[1]]);

	// draw head
	ctx.drawImage(drogonHead, drogon[0][0], drogon[0][1], squareSize, squareSize);

	// draw the rest of the body
	let drogonLength = drogon.length;
	for (let i = 1; i < drogonLength; i++) {
		const part = drogon[i];
		createRectangle(part[0], part[1], squareSize, squareSize, '#962938');
	}

	// remove last element
	let last = drogon.pop();
	let selectedColor;

	selectedColor = evenSquare ? evenSquareColor : oddSquareColor;
	evenSquare = !evenSquare;

	createRectangle(last[0], last[1], squareSize, squareSize, selectedColor); youDied = true;

	if (youDied) {
		let message;
		if (deathCount < 1) {
			message = "Welcome! Use WASD or the Arrow keys to move";
		} else {
			message = "You did great ... but you died! 😢";
		}

		displayMessage(message);
	}
}

function createRectangle(posX, posY, width, height, color) {
	ctx.fillStyle = color;
	ctx.fillRect(posX, posY, width, height);
}

function moveDrogon() {
	if (youDied) return;

	switch (direction) {
		case ArrowDirections.ArrowDown:
			drogonPosition[1] += squareSize;
			break;
		case ArrowDirections.ArrowUp:
			drogonPosition[1] -= squareSize;
			break;
		case ArrowDirections.ArrowLeft:
			drogonPosition[0] -= squareSize;
			break;
		case ArrowDirections.ArrowRight:
			drogonPosition[0] += squareSize;
			break;
		default:
			return;
	}

	gameOver();
}

function gameOver() {
	// improve this
	if (drogonPosition[0] === canvas.width && direction === ArrowDirections.ArrowRight) {
		drogonPosition[0] = 0;
	} else if (drogonPosition[1] === canvas.height && direction === ArrowDirections.ArrowDown) {
		drogonPosition[1] = 0;
	} else if (drogonPosition[1] === -squareSize && direction === ArrowDirections.ArrowUp) {
		drogonPosition[1] = canvas.height;
	} else if (drogonPosition[0] === -squareSize && direction === ArrowDirections.ArrowLeft) {
		drogonPosition[0] = canvas.width;
	}

	// can't get lower than 3 blocks
	for (let i = 3; i < drogon.length; i++) {
		const body = drogon[i];
		if (drogonPosition[0] === body[0] && drogonPosition[1] === body[1]) {
			youDied = true;
		}
	}
}