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
    context: CanvasRenderingContext2D,
    colour: string
  ) => void;
  explode: (duration: number, deltaTime: number) => void;
  shootLaser: (speed: number, quantityLimit: number) => void;
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
    context: CanvasRenderingContext2D,
    colour: string = 'black'
  ) {
    context.strokeStyle = colour;
    context.lineWidth = SHIP_SIZE / 20;
    context.beginPath();
    context.moveTo(
      // nose of the ship
      x + (4 / 3) * this.r * Math.cos(a),
      y - (4 / 3) * this.r * Math.sin(a)
    );
    context.lineTo(
      // rear left
      x - this.r * ((2 / 3) * Math.cos(a) + Math.sin(a)),
      y + this.r * ((2 / 3) * Math.sin(a) - Math.cos(a))
    );
    context.lineTo(
      // rear right
      x - this.r * ((2 / 3) * Math.cos(a) - Math.sin(a)),
      y + this.r * ((2 / 3) * Math.sin(a) + Math.cos(a))
    );
    context.closePath();
    context.stroke();
  }

  explode(duration: number, deltaTime: number) {
    this.explodeTime = Math.ceil(duration * deltaTime);
  }

  // LASER_SPD, LASER_MAX
  shootLaser(speed: number, quantityLimit: number) {
    if (this.canShoot && this.lasers.length < quantityLimit) {
      this.lasers.push({
        x: this.x + (4 / 3) * this.r * Math.cos(this.a),
        y: this.y - (4 / 3) * this.r * Math.sin(this.a),
        // TODO: multiplying by 0.008 is a dirty fix
        // when multiplying by deltaTime, some lasers are
        // super slow
        xv: speed * Math.cos(this.a) * 0.008,
        yv: -speed * Math.sin(this.a) * 0.008,
        dist: 0,
        explodeTime: 0,
      });
    }

    // prevent further shooting
    this.canShoot = false;
  }
}
