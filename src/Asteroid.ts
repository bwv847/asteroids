export type AsteroidInterface = {
  x: number;
  y: number;
  xv: number;
  yv: number;
  r: number;
  a: number;
  vert: number;
  offs: number[];
};

export class Asteroid implements AsteroidInterface {
  x: number;
  y: number;
  xv: number;
  yv: number;
  r: number;
  a: number;
  vert: number;
  offs: number[];

  // new Asteroid(x, y, r, speed, verticesAverage, jaggedness
  constructor(
    x: number,
    y: number,
    r: number,
    speed: number,
    verticiesAverage: number,
    jaggedness: number,
    level: number,
    deltaTime: number
  ) {
    const lvlMult = 1 + 0.1 * level;

    this.x = x;
    this.y = y;
    this.xv =
      Math.random() *
      speed *
      lvlMult *
      deltaTime *
      (Math.random() < 0.5 ? 1 : -1);
    this.yv =
      Math.random() *
      speed *
      lvlMult *
      deltaTime *
      (Math.random() < 0.5 ? 1 : -1);
    this.r = r;
    this.a = Math.random() * Math.PI * 2; // in radians
    this.vert = Math.floor(
      Math.random() * (verticiesAverage + 1) + verticiesAverage / 2
    );
    this.offs = [];

    for (let i = 0; i < this.vert; i++) {
      this.offs.push(Math.random() * jaggedness * 2 + 1 - jaggedness);
    }
  }
}
