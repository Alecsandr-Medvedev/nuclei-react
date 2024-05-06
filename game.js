const k = 8.99 * Math.pow(10, 9);
const ks = 10e-10 * 2;
const r0 = Math.pow(10, -15)
const time = Math.pow(10, -12)
let maxID = 0;
// const temperature = 3;
// const massK = Math.pow(10, 15);
function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}
class Nuclon {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.color = "black";
        this.forceX = 0;
        this.forceY = 0;
        this.speedX = dx;
        this.speedY = dy;
        this.charge = 0;
        this.mass = 0;
        this.id = maxID;
        maxID += 1;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
     collidesWith(otherObject) {
        const distance = Math.sqrt(Math.pow(this.x - otherObject.x, 2) + Math.pow(this.y - otherObject.y, 2));
        return distance < this.radius + otherObject.radius;
    }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    update(mx, my){
        this.speedX += this.forceX / this.mass;

        this.forceX = 0;
        this.speedY += this.forceY / this.mass;
        this.forceY = 0;
        this.x += this.speedX * time;
        this.y += this.speedY * time;
        // if (this.x < 0){
        //     this.speedX = -this.speedX * temperature;
        //     this.x = 0;
        // }
        // else if (this.x > mx){
        //     this.speedX = -this.speedX * temperature;
        //     this.x = mx;
        // }
        // if (this.y < 0){
        //     this.speedY = -this.speedY * temperature;
        //     this.y = 0;
        // }
        // else if (this.y > my){
        //     this.speedY = -this.speedY * temperature;
        //     this.y = my;
        // }
        if (this.x < -10){
            this.x = mx + 10;
        }
        else if (this.x > mx + 10){
            this.x = -10;
        }
        if (this.y < -10){
            this.y = my + 10;
        }
        else if (this.y > my + 10){
            this.y = -10;
        }
    }
    applyForce(fx, fy, name){
        // if (fx + fy > 1000000){
            // console.log(fx + fy);
        // }
        this.forceX += fx;
        this.forceY += fy;
    }

}


class Proton extends Nuclon{
    constructor(x, y, dx, dy) {
        super(x, y, dx, dy);
        this.charge = 1.6022 * Math.pow(10, -19);
        this.mass = 1.672 * Math.pow(10, -15);
        this.color = "red";
    }
}

class Neitron extends Nuclon {
    constructor(x, y, dx, dy) {
        super(x, y, dx, dy);
        this.charge = 0;
        this.color = "gray";
        this.mass = 1.674 * Math.pow(10, -15);
    }
}

class Electron extends Nuclon {
    constructor(x, y, dx, dy) {
        super(x, y, dx, dy);
        this.charge = -1.6022 * Math.pow(10, -19);
        this.color = "blue";
        this.mass = 9.109 * Math.pow(10, -19);
        this.radius = 4;
    }
}

function coulombsLawForce(charge1, charge2, distance2) {
    return -k * charge1 * charge2 / distance2;
}
function strongLawForce(distance) {
    return ks * Math.exp(-distance / r0) / distance;
}
function angleBetween(obj1, obj2) {
    return Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
}

function handles(objects){
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            handleCoulombs(objects[i], objects[j]);
            handleStorngForces(objects[i], objects[j]);
            handleCollisions(objects[i], objects[j]);    
        }
    }
}

function handleCoulombs(obj1, obj2) {
    // Вычисляем расстояние между объектами
    const distance2 = (Math.pow(obj2.x - obj1.x, 2) + Math.pow(obj2.y - obj1.y, 2));
    
    if ( Math.pow(distance2, 0.5) > (obj1.radius + obj2.radius)) {
        // console.log(Math.pow(distance2, 0.5), (obj1.radius + obj2.radius) + 10);
        // Вычисляем силу между объектами с помощью закона Кулона
    const force = coulombsLawForce(obj1.charge, obj2.charge, distance2 * Math.pow(10, -27));

    // Вычисляем угол между объектами
    const angle = angleBetween(obj1, obj2);

    // Разлагаем силу на компоненты по осям X и Y
    const forceX = force * Math.cos(angle);
    const forceY = force * Math.sin(angle);
    
    // Применяем силу к объектам
    obj1.applyForce(forceX, forceY, "handleCoulombs");
    obj2.applyForce(-forceX, -forceY, "handleCoulombs");
    }
    
}

function handleStorngForces(obj1, obj2) {
    // Вычисляем расстояние между объектами
    const distance = Math.pow(Math.pow(obj2.x - obj1.x, 2) + Math.pow(obj2.y - obj1.y, 2), 0.5);
    
    if (distance < 20 && distance > (obj1.radius + obj2.radius + 1)){

        const force = strongLawForce(distance * Math.pow(10, -15));

        const angle = angleBetween(obj1, obj2);

        const forceX = force * Math.cos(angle);
        const forceY = force * Math.sin(angle);
        // console.log(force);
    // Применяем силу к объектам
        obj1.applyForce(forceX, forceY, "handleStorngForces");
        obj2.applyForce(-forceX, -forceY, "handleStorngForces");
    }

    // Вычисляем силу между объектами с помощью закона Кулона
    
}


function handleCollisions(obj1, obj2) {
    // console.log(obj1);
    if (obj1.collidesWith(obj2)) {
        // Если столкновение, перемещаем объекты, чтобы они не пересекались
        const angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
        const overlap = obj1.radius + obj2.radius - Math.sqrt(Math.pow(obj2.x - obj1.x, 2) + Math.pow(obj2.y - obj1.y, 2));
        let dx = -overlap * Math.cos(angle);
        let dy = -overlap * Math.sin(angle);
        // console.log(dx);
        if (dx > obj1.radius){
            dx = 0;
        }
        if (dy > obj1.radius){
            dy = 0;
        }
        obj1.move(-dx / 2, -dy / 2);
        obj2.move(dx / 2, dy / 2);
        // console.log(obj1.speedX / 100000000000);
        obj1.speedX = obj2.speedX = (obj1.speedX + obj2.speedX) / 2;
        obj1.speedY = obj2.speedY = (obj1.speedY + obj2.speedY) / 2;
        // console.log(obj1.speedX / 100000000000);
        // console.log(obj1, obj1.speedX, obj1.speedY);
        // console.log(obj2, obj2.speedX, obj2.speedY);
    }
}


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;

window.onresize = () => {
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
};


// var nuclons = [proton1, proton3, proton2, proton41, proton11, proton31, proton21]
var nuclons = [];



let countNeitrons = 100;
let countProtons = 100;
let pause = false;
var step = true;
document.addEventListener("keyup", function(event) {
             if (event.key === " ") {
               pause = ! pause;
               event.preventDefault();
            }
            if (event.key === "ArrowRight"){
                step = true;
                // console.log(1);
            }
            
        });
function start(){
    nuclons = [];
    var cN = countNeitrons;
    var cP = countProtons;
    while (cN > 0 ||cP > 0){
        if (cN > 0){
            nuclons.push(new Neitron(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 20000000000000 - 10000000000000, Math.random() * 20000000000000 - 10000000000000));
            cN -= 1;
        }
        if (cP > 0) {
            nuclons.push(new Proton(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 20000000000000 - 10000000000000, Math.random() * 20000000000000 - 10000000000000));
            cP -= 1;
        }
    }

}


function find(x1, y1, x2, y2){
    var cN = 0;
    var cP = 0;
    for (var i = 0; i < nuclons.length; i++){
        var nucl = nuclons[i];
        if (x1 - nucl.radius * 3 < nucl.x && x2 + nucl.radius * 3 > nucl.x && y1 - nucl.radius * 3 < nucl.y && y2 + nucl.radius * 3 > nucl.y ){
            if (nucl.charge != 0){
                cP += 1;
            }
            else{
                cN += 1;
            }
            
        }
    }
    return [cP, cN];
}
document.getElementById('neitrons').addEventListener('input', function() {countNeitrons = document.getElementById('neitrons').value});
document.getElementById('protons').addEventListener('input', function() {countProtons = document.getElementById('protons').value});
document.getElementById('start').addEventListener('click', start);
canvas.addEventListener('mousedown', function (event) {
        if (event.button == 0) {

            event.preventDefault()
            nuclons.push(new Proton(event.offsetX, event.offsetY, 0,0))
        }
        if (event.button == 2) {
            event.preventDefault()
            nuclons.push(new Neitron(event.offsetX, event.offsetY, 0,0))
        }
        if (event.button == 1){
            var nums = find(event.offsetX, event.offsetY, event.offsetX, event.offsetY);
            document.getElementById('c_neitrons').innerHTML = "n: " + nums[1];
             document.getElementById('c_protons').innerHTML = "p: " + nums[0];
            // var cN = 148;
            // var cP = 92;
            // while (cN > 0 || cP > 0){
            //     if (cN > 0){
            //         nuclons.push(new Neitron(event.offsetX, event.offsetY, 0, 0));
            //         cN -= 1;
            //     }
            //     if (cP > 0) {
            //         nuclons.push(new Proton(event.offsetX, event.offsetY, 0, 0));
            //         cP -= 1;
            //     }
            // }
        }
});
// document.getElementById('pause').addEventListener('click', function () {pause = not pause;});

function gameLoop() {
    // console.log(proton1.speedX, proton1.speedY);
    
    if (! pause){
        // console.log(proton1.speedX / 100000000000);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < nuclons.length; i++){
            // console.log(step);
        if (step) {
            nuclons[i].update(canvas.width, canvas.height);
        }
        
        
    }
        if (step) {
            handles(nuclons);
        }
        // step = false;
        
    }
    for (var i = 0; i < nuclons.length; i++){
        nuclons[i].draw(ctx);
    }
    // sleep(200);

    requestAnimationFrame(gameLoop);
}


gameLoop();
