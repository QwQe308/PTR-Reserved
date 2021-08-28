
/*
                    
bbbbbbbb            
b::::::b            
b::::::b            
b::::::b            
 b:::::b            
 b:::::bbbbbbbbb    
 b::::::::::::::bb  
 b::::::::::::::::b 
 b:::::bbbbb:::::::b
 b:::::b    b::::::b
 b:::::b     b:::::b
 b:::::b     b:::::b
 b:::::b     b:::::b
 b:::::bbbbbb::::::b
 b::::::::::::::::b 
 b:::::::::::::::b  
 bbbbbbbbbbbbbbbb   
                    
                    
                    
                    
                    
                    
                    
*/
addLayer("b", {
    name: "booster", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#6e64c4",
    requires() { return new Decimal(200).times((player.b.unlockOrder&&!player.b.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
    resource: "增幅器", // Name of prestige currency
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["p"],
    exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.75:1.25 }, // Prestige currency exponent
    base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:5 },
    gainMult() { 
        let mult = new Decimal(1);
        if (hasUpgrade("b", 23)) mult = mult.div(upgradeEffect("b", 23));
        if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
        return mult;
    },
    canBuyMax() { return hasMilestone("b", 1) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "按 B 进行增幅器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.p.unlocked},
    automate() {},
    resetsNothing() { return hasMilestone("t", 4)&&player.ma.current!="b" },
    addToBase() {
        let base = new Decimal(0);
        if (hasUpgrade("b", 12)) base = base.plus(upgradeEffect("b", 12));
        if (hasUpgrade("b", 13)) base = base.plus(upgradeEffect("b", 13));
        if (hasUpgrade("t", 11)) base = base.plus(upgradeEffect("t", 11));
        if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).b);
        if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
        if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
        if (hasUpgrade("t", 25)) base = base.plus(upgradeEffect("t", 25));
        return base;
    },
    effectBase() {
        let base = new Decimal(2);
        
        // ADD
        base = base.plus(tmp.b.addToBase);
        
        // MULTIPLY
        if (player.sb.unlocked) base = base.times(tmp.sb.effect);
        if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
        if (hasUpgrade("q", 34)) base = base.times(upgradeEffect("q", 34));
        if (player.m.unlocked) base = base.times(tmp.m.buyables[11].effect);
        if (hasUpgrade("b", 24) && player.i.buyables[12].gte(1)) base = base.times(upgradeEffect("b", 24));
        if (inChallenge("h", 12)) base = base.div(tmp.h.baseDiv12);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) base = base.times(tmp.t.effLimBaseMult);
        
        return base.pow(tmp.b.power);
    },
    power() {
        let power = new Decimal(1);
        if (player.m.unlocked) power = power.times(player.m.spellTimes[12].gt(0)?1.05:1);
        return power;
    },
    effect() {
        if ((!unl(this.layer))||inChallenge("ne", 11)) return new Decimal(1);
        return Decimal.pow(tmp.b.effectBase, player.b.points.plus(tmp.sb.spectralTotal)).max(0).times(hasUpgrade("p", 43)?tmp.q.enEff:1);
    },
    effectDescription() {
        return "增幅点数获取 "+format(tmp.b.effect)+"x"+(tmp.nerdMode?(inChallenge("ne", 11)?"\n (禁用)":("\n(每个 "+format(tmp.b.effectBase)+"x)")):"")
    },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("e", 0) && resettingLayer=="e") keep.push("milestones")
        if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("milestones")
        if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("milestones")
        if (hasMilestone("q", 0)) keep.push("milestones")
        if (hasMilestone("t", 2) || hasAchievement("a", 64)) keep.push("upgrades")
        if (hasMilestone("e", 2) && resettingLayer=="e") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
    },
    extraAmtDisplay() {
        if (tmp.sb.spectralTotal.eq(0)) return "";
        return "<h3 style='color: #8882ba; text-shadow: #7f78c4 0px 0px 10px;'> + "+formatWhole(tmp.sb.spectralTotal)+"</h3>"
    },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        pseudoUpgs: [],
        first: 0,
        auto: false,
    }},
    autoPrestige() { return (hasMilestone("t", 3) && player.b.auto)&&player.ma.current!="b" },
    increaseUnlockOrder: ["g"],
    milestones: {
        0: {
            requirementDescription: "8 增幅器",
            done() { return player.b.best.gte(8) || hasAchievement("a", 41) || hasAchievement("a", 71) },
            effectDescription: "重置时保留声望升级。",
        },
        1: {
            requirementDescription: "15 增幅器",
            done() { return player.b.best.gte(15) || hasAchievement("a", 71) },
            effectDescription: "允许最大购买增幅器。",
        },
    },
    upgrades: {
        rows: 3,
        cols: 4,
        11: {
            title: "BP 连击",
            description: "最多增幅器加成声望获取。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:3) },
            effect() { 
                let ret = player.b.best.sqrt().plus(1);
                if (hasUpgrade("b", 32)) ret = Decimal.pow(1.125, player.b.best).times(ret);
                if (hasUpgrade("s", 15)) ret = ret.pow(buyableEffect("s", 14).root(2.7));
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
                return ret;
            },
            unlocked() { return player.b.unlocked },
            effectDisplay() { return format(tmp.b.upgrades[11].effect)+"x" },
            formula() { 
                let base = "sqrt(x)+1"
                if (hasUpgrade("b", 32)) base = "(sqrt(x)+1)*(1.125^x)"
                let exp = new Decimal(1)
                if (hasUpgrade("s", 15)) exp = exp.times(buyableEffect("s", 14).root(2.7));
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
                if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) exp = exp.times(1.5);
                let f = exp.gt(1)?("("+base+")^"+format(exp)):base;
                return f;
            },
        },
        12: {
            title: "交叉污染",
            description: "生成器加成增幅器底数。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1250:7) },
            effect() {
                let ret = player.g.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                return ret;
            },
            unlocked() { return player.b.unlocked&&player.g.unlocked },
            effectDisplay() { return "+"+format(tmp.b.upgrades[12].effect) },
            formula() { 
                let exp = new Decimal(1);
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
                let f = "sqrt(log(x+1))"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
                if (exp.gt(1)) f = "("+f+")^"+format(exp);
                return f;
            },
        },
        13: {
            title: "PB 反转",
            description: "总声望加成增幅器底数。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1436:8) },
            effect() { 
                let ret = player.p.total.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1) 
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                return ret;
            },
            unlocked() { return player.b.unlocked&&player.b.best.gte(7) },
            effectDisplay() { return "+"+format(tmp.b.upgrades[13].effect) },
            formula() { 
                let exp = new Decimal(1)
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
                let f = "log(log(x+1)+1)"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
                if (exp.gt(1)) f = "("+f+")^"+format(exp);
                return f;
            },
        },
        14: {
            title: "元连击",
            description: "超级增幅器加成前三个增幅器升级，<b>BP 连击</b> 直接加成点数获取。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:2250) },
            pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 13) },
            pseudoReq: "需要: 30 超级增幅器。",
            pseudoCan() { return player.sb.points.gte(30) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.sb.points.plus(1) },
            effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
            formula: "x+1",
            style: {"font-size": "9px"},
        },
        21: {
            title: "生成 Z^2",
            description: "平方 GP 增益。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2000:9) },
            unlocked() { return hasUpgrade("b", 11) && hasUpgrade("b", 12) },
        },
        22: {
            title: "上到五楼",
            description: "GP 效果提升至 1.2 次幂。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2075:15) },
            unlocked() { return hasUpgrade("b", 12) && hasUpgrade("b", 13) },
        },
        23: {
            title: "一折",
            description: "点数降低增幅器价格。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:18) },
            effect() { 
                let ret = player.points.add(1).log10().add(1).pow(3.2);
                if (player.s.unlocked) ret = ret.pow(buyableEffect("s", 14));
                if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
                return ret;
            },
            unlocked() { return hasUpgrade("b", 21) || hasUpgrade("b", 22) },
            effectDisplay() { return "/"+format(tmp.b.upgrades[23].effect) },
            formula() { return "(log(x+1)+1)^"+(player.s.unlocked?format(buyableEffect("s", 14).times(3.2).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:1)):"3.2") },
        },
        24: {
            title: "增幅递归",
            description: "增幅器加成增幅器底数。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:2225) },
            pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 23) },
            pseudoReq: "需要: 无妖术下获得 2,150 增幅器",
            pseudoCan() { return player.b.points.gte(2150) && player.m.hexes.eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.b.points.plus(1).pow(500) },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
            formula: "(x+1)^500",
        },
        31: {
            title: "差的 BP 连击",
            description: "超级增幅器加成声望获取。",
            cost() { return tmp.h.costMult11b.times(103) },
            unlocked() { return hasAchievement("a", 41) },
            effect() { 
                let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
                return Decimal.pow(1e20, player.sb.points.pow(1.5)).pow(exp); 
            },
            effectDisplay() { return format(tmp.b.upgrades[31].effect)+"x" },
            formula() { 
                let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
                return "1e20^(x^1.5)"+(exp==1?"":("^"+format(exp)));
            },
        },
        32: {
            title: "好的 BP 连击",
            description() { return "<b>BP 连击</b> 使用更好的公式"+(tmp.nerdMode?" (sqrt(x+1) -> (1.125^x)*sqrt(x+1))":"")+"." },
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:111) },
            unlocked() { return hasAchievement("a", 41) },
        },
        33: {
            title: "更更多添加物",
            description: "超级增幅器加成 <b>更多添加物</b>。",
            cost() { return tmp.h.costMult11b.times(118) },
            unlocked() { return hasAchievement("a", 41) },
            effect() { return player.sb.points.times(player.sb.points.gte(4)?2.6:2).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1) },
            effectDisplay() { return format(tmp.b.upgrades[33].effect)+"x" },
            formula() { 
                let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1
                let f = "x*"+(player.sb.points.gte(4)?"2.6":"2")+"+1"
                if (exp==1) return f;
                else return "("+f+")^"+format(exp);
            },
        },
        34: {
            title: "不可度量",
            description: "夸张地加成 <b>声望增益</b> 至指数（不受软上限影响）。",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2021:2275) },
            pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 33) },
            pseudoReq: "需要: 1e15,000,000 声望在 <b>减产</b> 障碍中.",
            pseudoCan() { return player.p.points.gte("e1.5e7") && inChallenge("h", 42) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.i.points.plus(1).root(4) },
            effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
            formula: "(x+1)^0.25",
        },
    },
})
/*
                
                
                
                
                
                
ggggggggg   ggggg
g:::::::::ggg::::g
g:::::::::::::::::g
g::::::ggggg::::::gg
g:::::g     g:::::g 
g:::::g     g:::::g 
g:::::g     g:::::g 
g::::::g    g:::::g 
g:::::::ggggg:::::g 
g::::::::::::::::g 
gg::::::::::::::g 
gggggggg::::::g 
        g:::::g 
gggggg      g:::::g 
g:::::gg   gg:::::g 
g::::::ggg:::::::g 
gg:::::::::::::g  
ggg::::::ggg    
   gggggg       
*/
addLayer("g", {
    name: "generator", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#a3d9a5",
    requires() { return new Decimal(200).times((player.g.unlockOrder&&!player.g.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
    resource: "生成器", // Name of prestige currency
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["p"],
    exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1.25 }, // Prestige currency exponent
    base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2.5:5 },
    gainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("g", 22)) mult = mult.div(upgradeEffect("g", 22));
        if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
        return mult;
    },
    canBuyMax() { return hasMilestone("g", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "按 G 进行生成器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.p.unlocked},
    automate() {},
    resetsNothing() { return hasMilestone("s", 4)&&player.ma.current!="g" },
    effBase() {
        let base = new Decimal(2);
        
        // ADD
        if (hasUpgrade("g", 12)) base = base.plus(upgradeEffect("g", 12));
        if (hasUpgrade("g", 13)) base = base.plus(upgradeEffect("g", 13));
        if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).g);
        if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
        if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
        
        // MULTIPLY
        if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
        if (inChallenge("h", 12)) base = base.div(tmp.h.baseDiv12)
        if (player.sg.unlocked) base = base.times(tmp.sg.enEff)
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) base = base.times(tmp.t.effLimBaseMult);
        
        return base;
    },
    effect() {
        if ((!unl(this.layer))||inChallenge("ne", 11)) return new Decimal(0);
        let eff = Decimal.pow(this.effBase(), player.g.points.plus(tmp.sg.spectralTotal)).sub(1).max(0);
        if (hasUpgrade("g", 21)) eff = eff.times(upgradeEffect("g", 21));
        if (hasUpgrade("g", 25)) eff = eff.times(upgradeEffect("g", 25));
        if (hasUpgrade("t", 15)) eff = eff.times(tmp.t.enEff);
        if (hasUpgrade("s", 12)) eff = eff.times(upgradeEffect("s", 12));
        if (hasUpgrade("s", 13)) eff = eff.times(upgradeEffect("s", 13));
        if (player.q.unlocked) eff = eff.times(tmp.q.enEff);
        return eff;
    },
    effectDescription() {
        return "生成 "+format(tmp.g.effect)+" GP/sec"+(tmp.nerdMode?(inChallenge("ne", 11)?"\n (禁用)":("\n (每个 "+format(tmp.g.effBase)+"x)")):"")
    },
    extraAmtDisplay() {
        if (tmp.sg.spectralTotal.eq(0)) return "";
        return "<h3 style='color: #84b88a; text-shadow: #78c48f 0px 0px 10px;'> + "+formatWhole(tmp.sg.spectralTotal)+"</h3>"
    },
    update(diff) {
        if (player.g.unlocked) player.g.power = player.g.power.plus(tmp.g.effect.times(diff));
    },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        power: new Decimal(0),
        pseudoUpgs: [],
        first: 0,
        auto: false,
    }},
    autoPrestige() { return (hasMilestone("s", 3) && player.g.auto)&&player.ma.current!="g" },
    powerExp() {
        let exp = new Decimal(1/3);
        if (hasUpgrade("b", 21)) exp = exp.times(2);
        if (hasUpgrade("b", 22)) exp = exp.times(1.2);
        if (hasUpgrade("q", 13)) exp = exp.times(1.25);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.05);
        if (player.mc.upgrades.includes(11)) exp = exp.times(buyableEffect("mc", 12));
        if (hasAchievement("a", 152)) exp = exp.times(1.4);
        return exp;
    },
    powerEff() {
        if (!unl(this.layer)) return new Decimal(1);
        return player.g.power.plus(1).pow(this.powerExp());
    },
    doReset(resettingLayer) {
        let keep = [];
        player.g.power = new Decimal(0);
        if (hasMilestone("e", 0) && resettingLayer=="e") keep.push("milestones")
        if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("milestones")
        if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("milestones")
        if (hasMilestone("q", 0)) keep.push("milestones")
        if (hasMilestone("s", 2) || hasAchievement("a", 64)) keep.push("upgrades")
        if (hasMilestone("e", 2) && resettingLayer=="e") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("g", keep)
    },
    tabFormat: ["main-display",
        "prestige-button",
        "blank",
        ["display-text",
            function() {return '你有 ' + format(player.g.power) + ' GP，增幅点数获取 '+format(tmp.g.powerEff)+'x'+(tmp.nerdMode?" ((x+1)^"+format(tmp.g.powerExp)+")":"")},
                {}],
        "blank",
        ["display-text",
            function() {return '你最多拥有 ' + formatWhole(player.g.best) + ' 生成器<br>你总共拥有 '+formatWhole(player.g.total)+" 生成器"},
                {}],
        "blank",
        "milestones", "blank", "blank", "upgrades"],
    increaseUnlockOrder: ["b"],
    milestones: {
        0: {
            requirementDescription: "8 生成器",
            done() { return player.g.best.gte(8) || hasAchievement("a", 41) || hasAchievement("a", 71) },
            effectDescription: "重置时保留声望升级。",
        },
        1: {
            requirementDescription: "10 生成器",
            done() { return player.g.best.gte(10) || hasAchievement("a", 71) },
            effectDescription: "每秒获得 100% 的威望。",
        },
        2: {
            requirementDescription: "15 生成器",
            done() { return player.g.best.gte(15) || hasAchievement("a", 71) },
            effectDescription: "允许最大购买生成器。",
        },
    },
    upgrades: {
        rows: 3,
        cols: 5,
        11: {
            title: "GP 连击",
            description: "最多生成器加成声望获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?380:3) },
            effect() { return player.g.best.sqrt().plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5e5:1) },
            unlocked() { return player.g.unlocked },
            effectDisplay() { return format(tmp.g.upgrades[11].effect)+"x" },
            formula() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"(x+1)^250,000":"sqrt(x)+1" },
        },
        12: {
            title: "给我更多！",
            description: "增幅器加成生成器底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?375:7) },
            effect() { 
                let ret = player.b.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
                if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
                return ret;
            },
            unlocked() { return player.b.unlocked&&player.g.unlocked },
            effectDisplay() { return "+"+format(tmp.g.upgrades[12].effect) },
            formula() { 
                let m = new Decimal(hasUpgrade("e", 14)?upgradeEffect("e", 14):1).div(3)
                if (hasUpgrade("s", 24)) m = upgradeEffect("s", 24).times(m);
                return "sqrt(log(x+1))"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
            },
        },
        13: {
            title: "给我更多 II",
            description: "最多声望加成生成器底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?381:8) },
            effect() { 
                let ret = player.p.best.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
                if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
                return ret;
            },
            unlocked() { return player.g.best.gte(8) },
            effectDisplay() { return "+"+format(tmp.g.upgrades[13].effect) },
            formula() { 
                let m = new Decimal(hasUpgrade("e", 14)?upgradeEffect("e", 14):1).div(3)
                if (hasUpgrade("s", 24)) m = upgradeEffect("s", 24).times(m);
                return "log(log(x+1)+1)"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
            },
        },
        14: {
            title: "增益增益",
            description() { return "<b>声望增益</b> 的效果提升至 1.5 次幂。" },
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?378:13) },
            unlocked() { return player.g.best.gte(10) },
        },
        15: {
            title: "外部协同",
            description: "生成器加成 <b>自协同</b> 效果。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?382:15) },
            effect() { 
                let eff = player.g.points.sqrt().add(1);
                if (eff.gte(400)) eff = eff.cbrt().times(Math.pow(400, 2/3))
                return eff;
            },
            unlocked() { return hasUpgrade("g", 13) },
            effectDisplay() { return "^"+format(tmp.g.upgrades[15].effect) },
            formula() { return upgradeEffect("g", 15).gte(400)?"((x+1)^(1/6))*(400^(2/3))":"sqrt(x)+1" },
        },
        21: {
            title: "给我更多 III",
            description: "GP 加成 GP 获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e314":1e10) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            effect() { 
                let ret = player.g.power.add(1).log10().add(1);
                if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) ret = ret.pow(1e4)
                return ret;
            },
            unlocked() { return hasUpgrade("g", 15) },
            effectDisplay() { return format(tmp.g.upgrades[21].effect)+"x" },
            formula() { 
                let exp = new Decimal(1);
                if (hasUpgrade("s", 24)) exp = exp.times(upgradeEffect("s", 24));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1e4);
                let f = "log(x+1)+1";
                if (exp.gt(1)) f = "("+f+")^"+format(exp);
                return f;
            },
        },
        22: {
            title: "两折",
            description: "声望降低生成器价格。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"5e47141":1e11) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            effect() { 
                let eff = player.p.points.add(1).pow(0.25);
                if (hasUpgrade("g", 32) && player.i.buyables[12].gte(2)) eff = eff.pow(upgradeEffect("g", 32));
                return eff;
            },
            unlocked() { return hasUpgrade("g", 15) },
            effectDisplay() { return "/"+format(tmp.g.upgrades[22].effect) },
            formula: "(x+1)^0.25",
        },
        23: {
            title: "双重反转",
            description: "增幅器加成 <b>反转声望增益</b> 效果。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"2e47525":1e12) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            effect() { return player.b.points.pow(0.85).add(1) },
            unlocked() { return hasUpgrade("g", 15)&&player.b.unlocked },
            effectDisplay() { return "^"+format(tmp.g.upgrades[23].effect) },
            formula: "x^0.85+1",
        },
        24: {
            title: "再次增益增益",
            description: "<b>声望增益</b> 的效果提升至 1.467 次幂。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?690:20) },
            unlocked() { return hasUpgrade("g", 14)&&(hasUpgrade("g", 21)||hasUpgrade("g", 22)) },
        },
        25: {
            title: "给我更多 IV",
            description: "声望加成 GP 获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47526":1e14) },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            effect() { 
                let ret = player.p.points.add(1).log10().pow(3).add(1);
                if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
                return ret;
            },
            unlocked() { return hasUpgrade("g", 23)&&hasUpgrade("g", 24) },
            effectDisplay() { return format(tmp.g.upgrades[25].effect)+"x" },
            formula() { 
                let f = "log(x+1)^3+1";
                if (hasUpgrade("s", 24)) f = "("+f+")^"+format(upgradeEffect("s", 24));
                return f;
            },
        },
        31: {
            title: "荒诞生成器",
            description: "GP 加成超级生成器底数。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47545":"e4.4e7") },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
            pseudoReq: "需要: 无 GP 达到 e73,600,000 声望（使用增强重置）。",
            pseudoCan() { return player.p.points.gte("e7.35e7") && player.g.power.eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.g.power.plus(1).log10().plus(1).pow(2) },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
            formula: "(log(x+1)+1)^2",
        },
        32: {
            title: "原始本能",
            description: "<b>第四建筑</b> 加成 <b>二折</b>。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1260:2200) },
            pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
            pseudoReq: "需要: 无增幅器达到 e47,500,000 GP（使用增强重置)",
            pseudoCan() { return player.g.power.gte("e4.75e7") && player.b.best.eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return buyableEffect("s", 14).pow(0.8) },
            effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
            formula: "eff^0.8",
            style: {"font-size": "9px"},
        },
        33: {
            title: "星尘生产",
            description: "生成器加成星尘获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e48000":"e5.6e7") },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
            pseudoReq: "需要: 1e14 星云",
            pseudoCan() { return player.n.points.gte(1e14) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return Decimal.pow(1.15, player.g.points.sqrt()) },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
            formula: "1.15^sqrt(x)",
        },
        34: {
            title: "增益增益^2",
            description: "<b>声望增益</b> 的效果提升至 1.433 次幂",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1257:2200) },
            pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
            pseudoReq: "需要: 36 成就。",
            pseudoCan() { return player.a.achievements.length>=36 },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
        },
        35: {
            title: "进入未来",
            description: "GP 加成星云、荣耀、超空间能量获取。",
            cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47540":"e4.4e7") },
            currencyDisplayName: "GP",
            currencyInternalName: "power",
            currencyLayer: "g",
            pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
            pseudoReq: "需要: 5e18 荣耀 & 5e17 超空间能量。",
            pseudoCan() { return player.hn.points.gte(5e18) && player.hs.points.gte(5e17) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.g.power.plus(1).log10().plus(1).sqrt() },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
            formula: "sqrt(log(x+1)+1)",
        },
    },
})