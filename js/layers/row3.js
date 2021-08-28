
/*
                    
                    
hhhhhhh             
h:::::h             
h:::::h             
h:::::h             
 h::::h hhhhh       
 h::::hh:::::hhh    
 h::::::::::::::hh  
 h:::::::hhh::::::h 
 h::::::h   h::::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 hhhhhhh     hhhhhhh
                    
                    
                    
                    
                    
                    
                    
*/
addLayer("h", {
    name: "hindrance", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        chall31bought: 0,
        first: 0,
        auto: false,
    }},
    color: "#a14040",
    requires: new Decimal(1e30), // Can be a function that takes requirement increases into account
    resource: "障碍灵魂", // Name of prestige currency
    baseResource: "TE", // Name of resource prestige is based on
    baseAmount() {return player.t.energy}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.2:.125) }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).h);
        if (player.m.unlocked) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
        if (hasUpgrade("ba", 22)) mult = mult.times(tmp.ba.negBuff);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "按 H 进行障碍重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        player.q.time = new Decimal(0);
        player.q.energy = new Decimal(0);
        player.h.chall31bought = 0;
        if (hasMilestone("m", 1)) keep.push("challenges")
        if (layers[resettingLayer].row > this.row) {
            layerDataReset(this.layer, keep)
        }
    },
    update(diff) {
        if (hasAchievement("a", 111)) {
            let cd = tmp[this.layer].challenges;
            let auto = hasMilestone("h", 0) && player.h.auto;
            if (cd[31].unlocked && (player.h.activeChallenge==31 || auto)) cd[31].completeInBulk()
            if (cd[32].unlocked && (player.h.activeChallenge==32 || auto)) cd[32].completeInBulk()
        }
    },
    layerShown(){return (player.t.unlocked&&hasMilestone("q", 4))||player.m.unlocked||player.ba.unlocked},
    branches: ["t"],
    effect() { 
        if (!unl(this.layer)) return new Decimal(1);
        let h = player.h.points.times(player.points.plus(1).log("1e1000").plus(1));
        h = softcap("hindr_base", h);
        let eff = h.plus(1).pow(3).pow(hasChallenge("h", 11)?1.2:1).pow(hasUpgrade("ba", 21)?8:1);
        if (hasUpgrade("q", 45) && player.i.buyables[12].gte(6)) eff = eff.pow(100);
        return eff;
    },
    effectDescription() {
        return "增幅点数获取、TE 获取与 TE 上限 "+format(tmp.h.effect)+" ("+(tmp.nerdMode?(tmp.h.effect.gte(15e4)?("(10^sqrt(log(hindranceSpirit/1e3*(log(points+1)+1))/log(1.5e5))+1)^("+((hasChallenge("h", 11)?3.6:3)*(hasUpgrade("ba", 21)?8:1))+")"):("(hindranceSpirit/1e3*(log(points+1)+1)+1)^("+((hasChallenge("h", 11)?3.6:3)*(hasUpgrade("ba", 21)?8:1))+")")):"基于点数")+")"
    },
    costMult11() {
        let mult = new Decimal(1);
        if (inChallenge("h", 11)) mult = mult.times(Decimal.pow(10, Decimal.pow(player.p.upgrades.length, 2)))
        return mult;
    },
    costExp11() {
        let exp = new Decimal(1);
        if (inChallenge("h", 11)) exp = exp.times(Math.pow(player.p.upgrades.length, 2)*4+1)
        return exp;
    },
    costMult11b() {
        let mult = new Decimal(1);
        if (inChallenge("h", 11)) mult = mult.times(player.b.upgrades.length*3+1)
        return mult;
    },
    baseDiv12() {
        let div = new Decimal(1);
        if (inChallenge("h", 12)) div = div.times(player.q.time.sqrt().times(player.sb.points.pow(3).times(3).plus(1)).plus(1))
        return div;
    },
    pointRoot31(x=challengeCompletions("h", 31)) {
        if (hasAchievement("a", 111)) x = 1;
        else if (player.h.activeChallenge==32) x = challengeCompletions("h", 32)*2
        if (x>=20) x = Math.pow(x-19, 1.5)+19
        let root = Decimal.add(2, Decimal.pow(x, 1.5).div(16))
        return root;
    },
    passiveGeneration() { return (hasMilestone("m", 2)&&player.ma.current!="h")?1:0 },
    milestones: {
        0: {
            unlocked() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) },
            requirementDescription: "e300,000,000 障碍灵魂",
            done() { return player.h.points.gte("e3e8") },
            effectDescription: "解锁自动可重复障碍。",
            toggles: [["h", "auto"]],
        },
    },
    challenges: {
        rows: 4,
        cols: 2,
        11: {
            name: "升级荒漠",
            completionLimit: 1,
            challengeDescription: "声望/增幅器升级会无视里程碑进行重置，同时每个声望/增幅器升级夸张地增加其他升级的价格。",
            unlocked() { return player.h.unlocked },
            goal() { return new Decimal(player.ma.current=="h"?"e1.37e8":"1e1325") },
            currencyDisplayName: "点数",
            currencyInternalName: "points",
            rewardDescription: "解锁诡异升级，同时障碍灵魂的效果提升至 1.2 次幂。",
            onStart(testInput=false) { 
                if (testInput && !(hasAchievement("a", 81)&&player.ma.current!="h")) {
                    player.p.upgrades = []; 
                    player.b.upgrades = [];
                }
            },
        },
        12: {
            name: "速度之魔",
            completionLimit: 1,
            challengeDescription: "增幅器/生成器底数被时间消减（你的超级增幅器会放大此效果）。",
            unlocked() { return hasChallenge("h", 11) },
            goal() { return new Decimal(player.ma.current=="h"?"e5e8":"1e3550") },
            currencyDisplayName: "点数",
            currencyInternalName: "points",
            rewardDescription() { return "超级增幅器底数增加 0.25"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?(" 并以超空间能量加成它"):"")+"。" },
        },
        21: {
            name: "空间紧缺",
            completionLimit: 1,
            challengeDescription: "建筑重置，你的空间变为 10%，建筑效果变为 10%。",
            unlocked() { return hasChallenge("h", 12) },
            goal() { return new Decimal(player.ma.current=="h"?"e5.7e7":"1e435") },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            rewardDescription: "空间能量加成建筑效果。",
            rewardEffect() { return player.s.points.div(2).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?1.4:1) },
            rewardDisplay() { return format(this.rewardEffect())+"% 增强 （累加）" },
            formula() { return "(x*"+format(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?.7:.5)+")%" },
            onStart(testInput=false) {
                if (testInput) {
                    resetBuyables("s");
                    player.s.spent = new Decimal(0);
                }
            },
        },
        22: {
            name: "弱化",
            completionLimit: 1,
            challengeDescription: "只有声望升级、成就奖励和第一建筑能增益点数获取。",
            unlocked() { return hasChallenge("h", 21) },
            goal() { return new Decimal(player.ma.current=="h"?"e8.225e6":"1e3570") },
            currencyDisplayName: "点数",
            currencyInternalName: "points",
            rewardDescription: "<b>点数增益</b> 的硬上限变为软上限。",
        },
        31: {
            name: "永恒",
            scalePower() {
                let power = new Decimal(1);
                if (tmp.m.buyables[15].unlocked) power = power.times(Decimal.sub(1, buyableEffect("m", 15)));
                return power;
            },
            completionLimit() { 
                let lim = 10
                if (hasAchievement("a", 71)) lim += 10;
                if (hasAchievement("a", 74)) lim += 10;
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) lim = Infinity;
                return lim
            },
            challengeDescription() {
                let lim = this.completionLimit();
                let infLim = !isFinite(lim);
                return "你只能买 10 个增强子和扩展时间胶囊（总计），增强子/扩展时间胶囊自动购买已被禁止，同时点数生成被开 "+format(tmp.h.pointRoot31)+" 次根。<br>完成次数: "+formatWhole(challengeCompletions("h", 31))+(infLim?"":("/"+lim));
            },
            unlocked() { return hasChallenge("h", 22) },
            goal() { 
                let comps = Decimal.mul(challengeCompletions("h", 31), tmp.h.challenges[this.id].scalePower);
                if (comps.gte(20)) comps = Decimal.pow(comps.sub(19), 1.95).plus(19);
                return Decimal.pow("1e50", Decimal.pow(comps, 2.5)).times("1e5325") 
            },
            completeInBulk() {
                if (challengeCompletions("h", 31)>=tmp[this.layer].challenges[this.id].completionLimit) return;
                let target = player.points.div("1e5325").max(1).log("1e50").root(2.5)
                if (target.gte(20)) target = target.sub(19).root(1.95).plus(19);
                target = target.div(tmp.h.challenges[this.id].scalePower).plus(1).floor();
                player.h.challenges[this.id] = Math.min(Math.max(player.h.challenges[this.id], target.toNumber()), tmp[this.layer].challenges[this.id].completionLimit);
                if (isNaN(player.h.challenges[this.id])) player.h.challenges[this.id] = 0;
            },
            currencyDisplayName: "点数",
            currencyInternalName: "points",
            rewardDescription() { return "<b>永恒</b> 加成超级 GP 获取，基于"+(hasUpgrade("ss", 33)?"当前游戏时间。":"当前第四行重置后时间。") },
            rewardEffect() { 
                let eff = Decimal.div(9, Decimal.add((hasUpgrade("ss", 33)?(player.timePlayed||0):player.q.time), 1).cbrt().pow(hasUpgrade("ss", 23)?(-1):1)).plus(1).pow(challengeCompletions("h", 31)).times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.blueOrange:new Decimal(1)).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5:1);
                if (!eff.eq(eff)) eff = new Decimal(1);
                return eff;
            },
            rewardDisplay() { return format(this.rewardEffect())+"x" },
            formula() { return "(9"+(hasUpgrade("ss", 23)?"*":"/")+"cbrt(time+1)+1)^completions" },
        },
        32: {
            name: "D 选项",
            scalePower() {
                let power = new Decimal(1);
                if (tmp.m.buyables[15].unlocked) power = power.times(Decimal.sub(1, buyableEffect("m", 15)));
                return power;
            },
            completionLimit() { 
                let lim = 10;
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) lim = Infinity;
                return lim;
            },
            challengeDescription() { 
                let lim = this.completionLimit();
                let infLim = !isFinite(lim);
                return '之前的所有障碍一起生效（"永恒" 以第 '+formatWhole(challengeCompletions("h", 32)*2+1)+' 级难度生效)<br>完成次数: '+formatWhole(challengeCompletions("h", 32))+(infLim?"":('/'+lim))
            },
            goal() {
                let comps = Decimal.mul(challengeCompletions("h", 32), tmp.h.challenges[this.id].scalePower);
                if (comps.gte(3)) comps = comps.sub(0.96);
                if (comps.gte(3.04)) comps = comps.times(1.425);
                return Decimal.pow("1e1000", Decimal.pow(comps, 3)).times("1e9000");
            },
            completeInBulk() {
                if (challengeCompletions("h", 32)>=tmp[this.layer].challenges[this.id].completionLimit) return;
                let target = player.points.div("1e9000").max(1).log("1e1000").cbrt();
                if (target.gte(3.04)) target = target.div(1.425);
                if (target.gte(3)) target = target.plus(.96);
                target = target.div(tmp.h.challenges[this.id].scalePower).plus(1).floor();
                player.h.challenges[this.id] = Math.min(Math.max(player.h.challenges[this.id], target.toNumber()), tmp[this.layer].challenges[this.id].completionLimit);
                if (isNaN(player.h.challenges[this.id])) player.h.challenges[this.id] = 0;
            },
            currencyDisplayName: "点数",
            currencyInternalName: "points",
            rewardDescription: "<b>D 选项</b> 完成次数加成 TE 获取。",
            rewardEffect() { 
                let eff = softcap("option_d", Decimal.pow(100, Decimal.pow(challengeCompletions("h", 32), 2))).times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.blueOrange:new Decimal(1));
                if (!eff.eq(eff)) eff = new Decimal(1);
                return eff;
            },
            rewardDisplay() { return format(tmp.h.challenges[32].rewardEffect)+"x" },
            formula: "100^(completions^2)",
            unlocked() { return tmp.ps.buyables[11].effects.hindr },
            countsAs: [11,12,21,22,31],
            onStart(testInput=false) { 
                if (testInput) {
                    if (!hasAchievement("a", 81)) {
                        player.p.upgrades = []; 
                        player.b.upgrades = [];
                    }
                    resetBuyables("s");
                    player.s.spent = new Decimal(0);
                }
            },
        },
        41: {
            name: "集中狂怒",
            completionLimit: 1,
            challengeDescription: "进行一次第五行重置，消极和积极都重置了，并且其惩罚被夸张地放大。",
            goal: new Decimal("1e765000"),
            currencyDisplayName: "点数",
            currencyInternalName: "points",
            rewardDescription: "解锁 3 个新的平衡升级。",
            unlocked() { return (tmp.ps.buyables[11].effects.hindr||0)>=2 },
            onStart(testInput=false) {
                if (testInput) {
                    doReset("m", true);
                    player.h.activeChallenge = 41;
                    player.ba.pos = new Decimal(0);
                    player.ba.neg = new Decimal(0);
                    updateTemp();
                    updateTemp();
                    updateTemp();
                }
            },
        },
        42: {
            name: "减产",
            completionLimit: 1,
            challengeDescription: "进行一次第五行重置，启用 <b>弱化</b>，并且 2 到 4 层有更高的价格需求。",
            goal: new Decimal("1e19000"),
            currencyDisplayName: "点数",
            currencyInternalName: "points",
            rewardDescription() { return "诡异层价格减少 0."+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?"2":"15")+"，解锁两个新的子空间升级。" },
            unlocked() { return (tmp.ps.buyables[11].effects.hindr||0)>=3 },
            countsAs: [22],
            onStart(testInput=false) {
                if (testInput) {
                    doReset("m", true);
                    player.h.activeChallenge = 42;
                    updateTemp();
                    updateTemp();
                    updateTemp();
                }
            },
        },
    },
})
/*
                
                
                
                
                
                
qqqqqqqqq   qqqqq
q:::::::::qqq::::q
q:::::::::::::::::q
q::::::qqqqq::::::qq
q:::::q     q:::::q 
q:::::q     q:::::q 
q:::::q     q:::::q 
q::::::q    q:::::q 
q:::::::qqqqq:::::q 
q::::::::::::::::q 
qq::::::::::::::q 
qqqqqqqq::::::q 
        q:::::q 
        q:::::q 
       q:::::::q
       q:::::::q
       q:::::::q
       qqqqqqqqq
                
*/
addLayer("q", {
    name: "quirks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        energy: new Decimal(0),
        time: new Decimal(0),
        auto: false,
        first: 0,
        pseudoUpgs: [],
    }},
    color: "#c20282",
    requires: new Decimal("1e512"), // Can be a function that takes requirement increases into account
    resource: "诡异", // Name of prestige currency
    baseResource: "GP", // Name of resource prestige is based on
    baseAmount() {return player.g.power}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.008:.0075) }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).q);
        mult = mult.times(improvementEffect("q", 33));
        if (player.m.unlocked) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
        if (hasUpgrade("ba", 22)) mult = mult.times(tmp.ba.negBuff);
        if (hasUpgrade("hn", 43)) mult = mult.times(upgradeEffect("hn", 43));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "按 Q 进行诡异重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        player.q.time = new Decimal(0);
        player.q.energy = new Decimal(0);
        if (hasMilestone("ba", 0)) keep.push("upgrades");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return player.e.unlocked},
    branches: ["e"],
    enGainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("q", 11)) mult = mult.times(upgradeEffect("q", 11));
        if (hasUpgrade("q", 21)) mult = mult.times(upgradeEffect("q", 21));
        if (player.o.unlocked) mult = mult.times(buyableEffect("o", 12));
        if (player.ba.unlocked) mult = mult.times(tmp.ba.negBuff);
        return mult;
    },
    enGainExp() {
        let exp = player.q.buyables[11].plus(tmp.q.freeLayers).sub(1);
        return exp;
    },
    enEff() {
        if (!unl(this.layer)) return new Decimal(1);
        let eff = player.q.energy.plus(1).pow(2);
        if (hasUpgrade("q", 23)) eff = eff.pow(3);
        return softcap("qe", eff.times(improvementEffect("q", 23)));
    },
    update(diff) {
        player.q.time = player.q.time.plus(diff);
        if (tmp.q.enGainExp.gte(0)) player.q.energy = player.q.energy.plus(player.q.time.times(tmp.q.enGainMult).pow(tmp.q.enGainExp).times(diff));
        if (hasMilestone("ba", 1) && player.q.auto && player.ma.current!="q") layers.q.buyables[11].buyMax();
    },
    passiveGeneration() { return (hasMilestone("ba", 0)&&player.ma.current!="q")?1:0 },
    tabFormat: {
        "Main Tab": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function() {return '你有 ' + formatWhole(player.g.power)+' GP'},
                        {}],
                ["display-text",
                    function() {return '你最多拥有 ' + formatWhole(player.q.best)+' 诡异'},
                        {}],
                ["display-text",
                    function() {return '你总共拥有 ' + formatWhole(player.q.total)+' 诡异'},
                        {}],
                "blank",
                ["display-text",
                    function() {return '你有 ' + formatWhole(player.q.energy)+' QE ('+(tmp.nerdMode?('基础获取: (timeInRun^(quirkLayers-1))'):'由诡异层生成')+')，增幅点数和 GP 获取 ' + format(tmp.q.enEff)+(tmp.nerdMode?(" ((x+1)^"+format(hasUpgrade("q", 23)?6:2)+"*"+format(improvementEffect("q", 23))+")"):"")},
                        {}],
                "blank",
                "milestones", "blank",
                "blank",
                "buyables", "blank",
                ["display-text", "注意: 大部分诡异升级随时间变贵，但在执行诡异重置时恢复。"], "blank",
                "upgrades"],
        },
        Improvements: {
            unlocked() { return hasUpgrade("q", 41) },
            buttonStyle() { return {'background-color': '#f25ed7'} },
            content: [
                "main-display",
                "blank",
                ["display-text",
                    function() {return '你有 ' + formatWhole(player.q.energy)+' QE ('+(tmp.nerdMode?('基础获取: (timeInRun^(quirkLayers-1))'):'由诡异层生成')+'), 提供了下列诡异改良 (下一个需要 '+format(tmp.q.impr.overallNextImpr)+')'},
                        {}],
                "blank",
                "improvements"],
        },
    },
    freeLayers() {
        let l = new Decimal(0);
        if (player.m.unlocked) l = l.plus(tmp.m.buyables[13].effect);
        if (tmp.q.impr[43].unlocked) l = l.plus(improvementEffect("q", 43));
        if (player.i.buyables[11].gte(3)) l = l.plus(buyableEffect("s", 18));
        return l;
    },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "诡异层",
            costBase() {
                let base = new Decimal(2);
                if (hasUpgrade("q", 43)) base = base.sub(.25);
                if (hasChallenge("h", 42)) base = base.sub(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?.2:.15);
                if (hasAchievement("a", 101)) base = base.sub(.2);
                if (hasUpgrade("q", 25) && player.i.buyables[12].gte(6)) base = base.root(upgradeEffect("q", 25));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) base = base.pow(.75);
                return base;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = this.costBase();
                let cost = Decimal.pow(base, Decimal.pow(base, x).sub(1));
                return cost.floor()
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = (tmp.nerdMode?("价格公式: "+format(data.costBase)+"^("+format(data.costBase)+"^x-1)"):("价格: " + formatWhole(data.cost) + " 诡异")+"\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+(tmp.q.freeLayers?(tmp.q.freeLayers.gt(0)?(" + "+format(tmp.q.freeLayers)):""):""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.q.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.q.points = player.q.points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                if (!this.unlocked || !this.canAfford()) return;
                let base = this.costBase();
                let target = player.q.points.max(1).log(base).plus(1).log(base);
                target = target.plus(1).floor();
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            },
            style: {'height':'222px'},
            autoed() { return hasMilestone("ba", 1) && player.q.auto },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 总诡异",
            done() { return player.q.total.gte(2) || hasAchievement("a", 71) },
            effectDescription: "对任何重置保留增幅器、生成器、空间和时间里程碑。",
        },
        1: {
            requirementDescription: "3 总诡异",
            done() { return player.q.total.gte(3) || hasAchievement("a", 71) },
            effectDescription: "你可以最大购买时间和空间，每秒获得 100% 增强，并解锁自动增强子和自动扩展时空胶囊。",
            toggles: [["e", "auto"], ["t", "autoExt"]],
        },
        2: {
            requirementDescription: "4 总诡异",
            done() { return player.q.total.gte(4) || hasAchievement("a", 71) },
            effectDescription: "对任何重置保留空间、增强和时间升级，同时在诡异/障碍重置中保留建筑。",
        },
        3: {
            requirementDescription: "6 总诡异",
            done() { return player.q.total.gte(6) || hasAchievement("a", 71) },
            effectDescription: "解锁自动时间胶囊和自动空间能量。",
            toggles: [["t", "auto"], ["s", "auto"]],
        },
        4: {
            requirementDescription: "10 总诡异",
            done() { return player.q.total.gte(10) || hasAchievement("a", 71) },
            effectDescription: "解锁障碍和自动超级增幅器。",
            toggles: [["sb", "auto"]],
        },
        5: {
            requirementDescription: "25 总诡异",
            done() { return player.q.total.gte(25) || hasAchievement("a", 71) },
            effectDescription: "时间、空间和超级增幅器不再重置任何东西，同时你可以摧毁建筑。",
        },
        6: {
            unlocked() { return player.sg.unlocked },
            requirementDescription: "1e22 总诡异",
            done() { return player.q.total.gte(1e22) || hasAchievement("a", 71) },
            effectDescription: "解锁自动超级生成器，并且超级生成器不再重置任何东西。",
            toggles: [["sg", "auto"]],
        },
        7: {
            unlocked() { return player.sg.unlocked },
            requirementDescription: "1e60 总诡异",
            done() { return player.q.total.gte(1e60) || hasAchievement("a", 71) },
            effectDescription: "你可以最大购买超级增幅器和超级生成器，同时解锁自动建筑。",
            toggles: [["s", "autoBld"]],
        },
    },
    upgrades: {
        rows: 4,
        cols: 5,
        11: {
            title: "集中诡异",
            description: "总诡异加成诡异层生产（由诡异升级数量求幂）。",
            cost() { return player.q.time.plus(1).pow(1.2).times(100).pow(player.ma.current=="q"?this.id:1) },
            costFormula: "100*(time+1)^1.2",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasChallenge("h", 11)||((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("q"):false) },
            effect() { return player.q.total.plus(1).log10().plus(1).pow(player.q.upgrades.length).pow(improvementEffect("q", 11)) },
            effectDisplay() { return format(tmp.q.upgrades[11].effect)+"x" },
            formula: "(log(quirks+1)+1)^upgrades",
        },
        12: {
            title: "回到第 2 层",
            description: "总诡异加成增幅器/生成器底数。",
            cost() { return player.q.time.plus(1).pow(1.4).times(500).pow(player.ma.current=="q"?(Math.pow(this.id, this.id/10)*(this.id-10)):1) },
            costFormula: "500*(time+1)^1.4",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 11) },
            effect() { return player.q.total.plus(1).log10().plus(1).pow(1.25).times(improvementEffect("q", 12)) },
            effectDisplay() { return format(tmp.q.upgrades[12].effect)+"x" },
            formula: "(log(x+1)+1)^1.25",
        },
        13: {
            title: "跳过跳过第二个",
            description: "GP 效果提升至 1.25 次幂。",
            cost() { return player.q.time.plus(1).pow(1.8).times(750).pow(player.ma.current=="q"?(Math.pow(this.id, this.id/10)*(this.id-10)):1) },
            costFormula: "750*(time+1)^1.8",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 11) },
        },
        14: {
            title: "第 4 列协同",
            description: "障碍灵魂和诡异加成对方获取。",
            cost() { return player.q.time.plus(1).pow(2.4).times(1e6).pow(player.ma.current=="q"?(this.id*6):1) },
            costFormula: "1e6*(time+1)^2.4",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 12)||hasUpgrade("q", 13) },
            effect() { 
                let q = player.q.points;
                let h = player.h.points;
                h = softcap("q14_h", h);
                q = softcap("q14_q", q);
                return {
                    h: q.plus(1).cbrt().pow(improvementEffect("q", 13)),
                    q: h.plus(1).root(4).pow(improvementEffect("q", 13)),
                };
            },
            effectDisplay() { return "H: "+format(tmp.q.upgrades[14].effect.h)+"x, Q: "+format(tmp.q.upgrades[14].effect.q)+"x" },
            formula() { return "H: "+(player.q.points.gte("1e1100")?"log(cbrt(Q+1))^366.67":"cbrt(Q+1)")+", Q: "+(player.h.points.gte("1e1000")?"log(H+1)^83.33":"(H+1)^0.25") },
        },
        15: {
            title: "诡异拓展",
            description: "诡异延缓 QE 效果软上限。",
            cost() { return Decimal.pow("e1e6", player.q.time.times(10).plus(1).log10().pow(2)).times("e1.5e7") },
            costFormula: "(e1,000,000^(log(time*10+1)^2))*e15,000,000",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            pseudoUnl() { return player.i.buyables[12].gte(6) },
            pseudoReq: "需要: 40 成就",
            pseudoCan() { return player.a.achievements.length>=40 },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.q.points.plus(1) },
            effectDisplay() { return "延缓 " + format(tmp.q.upgrades[this.id].effect)+"x" },
            formula: "x+1",
        },
        21: {
            title: "诡异城市",
            description: "超级增幅器加成诡异层生产。",
            cost() { return player.q.time.plus(1).pow(3.2).times(1e8).pow(player.ma.current=="q"?(this.id*1.5):1) },
            costFormula: "1e8*(time+1)^3.2",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 11)&&hasUpgrade("q", 13) },
            effect() { return Decimal.pow(1.25, player.sb.points).pow(improvementEffect("q", 21)) },
            effectDisplay() { return format(tmp.q.upgrades[21].effect)+"x" },
            formula: "1.25^x",
        },
        22: {
            title: "无限可能",
            description: "总诡异提供免费的扩展时间胶囊、增强子和建筑。",
            cost() { return player.q.time.plus(1).pow(4.2).times(2e11).pow(player.ma.current=="q"?(this.id*2):1) },
            costFormula: "2e11*(time+1)^4.2",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 12)&&hasUpgrade("q", 14) },
            effect() { return player.q.total.plus(1).log10().sqrt().times(improvementEffect("q", 22)).floor() },
            effectDisplay() { return "+"+formatWhole(tmp.q.upgrades[22].effect) },
            formula: "floor(sqrt(log(x+1)))",
        },
        23: {
            title: "挂机游戏",
            description: "QE 效果变为三次方。",
            cost() { return player.q.time.plus(1).pow(5.4).times(5e19).pow(player.ma.current=="q"?this.id:1) },
            costFormula: "5e19*(time+1)^5.4",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 13)&&hasUpgrade("q", 21) },
        },
        24: {
            title: "指数狂怒",
            description: "TE 的第一个效果和增强子的第一个效果被提升到 7.5 次幂。",
            cost() { return player.q.time.plus(1).pow(6.8).times(1e24).pow(player.ma.current=="q"?(this.id*1.95):1) },
            costFormula: "1e24*(time+1)^6.8",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 14)&&hasUpgrade("q", 22) },
        },
        25: {
            title: "高级洋葱",
            description: "星云砖降低诡异层价格底数。",
            cost() { return Decimal.pow("e3e6", player.q.time.times(4).plus(1).log10().pow(2)).times("e2e7") },
            costFormula: "(e3,000,000^(log(time*4+1)^2))*e20,000,000",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            pseudoUnl() { return player.i.buyables[12].gte(6) },
            pseudoReq: "需要: 1e200 荣耀",
            pseudoCan() { return player.hn.points.gte(1e200) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.i.nb.plus(1).log10().plus(1).pow(3) },
            effectDisplay() { return "开 "+format(upgradeEffect("q", 25))+" 次根" },
            formula: "(log(x+1)+1)^3",
        },
        31: {
            title: "比例软化",
            description: "基于诡异层，从 12 延缓 2/3 静态比例的软上限。",
            cost() { return player.q.time.plus(1).pow(8.4).times(1e48).pow(player.ma.current=="q"?(this.id/1.25):1) },
            costFormula: "1e48*(time+1)^8.4",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 21)&&hasUpgrade("q", 23) },
            effect() { return player.q.buyables[11].sqrt().times(0.4).times(improvementEffect("q", 31)) },
            effectDisplay() { return "+"+format(tmp.q.upgrades[31].effect) },
            formula: "sqrt(x)*0.4",
        },
        32: {
            title: "超级第五空间",
            description: "第五建筑的效果翻倍。",
            cost() { return player.q.time.plus(1).pow(10).times(1e58).pow(player.ma.current=="q"?(this.id/1.6):1) },
            costFormula: "1e58*(time+1)^10",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 22)&&hasUpgrade("q", 24) },
        },
        33: {
            title: "生成级数",
            description: "解锁超级生成器",
            cost() { return player.q.time.plus(1).pow(12).times(1e81).pow(player.ma.current=="q"?(this.id/1.85):1) },
            costFormula: "1e81*(time+1)^12",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 23)&&hasUpgrade("q", 31) },
        },
        34: {
            title: "增幅狂怒",
            description: "任何增加增幅器底数的东西都会以较低的比例对其做乘法。",
            cost() { return player.q.time.plus(1).pow(15).times(2.5e94).pow(player.ma.current=="q"?(this.id/1.85):1) },
            costFormula: "2.5e94*(time+1)^15",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 24)&&hasUpgrade("q", 32) },
            effect() { return tmp.b.addToBase.plus(1).root(2.5).times(improvementEffect("q", 32)) },
            effectDisplay() { return format(tmp.q.upgrades[34].effect)+"x" },
            formula: "(x+1)^0.4",
        },
        35: {
            title: "千种能力",
            description: "超空间砖减缓诡异改良价格比例。",
            cost() { return Decimal.pow("e2e6", player.q.time.times(4).plus(1).log10().pow(3)).times("e3.5e7") },
            costFormula: "(e2,000,000^(log(time*4+1)^3))*e35,000,000",
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            pseudoUnl() { return player.i.buyables[12].gte(6) },
            pseudoReq: "需要: 无诡异层达到 e5,000,000 QE（使用第五行重置）。",
            pseudoCan() { return player.q.energy.gte("e5e6") && player.q.buyables[11].eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.i.hb.sqrt().div(25).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:1).plus(1) },
            effectDisplay() { return "延缓 " + format(upgradeEffect("q", 35).sub(1).times(100))+"%" },
            formula: "sqrt(x)*4%",
        },
        41: {
            title: "离谱",
            description: "解锁诡异改良",
            cost() { return new Decimal((player.ma.current=="q")?"1e2325":1e125) },
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 33) && hasUpgrade("q", 34) },
        },
        42: {
            title: "改良增益",
            description: "解锁 3 个诡异改良。",
            cost() { return new Decimal((player.ma.current=="q")?"1e3675":1e150) },
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 41) },
        },
        43: {
            title: "更多层",
            description: "诡异层价格增长减缓 25%。",
            cost() { return new Decimal((player.ma.current=="q")?"1e5340":1e175) },
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 42) },
        },
        44: {
            title: "大量改良",
            description: "解锁 3 个诡异改良。",
            cost() { return new Decimal((player.ma.current=="q")?"1e8725":1e290) },
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            unlocked() { return hasUpgrade("q", 43) },
        },
        45: {
            title: "反障碍",
            description: "障碍灵魂效果提升至 100 次幂（在软上限后），星云获取增幅 200 倍。",
            cost: new Decimal("e55555555"),
            currencyDisplayName: "QE",
            currencyInternalName: "energy",
            currencyLayer: "q",
            pseudoUnl() { return player.i.buyables[12].gte(6) },
            pseudoReq: "需要: e1.7e10 声望",
            pseudoCan() { return player.p.points.gte("e1.7e10") },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
    },
    impr: {
        scaleSlow() {
            let slow = new Decimal(1);
            if (tmp.ps.impr[22].unlocked) slow = slow.times(tmp.ps.impr[22].effect);
            if (hasUpgrade("q", 35) && player.i.buyables[12].gte(6)) slow = slow.times(upgradeEffect("q", 35));
            return slow;
        },
        baseReq() { 
            let req = new Decimal(1e128);
            if (player.ps.unlocked) req = req.div(tmp.ps.soulEff);
            return req;
        },
        amount() { 
            let amt = player.q.energy.div(this.baseReq()).plus(1).log10().div(2).root(layers.q.impr.scaleSlow().pow(-1).plus(1)).max(0);
            if (amt.gte(270)) amt = amt.log10().times(270/Math.log10(270));
            return amt.floor();
        },
        overallNextImpr() { 
            let impr = tmp.q.impr.amount.plus(1);
            if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
            return Decimal.pow(10, impr.pow(layers.q.impr.scaleSlow().pow(-1).plus(1)).times(2)).sub(1).times(this.baseReq()) 
        },
        nextAt(id=11) { 
            let impr = getImprovements("q", id).times(tmp.q.impr.activeRows*tmp.q.impr.activeCols).add(tmp.q.impr[id].num);
            if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
            return Decimal.pow(10, impr.pow(layers.q.impr.scaleSlow().pow(-1).plus(1)).times(2)).sub(1).times(this.baseReq());
        },
        free() {
            let free = new Decimal(0);
            if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('q'):false) free = free.plus(Decimal.div(player.s.buyables[20]||0, 4));
            return free.floor();
        },
        resName: "QE",
        rows: 4,
        cols: 3,
        activeRows: 3,
        activeCols: 3,
        11: {
            num: 1,
            title: "集中改良",
            description: "<b>集中诡异</b> 效果提高。",
            unlocked() { return hasUpgrade("q", 41) },
            effect() { return Decimal.mul(0.1, getImprovements("q", 11).plus(tmp.q.impr.free)).plus(1) },
            effectDisplay() { return "^"+format(tmp.q.impr[11].effect) },
            formula: "1+0.1*x",
        },
        12: {
            num: 2,
            title: "第二改良",
            description: "<b>回到第 2 层</b> 效果提高。",
            unlocked() { return hasUpgrade("q", 41) },
            effect() { return Decimal.mul(0.05, getImprovements("q", 12).plus(tmp.q.impr.free)).plus(1) },
            effectDisplay() { return format(tmp.q.impr[12].effect)+"x" },
            formula: "1+0.05*x",
        },
        13: {
            num: 3,
            title: "4 级改良",
            description: "<b>第 4 列协同</b> 效果提高。",
            unlocked() { return hasUpgrade("q", 41) },
            effect() { return Decimal.mul(0.25, getImprovements("q", 13).plus(tmp.q.impr.free)).plus(1) },
            effectDisplay() { return "^"+format(tmp.q.impr[13].effect) },
            formula: "1+0.25*x",
        },
        21: {
            num: 4,
            title: "发展改良",
            description: "<b>诡异城市</b> 效果提高。",
            unlocked() { return hasUpgrade("q", 42) },
            effect() { return Decimal.mul(1.5, getImprovements("q", 21).plus(tmp.q.impr.free)).plus(1) },
            effectDisplay() { return "^"+format(tmp.q.impr[21].effect) },
            formula: "1+1.5*x",
        },
        22: {
            num: 5,
            title: "离谱改良",
            description: "<b>无限可能</b> 效果提高。",
            unlocked() { return hasUpgrade("q", 42) },
            effect() { return Decimal.mul(0.2, getImprovements("q", 22).plus(tmp.q.impr.free)).plus(1) },
            effectDisplay() { return format(tmp.q.impr[22].effect)+"x" },
            formula: "1+0.2*x",
        },
        23: {
            num: 6,
            title: "能量改良",
            description: "QE 效果提高。",
            unlocked() { return hasUpgrade("q", 42) },
            effect() { return Decimal.pow(1e25, Decimal.pow(getImprovements("q", 23).plus(tmp.q.impr.free), 1.5)) },
            effectDisplay() { return format(tmp.q.impr[23].effect)+"x" },
            formula: "1e25^(x^1.5)",
        },
        31: {
            num: 7,
            title: "比例改良",
            description: "<b>比例软化</b> 效果提高。",
            unlocked() { return hasUpgrade("q", 44) },
            effect() { return Decimal.mul(0.5, getImprovements("q", 31).plus(tmp.q.impr.free)).plus(1) },
            effectDisplay() { return format(tmp.q.impr[31].effect)+"x" },
            formula: "1+0.5*x",
        },
        32: {
            num: 8,
            title: "增幅改良",
            description: "<b>增幅狂怒</b> 效果提高。",
            unlocked() { return hasUpgrade("q", 44) },
            effect() { return Decimal.mul(0.2, getImprovements("q", 32).plus(tmp.q.impr.free)).plus(1) },
            effectDisplay() { return format(tmp.q.impr[32].effect)+"x" },
            formula: "1+0.2*x",
        },
        33: {
            num: 9,
            title: "诡异改良",
            description: "诡异获取提高。",
            unlocked() { return hasUpgrade("q", 44) },
            effect() { return Decimal.pow(1e8, Decimal.pow(getImprovements("q", 33).plus(tmp.q.impr.free), 1.2)) },
            effectDisplay() { return format(tmp.q.impr[33].effect)+"x" },
            formula: "1e8^(x^1.2)",
        },
        41: {
            num: 271,
            title: "阳光改良",
            description: "SE 获取增强。",
            unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=1 },
            effect() { return Decimal.pow("1e400", Decimal.pow(getImprovements("q", 41).plus(tmp.q.impr.free), 0.9)) },
            effectDisplay() { return format(tmp.q.impr[41].effect)+"x" },
            formula: "1e400^(x^0.9)",
        },
        42: {
            num: 281,
            title: "子空间改良",
            description: "子空间底数提高。",
            unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=2 },
            effect() { return Decimal.pow(10, Decimal.pow(getImprovements("q", 42).plus(tmp.q.impr.free), 0.75)) },
            effectDisplay() { return format(tmp.q.impr[42].effect)+"x" },
            formula: "10^(x^0.75)",
        },
        43: {
            num: 301,
            title: "层改良",
            description: "增加免费诡异层。",
            unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=3 },
            effect() { return Decimal.mul(Decimal.pow(getImprovements("q", 43).plus(tmp.q.impr.free), 0.8), 1.25) },
            effectDisplay() { return "+"+format(tmp.q.impr[43].effect) },
            formula: "1.25*(x^0.8)",
        },
    },
})
/*
             
             
             
             
             
             
ooooooooooo   
oo:::::::::::oo 
o:::::::::::::::o
o:::::ooooo:::::o
o::::o     o::::o
o::::o     o::::o
o::::o     o::::o
o::::o     o::::o
o:::::ooooo:::::o
o:::::::::::::::o
oo:::::::::::oo 
ooooooooooo   
             
             
             
             
             
             
             
*/
addLayer("o", {
name: "solarity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        energy: new Decimal(0),
        first: 0,
    }},
    increaseUnlockOrder: ["ss"],
    roundUpCost: true,
    color: "#ffcd00",
    nodeStyle() {return {
        "background": (((player.o.unlocked||canReset("o"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer))))?((player.grad&&!player.oldStyle)?"radial-gradient(#ffcd00, #ff4300)":"#ff8200"):"#bf8f8f" ,
    }},
    componentStyles: {
        "prestige-button"() {return { "background": (canReset("o"))?((player.grad&&!player.oldStyle)?"radial-gradient(#ffcd00, #ff4300)":"#ff8200"):"#bf8f8f" }},
    },
    requires() { 
        let req = new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 62))?16:14).sub(tmp.o.solEnEff);
        if (hasUpgrade("ba", 23)) req = req.div(tmp.ba.posBuff.max(1));
        return req;
    },
    resource: "阳光", // Name of prestige currency
    baseResource: "超级增幅器", // Name of resource prestige is based on
    baseAmount() {return player.sb.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { 
        let exp = new Decimal(10);
        if (hasUpgrade("p", 34)) exp = exp.times(upgradeEffect("p", 34));
        if (hasUpgrade("hn", 25)) exp = exp.times(upgradeEffect("hn", 25));
        if (player.n.buyables[11].gte(4)) exp = exp.times(buyableEffect("o", 32));
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(player.sb.points.times(0.5/100).plus(1))
        if (player.en.unlocked) exp = exp.plus(tmp.en.owEff);
        return exp;
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = buyableEffect("o", 11);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1);
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "按 O 进行阳光重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        player.q.time = new Decimal(0);
        player.q.energy = new Decimal(0);
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return (player.sb.unlocked&&player.h.unlocked)||player.m.unlocked||player.ba.unlocked },
    branches: ["sb", "t"],
    effect() { 
        if (!unl(this.layer)) return new Decimal(0);
        let sol = player.o.points;
        sol = softcap("sol_eff", sol);
        let eff = sol.plus(1).log10();
        let cap = 0.1;
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) cap = 0.15;
        if (eff.gt(10)) eff = eff.log10().times(3).plus(7)
        return eff.div(100).min(cap);
    },
    effect2() { return player.o.points.div(1e20).plus(1).sqrt().pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
    solEnGain() { 
        let gain = player.t.energy.max(1).pow(tmp.o.effect).times(tmp.o.effect2).sub(1);
        if (player.m.unlocked) gain = gain.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
        if (tmp.q.impr[41].unlocked) gain = gain.times(improvementEffect("q", 41));
        return gain;
    },
    solEnEff() { return Decimal.sub(4, Decimal.div(4, player.o.energy.plus(1).log10().plus(1))) },
    solEnEff2() { return player.o.energy.plus(1).pow(2) },
    effectDescription() { return "生成  "+(tmp.nerdMode?("(timeEnergy^"+format(tmp.o.effect)+(tmp.o.effect.gt(1.01)?("*"+format(tmp.o.effect2)):"")+"-1)"):format(tmp.o.solEnGain))+" SE/sec" },
    update(diff) {
        player.o.energy = player.o.energy.plus(tmp.o.solEnGain.times(diff));
        if (hasMilestone("m", 0) && player.ma.current!="o") {
            for (let i in tmp.o.buyables) if (i!="rows" && i!="cols") if (tmp.o.buyables[i].unlocked) player.o.buyables[i] = player.o.buyables[i].plus(tmp.o.buyables[i].gain.times(diff));
        }
    },
    passiveGeneration() { return player.ma.current=="o"?0:(hasMilestone("m", 0)?1:(hasMilestone("o", 0)?0.05:0)) },
    solPow() {
        let pow = new Decimal(1);
        if (hasUpgrade("ss", 33)) pow = pow.plus(upgradeEffect("ss", 33));
        if (hasUpgrade("ss", 41)) pow = pow.plus(buyableEffect("o", 21));
        if (hasUpgrade("ba", 11)) pow = pow.plus(upgradeEffect("ba", 11));
        if (hasUpgrade("hn", 55)) pow = pow.plus(upgradeEffect("hn", 55));
        if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
        if (tmp.ps.impr[11].unlocked) pow = pow.times(tmp.ps.impr[11].effect);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.plus(player.o.points.plus(1).log10().div(5));
        return softcap("solPow", pow);
    },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text",
            function() {return '你有 ' + format(player.o.energy) + ' SE，减少阳光需求 '+format(tmp.o.solEnEff)+(tmp.nerdMode?(" (4-4/(log(x+1)+1))"):"")+' 并加成 TE 上限 '+format(tmp.o.solEnEff2)+'.'+(tmp.nerdMode?(" (x+1)^2"):"")},
                {}],
        "blank",
        "milestones",
        "blank",
        ["display-text",
            function() { return "<b>太阳能: "+format(tmp.o.solPow.times(100))+"%</b><br>" },
                {}],
        "buyables",
        "blank"
    ],
    multiplyBuyables() {
        let mult = tmp.n.dustEffs.orange;
        return mult;
    },
    buyableGainExp() {
        let exp = new Decimal(1);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(2.6);
        return exp;
    },
    buyables: {
        rows: 3,
        cols: 3,
        11: {
            title: "太阳核心",
            gain() { return player.o.points.div(2).root(1.5).pow(tmp.o.buyableGainExp).floor() },
            effect() { 
                let amt = player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables)
                amt = softcap("solCores2", softcap("solCores", amt));
                return Decimal.pow(hasUpgrade("ss", 22)?(amt.plus(1).pow(tmp.o.solPow).cbrt()):(amt.plus(1).pow(tmp.o.solPow).log10().plus(1)), ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1)
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let x = player[this.layer].buyables[this.id].gte(5e4)?"10^(sqrt(log(x)*log(5e4)))":"x"
                let display = ("献祭你所有的阳光，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 太阳核心\n"+
                "需要: 2 阳光\n"+
                "数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
                (tmp.nerdMode?("公式: "+(hasUpgrade("ss", 22)?"cbrt("+x+"+1)":"log("+x+"+1)+1")+""):("效果: 加成阳光获取 "+format(tmp[this.layer].buyables[this.id].effect) + 'x'))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() { return player.o.points.gte(2) },
            buy() { 
                player.o.points = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
            buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px'},
            autoed() { return hasMilestone("m", 0) },
        },
        12: {
            title: "差旋层电浆",
            gain() { return player.o.points.div(100).times(player.o.energy.div(2500)).root(3.5).pow(tmp.o.buyableGainExp).floor() },
            effect() { return Decimal.pow(hasUpgrade("p", 24)?Decimal.pow(10, player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).log10().cbrt()):(player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().times(10).plus(1)), ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("献祭你所有的阳光和 SE，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 差旋层电浆\n"+
                "需要: 100 阳光、2,500 SE\n"+
                "数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
                (tmp.nerdMode?("公式: "+(hasUpgrade("p", 24)?"10^cbrt(log(x+1))":"log(log(x+1)+1)*10+1")):("效果: 加成超级增幅器底数和诡异层 "+format(tmp[this.layer].buyables[this.id].effect) + 'x'))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() { return player.o.points.gte(100)&&player.o.energy.gte(2500) },
            buy() { 
                player.o.points = new Decimal(0);
                player.o.energy = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
            buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
        13: {
            title: "对流能",
            gain() { return player.o.points.div(1e3).times(player.o.energy.div(2e5)).times(player.ss.subspace.div(10)).root(6.5).pow(tmp.o.buyableGainExp).floor() },
            effect() { return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).pow(2.5).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?27.5:1) },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("献祭所有阳光、SE 和子空间，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 对流能\n"+
                "需要: 1e3 阳光、2e5 SE 和 10 子空间\n"+
                "数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
                (tmp.nerdMode?("公式: (log(x+1)+1)^2.5"):("效果: 加成时间胶囊底数和子空间获取 "+format(tmp[this.layer].buyables[this.id].effect) + 'x'))
                return display;
            },
            unlocked() { return player[this.layer].unlocked&&player.ss.unlocked }, 
            canAfford() { return player.o.points.gte(1e3)&&player.o.energy.gte(2e5)&&player.ss.subspace.gte(10) },
            buy() { 
                player.o.points = new Decimal(0);
                player.o.energy = new Decimal(0);
                player.ss.subspace = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
            buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
        21: {
            title: "日冕波动",
            gain() { return player.o.points.div(1e5).root(5).times(player.o.energy.div(1e30).root(30)).times(player.ss.subspace.div(1e8).root(8)).times(player.q.energy.div("1e675").root(675)).pow(tmp.o.buyableGainExp).floor() },
            effect() { 
                let eff = player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10();
                eff = softcap("corona", eff);
                if (hasUpgrade("hn", 24)) eff = eff.times(2);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.times(1.4);
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("献祭所有阳光、SE、子空间和 QE，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 日冕波动\n"+
                "需要: 1e5 阳光、1e30 SE、5e8 子空间和 1e675 QE\n"+
                "数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
                (tmp.nerdMode?("公式: log(log(x+1)+1)"):("效果: 子空间底数+"+format(tmp[this.layer].buyables[this.id].effect)+"，太阳能+"+format(tmp[this.layer].buyables[this.id].effect.times(100))+"%"))
                return display;
            },
            unlocked() { return player[this.layer].unlocked&&hasUpgrade("ss", 41) }, 
            canAfford() { return player.o.points.gte(1e5)&&player.o.energy.gte(1e30)&&player.ss.subspace.gte(1e8)&&player.q.energy.gte("1e675") },
            buy() { 
                player.o.points = new Decimal(0);
                player.o.energy = new Decimal(0);
                player.ss.subspace = new Decimal(0);
                player.q.energy = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
            buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
        22: {
            title: "新星遗迹",
            gain() { return player.o.buyables[11].div(1e150).pow(3).pow(tmp.o.buyableGainExp).floor() },
            effect() {
                return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().root(10).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1).plus(1)
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                return ("献祭所有太阳核心，获得 "+formatWhole(data.gain)+" 新星遗迹\n"+
                "需要: 1e150 太阳核心\n"+
                "数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
                (tmp.nerdMode?("公式: (log(x+1)^0.1)+1"):("效果: 增幅荣耀获取（无视软上限）以及三种星尘获取 "+format(data.effect)+"x")))
            },
            unlocked() { return player.n.buyables[11].gte(1) },
            canAfford() { return player.o.buyables[11].gte(1e150) },
            buy() {
                player.o.buyables[11] = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
             buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
        23: {
            title: "核熔炉",
            gain() { return player.o.buyables[11].div(1e175).times(player.o.energy.div("1e2500").root(10)).pow(tmp.o.buyableGainExp).floor() },
            effect() {
                return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().root(2.5).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1)
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                return ("献祭所有太阳核心和 SE，获得 "+formatWhole(data.gain)+" 核熔炉\n"+
                "需要: 1e175 太阳核心 & 1e2,500 SE\n"+
                "数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
                (tmp.nerdMode?("公式: (log(log(x+1)+1)^0.4)*100"):("效果: 建筑增强 "+format(data.effect.times(100))+"%")))
            },
            unlocked() { return player.n.buyables[11].gte(2) },
            canAfford() { return player.o.buyables[11].gte(1e175)&&player.o.energy.gte("1e2500") },
            buy() {
                player.o.buyables[11] = new Decimal(0);
                player.o.energy = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
             buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
        31: {
            title: "蓝移耀斑",
            gain() { return player.o.points.div("1e400").pow(10).pow(tmp.o.buyableGainExp).floor() },
            effect() {
                return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().root(5).div(10).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1)
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                return ("献祭所有阳光，获得 "+formatWhole(data.gain)+" 蓝移耀斑\n"+
                "需要: 1e400 阳光\n"+
                "数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
                (tmp.nerdMode?("公式: (log(log(x+1)+1)^0.2)*10"):("效果: 魔法增强 "+format(data.effect.times(100))+"%")))
            },
            unlocked() { return player.n.buyables[11].gte(3) },
            canAfford() { return player.o.points.gte("1e400") },
            buy() {
                player.o.points = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
             buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
        32: {
            title: "燃气",
            gain() { return player.o.energy.div("1e200000").root(100).pow(tmp.o.buyableGainExp).floor() },
            effect() {
                return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).log10().div(1.6).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1).plus(1)
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                return ("献祭所有 SE，获得 "+formatWhole(data.gain)+" 燃气\n"+
                "需要: e200,000 SE\n"+
                "Amount: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
                (tmp.nerdMode?("公式: log(log(log(x+1)+1)+1)/1.6+1"):("效果: 将阳光获取指数乘 "+format(data.effect)+"。")))
            },
            unlocked() { return player.n.buyables[11].gte(4) },
            canAfford() { return player.o.energy.gte("1e200000") },
            buy() {
                player.o.energy = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
             buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
        33: {
            title: "聚变原料",
            gain() { return player.o.points.div("1e500").pow(10).pow(tmp.o.buyableGainExp).floor() },
            effect() {
                return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).log10().div(3).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                return ("献祭所有阳光，获得 "+formatWhole(data.gain)+" 聚变原料\n"+
                "需要: 1e750 阳光\n"+
                "数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
                (tmp.nerdMode?("公式: log(log(log(x+1)+1)+1)/3"):("效果: 太阳能、建筑增益、超建筑增益 +"+format(data.effect.times(100))+"%。")))
            },
            unlocked() { return player.n.buyables[11].gte(5) },
            canAfford() { return player.o.points.gte("1e750") },
            buy() {
                player.o.points = new Decimal(0);
                player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
            },
             buyMax() {
                // I'll do this later ehehe
            },
            style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            autoed() { return hasMilestone("m", 0) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "50,000 总阳光",
            done() { return player.o.total.gte(5e4) || hasAchievement("a", 71) },
            effectDescription: "每秒获得 5% 的阳光。",
        },
    },
})
/*
                              
                              
                              
                              
                              
                              
ssssssssss       ssssssssss   
ss::::::::::s    ss::::::::::s  
ss:::::::::::::s ss:::::::::::::s 
s::::::ssss:::::ss::::::ssss:::::s
s:::::s  ssssss  s:::::s  ssssss 
s::::::s         s::::::s      
  s::::::s         s::::::s   
ssssss   s:::::s ssssss   s:::::s 
s:::::ssss::::::ss:::::ssss::::::s
s::::::::::::::s s::::::::::::::s 
s:::::::::::ss   s:::::::::::ss  
sssssssssss      sssssssssss    
                              
                              
                              
                              
                              
                              
                              
*/
addLayer("ss", {
    name: "subspace", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        subspace: new Decimal(0),
        auto: false,
        first: 0,
    }},
    color: "#e8ffff",
    requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 62))?30:28) }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "子空间能量", // Name of prestige currency
    baseResource: "空间能量", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.07:1.1) }, // Prestige currency exponent
    base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1.15) },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.ne.unlocked) mult = mult.div(tmp.ne.thoughtEff1);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return hasMilestone("hn", 3) },
    effBase() {
        let base = new Decimal(2);
        if (hasUpgrade("ss", 32)) base = base.plus(upgradeEffect("ss", 32));
        if (hasUpgrade("ss", 41)) base = base.plus(buyableEffect("o", 21));
        if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
        
        if (player.ba.unlocked) base = base.times(tmp.ba.posBuff);
        if (tmp.q.impr[42].unlocked) base = base.times(improvementEffect("q", 42));
        if (hasUpgrade("hn", 35)) base = base.times(upgradeEffect("hn", 35));
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) base = base.times(Decimal.pow(1e10, player.ss.points));
        if (player.ne.unlocked) base = base.times(tmp.ne.thoughtEff2);
        
        if (hasUpgrade("t", 41) && player.i.buyables[12].gte(4)) base = base.pow(1.5);
        return base;
    },
    effect() { 
        if (!unl(this.layer)) return new Decimal(1);
        let gain = Decimal.pow(tmp.ss.effBase, player.ss.points).sub(1);
        if (hasUpgrade("ss", 13)) gain = gain.times(upgradeEffect("ss", 13));
        if (player.o.unlocked) gain = gain.times(buyableEffect("o", 13));
        if (player.m.unlocked) gain = gain.times(tmp.m.hexEff);
        return gain;
    },
    autoPrestige() { return player.ss.auto && hasMilestone("ba", 2) && player.ma.current!="ss" },
    effectDescription() {
        return "生成 "+format(tmp.ss.effect)+" 子空间/sec"+(tmp.nerdMode?("\n\(每个 "+format(tmp.ss.effBase)+"x)"):"")
    },
    update(diff) {
        if (player.ss.unlocked) player.ss.subspace = player.ss.subspace.plus(tmp.ss.effect.times(diff));
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "S", description: "按 Shift+S 进行子空间重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("ba", 2) },
    effPow() {
        let pow = new Decimal(1);
        if (hasUpgrade("ss", 12)) pow = pow.times(upgradeEffect("ss", 12));
        if (hasUpgrade("ba", 12)) pow = pow.times(upgradeEffect("ba", 12).plus(1));
        return pow;
    },
    eff1() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).log10().pow(3).times(100).floor() },
    eff2() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).log10().plus(1).log10().div(6) },
    eff3() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3e3:1e3) },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text",
            function() {return '你有 ' + format(player.ss.subspace) + ' 子空间，提供了 '+formatWhole(tmp.ss.eff1)+' 额外空间'+(tmp.nerdMode?(" ((log(x+1)^3)*"+format(tmp.ss.effPow.pow(3).times(100))+")"):"")+'，使建筑增强 '+format(tmp.ss.eff2.times(100))+'%'+(tmp.nerdMode?(" (log(log(x+1)*"+format(tmp.ss.effPow)+"+1)/6)"):"")+'，并使建筑价格降低 '+format(tmp.ss.eff3)+'x.'+(tmp.nerdMode?(" ((x+1)^"+format(tmp.ss.effPow.times(1e3))+")"):"")},
                {}],
        "blank",
        "upgrades",
    ],
    increaseUnlockOrder: ["o"],
    doReset(resettingLayer){ 
        let keep = [];
        if (hasMilestone("ba", 2)) keep.push("upgrades");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return (player.s.unlocked&&player.h.unlocked)||player.m.unlocked||player.ba.unlocked},
    branches: ["s"],
    upgrades: {
        rows: 4,
        cols: 3,
        11: {
            title: "空间觉醒",
            description: "空间能量的价格公式的底下降 (1e15 -> 1e10)。",
            cost() { return new Decimal((player.ma.current=="ss")?"1e14326":180) },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return player.ss.unlocked },
        },
        12: {
            title: "子空间觉醒",
            description: "子空间能量加成所有子空间效果。",
            cost() { return new Decimal((player.ma.current=="ss")?20:2) },
            unlocked() { return hasUpgrade("ss", 11) },
            effect() { 
                let eff = player.ss.points.div(2.5).plus(1).sqrt();
                if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && eff.gte(2)) eff = eff.sub(1).times(100).pow(3).div(1e6).plus(1);
                return eff;
            },
            effectDisplay() { return format(tmp.ss.upgrades[12].effect.sub(1).times(100))+"%" },
            formula: "sqrt(x/2.5)*100",
        },
        13: {
            title: "粉碎使徒",
            description: "诡异加成子空间获取。",
            cost() { return new Decimal((player.ma.current=="ss")?"2e14382":1e3) },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return hasUpgrade("ss", 11) },
            effect() { return player.q.points.plus(1).log10().div(10).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?400:1) },
            effectDisplay() { return format(tmp.ss.upgrades[13].effect)+"x" },
            formula: "log(x+1)/10+1",
        },
        21: {
            title: "非法升级",
            description: "超级增幅器和超级生成器降价 20%。",
            cost() { return new Decimal((player.ma.current=="ss")?"1e16708":1e4) },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return hasUpgrade("ss", 13) },
        },
        22: {
            title: "太阳之下",
            description: "<b>太阳核心</b> 使用更好的公式。",
            cost() { return new Decimal((player.ma.current=="ss")?"1e17768":4e5) },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
        },
        23: {
            title: "刹那",
            description: "<b>永恒</b> 效果随时间增长（而不是下降）。",
            cost() { return new Decimal((player.ma.current=="ss")?"5e17768":1e6) },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
        },
        31: {
            title: "止步",
            description: "未使用的空间提供免费建筑。",
            cost() { return new Decimal((player.ma.current=="ss")?1626:42) },
            currencyDisplayName: "空间能量",
            currencyInternalName: "points",
            currencyLayer: "s",
            unlocked() { return hasUpgrade("ss", 22)||hasUpgrade("ss", 23) },
            effect() { return tmp.s.space.plus(1).cbrt().sub(1).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1).floor() },
            effectDisplay() { return "+"+formatWhole(tmp.ss.upgrades[31].effect) },
            formula: "cbrt(x+1)-1",
        },
        32: {
            title: "超越无限",
            description: "诡异层加成子空间能量和超级生成器底数。.",
            cost() { return new Decimal((player.ma.current=="ss")?1628:43) },
            currencyDisplayName: "空间能量",
            currencyInternalName: "points",
            currencyLayer: "s",
            unlocked() { return hasUpgrade("ss", 31) },
            effect() { return player.q.buyables[11].sqrt().div(1.25) },
            effectDisplay() { return "+"+format(tmp.ss.upgrades[32].effect) },
            formula: "sqrt(x)/1.25",
        },
        33: {
            title: "永辉",
            description: "<b>永恒</b> 效果基于你本轮游戏时长，太阳核心加成太阳能。",
            cost() { return new Decimal((player.ma.current=="ss")?"1e17796":2.5e7) },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return hasUpgrade("ss", 23)&&hasUpgrade("ss", 31) },
            effect() { return player.o.buyables[11].plus(1).log10().div(10) },
            effectDisplay() { return "+"+format(tmp.ss.upgrades[33].effect.times(100))+"%" },
            formula: "log(x+1)*10",
            style: {"font-size": "9px"},
        },
        41: {
            title: "更多太阳",
            description: "解锁日冕波动。",
            cost() { return new Decimal((player.ma.current=="ss")?1628:46) },
            currencyDisplayName: "空间能量",
            currencyInternalName: "points",
            currencyLayer: "s",
            unlocked() { return hasUpgrade("ss", 33) },
        },
        42: {
            title: "子子空间",
            description: "建筑增强 100%（叠加）。",
            cost() { return new Decimal((player.ma.current=="ss")?"1e17799":"1e936") },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return hasChallenge("h", 42) },
        },
        43: {
            title: "挑战加速",
            endpoint() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e11":"e1e6") },
            description() { return "当其小于 "+format(tmp.ss.upgrades[43].endpoint)+" 时，点数获取提升至 1.1 次幂，否则提升至 1.01 次幂。" },
            cost() { return new Decimal((player.ma.current=="ss")?"1e17800":"1e990") },
            currencyDisplayName: "子空间",
            currencyInternalName: "subspace",
            currencyLayer: "ss",
            unlocked() { return hasChallenge("h", 42) },
            style: {"font-size": "9px"},
        },
    },
})