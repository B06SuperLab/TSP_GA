/**
 * 算法块
 * Created by Shengyu Yao on 2016/12/8.
 */

function GAInitialize() {
    countDistances();
    for (var i = 0; i < POPULATION_SIZE; i++) {
        population.push(randomIndividual(points.length));
    }
    setBestValue();
}

function GANextGeneration() {
    currentGeneration++;
    selection();
    crossover();
    mutation();

    //if(UNCHANGED_GENS > POPULATION_SIZE + ~~(points.length/10)) {
    //MUTATION_PROBABILITY = 0.05;
    //if(doPreciseMutate) {
    //  best = preciseMutate(best);
    //  best = preciseMutate1(best);
    //  if(evaluate(best) < bestValue) {
    //    bestValue = evaluate(best);
    //    UNCHANGED_GENS = 0;
    //    doPreciseMutate = true;
    //  } else {
    //    doPreciseMutate = false;
    //  }
    //}
    //} else {
    //doPreciseMutate = 1;
    //MUTATION_PROBABILITY = 0.01;
    //}
    setBestValue();
}

// function tribulate() {
//     //for(var i=0; i<POPULATION_SIZE; i++) {
//     for (var i = population.length >> 1; i < POPULATION_SIZE; i++) {
//         population[i] = randomIndividual(points.length);
//     }
// }

/**
 * 选择
 */
function selection() {
    var parents = [];
    var initNum = 4;
    // 选择时进行最优个体克隆，并进行两种方法的变异，以增加优良个体
    // 保证每一次迭代首位4个个体为精英个体
    parents.push(population[currentBest.bestPosition]);
    parents.push(doMutate(best.clone()));
    parents.push(pushMutate(best.clone()));
    parents.push(best.clone());

    setRoulette();
    for (var i = initNum; i < POPULATION_SIZE; i++) {
        parents.push(population[wheelOut(Math.random())]);
    }
    population = parents;
}

/**
 * 交叉
 */
function crossover() {
    var queue = [];
    for (var k = 0; k < POPULATION_SIZE; k++) {
        if (Math.random() < CROSSOVER_PROBABILITY) {
            queue.push(k);
        }
    }
    queue.shuffle();
    for (var i = 0, j = queue.length - 1; i < j; i += 2) {
        doCrossover(queue[i], queue[i + 1]);
        //oxCrossover(queue[i], queue[i+1]);
    }
}

//function oxCrossover(x, y) {	
//  //var px = population[x].roll();
//  //var py = population[y].roll();
//  var px = population[x].slice(0);
//  var py = population[y].slice(0);

//  var rand = randomNumber(points.length-1) + 1;
//  var pre_x = px.slice(0, rand);
//  var pre_y = py.slice(0, rand);

//  var tail_x = px.slice(rand, px.length);
//  var tail_y = py.slice(rand, py.length);

//  px = tail_x.concat(pre_x);
//  py = tail_y.concat(pre_y);

//  population[x] = pre_y.concat(px.reject(pre_y));
//  population[y] = pre_x.concat(py.reject(pre_x));
//}

/**
 * 交叉操作
 * @param x
 * @param y
 */
function doCrossover(x, y) {
    var child1 = getChild('next', x, y);
    var child2 = getChild('previous', x, y);
    population[x] = child1;
    population[y] = child2;
}

/**
 * 获取（产生）进化的子个体
 * @param fun
 * @param x
 * @param y
 * @returns {Array}
 */
function getChild(fun, x, y) {
    var solution = [];
    var px = population[x].clone();
    var py = population[y].clone();
    var dx, dy;
    var c = px[randomNumber(px.length)];
    solution.push(c);
    while (px.length > 1) {
        dx = px[fun](px.indexOf(c));
        dy = py[fun](py.indexOf(c));
        px.deleteByValue(c);
        py.deleteByValue(c);
        c = dis[c][dx] < dis[c][dy] ? dx : dy;
        solution.push(c);
    }
    return solution;
}

/**
 * 变异
 */
function mutation() {
    for (var i = 0; i < POPULATION_SIZE; i++) {
        if (Math.random() < MUTATION_PROBABILITY) {
            if (Math.random() > 0.5) {
                population[i] = pushMutate(population[i]);
            } else {
                population[i] = doMutate(population[i]);
            }
            i--;
        }
    }
}

// function preciseMutate(orSeq) {
//     var seq = orSeq.clone();
//     if (Math.random() > 0.5) {
//         seq.reverse();
//     }
//     var bestV = evaluate(seq);
//     for (var i = 0; i < (seq.length >> 1); i++) {
//         for (var j = i + 2; j < seq.length - 1; j++) {
//             var newSeq = swapSeq(seq, i, i + 1, j, j + 1);
//             var v = evaluate(newSeq);
//             if (v < bestV) {
//                 bestV = v;
//                 seq = newSeq;
//             }
//         }
//     }
//     //alert(bestV);
//     return seq;
// }

// function preciseMutate1(orSeq) {
//     var seq = orSeq.clone();
//     var bestV = evaluate(seq);
//
//     for (var i = 0; i < seq.length - 1; i++) {
//         var newSeq = seq.clone();
//         newSeq.swap(i, i + 1);
//         var v = evaluate(newSeq);
//         if (v < bestV) {
//             bestV = v;
//             seq = newSeq;
//         }
//     }
//     //alert(bestV);
//     return seq;
// }

// function swapSeq(seq, p0, p1, q0, q1) {
//     var seq1 = seq.slice(0, p0);
//     var seq2 = seq.slice(p1 + 1, q1);
//     seq2.push(seq[p0]);
//     seq2.push(seq[p1]);
//     var seq3 = seq.slice(q1, seq.length);
//     return seq1.concat(seq2).concat(seq3);
// }

/**
 * 变异方法一（随机对称位变换）
 * @param seq
 * @returns {*}
 */
function doMutate(seq) {
    mutationTimes++;
    // m and n refers to the actual index in the array
    // m range from 0 to length-2, n range from 2...length-m
    var m, n;
    do {
        m = randomNumber(seq.length - 2);
        n = randomNumber(seq.length);
    } while (m >= n);

    for (var i = 0, j = (n - m + 1) >> 1; i < j; i++) {
        seq.swap(m + i, n - i);
    }
    return seq;
}

/**
 * 变异方法二（切片变换）
 * @param seq
 * @returns {*}
 */
function pushMutate(seq) {
    mutationTimes++;
    var m, n;
    do {
        m = randomNumber(seq.length >> 1);
        n = randomNumber(seq.length);
    } while (m >= n);

    var s1 = seq.slice(0, m);
    var s2 = seq.slice(m, n);
    var s3 = seq.slice(n, seq.length);
    return s2.concat(s1).concat(s3).clone();
}

/**
 * 刷新最优值
 */
function setBestValue() {
    for (var i = 0; i < population.length; i++) {
        values[i] = evaluate(population[i]);
    }
    currentBest = getCurrentBest();
    if (bestValue === undefined || bestValue > currentBest.bestValue) {
        best = population[currentBest.bestPosition].clone();
        bestValue = currentBest.bestValue;
        UNCHANGED_GENS = 0;
    } else {
        UNCHANGED_GENS += 1;
    }
}

/**
 * 获取当前最优值
 * @returns {{bestPosition: number, bestValue}}
 */
function getCurrentBest() {
    var bestP = 0,
        currentBestValue = values[0];

    for (var i = 1; i < population.length; i++) {
        if (values[i] < currentBestValue) {
            currentBestValue = values[i];
            bestP = i;
        }
    }
    return {
        bestPosition: bestP
        , bestValue: currentBestValue
    }
}

/**
 * 构建轮盘赌序列
 */
function setRoulette() {
    // 计算适应度
    for (var i = 0; i < values.length; i++) {
        fitnessValues[i] = 1.0 / values[i];
    }
    // 开始构建轮盘赌序列
    var sum = 0;
    for (var i2 = 0; i2 < fitnessValues.length; i2++) {
        sum += fitnessValues[i2];
    }
    for (var i3 = 0; i3 < roulette.length; i3++) {
        roulette[i3] = fitnessValues[i3] / sum;
    }
    for (var i4 = 1; i4 < roulette.length; i4++) {
        roulette[i4] += roulette[i4 - 1];
    }
}

/**
 * 对构建完的轮盘赌序列进行淘汰操作
 * 即开始轮盘赌
 * @param rand
 * @returns {number}
 */
function wheelOut(rand) {
    var i;
    for (i = 0; i < roulette.length; i++) {
        if (rand <= roulette[i]) {
            return i;
        }
    }
}

/**
 * 随机混淆个体
 * @param n
 */
function randomIndividual(n) {
    var a = [];
    for (var i = 0; i < n; i++) {
        a.push(i);
    }
    return a.shuffle();
}

/**
 * 计算解值
 * @param individual
 */
function evaluate(individual) {
    var sum = dis[individual[0]][individual[individual.length - 1]];
    for (var i = 1; i < individual.length; i++) {
        sum += dis[individual[i]][individual[i - 1]];
    }
    return sum;
}

/**
 * 计算城市间的距离
 */
function countDistances() {
    var length = points.length;
    dis = new Array(length);
    for (var i = 0; i < length; i++) {
        dis[i] = new Array(length);
        for (var j = 0; j < length; j++) {
            dis[i][j] = ~~distance(points[i], points[j]);
        }
    }
}
