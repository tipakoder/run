var canvas = document.getElementById("viewport");
var ctx = canvas.getContext("2d");
var gamestarted = false;

var friction = 0.08;

var game = {
    timerSpawnEnemy: null,
    spawnEnemy: function(){
        enemy.new();
    }
}

var enemy = {
    list: [],
    new: function(c = null){
        let countEnemy = c;
        if(c == null) countEnemy = randomInteger(0, 4);
        let sizeZone = Math.round(canvas.width/countEnemy);
        for(let e = 0; e < countEnemy; e++){
            let h = randomInteger(10, 30);
            let color = Math.floor(Math.random()*16777215).toString(16);
            this.list.push({x: randomInteger(sizeZone*e, (sizeZone*e)+sizeZone), y: -h, w: randomInteger(10, 30), h: h, speed: parseFloat(Math.random().toFixed(2)), color: color});
        }
    },
    update: function(){
        for(let it of this.list){
            it.y += it.speed;
            if(it.y+it.h > canvas.height){
                this.list.splice(this.list.indexOf(it), 1);
                this.new(1);
            }
        }
    },
    render: function(){
        for(let it of this.list){
            ctx.fillStyle = "#"+it.color;
            ctx.fillRect(it.x, it.y, it.w, it.h);
        }
    }
}

var player = {
    speed: 0.06,
    maxspeed: 1,
    x: 0,
    y: canvas.height - (canvas.height / 3),
    velocityx: 0,
    velocityy: 0,
    states: {left: false, right: false},
    update: function(){
        // Сила трения
        if( (!player.states.left) && (!player.states.right) ){
            if(player.velocityx > 0){
                player.velocityx -= friction;
            } else {
                player.velocityx += friction;
            }
            if(player.velocityx > -0.05 || player.velocityx < 0.05){
                player.velocityx = 0;
            }
        }
        // Движение влево
        if(player.states.left){
            if(this.x-this.velocityx > 0){
                this.velocityx -= this.speed;
            } else {
                player.states.left = false;
                this.x = 0;
                this.velocityx = 0;
            }
            if(this.velocityx < -this.maxspeed){
                this.velocityx = -this.maxspeed;
            }
        }
        // Движение вправо
        if(player.states.right){
            if(this.x+this.velocityx < canvas.width-20){
                this.velocityx += this.speed;
            } else {
                player.states.right = false;
                this.x = canvas.width-20;
                this.velocityx = 0;
            }
            if(this.velocityx > this.maxspeed){
                this.velocityx = this.maxspeed;
            }
        }
        this.velocityx = parseFloat(this.velocityx.toFixed(2));
        this.velocityy = parseFloat(this.velocityy.toFixed(2));
        this.x = parseFloat((this.x + this.velocityx).toFixed(2));
        this.y = parseFloat((this.y - this.velocityy).toFixed(2));
    },
    render: function(){
        ctx.fillStyle = "#000";
        ctx.fillRect(this.x, this.y, 20, 20);
    }
}

function ready() {
    startGame();
}

function startGame(){
    gamestarted = true;
    enemy.new();
    game.timerSpawnEnemy = setInterval(game.spawnEnemy, 2000);
    update();
}

function update(){
    enemy.update();
    player.update();
    render();
    if(gamestarted)
        requestAnimationFrame(update);
}

function render(){
    // Чистим, заливаем бэкграунд
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Отрисовка персонажа
    player.render();
    // Отрисовка врагов
    enemy.render();
}

function onKey(e){
    console.log(e.code);
    switch(e.code){
        case "ArrowRight":
            if(e.type == "keydown"){
                player.states.right = true;
            } else {
                player.states.right = false;
            }
            break;
        case "ArrowLeft":
            if(e.type == "keydown"){
                player.states.left = true;
            } else {
                player.states.left = false;
            }
            break;
        case "ArrowUp":
            if(e.type == "keydown"){
                player.states.shot = true;
            } else {
                player.states.shot = false;
            }
            break;
    }
}

function randomInteger(min, max) {
    // получить случайное число от (min-0.5) до (max+0.5)
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

document.addEventListener("readystatechange", ready);
document.addEventListener("keydown", onKey);
document.addEventListener("keyup", onKey);