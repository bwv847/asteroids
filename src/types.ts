export type Asteroid = {
  x: number;
  y: number;
  xv: number;
  yv: number;
  r: number;
  a: number;
  vert: number;
  offs: number[];
};

export type Ship = {
  x: number;
  y: number;
  r: number;
  a: number;
  blinkNum: number;
  blinkTime: number;
  canShoot: boolean;
  dead: boolean;
  explodeTime: number;
  lasers: {
    x: number;
    y: number;
    xv: number;
    yv: number;
    dist: number;
    explodeTime: number;
  }[];
  rot: number;
  thrust: { x: number; y: number };
  thrusting: boolean;
};
