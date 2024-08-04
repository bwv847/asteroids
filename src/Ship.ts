import { Laser, Thrust } from './types.ts';
import { SHIP_SIZE } from './constants.ts';

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
  draw: (
    x: number,
    y: number,
    a: number,
    ctx: CanvasRenderingContext2D,
    colour: string
  ) => void;
  explode: (duration: number, deltaTime: number) => void;
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

  draw(
    x: number,
    y: number,
    a: number,
    ctx: CanvasRenderingContext2D,
    colour: string = 'black'
  ) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
      // nose of the ship
      x + (4 / 3) * this.r * Math.cos(a),
      y - (4 / 3) * this.r * Math.sin(a)
    );
    ctx.lineTo(
      // rear left
      x - this.r * ((2 / 3) * Math.cos(a) + Math.sin(a)),
      y + this.r * ((2 / 3) * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo(
      // rear right
      x - this.r * ((2 / 3) * Math.cos(a) - Math.sin(a)),
      y + this.r * ((2 / 3) * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
  }

  explode(duration: number, deltaTime: number) {
    this.explodeTime = Math.ceil(duration * deltaTime);
  }
}
