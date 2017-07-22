var music = new Music();
music.init('assets/Alessia.mp3');

var playbtn = new Vue({
    el: '#play-btn',
    methods: {
        playing: function () {
            return music.state() === "playing";
        },
        clicked: function () {
            if (this.playing()) {
                music.pause();
                this.$el.src = 'assets/play.svg';
            } else {
                music.play();
                this.$el.src = 'assets/pause.svg';
            }
        }
    }
})

var progress = new Vue({
    el: '#progress',
    methods: {
        ratio: function () {
            return music.currentTime * 100 / music.duration;
        }
    }
})

music.onended = function () {
    console.log("onended");
    if (playbtn) {
        playbtn.$el.src = 'assets/pause.svg';
    }
}

music.onaudioprocess = function () {
    console.log(music._m + ':' + music._s);
    var ratio = music.currentTime() / 1000 * 100 / music.duration();
    console.log(ratio);
    progress.$refs.progressInside.style.width = ratio + "%";
}
