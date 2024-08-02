import './style.css';

const canvas = document.querySelector('#asteroids-canvas') as HTMLCanvasElement;
canvas.style.width = window.innerWidth - 50 + 'px';
canvas.width = canvas.offsetWidth - 50;

canvas.style.height = window.innerHeight - 50 + 'px';
canvas.height = canvas.offsetHeight - 50;

const context = canvas.getContext('2d');

context.fillRect(20, 0, 100, 100);
