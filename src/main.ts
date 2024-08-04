import {
  FRICTION,
  GAME_LIVES,
  LASER_DIST,
  LASER_EXPLODE_DUR,
  LASER_MAX,
  LASER_SPD,
  ROIDS_JAG,
  ROID_PTS_LGE,
  ROID_PTS_MED,
  ROID_PTS_SML,
  ROIDS_NUM,
  ROIDS_SIZE,
  ROIDS_SPD,
  ROIDS_VERT,
  SAVE_KEY_SCORE,
  SHIP_EXPLODE_DUR,
  SHIP_BLINK_DUR,
  SHIP_INV_DUR,
  SHIP_SIZE,
  SHIP_THRUST,
  TURN_SPEED,
  SHOW_BOUNDING,
  SHOW_CENTRE_DOT,
  TEXT_FADE_TIME,
  TEXT_SIZE,
} from './constants.ts';

import './style.css';
import { distBetweenPoints } from './utils.ts';
import { Ship, ShipInterface } from './Ship.ts';
import { Asteroid, AsteroidInterface } from './Asteroid.ts';

const cvs = document.querySelector('#asteroids-canvas') as HTMLCanvasElement;
cvs.style.width = window.innerWidth - 50 + 'px';
cvs.width = cvs.offsetWidth - 50;

cvs.style.height = window.innerHeight - 50 + 'px';
cvs.height = cvs.offsetHeight - 50;

const ctx = cvs.getContext('2d') as CanvasRenderingContext2D;

// set up the game parameters
let level: number;
let lives: number;
let roids: AsteroidInterface[];
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
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
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

function togglePause() {
  isPause = !isPause;

  if (isPause) {
    window.cancelAnimationFrame(requestAnimationId);
  } else {
    window.requestAnimationFrame(draw);
  }
}

function createAsteroidBelt() {
  roids = [];

  let x, y;
  for (let i = 0; i < ROIDS_NUM + level; i++) {
    // random asteroid location (not touching spaceship)
    do {
      x = Math.floor(Math.random() * cvs.width);
      y = Math.floor(Math.random() * cvs.height);
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);

    roids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ROIDS_SIZE / 2),
        ROIDS_SPD,
        ROIDS_VERT,
        ROIDS_JAG,
        level,
        deltaTime
      )
    );
  }
}

function destroyAsteroid(index: number) {
  const x = roids[index].x;
  const y = roids[index].y;
  const r = roids[index].r;

  // split the asteroid in two if necessary
  if (r == Math.ceil(ROIDS_SIZE / 2)) {
    roids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ROIDS_SIZE / 4),
        ROIDS_SPD,
        ROIDS_VERT,
        ROIDS_JAG,
        level,
        deltaTime
      )
    );
    roids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ROIDS_SIZE / 4),
        ROIDS_SPD,
        ROIDS_VERT,
        ROIDS_JAG,
        level,
        deltaTime
      )
    );
    score += ROID_PTS_LGE;
  } else if (r == Math.ceil(ROIDS_SIZE / 4)) {
    roids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ROIDS_SIZE / 8),
        ROIDS_SPD,
        ROIDS_VERT,
        ROIDS_JAG,
        level,
        deltaTime
      )
    );
    roids.push(
      new Asteroid(
        x,
        y,
        Math.ceil(ROIDS_SIZE / 8),
        ROIDS_SPD,
        ROIDS_VERT,
        ROIDS_JAG,
        level,
        deltaTime
      )
    );
    score += ROID_PTS_MED;
  } else {
    score += ROID_PTS_SML;
  }

  // check high score
  if (score > scoreHigh) {
    scoreHigh = score;
    localStorage.setItem(SAVE_KEY_SCORE, String(scoreHigh));
  }

  // destroy the asteroid
  roids.splice(index, 1);

  // new level when no more asteroids
  if (roids.length == 0) {
    level++;
    newLevel();
  }
}

function gameOver() {
  ship.dead = true;
  text = 'Game Over';
  textAlpha = 1.0;
}

function keyDown(event: KeyboardEvent) {
  if (ship.dead) {
    return;
  }

  switch (event.code) {
    case 'Space':
      shootLaser();
      break;
    case 'ArrowLeft':
      ship.rot = (TURN_SPEED / 180) * Math.PI * deltaTime;
      break;
    case 'ArrowUp':
      ship.thrusting = true;
      break;
    case 'ArrowRight':
      ship.rot = (-TURN_SPEED / 180) * Math.PI * deltaTime;
      break;
  }
}

function keyUp(ev: KeyboardEvent) {
  if (ship.dead) {
    return;
  }

  switch (ev.code) {
    case 'Space':
      ship.canShoot = true;
      break;
    case 'ArrowLeft':
      ship.rot = 0;
      break;
    case 'ArrowUp':
      ship.thrusting = false;
      break;
    case 'ArrowRight':
      ship.rot = 0;
      break;
  }
}

function newGame() {
  level = 0;
  lives = GAME_LIVES;
  score = 0;
  ship = new Ship(cvs, SHIP_SIZE, SHIP_INV_DUR, SHIP_BLINK_DUR, deltaTime);

  // get the high score from local storage
  const scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
  if (scoreStr == null) {
    scoreHigh = 0;
  } else {
    scoreHigh = parseInt(scoreStr);
  }

  newLevel();
}

function newLevel() {
  text = 'Level ' + (level + 1);
  textAlpha = 1.0;
  createAsteroidBelt();
}

// TODO: make degrees to radians util

function shootLaser() {
  // create the laser object
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    ship.lasers.push({
      // from the nose of the ship
      x: ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
      y: ship.y - (4 / 3) * ship.r * Math.sin(ship.a),
      // TODO: multiplying by 0.008 is a dirty fix
      // when multiplying by deltaTime, some lasers are
      // super slow
      xv: LASER_SPD * Math.cos(ship.a) * 0.008,
      yv: -LASER_SPD * Math.sin(ship.a) * 0.008,
      dist: 0,
      explodeTime: 0,
    });
  }

  // prevent further shooting
  ship.canShoot = false;
}

function update() {
  const blinkOn = ship.blinkNum % 2 == 0;
  const exploding = ship.explodeTime > 0;

  // draw space
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  // thrust the ship
  if (ship.thrusting && !ship.dead) {
    ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) * deltaTime;
    ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) * deltaTime;
    // fxThrust.play();

    // draw the thruster
    if (!exploding && blinkOn) {
      ctx.strokeStyle = 'black'; // flame color
      ctx.fillStyle = 'lightblue'; // flame color
      ctx.lineWidth = SHIP_SIZE / 15;
      ctx.beginPath();
      ctx.moveTo(
        // rear left
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      ctx.lineWidth = 1;
      ctx.lineTo(
        // rear centre behind the ship
        ship.x - ship.r * ((6 / 3) * Math.cos(ship.a)),
        ship.y + ship.r * ((6 / 3) * Math.sin(ship.a))
      );
      ctx.lineTo(
        // rear right
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // apply friction (slow the ship down when not thrusting)
    ship.thrust.x -= FRICTION * ship.thrust.x * deltaTime;
    ship.thrust.y -= FRICTION * ship.thrust.y * deltaTime;
    // fxThrust.stop();
  }

  // draw the triangular ship
  if (!exploding) {
    if (blinkOn && !ship.dead) {
      ship.draw(ship.x, ship.y, ship.a, ctx, 'black');
    }

    // handle blinking
    if (ship.blinkNum > 0) {
      // reduce the blink time
      ship.blinkTime--;

      // reduce the blink num
      if (ship.blinkTime == 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR / deltaTime);
        ship.blinkNum--;
      }
    }
  } else {
    // draw the explosion
    ctx.fillStyle = 'darkred';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
  }

  if (SHOW_BOUNDING) {
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  // draw the asteroids
  let x, y, r, a, vert, offs;
  for (let i = 0; i < roids.length; i++) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = SHIP_SIZE / 20;
    // get the asteroid properties
    x = roids[i].x;
    y = roids[i].y;
    r = roids[i].r;
    a = roids[i].a;
    vert = roids[i].vert;
    offs = roids[i].offs;
    // draw a path
    ctx.beginPath();
    ctx.moveTo(x + r * offs[0] * Math.cos(a), y + r * offs[0] * Math.sin(a));

    // draw the polygon
    for (let j = 1; j < vert; j++) {
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + (j * Math.PI * 2) / vert),
        y + r * offs[j] * Math.sin(a + (j * Math.PI * 2) / vert)
      );
    }
    ctx.closePath();
    ctx.stroke();

    if (SHOW_BOUNDING) {
      ctx.strokeStyle = 'lime';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }

  // show ship's centre dot
  if (SHOW_CENTRE_DOT) {
    ctx.fillStyle = 'red';
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
  }

  // draw the lasers
  for (let i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime == 0) {
      ctx.fillStyle = 'rgb(255, 140, 0)';
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        SHIP_SIZE / 10,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    } else {
      // draw the explesion
      ctx.fillStyle = 'orangered';
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.75,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = 'salmon';
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = 'pink';
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.25,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    }
  }

  // draw the game text
  if (textAlpha >= 0) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, ' + textAlpha + ')';
    ctx.font = 'small-caps ' + TEXT_SIZE + 'px sans-serif';
    ctx.fillText(text, cvs.width / 2, cvs.height * 0.75);
    textAlpha -= (1.0 / TEXT_FADE_TIME) * deltaTime;
  }

  // draw the lives
  let lifeColour;
  for (let i = 0; i < lives; i++) {
    lifeColour = exploding && i == lives - 1 ? 'red' : 'black';
    ship.draw(
      15 + SHIP_SIZE + i * SHIP_SIZE * 2.3,
      SHIP_SIZE + 15,
      0.5 * Math.PI,
      ctx,
      lifeColour
    );
  }

  // draw the score
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.font = TEXT_SIZE + 'px sans-serif';
  ctx.fillText(String(score), cvs.width - SHIP_SIZE / 2, SHIP_SIZE + 10);

  // draw the high score
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.font = TEXT_SIZE * 0.75 + 'px sans-serif';
  ctx.fillText('Best ' + scoreHigh, cvs.width / 2, SHIP_SIZE + 10);

  // detect laser hits on asteroids

  let ax, ay, ar, lx, ly;
  for (let i = roids.length - 1; i >= 0; i--) {
    // grab the asteroid properties
    ax = roids[i].x;
    ay = roids[i].y;
    ar = roids[i].r;

    // loop over the lasers
    for (let j = ship.lasers.length - 1; j >= 0; j--) {
      // grab the laser properties
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;

      // detect hits
      if (
        ship.lasers[j].explodeTime == 0 &&
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
    if (ship.blinkNum == 0 && !ship.dead) {
      for (let i = 0; i < roids.length; i++) {
        if (
          distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) <
          ship.r + roids[i].r
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
    // reduce the explode time
    ship.explodeTime--;

    // reset the ship after the explosion has finished
    if (ship.explodeTime == 0) {
      lives--;
      if (lives == 0) {
        gameOver();
      } else {
        ship = new Ship(
          cvs,
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
    ship.x = cvs.width + ship.r;
  } else if (ship.x > cvs.width + ship.r) {
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r) {
    ship.y = cvs.height + ship.r;
  } else if (ship.y > cvs.height + ship.r) {
    ship.y = 0 - ship.r;
  }

  // move the lasers
  for (let i = ship.lasers.length - 1; i >= 0; i--) {
    // check distance travelled
    if (ship.lasers[i].dist > LASER_DIST * cvs.width) {
      ship.lasers.splice(i, 1);
      continue;
    }

    // handle the explosion
    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--;

      // destroy the laser after the duration is up
      if (ship.lasers[i].explodeTime == 0) {
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
      ship.lasers[i].x = cvs.width;
    } else if (ship.lasers[i].x > cvs.width) {
      ship.lasers[i].x = 0;
    }
    if (ship.lasers[i].y < 0) {
      ship.lasers[i].y = cvs.height;
    } else if (ship.lasers[i].y > cvs.height) {
      ship.lasers[i].y = 0;
    }
  }

  // move the asteroid
  for (let i = 0; i < roids.length; i++) {
    roids[i].x += roids[i].xv;
    roids[i].y += roids[i].yv;

    // handel asteroid edge of screen
    if (roids[i].x < 0 - roids[i].r) {
      roids[i].x = cvs.width + roids[i].r;
    } else if (roids[i].x > cvs.width + roids[i].r) {
      roids[i].x = 0 - roids[i].r;
    }
    if (roids[i].y < 0 - roids[i].r) {
      roids[i].y = cvs.width + roids[i].r;
    } else if (roids[i].y > cvs.width + roids[i].r) {
      roids[i].y = 0 - roids[i].r;
    }
  }
}
