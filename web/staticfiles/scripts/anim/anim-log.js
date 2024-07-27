console.log("Script is running");

const canvas = document.getElementById('#background-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let x = canvas.width / 2;
let y = canvas.height / 2;
let radius = 50;
let dx = 2;
let dy = 2;

function drawCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function update() {
    drawCircle();

    if (x + radius > canvas.width || x - radius < 0) {
        dx = -dx;
    }
    if (y + radius > canvas.height || y - radius < 0) {
        dy = -dy;
    }

    x += dx;
    y += dy;

    requestAnimationFrame(update);
}

update();


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
