var ls = window.localStorage;
function setLsPopup() {
    ls.setItem('popup', new Date().getTime());
}
function matchTime(timestemp) {
    var nowDate = new Date().getTime();
    timestemp = timestemp || '0';
    var diff = String(nowDate) - String(timestemp);
    if (isNaN(diff)) {
        diff = 86400001
    }
    if (diff > 86400000 /*1 day , 1521504000000 /*1 week*/) {
        return true;
    } else {
        return false;
    }
}
function checkLsPopup() {
    var lsData = ls.getItem('popup');
    if (lsData == null || matchTime(lsData)) {
        return true;
    } else {
        return false;
    }
}

function checkLsTerms(){
    var lsData = ls.terms;
    if (lsData === undefined) {
        return false;
    } else {
        return true;
    }
}
function switchLsTerms() {
    var lsData = ls.terms;
    if(lsData === undefined) {
        ls.setItem('terms', true);
    } else {
        ls.removeItem('terms');
    }

}

(function () {
    if($('.terms')) {
        if(checkLsTerms()) {
            $('.terms').prop('checked', true);
        }
    }

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };

    /* HASH LINK */

    //Find all  top,bottom and Hash of each sections
    var section = $.map($(".hash-linked"), function (e) {
        var $e = $(e);
        var pos = $e.position();
        return {
            top: pos.top - 100,
            bottom: pos.top - 100 + $e.height(),
            hash: $e.attr('id')
        };
    });
    //Checking scroll
    var top = null;
    var changed = false;
    var currentHash = null;

    $(window).scroll(function () {
        var newTop = $(document).scrollTop();

        changed = newTop != top;
        if (changed) {
            top = newTop;
        }

    });

    //set up for Hash while start scroll and the checking only every 300ms to prevent FPS
    function step() {
        if (!changed) {
            return setTimeout(step, 200);
            console.log("End");
        }
        var count = section.length;
        var p;

        while (p = section[--count]) {
            if (p.top >= top || p.bottom <= top) {
                continue;
            }
            if (currentHash == p.hash) {
                break;
            }
            var scrollTop = $(document).scrollTop();
            window.location.hash = currentHash = p.hash;
            // prevent browser to scroll
            $(document).scrollTop(scrollTop);
        }
        setTimeout(step, 200);
    }

    setTimeout(step, 200);

    $('a[href*=\\#]').on('click', function (event) {
        if ($(this).attr('href') == '#Back') {
            window.history.back();
        } else {
            //event.preventDefault();
            $('html,body').animate({scrollTop: $(this.hash).offset().top}, 700);
        }
    });

    /* HASH LINK END */


    $("html").bind("mouseenter", function () {
    }).bind("mouseleave", function () {
        if (checkLsPopup()) {
            $('body').addClass('not-leave');
            setLsPopup();
        }
    });
    $('.close-button').on('click', function () {
        $('body').removeClass('not-leave');
    })


    /*Network animation*/

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    if (document.getElementById('large-header')) {
        initHeader();
        initAnimation();
        addListeners();
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width / 2, y: height / 2};

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height + 'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for (var x = 0; x < width; x = x + width / 20) {
            for (var y = 0; y < height; y = y + height / 20) {
                var px = x + Math.random() * width / 20;
                var py = y + Math.random() * height / 20;
                var p = {x: px, originX: px, y: py, originY: py};
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for (var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for (var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if (!(p1 == p2)) {
                    var placed = false;
                    for (var k = 0; k < 5; k++) {
                        if (!placed) {
                            if (closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for (var k = 0; k < 5; k++) {
                        if (!placed) {
                            if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for (var i in points) {
            var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if (!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if (document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for (var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in points) {
                // detect points in range
                if (Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if (Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if (Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to(p, 1 + 1 * Math.random(), {
            x: p.originX - 50 + Math.random() * 100,
            y: p.originY - 50 + Math.random() * 100, ease: Circ.easeInOut,
            onComplete: function () {
                shiftPoint(p);
            }
        });
    }

    // Canvas manipulation
    function drawLines(p) {
        if (!p.active) return;
        for (var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(64, 178, 3,' + p.active + ')';
            ctx.stroke();
        }
    }

    function Circle(pos, rad, color) {
        var _this = this;

        // constructor
        (function () {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function () {
            if (!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(64, 178, 3,' + _this.active + ')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    /*Network animation end*/

})();

$(function () {
    "use strict";
    $(function () {
        $(".preloader").fadeOut()
    });
    AOS.init();

    var icoRoundOneStart = moment.tz("2018-04-25 10:00", "Europe/Riga");
    var icoRoundOneEnd = moment.tz("2018-05-14 10:00", "Europe/Riga");

    $('#countdown-clock-header-main').countdown(icoRoundOneStart.toDate(), function (event) {
        $(this).html(event.strftime(
            '<div class="clock-col"><p class="clock-day clock-timer">%-D</p><p class="clock-label">Day%!d</p></div>'
            + '<div class="clock-col"><p class="clock-hours clock-timer">%H</p><p class="clock-label">Hours</p></div>'
            + '<div class="clock-col"><p class="clock-minutes clock-timer">%M</p><p class="clock-label">Minutes</p></div>'
            + '<div class="clock-col"><p class="clock-seconds clock-timer">%S</p><p class="clock-label">Seconds</p></div>'
        ));
    });

    $('#countdown-clock-header-main-2').countdown(icoRoundOneEnd.toDate(), function (event) {
        $(this).html(event.strftime(
            '<div class="clock-col"><p class="clock-day clock-timer">%-D</p><p class="clock-label">Day%!d</p></div>'
            + '<div class="clock-col"><p class="clock-hours clock-timer">%H</p><p class="clock-label">Hours</p></div>'
            + '<div class="clock-col"><p class="clock-minutes clock-timer">%M</p><p class="clock-label">Minutes</p></div>'
            + '<div class="clock-col"><p class="clock-seconds clock-timer">%S</p><p class="clock-label">Seconds</p></div>'
        ));
    });

    $('#countdown-clock-header').countdown(icoRoundOneStart.toDate(), function (event) {
        $(this).html(event.strftime(
            '<span class="data-countdown data-days" data-label="Day%!d">%-D</span>:'
            + '<span class="data-countdown data-hr" data-label="Hr">%H</span>:'
            + '<span class="data-countdown data-min" data-label="Min">%M</span>:'
            + '<span class="data-countdown data-sec" data-label="Sec">%S</span>'
        ));
    });

    $('#countdown-clock-header-2').countdown(icoRoundOneEnd.toDate(), function (event) {
        $(this).html(event.strftime(
            '<span class="data-countdown data-days" data-label="Day%!d">%-D</span>:'
            + '<span class="data-countdown data-hr" data-label="Hr">%H</span>:'
            + '<span class="data-countdown data-min" data-label="Min">%M</span>:'
            + '<span class="data-countdown data-sec" data-label="Sec">%S</span>'
        ));
    });

    $('#countdown-clock-timeline').countdown(icoRoundOneEnd.toDate(), function (event) {
        $(this).html(event.strftime(
            '<span class="data-countdown data-days" data-label="Day%!d">%-D</span>:'
            + '<span class="data-countdown data-hr" data-label="Hr">%H</span>:'
            + '<span class="data-countdown data-min" data-label="Min">%M</span>:'
            + '<span class="data-countdown data-sec" data-label="Sec">%S</span>'
        ));
    });
});


var progressStep = $('.bs-wizard-step');
var roadmap = $('.roadmap');

var addElementsOnMap = function (className) {
    roadmap.addClass(className);
}
var removeElementsFromMap = function (className) {
    roadmap.removeClass(className);
}

progressStep.on('click', function () {
    console.log($(this).data('year'));
    var yearStep = $(this).data('year');
    addElementsOnMap(yearStep);
    $(this).addClass('active').removeClass('complete');
    $(this).prevAll().each(function (i, obj) {
        $(obj).addClass('complete').removeClass('active');
        addElementsOnMap($(obj).data('year'));
    })
    $(this).nextAll().each(function (i, obj) {
        $(obj).removeClass('active').removeClass('complete');
        removeElementsFromMap($(obj).data('year'));
    });
});