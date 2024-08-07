import { Asteroid, AsteroidInterface } from './Asteroid.ts';
import {
  ASTEROID_AVERAGE_VERTICES,
  ASTEROIDS_JAGGEDNESS,
  ASTEROIDS_STARTING_MAX_SPEED,
  ASTEROIDS_STARTING_NUMBER,
  ASTEROIDS_STARTING_SIZE,
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
}
