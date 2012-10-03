var playerTPL = '<i class="caPlayer">' +
                    '<i class="ps paused"></i>' +
                    '<i class="next"></i>' +
                    '<i class="prev"></i>' +
                    '<i class="vol"><i class="bar"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></i></i>' +
                    '<i class="progress">' +
                        '<i class="currentTime">00:00</i>' +
                        '<i class="bar">' +
                            '<i class="barPlaying"><i></i></i>' +
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
var skinCSSRulesMainBG = ['.caPlayer'];
var skinCSSRulesVolumeBG = ['.caPlayer .vol .bar i','.caPlayer .vol'];
var sounds = [];

$(document).ready(function(){
    soundManager.setup({url: '/libs/swf/',  preferFlash: false, onready: initSounds});
});
function pausePlaying() {
    var id = this.id;
    $("#" + id + " .ps").removeClass('played').addClass('paused');
}
function finishPlaying() {
    var id = this.id;
    $("#" + id + " .ps").removeClass('played').addClass('paused');
    $("#" + id + " .next").click();
}
function startPlaying() {
    var id = this.id;
    $("#"+id+" .ps").removeClass('paused').addClass('played');
}



function initSounds() {
    $("audio").each(function(){
        var id = $(this).attr('id');
        var url = $(this).attr('src');
        var color = $(this).attr('color');
        var mainBG = $(this).attr('mainBG');
        var volBG = $(this).attr('volBG');

        initSound(id, url);
        applySkinColor(id,color, mainBG, volBG);
        bindEvents(id)
    });

}

function bindEvents(id) {
    $("#" + id + " .ps").click(play);
    $("#" + id + " .vol").click(volume);
    $("#" + id + " .progress").click(progress);

    var playlist = $("div[for="+id+"] div.song");

    if ( playlist.length > 0  ) {
        $(playlist).click(playSong);
        $("#" + id + " .progress").css('marginLeft','104px');

        $("#" + id + " .prev").show().click(prevSong);
        $("#" + id + " .next").show().click(nextSong);
    }
}

function playSong(){
    var id = $(this).parent().attr('for');
    var url = $(this).find('a').attr('href');

    initSound(id,url);
    soundManager.play(id);

    $(this).parent().find("div.song").removeClass('play');
    $(this).addClass('play');

    return false;
}
function initSound(id, url){
    var soundConfig = {
        id: id,
        url: url,
        onpause: pausePlaying,
        onfinish: finishPlaying,
        onplay: startPlaying,
        whileplaying: progressPlaying,
        whileloading: progressLoading
    };
    soundManager.destroySound(id);
    soundManager.createSound(soundConfig);
}

function applySkinColor(id,color,mainBG,volBG) {
    $("#"+id).replaceWith($(playerTPL).attr('id',id));
    for ( i=0; i < skinCSSRules.length; i++ ) {
        $("#" + id  + skinCSSRules[i]).css('backgroundColor', color);
    }
    for ( i=0; i < skinCSSRulesMainBG.length; i++ ) {
        $("#" + id  + skinCSSRulesMainBG[i]).css('backgroundColor', mainBG);
    }
    for ( i=0; i < skinCSSRulesVolumeBG.length; i++ ) {
        $("#" + id  + skinCSSRulesVolumeBG[i]).css('backgroundColor', volBG);
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

    soundManager.setVolume(id, vol);
    $("#"+id+ " .vol .bar").css('width', parseInt(30*(vol/100)) +"px");
}

function progress(e) {
    var id = $(this).parent().attr('id');
    var x = e.pageX - this.offsetLeft;
    var duration = soundManager.getSoundById(id).durationEstimate;
    var min = 35;
    var max = $(this).width()-35;
    var pos = 0;

    if ( x < min) {
        pos = 0;
    } else if ( x > max) {
        pos = 1;
    } else {
        pos = ( x - min ) / max;
    }

    soundManager.setPosition(id,parseInt(pos*duration));
    soundManager.play(id);
}

function play() {
    var id = $(this).parent().attr('id');
    if ( $(this).hasClass('paused') ) {
        soundManager.play(id);
    } else {
        soundManager.pause(id);
    }
}

function nextSong() {
    var id = $(this).parent().attr('id');

    var nextSong = $("div[for="+id+"] div.song.play").next();

    if ( nextSong.hasClass('song') ) {
        nextSong.click();
    } else {
        $("div[for="+id+"] div.song:first-child").click();
    }
}

function prevSong() {
    var id = $(this).parent().attr('id');

    var prevSong = $("div[for="+id+"] div.song.play").prev();

    if ( prevSong.hasClass('song') ) {
        prevSong.click();
    } else {
        $("div[for="+id+"] div.song:last-child").click();
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

function ms2time(ms) {
    var sec = parseInt(ms/1000);
    var min = parseInt(sec/60)
    var sec = sec % 60;

    return min + ":" + ( sec < 10 ? '0' + sec : sec);
}