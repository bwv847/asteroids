import { Laser, Thrust } from './types.ts';

export type ShipInterface = {
  x: number;
  y: number;
  r: number;
  a: number;
  blinkNum: number;
  blinkTime: number;
  canShoot: boolean;
  dead: boolean;
  explodeTime: number;
  lasers: Laser[];
  rot: number;
  thrusting: boolean;
  thrust: Thrust;
};

export class Ship implements ShipInterface {
  x: number;
  y: number;
  r: number;
  a: number;
  blinkNum: number;
  blinkTime: number;
  canShoot: boolean;
  dead: boolean;
  explodeTime: number;
  lasers: Laser[];
  rot: number;
  thrusting: boolean;
  thrust: Thrust;

  constructor(
    canvas: HTMLCanvasElement,
    size: number,
    invisibilityDuration: number,
    blinkDuration: number,
    deltaTime: number
  ) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.r = size;
    this.a = (90 / 180) * Math.PI;
    this.blinkNum = Math.ceil(invisibilityDuration / blinkDuration);
    this.blinkTime = Math.ceil(blinkDuration / deltaTime);
    this.canShoot = true;
    this.dead = false;
    this.explodeTime = 0;
    this.lasers = [];
    this.rot = 0;
    this.thrusting = false;
    this.thrust = { x: 0, y: 0 };
  }
}
