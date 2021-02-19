(function() {
    let loaded = {};

    let load = function(array) {
        for(let item of array) {
            let img = new Image();
            img.src = item.src;
            img.onload = function() {
                loaded[item.key] = img;
            };
        }
    }

    let get = function(key) {
        if(loaded[key] !== undefined)
            return loaded[key];
        return null;
    }

    window.resources = {
        load: load,
        get: get
    };
})();

// Подгружаем нужные спрайты
resources.load([
    // Задние фоны
    {key: "bg1", src: "bg/bg1.png"},
    {key: "bg2", src: "bg/bg2.png"},
    {key: "bg3", src: "bg/bg3.png"},
    {key: "bg4", src: "bg/bg4.png"},
    {key: "bg5", src: "bg/bg5.png"},
    // Корабль
    {key: "ship", src: "img/ship.png"},
    // Звёзды
    {key: "star", src: "img/star.png"},
    // Плюшки
    {key: "fuel", src: "img/fuel.png"},
    // Хилки
    {key: "heal1", src: "img/heal_1.png"},
    {key: "heal2", src: "img/heal_2.png"},
    {key: "heal3", src: "img/heal_3.png"},
]);