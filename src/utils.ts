import { SHIP_SIZE, TEXT_SIZE } from './constants.ts';

export function distBetweenPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export const drawHighScore = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  highScore: number
) => {
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#000';
  context.font = TEXT_SIZE * 0.75 + 'px sans-serif';
  context.fillText('Best ' + highScore, canvas.width / 2, SHIP_SIZE + 10);
};

export const drawCurrentScore = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  score: number
) => {
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  context.fillStyle = '#000';
  context.font = TEXT_SIZE + 'px sans-serif';
  context.fillText(String(score), canvas.width - SHIP_SIZE / 2, SHIP_SIZE + 10);
};
