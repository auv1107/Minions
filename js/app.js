'use strict';

var musiclistcontainer = new Vue({
    el: '#music-list-container',
    data: {
        files: []
    },
    methods: {
        empty: function () {
            return !this.files || this.files.length === 0;
        },
        append: function (file) {
            this.files.push(file);
        },
        collapse: function (str, length) {
            if (str.length > length) {
                return str.substr(0, length) + '...';
            }
            return str;
        },
        desc: function (file) {
            var res = "";
            var join = "";
            if (file.artist && file.artist.length > 0 &&
                file.album && file.album.length > 0) {
                join = " - ";
            }
            var res = (file.artist || "") + join + (file.album || "");

            return res;
        },
        clicked: function (file) {
            console.log('clicked');
            console.log(file);
            play(file);
        }
    }
});

var appform = new Vue({
    el: '#app-form',
    methods: {
        onchanged: function (e, c, a, b) {
            var files = this.$refs.xFile.files;

            for (var key in files) {
                if (key === "length") {
                    break;
                }

                var file = files[key];

                loadFromFile(file, function (tags) {
                    musiclistcontainer.append({
                        title: tags.title || file.name,
                        artist: tags.artist || "",
                        album: tags.album || "",
                        url: file.urn || file.name,
                        handle: file
                    });
                });
            }
        }
    }
});
