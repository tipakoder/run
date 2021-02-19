(function(){
    let loaded = {};

    let load = function(array) {
        for(let item of array) {
            let audio = new Audio(item.src);
            audio.load();
            audio.oncanplaythrough = function() {
                loaded[item.key] = audio;
            };
        }
    }

    let get = function(key) {
        if(loaded[key] !== undefined)
            return loaded[key];
        return null;
    }

    window.audio = {
        load: load,
        get: get
    };
})();

// Подгружаем нужные аудио
audio.load([
    {key: "theme", src: "audio/theme.wav"},
    {key: "shot", src: "audio/shot.mp3"},
]);