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

export type Laser = {
  x: number;
  y: number;
  xv: number;
  yv: number;
  dist: number;
  explodeTime: number;
};

export type Thrust = {
  x: number;
  y: number;
};
