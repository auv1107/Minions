class Music {

    constructor() {
        this._buffer;
        this._audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        this._currentTime = 0;
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
        this._pauseTime = this._currentTime;
        this._state = "pause";
        this.onstatechange && this.onstatechange();
        this._sourceNode.stop();
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

        this._initNode();

        this._sourceNode.buffer = this._buffer;
        this._sourceNode.playbackRate.value = 1.6;

        this._connectNode();

        this._oldTime = new Date();
        this._currentTime = time;
        var that = this;
        this._scriptProcessorNode.onaudioprocess = function (event) {
            console.log("onaudioprocess");
            var inputBuffer = event.inputBuffer;
            var outputBuffer = event.outputBuffer;
            var now = Date.now();
            var pastTime = now - that._oldTime;
            for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                let inputData = inputBuffer.getChannelData(channel);
                let outputData = outputBuffer.getChannelData(channel);
                for (let i = 0; i < inputBuffer.length; i++)
                    outputData[i] = inputData[i];
            }
            that._currentTime += pastTime;
            that._proceessTime += pastTime;
            that._curt = that._currentTime / 1000;
            that._m = parseInt(that._curt / 60);
            that._s = parseInt(that._curt % 60);
            that._oldTime = now;
            if (that._proceessTime > 500) {
                that._proceessTime = 0;
                that.emit({
                    type: "proceess",
                    message: event
                });
            }
            that.onaudioprocess && that.onaudioprocess();
        };

        this._sourceNode.onended = function () {
            if (that._state !== "pause") {
                that._pauseTime = 0;
                that._state = "stop";
                that.onstatechange && that.onstatechange();
                that.onended && that.onended();
            }
            that._disconnectNode();
        }
        this._sourceNode.start(0, time / 1000);
    }

    _initNode() { //初始化音源节点
        this._sourceNode = this._audioCtx.createBufferSource(); //创建音源节点，用于读取音源
        this._scriptProcessorNode = this._audioCtx.createScriptProcessor(4096, 2, 2);
    }

    _disconnectNode() { //断开当前节点，在暂停或停止时执行
        try {
            this._scriptProcessorNode.onaudioprocess = null;
            this._sourceNode.onended = null;
            this._sourceNode.disconnect(this._scriptProcessorNode); //旧节点断开连接
            this._scriptProcessorNode.disconnect(this._audioCtx.destination); //旧节点断开连接
            delete this._sourceNode.buffer;
            this._sourceNode = null;
            this._scriptProcessorNode = null;
        } catch (e) {
            console.log(e);
        }
    }

    _connectNode() { //连接节点，总是连接最新的节点
        this._sourceNode.connect(this._scriptProcessorNode); //连接新节点
        this._scriptProcessorNode.connect(this._audioCtx.destination); //连接新节点
    }

    currentTime() {
        return this._currentTime;
    }

    state() {
        return this._state;
    }

    duration() {
        return this._buffer !== undefined ? this._buffer.duration : 0;
    }

    loadAudio(url, onload) {
        var that = this;
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            console.log('onload');
            that._audioCtx.decodeAudioData(request.response, function (buffer) {
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
