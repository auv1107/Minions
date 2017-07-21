class Music {

    constructor() {
        this._buffer;
        this._audioCtx = new(window.AudioContext || window.webkitAudioContext)();

        /*
         * state list
         * 1. waiting
         * 2. ready
         * 3. playing
         * 4. paused
         * 5. stop
         */
        this._state = "waiting";
    }

    init(url) {
        this.loadAudio(url, this.oninited);
    }

    play() {
        var time = this._pauseTime || 0;
        this.seekAndPlay(time);
    }

    pause() {
        this._pauseTime = this._audioCtx.currentTime;
        this._sourceNode.stop();
        this._state = "pause";
        this.onstatechange && this.onstatechange();
    }

    stop() {
        this._pauseTime = 0;
        this._sourceNode.stop();
        this._state = "stop";
        this.onstatechange && this.onstatechange();
    }

    /**
     *  time - time to start, s
     */
    seekAndPlay(time) {
        this._state = "playing";
        this.onstatechange && this.onstatechange();

        this._sourceNode = this._audioCtx.createBufferSource();
        this._sourceNode.buffer = this._buffer;
        this._sourceNode.playbackRate.value = 1.6;
        this._sourceNode.connect(this._audioCtx.destination);
        this._sourceNode.start(0, time);
    }

    currentTime() {
        return this._audioCtx.currentTime;
    }

    state() {
        return this._state;
    }

    duration() {
        return this._buffer !== undefined ? this._buffer.duration : 1;
    }

    loadAudio(url, onload) {
        var that = this;
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            console.log('onload');
            audioCtx.decodeAudioData(request.response, function (buffer) {
                that._buffer = buffer;
                that._state = "ready";
                that.onstatechange && that.onstatechange();
                console.log('decoded');
                onload && onload();
            }, function (e) {
                console.log(e.status);
                console.log(e.name);
                console.log(e.message);
                that.onloaderror && that.onloaderror();
            });
        };

        request.send();
    }
}
