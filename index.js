var canvas = document.getElementById("viewport");
var ctx = canvas.getContext("2d");
var gamestarted = false;

var friction = 0.08;

var player = {
    speed: 0.06,
    maxspeed: 1,
    x: 0,
    y: 0,
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
    gamestarted = true;
    update();
}

function update(){
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
    }
}

document.addEventListener("readystatechange", ready);
document.addEventListener("keydown", onKey);
document.addEventListener("keyup", onKey);