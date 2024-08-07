import { Laser, Thrust } from './types.ts';
import {
  FRICTION,
  SHIP_BLINK_DUR,
  SHIP_SIZE,
  SHIP_THRUST,
  SHOW_BOUNDING,
} from './constants.ts';

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
  drawExplosion: (context: CanvasRenderingContext2D) => void;
  doThrust: (context: CanvasRenderingContext2D, deltaTime: number) => void;
  drawShip: (context: CanvasRenderingContext2D, deltaTime: number) => void;
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

  drawExplosion(context: CanvasRenderingContext2D) {
    context.fillStyle = 'darkred';
    context.beginPath();
    context.arc(this.x, this.y, this.r * 1.7, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'red';
    context.beginPath();
    context.arc(this.x, this.y, this.r * 1.4, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'orange';
    context.beginPath();
    context.arc(this.x, this.y, this.r * 1.1, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'yellow';
    context.beginPath();
    context.arc(this.x, this.y, this.r * 0.8, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'white';
    context.beginPath();
    context.arc(this.x, this.y, this.r * 0.5, 0, Math.PI * 2, false);
    context.fill();
  }

  doThrust(context: CanvasRenderingContext2D, deltaTime: number) {
    if (this.thrusting && !this.dead) {
      this.thrust.x += SHIP_THRUST * Math.cos(this.a) * deltaTime;
      this.thrust.y -= SHIP_THRUST * Math.sin(this.a) * deltaTime;

      const blinkOn = this.blinkNum % 2 === 0;
      const exploding = this.explodeTime > 0;

      if (!exploding && blinkOn) {
        context.strokeStyle = 'black'; // flame color
        context.fillStyle = 'lightblue'; // flame color
        context.lineWidth = SHIP_SIZE / 15;
        context.beginPath();
        context.moveTo(
          // rear left
          this.x -
            this.r * ((2 / 3) * Math.cos(this.a) + 0.5 * Math.sin(this.a)),
          this.y +
            this.r * ((2 / 3) * Math.sin(this.a) - 0.5 * Math.cos(this.a))
        );
        context.lineWidth = 1;
        context.lineTo(
          // rear centre behind the ship
          this.x - this.r * ((6 / 3) * Math.cos(this.a)),
          this.y + this.r * ((6 / 3) * Math.sin(this.a))
        );
        context.lineTo(
          // rear right
          this.x -
            this.r * ((2 / 3) * Math.cos(this.a) - 0.5 * Math.sin(this.a)),
          this.y +
            this.r * ((2 / 3) * Math.sin(this.a) + 0.5 * Math.cos(this.a))
        );
        context.closePath();
        context.fill();
        context.stroke();
      }
    } else {
      // apply friction (slow the ship down when not thrusting)
      this.thrust.x -= FRICTION * this.thrust.x * deltaTime;
      this.thrust.y -= FRICTION * this.thrust.y * deltaTime;
    }
  }

  drawShip(context: CanvasRenderingContext2D, deltaTime: number) {
    const blinkOn = this.blinkNum % 2 === 0;
    const exploding = this.explodeTime > 0;

    if (!exploding) {
      if (blinkOn && !this.dead) {
        this.draw(this.x, this.y, this.a, context, 'black');
      }

      // handle blinking
      if (this.blinkNum > 0) {
        // reduce the blink time
        this.blinkTime--;

        // reduce the blink num
        if (this.blinkTime === 0) {
          this.blinkTime = Math.ceil(SHIP_BLINK_DUR / deltaTime);
          this.blinkNum--;
        }
      }
    } else {
      this.drawExplosion(context);
    }

    if (SHOW_BOUNDING) {
      context.strokeStyle = 'lime';
      context.beginPath();
      context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
      context.stroke();
    }
  }
}
