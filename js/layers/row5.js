
/*
                                      
                                      
hhhhhhh                               
h:::::h                               
h:::::h                               
h:::::h                               
 h::::h hhhhh       nnnn  nnnnnnnn    
 h::::hh:::::hhh    n:::nn::::::::nn  
 h::::::::::::::hh  n::::::::::::::nn 
 h:::::::hhh::::::h nn:::::::::::::::n
 h::::::h   h::::::h  n:::::nnnn:::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 hhhhhhh     hhhhhhh  nnnnnn    nnnnnn
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("hn", {
    name: "honour", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HN", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
    }},
    color: "#ffbf00",
    nodeStyle() {return {
        "background-color": (((player.hn.unlocked||canReset("hn"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#ffbf00":"#bf8f8f"),
    }},
    resource: "荣耀", // Name of prestige currency
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    baseResource: "魔法和平衡",
    baseAmount() { return new Decimal(0) },
    req: {m: new Decimal(1e150), ba: new Decimal(1e179)},
    requires() { return this.req },
    exp() { return {m: new Decimal(0.025), ba: new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.05:0.02)} },
    exponent() { return tmp[this.layer].exp },
    gainMult() {
        let mult = new Decimal(1);
        if (player.n.buyables[11].gte(1)) mult = mult.times(buyableEffect("o", 22));
        if (hasAchievement("a", 91)) mult = mult.times(1.1);
        if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
        if (hasUpgrade("s", 35) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 35));
        if (player.ma.unlocked) mult = mult.times(tmp.ma.effect);
        return mult;
    },
    getResetGain() {
        let gain = player.m.points.div(tmp.hn.req.m).pow(tmp.hn.exp.m).times(player.ba.points.div(tmp.hn.req.ba).pow(tmp.hn.exp.ba));
        if (gain.gte(1e5)) gain = softcap("HnG", gain);
        return gain.times(tmp.hn.gainMult).floor();
    },
    resetGain() { return this.getResetGain() },
    getNextAt() {
        let gain = tmp.hn.getResetGain.div(tmp.hn.gainMult)
        gain = reverse_softcap("HnG", gain).plus(1);
        let next = {m: gain.sqrt().root(tmp.hn.exp.m).times(tmp.hn.req.m), ba: gain.sqrt().root(tmp.hn.exp.ba).times(tmp.hn.req.ba)};
        return next;
    },
    passiveGeneration() { return (hasMilestone("ma", 1)&&player.ma.current!="hn")?1:0 },
    canReset() {
        return player.m.points.gte(tmp.hn.req.m) && player.ba.points.gte(tmp.hn.req.ba) && tmp.hn.getResetGain.gt(0) 
    },
    dispGainFormula() {
        let vars = ["m", "ba"]
        let txt = "";
        for (let i=0;i<vars.length;i++) {
            let layer = vars[i];
            let start = tmp.hn.req[layer];
            let exp = tmp.hn.exp[layer];
            if (i>0) txt += ", "
            txt += layer.toUpperCase()+": (x / "+format(start)+")^"+format(exp)
        }
        return txt;
    },
    prestigeButtonText() {
        if (tmp.nerdMode) return "获取公式: "+tmp.hn.dispGainFormula;
        else return `${ player.hn.points.lt(1e3) ? (tmp.hn.resetDescription !== undefined ? tmp.hn.resetDescription : "重置获得 ") : ""}+<b>${formatWhole(tmp.hn.getResetGain)}</b> ${tmp.hn.resource} ${tmp.hn.resetGain.lt(100) && player.hn.points.lt(1e3) ? `<br><br>下一个需要 ${ ('魔法: '+format(tmp.hn.nextAt.m)+'，平衡: '+format(tmp.hn.nextAt.ba))}` : ""}`
    },
    prestigeNotify() {
        if (!canReset("hn")) return false;
        if (tmp.hn.getResetGain.gte(player.hn.points.times(0.1).max(1)) && !tmp.hn.passiveGeneration) return true;
        else return false;
    },
    tooltip() { return formatWhole(player.hn.points)+" 荣耀" },
    tooltipLocked() { return "达到 "+formatWhole(tmp.hn.req.m)+" 魔法 & "+formatWhole(tmp.hn.req.ba)+" 平衡解锁 (你有 "+formatWhole(player.m.points)+" 魔法 & "+formatWhole(player.ba.points)+" 平衡)" },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "H", description: "按 Shift+H 进行荣耀重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        if (hasMilestone("ma", 1)) {
            keep.push("milestones")
            keep.push("upgrades")
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return player.m.unlocked&&player.ba.unlocked },
    branches: ["m","ba"],
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { return player.hn.unlocked?("你有 "+formatWhole(player.p.points)+" 声望"):"" }],
        "blank",
        "milestones",
        "blank",
        "upgrades"
    ],
    milestones: {
        0: {
            requirementDescription: "1 总荣耀",
            done() { return player.hn.total.gte(1) },
            effectDescription: "永远保留所有魔法和平衡里程碑。",
        },
        1: {
            requirementDescription: "2 总荣耀",
            done() { return player.hn.total.gte(2) },
            effectDescription: "每秒获得 100% 魔法和平衡。",
        },
        2: {
            requirementDescription: "3 总荣耀",
            done() { return player.hn.total.gte(3) },
            effectDescription: "平衡滑条以认为其同时处在两边的方式运作，解锁自动施法。",
            toggles: [["m", "auto"]],
        },
        3: {
            requirementDescription: "4 总荣耀",
            done() { return player.hn.total.gte(4) },
            effectDescription: "解锁最大购买子空间能量，对所有重置保留平衡升级。",
        },
        4: {
            requirementDescription: "5 总荣耀",
            done() { return player.hn.total.gte(5) },
            effectDescription: "购买幽灵不再消耗恶魂和幽魂，解锁自动幽魂。",
            toggles: [["ps", "auto"]],
        },
        5: {
            requirementDescription: "6 总荣耀",
            done() { return player.hn.total.gte(6) },
            effectDescription: "解锁自动幽灵。",
            toggles: [["ps", "autoW"]],
        },
        6: {
            requirementDescription: "10 总荣耀",
            done() { return player.hn.total.gte(10) },
            effectDescription: "幽魂不再重置任何东西。",
        },
        7: {
            requirementDescription: "100,000 总荣耀 & e11,000,000 声望",
            unlocked() { return hasMilestone("hn", 6) },
            done() { return player.hn.total.gte(1e5) && player.p.points.gte("e11000000") },
            effectDescription: "解锁幽魂增幅器和更多荣耀升级。",
        },
        8: {
            requirementDescription: "1e30 总荣耀",
            unlocked() { return hasMilestone("hn", 7) && hasUpgrade("hn", 15) },
            done() { return player.hn.total.gte(1e30) },
            effectDescription: "你可以同时激活 3 个二级星尘。",
        },
        9: {
            requirementDescription: "1e300 总荣耀",
            unlocked() { return hasMilestone("hn", 8) },
            done() { return player.hn.total.gte(1e300) },
            effectDescription: "允许最大购买幽魂。",
        },
    },
    upgrades: {
        rows: 5,
        cols: 5,
        11: {
            title: "重新开始",
            description: "解锁新的声望升级",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e1000":4) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"ee10":"1e4000000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 11) },
        },
        12: {
            title: "荣耀增益",
            description: "总荣耀推迟 <b>声望增益</b> 软上限。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e6800":1) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e4.175e10":"1e1000000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 12) },
            effect() { return softcap("hn12", player.hn.total.plus(1).pow(1e4)) },
            effectDisplay() { return format(tmp.hn.upgrades[12].effect)+"x 推迟" },
            formula: "(x+1)^1e4",
        },
        13: {
            title: "自自协同",
            description: "<b>自协同</b> 效果提高。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e7000":2) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e4.5e10":"1e3900000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 13) },
            effect() { return tmp.p.upgrades[13].effect.max(1).log10().plus(1).log10().times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?200:40).plus(1) },
            effectDisplay() { return "^"+format(tmp.hn.upgrades[13].effect) },
            formula: "log(log(x+1)+1)*40+1",
        },
        14: {
            title: "不冷静",
            description: "<b>声望强度</b> 效果增强 5%。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e7010":1e5) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e4.55e10":"1e11000000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 14) && hasMilestone("hn", 7) },
        },
        15: {
            title: "光速黑洞",
            description: "你现在可以同时激活两个二级星尘。",
            multiRes: [
                {
                    cost: new Decimal(3.5e10),
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost: new Decimal("1e30000000"),
                },
            ],
            unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
        },
        21: {
            title: "点数效率",
            description: "妖术减弱 <b>声望增益</b> 软上限。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e7025":25) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e4.58e10":"1e4700000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 21) },
            cap() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?.92:.9) },
            effect() { return player.m.hexes.plus(1).log10().plus(1).log10().times(0.15).min(tmp.hn.upgrades[this.id].cap) },
            effectDisplay() { return format(tmp.hn.upgrades[21].effect.times(100))+"% 变弱"+(tmp.hn.upgrades[21].effect.gte(tmp.hn.upgrades[this.id].cap)?" (已满)":"") },
            formula() { return "log(log(x+1)+1)*15, 最多 "+format(tmp.hn.upgrades[this.id].cap.times(100))+"%" },
        },
        22: {
            title: "超级升级",
            description: "幽灵增强 <b>力量升级</b> 效果。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e12640":4) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6e11":"1e4000000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 22) },
            effect() { return Decimal.pow(10, player.ps.souls.plus(1).log10().plus(1).log10().sqrt().times(5)).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?3:1) },
            effectDisplay() { return "^"+format(tmp.hn.upgrades[22].effect) },
            formula: "10^(sqrt(log(log(x+1)+1))*5)",
        },
        23: {
            title: "反转强化",
            description: "平衡加成 <b>翻转声望增益</b> 效果。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e12625":100) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6e11":"1e5400000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 23) },
            effect() { return player.ba.points.plus(1).log10().plus(1).pow(.75).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?1.1:1) },
            effectDisplay() { return "^"+format(tmp.hn.upgrades[23].effect) },
            formula: "(log(x+1)+1)^0.75",
        },
        24: {
            title: "日冕能量",
            description: "日冕波动的两个效果翻倍（不受软上限影响）。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e12645":1.5e5) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.05e11":"1e12000000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 24) && hasMilestone("hn", 7) },
        },
        25: {
            title: "聚爆超新星",
            description: "超空间能量和星云加成阳光获取指数和星尘获取。",
            multiRes: [
                {
                    cost: new Decimal(5e10),
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost: new Decimal("1e32500000"),
                },
            ],
            unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked && player.hs.unlocked },
            effect() { return player.hs.points.times(player.n.points.pow(3)).plus(1).log10().plus(1).log10().plus(1) },
            effectDisplay() { return format(tmp.hn.upgrades[25].effect)+"x" },
            formula: "log(log(HS*(N^3)+1)+1)+1",
            style: {"font-size": "9px"},
        },
        31: {
            title: "指数漂移",
            description: "点数获取提升至 1.05 次幂。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e12650":64) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.06e11":"1e5600000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 31) },
        },
        32: {
            title: "更少无用",
            description: "<b>力量升级</b> 提升至 7 次幂。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e12800":1e4) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.3e11":"1e10250000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 32) },
        },
        33: {
            title: "列长长",
            description: "最多荣耀加成 <b>列长</b> 效果。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e12900":500) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.325e11":"1e6900000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 33) },
            effect() { return Decimal.pow(10, player.hn.best.plus(1).log10().plus(1).log10().sqrt()).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?1.1:1) },
            effectDisplay() { return format(tmp.hn.upgrades[33].effect)+"x" },
            formula: "10^sqrt(log(log(x+1)+1))",
        },
        34: {
            title: "太阳活跃",
            description: "总荣耀加成 <b>阳光潜能</b> 效果。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e12820":5e5) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.32e11":"1e12500000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 34) && hasMilestone("hn", 7) },
            effect() { return player.hn.total.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
            effectDisplay() { return format(tmp.hn.upgrades[34].effect)+"x" },
            formula: "log(log(log(x+1)+1)+1)+1",
        },
        35: {
            title: "不致死",
            description: "紫尘蓝尘加成子空间底数。",
            multiRes: [
                {
                    cost: new Decimal(1.5e13),
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost: new Decimal("1e40000000"),
                },
            ],
            unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
            effect() { return player.n.purpleDust.times(player.n.blueDust).plus(1).pow(10) },
            effectDisplay() { return format(tmp.hn.upgrades[35].effect)+"x" },
            formula: "(B*P+1)^10",
        },
        41: {
            title: "一次又一次",
            description: "魂力加成 <b>声望递归</b> 效果。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e13050":1e5) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.75e11":"1e11000000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 41) && hasMilestone("hn", 7) },
            effect() { return player.ps.power.plus(1).log10().plus(1).log10().times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?4.8:2.4).plus(1) },
            effectDisplay() { return "^"+format(tmp.hn.upgrades[41].effect) },
            formula: "log(log(x+1)+1)*2.4+1",
            style: {"font-size": "9px"},
        },
        42: {
            title: "空间感知 II",
            description: "建筑价格减缓 20%。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e13100":1.5e5) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.8e11":"1e12000000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 42) && hasMilestone("hn", 7) },
        },
        43: {
            title: "诅咒",
            description: "QE 加成诡异获取。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e14300":5e5) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.9e11":"1e12500000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 43) && hasMilestone("hn", 7) },
            effect() { return Decimal.pow(10, tmp.q.enEff.max(1).log10().root(1.8)).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?50:1) },
            effectDisplay() { return format(tmp.hn.upgrades[43].effect)+"x" },
            formula() { return "10^(log(quirkEnergyEff)^"+((hasUpgrade("t", 35) && player.i.buyables[12].gte(4))?"0.565":"0.556")+")" },
        },
        44: {
            title: "数字词典",
            description: "<b>法术词典</b> 同样影响 <b>实体重生</b>（平衡升级）的效果（不受软上限影响）。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e14275":5e5) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.95e11":"1e12500000") },
                },
            ],
            unlocked() { return player.hn.unlocked && hasUpgrade("p", 44) && hasMilestone("hn", 7) },
            style: {"font-size": "8px"},
        },
        45: {
            title: "冰箱下面",
            description: "蓝尘橙尘加成星云获取。",
            multiRes: [
                {
                    cost: new Decimal(1e14),
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost: new Decimal("1e42500000"),
                },
            ],
            unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
            effect() { return player.n.blueDust.times(player.n.orangeDust).plus(1).log10().plus(1).pow(3) },
            effectDisplay() { return format(tmp.hn.upgrades[45].effect)+"x" },
            formula: "(log(B*O+1)+1)^3",
        },
        51: {
            title: "潜影",
            description: "总荣耀降低灵魂价格，同时灵魂价格增长减缓。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e14500":1e6) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e6.975e11":"1e12800000") },
                },
            ],
            unlocked() { return player.hn.upgrades.length>=16 },
            effect() { return player.hn.total.plus(1).pow(5) },
            effectDisplay() { return "/"+format(tmp.hn.upgrades[51].effect) },
            formula: "(x+1)^5",
            style: {"font-size": "8px"},
        },
        52: {
            title: "循环生长",
            description: "<b>差旋层电浆</b> 加成超级生成器底数。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e30000":1e7) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost() { return new Decimal(player.ma.current=="hn"?"e7.5e11":"e16000000") },
                },
            ],
            unlocked() { return player.hn.upgrades.length>=16 && (player.n.unlocked||player.hs.unlocked) },
            style: {"font-size": "9px"},
        },
        53: {
            title: "星云亮度",
            description: "解锁 3 个星尘效果，但你只能选择其中一个激活，在第六行重置时保留星尘。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e40000":2.5e7) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost: new Decimal("e17250000"),
                },
            ],
            unlocked() { return hasUpgrade("hn", 52) && player.n.unlocked },
            style: {"font-size": "9px"},
        },
        54: {
            title: "超速杰作",
            description: "总超空间能量加成超建筑效果。",
            multiRes: [
                {
                    cost() { return new Decimal(player.ma.current=="hn"?"1e40000":2.5e7) },
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost: new Decimal("e17250000"),
                },
            ],
            unlocked() { return hasUpgrade("hn", 52) && player.hs.unlocked },
            style: {"font-size": "9px"},
            effect() { return player.hs.total.pow(2).plus(1).log10().plus(1).log10().plus(1).log10().times(4).plus(1) },
            effectDisplay() { return format(tmp.hn.upgrades[54].effect.sub(1).times(100))+"% 强化" },
            formula: "log(log(log(x^2+1)+1)+1)*400",
        },
        55: {
            title: "阳光之下",
            description: "橙尘紫尘加成太阳能。",
            multiRes: [
                {
                    cost: new Decimal(2.5e14),
                },
                {
                    currencyDisplayName: "声望",
                    currencyInternalName: "points",
                    currencyLayer: "p",
                    cost: new Decimal("1e45000000"),
                },
            ],
            unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
            effect() { return player.n.orangeDust.times(player.n.purpleDust).plus(1).log10() },
            effectDisplay() { return "+"+format(tmp.hn.upgrades[55].effect.times(100))+"%" },
            formula: "log(O*P+1)*100",
        },
    },
})
/*
              
              
              
              
              
              
nnnn  nnnnnnnn    
n:::nn::::::::nn  
n::::::::::::::nn 
nn:::::::::::::::n
n:::::nnnn:::::n
n::::n    n::::n
n::::n    n::::n
n::::n    n::::n
n::::n    n::::n
n::::n    n::::n
n::::n    n::::n
nnnnnn    nnnnnn
              
              
              
              
              
              
              
*/
addLayer("n", {
    name: "nebula", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        purpleDust: new Decimal(0),
        blueDust: new Decimal(0),
        orangeDust: new Decimal(0),
        activeSecondaries: {purpleBlue: false, blueOrange: false, orangePurple: false},
        first: 0,
    }},
    color: "#430082",
    nodeStyle() { return {
        "background-color": (((player.n.unlocked||canReset("n"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#430082":"#bf8f8f"),
        color: (player.oldStyle?"white":"rgba(255, 255, 255, 0.75)"),
    }},
    componentStyles() { return {
        "prestige-button": {
            color: (player.oldStyle?"white":"rgba(255, 255, 255, 0.75)"),
        },
    }},
    requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 92))?"1e288":"1e280") }, // Can be a function that takes requirement increases into account
    increaseUnlockOrder: ["hs"],
    resource: "星云", // Name of prestige currency
    baseResource: "阳光", // Name of resource prestige is based on
    baseAmount() {return player.o.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.05:0.03) }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade("hn", 45)) mult = mult.times(upgradeEffect("hn", 45));
        if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
        if (hasUpgrade("s", 33) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 33));
        if (hasUpgrade("q", 45) && player.i.buyables[12].gte(6)) mult = mult.times(200);
        if (player.ge.unlocked) mult = mult.times(tmp.ge.rotEff);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("i"):false) mult = mult.times(Decimal.pow(10, player.i.nb));
        if (hasUpgrade("ai", 24)) mult = mult.times(upgradeEffect("ai", 24));
        return mult
    },
    passiveGeneration() { return (hasMilestone("ma", 3)&&player.ma.current!="n")?1:0 },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "按 N 进行星云重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        if (!hasUpgrade("hn", 53)) {
            player.n.purpleDust = new Decimal(0);
            player.n.blueDust = new Decimal(0);
            player.n.orangeDust = new Decimal(0);
        }
        if (layers[resettingLayer].row == 6 && hasMilestone("ma", 0)) keep.push("buyables");
        let as = JSON.parse(JSON.stringify(player.n.activeSecondaries));
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
        if (hasMilestone("ma", 0)) player.n.activeSecondaries = as;
    },
    layerShown(){return player.o.unlocked && player.hn.unlocked },
    branches: ["o", ["ps", 2]],
    tabFormat() { 
        let second = !(!tmp.n.secondariesAvailable);
        
        return ["main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["column", 
            [(second?["clickable", 14]:[]),
            
            "blank",
            
            ["display-text", (player.ma.unlocked?("尘积: "+format(tmp.n.dustProduct)):"") ],
            
            "blank",
        
            ["row", [["display-text", ("<span style='color: #bd6afc; font-size: 24px'>"+format(player.n.purpleDust)+"</span> 紫尘"+(tmp.nerdMode?" (获取公式: (x^0.333)*"+format(tmp.n.dustGainMult.div(20))+")":((tmp.n.effect.purple||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.purple||new Decimal(1))+"/sec)"):""))+"<br><br>增幅恶魂和魂力获取 <span style='color: #bd6afc; font-size: 24px'>"+format(tmp.n.dustEffs.purple)+"x</span>"+(tmp.nerdMode?" (效果公式: 10^sqrt(log(x+1)))":""))]], {"background-color": "rgba(189, 106, 252, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
            
            (second?["column", [["clickable", 11], ["display-text", ("加成魔法获取 <span style='color: #ee82ee; font-size: 24px'>"+format(tmp.n.dustEffs2.purpleBlue)+"x</span>"+(tmp.nerdMode?" (效果公式: (purple*blue+1)^10)":" (基于紫尘蓝尘)"))]], {"background-color": "rgba(238, 130, 238, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
            
            ["row", [["display-text", ("<span style='color: #7569ff; font-size: 24px'>"+format(player.n.blueDust)+"</span> 蓝尘"+(tmp.nerdMode?" (获取公式: (x^0.5)*"+format(tmp.n.dustGainMult.div(1e3))+")":((tmp.n.effect.blue||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.blue||new Decimal(1))+"/sec)"):""))+"<br><br>加成超级增幅器底数 <span style='color: #7569ff; font-size: 24px'>"+format(tmp.n.dustEffs.blue)+"x</span>"+(tmp.nerdMode?" (效果公式: (x+1)^50)":""))]], {"background-color": "rgba(117, 105, 255, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
            
            (second?["column", [["clickable", 12], ["display-text", ("加成 <b>永恒</b> 和 <b>D 选项</b> 效果 <span style='color: #ba9397; font-size: 24px'>"+format(tmp.n.dustEffs2.blueOrange)+"x</span><br>(不受软上限影响)"+(tmp.nerdMode?" (效果公式: (blue*orange+1)^5)":" (基于蓝尘橙尘)"))]], {"background-color": "rgba(186, 147, 151, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
            
            ["row", [["display-text", ("<span style='color: #ffbd2e; font-size: 24px'>"+format(player.n.orangeDust)+"</span> 橙尘"+(tmp.nerdMode?" (获取公式: (x^0.2)*"+format(tmp.n.dustGainMult.div(5))+")":((tmp.n.effect.orange||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.orange||new Decimal(1))+"/sec)"):""))+"<br><br> 加成所有阳光购买项数量 <span style='color: #ffbd2e; font-size: 24px'>"+format(tmp.n.dustEffs.orange)+"x</span>"+(tmp.nerdMode?" (效果公式: (x+1)^75)":""))]], {"background-color": "rgba(255, 189, 46, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
            
            (second?["column", [["clickable", 13], ["display-text", ("加成时间胶囊上限底数 <span style='color: #94de95; font-size: 24px'>"+format(tmp.n.dustEffs2.orangePurple)+"x</span><br>"+(tmp.nerdMode?" (效果公式: (orange*purple+1)^0.6)":" (基于橙尘紫尘)"))]], {"background-color": "rgba(148, 222, 149, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
        ]],
        "blank", "blank", ["buyable", 11], "blank", "blank",
    ]},
    dustGainMult() {
        let mult = new Decimal(1);
        if (player.n.buyables[11].gte(1)) mult = mult.times(buyableEffect("o", 22));
        if (hasUpgrade("hn", 25)) mult = mult.times(upgradeEffect("hn", 25));
        if (hasUpgrade("g", 33) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 33));
        if (player.ge.unlocked) mult = mult.times(tmp.ge.rotEff);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.times(1e30);
        return mult;
    },
    effect() {
        let amt = player.n.points;
        return {
            purple: amt.cbrt().div(20).times(tmp.n.dustGainMult),
            blue: amt.sqrt().div(1e3).times(tmp.n.dustGainMult),
            orange: amt.root(5).div(5).times(tmp.n.dustGainMult),
        };
    },
    dustProduct() { return player.n.purpleDust.times(player.n.blueDust).times(player.n.orangeDust) },
    dustEffs() {
        let mod = player.n.unlocked?1:0
        let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.6:1
        return {
            purple: Decimal.pow(10, player.n.purpleDust.times(mod).plus(1).log10().sqrt()).pow(exp),
            blue: player.n.blueDust.times(mod).plus(1).pow(50).pow(exp),
            orange: player.n.orangeDust.times(mod).plus(1).pow(75).pow(exp),
        }
    },
    dustEffs2() {
        let mod = hasUpgrade("hn", 53)?1:0
        let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1
        return {
            purpleBlue: player.n.purpleDust.times(player.n.blueDust).plus(1).pow(10).pow(exp),
            blueOrange: player.n.blueDust.times(player.n.orangeDust).plus(1).pow(5).pow(exp),
            orangePurple: player.n.orangeDust.times(player.n.purpleDust).plus(1).pow(0.6).pow(exp),
        }
    },
    realDustEffs2() {
        let avail = player.n.activeSecondaries
        let data = tmp.n.dustEffs2;
        return {
            purpleBlue: avail.purpleBlue?data.purpleBlue:new Decimal(1),
            blueOrange: avail.blueOrange?data.blueOrange:new Decimal(1),
            orangePurple: avail.orangePurple?data.orangePurple:new Decimal(1),
        }
    },
    effectDescription: "产生下面的星尘",
    update(diff) {
        if (!player.n.unlocked) return;
        player.n.purpleDust = player.n.purpleDust.plus(tmp.n.effect.purple.times(diff));
        player.n.blueDust = player.n.blueDust.plus(tmp.n.effect.blue.times(diff));
        player.n.orangeDust = player.n.orangeDust.plus(tmp.n.effect.orange.times(diff));
    },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "星团",
            cap() { return new Decimal(5) },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let exp = (player.ma.current=="n")?26.5:1
                let cost = { purple: Decimal.pow(1e3, x.pow(2)).cbrt().times(50).pow(Math.pow(exp, 0.966)), blue: Decimal.pow(200, x.pow(2)).sqrt().pow(exp), orange: Decimal.pow(1e3, x.pow(2)).root(5).times(150).pow(exp) }
                return cost;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ((player[this.layer].buyables[this.id].gte(data.cap)?"已满":(("价格: " + formatWhole(data.cost.purple) + " 紫尘"+(tmp.nerdMode?" (公式: ((1e3^(x^2))^0.333)*50)":"")+"\n价格: "+formatWhole(data.cost.blue)+" 蓝尘"+(tmp.nerdMode?" (公式: ((200^(x^2))^0.5))":"")+"\n价格: "+formatWhole(data.cost.orange)+" 橙尘")+(tmp.nerdMode?" (公式: ((1e3^(x^2))^0.2)*150)":"")))+"\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
                解锁 "+formatWhole(player[this.layer].buyables[this.id])+" 个阳光可购买项")
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player.n.unlocked && player.n.purpleDust.gte(cost.purple) && player.n.blueDust.gte(cost.blue) && player.n.orangeDust.gte(cost.orange) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.n.purpleDust = player.n.purpleDust.sub(cost.purple)
                player.n.blueDust = player.n.blueDust.sub(cost.blue)
                player.n.orangeDust = player.n.orangeDust.sub(cost.orange)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'200px', 'width':'200px', color:(tmp[this.layer].buyables[this.id].canAfford?"white":"black")}},
            autoed() { return false },
        },
    },
    secondariesAvailable() { return hasUpgrade("hn", 53)?((hasMilestone("hn", 8)&&player.ma.current!="n")?3:(hasUpgrade("hn", 15)?2:1)):0 },
    secondariesActive() { 
        let n = 0;
        Object.values(player.n.activeSecondaries).forEach(x => function() { n += x?1:0 }());
        return Math.min(n, layers.n.secondariesAvailable());
    },
    clickables: {
        rows: 1,
        cols: 4,
        11: {
            name: "purpleBlue",
            display() { return player.n.activeSecondaries[this.name]?"开":((!this.canClick())?"禁用":"关") },
            unlocked() { return tmp.n.secondariesAvailable>0 },
            canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
            onClick() { player.n.activeSecondaries[this.name] = true },
            style: {"height": "50px", "width": "50px", "background-color": "#ee82ee"},
        },
        12: {
            name: "blueOrange",
            display() { return player.n.activeSecondaries[this.name]?"开":((!this.canClick())?"禁用":"关") },
            unlocked() { return tmp.n.secondariesAvailable>0 },
            canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
            onClick() { player.n.activeSecondaries[this.name] = true },
            style: {"height": "50px", "width": "50px", "background-color": "#ba9397"},
        },
        13: {
            name: "orangePurple",
            display() { return player.n.activeSecondaries[this.name]?"开":((!this.canClick())?"禁用":"关") },
            unlocked() { return tmp.n.secondariesAvailable>0 },
            canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
            onClick() { player.n.activeSecondaries[this.name] = true },
            style: {"height": "50px", "width": "50px", "background-color": "#94de95"},
        },
        14: {
            display: "重置二级星尘效果（会进行一次星云重置）",
            unlocked() { return tmp.n.secondariesAvailable>0 },
            canClick() { return layers.n.secondariesActive()>0 },
            onClick() { 
                doReset("n", true);
                player.n.activeSecondaries = {purpleBlue: false, blueOrange: false, orangePurple: false}
            },
            style() { return {color: this.canClick()?"white":"black"}},
        },
    },
})
/*
                                 
                                 
hhhhhhh                              
h:::::h                              
h:::::h                              
h:::::h                              
h::::h hhhhh           ssssssssss   
h::::hh:::::hhh      ss::::::::::s  
h::::::::::::::hh  ss:::::::::::::s 
h:::::::hhh::::::h s::::::ssss:::::s
h::::::h   h::::::h s:::::s  ssssss 
h:::::h     h:::::h   s::::::s      
h:::::h     h:::::h      s::::::s   
h:::::h     h:::::hssssss   s:::::s 
h:::::h     h:::::hs:::::ssss::::::s
h:::::h     h:::::hs::::::::::::::s 
h:::::h     h:::::h s:::::::::::ss  
hhhhhhh     hhhhhhh  sssssssssss    
                                 
                                 
                                 
                                 
                                 
                                 
                                 
*/
addLayer("hs", {
    name: "hyperspace", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        spentHS: new Decimal(0),
        buildLim: new Decimal(1),
        first: 0,
        auto: false,
    }},
    roundUpCost: true,
    color: "#dfdfff",
    requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 92))?420:360) }, // Can be a function that takes requirement increases into account
    increaseUnlockOrder: ["n"],
    resource: "超空间能量", // Name of prestige currency 
    baseResource: "空间能量", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { 
        let exp = new Decimal(60);
        if (player.i.buyables[11].gte(4)) exp = exp.times(buyableEffect("s", 19));
        return exp;
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
        if (hasUpgrade("e", 41) && player.i.buyables[12].gte(3)) mult = mult.times(upgradeEffect("e", 41));
        if (hasUpgrade("t", 41) && player.i.buyables[12].gte(4)) mult = mult.times(2.5e3);
        if (hasUpgrade("s", 33) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 33));
        if (player.ma.unlocked) mult = mult.times(tmp.ma.effect);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("i"):false) mult = mult.times(Decimal.pow(10, player.i.hb));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "ctrl+s", description: "按 Ctrl+S 进行超空间重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    passiveGeneration() { return (hasMilestone("ma", 2)&&player.ma.current!="hs")?1:0 },
    doReset(resettingLayer){ 
        let keep = [];
        let hs = player.hs.buyables[11];
        if (hasMilestone("ma", 2)) {
            keep.push("buyables");
            keep.push("spentHS");
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        if (layers[resettingLayer].row == 6 && hasMilestone("ma", 0)) player.hs.buyables[11] = hs;
    },
    layerShown(){return player.ss.unlocked && player.hn.unlocked },
    branches: ["ss", "ba"],
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { return "你有 "+formatWhole(player.ba.points)+" 平衡" }],
        "blank",
        ["buyable", 11],
        "blank", "blank",
        "respec-button",
        "blank",
        ["display-text", function() { return tmp.hs.buildingPower.eq(1)?"":("超建筑增益: "+format(tmp.hs.buildingPower.times(100))+"%")}], "blank",
        ["row", [["buyable", 21], ["buyable", 22], ["buyable", 23], ["buyable", 24], ["buyable", 25], ["buyable", 26], ["buyable", 27], ["buyable", 28], ["buyable", 29], ["buyable", 30]]],
        "blank",
        ["display-text", function() { return "超建筑限制: "+formatWhole(player.hs.buildLim)+", 下一个: "+formatWhole(player.sg.points)+" / "+formatWhole(tmp.hs.nextBuildLimit)+" 超级生成器" }], "blank",
    ],
    update(diff) {
        player.hs.buildLim = player.hs.buildLim.max(tmp.hs.buildLimit);
        if (hasMilestone("ma", 5) && player.hs.auto && player.ma.current!="hs") tmp.hs.buyables[11].buyMax();
    },
    hyperspace() {
        let total = player.hs.buyables[11];
        let amt = total.sub(player.hs.spentHS);
        return amt;
    },
    buildLimScaling() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.8:1 },
    nextBuildLimit() { return player.hs.buildLim.plus(1).times(tmp.hs.buildLimScaling).pow(2).plus(20) },
    buildLimit() { return player.sg.points.sub(21).max(0).plus(1).sqrt().div(tmp.hs.buildLimScaling).floor() },
    buildingPower() {
        if (!unl(this.layer)) return new Decimal(0);
        let pow = new Decimal(1)
        if (hasUpgrade("hn", 54)) pow = pow.times(upgradeEffect("hn", 54));
        if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
        if (player.i.buyables[11].gte(5)) pow = pow.plus(buyableEffect("s", 20));
        if (player.ma.unlocked) pow = pow.plus(tmp.ma.effect.max(1).log10().div(40));
        if (hasAchievement("a", 113)) pow = pow.plus(.1);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.plus(player.hs.buyables[11].div(1000))
        if (player.c.unlocked && tmp.c) pow = pow.plus(tmp.c.eff1);
        return pow;
    },
    buyables: {
        rows: 2,
        cols: 10,
        showRespec() { return player.hs.unlocked },
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            player.hs.spentHS = new Decimal(0);
            let totalHS = player[this.layer].buyables[11]
            resetBuyables(this.layer)
            player[this.layer].buyables[11] = totalHS;
            doReset(this.layer, true) // Force a reset
        },
        respecText: "重置超建筑", // Text on Respec button, optional
        11: {
            title: "超空间",
            scaleRate() {
                let rate = new Decimal(1);
                if (hasUpgrade("t", 32) && player.i.buyables[12].gte(4)) rate = new Decimal(2/3);
                if (player.ma.current=="hs") rate = rate.times(4)
                return rate;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                x = x.times(tmp[this.layer].buyables[this.id].scaleRate);
                let y = x;
                if (y.gte(10)) y = y.pow(5).div(1e4);
                let cost = {hs: Decimal.pow(10, y.pow(0.9)).floor(), ba: Decimal.pow(10, x.max(x.div(1.5).pow(2)).times(40).add(360))}
                return cost;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let primeX = "x"+(data.scaleRate.eq(1)?"":("*"+format(data.scaleRate)))
                let display = ("价格: " + formatWhole(data.cost.hs) + " 超空间能量"+(tmp.nerdMode?" (公式: (10^("+(player[this.layer].buyables[this.id].gte(10)?"(("+primeX+"^5)/1e4)":primeX)+"^0.9)))":"")+"\n价格: "+formatWhole(data.cost.ba)+" 平衡"+(tmp.nerdMode?" (公式): (10^(((x*"+format(data.scaleRate.div(1.5))+")^2)*40+360)))":"")+"\n\
                数量: " + formatWhole(tmp.hs.hyperspace)+" / "+formatWhole(player[this.layer].buyables[this.id]))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player.hs.unlocked && player.hs.points.gte(cost.hs) && player.ba.points.gte(cost.ba)
            },
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.hs.points = player.hs.points.sub(cost.hs);
                player.ba.points = player.ba.points.sub(cost.ba);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                let y = player.hs.points.max(1).log10().root(.9);
                if (y.gte(10)) y = y.times(1e4).root(5);
                let target = y.min(player.ba.points.max(1).log10().sub(360).div(40).sqrt().times(1.5)).div(tmp[this.layer].buyables[this.id].scaleRate).plus(1).floor();
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            },
            style() { return {'height':'200px', 'width':'200px'}},
            autoed() { return hasMilestone("ma", 5) && player.hs.auto && player.ma.current!="hs" },
        },
        21: {
            title: "第一超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第一建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level*5e3+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).times(5e3).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        22: {
            title: "第二超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第二建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level*40+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).times(40).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        23: {
            title: "第三超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第三建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^0.8)*800+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.8).times(800).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        24: {
            title: "第四超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第四建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^0.8)*5e3+1)":" (不受软上限影响)"))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.8).times(5e3).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        25: {
            title: "第五超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第五建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^0.75)*0.25+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.75).times(0.25).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        26: {
            title: "第六超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第六建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^1.1)/1.2+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(1) }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(1.1).div(1.2).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        27: {
            title: "第七超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第七建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level/5+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(2) }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(5).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        28: {
            title: "第八超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第八建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level/1.15+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(3) }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(1.15).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        29: {
            title: "第九超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第九建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式): level/5+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(4) && player.ma.current!="hs" }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(5).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
        30: {
            title: "第十超建筑",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return new Decimal(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ("价格: 1 超空间\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
                第十建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: sqrt(level)/1.5+1)":""))
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(5) }, 
            canAfford() {
                return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
            },
            effect() {
                return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).sqrt().div(1.5).plus(1);
            },
            buy() { 
                player.hs.spentHS = player.hs.spentHS.plus(1);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
            },
            buyMax() {
                // later :)
            },
            style() { return {'height':'100px'}},
            autoed() { return false },
        },
    },
})
/*
    
    
iiii  
i::::i 
iiii  
    
iiiiiii 
i:::::i 
i::::i 
i::::i 
i::::i 
i::::i 
i::::i 
i::::i 
i::::::i
i::::::i
i::::::i
iiiiiiii
    
    
    
    
    
    
    
*/
addLayer("i", {
    name: "imperium", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        nb: new Decimal(0),
        hb: new Decimal(0),
        auto: false,
        first: 0,
    }},
    color: "#e5dab7",
    requires() { return new Decimal("1e11750") }, // Can be a function that takes requirement increases into account
    resource: "砖石", // Name of prestige currency
    baseResource: "子空间", // Name of resource prestige is based on
    baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1.8), // Prestige currency exponent
    base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e100":"1e250") },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return hasMilestone("ma", 1) },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "i", description: "按 I 进行帝国重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("ma", 1) },
    doReset(resettingLayer){ 
        let keep = [];
        let i2 = player.i.buyables[12];
        if (hasMilestone("ma", 2)) keep.push("buyables")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        player.i.buyables[12] = i2;
    },
    autoPrestige() { return player.i.auto && hasMilestone("ma", 4) && player.ma.current!="i" },
    layerShown(){return player.hn.unlocked},
    branches: ["ss"],
    update(diff) {
        if (!player.i.unlocked) return;
        player.i.nb = player.i.nb.max(tmp.i.nbAmt);
        player.i.hb = player.i.hb.max(tmp.i.hbAmt);
    },
    nbAmt() {
        let amt = player.n.points.div(2e3).plus(1).log10().root(1.25)
        return amt.floor();
    },
    nextNB() {
        let next = Decimal.pow(10, player.i.nb.plus(1).pow(1.25)).sub(1).times(2e3);
        return next;
    },
    hbAmt() {
        let amt = player.hs.points.div(1e6).plus(1).log10().root(1.35)
        return amt.floor();
    },
    nextHB() {
        let next = Decimal.pow(10, player.i.hb.plus(1).pow(1.35)).sub(1).times(1e6);
        return next;
    },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { return player.i.unlocked?("你有 "+formatWhole(player.i.nb)+" 星云砖 "+(tmp.nerdMode?"(公式: log(N/2e3+1)^0.8)":("(下一个在 "+format(tmp.i.nextNB)+" 星云)"))):"" }],
        ["display-text", function() { return player.i.unlocked?("你有 "+formatWhole(player.i.hb)+" 超空间砖 "+(tmp.nerdMode?"(公式: log(HS/1e6+1)^0.74)":("(下一个在 "+format(tmp.i.nextHB)+" 超空间能量)"))):"" }],
        "blank",
        ["display-text", function() { return (player.ma.current=="i"&&player.i.unlocked)?"注意: 在镀金砖石的时候，帝国建筑会使对方更贵！":"" }],
        "blank",
        "buyables",
    ],
    buyables: {
        rows: 1,
        cols: 4,
        11: {
            title: "帝国建筑 I",
            cap() { return new Decimal(5) },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = { ib: x.times(1.4).pow(1.2).plus(1).pow(player.ma.current=="i"?player.i.buyables[12].div(4).plus(1):1).floor(), nb: x.pow(1.4).times(2).plus(4).pow(player.ma.current=="i"?player.i.buyables[12].div(6).plus(1):1).floor() }
                return cost;
            },
            formulas: {
                ib: "(x*1.4)^1.2+1",
                nb: "(x^1.4)*2+4",
                hb: "N/A",
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let display = ((player[this.layer].buyables[this.id].gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
                解锁 "+formatWhole(player[this.layer].buyables[this.id])+" 新建筑 （不受额外建筑影响）")
                return display;
            },
            unlocked() { return unl(this.layer) }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player.i.unlocked && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
                if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
                if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                // later :)
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return false },
        },
        12: {
            title: "帝国建筑 II",
            cap() { return new Decimal(6) },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = { ib: x.pow(1.2).plus(1).pow(player.ma.current=="i"?player.i.buyables[11].div(2).plus(1):1).floor(), hb: x.pow(1.6).plus(5).pow(player.ma.current=="i"?player.i.buyables[11].div(5).plus(1):1).floor() }
                return cost;
            },
            formulas: {
                ib: "x^1.2+1",
                nb: "N/A",
                hb: "x^1.6+5",
            },
            displayData() {
                let amt = player[this.layer].buyables[this.id];
                let disp = ""
                if (amt.gte(1)) disp += "3 个增幅器升级\n";
                if (amt.gte(2)) disp += "5 个生成器升级\n";
                if (amt.gte(3)) disp += "5 个增强升级\n";
                if (amt.gte(4)) disp += "6 个时间升级\n";
                if (amt.gte(5)) disp += "5 个空间升级\n";
                if (amt.gte(6)) disp += "4 个诡异升级\n";
                if (disp=="") disp = "啥都没"
                return disp;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = ((amt.gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                数量: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
                解锁: \n"
                +data.displayData)
                return display;
            },
            unlocked() { return unl(this.layer) }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player.i.unlocked && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
                if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
                if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                // later :)
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return false },
        },
        13: {
            title: "帝国建筑 III",
            cap() { return new Decimal(3) },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = { nb: x.pow(.6).times(15).plus(380).floor(), hb: x.pow(.825).times(9e4).plus(8.2e5).floor() }
                return cost;
            },
            formulas: {
                ib: "N/A",
                nb: "(x^0.6)*15+380",
                hb: "(x^0.8)*90,000+820,000",
            },
            displayData() {
                let amt = player[this.layer].buyables[this.id];
                let disp = formatWhole(amt)+" 个新魔法"
                return disp;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = ((amt.gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                数量: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
                解锁: "
                +data.displayData)
                return display;
            },
            unlocked() { return unl(this.layer) && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player.i.unlocked && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
                if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
                if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                // later :)
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return false },
        },
        14: {
            title: "帝国建筑 IV",
            cap() { return new Decimal(2) },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = { ib: x.pow(2).plus(44), nb: x.pow(1.3).times(6).plus(390).floor(), hb: x.pow(2.25).times(9e4).plus(8.75e5).floor() }
                return cost;
            },
            formulas: {
                ib: "x^2+44",
                nb: "(x^1.3)*6+390",
                hb: "(x^2.25)*90,000+875,000",
            },
            displayData() {
                let amt = player[this.layer].buyables[this.id];
                let disp = formatWhole(amt)+" 新幽魂增幅器"
                return disp;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = ((amt.gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                数量: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
                解锁: "
                +data.displayData)
                return display;
            },
            unlocked() { return unl(this.layer) && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player.i.unlocked && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
                if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
                if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                // later :)
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return false },
        },
    },
})

































































/*
                            
                    dddddddd
  iiii              d::::::d
 i::::i             d::::::d
  iiii              d::::::d
                    d:::::d 
iiiiiii     ddddddddd:::::d 
i:::::i   dd::::::::::::::d 
 i::::i  d::::::::::::::::d 
 i::::i d:::::::ddddd:::::d 
 i::::i d::::::d    d:::::d 
 i::::i d:::::d     d:::::d 
 i::::i d:::::d     d:::::d 
 i::::i d:::::d     d:::::d 
i::::::id::::::ddddd::::::dd
i::::::i d:::::::::::::::::d
i::::::i  d:::::::::ddd::::d
iiiiiiii   ddddddddd   ddddd
                            
                            
                            
                            
                            
                            
                            
*/
addLayer("id", {
    name: "ideas", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ID", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 5, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        first: 0,
        auto: false,
    }},
    color: "#fad682",
    requires() { 
        let req = new Decimal(44);
        if (player.ai.unlocked && tmp.ai) req = req.div(tmp.ai.conscEff2);
        return req.max(2);
    }, // Can be a function that takes requirement increases into account
    resource: "想法", // Name of prestige currency
    baseResource: "思考", // Name of resource prestige is based on
    baseAmount() {return player.ne.thoughts}, // Get the current amount of baseResource
    roundUpCost: true,
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1.4), // Prestige currency exponent
    base: new Decimal(1.2),
    effect() { return Decimal.sub((hasAchievement("a", 155)?0.005:0)+(hasUpgrade("ai", 32)?0.99:0.95), Decimal.div(0.95, player.id.points.plus(1).log10().times(hasMilestone("id", 4)?1.5:1).times(hasMilestone("id", 5)?1.75:1).plus(1))) },
    effectDescription() { return "减缓思考阈值增加 <h2 style='color: #fad682; text-shadow: #fad682 0px 0px 10px;'>"+format(tmp[this.layer].effect)+"</h2>"+(tmp.nerdMode?" (0.95-0.95/(log(x+1)+1))。":"。") },
    rev() { return player.ne.signals.plus(1).log10().div(10).pow(.75).times(player.id.points).pow(hasMilestone("id", 0)?2:1).times(hasUpgrade("ai", 32)?1.5:1).times(hasUpgrade("ai", 14)?1.5:1).floor() },
    revEff() { return Decimal.pow(1e25, tmp.id.rev.pow(.95)) },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone("id", 2)) mult = mult.div(player.ne.points.plus(1).log10().plus(1));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return hasMilestone("id", 4) && player.id.auto },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "I", description: "按 Shift+I 进行想法重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("id", 4) && player.id.auto },
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row<7&&resettingLayer!="ai"&&resettingLayer!="c") {
            keep.push("points");
            keep.push("best");
            keep.push("milestones");
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        if (hasUpgrade("ai", 22) && !(layers[resettingLayer].row<7&&resettingLayer!="ai"&&resettingLayer!="c")) addPoints("id", 4);
    },
    autoPrestige() { return hasMilestone("id", 4) && player.id.auto },
    layerShown(){return player.en.unlocked&&player.ne.unlocked},
    branches: ["ne"],
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display", "blank", 
        "milestones", "blank", "blank",
        ["display-text", function() { return "启示: <h2>"+formatWhole(tmp.id.rev)+"</h2>"+(tmp.nerdMode?(hasMilestone("id", 0)?" ((ideas^2)*(log(signals+1)/10)^1.5)":" (ideas*(log(signals+1)/10)^0.75)"):" (基于想法 & 信号)") }],
        ["display-text", function() { return "效果: 机械能量乘以 <h2>"+format(tmp.id.revEff)+"</h2>"+(tmp.nerdMode?" (1e25^(x^0.95))。":"。") } ], "blank",
    ],
    milestones: {
        0: {
            requirementDescription: "2 想法 & 2 启示",
            done() { return (player.id.points.gte(2) && tmp.id.rev.gte(2)) },
            effectDescription: "神经网络价格缩放开始延缓 2 购买并且减弱 50%，思考可以批量获取，启示被平方。",
        },
        1: {
            unlocked() { return hasMilestone("id", 0) },
            requirementDescription: "2 想法 & 8 启示",
            done() { return player.id.points.gte(2) && tmp.id.rev.gte(8) },
            effectDescription: "神经元效果平方，思考所有效果增强 20%。",
        },
        2: {
            unlocked() { return hasMilestone("id", 1) },
            requirementDescription: "3 想法 & 22 启示",
            done() { return player.id.points.gte(3) && tmp.id.rev.gte(22) },
            effectDescription() { return "神经元降低想法价格 (/"+format(player.ne.points.plus(1).log10().plus(1))+")。" },
        },
        3: {
            unlocked() { return hasMilestone("id", 2) },
            requirementDescription: "6 想法 & 245 启示",
            done() { return (player.id.points.gte(6) && tmp.id.rev.gte(245)) },
            effectDescription() { return "解锁自动命令行扩展，比正常购买更高效效，每 OoM 的命令行扩展双倍信号获取（"+format(Decimal.pow(2, player.mc.buyables[11].max(1).log10()))+"x）。" },
            toggles: [["mc", "autoSE"]],
        },
        4: {
            unlocked() { return hasUpgrade("ai", 22)||hasAchievement("a", 164) },
            requirementDescription: "132 启示",
            done() { return ((tmp.id.rev.gte(132)||hasMilestone("id", 4))&&hasUpgrade("ai", 22))||hasAchievement("a", 164) },
            effectDescription: "解锁自动想法，你可以最大购买想法，想法效果增强 50%。",
            toggles: [["id", "auto"]],
        },
        5: {
            unlocked() { return hasUpgrade("ai", 22) },
            requirementDescription: "1,800 启示",
            done() { return (tmp.id.rev.gte(1800)||hasMilestone("id", 5))&&hasUpgrade("ai", 22) },
            effectDescription: "想法效果增强 75%，启示乘以零件和建筑获取。",
        },
    },
})
/*
                
                
                
                
                
                
rrrrr   rrrrrrrrr   
r::::rrr:::::::::r  
r:::::::::::::::::r 
rr::::::rrrrr::::::r
r:::::r     r:::::r
r:::::r     rrrrrrr
r:::::r            
r:::::r            
r:::::r            
r:::::r            
r:::::r            
rrrrrrr            
                
                
                
                
                
                
                
*/
addLayer("r", {
    name: "robots", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        allotted: {
            breeders: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
            farmers: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
            builders: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
            growers: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
            producers: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
        },
        maxMinibots: new Decimal(0),
        spentMinibots: new Decimal(0),
        grownMinibots: new Decimal(0),
        fuel: new Decimal(0),
        buildings: new Decimal(1),
        growTime: new Decimal(0),
        deathTime: new Decimal(0),
        first: 0,
    }},
    color: "#00ccff",
    nodeStyle() { return {
        background: (player.r.unlocked||canReset("r"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #00ccff 0%, #b0b0b0 75%)":"#b0b0b0"):"#bf8f8f",
    }},
    componentStyles: {
        background() { return (player.r.unlocked||canReset("r"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #00ccff 0%, #b0b0b0 75%)":"#b0b0b0"):"#bf8f8f" },
    },
    resource: "机器人", // Name of prestige currency
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    baseResource: "总能量",
    baseAmount() { return player.en.total },
    req() { 
        let req = Decimal.root(5e8, player[this.layer].total.plus(1).log10().plus(1).log10().plus(1).log10().plus(1))
        if (player.ai.unlocked && tmp.ai) req = req.div(tmp.ai.conscEff2);
        return req.max(2);
    },
    requires() { return this.req() },
    exp: new Decimal(0.4),
    exponent() { return tmp[this.layer].exp },
    gainMult() {
        let mult = new Decimal(1);
        if (hasMilestone("r", 3)) mult = mult.times(2);
        if (player.ai.unlocked && tmp.ai) mult = mult.times(tmp.ai.conscEff1);
        if (hasUpgrade("ai", 33)) mult = mult.times(upgradeEffect("ai", 33));
        return mult;
    },
    getResetGain() {
        let gain = Decimal.pow(tmp.r.req, player.en.total.plus(1).log(tmp.r.req).pow(tmp.r.exp)).div(tmp.r.req);
        return gain.times(tmp.r.gainMult).floor();
    },
    resetGain() { return this.getResetGain() },
    getNextAt() {
        let gain = tmp.r.getResetGain.div(tmp.r.gainMult).plus(1)
        return Decimal.pow(tmp.r.req, gain.times(tmp.r.req).max(1).log(tmp.r.req).root(tmp.r.exp)).sub(1)
    },
    passiveGeneration() { return false },
    canReset() {
        return player.en.total.gte(tmp.r.req) && tmp.r.getResetGain.gt(0)
    },
    dispGainFormula() {
        let start = tmp.r.req;
        let exp = tmp.r.exp;
        return "("+format(start)+" ^ (log(x+1) / log("+format(tmp.r.req)+") ^ "+format(exp)+")) / "+format(start)
    },
    prestigeButtonText() {
        if (tmp.nerdMode) return "获取公式: "+tmp.r.dispGainFormula;
        else return `${ player.r.points.lt(1e3) ? (tmp.r.resetDescription !== undefined ? tmp.r.resetDescription : "重置获得 ") : ""}+<b>${formatWhole(tmp.r.getResetGain)}</b> ${tmp.r.resource} ${tmp.r.resetGain.lt(100) && player.r.points.lt(1e3) ? `<br><br>下一个在 ${format(tmp.r.nextAt)} 能量` : ""}`
    },
    prestigeNotify() {
        if (!canReset("r")) return false;
        if (tmp.r.getResetGain.gte(player.en.total.times(0.1).max(1)) && !tmp.r.passiveGeneration) return true;
        else return false;
    },
    tooltip() { return formatWhole(player.r.points)+" 机器人" },
    tooltipLocked() { return "达到 "+formatWhole(tmp.r.req)+" 总能量解锁 (你有 "+formatWhole(player.en.total)+" 总能量)" },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "按 R 进行机器人重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row==5||layers[resettingLayer].row==6) {
            player.r.maxMinibots = new Decimal(0);
            player.r.spentMinibots = new Decimal(0);
            player.r.grownMinibots = new Decimal(0);
            player.r.fuel = new Decimal(0);
            player.r.buildings = new Decimal(1);
            player.r.growTime = new Decimal(0);
            player.r.deathTime = new Decimal(0);
        }
        
        if (layers[resettingLayer].row > this.row+1 || resettingLayer=="ai") layerDataReset(this.layer, keep)
    },
    layerShown(){return player.id.unlocked },
    branches: ["en"],
    update(diff) {
        if (!player[this.layer].unlocked) return;
        player.r.maxMinibots = player.r.maxMinibots.max(tmp.r.totalMinibots);
        player.r.fuel = player.r.fuel.pow(1.5).plus(player.r.allotted.farmers.div(4).times(diff)).root(1.5);
        player.r.buildings = player.r.buildings.pow(2).plus(player.r.allotted.builders.times((hasMilestone("id", 5)&&tmp.id)?tmp.id.rev.max(1):1).div(3).times(diff)).sqrt();
        if (tmp.r.minibots.gt(0)) {
            player.r.deathTime = player.r.deathTime.plus(diff);
            player.r.growTime = player.r.growTime.plus(diff);
        }
        if (Decimal.gte(player.r.deathTime, tmp.r.deathTime)) {
            let bulk = player.r.growTime.div(tmp.r.growTime).min(tmp.r.minibots).floor();
            player.r.deathTime = new Decimal(0);
            if (tmp.r.minibots.gt(0)) {
                player.r.spentMinibots = player.r.spentMinibots.plus(bulk);
            }
        }
        if (Decimal.gte(player.r.growTime, tmp.r.growTime)) {
            let bulk = player.r.growTime.div(tmp.r.growTime).min(tmp.r.minibots).floor();
            player.r.growTime = new Decimal(0);
            if (tmp.r.minibots.gt(0)) {
                addPoints("r", hasUpgrade("ai", 12)?bulk.times(tmp.r.getResetGain.div(20)):bulk);
                player.r.spentMinibots = player.r.spentMinibots.plus(bulk);
                player.r.grownMinibots = player.r.grownMinibots.plus(bulk);
            }
        }
        if (hasMilestone("r", 5)) {
            player.r.allotted.breeders = player.r.allotted.breeders.plus(player.r.points.div(50).times(diff));
            player.r.allotted.farmers = player.r.allotted.farmers.plus(player.r.points.div(50).times(diff));
            player.r.allotted.builders = player.r.allotted.builders.plus(player.r.points.div(50).times(diff));
            player.r.allotted.growers = player.r.allotted.growers.plus(player.r.points.div(50).times(diff));
            player.r.allotted.producers = player.r.allotted.producers.plus(player.r.points.div(50).times(diff));
        }
    },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display", "blank",
        "milestones",
        "blank", "blank", 
        ["clickable", 16], "blank",
        ["row", [
            ["column", [
                ["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.breeders)+"<br>饲养者</h3><br><br><br>" }], "blank",
                ["row", [["clickable", 11], ["clickable", 21]]], "blank", "blank",
                ["display-text", function() { return "下一个迷你机器人在 "+format(tmp.r.nextMinibot)+" 总能量"+(tmp.nerdMode?"。 (公式: log(EN/1e5 * breeders^"+formatWhole(tmp.r.breederExp)+") ^ (2/3))":"。") }],
            ], {width: "9em"}],
            ["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
            ["column", [
                ["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.farmers)+"<br>农民</h3><br>(需要: 1 饲养者)<br><br>" }], "blank",
                ["row", [["clickable", 12], ["clickable", 22]]], "blank", "blank",
                ["display-text", function() { return "燃料: "+format(player.r.fuel)+"，增强下一个迷你机器人的生命周期到 "+formatTime(tmp.r.deathTime.sub(player.r.deathTime))+"。" }],
            ], {width: "9em"}],
            ["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
            ["column", [
                ["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.builders)+"<br>工人</h3><br>(需要: 1 饲养者)<br><br>" }], "blank",
                ["row", [["clickable", 13], ["clickable", 23]]], "blank", "blank",
                ["display-text", function() { return "建筑: "+formatWhole(player.r.buildings.floor())+"，限制你的迷你机器人为 "+formatWhole(tmp.r.minibotCap)+(tmp.nerdMode?" (公式: log2(x)+3)":"")+" 并使齿轮获取乘以 "+formatWhole(tmp.r.buildingEff)+(tmp.nerdMode?"。 (公式: (x-1)^3*100+1)":"。") }],
            ], {width: "9em"}],
            ["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
            ["column", [
                ["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.growers)+"<br>农业专家</h3><br>(需要: 1 饲养者)<br>" }], "blank",
                ["row", [["clickable", 14], ["clickable", 24]]], "blank", "blank",
                ["display-text", function() { return "下一个迷你机器人在 "+formatTime(tmp.r.growTime.sub(player.r.growTime))+" 内转变为机器人。" }],
            ], {width: "9em"}],
            ["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
            ["column", [
                ["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.producers)+"<br>生产者</h3><br><br><br>" }], "blank",
                ["row", [["clickable", 15], ["clickable", 25]]], "blank", "blank",
                ["display-text", function() { return "能量获取乘以 "+format(tmp.r.producerEff)+(tmp.nerdMode?"。 (公式: ((x^1.5)/4+1))":"。") }],
            ], {width: "9em"}],
        ], function() { return {display: player.r.unlocked?"":"none"} }], "blank", "blank",
        ["display-text", function() { return "你有 <h2 style='color: #00ccff; text-shadow: 0px 0px 7px #00ccff;'>"+formatWhole(tmp.r.minibots)+" / "+formatWhole(tmp.r.minibotCap)+"</h2> 迷你机器人" }],
    ],
    breederExp() {
        let exp = new Decimal(3);
        if (hasMilestone("r", 2)) exp = exp.times(2);
        return exp;
    },
    reduceMinibotReqMult() {
        let mult = new Decimal(0);
        if (hasMilestone("r", 3)) mult = mult.plus(.5);
        if (hasUpgrade("ai", 23)) mult = mult.plus(.5);
        return mult;
    },
    nextMinibot() { 
        if (player.r.allotted.breeders.lt(1)||tmp.r.totalMinibots.gte(tmp.r.minibotCap.plus(player.r.spentMinibots))) return new Decimal(1/0);
        else return Decimal.pow(10, tmp.r.totalMinibots.sub(player.r.grownMinibots.times(tmp.r.reduceMinibotReqMult)).plus(1).pow(1.5)).times(1e5).div(player.r.allotted.breeders.max(1).pow(tmp.r.breederExp));
    },
    totalMinibots() { 
        if (player.r.allotted.breeders.lt(1)) return new Decimal(0);
        else return player.en.total.times(player.r.allotted.breeders.pow(tmp.r.breederExp)).div(1e5).max(1).log10().root(1.5).plus(player.r.grownMinibots.times(tmp.r.reduceMinibotReqMult)).floor().min(tmp.r.minibotCap.plus(player.r.spentMinibots))
    },
    minibots() { return player.r.maxMinibots.sub(player.r.spentMinibots).max(0) },
    deathTime() { return player.r.fuel.plus(1).log2().div(3).plus(1).times(20).div(hasUpgrade("ai", 21)?20:1) },
    minibotCap() { return player.r.buildings.floor().max(1).log2().plus(3).floor() },
    buildingEff() { return player.r.buildings.sub(1).max(0).floor().pow(3).times(100).plus(1) },
    growTime() { return player.r.allotted.growers.lt(1)?new Decimal(1/0):Decimal.div(30, player.r.allotted.growers.log10().plus(1)).div(hasUpgrade("ai", 21)?5:1) },
    producerEff() { 
        let mult = hasMilestone("r", 3) ? player.r.grownMinibots.div(4).plus(1) : new Decimal(1);
        if (hasUpgrade("ai", 23)) mult = mult.times(player.r.grownMinibots.times(.4).plus(1));
        return player.r.allotted.producers.pow(1.5).div(4).plus(1).times(mult);
    },
    clickables: {
        rows: 2,
        cols: 6,
        11: {
            title: "+1",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gt(0) },
            onClick() { 
                player.r.allotted.breeders = player.r.allotted.breeders.plus(1);
                player.r.points = player.r.points.sub(1).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        12: {
            title: "+1",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gt(0) && player.r.allotted.breeders.gte(1) },
            onClick() { 
                player.r.allotted.farmers = player.r.allotted.farmers.plus(1);
                player.r.points = player.r.points.sub(1).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        13: {
            title: "+1",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gt(0) && player.r.allotted.breeders.gte(1) },
            onClick() { 
                player.r.allotted.builders = player.r.allotted.builders.plus(1);
                player.r.points = player.r.points.sub(1).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        14: {
            title: "+1",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gt(0) && player.r.allotted.breeders.gte(1) },
            onClick() { 
                player.r.allotted.growers = player.r.allotted.growers.plus(1);
                player.r.points = player.r.points.sub(1).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        15: {
            title: "+1",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gt(0) },
            onClick() { 
                player.r.allotted.producers = player.r.allotted.producers.plus(1);
                player.r.points = player.r.points.sub(1).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        16: {
            title: "分配",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gte(5) && player.r.allotted.breeders.gte(1) },
            onClick() { 
                let spendEach = player.r.points.div(5).floor()
                player.r.allotted.breeders = player.r.allotted.breeders.plus(spendEach);
                player.r.allotted.farmers = player.r.allotted.farmers.plus(spendEach);
                player.r.allotted.builders = player.r.allotted.builders.plus(spendEach);
                player.r.allotted.growers = player.r.allotted.growers.plus(spendEach);
                player.r.allotted.producers = player.r.allotted.producers.plus(spendEach);
                player.r.points = player.r.points.sub(spendEach.times(5)).max(0);
            },
            style: {width: "120px", height: "50px"},
        },
        21: {
            title: "50%",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gte(2) },
            onClick() { 
                let spend = player.r.points.div(2).floor();
                player.r.allotted.breeders = player.r.allotted.breeders.plus(spend);
                player.r.points = player.r.points.sub(spend).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        22: {
            title: "50%",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gte(2) && player.r.allotted.breeders.gte(1) },
            onClick() { 
                let spend = player.r.points.div(2).floor();
                player.r.allotted.farmers = player.r.allotted.farmers.plus(spend);
                player.r.points = player.r.points.sub(spend).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        23: {
            title: "50%",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gte(2) && player.r.allotted.breeders.gte(1) },
            onClick() { 
                let spend = player.r.points.div(2).floor();
                player.r.allotted.builders = player.r.allotted.builders.plus(spend);
                player.r.points = player.r.points.sub(spend).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        24: {
            title: "50%",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gte(2) && player.r.allotted.breeders.gte(1) },
            onClick() { 
                let spend = player.r.points.div(2).floor();
                player.r.allotted.growers = player.r.allotted.growers.plus(spend);
                player.r.points = player.r.points.sub(spend).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
        25: {
            title: "50%",
            unlocked() { return player.r.unlocked },
            canClick() { return player.r.unlocked && player.r.points.gte(2) },
            onClick() { 
                let spend = player.r.points.div(2).floor();
                player.r.allotted.producers = player.r.allotted.producers.plus(spend);
                player.r.points = player.r.points.sub(spend).max(0);
            },
            style: {width: "50px", height: "50px"},
        },
    },
    milestones: {
        0: {
            requirementDescription: "50 总机器人",
            done() { return player.r.total.gte(50) },
            effectDescription: "迷你机器人乘以能量和信号获取。",
        },
        1: {
            requirementDescription: "100 总机器人",
            done() { return player.r.total.gte(100) },
            effectDescription: "未选择能量依然生成（速度减缓 3x），总机器人乘以能量生成速度。",
        },
        2: {
            requirementDescription: "360 总机器人",
            done() { return player.r.total.gte(360) },
            effectDescription: "有效饲养者平方。",
        },
        3: {
            requirementDescription: "500 总机器人",
            done() { return player.r.total.gte(500) },
            effectDescription: "双倍机器人获取，当迷你机器人转变为机器人时，下一个迷你机器人的需求降低 0.5 等级，生产者效果提高 25%（叠加）。",
        },
        4: {
            unlocked() { return player.id.unlocked },
            requirementDescription: "2,000 总机器人",
            done() { return player.r.total.gte(2e3) },
            effectDescription: "三倍机器人获取，生产者效果乘以能量（有很多种的那个能量）生成和信号获取。",
        },
        5: {
            unlocked() { return hasUpgrade("ai", 21) },
            requirementDescription: "4,000,000 总机器人",
            done() { return player.r.total.gte(4e6) && hasUpgrade("ai", 21) },
            effectDescription: "自动分配你 10% 的机器人而并不实际消耗他们。",
        },
    },
})