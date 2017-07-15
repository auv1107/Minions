var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function loadAudio(url, cb) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        console.log('onload');
        audioCtx.decodeAudioData(request.response, function(buffer) {
            console.log('decoded');
            if (cb && cb != null) {
                cb(buffer);
            }
        }, function (e) {
            console.log(e);
        });
    };
    
    request.send();
}

function loadAudioFile(file, cb) {
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
        console.log(e);
        if (cb != null) {
            cb(e.target.value);
        }
    }
    fileReader.readAsArrayBuffer(file);
}

function play(file) {
    console.log('loading ' + file.url);
    var url = URL.createObjectURL(file.handle);
    loadAudio(url, function (buffer) {
        console.log('play');
        var sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.playbackRate.value = 1.6;
        sourceNode.connect(audioCtx.destination);
        sourceNode.start(0);
    });
}