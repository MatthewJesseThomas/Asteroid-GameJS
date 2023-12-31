// Code improvements and suggestions are included in this version

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

class Player {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.translate(-this.position.x, -this.position.y);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(this.position.x + 30, this.position.y);
        ctx.lineTo(this.position.x - 10, this.position.y - 10);
        ctx.lineTo(this.position.x - 10, this.position.y + 10);
        ctx.closePath();

        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    getVertices() {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        return [
            {
                x: this.position.x + cos * 30 - sin * 0,
                y: this.position.y + sin * 30 + cos * 0,
            },
            {
                x: this.position.x + cos * -10 - sin * 10,
                y: this.position.y + sin * -10 + cos * 10,
            },
            {
                x: this.position.x + cos * -10 - sin * -10,
                y: this.position.y + sin * -10 + cos * -10,
            },
        ]
    }

    shootProjectile() {
        projectiles.push(
            new Projectile({
                position: {
                    x: this.position.x + Math.cos(this.rotation) * 30,
                    y: this.position.y + Math.sin(this.rotation) * 30,
                },
                velocity: {
                    x: Math.cos(this.rotation) * PROJECTILE_SPEED,
                    y: Math.sin(this.rotation) * PROJECTILE_SPEED,
                },
            })
        );
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = '#aebbff';
        ctx.fill();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
class Asteroid {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 50 * Math.random() + 12.5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.strokeStyle = '#aebeaa';
        ctx.stroke();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

const player = new Player(canvas.width / 2, canvas.height / 2);

player.draw();

const keys = {
    Space: {
        key: 'Space',
        pressed: false,
    },
    ArrowLeft: {
        key: 'ArrowLeft',
        pressed: false,
    },
    ArrowRight: {
        key: 'ArrowRight',
        pressed: false,
    },
};

const SPEED = 3;
const ROTATIONAL_SPEED = 0.08;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 5; // Adjust projectile speed as needed

const projectiles = [];

const asteroids = [];

const intervalId = window.setInterval(() => {
    const index = Math.floor(Math.random() * 4);
    let x, y;
    let vx, vy;
    let radius = 50 * Math.random() + 10;

    switch (index) {
        case 0: //Left Screen Side
            x = 0 - radius;
            y = Math.random() * canvas.height;
            vx = 1;
            vy = 0;
            break;
        case 1: //Bottom Screen Side
            x = Math.random() * canvas.width;
            y = canvas.height + radius;
            vx = 0;
            vy = -1;
            break;
        case 2: //Right Screen Side
            x = canvas.width + radius;
            y = Math.random() * canvas.height;
            vx = -1;
            vy = 0;
            break;
        case 3: //Top Screen Side
            x = Math.random() * canvas.width;
            y = 0 - radius;
            vx = 0;
            vy = 1;
            break;
    }

    asteroids.push(
        new Asteroid({
            position: {
                x: x,
                y: y,
            },
            velocity: {
                x: vx,
                y: vy
            },
            radius,
        })
        );
        console.log(asteroids);
}, 3000);

function circleCollision(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x;
    const yDifference = circle2.position.y - circle1.position.y;
    const distanceSquared = xDifference * xDifference + yDifference * yDifference;
    const radiiSum = circle1.radius + circle2.radius;

    if (distanceSquared < radiiSum * radiiSum) {
        console.log("Two Have Collided");
        return true;
    }
    return false;
}

function circleTriangleCollision(circle, triangle){
    // Check if the circle is colliding with any of the triangles edge's
    for (let i = 0; i < 3; i++) {
        let start = triangle[i];
        let end = triangle[(i + 1) % 3];

        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let length = Math.sqrt(dx * dx + dy * dy);

        let dot = (
            (circle.position.x - start.x) * dx +
            (circle.position.y - start.y) * dy) /
            Math.pow(length, 2)

        let closestX = start.x + dot * dx;
        let closestY = start.y + dot * dy;

        if (!isPointOnLineSegment(closestX, closestY, start, end)) {
            closestX = closestX < start.x ? start.x : end.x;
            closestY = closestY < start.y ? start.y : end.y;
        }

        dx = closestX - circle.position.x;
        dy = closestY - circle.position.y;

        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= circle.radius) {
            return true;
        }
    }
    // No Collision
    return false;
}

function isPointOnLineSegment(x, y, start, end) {
    return (
        x >= Math.min(start.x, end.x) &&
        x <= Math.min(start.x, end.x) &&
        y >= Math.min(start.y, end.y) &&
        y <= Math.min(start.y, end.y)
    )
}


function animate() {
    const animationId = window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.update();
        // Garbage Collection for Projectiles
        if (projectile.position.x + projectile.radius > canvas.width
            || projectile.position.x - projectile.radius < 0
            || projectile.position.y + projectile.radius > canvas.height
            || projectile.position.y - projectile.radius < 0) {
            projectiles.splice(i, 1);
        }
    }
    // Asteroid Management
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();
        if (circleTriangleCollision(asteroid, player.getVertices())) {
            console.log('Game Over');
            window.cancelAnimationFrame(animationId);
            clearInterval(intervalId);
        }
        // Asteroid Garbage Collection
        if (asteroid.position.x + asteroid.radius < 0
            || asteroid.position.x - asteroid.radius > canvas.width
            || asteroid.position.y + asteroid.radius < 0
            || asteroid.position.y - asteroid.radius > canvas.height) {
            asteroids.splice(i, 1);
            continue; // Move to the next asteroid (skip collision check)
        }

        // Projectiles
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            projectile.update();

            // Check collision between asteroid and projectile
            if (circleCollision(asteroid, projectile)) {
                projectiles.splice(j, 1);
                asteroids.splice(i, 1);
                break; // No need to check other projectiles or asteroids after collision
            }
        }

    }

    if (keys.Space.pressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED;
        player.velocity.y = Math.sin(player.rotation) * SPEED;
    } else {
        player.velocity.x *= FRICTION;
        player.velocity.y *= FRICTION;
    }

    if (keys.ArrowRight.pressed) {
        player.rotation += ROTATIONAL_SPEED;  
    } 
    else if (keys.ArrowLeft.pressed) {
        player.rotation -= ROTATIONAL_SPEED;
    }
}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'Space':
            console.log('Space was Pressed');
            keys.Space.pressed = true;
            break;
        case 'ArrowLeft':
            console.log('ArrowLeft was Pressed');
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowRight':
            console.log('ArrowRight was Pressed');
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowUp':
            console.log('ArrowUp was Pressed');
            player.shootProjectile();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'Space':
            console.log('Space was Released');
            keys.Space.pressed = false;
            break;
        case 'ArrowLeft':
            console.log('ArrowLeft was Released');
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            console.log('ArrowRight was Released');
            keys.ArrowRight.pressed = false;
            break;
    }
});

// HighScore Tracking
// Initialize the highscore variable from localStorage or set it to 0 if it doesn't exist
let highscore = localStorage.getItem("highscore") || 0;

// Increase the score and update the highscore if needed
let score = 0;

function increaseScore() {
    score++;
    if (score > highscore) {
        updateHighscore(score);
    }
    // Update the score display on the page
    document.getElementById("highscore").innerText = score;
}

// Update highscore function
function updateHighscore(newScore) {
    highscore = newScore;
    // Update the highscore display on the page
    document.getElementById("highscore").innerText = highscore;
    // Store the highscore in localStorage to persist it
    localStorage.setItem("highscore", highscore);
}

// Reset highscore function
function resetHighscore() {
    score = 0;
    // Update the score display on the page
    document.getElementById("highscore").innerText = score;
    // Reset the highscore in localStorage
    localStorage.setItem("highscore", score);
}

// Attach resetHighscore() function to the reset button
document.getElementById("resetButton").addEventListener("click", function () {
    resetHighscore();
});