
/*
                       
                       
         tttt          
      ttt:::t          
      t:::::t          
      t:::::t          
ttttttt:::::ttttttt    
t:::::::::::::::::t    
t:::::::::::::::::t    
tttttt:::::::tttttt    
      t:::::t          
      t:::::t          
      t:::::t          
      t:::::t    tttttt
      t::::::tttt:::::t
      tt::::::::::::::t
        tt:::::::::::tt
          ttttttttttt  
                       
                       
                       
                       
                       
                       
                       
*/
addLayer("t", {
    name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        energy: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
        autoExt: false,
    }},
    color: "#006609",
    requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
    resource: "时间胶囊", // Name of prestige currency
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?new Decimal(1.4):new Decimal(1.85) }, // Prestige currency exponent
    base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?new Decimal(10):new Decimal(1e15) },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return hasMilestone("q", 1) },
    enCapMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("t", 12)) mult = mult.times(upgradeEffect("t", 12));
        if (hasUpgrade("t", 21)) mult = mult.times(100);
        if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
        if (player.h.unlocked) mult = mult.times(tmp.h.effect);
        if (player.o.unlocked) mult = mult.times(tmp.o.solEnEff2);
        return mult;
    },
    enGainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
        if (player.h.unlocked) mult = mult.times(tmp.h.effect);
        return mult;
    },
    effBaseMult() {
        let mult = new Decimal(1);
        if (player.o.unlocked) mult = mult.times(buyableEffect("o", 13));
        if (player.ba.unlocked) mult = mult.times(tmp.ba.posBuff);
        if (player.m.unlocked) mult = mult.times(tmp.m.buyables[12].effect);
        return mult;
    },
    effBasePow() {
        let exp = new Decimal(1);
        if (player.m.unlocked) exp = exp.times(player.m.spellTimes[12].gt(0)?1.1:1);
        return exp;
    },
    effGainBaseMult() {
        let mult = new Decimal(1);
        if (player.ps.unlocked) mult = mult.times(challengeEffect("h", 32));
        if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && hasUpgrade("t", 11)) mult = mult.times(upgradeEffect("t", 11).max(1));
        if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && hasUpgrade("t", 25)) mult = mult.times(upgradeEffect("t", 25).max(1))
        return mult;
    },
    effLimBaseMult() {
        let mult = tmp.n.realDustEffs2?new Decimal(tmp.n.realDustEffs2.orangePurple||1):new Decimal(1);
        if (hasUpgrade("t", 33) && player.i.buyables[12].gte(4)) mult = mult.times(upgradeEffect("t", 33));
        return mult;
    },
    nonExtraTCPow() {
        let pow = new Decimal(1);
        if (player.en.unlocked) pow = pow.times(tmp.en.twEff);
        return pow;
    },
    effect() { 
        if (!unl(this.layer)) return {gain: new Decimal(0), limit: new Decimal(0)};
        else return {
            gain: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effGainBaseMult).times(3).pow(tmp.t.effBasePow), player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).gt(0)?1:0).times(tmp.t.enGainMult).max(0),
            limit: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effLimBaseMult).times(2).pow(tmp.t.effBasePow), player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(100).times(player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).gt(0)?1:0).times(tmp.t.enCapMult).max(0),
        }
    },
    effect2() {
        if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) || !unl(this.layer)) return new Decimal(1);
        let c = player.t.points.plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules);
        return Decimal.pow(1.01, c.sqrt());
    },
    effectDescription() {
        return "生成 "+format(tmp.t.effect.gain)+" TE/sec，同时上限为  "+format(tmp.t.effect.limit)+" TE"+(tmp.nerdMode?("\n(每个获得 "+format(tmp.t.effBaseMult.times(tmp.t.effGainBaseMult).times(3))+"x，每个上限 "+format(tmp.t.effBaseMult.times(2))+"x)"):"")+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?("，并使 掌握 前的所有层的速度加成 "+format(tmp.t.effect2)+(tmp.nerdMode?(" (1.01^sqrt(x))"):"")):"")
    },
    enEff() {
        if (!unl(this.layer)) return new Decimal(1);
        let eff = player.t.energy.add(1).pow(1.2);
        if (hasUpgrade("t", 14)) eff = eff.pow(1.3);
        if (hasUpgrade("q", 24)) eff = eff.pow(7.5);
        return softcap("timeEnEff", eff);
    },
    enEff2() {
        if (!unl(this.layer)) return new Decimal(0);
        if (!hasUpgrade("t", 24)) return new Decimal(0);
        let exp = 5/9
        if (hasUpgrade("t", 35) && player.i.buyables[12].gte(4)) exp = .565;
        let eff = player.t.energy.max(0).plus(1).log10().pow(exp);
        return softcap("timeEnEff2", eff).floor();
    },
    nextEnEff2() {
        if (!hasUpgrade("t", 24)) return new Decimal(1/0);
        let next = Decimal.pow(10, reverse_softcap("timeEnEff2", tmp.t.enEff2.plus(1)).pow(1.8)).sub(1);
        return next;
    },
    autoPrestige() { return (player.t.auto && hasMilestone("q", 3))&&player.ma.current!="t" },
    update(diff) {
        if (player.t.unlocked) player.t.energy = player.t.energy.plus(this.effect().gain.times(diff)).min(this.effect().limit).max(0);
        if (player.t.autoExt && hasMilestone("q", 1) && !inChallenge("h", 31)) this.buyables[11].buyMax();
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "按 T 进行时间重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="t" },
    tabFormat: ["main-display",
        "prestige-button",
        "blank",
        ["display-text",
            function() {return '你有 ' + format(player.t.energy) + ' TE，增幅点数和声望获取 '+format(tmp.t.enEff)+'x'+(tmp.nerdMode?" ((x+1)^"+format(1.2*(hasUpgrade("t", 14)?1.3:1)*(hasUpgrade("q", 24)?7.5:1))+")":"")+(hasUpgrade("t", 24)?("，并提供 "+formatWhole(tmp.t.enEff2)+" 个免费的扩展时间胶囊 ("+(tmp.nerdMode?"log(x+1)^0.556":("下一个在 "+format(tmp.t.nextEnEff2)))+")."):"")},
                {}],
        "blank",
        ["display-text",
            function() {return '你最多拥有 ' + formatWhole(player.t.best) + ' TE'},
                {}],
        "blank",
        "milestones", "blank", "buyables", "blank", "upgrades"],
    increaseUnlockOrder: ["e", "s"],
    doReset(resettingLayer){ 
        let keep = [];
        if (hasMilestone("q", 0)) keep.push("milestones")
        if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return player.b.unlocked},
    branches: ["b"],
    upgrades: {
        rows: 4,
        cols: 5,
        11: {
            title: "伪增幅",
            description: "非扩展时空胶囊加成增幅器底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?750:2) },
            unlocked() { return player.t.unlocked },
            effect() { 
                return player.t.points.pow(0.9).add(0.5).plus(hasUpgrade("t", 13)?upgradeEffect("t", 13):0).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1);
            },
            effectDisplay() { return "+"+format(tmp.t.upgrades[11].effect) },
            formula() { 
                let f = "x^0.9"+(hasUpgrade("t", 13)?("+"+format(upgradeEffect("t", 13).plus(0.5))):"+0.5") 
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) f = "("+f+")^3"
                return f;
            },
        },
        12: {
            title: "超越极限",
            description: "增幅器加成 TE 上限，并获取 1 个扩展时空胶囊。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e262:([5e4,2e5,2.5e6][player[this.layer].unlockOrder||0])) },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            unlocked() { return player.t.best.gte(2) },
            effect() { 
                return player.b.points.pow(0.95).add(1)
            },
            effectDisplay() { return format(tmp.t.upgrades[12].effect)+"x" },
            formula: "x^0.95+1",
        },
        13: {
            title: "伪伪增幅",
            description: "扩展时空胶囊同样计入 <b>伪增幅</b> 的效果。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e265:([3e6,3e7,3e8][player[this.layer].unlockOrder||0])) },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            unlocked() { return hasUpgrade("t", 12) },
            effect() { 
                return player.t.buyables[11].add(tmp.t.freeExtraTimeCapsules).pow(0.95);
            },
            effectDisplay() { return "+"+format(tmp.t.upgrades[13].effect) },
            formula: "x^0.95",
        },
        14: {
            title: "更多时间",
            description: "TE 效果提高到 1.3 次幂。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?760:(player.t.unlockOrder>=2?5:4)) },
            unlocked() { return hasUpgrade("t", 13) },
        },
        15: {
            title: "时间效力",
            description: "TE 加成 GP 获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e267:([1.25e7,(player.s.unlocked?3e8:6e7),1.5e9][player[this.layer].unlockOrder||0])) },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            unlocked() { return hasUpgrade("t", 13) },
        },
        21: {
            title: "虚弱链",
            description: "TE 上限扩大 100 倍。",
            cost() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:12 },
            unlocked() { return hasAchievement("a", 33) },
        },
        22: {
            title: "增强时间",
            description: "增强 加成 TE 获取和上限。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?765:9) },
            unlocked() { return hasAchievement("a", 33) },
            effect() { 
                return player.e.points.plus(1).root(10).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1);
            },
            effectDisplay() { return format(tmp.t.upgrades[22].effect)+"x" },
            formula() { return "(x+1)^"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"0.11":"0.1") },
        },
        23: {
            title: "反转时间",
            description: "时间以你首先选择时间的方式运行。",
            cost() { return new Decimal(player[this.layer].unlockOrder>=2?3e9:(player.s.unlocked?6.5e8:1.35e8)) },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            unlocked() { return (player[this.layer].unlockOrder>0||hasUpgrade("t", 23))&&hasUpgrade("t", 13) },
            onPurchase() { player[this.layer].unlockOrder = 0; },
        },
        24: {
            title: "时间膨胀",
            description: "解锁一个新的 TE 效果。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e267:2e17) },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            unlocked() { return hasAchievement("a", 33) },
        },
        25: {
            title: "底数",
            description: "TE 加成增幅器底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?'1e9000':3e19) },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            unlocked() { return hasAchievement("a", 33) },
            effect() { return player.t.energy.plus(1).log10().div(1.2).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1) },
            effectDisplay() { return "+"+format(tmp.t.upgrades[25].effect) },
            formula() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"(log(x+1)/1.2)^3":"log(x+1)/1.2" },
        },
        31: {
            title: "廉价时间",
            description: "扩展时间胶囊价格不再缩放，价格指数降低 0.2。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e16400":"e3600000") },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
            pseudoReq: "需要: 1e42 荣耀",
            pseudoCan() { return player.hn.points.gte(1e42) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        32: {
            title: "超时间连续体",
            description: "超空间价格缩放减缓 33.33%。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e39000":"e4240000") },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
            pseudoReq: "需要: 1e31 超空间能量",
            pseudoCan() { return player.hs.points.gte(1e31) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        33: {
            title: "近似无限",
            description: "TE 加成 TE 上限底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:750) },
            pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
            pseudoReq: "需要: 30 幽魂",
            pseudoCan() { return player.ps.points.gte(30) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.t.energy.plus(1).log10().plus(1).pow(3.5) },
            effectDisplay() { return format(tmp.t.upgrades[33].effect)+"x" },
            formula: "(log(x+1)+1)^3.5",
        },
        34: {
            title: "缩放盛宴",
            description: "1225 之后的增幅器和生成器缩放改为从 1400 开始。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e39000":"e4240000") },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
            pseudoReq: '需要: 在 "减产" 障碍中以无超空间建筑达到 e124,000,000 声望。',
            pseudoCan() { return player.p.points.gte("e1.24e8") && inChallenge("h", 42) && player.hs.spentHS.eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        35: {
            title: "珍惜时间",
            description: "TE 的第二个效果的指数提高（0.556 -> 0.565)。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e38000":"e3600000") },
            currencyDisplayName: "TE",
            currencyInternalName: "energy",
            currencyLayer: "t",
            pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
            pseudoReq: "需要: 1e13 紫尘",
            pseudoCan() { return player.n.purpleDust.gte(1e13) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        41: {
            title: "亚时态之幂",
            description: "将子空间底数提高至 1.5 次幂，同时增加超空间能量获取 2,500x。",
            cost: new Decimal(1050),
            pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
            pseudoReq: "需要: 1e60 荣耀 & 1e575 魂力",
            pseudoCan() { return player.hn.points.gte(1e60) && player.ps.power.gte("1e575") },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
    },
    freeExtraTimeCapsules() {
        let free = new Decimal(0);
        if (hasUpgrade("t", 12)) free = free.plus(1);
        if (hasUpgrade("t", 24)) free = free.plus(tmp.t.enEff2);
        if (hasUpgrade("q", 22)) free = free.plus(upgradeEffect("q", 22));
        return free;
    },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "扩展时空胶囊",
            costScalingEnabled() {
                return !(hasUpgrade("t", 31) && player.i.buyables[12].gte(4))
            },
            costExp() {
                let exp = new Decimal(1.2);
                if (hasUpgrade("t", 31) && player.i.buyables[12].gte(4)) exp = exp.sub(.2);
                return exp;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                let cost = x.times(0.4).pow(tmp[this.layer].buyables[this.id].costExp).add(1).times(10)
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) cost = cost.pow(.9);
                return cost.floor()
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let e = tmp.t.freeExtraTimeCapsules;
                let display = (tmp.nerdMode?("价格公式: "+((player[this.layer].buyables[this.id].gte(25)&&data.costScalingEnabled)?"(((x^2)/25":"((x")+"*0.4)^"+format(data.costExp)+"+1)*10"):("价格: " + formatWhole(data.cost) + " 增幅器"))+"\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+(e.gt(0)?(" + "+formatWhole(e)):"")+(inChallenge("h", 31)?("\n剩余购买量: "+String(10-player.h.chall31bought)):"")
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.b.points.gte(tmp[this.layer].buyables[this.id].cost) && (inChallenge("h", 31) ? player.h.chall31bought<10 : true)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.b.points = player.b.points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                if (inChallenge("h", 31)) player.h.chall31bought++;
            },
            buyMax() {
                if (!this.canAfford()) return;
                if (inChallenge("h", 31)) return;
                let b = player.b.points.plus(1);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) b = b.root(.9);
                let tempBuy = b.div(10).sub(1).max(0).root(tmp[this.layer].buyables[this.id].costExp).div(0.4);
                if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
                let target = tempBuy.plus(1).floor();
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            },
            autoed() { return player.t.autoExt && hasMilestone("q", 1) && !inChallenge("h", 31) },
            style: {'height':'222px'},
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 时间胶囊",
            done() { return player.t.best.gte(2) || hasAchievement("a", 71) },
            effectDescription: "重置时保留 增幅器/生成器 里程碑。",
        },
        1: {
            requirementDescription: "3 时间胶囊",
            done() { return player.t.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
            effectDescription: "重置时保留声望升级。",
        },
        2: {
            requirementDescription: "4 时间胶囊",
            done() { return player.t.best.gte(4) || hasAchievement("a", 71) },
            effectDescription: "对任何重置保留增幅器升级。",
        },
        3: {
            requirementDescription: "5 时间胶囊",
            done() { return player.t.best.gte(5) || hasAchievement("a", 71) },
            effectDescription: "解锁自动增幅器。",
            toggles: [["b", "auto"]],
        },
        4: {
            requirementDescription: "8 时间胶囊",
            done() { return player.t.best.gte(8) || hasAchievement("a", 71) },
            effectDescription: "增幅器不再重置任何东西。",
        },
    },
})
/*
                
                
                
                
                
                
eeeeeeeeeeee    
ee::::::::::::ee  
e::::::eeeee:::::ee
e::::::e     e:::::e
e:::::::eeeee::::::e
e:::::::::::::::::e 
e::::::eeeeeeeeeee  
e:::::::e           
e::::::::e          
e::::::::eeeeeeee  
ee:::::::::::::e  
eeeeeeeeeeeeee  
                
                
                
                
                
                
                
*/
addLayer("e", {
    name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    color: "#b82fbd",
    requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
    resource: "增强", // Name of prestige currency
    baseResource: "点数	", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.025:.02) }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("e", 24)) mult = mult.times(upgradeEffect("e", 24));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration() { return (hasMilestone("q", 1)&&player.ma.current!="e")?1:0 },
    update(diff) {
        if (player.e.auto && hasMilestone("q", 1) && !inChallenge("h", 31)) this.buyables[11].buyMax();
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "按 E 进行增强重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    increaseUnlockOrder: ["t", "s"],
    doReset(resettingLayer){ 
        let keep = []
        if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    freeEnh() {
        let enh = new Decimal(0);
        if (hasUpgrade("e", 13)) enh = enh.plus(1);
        if (hasUpgrade("e", 21)) enh = enh.plus(2);
        if (hasUpgrade("e", 23)) enh = enh.plus(upgradeEffect("e", 23));
        if (hasUpgrade("q", 22)) enh = enh.plus(upgradeEffect("q", 22));
        if (hasUpgrade("e", 32) && player.i.buyables[12].gte(3)) enh = enh.plus(upgradeEffect("e", 32));
        return enh;
    },
    layerShown(){return player.b.unlocked&&player.g.unlocked},
    branches: ["b","g"],
    upgrades: {
        rows: 4,
        cols: 4,
        11: {
            title: "第 2 列协同",
            description: "增幅器和生成器互相加成。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e98000":((player.e.unlockOrder>=2)?25:100)) },
            unlocked() { return player.e.unlocked },
            effect() { 
                let exp = 1
                return {g: player.b.points.add(1).log10().pow(exp), b: player.g.points.add(1).log10().pow(exp)} 
            },
            effectDisplay() { return "生成器底数+"+format(tmp.e.upgrades[11].effect.g)+"，增幅器底数+"+format(tmp.e.upgrades[11].effect.b) },
            formula: "log(x+1)",
        },
        12: {
            title: "增强声望",
            description: "总共增强加成声望获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e98000":(player.e.unlockOrder>=2?400:1e3)) },
            unlocked() { return hasUpgrade("e", 11) },
            effect() { 
                let ret = player.e.total.add(1).pow(1.5) 
                ret = softcap("e12", ret);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) ret = ret.pow(1.5);
                return ret
            },
            effectDisplay() { return format(tmp.e.upgrades[12].effect)+"x" },
            formula() { 
                let f = upgradeEffect("e", 12).gte("1e1500")?"(x+1)^0.75*1e750":"(x+1)^1.5" 
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) f = "("+f+")^1.5"
                return f;
            },
        },
        13: {
            title: "增强 Plus",
            description: "获得一个免费的增强子。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e5":2.5e3) },
            unlocked() { return hasUpgrade("e", 11) },
        },
        14: {
            title: "更多添加物",
            description: "对于增幅器和生成器底数的任何增幅器和生成器升级效果 x4。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":3e23) },
            unlocked() { return hasAchievement("a", 33) },
            effect() {
                let e = new Decimal(4)
                if (hasUpgrade("b", 33)) e = e.times(upgradeEffect("b", 33))
                return e;
            },
            effectDisplay() { return format(tmp.e.upgrades[14].effect)+"x" },
            noFormula: true,
        },
        21: {
            title: "增强 Plus Plus",
            description: "获得两个免费的增强子。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":(player.e.unlockOrder>0?1e4:1e9)) },
            unlocked() { return hasUpgrade("e", 13) && ((!player.s.unlocked||(player.s.unlocked&&player.t.unlocked))&&player.t.unlocked) },
        },
        22: {
            title: "增强反转",
            description: "增强以你首先选择增强的方式运行。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":(player.e.unlockOrder>=2?1e3:3e4)) },
            unlocked() { return (player[this.layer].unlockOrder>0||hasUpgrade("e", 22))&&hasUpgrade("e", 12) },
            onPurchase() { player[this.layer].unlockOrder = 0; },
        },
        23: {
            title: "进入 E-空间",
            description: "空间能量提供免费增强子。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":2e20) },
            unlocked() { return hasAchievement("a", 33) },
            effect() {
                let eff = player.s.points.pow(2).div(25);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.times(3.5);
                return eff.floor();
            },
            effectDisplay() { return "+"+formatWhole(tmp.e.upgrades[23].effect) },
            formula() { return "floor(x^2"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"/7.14":"/25")+")" },
        },
        24: {
            title: "野兽般增长",
            description: "增幅器和生成器加成增强获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.011e5":2.5e28) },
            unlocked() { return hasAchievement("a", 33) },
            effect() { return Decimal.pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e2000":1.1, player.b.points.plus(player.g.points).pow(0.9)) },
            effectDisplay() { return format(tmp.e.upgrades[24].effect)+"x" },
            formula() { return (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e2,000":"1.1")+"^((boosters+generators)^0.9)" },
        },
        31: {
            title: "放大",
            description: "增强子的第二个效果同样生效于超级增幅器、超级生成器和子空间底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3450000":"e4125000") },
            pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
            pseudoReq: "需要: 无超级增幅器和超级生成器达到e2,464,000 增强（使用第四行重置）。",
            pseudoCan() { return player.sb.best.eq(0) && player.sg.best.eq(0) && player.e.points.gte("e2.464e6") },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        32: {
            title: "增援",
            description: "最多荣耀提供免费增强子。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e4500000") },
            pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
            pseudoReq: "需要: 30,300 免费增强子。",
            pseudoCan() { return tmp.e.freeEnh.gte(30300) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return softcap("e32", player.hn.best.plus(1).log10().pow(3.25)).floor() },
            effectDisplay() { return "+"+format(tmp[this.layer].upgrades[this.id].effect) },
            formula: "log(x+1)^3.25",
        },
        33: {
            title: "扩增",
            description: "增强子的两个效果指数提高 20%。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e4500000") },
            pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
            pseudoReq: "需要: 60,600 购买的增强子。",
            pseudoCan() { return player.e.buyables[11].gte(60600) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        34: {
            title: "强化",
            description: "增强子价格不再缩放。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3450000":"e4125000") },
            pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
            pseudoReq: "需要: 无诡异层达到 e3,050,000 增强（使用第五行升级）。",
            pseudoCan() { return player.e.points.gte("e3.05e6") && player.q.buyables[11].eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        41: {
            title: "进阶",
            description: "增强加成超空间能量获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e5750000") },
            pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
            pseudoReq: "需要: 无超空间建筑达到 44,900 购买增强子。",
            pseudoCan() { return player.e.buyables[11].gte(44900) && player.hs.spentHS.eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.e.points.plus(1).log10().plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.45:.15) },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
            formula() { return "(log(x+1)+1)^"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"0.45":"0.15") },
        },
    },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "增强子",
            costScalingEnabled() {
                return !(hasUpgrade("e", 34) && player.i.buyables[12].gte(3));
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                let cost = Decimal.pow(2, x.pow(1.5))
                return cost.floor()
            },
            power() {
                let pow = new Decimal(1);
                if (hasUpgrade("e", 33) && player.i.buyables[12].gte(3)) pow = pow.times(1.2);
                return pow;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let power = tmp[this.layer].buyables[this.id].power
                x = x.plus(tmp.e.freeEnh);
                if (!unl(this.layer)) x = new Decimal(0);
                
                let eff = {}
                if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(power.times(1.1)))
                else eff.first = Decimal.pow(1/25, x.times(-1).pow(power.times(1.1)))
                if (hasUpgrade("q", 24)) eff.first = eff.first.pow(7.5);
                eff.first = softcap("enh1", eff.first)
            
                if (x.gte(0)) eff.second = x.pow(power.times(0.8))
                else eff.second = x.times(-1).pow(power.times(0.8)).times(-1)
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff.second = eff.second.pow(50);
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: 2^("+((player[this.layer].buyables[this.id].gte(25)&&data.costScalingEnabled)?"((x^2)/25)":"x")+"^1.5)"):("价格: " + formatWhole(data.cost) + " 增强"))+"\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+(tmp.e.freeEnh.gt(0)?(" + "+formatWhole(tmp.e.freeEnh)):"") + "\n\
               "+(tmp.nerdMode?(" 公式 1: 25^(x^"+format(data.power.times(1.1))+")\n\ 公式 2: x^"+format(data.power.times(0.8))):(" 增幅声望获取 " + format(data.effect.first) + "x 并提高增幅器和生成器的底数 " + format(data.effect.second)))+(inChallenge("h", 31)?("\n剩余购买量: "+String(10-player.h.chall31bought)):"")
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && (inChallenge("h", 31) ? player.h.chall31bought<10 : true)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                if (inChallenge("h", 31)) player.h.chall31bought++;
            },
            buyMax() {
                if (!this.canAfford()) return;
                if (inChallenge("h", 31)) return;
                let tempBuy = player[this.layer].points.max(1).log2().root(1.5)
                if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
                let target = tempBuy.plus(1).floor();
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            },
            autoed() { return player.e.auto && hasMilestone("q", 1) && !inChallenge("h", 31) },
            style: {'height':'222px'},
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 增强",
            done() { return player.e.best.gte(2) || hasAchievement("a", 71) },
            effectDescription: "重置时保留增幅器和生成器的里程碑。",
        },
        1: {
            requirementDescription: "5 增强",
            done() { return player.e.best.gte(5) || hasAchievement("a", 41) || hasAchievement("a", 71) },
            effectDescription: "重置时保留声望升级。",
        },
        2: {
            requirementDescription: "25 增强",
            done() { return player.e.best.gte(25) || hasAchievement("a", 71) },
            effectDescription: "重置时保留增幅器和生成器的升级。",
        },
    },
})
/*
             
             
             
             
             
             
ssssssssss   
ss::::::::::s  
ss:::::::::::::s 
s::::::ssss:::::s
s:::::s  ssssss 
s::::::s      
  s::::::s   
ssssss   s:::::s 
s:::::ssss::::::s
s::::::::::::::s 
s:::::::::::ss  
sssssssssss    
             
             
             
             
             
             
             
*/
addLayer("s", {
    name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        spent: new Decimal(0),
        first: 0,
        auto: false,
        autoBld: false,
        pseudoUpgs: [],
    }},
    color: "#dfdfdf",
    requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
    resource: "空间能量", // Name of prestige currency
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1.85) }, // Prestige currency exponent
    base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?10:(hasUpgrade("ss", 11)?1e10:1e15)) },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "按 S 进行空间重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="s" },
    increaseUnlockOrder: ["t", "e"],
    doReset(resettingLayer){ 
        let keep = []
        if (hasMilestone("q", 0)) keep.push("milestones")
        if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
        if (hasMilestone("q", 2) && (resettingLayer=="q"||resettingLayer=="h")) {
            keep.push("buyables");
            keep.push("spent");
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    space() {
        let space = player.s.best.pow(1.1).times(3);
        if (hasUpgrade("s", 13)) space = space.plus(2);
        if (hasAchievement("a", 53)) space = space.plus(2);
        if (player.ss.unlocked) space = space.plus(tmp.ss.eff1);
        
        if (inChallenge("h", 21)) space = space.div(10);
        return space.floor().sub(player.s.spent).max(0);
    },
    buildingBaseRoot() {
        let root = new Decimal(1);
        if (hasUpgrade("s", 34) && player.i.buyables[12].gte(5)) root = root.times(upgradeEffect("s", 34));
        return root;
    },
    buildingBaseCosts() { 
        let rt = tmp.s.buildingBaseRoot;
        return {
            11: new Decimal(1e3).root(rt),
            12: new Decimal(1e10).root(rt),
            13: new Decimal(1e25).root(rt),
            14: new Decimal(1e48).root(rt),
            15: new Decimal(1e250).root(rt),
            16: new Decimal("e3e7").root(rt),
            17: new Decimal("e4.5e7").root(rt),
            18: new Decimal("e6e7").root(rt),
            19: new Decimal("e3.5e8").root(rt),
            20: new Decimal("e1.5e9").root(rt),
    }},
    tabFormat: ["main-display",
        "prestige-button",
        "blank",
        ["display-text",
            function() {return '你最多拥有 ' + formatWhole(player.s.best) + ' 空间能量'},
                {}],
        "blank",
        "milestones", "blank", 
        ["display-text",
            function() {return '你有 ' + format(player.g.power) + ' GP'},
                {}],
        ["display-text",
            function() {return '你的空间能量为你提供了 ' + formatWhole(tmp.s.space) + ' 空间'},
                {}],
        ["display-text",
            function() {return tmp.s.buildingPower.eq(1)?"":("建筑增益: "+format(tmp.s.buildingPower.times(100))+"%")},
                {}],
        "blank",
        "buyables", "blank", "upgrades"],
    layerShown(){return player.g.unlocked},
    branches: ["g"],
    canBuyMax() { return hasMilestone("q", 1) },
    freeSpaceBuildings() {
        let x = new Decimal(0);
        if (hasUpgrade("s", 11)) x = x.plus(1);
        if (hasUpgrade("s", 22)) x = x.plus(upgradeEffect("s", 22));
        if (hasUpgrade("q", 22)) x = x.plus(upgradeEffect("q", 22));
        if (hasUpgrade("ss", 31)) x = x.plus(upgradeEffect("ss", 31));
        return x;
    },
    freeSpaceBuildings1to4() {
        let x = new Decimal(0);
        if (player.s.unlocked) x = x.plus(buyableEffect("s", 15));
        return x;
    },
    totalBuildingLevels() {
        let len = Object.keys(player.s.buyables).length
        if (len==0) return new Decimal(0);
        if (len==1) return Object.values(player.s.buyables)[0].plus(tmp.s.freeSpaceBuildings).plus(toNumber(Object.keys(player.s.buyables))<15?tmp.s.freeSpaceBuildings1to4:0)
        let l = Object.values(player.s.buyables).reduce((a,c,i) => Decimal.add(a, c).plus(toNumber(Object.keys(player.s.buyables)[i])<15?tmp.s.freeSpaceBuildings1to4:0)).plus(tmp.s.freeSpaceBuildings.times(len));
        return l;
    },
    manualBuildingLevels() {
        let len = Object.keys(player.s.buyables).length
        if (len==0) return new Decimal(0);
        if (len==1) return Object.values(player.s.buyables)[0]
        let l = Object.values(player.s.buyables).reduce((a,c) => Decimal.add(a, c));
        return l;
    },
    buildingPower() {
        if (!unl(this.layer)) return new Decimal(0);
        let pow = new Decimal(1);
        if (hasUpgrade("s", 21)) pow = pow.plus(0.08);
        if (hasChallenge("h", 21)) pow = pow.plus(challengeEffect("h", 21).div(100));
        if (player.ss.unlocked) pow = pow.plus(tmp.ss.eff2);
        if (hasUpgrade("ss", 42)) pow = pow.plus(1);
        if (hasUpgrade("ba", 12)) pow = pow.plus(upgradeEffect("ba", 12));
        if (player.n.buyables[11].gte(2)) pow = pow.plus(buyableEffect("o", 23));
        if (hasAchievement("a", 103)) pow = pow.plus(.1);
        if (inChallenge("h", 21)) pow = pow.sub(0.9);
        if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
        
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.div(5);
        return pow;
    },
    autoPrestige() { return player.s.auto&&hasMilestone("q", 3)&&player.ma.current!="s" },
    update(diff) {
        if (player.s.autoBld && hasMilestone("q", 7)) for (let i=(5+player.i.buyables[11].toNumber());i>=1;i--) layers.s.buyables[10+i].buyMax();
    },
    upgrades: {
        rows: 3,
        cols: 5,
        11: {
            title: "Space X",
            description: "为所有建筑提供一个免费等级。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?758:2) },
            unlocked() { return player[this.layer].unlocked }
        },
        12: {
            title: "生成器生成器",
            description: "GP 加成 GP 生成。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?758:3) },
            unlocked() { return hasUpgrade("s", 11) },
            effect() { return player.g.power.add(1).log10().add(1) },
            effectDisplay() { return format(tmp.s.upgrades[12].effect)+"x" },
            formula: "log(x+1)+1",
        },
        13: {
            title: "运走",
            description: "建筑等级加成 GP 获取，你获得 2 个额外的空间。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e48900":([1e37,1e59,1e94][player[this.layer].unlockOrder||0])) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            unlocked() { return hasUpgrade("s", 11) },
            effect() { return softcap("s13", Decimal.pow(20, tmp.s.totalBuildingLevels)) },
            effectDisplay() { return format(tmp.s.upgrades[13].effect)+"x" },
            formula: "20^x",
        },
        14: {
            title: "进入重复",
            description: "解锁 <b>第四建筑</b>.",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:4) },
            unlocked() { return hasUpgrade("s", 12)||hasUpgrade("s", 13) }
        },
        15: {
            title: "四边形",
            description: "<b>第四建筑</b> 成本开立方根，3x 增强，并增益 <b>BP 连击</b> （效果是 2.7 次方根）。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55000":([1e65,(player.e.unlocked?1e94:1e88),1e129][player[this.layer].unlockOrder||0])) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            unlocked() { return hasUpgrade("s", 14) },
        },
        21: {
            title: "宽广",
            description: "所有建筑效果提高 8%。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:13) },
            unlocked() { return hasAchievement("a", 33) },
        },
        22: {
            title: "时空异常",
            description: "非扩展时空胶囊提供免费建筑。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55225":2.5e207) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            unlocked() { return hasAchievement("a", 33) },
            effect() { return player.t.points.cbrt().floor() },
            effectDisplay() { return "+"+formatWhole(tmp.s.upgrades[22].effect) },
            formula: "floor(cbrt(x))",
        },
        23: {
            title: "反转空间",
            description() { return (player.e.unlocked&&player.t.unlocked&&(player.s.unlockOrder||0)==0)?"所有建筑价格除以 1e20。":("空间以你首先选择空间的方式运行"+(player.t.unlocked?"，并且所有建筑价格除以 1e20。":"。")) },
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55300":(player.s.unlockOrder>=2?1e141:(player.e.unlocked?1e105:1e95))) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            unlocked() { return ((player.e.unlocked&&player.t.unlocked&&(player.s.unlockOrder||0)==0)||player[this.layer].unlockOrder>0||hasUpgrade("s", 23))&&hasUpgrade("s", 13) },
            onPurchase() { player[this.layer].unlockOrder = 0; },
        },
        24: {
            title: "想要更多？",
            description: "建筑总数加成四个 <b>给我更多</b> 效果。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55555":1e177) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            unlocked() { return hasAchievement("a", 33) },
            effect() {
                return tmp.s.totalBuildingLevels.sqrt().div(5).plus(1);
            },
            effectDisplay() { return format(tmp.s.upgrades[24].effect.sub(1).times(100))+"% 加成" },
            formula: "sqrt(x)/5+1",
        },
        25: {
            title: "另一个？",
            description: "解锁 第五建筑",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e8e5":1e244) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            unlocked() { return hasAchievement("a", 33) },
        },
        31: {
            title: "有用维度",
            description: "前四个建筑的价格指数降低 0.04*(5-n)，n 是这个建筑的编号。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?815:1225) },
            pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
            pseudoReq: "需要: 1,200% 建筑增益",
            pseudoCan() { return tmp.s.buildingPower.gte(12) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            style: {"font-size": "9px"},
        },
        32: {
            title: "庞加莱循环",
            description: "每个建筑的购买等级加成至前一个建筑的额外等级。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e9e5":"e2.25e8") },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
            pseudoReq: "需要: e1e9 点数",
            pseudoCan() { return player.points.gte("e1e9") },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        33: {
            title: "非连续谱",
            description: "<b>连续维度</b> 增幅星云和超空间能量获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e6":"e2.75e8") },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
            pseudoReq: "需要: 至少 13 个空间升级，39 个成就，获得升级 <b>连续维度</b>。",
            pseudoCan() { return player.a.achievements.length>=39 && player.s.upgrades.length>=13 && hasUpgrade("s", 35) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return upgradeEffect("s", 35).sqrt() },
            effectDisplay() { return format(upgradeEffect("s", 33))+"x" },
            formula: "sqrt(x)",
            style: {"font-size": "8px"},
        },
        34: {
            title: "能量还原",
            description: "空间能量降低前五个建筑的价格底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e9.01e5":"e1.95e8") },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
            pseudoReq: "需要: 无购买建筑达到 e160,000,000 GP（使用建筑重置）。",
            pseudoCan() { return player.g.power.gte("e1.6e8") && tmp.s.manualBuildingLevels.eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.s.points.plus(1).log10().plus(1).log10().plus(1) },
            effectDisplay() { return "开 "+format(tmp.s.upgrades[this.id].effect)+" 次根" },
            formula: "log(log(x+1)+1)+1",
            style: {"font-size": "9px"},
        },
        35: {
            title: "连续维度",
            description: "未使用的空间增幅荣耀获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?825:1255) },
            pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
            pseudoReq: "需要: 9e16 空间",
            pseudoCan() { return tmp.s.space.gte(9e16) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return tmp.s.space.plus(1) },
            effectDisplay() { return format(tmp.s.upgrades[this.id].effect)+"x" },
            formula: "x+1",
        },
    },
    divBuildCosts() {
        let div = new Decimal(1);
        if (hasUpgrade("s", 23) && player.t.unlocked) div = div.times(1e20);
        if (player.ss.unlocked) div = div.times(tmp.ss.eff3);
        return div;
    },
    buildScalePower() {
        let scale = new Decimal(1);
        if (hasUpgrade("p", 42)) scale = scale.times(.5);
        if (hasUpgrade("hn", 42)) scale = scale.times(.8);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) scale = scale.div(3.85);
        if (tmp.m.buyables[14].unlocked) scale = scale.times(Decimal.sub(1, tmp.m.buyables[14].effect));
        return scale;
    },
    buyables: {
        rows: 1,
        cols: 10,
        showRespec() { return player.s.unlocked },
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            player[this.layer].spent = new Decimal(0);
            resetBuyables(this.layer)
            doReset(this.layer, true) // Force a reset
        },
        respecText: "重置建筑", // Text on Respec button, optional
        11: {
            title: "第一建筑",
            costExp() { 
                let exp = 1.35;
                if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
                return exp;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                if (x.eq(0)) return new Decimal(0);
                return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[11+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = Decimal.pow(x.plus(1).plus(tmp.s.freeSpaceBuildings).times(tmp.s.buildingPower), player.s.points.sqrt()).times(x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).max(1).times(4)).max(1);
                if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 21));
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x"+("*"+format(tmp.s.buildScalePower))+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
               "+(tmp.nerdMode?("公式: 等级^sqrt(空间能量)*等级*4"):(" 空间能量加成点数和声望获取 " + format(data.effect) +"x"))
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        12: {
            title: "第二建筑",
            costExp() { 
                let exp = 1.35;
                if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
                return exp;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[12+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).sqrt();
                if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 22));
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: sqrt(等级)"):("加成增幅器和生成器底数 +" + format(data.effect)))
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        13: {
            title: "第三建筑",
            costExp() { 
                let exp = 1.35;
                if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
                return exp;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[13+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = Decimal.pow(1e18, x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).pow(0.9))
                if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 23));
                eff = softcap("spaceBuilding3", eff);
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.times(tmp.s.buildingPower).gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: "+(data.effect.gte("e3e9")?"10^((等级^0.3)*5.45e6)":"1e18^(等级^0.9)")):("将增幅器和生成器的价格除以 " + format(data.effect)))
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        14: {
            title: "第四建筑",
            costExp() { 
                let exp = 1.35;
                if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
                return exp;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base);
                if (hasUpgrade("s", 15)) cost = cost.root(3);
                return cost.div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[14+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).times((hasUpgrade("s", 15))?3:1).add(1).pow(1.25);
                ret = softcap("spaceBuilding4", ret);
                if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 24));
                return ret;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let extForm = hasUpgrade("s", 15)?3:1
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+(hasUpgrade("s", 15)?"^(1/3)":"")+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: "+(data.effect.gte(1e6)?("log(等级"+(extForm==1?"":"*3")+"+1)*2.08e5"):("(等级"+(extForm==1?"":"*3")+"+1)^1.25"))):("<b>一折</b> 效果提升至 " + format(data.effect) + " 次幂"))
            },
            unlocked() { return player[this.layer].unlocked&&hasUpgrade("s", 14) }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).pow(hasUpgrade("s", 15)?3:1).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        15: {
            title: "第五建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(1.35)).times(base);
                return cost.div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = tmp.s.freeSpaceBuildings;
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[15+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(2);
                if (hasUpgrade("q", 32)) ret = ret.times(2);
                if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 25));
                return ret.floor();
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^1.35)*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: 等级"+(hasUpgrade("q", 32)?"":"/2")):("为之前的建筑增加 " + formatWhole(data.effect)+" 等级。"))
            },
            unlocked() { return player[this.layer].unlocked&&hasUpgrade("s", 25) }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(1.35).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        16: {
            title: "第六建筑",
            costExp() { return 1.35+(this.id-15)*0.3 },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
                return cost.div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = new Decimal(0);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[16+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).plus(1).sqrt();
                if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 26));
                return ret.floor();
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: sqrt(level+1)"):("增幅恶魂获取 " + format(data.effect)+"x。"))
            },
            unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(1) }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        17: {
            title: "第七建筑",
            costExp() { return 1.35+(this.id-15)*0.3 },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
                return cost.div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = new Decimal(0);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[17+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let ret = Decimal.pow("1e20000", x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).pow(1.2));
                if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 27));
                return ret.floor();
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: 1e20,000^(level^1.2)"):("将幽魂的价格除以 " + format(data.effect)+"。"))
            },
            unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(2) }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        18: {
            title: "第八建筑",
            costExp() { return 1.35+(this.id-15)*0.3 },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
                return cost.div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = new Decimal(0);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[18+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(1.5)
                if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 28));
                return ret;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: level/1.5"):("获得 " + format(data.effect)+" 个免费诡异层。"))
            },
            unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(3) }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        19: {
            title: "第九建筑",
            costExp() { return 1.35+(this.id-15)*0.3 },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
                return cost.div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = new Decimal(0);
                if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[19+1]||0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(1e3).plus(1)
                if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 29));
                return softcap("spaceBuilding9_2", softcap("spaceBuilding9", ret));
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("格式: level/1,000+1"):("超空间能量获得指数增幅 " + format(data.effect)+"x。"))
            },
            unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(4) }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
        20: {
            title: "第十建筑",
            costExp() { return 1.35+(this.id-15)*0.3 },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let base = tmp.s.buildingBaseCosts[this.id];
                let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
                return cost.div(tmp.s.divBuildCosts);
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(250)
                if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 30));
                return ret;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                "+(tmp.nerdMode?("公式: (level/2.5)%"):("超建筑增益加成 " + format(data.effect.times(100))+"%。"))
            },
            unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(5) }, 
            canAfford() {
                return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.g.power = player.g.power.sub(cost)
                player.s.spent = player.s.spent.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
            buyMax() {
                if (!this.canAfford() || !this.unlocked()) return;
                let target = this.target();
                player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            }, 
            style: {'height':'100px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (!hasMilestone("q", 5) || amount.lt(1)) return;
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
            },
            canSellOne() { return hasMilestone("q", 5) },
            autoed() { return player.s.autoBld && hasMilestone("q", 7) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 空间能量",
            done() { return player.s.best.gte(2) || hasAchievement("a", 71) },
            effectDescription: "重置时保留增幅器和生成器里程碑。",
        },
        1: {
            requirementDescription: "3 空间能量",
            done() { return player.s.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
            effectDescription: "重置时保留声望升级。",
        },
        2: {
            requirementDescription: "4 空间能量",
            done() { return player.s.best.gte(4) || hasAchievement("a", 71) },
            effectDescription: "对任何重置保留生成器升级。",
        },
        3: {
            requirementDescription: "5 空间能量",
            done() { return player.s.best.gte(5) || hasAchievement("a", 71) },
            effectDescription: "解锁自动生成器。",
            toggles: [["g", "auto"]],
        },
        4: {
            requirementDescription: "8 空间能量",
            done() { return player.s.best.gte(8) || hasAchievement("a", 71) },
            effectDescription: "生成器不再重置任何东西。",
        },
    },
})
/*
                                 
             bbbbbbbb            
             b::::::b            
             b::::::b            
             b::::::b            
              b:::::b            
ssssssssss    b:::::bbbbbbbbb    
ss::::::::::s   b::::::::::::::bb  
ss:::::::::::::s  b::::::::::::::::b 
s::::::ssss:::::s b:::::bbbbb:::::::b
s:::::s  ssssss  b:::::b    b::::::b
s::::::s       b:::::b     b:::::b
  s::::::s    b:::::b     b:::::b
ssssss   s:::::s  b:::::b     b:::::b
s:::::ssss::::::s b:::::bbbbbb::::::b
s::::::::::::::s  b::::::::::::::::b 
s:::::::::::ss   b:::::::::::::::b  
sssssssssss     bbbbbbbbbbbbbbbb   
                                 
                                 
                                 
                                 
                                 
                                 
                                 
*/
addLayer("sb", {
    name: "super boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#504899",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "超级增幅器", // Name of prestige currency
    baseResource: "增幅器", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    roundUpCost: true,
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["b"],
    exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.075:1.25 }, // Prestige currency exponent
    base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.025:1.05 },
    gainMult() { 
        let mult = new Decimal(1);
        if (hasUpgrade("ss", 21)) mult = mult.div(1.2);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.div(4/3);
        return mult;
    },
    autoPrestige() { return player.sb.auto && hasMilestone("q", 4) && player.ma.current!="sb" },
    canBuyMax() { return hasMilestone("q", 7) },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "B", description: "按 Shift+B 进行超级增幅器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.t.unlocked&&player.e.unlocked&&player.s.unlocked},
    automate() {},
    resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="sb" },
    effectBase() {
        let base = new Decimal(5);
        if (hasChallenge("h", 12)) base = base.plus(.25);
        if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
        
        if (player.o.unlocked) base = base.times(buyableEffect("o", 12));
        if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('b'):false) && hasUpgrade("b", 12)) base = base.times(upgradeEffect("b", 12).max(1));
        if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('b'):false) && hasUpgrade("b", 13)) base = base.times(upgradeEffect("b", 13).max(1));
        base = base.times(tmp.n.dustEffs.blue);
        if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) && hasChallenge("h", 12)) base = base.times(player.hs.points.plus(1));
        if (player.en.unlocked) base = base.pow(tmp.en.swEff);
        if (player.c.unlocked && tmp.c) base = base.pow(tmp.c.eff5);
        return base
    },
    effect() {
        if (!unl(this.layer)) return new Decimal(1);
        return Decimal.pow(this.effectBase(), player.sb.points).max(0);
    },
    effectDescription() {
        return "增幅增幅器底数 "+format(tmp.sb.effect)+"x"+(tmp.nerdMode?("\n (每个 "+format(tmp.sb.effectBase)+"x)"):"")
    },
    doReset(resettingLayer){ 
        let keep = []
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    spectralEach() {
        if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) return new Decimal(0);
        return player.sb.points;
    },
    spectralTotal() {
        return tmp.sb.spectralEach.times(player.sb.points);
    },
    tabFormat: ["main-display",
        "prestige-button",
        "blank",
        ["display-text", function() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sb"):false)?("你的超级增幅器为你提供了 <h3 style='color: #8882ba; text-shadow: #7f78c4 0px 0px 10px;'>"+formatWhole(tmp.sb.spectralTotal)+"</h3> 虚增幅器"+(tmp.nerdMode?(" (每个 "+formatWhole(tmp.sb.spectralEach)+")"):"")+"，计算入增幅器效果，但不计入增幅器相关的升级效果。"):"" }],
    ],
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        first: 0,
        auto: false,
    }},
})
/*
                                 
                                 
                                 
                                 
                                 
                                 
ssssssssss      ggggggggg   ggggg
ss::::::::::s    g:::::::::ggg::::g
ss:::::::::::::s  g:::::::::::::::::g
s::::::ssss:::::sg::::::ggggg::::::gg
s:::::s  ssssss g:::::g     g:::::g 
s::::::s      g:::::g     g:::::g 
s::::::s   g:::::g     g:::::g 
ssssss   s:::::s g::::::g    g:::::g 
s:::::ssss::::::sg:::::::ggggg:::::g 
s::::::::::::::s  g::::::::::::::::g 
s:::::::::::ss    gg::::::::::::::g 
sssssssssss        gggggggg::::::g 
                         g:::::g 
             gggggg      g:::::g 
             g:::::gg   gg:::::g 
              g::::::ggg:::::::g 
               gg:::::::::::::g  
                 ggg::::::ggg    
                    gggggg       
*/
addLayer("sg", {
    name: "super generators", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SG", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#248239",
    requires: new Decimal(200), // Can be a function that takes requirement increases into account
    resource: "超级生成器", // Name of prestige currency
    baseResource: "生成器", // Name of resource prestige is based on
    baseAmount() {return player.g.points}, // Get the current amount of baseResource
    roundUpCost: true,
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["g"],
    exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.225:1.25 }, // Prestige currency exponent
    base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.04:1.05 },
    gainMult() { 
        let mult = new Decimal(1);
        if (hasUpgrade("ss", 21)) mult = mult.div(1.2);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.div(1.1);
        return mult;
    },
    autoPrestige() { return player.sg.auto && hasMilestone("q", 6) && player.ma.current!="sg" },
    update(diff) {
        player.sg.power = player.sg.power.plus(tmp.sg.effect.times(diff));
        player.sg.time = player.sg.time.plus(diff);
    },
    canBuyMax() { return hasMilestone("q", 7) },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "G", description: "按 Shift+G 进行超级生成器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("q", 33)||player.ma.selectionActive)&&player.q.unlocked},
    resetsNothing() { return hasMilestone("q", 6) && player.ma.current!="sg" },
    effectBase() {
        let base = new Decimal(5);
        if (hasUpgrade("ss", 32)) base = base.plus(upgradeEffect("ss", 32));
        if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
        
        if (hasUpgrade("g", 31) && player.i.buyables[12].gte(2)) base = base.times(upgradeEffect("g", 31));
        if (hasUpgrade("ba", 32)) base = base.times(upgradeEffect("ba", 32));
        if (hasUpgrade("hn", 52)) base = base.times(buyableEffect("o", 12));
        if (player.mc.unlocked) base = base.times(clickableEffect("mc", 21));
        if (tmp.m.buyables[16].unlocked) base = base.times(buyableEffect("m", 16));
        if (player.ne.unlocked) base = base.times(tmp.ne.thoughtEff2);
        return base;
    },
    effect() {
        if (!unl(this.layer)) return new Decimal(0);
        let eff = Decimal.pow(this.effectBase(), player.sg.points).sub(1).max(0);
        if (tmp.h.challenges[31].unlocked) eff = eff.times(challengeEffect("h", 31));
        return eff;
    },
    effectDescription() {
        return "生成 "+format(tmp.sg.effect)+" 超级 GP/sec"+(tmp.nerdMode?("\n (每个 "+format(tmp.sg.effectBase)+"x)"):"")
    },
    enEff() {
        if (!unl(this.layer)) return new Decimal(1);
        let eff = player.sg.power.plus(1).sqrt();
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false) eff = eff.pow(2);
        return eff;
    },
    doReset(resettingLayer){ 
        let keep = []
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    spectralTotal() {
        if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false)) return new Decimal(0);
        return player.sg.time.plus(1).log10().times(player.sg.points.pow(2)).pow(.95).times(1.2).floor();
    },
    tabFormat: ["main-display",
        "prestige-button",
        "blank",
        ["display-text",
            function() {return '你有 ' + format(player.sg.power) + ' 超级 GP，增幅生成器底数 '+format(tmp.sg.enEff)+'x'+(tmp.nerdMode?(" (sqrt(x+1))"):"")},
                {}],
        "blank",
        ["display-text", function() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false)?("你的超级生成器为你提供了 <h3 style='color: #84b88a; text-shadow: #78c48f 0px 0px 10px;'>"+formatWhole(tmp.sg.spectralTotal)+"</h3> 虚生成器"+(tmp.nerdMode?(" (((log(timeSinceRow4Reset+1)*(SG^2))^0.95)*1.2)"):"")+"，计算入生成器效果，但不计入生成器相关的升级效果。"):"" }],
    ],
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        power: new Decimal(0),
        first: 0,
        auto: false,
        time: new Decimal(0),
    }},
})