var playerTPL = '<i class="caPlayer">' +
                    '<i class="ps paused"></i>' +
                    '<i class="vol"><i class="bar"></i></i>' +
                    '<i class="progress">' +
                        '<i class="currentTime">00:00</i>' +
                        '<i class="bar">' +
                            '<i class="barPlaying"></i>' +
                            '<i class="barLoading"></i>' +
                        '</i>' +
                        '<i class="totalTime">00:00</i>' +
                        '</i>' +
                 '</i>';

var skinCSSRules = [
                    '.caPlayer .ps.paused',
                    '.caPlayer .progress .bar .barPlaying',
                    '.caPlayer .vol .bar',
                    '.caPlayer .ps.played'
                   ];
var sounds = [];

$(document).ready(function(){
    soundManager.setup({url: '/libs/swf/', onready: initSounds});


});

function initSounds() {
    $("audio").each(function(){
        var id = $(this).attr('id');
        var url = $(this).attr('src');
        var color = $(this).attr('color');
        var soundConfig = {
            id: id,
            url: url,
            whileplaying: progressPlaying,
            whileloading: progressLoading
            };

        soundManager.createSound(soundConfig);

        $("#"+id).replaceWith($(playerTPL).attr('id',id));
        $("#" + id + " .ps").click(play);
        $("#" + id + " .vol").click(volume);
        applySkinColor(id,color)
    });

}

function applySkinColor(id,color) {
    for ( i=0; i <skinCSSRules.length; i++ ) {
        $("#" + id  + skinCSSRules[i]).css('backgroundColor', color);
    }
}

function volume(e) {
    var id = $(this).parent().attr('id');
    var x = e.pageX - this.offsetLeft;

    var vol = 0;
    if ( x < 30) {
        vol = 0;
    } else if ( x > 60) {
        vol = 100;
    } else {
        vol = parseInt( ((x-30)/30)*100);
    }

    soundManager.setVolume(id,vol)
    $("#"+id+ " .vol .bar").css('width', parseInt(30*(vol/100)) +"px");
}

function play() {
    var id = $(this).parent().attr('id');
    if ( $(this).hasClass('paused') ) {
        soundManager.play(id);
        $(this).removeClass('paused').addClass('played');
    } else {
        soundManager.pause(id);
        $(this).removeClass('played').addClass('paused');
    }
}

function progressLoading() {
   var id = this.id;

    var current = (this.bytesLoaded/this.bytesTotal) * 100;
    $("#" + id + " .barLoading").css( 'width', current +'%');
}

function progressPlaying() {
    var id = this.id;

    var current = (this.position/this.durationEstimate)*100;
    $("#" + id + " .barPlaying").css( 'width', current +'%');
    $("#" + id + " .currentTime").html(ms2time(this.position));
    $("#" + id + " .totalTime").html(ms2time(this.durationEstimate));
}

function ms2time(ms){
    var sec = parseInt(ms/1000);
    var min = parseInt(sec/60)
    var sec = sec % 60;

    return min + ":" + ( sec < 10 ? '0' + sec : sec);
}
