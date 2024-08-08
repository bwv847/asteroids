import { Asteroid, AsteroidInterface } from './Asteroid.ts';
import {
  ASTEROID_AVERAGE_VERTICES,
  ASTEROID_POINTS_LARGE,
  ASTEROID_POINTS_MEDIUM,
  ASTEROID_POINTS_SMALL,
  ASTEROIDS_JAGGEDNESS,
  ASTEROIDS_STARTING_MAX_SPEED,
  ASTEROIDS_STARTING_NUMBER,
  ASTEROIDS_STARTING_SIZE,
  SAVE_KEY_SCORE,
} from './constants.ts';
import { distBetweenPoints } from './utils.ts';
import { ShipInterface } from './Ship.ts';

type AsteroidBeltInterface = {
  asteroids: AsteroidInterface[];
};

export class AsteroidBelt implements AsteroidBeltInterface {
  asteroids: AsteroidInterface[];

  constructor(
    canvas: HTMLCanvasElement,
    ship: ShipInterface,
    level: number,
    deltaTime: number
  ) {
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

    this.asteroids = asteroids;
  }

  destroyAsteroid(
    index: number,
    level: number,
    deltaTime: number,
    score: { value: number },
    scoreHigh: { value: number },
    newLevel: () => void
  ) {
    const x = this.asteroids[index].x;
    const y = this.asteroids[index].y;
    const r = this.asteroids[index].r;

    // split the asteroid in two if necessary
    if (r === Math.ceil(ASTEROIDS_STARTING_SIZE / 2)) {
      this.asteroids.push(
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
      this.asteroids.push(
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
      score.value += ASTEROID_POINTS_LARGE;
    } else if (r === Math.ceil(ASTEROIDS_STARTING_SIZE / 4)) {
      this.asteroids.push(
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
      this.asteroids.push(
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
      score.value += ASTEROID_POINTS_MEDIUM;
    } else {
      score.value += ASTEROID_POINTS_SMALL;
    }

    // check high score
    if (score > scoreHigh) {
      scoreHigh = score;
      localStorage.setItem(SAVE_KEY_SCORE, String(scoreHigh));
    }

    // destroy the asteroid
    this.asteroids.splice(index, 1);

    // new level when no more asteroidBelt
    if (this.asteroids.length === 0) {
      level++;
      newLevel();
    }
  }

  moveAsteroids(canvas: HTMLCanvasElement) {
    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].x += this.asteroids[i].xv;
      this.asteroids[i].y += this.asteroids[i].yv;

      // handel screen edges
      if (this.asteroids[i].x < -this.asteroids[i].r) {
        this.asteroids[i].x = canvas.width + this.asteroids[i].r;
      }

      if (this.asteroids[i].x > canvas.width + this.asteroids[i].r) {
        this.asteroids[i].x = 0 - this.asteroids[i].r;
      }

      if (this.asteroids[i].y < -this.asteroids[i].r) {
        this.asteroids[i].y = canvas.height + this.asteroids[i].r;
      }

      if (this.asteroids[i].y > canvas.height + this.asteroids[i].r) {
        this.asteroids[i].y = 0 - this.asteroids[i].r;
      }
    }
  }
}
