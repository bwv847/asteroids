import {
  FRICTION,
  GAME_LIVES,
  LASER_DIST,
  LASER_EXPLODE_DUR,
  ASTEROIDS_JAGGEDNESS,
  ASTEROID_POINTS_LARGE,
  ASTEROID_POINTS_MEDIUM,
  ASTEROID_POINTS_SMALL,
  ASTEROIDS_STARTING_NUMBER,
  ASTEROIDS_STARTING_SIZE,
  ASTEROIDS_STARTING_MAX_SPEED,
  ASTEROID_AVERAGE_VERTICES,
  SAVE_KEY_SCORE,
  SHIP_EXPLODE_DUR,
  SHIP_BLINK_DUR,
  SHIP_INV_DUR,
  SHIP_SIZE,
  SHIP_THRUST,
  SHOW_BOUNDING,
  SHOW_CENTRE_DOT,
  TEXT_FADE_TIME,
  TEXT_SIZE,
} from './constants.ts';

import './style.css';
import { distBetweenPoints } from './utils.ts';
import { Ship, ShipInterface } from './Ship.ts';
import { Asteroid, AsteroidInterface } from './Asteroid.ts';
import { keyDown, keyUp } from './keyboard.ts';

const canvas = document.querySelector('#asteroids-canvas') as HTMLCanvasElement;
canvas.style.width = window.innerWidth - 50 + 'px';
canvas.width = canvas.offsetWidth - 50;

canvas.style.height = window.innerHeight - 50 + 'px';
canvas.height = canvas.offsetHeight - 50;

const context = canvas.getContext('2d') as CanvasRenderingContext2D;

// set up the game parameters
let level: number;
let lives: number;
let asteroids: AsteroidInterface[];
let score: number;
let scoreHigh: number;
let ship: ShipInterface;
let text: string;
let textAlpha: number;
let isPause: boolean = false;
let requestAnimationId: number = 0;

let deltaTime = 0.008;
newGame();

// set up event handlers
document.addEventListener('keydown', (event) =>
  keyDown(event, ship, deltaTime)
);
document.addEventListener('keyup', (event) => keyUp(event, ship));

const $togglePause = document.getElementById('togglePause');
if ($togglePause) {
  $togglePause.addEventListener('click', () => {
    togglePause();

    if (isPause) {
      // make button have a symbol of play
      $togglePause.innerText = '\u25B6';
      $togglePause.style.fontSize = '10px';
    } else {
      // make button have a symbol of pause
      $togglePause.innerText = '\u23F8';
      $togglePause.style.fontSize = '16px';
    }
  });
}

// set up the game loop
window.requestAnimationFrame(draw);
let lastTime = 0;
function draw(currentTime: number) {
  if (lastTime === 0) {
    lastTime = currentTime;
  }

  deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  update();
  requestAnimationId = window.requestAnimationFrame(draw);
}

const togglePause = () => {
  isPause = !isPause;

  if (isPause) {
    window.cancelAnimationFrame(requestAnimationId);
  } else {
    window.requestAnimationFrame(draw);
  }
};

function createAsteroidBelt() {
  const asteroids = [];

  let x, y;
  for (let i = 0; i < ASTEROIDS_STARTING_NUMBER + level; i++) {
    // random asteroid location (not touching spaceship)
    do {
      x = Math.floor(Math.random() * canvas.width);
      y = Math.floor(Math.random() * canvas.height);
    } while (
      distBetweenPoints(ship.x, ship.y, x, y) <
      ASTEROIDS_STARTING_SIZE * 2 + ship.r
    );

    asteroids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ASTEROIDS_STARTING_SIZE / 2),
        ASTEROIDS_STARTING_MAX_SPEED,
        ASTEROID_AVERAGE_VERTICES,
        ASTEROIDS_JAGGEDNESS,
        level,
        deltaTime
      )
    );
  }

  return asteroids;
}

const destroyAsteroid = (index: number) => {
  const x = asteroids[index].x;
  const y = asteroids[index].y;
  const r = asteroids[index].r;

  // split the asteroid in two if necessary
  if (r === Math.ceil(ASTEROIDS_STARTING_SIZE / 2)) {
    asteroids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ASTEROIDS_STARTING_SIZE / 4),
        ASTEROIDS_STARTING_MAX_SPEED,
        ASTEROID_AVERAGE_VERTICES,
        ASTEROIDS_JAGGEDNESS,
        level,
        deltaTime
      )
    );
    asteroids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ASTEROIDS_STARTING_SIZE / 4),
        ASTEROIDS_STARTING_MAX_SPEED,
        ASTEROID_AVERAGE_VERTICES,
        ASTEROIDS_JAGGEDNESS,
        level,
        deltaTime
      )
    );
    score += ASTEROID_POINTS_LARGE;
  } else if (r === Math.ceil(ASTEROIDS_STARTING_SIZE / 4)) {
    asteroids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ASTEROIDS_STARTING_SIZE / 8),
        ASTEROIDS_STARTING_MAX_SPEED,
        ASTEROID_AVERAGE_VERTICES,
        ASTEROIDS_JAGGEDNESS,
        level,
        deltaTime
      )
    );
    asteroids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ASTEROIDS_STARTING_SIZE / 8),
        ASTEROIDS_STARTING_MAX_SPEED,
        ASTEROID_AVERAGE_VERTICES,
        ASTEROIDS_JAGGEDNESS,
        level,
        deltaTime
      )
    );
    score += ASTEROID_POINTS_MEDIUM;
  } else {
    score += ASTEROID_POINTS_SMALL;
  }

  // check high score
  if (score > scoreHigh) {
    scoreHigh = score;
    localStorage.setItem(SAVE_KEY_SCORE, String(scoreHigh));
  }

  // destroy the asteroid
  asteroids.splice(index, 1);

  // new level when no more asteroids
  if (asteroids.length === 0) {
    level++;
    newLevel();
  }
};

const gameOver = () => {
  ship.dead = true;
  text = 'Game Over';
  textAlpha = 1.0;
};

function newGame() {
  level = 0;
  lives = GAME_LIVES;
  score = 0;
  ship = new Ship(canvas, SHIP_SIZE, SHIP_INV_DUR, SHIP_BLINK_DUR, deltaTime);

  // get the high score from local storage
  const scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
  if (scoreStr === null) {
    scoreHigh = 0;
  } else {
    scoreHigh = parseInt(scoreStr);
  }

  newLevel();
}

function newLevel() {
  text = 'Level ' + (level + 1);
  textAlpha = 1.0;
  asteroids = createAsteroidBelt();
}

// TODO: make degrees to radians util

function update() {
  const blinkOn = ship.blinkNum % 2 === 0;
  const exploding = ship.explodeTime > 0;

  // draw space
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // thrust the ship
  if (ship.thrusting && !ship.dead) {
    ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) * deltaTime;
    ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) * deltaTime;

    // draw the thruster
    if (!exploding && blinkOn) {
      context.strokeStyle = 'black'; // flame color
      context.fillStyle = 'lightblue'; // flame color
      context.lineWidth = SHIP_SIZE / 15;
      context.beginPath();
      context.moveTo(
        // rear left
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      context.lineWidth = 1;
      context.lineTo(
        // rear centre behind the ship
        ship.x - ship.r * ((6 / 3) * Math.cos(ship.a)),
        ship.y + ship.r * ((6 / 3) * Math.sin(ship.a))
      );
      context.lineTo(
        // rear right
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      context.closePath();
      context.fill();
      context.stroke();
    }
  } else {
    // apply friction (slow the ship down when not thrusting)
    ship.thrust.x -= FRICTION * ship.thrust.x * deltaTime;
    ship.thrust.y -= FRICTION * ship.thrust.y * deltaTime;
  }

  // draw the triangular ship
  if (!exploding) {
    if (blinkOn && !ship.dead) {
      ship.draw(ship.x, ship.y, ship.a, context, 'black');
    }

    // handle blinking
    if (ship.blinkNum > 0) {
      // reduce the blink time
      ship.blinkTime--;

      // reduce the blink num
      if (ship.blinkTime === 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR / deltaTime);
        ship.blinkNum--;
      }
    }
  } else {
    // draw the explosion
    context.fillStyle = 'darkred';
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'red';
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'orange';
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'yellow';
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'white';
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    context.fill();
  }

  if (SHOW_BOUNDING) {
    context.strokeStyle = 'lime';
    context.beginPath();
    context.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    context.stroke();
  }

  // draw the asteroids
  let x, y, r, a, vert, offs;
  for (let i = 0; i < asteroids.length; i++) {
    context.strokeStyle = 'black';
    context.lineWidth = SHIP_SIZE / 20;
    // get the asteroid properties
    x = asteroids[i].x;
    y = asteroids[i].y;
    r = asteroids[i].r;
    a = asteroids[i].a;
    vert = asteroids[i].vert;
    offs = asteroids[i].offs;
    // draw a path
    context.beginPath();
    context.moveTo(
      x + r * offs[0] * Math.cos(a),
      y + r * offs[0] * Math.sin(a)
    );

    // draw the polygon
    for (let j = 1; j < vert; j++) {
      context.lineTo(
        x + r * offs[j] * Math.cos(a + (j * Math.PI * 2) / vert),
        y + r * offs[j] * Math.sin(a + (j * Math.PI * 2) / vert)
      );
    }
    context.closePath();
    context.stroke();

    if (SHOW_BOUNDING) {
      context.strokeStyle = 'lime';
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2, false);
      context.stroke();
    }
  }

  // show ship's centre dot
  if (SHOW_CENTRE_DOT) {
    context.fillStyle = 'red';
    context.fillRect(ship.x - 1, ship.y - 1, 2, 2);
  }

  // draw the lasers
  for (let i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime === 0) {
      context.fillStyle = 'rgb(255, 140, 0)';
      context.beginPath();
      context.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        SHIP_SIZE / 10,
        0,
        Math.PI * 2,
        false
      );
      context.fill();
    } else {
      // draw the explosion
      context.fillStyle = 'orangered';
      context.beginPath();
      context.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.75,
        0,
        Math.PI * 2,
        false
      );
      context.fill();
      context.fillStyle = 'salmon';
      context.beginPath();
      context.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        0,
        Math.PI * 2,
        false
      );
      context.fill();
      context.fillStyle = 'pink';
      context.beginPath();
      context.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.25,
        0,
        Math.PI * 2,
        false
      );
      context.fill();
    }
  }

  // draw the game text
  if (textAlpha >= 0) {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'rgba(0, 0, 0, ' + textAlpha + ')';
    context.font = 'small-caps ' + TEXT_SIZE + 'px sans-serif';
    context.fillText(text, canvas.width / 2, canvas.height * 0.75);
    textAlpha -= (1.0 / TEXT_FADE_TIME) * deltaTime;
  }

  // draw the lives
  let lifeColour;
  for (let i = 0; i < lives; i++) {
    lifeColour = exploding && i === lives - 1 ? 'red' : 'black';
    ship.draw(
      15 + SHIP_SIZE + i * SHIP_SIZE * 2.3,
      SHIP_SIZE + 15,
      0.5 * Math.PI,
      context,
      lifeColour
    );
  }

  // draw the score
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  context.fillStyle = '#000';
  context.font = TEXT_SIZE + 'px sans-serif';
  context.fillText(String(score), canvas.width - SHIP_SIZE / 2, SHIP_SIZE + 10);

  // draw the high score
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#000';
  context.font = TEXT_SIZE * 0.75 + 'px sans-serif';
  context.fillText('Best ' + scoreHigh, canvas.width / 2, SHIP_SIZE + 10);

  // detect laser hits on asteroids

  let ax, ay, ar, lx, ly;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    // grab the asteroid properties
    ax = asteroids[i].x;
    ay = asteroids[i].y;
    ar = asteroids[i].r;

    // loop over the lasers
    for (let j = ship.lasers.length - 1; j >= 0; j--) {
      // grab the laser properties
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;

      // detect hits
      if (
        ship.lasers[j].explodeTime === 0 &&
        distBetweenPoints(ax, ay, lx, ly) < ar
      ) {
        // remove the asteroid and active the laser explosion
        destroyAsteroid(i);
        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * deltaTime);
        break;
      }
    }
  }

  // check for asteroid collisions (when not exploding)
  if (!exploding) {
    // only check when not blinking
    if (ship.blinkNum === 0 && !ship.dead) {
      for (let i = 0; i < asteroids.length; i++) {
        if (
          distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) <
          ship.r + asteroids[i].r
        ) {
          ship.explode(SHIP_EXPLODE_DUR, deltaTime);
          destroyAsteroid(i);
          break;
        }
      }
    }

    // rotate the ship
    ship.a += ship.rot;

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  } else {
    // reduce the explosion time
    ship.explodeTime--;

    // reset the ship after the explosion has finished
    if (ship.explodeTime === 0) {
      lives--;
      if (lives === 0) {
        gameOver();
      } else {
        ship = new Ship(
          canvas,
          SHIP_SIZE,
          SHIP_INV_DUR,
          SHIP_BLINK_DUR,
          deltaTime
        );
      }
    }
  }

  // handle edge of screen
  if (ship.x < 0 - ship.r) {
    ship.x = canvas.width + ship.r;
  } else if (ship.x > canvas.width + ship.r) {
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r) {
    ship.y = canvas.height + ship.r;
  } else if (ship.y > canvas.height + ship.r) {
    ship.y = 0 - ship.r;
  }

  // move the lasers
  for (let i = ship.lasers.length - 1; i >= 0; i--) {
    // check distance travelled
    if (ship.lasers[i].dist > LASER_DIST * canvas.width) {
      ship.lasers.splice(i, 1);
      continue;
    }

    // handle the explosion
    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--;

      // destroy the laser after the duration is up
      if (ship.lasers[i].explodeTime === 0) {
        ship.lasers.splice(i, 1);
        continue;
      }
    } else {
      // move the laser
      ship.lasers[i].x += ship.lasers[i].xv;
      ship.lasers[i].y += ship.lasers[i].yv;

      // calculate the distance travelled
      ship.lasers[i].dist += Math.sqrt(
        Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2)
      );
    }
    // handle edge of screen
    if (ship.lasers[i].x < 0) {
      ship.lasers[i].x = canvas.width;
    } else if (ship.lasers[i].x > canvas.width) {
      ship.lasers[i].x = 0;
    }
    if (ship.lasers[i].y < 0) {
      ship.lasers[i].y = canvas.height;
    } else if (ship.lasers[i].y > canvas.height) {
      ship.lasers[i].y = 0;
    }
  }

  // move the asteroid
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].x += asteroids[i].xv;
    asteroids[i].y += asteroids[i].yv;

    // handel asteroid edge of screen
    if (asteroids[i].x < 0 - asteroids[i].r) {
      asteroids[i].x = canvas.width + asteroids[i].r;
    } else if (asteroids[i].x > canvas.width + asteroids[i].r) {
      asteroids[i].x = 0 - asteroids[i].r;
    }
    if (asteroids[i].y < 0 - asteroids[i].r) {
      asteroids[i].y = canvas.width + asteroids[i].r;
    } else if (asteroids[i].y > canvas.width + asteroids[i].r) {
      asteroids[i].y = 0 - asteroids[i].r;
    }
  }
}
