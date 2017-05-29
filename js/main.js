/**
 * Created by robha on 2017-05-21.
 */


var stage = document.getElementById('stage');
var ctx = stage.getContext('2d');
stage.width = stage.clientWidth;
stage.height = stage.clientHeight;

var Circle = function () {
    this.__constructor.apply(this, arguments);
};

Circle.prototype.__constructor = function (x, y, radius) {
  this.x = x;
  this.y = y;
  this.r = radius;
};

Circle.prototype.collides = function (circle) {
    //console.log (this, circle);
    //console.log("distance", Math.pow(this.x - circle.x,2) + Math.pow(this.y - circle.y,2));
    //console.log("radius sqrd", Math.pow(this.r + circle.r,2))
    if (Math.pow(this.x - circle.x, 2) + Math.pow(this.y - circle.y, 2) <= Math.pow(this.r + circle.r, 2))
        return true;
    return false;
}

function setStrokeAgeRainbow(l, c) {
    var frequency = 1;
    var center = 200; //128;
    var width = 55; //127;

    var red =  Math.floor( (Math.sin(frequency*l + 0) * width + center) -l) ;
    var green =  Math.floor( (Math.sin(frequency*l + 2) * width + center) -l);
    var blue =  Math.floor( (Math.sin(frequency*l + 4) * width + center) -l);

    red = Math.max(0, red);
    green = Math.max(0, green);
    blue = Math.max(0, blue);

    c.strokeStyle= 'rgba('+red+','+green+','+blue+','+1+')';
}

Circle.prototype.draw = function (ctx, static, fitness) {
    var scale = ctx.canvas.width / 100;

    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI*2, false);
    if (static) {
        ctx.fillStyle = 'green';
        ctx.fill();
    } else {
        if (fitness == 0)
            return;
        setStrokeAgeRainbow(fitness,ctx);
        ctx.stroke();
    }
};

var Obstacles = function () {
    this.__constructor.apply(this, arguments);
};

var randomCircle = function(maxRadius) {
  var r = Math.floor(Math.random() * maxRadius)+1;
  var x = Math.floor(Math.random() * (100 - r - r)) + r;
  var y = Math.floor(Math.random() * (100 - r - r)) + r;
  return new Circle(x,y,r);
};

Obstacles.prototype.__constructor = function (num) {
    this.obstacles = new Array();
    var count = 0;
    for (var i = 0; i < num; i++) {
        var c = randomCircle(10);
        while (this.collides(c)) {
            count++;
            if (count > 10000) {
                console.log ("Couldn't generate circles");
                return false;
            }
            var c = randomCircle(10);
        }
        this.obstacles.push(c);
    }
};

Obstacles.prototype.collides = function (circle) {
    for (var i = 0; i < this.obstacles.length; i++) {
        if (this.obstacles[i].collides(circle)) {
            return true;
        }
    }
    return false;
};

Obstacles.prototype.draw = function (ctx) {
    for (var i = 0; i < this.obstacles.length; i++) {
        this.obstacles[i].draw(ctx, true, false);
    }
};

//var testCircle = new Circle(50,50,50);
//testCircle.draw(ctx, false);

var objects = new Obstacles(10);
objects.draw(ctx);

var genepool = new GenePool(100, 21);

var decode = function (gene) {
    var r = gene[0] + gene[1] * 2 + gene[2] * 4 + gene[3] * 8 + gene[4] * 16 + gene[5] * 32 + gene[6] * 64;
    var x = gene[7] + gene[8] * 2 + gene[9] * 4 + gene[10] * 8 + gene[11] * 16 + gene[12] * 32 + gene[13] * 64;
    var y = gene[14] + gene[15] * 2 + gene[16] * 4 + gene[17] * 8 + gene[18] * 16 + gene[19] * 32 + gene[20] * 64;
    return new Circle(x,y,r);
};

var score = function(genepool) {
    scores = new Array();
    for (var i = 0; i < genepool.length; i++) {
        var c = decode(genepool.getGene(i));
        if (c.x < c.r || c.y < c.r || c.x >= 100 - c.r || c.y >= 100 - c.r || objects.collides(c)) {
            scores.push(0);
            c.draw(ctx, false, false);
        } else {
            scores.push(c.r);
            c.draw(ctx, false, c.r);
        }
    }
    return scores;
};

var scores = score(genepool);

var generation = 0;

var runGeneration = function () {

    var bestIndex = 0;
    var sum = 0;

    for (var i = 0; i < scores.length; i++) {
        sum += scores[i];
        if (scores[i] > scores[bestIndex])
            bestIndex = i;
    }

    var stats = "Generation " + generation + ": #" + bestIndex + " did best with a scores of " + scores[bestIndex] + ". The average score was: " + (sum/scores.length) + ".";
    $('#scores').prepend('<li>'+stats+'</li>');

    genepool.evolve(scores);
    ctx.clearRect(0,0,stage.width,stage.height);
    objects.draw(ctx);
    scores = score(genepool);
    generation++;

};

var tid = null;

$(document).ready(function() {
    $('#generate').click(function () {
        runGeneration();
    });
    $('#start').click(function () {
        tid = setInterval(runGeneration, 200);
    });
    $('#stop').click(function () {
        if (tid != null) {
            clearInterval(tid);
            tid = null;
        }
    });
});

