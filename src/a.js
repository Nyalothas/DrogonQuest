var DrogonQuest = {

	init: function () {

		var
			x = 100
			, y = 60

			/**
			 * Drogon body - pre-baked
			 */
			, drogon = [[x, y], [80, y], [y, y]]

			/**
			 * Drogon position
			 * Initialized to calculated coords
			 */
			, drogonPosition = [x, y]

			/**
			 * Drogon head image ref
			 */
			, drogonHead = new Image()

			/**
			 * Goat image ref
			 */
			, goat = new Image()

			/**
			 * Food position
			 */
			, foodPosition = []

			/**
			 * Total ammount of goats roasted
			 */
			, eatenGoats = 0

			/**
			 * Possible facing directions
			 */
			, ArrowDirections = {
				ArrowUp: 0,
				ArrowDown: 1,
				ArrowRight: 2,
				ArrowLeft: 3
			}

			/**
			 * Direction drogon is facing
			 */
			, direction = ArrowDirections.ArrowRight

			/**
			 * Grid block size
			 */
			, squareSize = 20

			/**
			 * Drawing margin offset
			 */
			, offset = 2 * squareSize

			/**
			 * Window inner width
			 */
			, windowWidth

			/**
			 * Window inner height
			 */
			, windowHeight

			/**
			 * Indicates if drogon got stabbed by NK
			 */
			, youDied = false

			/**
			 * How many times you got lost
			 */
			, deathCount = 0

			/**
			 * Canvas reference for drogon and food
			 */
			, canvas

			/**
			 * Canvas context for drogon and food
			 */
			, ctx

			/**
			 * Indicates if the square pozition in grid is even
			 */
			, evenSquare = true

			/**
			 * Even square color
			 */
			, evenSquareColor = '#36c657'

			/**
			 * Odd Square color
			 */
			, oddSquareColor = '#2cb251'

			/**
			 * Stores the setInterval reference id
			 */
			, step

			/**
			 * Returns the matching element by id
			 */
			, getElementById = function (name) {
				return document.getElementById(name);
			}

			/**
			 * Message display location
			 */
			, m = getElementById('m')

			/**
			 * Sets event listeners on the DOM
			 */
			, registerDOMEventListeners = function () {
				document.addEventListener('keydown', setDirection);
				document.addEventListener('mousedown', () => {
					if (youDied) {
						drogon = [[x, y], [80, y], [y, y]];
						drogonPosition = [x, y];
						direction = ArrowDirections.ArrowRight;
						eatenGoats = 0;
						youDied = false;
						generateFood();
						startGame();
					} else if (deathCount < 0) {
						displayMessage();
					}
				})
			}

			/**
			 * Computes window size based on offset and squareSize
			 */
			, computeWindowBoundaries = function () {
				windowWidth = Math.round(window.innerWidth / 10) * 10;
				windowHeight = Math.round(window.innerHeight / 10) * 10;

				if (windowWidth % squareSize !== 0) windowWidth -= 10;
				if (windowHeight % squareSize !== 0) windowHeight -= 10;

				windowWidth -= offset;
				windowHeight -= offset;
			}

			/**
			 * Gets the canvas DOM reference and sets it's size
			 * @param {string} name the id of the canvas
			 */
			, getAndInitializeCanvas = function (name) {
				let canvas = getElementById(name);

				canvas.width = windowWidth;
				canvas.height = windowHeight;

				return canvas;
			}

			/**
			 * Returns the 2d context of a canvas
			 * @param { object } canvas
			 */
			, getCanvas2DContext = function (canvas) {
				return canvas.getContext('2d');
			}

			/**
			 * Draws a rectangle on the canvas
			 */
			, createRectangle = function (posX, posY, width, height, color) {
				ctx.fillStyle = color;
				ctx.fillRect(posX, posY, width, height);
			}

			, displayMessage = function () {
				let message;
				let children = m.children;
				if (deathCount < 1) {
					message = 'Welcome! Use WASD or the Arrow keys to move';
				} else {
					message = 'You did great ... but you died! 😢';
					children[1].innerText = 'EatenGoats: ' + eatenGoats;
				}

				children[0].innerText = message;
				children[2].innerText = 'Click to continue';

				m.classList.toggle('zn');
			}

			, findDrogon = function (path) {
				drogonHead.onload = renderDrogon;
				drogonHead.src = `./${path}.png`;
			}

			, catchGoat = function (path) {
				goat.onload = generateFood;
				goat.src = `./${path}.png`;
			}

			/**
			 * Draws a grid on the provided canvas 2d context
			 * @param { object } ctx the canvas 2d context
			 */
			, drawBoard = function (ctx) {
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

			/**
			 * Renders Drogon
			 */
			, renderDrogon = function () {
				if (youDied) return;

				// add new position on top of the array
				drogon.splice(0, 0, [drogonPosition[0], drogonPosition[1]]);

				// draw head
				ctx.drawImage(drogonHead, drogon[0][0], drogon[0][1], squareSize, squareSize);

				// draw the rest of the body
				let drogonLength = drogon.length;
				for (let i = 1; i < drogonLength; i++) {
					let part = drogon[i];
					createRectangle(part[0], part[1], squareSize, squareSize, '#962938');
				}

				// remove last element
				let last = drogon.pop();
				let selectedColor;

				selectedColor = evenSquare ? evenSquareColor : oddSquareColor;
				evenSquare = !evenSquare;

				createRectangle(last[0], last[1], squareSize, squareSize, selectedColor);
			}

			, gameOver = function () {
				// improve this
				// allows drogon to phase through walls 
				if (drogonPosition[0] === canvas.width && direction === ArrowDirections.ArrowRight) {
					drogonPosition[0] = 0;
				} else if (drogonPosition[1] === canvas.height && direction === ArrowDirections.ArrowDown) {
					drogonPosition[1] = 0;
				} else if (drogonPosition[1] === -offset && direction === ArrowDirections.ArrowUp) {
					drogonPosition[1] = canvas.height;
				} else if (drogonPosition[0] === -offset && direction === ArrowDirections.ArrowLeft) {
					drogonPosition[0] = canvas.width;
				}

				// can't get lower than 3 blocks
				for (let i = 3; i < drogon.length; i++) {
					const body = drogon[i];
					if (drogonPosition[0] === body[0] && drogonPosition[1] === body[1]) {
						youDied = true;
						deathCount++;

						displayMessage();
						clearInterval(step);
						break;
					}
				}
			}

			/**
			 * Moves drogon position the the selected direction
			 */
			, moveDrogon = function () {
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

			, generateFood = function () {
				// ToDo: do not generate food on top of drogon :/
				foodPosition = [
					Math.floor(Math.random() * canvas.width / squareSize) * squareSize,
					Math.floor(Math.random() * canvas.height / squareSize) * squareSize
				];
				ctx.drawImage(goat, foodPosition[0], foodPosition[1], squareSize, squareSize);
			}

			/**
			 * Eats Goats and gets big
			 */
			, eatFood = function () {
				if (drogonPosition[0] === foodPosition[0] && drogonPosition[1] === foodPosition[1]) {
					generateFood();
					eatenGoats++;

					// increase drogon size
					drogon.splice(1, 0, drogon[1]);
				}
			}


			/**
			 * Sets drogon direction based on keycode
			 * @param { object } e ketboard event
			 */
			, setDirection = function (e) {
				let keyCode = e.keyCode;
				switch (keyCode) {
					case 38:
					case 87:
						if (direction !== ArrowDirections.ArrowDown) {
							direction = ArrowDirections.ArrowUp;
						}
						break;
					case 37:
					case 65:
						if (direction !== ArrowDirections.ArrowRight) {
							direction = ArrowDirections.ArrowLeft;
						}
						break;
					case 40:
					case 83:
						if (direction !== ArrowDirections.ArrowUp) {
							direction = ArrowDirections.ArrowDown;
						}
						break;
					case 39:
					case 68:
						if (direction !== ArrowDirections.ArrowLeft) {
							direction = ArrowDirections.ArrowRight;
						}
						break;
					default:
						break;
				}
			}

			, startGame = function () {
				step = setInterval(() => {
					renderDrogon();
					moveDrogon();
					eatFood();
				}, 33);
			}


		initializeWorld = function () {
			registerDOMEventListeners();
			computeWindowBoundaries();

			// draw the background canvas grid
			drawBoard(getCanvas2DContext(getAndInitializeCanvas('b')));

			canvas = getAndInitializeCanvas('f');
			ctx = getCanvas2DContext(canvas);

			catchGoat('g');
			findDrogon('d');

			displayMessage();

			startGame();
		};

		return {
			init: initializeWorld()
		}
	}
};

DrogonQuest.init();