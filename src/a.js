var DrogonQuest = {

	init: function () {

		var
			/**
			 * Drogon starting x coord position
			 */
			posX = 100

			/**
			 * Drogon starting y coord position
			 */
			, posY = 60

			/**
			 * Drogon body
			 */
			, drogon

			/**
			 * Drogon position
			 */
			, drogonPosition

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
			, eatenGoats

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
			 * Direction Drogon is facing
			 */
			, direction

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
			 * Indicates if drogon got stabbed by NK(ideea, ideea)
			 */
			, youDied

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
			 * Even square color
			 */
			, evenSquareColor = '#36c657'

			/**
			 * Odd Square color
			 */
			, oddSquareColor = '#2cb251'

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
			 * Toggles the message display
			 */
			, toggleMessage = function () {
				m.classList.toggle('n');
			}

			/**
			 * Sets event listeners on the DOM
			 */
			, registerDOMEventListeners = function () {
				document.addEventListener('keydown', setDirection);
				document.addEventListener('mousedown', () => {
					if (youDied) {
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						setInitialData();
						toggleMessage();

						generateFood();
					} else if (deathCount++ < 1) {
						toggleMessage();
						startGame();
					}
				});
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
			 * Draws a rectangle on the canvas at the specified coordinate
			 * @param { object } ctx canvas 2d context
			 * @param { number } x x coordinate
			 * @param { number } y y coordinate
			 * @param { string } color the color in which the rectangle will be drawn
			 * @param { number } size the size of the square
			 */
			, createRectangle = function (ctx, x, y, color, size = squareSize) {
				ctx.fillStyle = color;
				ctx.fillRect(x, y, size, size);
			}

			/**
			 * Draws an image on the canvas at the specified coordinate
			 * @param { object } image the image to draw
			 * @param { number } x x coordinate
			 * @param { number } y y coordinate
			 */
			, drawCanvasImage = function (image, coords) {
				ctx.drawImage(image, coords[0], coords[1], squareSize, squareSize);
			}

			/**
			 * Displays a message, depending on the death count
			 */
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

				toggleMessage();
			}

			/**
			 * Removes duplicate values from a sorted array
			 */
			, getArrayUniqueValues = function (array) {
				return array.filter((el, index, ar) => {
					return !index || el != ar[index - 1];
				});
			}

			/**
			 * Returns a image path
			 * @param {string} image name
			 */
			, getImagePath = function (path) {
				return `./${path}.png`;
			}

			/**
			 * Loads Drogon head as a image and renders it
			 * @param {string} imageName image name
			 */
			, findDrogon = function (imageName) {
				drogonHead.onload = renderDrogon;
				drogonHead.src = getImagePath(imageName);
			}

			/**
			 * Loads a goat as a image and renders it
			 * @param {string} imageName image name
			 */
			, catchGoat = function (imageName) {
				goat.onload = generateFood;
				goat.src = getImagePath(imageName);
			}

			/**
			 * Draws a grid on the provided canvas 2d context
			 * Can we do this with a single for???
			 * @param { object } ctx the canvas 2d context
			 */
			, drawBoard = function (ctx) {
				let squaresVertical = windowHeight / squareSize
					, squaresHorizontal = windowWidth / squareSize
					, x = y = 0;

				ctx.fillStyle = oddSquareColor;
				ctx.fillRect(x, y, windowWidth, windowHeight);

				for (let i = 0; i <= squaresVertical; i++) {
					for (let j = 0; j < squaresHorizontal; j++) {

						if ((i + j) % 2 == 0) {
							createRectangle(ctx, x, y, evenSquareColor);
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
				// add new position on top of the array
				drogon.splice(0, 0, [drogonPosition[0], drogonPosition[1]]);

				// draw head drogon[0][0], drogon[0][1]
				drawCanvasImage(drogonHead, drogonPosition);

				/**
				 * draw the rest of the body
				 * shenanigans here... the full initial body will be drawn after 3 interval cycles
				 * ze user will not notice :D
				 * this will allow us to draw only 3 squares for the body on each cycle
				 * performance man! (⌐□_□)
				 */
				createRectangle(ctx, drogon[1][0], drogon[1][1], '#962938');

				// remove last element
				let last = drogon.pop();

				// check the color of the grass after Drogon stepped on it
				let even = (last[0] + last[1]) % (2 * squareSize) === 0
				let selectedColor = even ? evenSquareColor : oddSquareColor;

				// replace tail position with a square of the specific color
				createRectangle(ctx, last[0], last[1], selectedColor);
			}

			/**
			 * Sets the way in which the game can end
			 */
			, gameOver = function () {
				// can't get lower than 3 blocks
				for (let i = 2; i < drogon.length; i++) {
					let body = drogon[i];
					if (drogonPosition[0] === body[0] && drogonPosition[1] === body[1]) {
						youDied = true;

						displayMessage();
						break;
					}
				}
			}

			/**
			 * Moves drogon position the the selected direction
			 */
			, moveDrogon = function () {
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
				}

				// try to improve this
				// allows drogon to phase through walls
				if (drogonPosition[0] === windowWidth && direction === ArrowDirections.ArrowRight) {
					drogonPosition[0] = 0;
				} else if (drogonPosition[1] === windowHeight && direction === ArrowDirections.ArrowDown) {
					drogonPosition[1] = 0;
				} else if (drogonPosition[1] < 0 && direction === ArrowDirections.ArrowUp) {
					drogonPosition[1] = windowHeight - squareSize;
				} else if (drogonPosition[0] < 0 && direction === ArrowDirections.ArrowLeft) {
					drogonPosition[0] = windowWidth - squareSize;
				}

				gameOver();
			}

			/**
			 * Generates a number not present in an array
			 * @param { number } param a formula specific number
			 * @param { array } array an array with numbers
			 */
			, generateRandomNumberNotInArray = function (param, array) {
				let rand = null;

				while (rand === null || array.indexOf(rand) >= 0) {
					rand = Math.floor(Math.random() * param / squareSize) * squareSize;
				}
				return rand;
			}

			/**
			 * Generated a goat
			 */
			, generateFood = function () {
				// flat Drogon and sort it
				let flatDrogon = drogon.reduce((acc, val) => acc.concat(val)).sort();

				// remove unique values
				flatDrogon = getArrayUniqueValues(flatDrogon);

				foodPosition = [
					generateRandomNumberNotInArray(windowWidth, flatDrogon),
					generateRandomNumberNotInArray(windowHeight, flatDrogon)
				];

				drawCanvasImage(goat, foodPosition);
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
			 * Sets some variables to their initial state
			 */
			, setInitialData = function () {
				drogon = [[posX, posY], [80, posY], [posY, posY]];
				drogonPosition = [posX, posY];
				direction = ArrowDirections.ArrowRight;
				eatenGoats = 0;
				youDied = false;
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
				}
			}

			/**
			 * Starts the main game loop
			 */
			, startGame = function () {
				setInterval(() => {
					if (!youDied) {
						renderDrogon();
						moveDrogon();
						eatFood();
					}
				}, 33);
			}

			/**
			 * Initializes and starts the application
			 */
			, initializeWorld = function () {
				registerDOMEventListeners();
				computeWindowBoundaries();
				setInitialData();

				// draw the background canvas grid
				drawBoard(getCanvas2DContext(getAndInitializeCanvas('b')));

				canvas = getAndInitializeCanvas('f');
				ctx = getCanvas2DContext(canvas);

				catchGoat('g');
				findDrogon('d');

				displayMessage();
			};

		return {
			init: initializeWorld()
		}
	}
};

DrogonQuest.init();