import { ShipInterface } from './Ship.ts';
import { LASER_MAX, LASER_SPD, TURN_SPEED } from './constants.ts';

export const keyDown = (
  event: KeyboardEvent,
  ship: ShipInterface,
  deltaTime: number
) => {
  if (ship.dead) {
    return;
  }

  switch (event.code) {
    case 'Space':
      ship.shootLaser(LASER_SPD, LASER_MAX);
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
};

export const keyUp = (event: KeyboardEvent, ship: ShipInterface) => {
  if (ship.dead) {
    return;
  }

  switch (event.code) {
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
};
