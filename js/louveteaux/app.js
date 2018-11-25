
String.prototype.trunc = String.prototype.trunc || function(n){
    return this.length>n ? this.substr(0, n-1) + '...' : this;
};
Object.values = function(object) {
  return values = _.values(object);
}
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
function clone(obj) {
    var target = {};
    for (var i in obj)
        if (obj.hasOwnProperty(i))
            target[i] = typeof obj[i] == 'object' ? clone(obj[i]) : obj[i];
    return target;
}
function empty(val) {
    if (typeof val == 'undefined' || (typeof val == 'object' && _.isEmpty(val) ) || (typeof val != 'object' && !val)) return true;
    else return false;
}
function round(nb, precision) {
    if (typeof precision == 'undefined') precision = 0;
    return Math.round(10**precision * nb)/10**precision;
}
function exportFile(name, content, type) {
        if (typeof type == 'undefined' || !type) type = "text/csv;charset=utf-8;";
        var blob = new Blob([content], {
            type: type
        });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, name);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", name);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        // var encodedUri = encodeURI('data:text/csv;charset=utf-8'+ content);
        // window.open(encodedUri);
}
audioCtx = new(window.AudioContext || window.webkitAudioContext)();
function beep(frequency, volume, duration) {
    // beep(200, 80, 200);
    if (typeof frequency == 'undefined' || !frequency) frequency = 200;
    if (typeof volume == 'undefined' || !volume) volume = 50;
    if (typeof duration == 'undefined' || !duration) duration = 200;
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    // oscillator.type = 1;

    oscillator.start();

    setTimeout(
        function() {
          oscillator.stop();
        },
        duration
    );
};

// proj4.defs["EPSG:2950"] = "+proj=tmerc +lat_0=0 +lon_0=-73.5 +k=0.9999 +x_0=304800 +y_0=0 +ellps=GRS80 +units=m +no_defs";
// console.log(proj4(proj4.defs["EPSG:2950"]).forward([-71, 41]));
// console.log(proj4(proj4.defs["EPSG:2950"]).inverse([515126, 4543130]));

var app = angular.module('app', []);

app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);

