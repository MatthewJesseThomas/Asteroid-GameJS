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

        ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = 'red';
        ctx.fill();

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
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 5; // Adjust projectile speed as needed

const projectiles = [];

function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.update();

        if (projectile.position.x + projectile.radius > canvas.width
            || projectile.position.x - projectile.radius < 0
            || projectile.position.y + projectile.radius > canvas.height
            || projectile.position.y - projectile.radius < 0) {
            projectiles.splice(i, 1);
        }
    }

    if (keys.Space.pressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED;
        player.velocity.y = Math.sin(player.rotation) * SPEED;
    } else {
        player.velocity.x *= FRICTION;
        player.velocity.y *= FRICTION;
    }

    if (keys.ArrowRight.pressed) player.rotation += ROTATIONAL_SPEED;
    else if (keys.ArrowLeft.pressed) player.rotation -= ROTATIONAL_SPEED;
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
