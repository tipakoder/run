var canvas = document.getElementById("viewport");
var ctx = canvas.getContext("2d");
var gamestarted = false;

var friction = 0.08;

var game = {
    themeSound: null,
    shotSound: null,
    timerShot: null,
    timerSpawnEnemy: null,
    background: null,
    backgroundFrame: 1,
    spawnEnemy: function(){
        enemy.new(1);
    },
    changeBackground: function(){
        game.backgroundFrame++;
        if(game.backgroundFrame > 10) game.backgroundFrame = 1;
        switch(game.backgroundFrame){
            case 1:
            case 6:
                game.background = resources.get("bg1");
                break;
            case 2:
            case 7:
                game.background = resources.get("bg2");
                break;
            case 3:
            case 8:
                game.background = resources.get("bg3");
                break;
            case 4:
            case 9:
                game.background = resources.get("bg4");
                break;
            case 5:
            case 10:
                game.background = resources.get("bg5");
                break;
            default:
                game.background = resources.get("bg1");
                break;
        }
    },
    timerBackground: null,
    renderBackground: function(){
        ctx.drawImage(game.background, 0 - player.x, 0 - player.y, canvas.width*2, canvas.height*2);
    },
    timerFuel: null,
    lossFuel: function(){
        player.fuel -= 2;
    },
    timerSpawnFuel: null,
    spawnFuel: function(){
        points.fuel.new();
    },
    timerSpawnHealt: null,
    spawnHealt: function(){
        points.heal.new();
    }
}

var points = {
    fuel: {
        list: [],
        new: function(){
            let sizeZone = Math.round(canvas.width/5);
            let e = randomInteger(0, 5);
            points.fuel.list.push({x: randomInteger(sizeZone*e, (sizeZone*e)+sizeZone), y: -32, speed: ((parseFloat(Math.random().toFixed(2)))+1)*4});
        }
    },
    heal: {
        list: [],
        new: function(c = null){
            let type = c;
            if(type == null) type = randomInteger(1, 3);
            let sizeZone = Math.round(canvas.width/5);
            let e = randomInteger(0, 5);
            points.heal.list.push({x: randomInteger(sizeZone*e, (sizeZone*e)+sizeZone), y: -32, speed: ((parseFloat(Math.random().toFixed(2)))+1)*4, type: type});
        }
    },
    update: function(){
        // Топливо
        for(let fuel of points.fuel.list){
            fuel.y += fuel.speed;
            // Удаляем, если не ловим
            if(fuel.y > canvas.height){
                points.fuel.list.splice(points.fuel.list.indexOf(fuel), 1);
            }
            // Ловим, если срабатывает условие
            if(fuel.x >= player.x-22 && fuel.x <= player.x+64 && fuel.y >= player.y && fuel.y <= player.y+64){
                points.fuel.list.splice(points.fuel.list.indexOf(fuel), 1);
                player.fuel += 10;
            }
        }
        // Хилки
        for(let heal of points.heal.list){
            heal.y += heal.speed;
            // Удаляем, если не ловим
            if(heal.y > canvas.height){
                points.heal.list.splice(points.heal.list.indexOf(heal), 1);
            }
            // Ловим, если срабатывает условие
            if(heal.x >= player.x-22 && heal.x <= player.x+64 && heal.y >= player.y && heal.y <= player.y+64){
                points.heal.list.splice(points.heal.list.indexOf(heal), 1);
                switch(heal.type){
                    case 1:
                        player.healt += 10;
                        break;
                    case 2:
                        player.healt += 50;
                        break;
                    case 3:
                        player.healt += 100;
                        break;
                }
            }
        }
    },
    render: function(){
        // Топливо
        for(let fuel of points.fuel.list){
            ctx.drawImage(resources.get("fuel"), fuel.x, fuel.y, 32, 32);
        }
        // Хилки
        for(let heal of points.heal.list){
            let sprite = resources.get("heal"+heal.type);
            ctx.drawImage(sprite, heal.x, heal.y, 32, 32);
        }
    }
};

var enemy = {
    list: [],
    new: function(c = null){
        let countEnemy = c;
        if(c == null) countEnemy = randomInteger(0, 4);
        let sizeZone = Math.round(canvas.width/countEnemy);
        for(let e = 0; e < countEnemy; e++){
            this.list.push({x: randomInteger(sizeZone*e, (sizeZone*e)+sizeZone), y: -32, w: 32, h: 32, speed: ((parseFloat(Math.random().toFixed(2)))+1)*4, img: resources.get("star")});
        }
    },
    update: function(){
        for(let it of this.list){
            it.y += it.speed;
            if(it.y+it.h > canvas.height){
                this.list.splice(this.list.indexOf(it), 1);
                this.new(1);
            }
            // Коллизия с игроком
            if(it.x >= player.x-22 && it.x <= player.x+64 && it.y >= player.y && it.y <= player.y+64){
                this.list.splice(this.list.indexOf(it), 1);
                // player.healt -= 10 * (it.speed/10);
                player.healt -= it.speed;

                let damageAudio = audio.get("damage");
                damageAudio.volume = 0.1;
                damageAudio.playbackRate = 2.5;
                damageAudio.play();
            }
        }
    },
    render: function(){
        for(let it of this.list){
            ctx.drawImage(resources.get("star"), it.x, it.y, it.w, it.h);
        }
    }
}

var player = {
    healt: 100,
    score: 0,
    fuel: 100,
    speed: 0.5,
    maxspeed: 4,
    x: (canvas.width / 2) - 32,
    y: canvas.height - (canvas.height / 3),
    velocityx: 0,
    velocityy: 0,
    states: {left: false, right: false, shot: false},
    bullet: [],
    shotTime: 0,
    canShot: true,
    canMove: true,
    update: function(){
        // Смерть
        if(player.healt <= 0){
            player.healt = 0;
            gamestarted = false;
            document.getElementById("death").style.display = "flex";
            ctx.fillStyle = "red";
            ctx.globalAlpha = 1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Cпособность двигаться
        if(player.fuel <= 0){
            player.fuel = 0;
            player.canMove = false;
        }
        if(player.fuel > 0 && !(player.canMove)) player.canMove = true;
        // Способность стрелять
        if(player.shotTime > 30 && player.canShot){
            player.canShot = false;
            setTimeout(function(){
                player.shotTime = 0;
                player.canShot = true;
            }, 3000);
            player.velocityy -= 0.05;
        }
        // Пули летят
        for(let b of this.bullet){
            b.y -= 5;
            // Проверяем столкновение со звёдами
            for(let it of enemy.list){
                if(b.x >= it.x && b.x <= it.x+32 && b.y >= it.y && b.y <= it.y+32){
                    enemy.list.splice(enemy.list.indexOf(it), 1);
                    this.bullet.splice(this.bullet.indexOf(b), 1);
                }
            }
        }
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
        // Противодействие ускорению корабля
        if( (((!player.states.shot) && player.velocityy > 0) || !player.canShot) ){
            if(player.y > (canvas.height - (canvas.height / 3))) player.velocityy = 0;
            else player.velocityy -= 0.05;
        }
        // Движение влево
        if(player.states.left && player.canMove){
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
        if(player.states.right && player.canMove){
            if(this.x+this.velocityx < canvas.width-64){
                this.velocityx += this.speed;
            } else {
                player.states.right = false;
                this.x = canvas.width-64;
                this.velocityx = 0;
            }
            if(this.velocityx > this.maxspeed){
                this.velocityx = this.maxspeed;
            }
        }
        if(player.canMove){
            this.velocityx = parseFloat(this.velocityx.toFixed(2));
            this.velocityy = parseFloat(this.velocityy.toFixed(2));
            this.x = parseFloat((this.x + this.velocityx).toFixed(2));
            this.y = parseFloat((this.y - this.velocityy).toFixed(2));
        }
    },
    render: function(){
        for(let b of this.bullet){
            ctx.fillStyle = "red";
            ctx.fillRect(b.x, b.y, 4, 16);
        }
        ctx.drawImage(resources.get("ship"), this.x, this.y, 64, 64);
        // Очки
        document.getElementById("playerScore").textContent = "Score: "+Math.round(player.score);
        // Жизни
        document.getElementById("playerHealt").textContent = "Healt: "+Math.round(player.healt);
        if(player.healt < 50) {
            ctx.fillStyle = "red";
            ctx.globalAlpha = 1-(player.healt/100)-0.5;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalAlpha = 1;
        // Топливо
        ctx.fillStyle = "orange";
        ctx.fillRect(0, canvas.height-8, (canvas.width * player.fuel)/100, 8);
    },
    shot: function(){
        if(!player.canShot) return;

        let shotAudio = audio.get("shot");
        shotAudio.volume = 0.1;
        shotAudio.playbackRate = 2.5;
        shotAudio.play();

        player.bullet.push({x: player.x + 12, y: player.y+24});
        player.bullet.push({x: player.x + 48, y: player.y+24});
        player.shotTime ++;
        
        if(player.y > canvas.height/2) player.velocityy += 0.05;

        setTimeout(function(){
            player.shotTime = 0;
        }, 4000);
    }
}

function ready() {
    // Музыка заднего фона
    game.themeSound = audio.get("theme");
    game.themeSound.loop = true;
    game.themeSound.volume = 0.04;
    document.addEventListener("click", function(){game.themeSound.play();});
    // Звуке выстрела
    game.shotSound = audio.get("shot");
    game.shotSound.volume = 0.1;
    // Запускаем игру
    startGame();
}

function startGame(){
    gamestarted = true;
    
    enemy.new();
    game.timerSpawnEnemy = setInterval(game.spawnEnemy, 2000);
    game.background = resources.get("bg1");
    game.timerBackground = setInterval(game.changeBackground, 200);
    game.timerFuel = setInterval(game.lossFuel, 2000);
    game.timerSpawnFuel = setInterval(game.spawnFuel, 10000);
    game.timerSpawnHealt = setInterval(game.spawnHealt, 5000);
    update();
}

function update(){
    enemy.update();
    points.update();
    player.update();
    render();
    if(gamestarted)
        requestAnimationFrame(update);
}

function render(){
    // Чистим, заливаем бэкграунд
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Задний фон
    game.renderBackground();
    // Отрисовка врагов
    enemy.render();
    // Отрисовка плюшек
    points.render();
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
        case "ArrowUp":
            if(e.type == "keydown"){
                player.states.shot = true;
                player.shot();
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