/**
 * 主程序块
 * Created by Shengyu Yao on 2016/12/8.
 */

// var OX_CROSSOVER_RATE;
// var doPreciseMutate;
// var ELITE_RATE;
var canvas;
var WIDTH, HEIGHT;
var points = [];
var running;
var canvasMinX, canvasMinY;

var POPULATION_SIZE;
var CROSSOVER_PROBABILITY;
var MUTATION_PROBABILITY;
var UNCHANGED_GENS;

var mutationTimes;
var dis;
var bestValue, best;
var currentGeneration;
var currentBest;
var population;
var values;
var fitnessValues;
var roulette;

var DIV;
var GE_TIME;

$(function () {
    init();
    initData();

    $('#addRandom_btn').click(function () {
        addRandomPoints(50);
        $('#status').text("");
        running = false;
    });
    $('#start_btn').click(function () {
        if (points.length >= 3) {
            initData();
            GAInitialize();
            running = true;
        } else {
            alert("请多添加一些节点！");
        }
    });
    $('#clear_btn').click(function () {
        // running === false;
        initData();
        points = [];
    });
    $('#stop_btn').click(function () {
        if (running === false && currentGeneration !== 0) {
            if (best.length !== points.length) {
                initData();
                GAInitialize();
            }
            running = true;
        } else {
            running = false;
        }
    });
});

function init() {
    canvas = $('#canvas')[0].getContext("2d");
    WIDTH = $('#canvas').width();
    HEIGHT = $('#canvas').height();
    setInterval(draw, 10);
    initMouse();
}

function initMouse() {
    $("canvas").click(function (evt) {
        var x;
        var y;
        if (!running) {
            canvasMinX = $("#canvas").offset().left;
            canvasMinY = $("#canvas").offset().top;
            $('#status').text("");

            x = evt.pageX - canvasMinX;
            y = evt.pageY - canvasMinY;
            points.push(new Point(x * DIV, y * DIV));
        }
    });
}

/**
 * 初始化数据
 */
function initData() {
    // ELITE_RATE = 0.3;
    // OX_CROSSOVER_RATE = 0.05;
    // doPreciseMutate = true;
    // currentBest;

    DIV = 9; // 画图相关参数，与程序逻辑无关，att48对应9、berlin52对应2、pr76对应23

    GE_TIME = 1024; // 迭代次数上限
    running = false;
    POPULATION_SIZE = 30; // 种群大小
    CROSSOVER_PROBABILITY = 0.9; // 交叉概率（0~1）
    MUTATION_PROBABILITY = 0.01; // 变异概率（0~1）
    UNCHANGED_GENS = 0;

    currentGeneration = 0; // 进化代数
    mutationTimes = 0; // 变异次数

    bestValue = undefined; // 最优个体值
    best = []; // 最优个体序列

    population = []; // or new Array(POPULATION_SIZE);
    values = new Array(POPULATION_SIZE); // 个体值序列
    fitnessValues = new Array(POPULATION_SIZE); // 适应度值序列
    roulette = new Array(POPULATION_SIZE); // 轮盘赌序列

    // points = pr76;
    // 本算法尝试过pr76求解，最优解为108137，迭代次数为800代左右，速度很快，可见通用性较强
    points = berlin52; // 加载城市数据，可根据cities.js选择att48、berlin52、pr76
}

/**
 * 添加随机点，这是扩展的小功能，与课题无关
 * @param number
 */
function addRandomPoints(number) {
    running = false;
    for (var i = 0; i < number; i++) {
        points.push(randomPoint());
    }
}


/**
 * 以下均为使用HTML5画笔类Canvas画图的函数
 * 整个程序循环在draw()函数中进行
 * draw()内部的方法是自动循环的
 */

function drawCircle(point) {
    canvas.fillStyle = '#FF0000';
    canvas.beginPath();
    canvas.arc(point.x / DIV, point.y / DIV, 3, 0, Math.PI * 2, true);
    canvas.closePath();
    canvas.fill();
}

function drawLines(array) {
    canvas.strokeStyle = '#0000FF';
    canvas.lineWidth = 1;
    canvas.beginPath();

    canvas.moveTo(points[array[0]].x / DIV, points[array[0]].y / DIV);
    for (var i = 1; i < array.length; i++) {
        canvas.lineTo(points[array[i]].x / DIV, points[array[i]].y / DIV)
    }
    canvas.lineTo(points[array[0]].x / DIV, points[array[0]].y / DIV);

    canvas.stroke();
    canvas.closePath();
}

function draw() {
    if (running) {
        GANextGeneration();
        $('#status').text(
            "城市数：" + points.length
            + "  /  种群代数：" + currentGeneration
            + "  /  变异次数："
            + mutationTimes
            + "  /  当前最优解："
            + ~~(bestValue));
        console.log(currentGeneration + " : " + ~~(bestValue));
        // if (currentGeneration === GE_TIME) {
        //     running = false;
        // }
    } else {
        $('#status').text(
            "城市数：" + points.length
            + "  /  种群代数：" + currentGeneration
            + "  /  变异次数："
            + mutationTimes
            + "  /  当前最优解："
            + ~~(bestValue));
    }
    clearCanvas();
    if (points.length > 0) {
        for (var i = 0; i < points.length; i++) {
            drawCircle(points[i]);
        }
        if (best.length === points.length) {
            drawLines(best);
        }
    }
}

function clearCanvas() {
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
}
