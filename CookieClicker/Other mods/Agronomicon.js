/*
Cookie Clicker Agronomicon by Acharvak, 2018

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

(function() {

// ======= DATA =======

var VERSION = 2.016;
var REVISION = 1;       // <<<RELEASE: var REVISION = $REVISION;>>>
var IS_DEV = false;     // <<<RELEASE: var IS_DEV = false;>>>
var IS_BETA = false;    // <<<RELEASE: var IS_BETA = $IS_BETA;>>>

var RECIPE_AUTOUNLOCKED = 1;
var RECIPE_WEED = 2;
var RECIPE_CREATED_ON_KILL = 3;
var RECIPE_MUTATION = 4;
var RECIPE_SPREAD = 5;

var PLANT_LOCKED = 0;
var PLANT_UNLOCKABLE = 1;
var PLANT_MAYGROWEVENTUALLY = 2;
var PLANT_MAYGROW = 3;
var PLANT_WEED = 4;
var PLANT_PREMATURE_DANGER = 5;
var PLANT_PREMATURE = 6;
var PLANT_MATURE_DANGER = 7;
var PLANT_MATURE = 8;
var PLANT_UNLOCKED = 9;


var Agronomicon = undefined; // Will be set during initialization
var Game = window.Game;

/**
 * RECIPES is a list of recipes that Agronomicon must check and consider paths to unlock plants.
 * Syntax:
 * [[ plant key, number mature, number any age, max number plus one (0 if none)], [next plant key, ...], ...]
 * Agronomicon will call garden.getMuts to find the outcome of each recipe
 */
var RECIPES = [
//if (neighsM['bakerWheat']>=2) muts.push(['bakerWheat',0.2],['thumbcorn',0.05],['bakeberry',0.001]);
[['bakerWheat', 2, 0, 0]],
//if (neighsM['bakerWheat']>=1 && neighsM['thumbcorn']>=1) muts.push(['cronerice',0.01]);
[['bakerWheat', 1, 0, 0], ['thumbcorn', 1, 0, 0]],
//if (neighsM['thumbcorn']>=2) muts.push(['thumbcorn',0.1],['bakerWheat',0.05]);
[['thumbcorn', 2, 0, 0]],
//if (neighsM['cronerice']>=1 && neighsM['thumbcorn']>=1) muts.push(['gildmillet',0.03]);
[['cronerice', 1, 0, 0], ['thumbcorn', 1, 0, 0]],
//if (neighsM['cronerice']>=2) muts.push(['thumbcorn',0.02]);
[['cronerice', 2, 0, 0]],
//if (neighsM['bakerWheat']>=1 && neighsM['gildmillet']>=1) muts.push(['clover',0.03],['goldenClover',0.0007]);
[['bakerWheat', 1, 0, 0], ['gildmillet', 1, 0, 0]],
//if (neighsM['clover']>=1 && neighsM['gildmillet']>=1) muts.push(['shimmerlily',0.02]);
[['clover', 1, 0, 0], ['gildmillet', 1, 0, 0]],
//if (neighsM['clover']>=2 && neighs['clover']<5) muts.push(['clover',0.007],['goldenClover',0.0001]);
[['clover', 2, 0, 5]],
//if (neighsM['clover']>=4) muts.push(['goldenClover',0.0007]);
[['clover', 4, 0, 5]],
[['clover', 4, 1, 0]],
//if (neighsM['shimmerlily']>=1 && neighsM['cronerice']>=1) muts.push(['elderwort',0.01]);
[['shimmerlily', 1, 0, 0], ['cronerice', 1, 0, 0]],
//if (neighsM['wrinklegill']>=1 && neighsM['cronerice']>=1) muts.push(['elderwort',0.002]);
[['wrinklegill', 1, 0, 0], ['cronerice', 1, 0, 0]],

//if (neighsM['bakerWheat']>=1 && neighs['brownMold']>=1) muts.push(['chocoroot',0.1]);
[['bakerWheat', 1, 0, 0], ['brownMold', 0, 1, 0]],
//if (neighsM['chocoroot']>=1 && neighs['whiteMildew']>=1) muts.push(['whiteChocoroot',0.1]);
[['chocoroot', 1, 0, 0], ['whiteMildew', 0, 1, 0]],
//if (neighsM['whiteMildew']>=1 && neighs['brownMold']<=1) muts.push(['brownMold',0.5]);
[['whiteMildew', 1, 0, 0], ['brownMold', 0, 0, 2]],
//if (neighsM['brownMold']>=1 && neighs['whiteMildew']<=1) muts.push(['whiteMildew',0.5]);
[['brownMold', 1, 0, 0], ['whiteMildew', 0, 0, 2]],
//if (neighsM['meddleweed']>=1 && neighs['meddleweed']<=3) muts.push(['meddleweed',0.15]);
[['meddleweed', 1, 0, 4]],

//if (neighsM['shimmerlily']>=1 && neighsM['whiteChocoroot']>=1) muts.push(['whiskerbloom',0.01]);
[['shimmerlily', 1, 0, 0], ['whiteChocoroot', 1, 0, 0]],
//if (neighsM['shimmerlily']>=1 && neighsM['whiskerbloom']>=1) muts.push(['chimerose',0.05]);
[['shimmerlily', 1, 0, 0], ['whiskerbloom', 1, 0, 0]],
//if (neighsM['chimerose']>=2) muts.push(['chimerose',0.005]);
[['chimerose', 2, 0, 0]],
//if (neighsM['whiskerbloom']>=2) muts.push(['nursetulip',0.05]);
[['whiskerbloom', 2, 0, 0]],
//if (neighsM['chocoroot']>=1 && neighsM['keenmoss']>=1) muts.push(['drowsyfern',0.005]);
[['chocoroot', 1, 0, 0], ['keenmoss', 1, 0, 0]],
//if ((neighsM['cronerice']>=1 && neighsM['keenmoss']>=1) || (neighsM['cronerice']>=1 && neighsM['whiteMildew']>=1)) muts.push(['wardlichen',0.005]);
[['cronerice', 1, 0, 0], ['keenmoss', 1, 0, 2]],
[['cronerice', 1, 0, 0], ['keenmoss', 1, 1, 0]],
[['cronerice', 1, 0, 0], ['whiteMildew', 1, 0, 0]],
//if (neighsM['wardlichen']>=1 && neighs['wardlichen']<2) muts.push(['wardlichen',0.05]);
[['wardlichen', 1, 0, 2]],
//if (neighsM['greenRot']>=1 && neighsM['brownMold']>=1) muts.push(['keenmoss',0.1]);
[['greenRot', 1, 0, 0], ['brownMold', 1, 0, 0]],
//if (neighsM['keenmoss']>=1 && neighs['keenmoss']<2) muts.push(['keenmoss',0.05]);
[['keenmoss', 1, 0, 0], ['keenmoss', 0, 0, 2]],
//if (neighsM['chocoroot']>=1 && neighsM['bakeberry']>=1) muts.push(['queenbeet',0.01]);
[['chocoroot', 1, 0, 0], ['bakeberry', 1, 0, 0]],
//if (neighsM['queenbeet']>=8) muts.push(['queenbeetLump',0.001]);
[['queenbeet', 8, 0, 0]],
//if (neighsM['queenbeet']>=2) muts.push(['duketater',0.001]);
[['queenbeet', 2, 0, 8]],

//if (neighsM['crumbspore']>=1 && neighs['crumbspore']<=1) muts.push(['crumbspore',0.07]);
[['crumbspore', 1, 0, 2]],
//if (neighsM['crumbspore']>=1 && neighsM['thumbcorn']>=1) muts.push(['glovemorel',0.02]);
[['crumbspore', 1, 0, 0], ['thumbcorn', 1, 0, 0]],
//if (neighsM['crumbspore']>=1 && neighsM['shimmerlily']>=1) muts.push(['cheapcap',0.04]);
[['crumbspore', 1, 0, 0], ['shimmerlily', 1, 0, 0]],
//if (neighsM['doughshroom']>=1 && neighsM['greenRot']>=1) muts.push(['foolBolete',0.04]);
[['doughshroom', 1, 0, 0], ['greenRot', 1, 0, 0]],
//if (neighsM['crumbspore']>=2) muts.push(['doughshroom',0.005]);
[['crumbspore', 2, 0, 0]],
//if (neighsM['doughshroom']>=1 && neighs['doughshroom']<=1) muts.push(['doughshroom',0.07]);
[['doughshroom', 1, 0, 2]],
//if (neighsM['doughshroom']>=2) muts.push(['crumbspore',0.005]);
[['doughshroom', 2, 0, 0]],
//if (neighsM['crumbspore']>=1 && neighsM['brownMold']>=1) muts.push(['wrinklegill',0.06]);
[['crumbspore', 1, 0, 0], ['brownMold', 1, 0, 0]],
//if (neighsM['whiteMildew']>=1 && neighsM['clover']>=1) muts.push(['greenRot',0.05]);
[['whiteMildew', 1, 0, 0], ['clover', 1, 0, 0]],

//if (neighsM['wrinklegill']>=1 && neighsM['elderwort']>=1) muts.push(['shriekbulb',0.001]);
[['wrinklegill', 1, 0, 0], ['elderwort', 1, 0, 0]],
//if (neighsM['elderwort']>=5) muts.push(['shriekbulb',0.001]);
[['elderwort', 5, 0, 0]],
//if (neighs['duketater']>=3) muts.push(['shriekbulb',0.005]);
[['duketater', 0, 3, 0]],
//if (neighs['doughshroom']>=4) muts.push(['shriekbulb',0.002]);
[['doughshroom', 0, 4, 0]],
//if (neighsM['queenbeet']>=5) muts.push(['shriekbulb',0.001]);
[['queenbeet', 5, 0, 8]],
//if (neighs['shriekbulb']>=1 && neighs['shriekbulb']<2) muts.push(['shriekbulb',0.005]);
[['shriekbulb', 0, 1, 2]],
//if (neighsM['bakerWheat']>=1 && neighsM['whiteChocoroot']>=1) muts.push(['tidygrass',0.002]);
[['bakerWheat', 1, 0, 0], ['whiteChocoroot', 1, 0, 0]],
//if (neighsM['tidygrass']>=3 && neighsM['elderwort']>=3) muts.push(['everdaisy',0.002]);
[['tidygrass', 3, 0, 0], ['elderwort', 3, 0, 0]],
//if (neighsM['elderwort']>=1 && neighsM['crumbspore']>=1) muts.push(['ichorpuff',0.002]);
[['elderwort', 1, 0, 0], ['crumbspore', 1, 0, 0]],
]


// ======= GENERAL LOGIC =======


/**
 * Standard compare function (for Array.prototype.sort)
 */
var compare = function(a, b) {
    return (a < b ? -1 : (a > b ? 1 : 0));
}

/**
 * Calculate the probability that a plant with the given ageTick, ageTickR,
 * on a plot with given ageBoost will age by N percent or more in the next
 * tick.
 */
var calcProbAgingGT = function(N, ageTick, ageTickR, ageBoost) {
    if(N % 1 != 0) {
        throw "In calcProbAgingGT, N must be an integer, got " + N;
    }
    if(N <= 0) {
        return 1;
    }
    ageTick *= ageBoost;
    ageTickR *= ageBoost;
    var p1 = 0;
    var p2 = 0;
    var p3 = 0;
    if(ageTickR > 0) {
        // Probability that ageTick + ageTickR * Math.random() will be less than N - 1
        p1 = (N - 1 - ageTick) / ageTickR;
        p1 = Math.min(Math.max(p1, 0), 1);
        
        // Probability that ageTick + ageTickR * Math.random() will be greater than N
        p2 = (ageTickR - N + ageTick) / ageTickR;
        p2 = Math.min(Math.max(p2, 0), 1);
    } else {
        p1 = (ageTick < N - 1 ? 1 : 0);
        p2 = (ageTick >= N ? 1 : 0);
    }

    if(p1 + p2 < 1) {
        /*
         * Probability that if ageTick + ageTickR * Math.random() is between N - 1 and N,
         * it will be rounded to N. I hope my analysis of the probability disribution was
         * correct.
         */
         var a = (ageTick < N - 1 ? 0 : ageTick % 1);
         var b = (ageTick + ageTickR < N ? ageTickR % 1 : 1 - a);
         p3 = (1 - p1 - p2) * (a + b / 2);
    }
    
    return p2 + p3;
}


/**
 * Given a list of mutations (like from garden.getMuts), calculate the total
 * probability of each outcome, multiply by prior_prob and add to plantsNextTick (per plant).
 *
 * Note: the complexity is 2(N ** 2)log(2N), where N = muts.length; may be reducible,
 * but with our list sizes probably not worth it.
 */
var getMutProbs = function(muts, prior_prob, plantsNextTick) {
    var selections = [];
    selections.length = muts.length;
    var getPartMutProbs = function(i, prior_prob) {
        if(i === muts.length) {
            var num_entries = 0;
            for(var k = 0; k < selections.length; ++k) {
                if(selections[k]) {
                    ++num_entries;
                }
            }
            for(var k = 0; k < selections.length; ++k) {
                if(selections[k]) {
                    plantsNextTick[muts[k][0]].probImmature += prior_prob / num_entries;
                }
            }
        } else {
            // Assume mutation i selected
            selections[i] = true;
            getPartMutProbs(i + 1, prior_prob * muts[i][1]);
            // Assume not
            selections[i] = false;
            getPartMutProbs(i + 1, prior_prob * (1 - muts[i][1]));
        }
    }
    getPartMutProbs(0, prior_prob);
}


function GardenWrapper(garden, autoUnlocked, weedKey, weedProb, deathDrops, recipes, plantUpgrades, percentagePrecision) {
    this.garden = garden;
    this.autoUnlocked = autoUnlocked;
    this.weedKey = weedKey;
    this.weedProb = weedProb;
    this.setPercentagePrecision(percentagePrecision);
    this.plantsUnlockable = 0;

    // Plant status
    this.plantStatus = {};
    this.plantKeys = [];
    for(var plant in garden.plants) {
        // Initialize seed status
        var plantdata = garden.plants[plant];
        var SS = {
            key: plant,
            name: plantdata.name,
            plantable: plantdata.plantable,     // Is it plantable at all?
            status: (plantdata.unlocked ? PLANT_UNLOCKED : PLANT_LOCKED),       // Is the seed unlocked?
            recipes: [],                        // All recipes for this plant
            recipesUnlocked: [],                // Which recipes are unlocked (bools)
            growing: [],                        // Tiles where it's currently growing ([x1, y1, x2, y2 ...])
            mature: [],                         // Tiles where it's mature
            growingDanger: [],                  // Tiles where it's growing, but may be overtaken (contaminated) or die next tick
            canGrowNextTick: [],                // Tiles where it may start growing next tick (including contaminations)
            canGrowPotentially: [],             // Tiles where it may potentially grow (always empty if the option to check is disabled)
                                                // canGrowPotentially may be inaccurate
            wasGrowingLastTick: false,
            totalProbGrowthNextTick: 0,
        }
        this.plantStatus[plant] = SS;
        this.plantKeys.push(plant);
        // Add auto-unlocked and weeds
        if(this.autoUnlocked[plant]) {
            SS.recipes.push({type: RECIPE_AUTOUNLOCKED, prob: 1.0, html: "<b>Always unlocked</b>"});
        }
        if(plant === weedKey) {
            SS.recipes.push();
        }
    }
    
    // The weed
    if(weedKey) {
        this.plantStatus[weedKey].recipes.push({
            type: RECIPE_WEED,
            prob: Agronomicon.weedProb,
            html: "<b>Weed: grows spontaneously on empty tiles with no neighbors (" +
                    this.formatPercentage(weedProb) + " each tick)</b>",
        });
    }

    // Sort the list of keys
    this.plantKeys.sort();

    // Add death drops
    for(var parent in deathDrops) {
        var dd = deathDrops[parent];
        if(dd[2] === 0) {
            for(var i = 0; i < dd[0].length; ++i) {
                this.plantStatus[dd[0][i]].recipes.push({
                    type: RECIPE_CREATED_ON_KILL,
                    baseProb: deathDrops[parent][1] / dd[0].length,
                    ageProb: 0,
                    reqs: parent,
                    html: "May sprout from <b>" + this.plantStatus[parent].name + "</b> (AA) when it's harvested (<b>" +
                            this.formatPercentage(dd[1] / dd[0].length) + "</b>",
                });
            }
        } else {
            for(var i = 0; i < deathDrops[parent][0].length; ++i) {
                this.plantStatus[deathDrops[parent][0][i]].recipes.push({
                    type: RECIPE_CREATED_ON_KILL,
                    baseProb: dd[1] / dd[0].length,
                    ageProb: dd[2] / dd[0].length,
                    reqs: parent,
                    html: "May sprout from <b>" + this.plantStatus[parent].name + "</b> (AA) when it's harvested (up to <b>" +
                            this.formatPercentage((dd[1] + dd[2]) / dd[0].length) + "</b>, the older the better)",
                });
            }
        }
    }
    
    // Add other recipes
    for(var i = 0; i < recipes.length; ++i) {
        var pnt = {};
        for(var k = 0; k < this.plantKeys.length; ++k) {
            pnt[this.plantKeys[k]] = { probMature: 0, probImmature: 0 };
        }
        var r = recipes[i];
        r.sort(function(a, b) { return compare(garden.plants[a[0]].name, garden.plants[b[0]].name); });
        var neighs = {};
        var neighsM = {};
        var html_prereqs = '';
        var html_conds = '';
        for(var k = 0; k < r.length; ++k) {
            var pname = garden.plants[r[k][0]].name;
            neighs[r[k][0]] = r[k][1] + r[k][2];
            neighsM[r[k][0]] = r[k][1];
            if(r[k][1]) {
                if(html_prereqs) {
                    html_prereqs += ' + ';
                }
                html_prereqs += '<b>' + r[k][1] + '</b> × <b>' + pname + '</b> (M)';
            }
            if(r[k][2]) {
                if(html_prereqs) {
                    html_prereqs += ' + ';
                }
                html_prereqs += '<b>' + r[k][2] + '</b> × <b>' + pname + '</b> (AA)';
            }
            if(r[k][3]) {
                if(html_conds) {
                    html_conds += ', ';
                } else {
                    html_conds = ' if ';
                }
                if(r[k][3] === '1') {
                    html_conds += 'no <b>' + pname + '</b> (AA)';
                } else {
                    html_conds += '<b>' + pname + '</b> (AA) &lt; <b>' + r[k][3] + '</b>';
                }
            }
        }
        var muts = garden.getMuts(neighs, neighsM);
        getMutProbs(muts, 1, pnt);
        var num_outcomes = 0;
        var prob_all_outcomes = 0;
        for(var key in pnt) {
            if(pnt[key].probImmature > 0) {
                ++num_outcomes;
                prob_all_outcomes += pnt[key].probImmature;
            }
        }
        for(var key in pnt) {
            if(pnt[key].probImmature > 0) {
                var prob_oo = prob_all_outcomes - pnt[key].probImmature;
                this.plantStatus[key].recipes.push({
                    type: (neighs[key] ? RECIPE_SPREAD : RECIPE_MUTATION),
                    baseProb: pnt[key].probImmature,
                    reqs: r,
                    oo: num_outcomes - 1,
                    ooProb: prob_oo,
                    html: (neighs[key] ? 'Spread: ' : 'Mut.: ') + html_prereqs + html_conds +
                          ' = <b>' + this.formatPercentage(pnt[key].probImmature) + '</b>' +
                          (num_outcomes > 1 ? ' (+' + (num_outcomes - 1) + ' OO at ' + this.formatPercentage(prob_oo) + ')' : ''),
                });
            }
        }
    }

    // Sort all recipes for clearer overview and add plant upgrades
    for(var key in this.plantStatus) {
        this.plantStatus[key].recipes.sort(function(a, b) {
            if(a.type < b.type) {
                return -1;
            } else if(a.type > b.type) {
                return 1;
            } else {
                return (
                        a.baseProb < b.baseProb ? 1 :   //Inverse sort
                        a.baseProb > b.baseProb ? -1 :
                        compare(a.html, b.html)
                       );
            }
        });
        this.plantStatus[key].recipesUnlocked.length = this.plantStatus[key].recipes.length;
        if(plantUpgrades[key]) {
            this.plantStatus[key].upgradeName = plantUpgrades[key][0];
            this.plantStatus[key].upgradeProb = plantUpgrades[key][1];
        } else {
            this.plantStatus[key].upgradeName = null;
            this.plantStatus[key].upgradeProb = null;
        }
    }

    // Initialize zero plant maps
    this.zeroPlantMaps = [{}, {}];
    for(var i = 0; i < this.zeroPlantMaps.length; ++i) {
        var zpm = this.zeroPlantMaps[i];
        for(var k = 0; k < this.plantKeys.length; ++k) {
            zpm[this.plantKeys[k]] = 0;
        }
    }

    // Base contamination probabilities for each soil
    var bcp = [];
    var contam_map = {};
    for(var key in garden.plantContam) {
        bcp.push([key, garden.plantContam[key]]);
        contam_map[key] = { probMature: 0, probImmature: 0 };
    }
    var bcpbs = [];
    bcpbs.length = garden.soilsById.length;
    for(var i = 0; i < bcpbs.length; ++i) {
        if(i > 0) {
            for(var key in contam_map) {
                contam_map[key].probImmature = 0;
            }
        }
        var soil = garden.soilsById[i];
        var bcp2 = [];
        bcp2.length = bcp.length;
        for(var k = 0; k < bcp.length; ++k) {
            bcp2[k] = [bcp[k][0], garden.plants[bcp[k][0]].weed ? bcp[k][1] * garden.soilsById[i].weedMult : bcp[k][1]];
        }
        // Contaminations are selected basically by the same process as mutations
        getMutProbs(bcp2, 1, contam_map);
        bcpbs[i] = {};
        for(var key in contam_map) {
            if(contam_map[key].probImmature > 0) {
                bcpbs[i][key] = contam_map[key].probImmature;
            }
        }
    }
    this.baseContamProbsBySoilId = bcpbs;
    
    // Tile status
    var gpl = garden.plotLimits[garden.plotLimits.length - 1];
    this.maxPlotWidth = gpl[2] - gpl[0];
    this.maxPlotHeight = gpl[3] - gpl[1];
    this.tileStatus = [];
    this.tileStatus.length = this.maxPlotHeight;
    for(var y = 0; y < this.maxPlotHeight; ++y) {
        var tmp = [];
        tmp.length = this.maxPlotWidth;
        for(var x = 0; x < tmp.length; ++x) {
            tmp[x] = {
                unlocked: false,
                plant: null,
                underEffects: false,     // Tile is under effects from neighboring plants
                probGrowthNextTick: 0,   // Probability that the plant will do any growth (at least 1%) next tick
                probDeathNextTick: 0,    // Probability that current plant will die next tick
                plantsNextTick: {},     // The probability of every plant being in this tile next tick
                                        // (name -> {probMature, probImmature})
                probEmptyNextTick: 0,   // Probability that no plant will be growing here next tick
            };
            for(var k = 0; k < this.plantKeys.length; ++k) {
                tmp[x].plantsNextTick[this.plantKeys[k]] = {
                    probMature: 0,
                    probImmature: 0,
                }
            }
        }
        this.tileStatus[y] = tmp;
    }
}

/**
 * Format a value as percentage (up to the precision set in `this`)
 */
GardenWrapper.prototype.formatPercentage = function(value) {
    if(!this.percentagePrecision) {
        return value * 100 + '%';
    } else {
        var sign = (value < 0 ? '-' : '');
        value = Math.abs(value);
        if(value < this.minPercentage) {
            if(sign) {
                return '-' + this.minPercentageStr + 'to 0%';
            } else {
                return '<' + this.minPercentageStr;
            }
        } else {
            // Decided on floor instead of round, it is more similar to the expectations
            value = Math.floor(value * 100 * this.percentagePow10);
            var low = value % this.percentagePow10;
            var low_digits = this.percentagePrecision;
            while(low > 0 && low % 10 === 0) {
                low /= 10;
                low_digits -= 1;
            }
            if(low) {
                low = '' + low;
                while(low.length < low_digits) {
                    low = '0' + low;
                }
                low = '.' + low;
            } else {
                low = '';
            }
            var high = Math.floor(value / this.percentagePow10);
            return sign + high + low + '%';
        }
    }
}

/**
 * Set precision for percentage formatting
 */
GardenWrapper.prototype.setPercentagePrecision = function(precision) {
    if(precision < 0) {
        throw "In setPercentagePrecision: precision must be >= 0, got " + precision;
    } else {
        this.percentagePrecision = precision;
        if(!precision) {
            this.minPercentage = null;
            this.minPercentageStr = null;
            this.percentagePow10 = null;
       } else {
            this.minPercentage = Math.pow(10, -precision - 2);
            this.minPercentageStr = '' + Math.pow(10, -precision) + '%';
            this.percentagePow10 = Math.pow(10, precision);
       }       
    }
}

/**
 * Call calcPartMutationProbability on every neighbor, then calcMutationProbabilities
 */
GardenWrapper.prototype.callNextOffset = function(x, y, x_offset, y_offset, prior_prob, neighs, neighsM, plantsNextTick) {
    // Goes counter-clockwise
    var done = false;
    do {
        if(y_offset === 1) {
            ++x_offset;
            if(x_offset === 2) {
                y_offset = 0;
                x_offset = 1;
            }
        } else if(y_offset === -1) {
            if(x_offset === -1) {
                y_offset = 0;
                x_offset = -1;
            } else {
                --x_offset;
            }
        } else { // y_offset === 0
            if(x_offset === 0) {
                // Initial call to this function
                x_offset = -1;
                y_offset = 1;
            } else if(x_offset === -1) {
                done = true;
            } else {    //x_offset === 1
                y_offset = -1;
            }
        }
    } while(!done && !this.garden.isTileUnlocked(x + x_offset, y + y_offset));
    if(done) {
        return this.calcMutationProbabilities(x, y, prior_prob, neighs, neighsM, plantsNextTick);
    } else {
        var cant_change = (y_offset > 0 || y_offset === 0 && x_offset > 0);
        return this.calcPartMutationProbability(x, y, x_offset, y_offset, prior_prob, neighs, neighsM, plantsNextTick, cant_change);
    }
}

/**
 * Compute mutation probabilities (recursively called on every neighbor)
 */
GardenWrapper.prototype.calcPartMutationProbability = function(x, y, x_offset, y_offset, prior_prob, neighs, neighsM,
                                                                plantsNextTick, cant_change) {
    var plant_id = this.garden.plot[y + y_offset][x + x_offset][0] - 1;
    var plant = (plant_id >= 0 ? this.garden.plantsById[plant_id] : null);
    if(cant_change) {
        if(plant !== null) {
            var is_mature = this.garden.plot[y + y_offset][x + x_offset][1] >= plant.mature;
            ++neighs[plant.key];
            if(is_mature) {
                ++neighsM[plant.key];
            }
            this.callNextOffset(x, y, x_offset, y_offset, prior_prob, neighs, neighsM, plantsNextTick);
            --neighs[plant.key];
            if(is_mature) {
                --neighsM[plant.key];
            }
        } else {
            return this.callNextOffset(x, y, x_offset, y_offset, prior_prob, neighs, neighsM, plantsNextTick);
        }
    } else {
        var ts = this.tileStatus[y + y_offset][x + x_offset];
        for(var i = 0; i < this.plantKeys.length; ++i) {
            var key = this.plantKeys[i];
            var pnt = ts.plantsNextTick[key];
            if(!pnt.prevented) {
                if(pnt.probImmature > 0) {
                    ++neighs[key];
                    this.callNextOffset(x, y, x_offset, y_offset, prior_prob * pnt.probImmature, neighs, neighsM, plantsNextTick);
                    --neighs[key];
                }
                if(pnt.probMature > 0) {
                    ++neighs[key];
                    ++neighsM[key];
                    this.callNextOffset(x, y, x_offset, y_offset, prior_prob * pnt.probMature, neighs, neighsM, plantsNextTick);
                    --neighsM[key];
                    --neighs[key];
                }
            }
        }
        if(ts.probEmptyNextTick > 0) {
            this.callNextOffset(x, y, x_offset, y_offset, prior_prob * ts.probEmptyNextTick, neighs, neighsM, plantsNextTick);
        }
    }
}

/**
 * Sum mutation probabilities for a given combination of plants
 */
GardenWrapper.prototype.calcMutationProbabilities = function(x, y, prior_prob, neighs, neighsM, plantsNextTick) {
    var muts = this.garden.getMuts(neighs, neighsM);
    var new_muts = [];
    for(var i = 0; i < muts.length; ++i) {
        if(this.garden.plants[muts[i][0]].weed) {
            muts[i][1] *= this.garden.soilsById[this.garden.soil].weedMult * this.garden.plotBoost[y][x][2];
        } else if(this.garden.plants[muts[i][0]].fungus) {
            muts[i][1] *= this.garden.plotBoost[y][x][2];
        }
        if(muts[i][1] > 0) {
            new_muts.push([muts[i][0], Math.min(muts[i][1], 1)]);
        }
    }
    if(new_muts) {
        getMutProbs(new_muts, prior_prob, plantsNextTick);
    }
}

/**
 * Get the probability of mature neighbors in cardinal directions
 */
GardenWrapper.prototype.getMatureCardinalNeighbors = function(x, y) {
    var result = {};
    // South and east
    var coords = [[0, +1], [+1, 0]];
    for(var i = 0; i < coords.length; ++i) {
        var dxy = coords[i];
        var tile = this.garden.getTile(x + dxy[0], y + dxy[1]);
        if(tile[0] !== 0) {
            var plant = this.garden.plantsById[tile[0] - 1];
            if(tile[1] >= plant.mature) {
                result[plant.key] = 1;
            }
        }
    }
    // NORTH and same plants in the NORTH and the west
    var ts_north = (this.garden.isTileUnlocked(x, y - 1) ? this.tileStatus[y - 1][x] : null);
    var ts_west = (this.garden.isTileUnlocked(x - 1, y) ? this.tileStatus[y][x - 1] : null);
    if(ts_north) {
        for(key in ts_north.plantsNextTurn) {
            if(!result[key] && !ts_north.plantsNextTurn[key].prevented &&
                    ts_north.plantsNextTurn[key].probMature > 0) {
                if(ts_west && !ts_west.plantsNextTurn[key].prevented) {
                    result[key] = 1 - (1 - ts_north.plantsNextTurn[key].probMature)
                                           * (1 - ts_west.plantsNextTurn[key].probMature);
                } else {
                    result[key] = ts_north.plantsNextTurn[key].probMature;
                }
            }
        }
    }
    // Rest of the west
    if(ts_west) {
        for(key in ts_west.plantsNextTurn) {
            if(!result[key] && !ts_west.plantsNextTurn[key].prevented) {
                result[key] = ts_west.plantsNextTurn[key].probMature;
            }
        }
    }
    return result;
}

/**
 * Calculate probability that the tile (x, y) will have no neighbors next tick
 */
GardenWrapper.prototype.calcProbNoNeighbors = function(x, y) {
    var coords = [[-1, +1], [0, +1], [+1, +1], [+1, 0]];
    var dxy;
    for(var i = 0; i < coords.length; ++i) {
        dxy = coords[i];
        if(this.garden.isTileUnlocked(x + dxy[0], y + dxy[1]) && this.garden.plot[y + dxy[1]][x + dxy[0]][0] !== 0) {
            return 0;
        }
    }
    var result = 1;
    coords = [[+1, -1], [0, -1], [-1, -1], [-1, 0]];
    for(var i = 0; i < coords.length; ++i) {
        dxy = coords[i];
        if(this.garden.isTileUnlocked(x + dxy[0], y + dxy[1])) {
            result *= this.tileStatus[y + dxy[1]][x + dxy[0]].probEmptyNextTick;
            if(result === 0) {
                break;
            }
        }
    }
    return result;
}

/**
 * Recalculate odds for a particular tile and save in tileStatus
 */
GardenWrapper.prototype.recalculateTile = function(x, y, loops) {
    var s = this.tileStatus[y][x];
    if(!this.garden.isTileUnlocked(x, y)) {
        if(s.unlocked) {
            // The tile somehow became locked
            s.plant = null;
            s.probGrowthNextTick = 0;
            s.probDeathNextTick = 0;
            s.probEmptyNextTick = 0;
            s.underEffects = false;
        }
    } else {
        s.unlocked = true;
        for(var key in s.plantsNextTick) {
            var ss = s.plantsNextTick[key];
            ss.probMature = 0;
            ss.probImmature = 0;
        }
        var tile = this.garden.plot[y][x];
        var tile_boost = this.garden.plotBoost[y][x];
        s.underEffects = (tile_boost[0] !== 1 || tile_boost[2] !== 1);
        if(tile[0] === 0) {
            s.plant = null;
            s.probGrowthNextTick = 0;
            s.probDeathNextTick = 0;
        } else {
            s.plant = this.garden.plantsById[tile[0]-1];
            s.probGrowthNextTick = calcProbAgingGT(1, s.plant.ageTick, s.plant.ageTickR, tile_boost[0]);
            s.probDeathNextTick = (s.plant.immortal ? 0 : calcProbAgingGT(100 - tile[1], s.plant.ageTick, s.plant.ageTickR, tile_boost[0]));
        }
        if(s.plant) {
            // Contamination
            var prob_contam = 0;
            var baseContamProbs = this.baseContamProbsBySoilId[this.garden.soil];
            if(s.probDeathNextTick < 1 && !s.plant.noContam) {
                var mcn = this.getMatureCardinalNeighbors(x, y);
                for(key in baseContamProbs) {
                    if(baseContamProbs[key] && s.plant.key !== key && mcn[key]) {
                        var newplant = this.garden.plants[key];
                        var this_prob_contam = (1 - s.probDeathNextTick) * baseContamProbs[key]
                                               * Math.min(((newplant.weed || newplant.fungus) ? tile_boost[2] : 1), 1);
                        s.plantsNextTick[key].probImmature = this_prob_contam;
                        prob_contam += this_prob_contam;
                    }
                }
            }
            // Total probability of the tile being empty
            s.probEmptyNextTick = s.probDeathNextTick * (1 - prob_contam);
            // Maturity
            if(tile[1] >= s.plant.mature) {
                s.plantsNextTick[s.plant.key].probMature = (1 - s.probDeathNextTick) * (1 - prob_contam);
            } else {
                var prob_mature = calcProbAgingGT(Math.ceil(s.plant.mature - tile[1]), s.plant.ageTick,
                                                    s.plant.ageTickR, tile_boost[0]);
                s.plantsNextTick[s.plant.key].probImmature = (1 - s.probDeathNextTick)
                                                                * (1 - prob_contam) * (1 - prob_mature);
                s.plantsNextTick[s.plant.key].probMature = (1 - s.probDeathNextTick) * (1 - prob_contam) * prob_mature;
            }
        } else {
            // If there is no plant, calculate mutations and weeds
            // A plant cannot die and be replaced on the same tick
            var prob_empty = 1;
            if(loops > 0) { // Maybe there will be some need to call this function with loops = 0
                this.callNextOffset(x, y, 0, 0, 1, this.zeroPlantMaps[0], this.zeroPlantMaps[1], s.plantsNextTick);
                for(var key in s.plantsNextTick) {
                    var p = s.plantsNextTick[key];
                    prob_empty -= p.probImmature;
                    if(loops > 1) {
                        // Since .probMature must be 0, we use it to temorarily store this probability
                        p.probMature = p.probImmature;
                    }
                }
                if(loops > 1) {
                    for(var loop = 2; loop <= loops; ++loop) {
                        var new_prob_empty = 1;
                        for(key in s.plantsNextTick) {
                            var p = s.plantsNextTick[key];
                            p.probImmature += prob_empty * p.probMature;
                            new_prob_empty -= p.probImmature;
                        }
                        prob_empty = new_prob_empty;
                    }
                    for(key in s.plantsNextTick) {
                        s.plantsNextTick[key].probMature = 0;
                    }
                }
            }
            // Weeds
            if(prob_empty > 0 && this.weedKey) {
                var prob_nn = this.calcProbNoNeighbors(x, y);
                if(prob_nn > 0) {
                    var wp = this.weedProb * prob_empty * prob_nn * this.garden.soilsById[this.garden.soil].weedMult * tile_boost[2];
                    s.plantsNextTick[this.weedKey].probImmature += wp;
                    prob_empty *= (1 - wp);
                }
            }
            // Final probability that it'll remain empty
            s.probEmptyNextTick = prob_empty;
        }
   }
}

/**
 * Recalculate odds for all tiles
 */
GardenWrapper.prototype.recalculateAllTiles = function(loops) {
    // Doesn't account for the possibility that x or y can ALWAYS be greater than 0,
    // but in unmodded game it's impossible
    for(var y = 0; y < this.maxPlotHeight; ++y) {
        for(var x = 0; x < this.maxPlotWidth; ++x) {
            this.recalculateTile(x, y, loops);
        }
    }
}

/**
 * Set plant status, but only to a better status
 */
GardenWrapper.prototype.improvePlantStatus = function(key, new_status) {
    var old_status = this.plantStatus[key].status;
    if(old_status < new_status) {
        if(old_status === PLANT_LOCKED && new_status !== PLANT_UNLOCKED) {
            ++this.plantsUnlockable;
        } else if(new_status === PLANT_UNLOCKED && old_status !== PLANT_LOCKED) {
            --this.plantsUnlockable;
        }
        this.plantStatus[key].status = new_status;
    }
}

/**
 * Check if plant can already be used in recipes
 */
GardenWrapper.prototype.isPlantAccessible = function(key) {
    return (
        this.plantStatus[key].status === PLANT_UNLOCKED ||
        this.plantStatus[key].status === PLANT_PREMATURE ||
        this.plantStatus[key].status === PLANT_PREMATURE_DANGER ||
        this.plantStatus[key].status === PLANT_MATURE ||
        this.plantStatus[key].status === PLANT_MATURE_DANGER
    );
}

/**
 * Recalculate plant status. Call after recalculateAllTiles
 */
GardenWrapper.prototype.recalculatePlantStatus = function() {
    // Check locked and unlocked plants; set totalProbGrowthNextTick to 1
    this.plantsUnlockable = 0;
    for(var key in this.plantStatus) {
        var ps = this.plantStatus[key];
        if(this.garden.plants[key].unlocked) {
            ps.status = PLANT_UNLOCKED;
        } else if(key === this.weedKey) {
            ps.status = PLANT_WEED;
        } else {
            ps.status = PLANT_LOCKED;
        }
        ps.totalProbGrowthNextTick = 1;
    }

    // Find what is growing/may grow
    for(var y = 0; y < this.maxPlotHeight; ++y) {
        for(var x = 0; x < this.maxPlotWidth; ++x) {
            if(this.garden.isTileUnlocked(x, y)) {
                var pnt = this.tileStatus[y][x].plantsNextTick;
                var plant_id = this.garden.plot[y][x][0] - 1;
                if(plant_id >= 0) {
                    var plant = this.garden.plantsById[plant_id];
                    var key = plant.key;
                    var danger = (pnt[key].probImmature + pnt[key].probMature < 1);
                    var new_status = (
                        this.garden.plot[y][x][1] < plant.mature ?
                                (danger ? PLANT_PREMATURE_DANGER : PLANT_PREMATURE) :
                                (danger ? PLANT_MATURE_DANGER : PLANT_MATURE)
                    );
                    this.improvePlantStatus(key, new_status);
                } else {
                    for(var key in pnt) {
                        if(pnt[key].probMature + pnt[key].probImmature > 0) {
                            this.improvePlantStatus(key, PLANT_MAYGROW);
                            this.plantStatus[key].totalProbGrowthNextTick *=
                                1 - pnt[key].probMature - pnt[key].probImmature;
                        }
                    }
                }
            }
        }
    }
    
    // Check recipes and find unlockable plants; finalize totalProbGrowthNextTick
    for(var key in this.plantStatus) {
        var ps = this.plantStatus[key];
        if(ps.status === PLANT_WEED) {
            ++this.plantsUnlockable;
        }
        ps.totalProbGrowthNextTick = 1 - ps.totalProbGrowthNextTick;
        for(var i = 0; i < ps.recipes.length; ++i) {
            var r = ps.recipes[i];
            if(r.type === RECIPE_AUTOUNLOCKED || r.type === RECIPE_WEED) {
                ps.recipesUnlocked[i] = true;
            } else if(r.type === RECIPE_CREATED_ON_KILL) {
                ps.recipesUnlocked[i] = this.isPlantAccessible(r.reqs);
                if(ps.recipesUnlocked[i] && ps.status < PLANT_UNLOCKABLE) {
                    ps.status = PLANT_UNLOCKABLE;
                    ++this.plantsUnlockable;
                }
            } else {    // RECIPE_SPREAD or RECIPE_MUTATION
                ps.recipesUnlocked[i] = true;
                for(var k = 0; k < r.reqs.length; ++k) {
                    if((r.reqs[k][1] > 0 || r.reqs[k][2] > 0) && !this.isPlantAccessible(r.reqs[k][0])) {
                        ps.recipesUnlocked[i] = false;
                        break;
                    }
                }
                if(ps.recipesUnlocked[i] && ps.status < PLANT_UNLOCKABLE) {
                    ps.status = PLANT_UNLOCKABLE;
                    ++this.plantsUnlockable;
                }
            }
        }
    }
    
    
}


// ======= USER INTERFACE =======


// Hooks will be called with this === garden

var FROM_BUILD_PLOT = 1;
var FROM_COMPUTE_EFFS = 2;

var tileStatusHook = function(GWrapperAgronomicon, from) {
    var gwrapper = GWrapperAgronomicon.wrapper;
    if(from === FROM_BUILD_PLOT && gwrapper.garden.toCompute) {
        // Wait for computeEffs
        return;
    }
    gwrapper.recalculateAllTiles(gwrapper.garden.soilsById[gwrapper.garden.soil].key === 'woodchips' ? 3 : 1);
    gwrapper.recalculatePlantStatus();
    gwrapper.garden.buildPanel();  // TODO: maybe optimize it
    
    // Do the alerts. TODO: rework the whole alert system, this one is just to get the mod out there quickly
    if(GWrapperAgronomicon.newTick) {
        GWrapperAgronomicon.newTick = false;
        var ipid = false;
        var nps = false;
        var md = false;
        for(var key in gwrapper.plantStatus) {
            var ps = gwrapper.plantStatus[key];
            if(ps.status === PLANT_PREMATURE || ps.status === PLANT_PREMATURE_DANGER ||
                    ps.status === PLANT_MATURE || ps.status === PLANT_MATURE_DANGER) {
                if(!ps.wasGrowingLastTick) {
                    nps = true;
                }
                ps.wasGrowingLastTick = true;
            } else {
                ps.wasGrowingLastTick = false;
            }
        }
        for(var y = 0; (!ipid || !md) && y < gwrapper.maxPlotHeight; ++y) {
            for(var x = 0; (!ipid || !md) && x < gwrapper.maxPlotWidth; ++x) {
                var ts = gwrapper.tileStatus[y][x];
                var plant = ts.plant;
                if(plant && ts.plantsNextTick[plant.key].probImmature + ts.plantsNextTick[plant.key].probMature < 1) {
                    if(gwrapper.garden.plot[y][x][1] >= plant.mature) {
                        md = true;
                        if(gwrapper.plantStatus[plant.key].upgradeName && !Game.HasUnlocked(gwrapper.plantStatus[plant.key].upgradeName)) {
                            ipid = true;
                        }
                    }
                    if(plant.key === 'queenbeetLump' || !plant.unlocked) {
                        ipid = true;
                    }
                }
            }
        }
        // Play the sounds
        if(ipid && Game.prefs.AcharvaksAgronomicon_IPIDAlert || md && Game.prefs.AcharvaksAgronomicon_MDAlert) {
            window.PlaySound(Agronomicon.SOUND2_URL);
        } else if(nps && Game.prefs.AcharvaksAgronomicon_NPSAlert) {
            window.PlaySound(Agronomicon.SOUND1_URL);
        }
    }
}

var buildPlotHook = function() {
    this.AcharvaksAgronomicon.oldBuildPlot.call(this);
    tileStatusHook(this.AcharvaksAgronomicon, FROM_BUILD_PLOT);
}

var computeEffsHook = function() {
    this.AcharvaksAgronomicon.oldComputeEffs.call(this);
    tileStatusHook(this.AcharvaksAgronomicon, FROM_COMPUTE_EFFS);
}

var tileTooltipHook = function(x, y) {
    var old_fn = this.AcharvaksAgronomicon.oldTileTooltip.call(this, x, y);
    var garden = this;
    return function() {
        var str = old_fn();
        if(!garden.isTileUnlocked(x, y)) {
            return str;
        } else {
            var tile = garden.plot[y][x];
            var wrapper = garden.AcharvaksAgronomicon.wrapper;
            var ts = wrapper.tileStatus[y][x];
            var msg;
            if(tile[0] === 0) {
                if(ts.probEmptyNextTick === 1) {
                    msg = "<b>Will remain empty next tick</b>";
                } else {
                    msg = "<div class='line'></div><b>These plants can grow here next tick:</b><br><br><div style='text-align: left;'>";
                    var nextmuts = [];
                    for(var key in ts.plantsNextTick) {
                        if(ts.plantsNextTick[key].probImmature > 0) {
                            nextmuts.push([garden.plants[key].name, ts.plantsNextTick[key].probImmature]);
                        }
                    }
                    nextmuts.sort(function(a, b) { return -compare(a[1], b[1]); });
                    for(var i = 0; i < nextmuts.length; ++i) {
                        msg += "<b>" + nextmuts[i][0] + ":</b> " + wrapper.formatPercentage(nextmuts[i][1]) + "<br>";
                    }
                    msg += "<b>[Nothing]:</b> " + wrapper.formatPercentage(ts.probEmptyNextTick);
                    msg += "</div>";
                }
            } else {
                msg = '';
                var plant = garden.plantsById[tile[0] - 1];
                var tmp;
                var dh = '<div style="margin-top: 0.5em"';
                if(tile[1] < plant.mature) {
                    tmp = ts.plantsNextTick[plant.key].probMature;
                    if(tmp === 1) {
                        msg = dh + ' class="green">Will mature next tick (<b>100%</b>)</div>'
                    } else if(tmp > 0) {
                        msg = dh + ' class="green">May mature next tick (<b>' +
                                wrapper.formatPercentage(tmp) + '</b>)</div>';
                    }
                }
                if(ts.probEmptyNextTick === 1) {
                    msg += dh + ' class="red">Will die next tick (<b>100%</b>)</div>'
                } else if(ts.probEmptyNextTick) {
                    msg += dh + ' class="red">May die next tick (<b>' +
                                wrapper.formatPercentage(ts.probEmptyNextTick) + '</b>)</span>';
                }
                var contam = [];
                for(var key in ts.plantsNextTick) {
                    var p = ts.plantsNextTick[key].probImmature;
                    if(key !== plant.key && p > 0) {
                        contam.push([garden.plants[key].name, p]);
                    }
                    contam.sort(function(a, b) { return -compare(a[1], b[1]); });
                }
                if(contam) {
                    for(var i = 0; i < contam.length; ++i) {
                        msg += dh + ' class="red">May be overtaken by <b>' + contam[i][0] +
                                    '</b> (<b>' + wrapper.formatPercentage(contam[i][1]) + '</b>)</div>';
                    }
                }
                if(msg) {
                    msg = '<div class="line"></div>' + msg;
                }
            }
            if(msg) {
                return str.replace(/<q>.*<\/q>/, '').replace(/<\/div>$/, msg + '</div>');
            } else {
                return str;
            }
        }
    }
}

var getPlantDescHook = function(me) {
    var desc = this.AcharvaksAgronomicon.oldGetPlantDesc.call(this, me);
    var ps = this.AcharvaksAgronomicon.wrapper.plantStatus[me.key];
    if(ps && ps.upgradeName && !Game.HasUnlocked(ps.upgradeName)) {
        return desc.replace(/<\/div>$/,
                             '<div class="line"></div>' +
                             '<div style="text-align: center; white-space: nowrap;">' +
                             'When harvested mature, may drop <span class="green">' + ps.upgradeName +
                             '</span> (<b>' + this.AcharvaksAgronomicon.wrapper.formatPercentage(ps.upgradeProb) + '</b>)</div></div>');
    } else {
        return desc;
    }
}

var seedTooltipHook = function(id) {
    var garden = this;
    var wrapper = this.AcharvaksAgronomicon.wrapper;
    var old_fn = this.AcharvaksAgronomicon.oldSeedTooltip.call(this, id);
    return function() {
        var tt = old_fn();
        if(id < 0 || id >= garden.plantsById.length) {
            return tt;
        } else {
            var plant = garden.plantsById[id];
            var rhtml;
            var ps = wrapper.plantStatus[plant.key];
            if(ps.status === PLANT_PREMATURE_DANGER) {
                rhtml = '<span class="red">This plant is growing in your garden, and is in danger</span>';
            } else if(ps.status === PLANT_MATURE_DANGER) {
                rhtml = '<span class="red"><b>This plant is mature in your garden, and is in danger</b></span>';
            } else if(ps.status === PLANT_PREMATURE) {
                rhtml = '<span class="green">This plant is growing in your garden</span>';
            } else if(ps.status === PLANT_MATURE) {
                rhtml = '<span class="green"><b>This plant is mature in your garden</b></span>';
            } else if(ps.status === PLANT_MAYGROW) {
                rhtml = '<b>This plant may grow in your garden next tick (' +
                    wrapper.formatPercentage(ps.totalProbGrowthNextTick) +')</b>';
            } else if(ps.status !== PLANT_UNLOCKED) {
                rhtml = "You haven't unlocked this seed yet";
            } else {
                rhtml = '';
            }
            if(rhtml) {
                rhtml = '<div style="white-space: nowrap; text-align: center; margin-bottom: 0.25em;">' + rhtml + '</div>';
            }
            for(var k = 0; k < ps.recipes.length; ++k) {
                var hh = ps.recipes[k].html;
                if(!ps.recipesUnlocked[k]) {
                    hh = '<s>' + hh + '</s>';
                }
                rhtml += '<div style="white-space: nowrap; margin-top: 0.5em;">' + hh + '</div>';
            }
            if(rhtml) {
                return tt.replace(/<\/div>$/, '<div class="line"></div>' + rhtml +
                                  '<div style="margin-top: 0.5em; text-align: center;">' +
                                  '<small>(M) = mature, (AA) = any age, OO = other outcomes</small></div></div>');
            } else {
                return tt;
            }
        }
    }
}

var buildPanelHook = function() {
    var wrapper = this.AcharvaksAgronomicon.wrapper;
    if(this.AcharvaksAgronomicon.oldBuildPanel.call(this) === false) {
        return false;
    } else {
        if(wrapper.plantsUnlockable) {
            for(var key in wrapper.plantStatus) {
                if(wrapper.plantStatus[key].status > PLANT_LOCKED &&
                        wrapper.plantStatus[key].status < PLANT_UNLOCKED) {
                    var el = document.getElementById('gardenSeed-' + this.plants[key].id);
                    if(el) {
                        var elc = el.cloneNode(true);    // We need to remove event listeners
                        elc.style.opacity = 0.3;
                        elc.classList.remove('locked');
                        el.parentNode.replaceChild(elc, el);
                    }
                }
            }
        }        
    }
}

var unlockSeedHook = function(me) {
    if(!this.AcharvaksAgronomicon.oldUnlockSeed(me)) {
        return false;
    } else {
        this.AcharvaksAgronomicon.wrapper.recalculatePlantStatus();
        this.buildPanel();  // TODO: maybe optimize in the future
    }
}

var lockSeedHook = function(me) {
    if(!this.AcharvaksAgronomicon.oldLockSeed(me)) {
        return false;
    } else {
        this.AcharvaksAgronomicon.wrapper.recalculatePlantStatus();
        this.buildPanel();  // TODO: maybe optimize in the future
    }
}

// computeMatures seems the best way to find out when the garden ticks
var computeMaturesHook = function() {
    this.AcharvaksAgronomicon.oldComputeMatures.call(this);
    this.AcharvaksAgronomicon.newTick = true;
}

// Callbacks are called with no `this`
var drawCallback = function() {
    if(Game.drawT % 10 === 0) {
        // The original garden updates this just like here
        var wrapper = Agronomicon.mainGardenWrapper;
        if(wrapper && wrapper.plantsUnlockable) {
            var tmp = document.getElementById('gardenSeedsUnlocked');
            if(tmp) {
                var garden = wrapper.garden;
                tmp.innerHTML='Seeds <small>('+ garden.plantsUnlockedN+'/'+garden.plantsN+' + ' +
                    wrapper.plantsUnlockable + ')</small>';
            }
        }
    }
}

var saveCallback = function() {
    var str = JSON.stringify({version: VERSION, revision: REVISION, isDev: IS_DEV,
                              alerts: [!!Game.prefs.AcharvaksAgronomicon_IPIDAlert, !!Game.prefs.AcharvaksAgronomicon_NPSAlert,
                                       !!Game.prefs.AcharvaksAgronomicon_MDAlert]});
    if(window.localStorage) {
        window.localStorage.setItem('AcharvaksAgronomicon', str);
    }
}

// Add Agronomicon options to the game's option menu (hook on Game)
var UpdateMenuHook = function() {
    Agronomicon.oldUpdateMenu.call(this);
    if(Game.onMenu === 'prefs') {
        var str = '<div class="title">Cookie Clicker Agronomicon</div>' +
                  '<div class="listing">' +
                  Game.WriteButton('AcharvaksAgronomicon_IPIDAlert', 'AcharvaksAgronomicon_IPIDAlertButton',
                                    'IPID-Alert: ON', 'IPID-Alert: OFF') +
                   '<label>Play a sound if Interesting Plant In Danger ' +
                    '[<a href="#" onclick="PlaySound(AcharvaksAgronomicon.SOUND2_URL);">listen</a>]</label><br>' +
                  "<small>A plant is considered Interesting if you lack its seed, if it's mature and you lack its upgrade, " +
                    "or if it's a Juicy Queenbeet. Danger is a chance of death or contamination.</small>" +
                  '</div><div class="listing">' +
                  Game.WriteButton('AcharvaksAgronomicon_NPSAlert', 'AcharvaksAgronomicon_NPSAlertButton',
                                    'New plant species alert: ON', 'New plant species alert: OFF') +
                    '<label>Play a sound whenever a new plant species appears in the garden ' +
                     '[<a href="#" onclick="PlaySound(AcharvaksAgronomicon.SOUND1_URL);">listen</a>]</label>' +
                  '</div><div class="listing">' +
                  Game.WriteButton('AcharvaksAgronomicon_MDAlert', 'AcharvaksAgronomicon_MDAlertButton',
                                    'Any mature plant in danger alert: ON', 'Any mature plant in danger alert: OFF') +
                    '<label>Play a sound whenever any mature plant is in danger ' +
                     '[<a href="#" onclick="PlaySound(AcharvaksAgronomicon.SOUND2_URL);">listen</a>]</label>' +
                  '</div><div class="listing"' +
                  '<ul><li>Agronomicon version: ' + Agronomicon.versionString + '</li></ul>' +
                  '</div>';
        
        var div = document.createElement('div');
        div.innerHTML = str;
        var menu = document.getElementById('menu');
        if(menu) {
            menu = menu.getElementsByClassName('subsection')[0];
            if(menu) {
                var padding = menu.getElementsByTagName('div');
                padding = padding[padding.length - 1];
                if(padding) {
                    menu.insertBefore(div, padding);
                } else {
                    menu.appendChild(div);
                }
            }
        }
    }
}


// ======= MOD INJECTION =======


/**
 * Initialize this mod.
 *
 * NOTE: if you're yourself developing a mod for Cookie Clicker and want to somehow
 * interface with the Agronomicon, your mod can get notified when Agronomicon is
 * about to be initialized or has already been initialized. To do so:
 * 
 * 1. Set window.AcharvaksAgronomicon to a new object (check if it already exists first).
 * 2. Set AcharvaksAgronomicon.preloadHooks and AcharvaksAgronomicon.postloadHooks to new arrays
 *      (again, check if they've already been set first).
 * 3. If you want to be notified before Agronomicon loads, add a function to .preloadHooks. This function
 *      will be called with a certain object as an argument (see below). It must return true, else Agronomicon
 *      will abort loading.
 * 4. If you want to be notified after Agronomicon loads, add a function to .postloadHooks. It will be called
 *      with no arguments and its return value will be ignored. Note that .postloadHooks will be called after
 *      the initialization finishes, even if the player has not yet unlocked the garden minigame.
 * 5. If you want to prevent the Agronomicon from doing anything on its own and want to just use its functions,
 *      set AcharvaksAgronomicon.APIOnly to true.
 *
 * Note that Agronomicon does not call its own functions via AcharvaksAgronomicon, so you can't easily replace them
 * (except for AcharvaksAgronomicon.wrapGarden and AcharvaksAgronomicon.GardenWrapper)
 *
 * WARNING: this is a beta version. Everything may change yet. It probably will, in fact.
 */
var initialize = function() {
    try {
        // Version check, preload hooks, setting up global variables
        var version_string = '' + VERSION + '.' + REVISION + (IS_DEV ? '-next' : '') + (IS_BETA ? ' (beta)' : '');
        if(window.AcharvaksAgronomicon != undefined && window.AcharvaksAgronomicon.isLoaded) {
            alert('Cookie Agronomicon is already loaded (version ' + window.AcharvaksAgronomicon.versionString + ')');
            return;
        }
        // Game must have been initialized at this point
        if(Game.version != VERSION) {
            var conf = confirm('Cookie Agronomicon ' + version_string
                                + ' is intended for Cookie Clicker ' + VERSION + ', but you are running '
                                + Game.version + '. Loading the mod may break the game.\n\nProceed anyway?');
            if(!conf) {
                return;
            }
        }
        if(window.AcharvaksAgronomicon === undefined) {
            Agronomicon = {};
            window.AcharvaksAgronomicon = Agronomicon;
        } else {
            if(window.AcharvaksAgronomicon.preloadHooks) {
                // Run preload hooks, if other mods have installed any. If a hook returns false, abort loading.
                var tmp = {version: VERSION, revision: REVISION, isDev: IS_DEV, versionString: version_string};
                for(var hook in window.AcharvaksAgronomicon) {
                    if(!hook(tmp)) {
                        alert('Cookie Agronomicon has been prevented from loading by another mod');
                        return;
                    }
                }
            }
            Agronomicon = window.AcharvaksAgronomicon;
        }
        Agronomicon.isLoaded = true;
        Agronomicon.version = VERSION;
        Agronomicon.revision = REVISION;
        Agronomicon.isDev = IS_DEV;
        Agronomicon.isBeta = IS_BETA;
        Agronomicon.versionString = version_string;
        Agronomicon.SOUND1_URL = SOUND1_URL;
        Agronomicon.SOUND2_URL = SOUND2_URL;

        if(Agronomicon.GardenWrapper === undefined) {
            Agronomicon.GardenWrapper = GardenWrapper;
        }
        if(Agronomicon.wrapGarden === undefined) {
            Agronomicon.wrapGarden = wrapGarden;
        }

        if(Agronomicon.weedKey === undefined) {
            Agronomicon.weedKey = 'meddleweed';
            Agronomicon.weedProb = 0.002;
        }
        if(Agronomicon.autoUnlocked === undefined) {
            Agronomicon.autoUnlocked = {'bakerWheat': true};
        }
        if(Agronomicon.deathDrops === undefined) {
            Agronomicon.deathDrops = {'meddleweed': [['brownMold','crumbspore'], 0, 0.2]}; // plant -> [[possible results, prob_a, prob_b]]
                                                                                           // total prob = prob_a + prob_p * (age / 100)
        }
        if(Agronomicon.plantUpgrades === undefined) {
            Agronomicon.plantUpgrades = {
                bakerWheat: ['Wheat slims', 0.001],
                greenRot: ['Green yeast digestives', 0.005],
                elderwort: ['Elderwort biscuits', 0.01],
                bakeberry: ['Bakeberry cookies', 0.015],
                drowsyfern: ['Fern tea', 0.01],
                duketater: ['Duketater cookies', 0.005],
                ichorpuff: ['Ichor syrup', 0.005],
            };
        }
        if(Agronomicon.recipes === undefined) {
            Agronomicon.recipes = RECIPES;
        }
        
        // Initializing settings
        // TODO: load saved settings
        Agronomicon.percentagePrecision = 4;

        // Overtaking the garden
        if(!Agronomicon.APIOnly) {
            if(Game.Objects['Farm'].minigameLoaded) {
                Agronomicon.wrapGarden(Game.Objects['Farm'].minigame, true);
            } else {
                Agronomicon.oldGameScriptLoaded = Game.scriptLoaded;
                Game.scriptLoaded = scriptLoadedHook;
            }
            Agronomicon.oldUpdateMenu = Game.UpdateMenu;
            Game.UpdateMenu = UpdateMenuHook;
            Game.customDraw.push(drawCallback);
            if(localStorage) {
                var str = localStorage.getItem('AcharvaksAgronomicon');
                if(str) {
                    var settings = JSON.parse(str);
                    if(settings.version > VERSION || settings.revision > REVISION) {
                        alert('Saved settings are from a newer version of Agronomicon, they will be reset');
                    } else {
                        Game.prefs.AcharvaksAgronomicon_IPIDAlert = settings.alerts[0];
                        Game.prefs.AcharvaksAgronomicon_NPSAlert = settings.alerts[1];
                        Game.prefs.AcharvaksAgronomicon_MDAlert = settings.alerts[2];
                    }
                }
            }
            Game.customSave.push(saveCallback);
            if(Game.onMenu === 'prefs') {
                Game.UpdateMenu();
            }
        }
        
        // Call postload hooks, if any
        if(Agronomicon.postloadHooks) {
            for(var i = 0; i < Agronomicon.postloadHooks.length; ++i) {
                (Agronomicon.postloadHooks[i])(Agronomicon);
            }
        }
        
        var msg = 'Cookie Clicker Agronomicon loaded, version ' + version_string;
        if(Game.prefs.popups) {
            Game.Popup(msg);
        } else {
            Game.Notify(msg, '', '', 5, true);
        }
        Game.Win('Third-party');
    }
    catch(e) {
        alert('Error loading Cookie Agronomicon: ' + e);
        throw e;
    }
}

// When garden is loaded, prepare to take over
var scriptLoadedHook = function(who, script) {
    Agronomicon.oldGameScriptLoaded.call(this, who, script);
    if(!Agronomicon.gardenWrapped && who.name === 'Farm') {
        Agronomicon.wrapGarden(Game.Objects['Farm'].minigame, true);
    }
}

/**
 * To be called after the garden minigame is launched (via AcharvaksAgronomicon.wrapGarden)
 */
var wrapGarden = function(garden_minigame, set_main) {
    var gwrapper = new Agronomicon.GardenWrapper(garden_minigame, Agronomicon.autoUnlocked,
                                                    Agronomicon.weedKey, Agronomicon.weedProb, Agronomicon.deathDrops,
                                                    Agronomicon.recipes, Agronomicon.plantUpgrades,
                                                    Agronomicon.percentagePrecision);

    garden_minigame.AcharvaksAgronomicon = {
        oldBuildPlot: garden_minigame.buildPlot,
        oldComputeEffs: garden_minigame.computeEffs,
        oldBuildPanel: garden_minigame.buildPanel,
        oldTileTooltip: garden_minigame.tileTooltip,
        oldGetPlantDesc: garden_minigame.getPlantDesc,
        oldSeedTooltip: garden_minigame.seedTooltip,
        oldUnlockSeed: garden_minigame.unlockSeed,
        oldLockSeed: garden_minigame.lockSeed,
        oldComputeMatures: garden_minigame.computeMatures,
        wrapper: gwrapper,
        newTick: false,
    };
    
    garden_minigame.buildPlot = buildPlotHook;
    garden_minigame.computeEffs = computeEffsHook;
    garden_minigame.buildPanel = buildPanelHook;
    garden_minigame.tileTooltip = tileTooltipHook;
    garden_minigame.getPlantDesc = getPlantDescHook;
    garden_minigame.seedTooltip = seedTooltipHook;
    garden_minigame.unlockSeed = unlockSeedHook;
    garden_minigame.lockSeed = lockSeedHook;
    garden_minigame.computeMatures = computeMaturesHook;
    garden_minigame.toRebuild = true;
    garden_minigame.buildPlot();
    garden_minigame.buildPanel();
    
    if(set_main) {
        Agronomicon.mainGardenWrapper = gwrapper;
    }
}

// Alert audio files - TODO: maybe replace, allow custom URLs
// They were created by myself as MIDI, then converted to MP3
var SOUND1_URL = 'data:audio/mpeg;base64,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15+7t2NIhXT6vVC38ZCHtzPzrVUOyUehU7s09Vu1b/mYleud/+MoxNEVEAplnhBEAtWmrWm0kZVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVAmn+SSQABfenZur9/o2u9P/7/tbRWW+v13dvYt7f6LGf/+MoxNQV1G5+XhBEvrP6W0/X9CpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqiFG3JLbbsAAfqHu5U6VeItt0ss7EssezuWPZ3DsRLBUJB2RJeGkxLiU7hr/Ep0tiLlud6j2o98sGodK1Dzr6w0Ij2JXEQ0i/+MoxKQJyAZ1nghEAtKnQ6Jf+VoKyO223XbAABYQh4uouDgLgoMEagJiQXEoqCoKBCyFwWZey3805RR6C0UjTjRIEehuO17m5RpwkCAhZjkZGSz9goIHY6GTLJUP/JZf7LY5GrKGDAwjo8pEeasFDAwYR0Mjsln8s//stmR7WNY/9nkasoIGDBOhl/L+rWSw/+MoxMoTYAZyXghEAsjKWz////lkuZMstlQ/n/mrAwQKIOW+r+VV1UxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxP8ljBmSXkmGVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MoxHwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

var SOUND2_URL = 'data:audio/mpeg;base64,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/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MoxHwAAANIAAAAAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

initialize();
})();
