/*
                               
ppppp   ppppppppp   
p::::ppp:::::::::p  
p:::::::::::::::::p 
pp::::::ppppp::::::p
 p:::::p     p:::::p
 p:::::p     p:::::p
 p:::::p     p:::::p
 p:::::p    p::::::p
 p:::::ppppp:::::::p
 p::::::::::::::::p 
 p::::::::::::::pp  
 p::::::pppppppp    
 p:::::p            
 p:::::p            
p:::::::p           
p:::::::p           
p:::::::p           
ppppppppp           
                    
*/

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#31aeb0",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "声望", // Name of prestige currency
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.75:0.5 }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasAchievement("a", 13)) mult = mult.times(1.1);
        if (hasAchievement("a", 32)) mult = mult.times(2);
        if (hasUpgrade("p", 21)) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e50:1.8);
        if (hasUpgrade("p", 23)) mult = mult.times(upgradeEffect("p", 23));
        if (hasUpgrade("p", 41)) mult = mult.times(upgradeEffect("p", 41));
        if (hasUpgrade("b", 11)) mult = mult.times(upgradeEffect("b", 11));
        if (hasUpgrade("g", 11)) mult = mult.times(upgradeEffect("g", 11));
        if (player.t.unlocked) mult = mult.times(tmp.t.enEff);
        if (player.e.unlocked) mult = mult.times(tmp.e.buyables[11].effect.first);
        if (player.s.unlocked) mult = mult.times(buyableEffect("s", 11));
        if (hasUpgrade("e", 12)) mult = mult.times(upgradeEffect("e", 12));
        if (hasUpgrade("b", 31)) mult = mult.times(upgradeEffect("b", 31));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (hasUpgrade("p", 31)) exp = exp.times(1.05);
        return exp;
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "按 P 进行声望重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return false},
    passiveGeneration() { return (hasMilestone("g", 1)&&player.ma.current!="p")?1:0 },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("b", 0) && resettingLayer=="b") keep.push("upgrades")
        if (hasMilestone("g", 0) && resettingLayer=="g") keep.push("upgrades")
        if (hasMilestone("e", 1) && resettingLayer=="e") keep.push("upgrades")
        if (hasMilestone("t", 1) && resettingLayer=="t") keep.push("upgrades")
        if (hasMilestone("s", 1) && resettingLayer=="s") keep.push("upgrades")
        if (hasAchievement("a", 41)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
    },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        pseudoUpgs: [],
        first: 0,
    }},
    upgrades: {
        rows: 4,
        cols: 4,
        11: {
            title: "开始",
            description: "每秒获得 1 点数。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1).pow(tmp.h.costExp11) },
        },
        12: {
            title: "声望增益",
            description: "声望加成点数获取。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?10:1).pow(tmp.h.costExp11) },
            effect() {
                if (inChallenge("ne", 11)) return new Decimal(1);
                
                let eff = player.p.points.plus(2).pow(0.5);
                if (hasUpgrade("g", 14)) eff = eff.pow(1.5);
                if (hasUpgrade("g", 24)) eff = eff.pow(1.4666667);
                if (hasUpgrade("g", 34) && player.i.buyables[12].gte(2)) eff = eff.pow(1.4333333)
                
                if (hasChallenge("h", 22)) eff = softcap("p12_h22", eff);
                else eff = softcap("p12", eff);
                
                if (hasUpgrade("p", 14)) eff = eff.pow(3);
                if (hasUpgrade("hn", 14)) eff = eff.pow(1.05);
                if (hasUpgrade("b", 34) && player.i.buyables[12].gte(1)) eff = eff.pow(upgradeEffect("b", 34));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(1.1);
                
                return eff;
            },
            unlocked() { return hasUpgrade("p", 11) },
            effectDisplay() { return format(tmp.p.upgrades[12].effect)+"x" },
            formula() { 
                if (inChallenge("ne", 11)) return "DISABLED";
            
                let exp = new Decimal(0.5*(hasUpgrade("g", 14)?1.5:1)*(hasUpgrade("g", 24)?1.4666667:1));
                if (hasUpgrade("g", 34) && player.i.buyables[12].gte(2)) exp = exp.times(1.4333333);
                if (hasUpgrade("b", 34) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 34));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.1);
                let f = "(x+2)^"+format(exp)
                if (upgradeEffect("p", 12).gte("1e3500")) {
                    if (hasChallenge("h", 22)) f = "10^(sqrt(log(x+2))*"+format(Decimal.mul(exp, 3500).sqrt())+")"
                    else f = "log(x+2)*"+format(Decimal.div("1e3500",3500).times(exp))
                }
                if (hasUpgrade("p", 14)) f += "^"+(hasUpgrade("hn", 14)?3.15:3)
                return f;
            },
        },
        13: {
            title: "自协同",
            description: "点数加成点数获取。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?50:5).pow(tmp.h.costExp11) },
            effect() { 
                let eff = player.points.plus(1).log10().pow(0.75).plus(1);
                if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
                if (hasUpgrade("g", 15)) eff = eff.pow(upgradeEffect("g", 15));
                if (hasUpgrade("hn", 13)) eff = eff.pow(upgradeEffect("hn", 13));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(75);
                return eff;
            },
            unlocked() { return hasUpgrade("p", 12) },
            effectDisplay() { return format(tmp.p.upgrades[13].effect)+"x" },
            formula() { 
                let exp = new Decimal(1);
                if (hasUpgrade("p", 33)) exp = exp.times(upgradeEffect("p", 33));
                if (hasUpgrade("g", 15)) exp = exp.times(upgradeEffect("g", 15));
                if (hasUpgrade("hn", 13)) exp = exp.times(upgradeEffect("hn", 13));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(75);
                return "(log(x+1)^0.75+1)"+(exp.gt(1)?("^"+format(exp)):"")
            },
        },
        14: {
            title: "声望强度",
            description: "<b>声望增益</b> 效果提升至立方（不受软上限影响）。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e589":"1e4070000").pow(tmp.h.costExp11) },
            pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 13) },
            pseudoReq: '需要: 在 "减产" 中达到 1e168,000 声望',
            pseudoCan() { return player.p.points.gte("1e168000")&&inChallenge("h", 42) },
            unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
        },
        21: {
            title: "更多声望",
            description() { return "声望获取增加了 "+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e52":"80")+"%。" },
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e171:20).pow(tmp.h.costExp11) },
            unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 11) },
        },
        22: {
            title: "力量升级",
            description: "点数获取基于你已购买的声望升级更快。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e262:75).pow(tmp.h.costExp11) },
            effect() {
                let eff = Decimal.pow(1.4, player.p.upgrades.length);
                if (hasUpgrade("p", 32)) eff = eff.pow(2);
                if (hasUpgrade("hn", 22)) eff = eff.pow(upgradeEffect("hn", 22))
                if (hasUpgrade("hn", 32)) eff = eff.pow(7);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(40);
                return eff;
            },
            unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 12) },
            effectDisplay() { return format(tmp.p.upgrades[22].effect)+"x" },
            formula() { 
                let exp = new Decimal(hasUpgrade("p", 32)?2:1);
                if (hasUpgrade("hn", 22)) exp = exp.times(upgradeEffect("hn", 22));
                if (hasUpgrade("hn", 32)) exp = exp.times(7);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(40);
                return exp.gt(1)?("(1.4^x)^"+format(exp)):"1.4^x" 
            },
        },
        23: {
            title: "反转声望增益",
            description: "点数加成声望获取。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e305:5e3).pow(tmp.h.costExp11) },
            effect() {
                let eff = player.points.plus(1).log10().cbrt().plus(1);
                if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
                if (hasUpgrade("g", 23)) eff = eff.pow(upgradeEffect("g", 23));
                if (hasUpgrade("hn", 23)) eff = eff.pow(upgradeEffect("hn", 23));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(1.5);
                return eff;
            },
            unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 13) },
            effectDisplay() { return format(tmp.p.upgrades[23].effect)+"x" },
            formula() { 
                let exp = new Decimal(1);
                if (hasUpgrade("p", 33)) exp = exp.times(upgradeEffect("p", 33));
                if (hasUpgrade("g", 23)) exp = exp.times(upgradeEffect("g", 23));
                if (hasUpgrade("hn", 23)) exp = exp.times(upgradeEffect("hn", 23));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.5);
                return exp.gt(1)?("(log(x+1)^(1/3)+1)^"+format(exp)):"log(x+1)^(1/3)+1"
            },
        },
        24: {
            title: "质能",
            description: "差旋层电浆效果使用更好的公式 (log(log(x+1)+1)*10+1 -> 10^cbrt(log(x+1)))。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11435":"e5070000").pow(tmp.h.costExp11) },
            pseudoUnl() { return hasUpgrade("hn", 11) && (hasUpgrade("p", 14)||hasUpgrade("p", 23)) },
            pseudoReq: "需要: 41,250 恶魂（无幽灵）",
            pseudoCan() { return player.ps.souls.gte(41250) && player.ps.buyables[11].eq(0) },
            unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
            style: {"font-size": "9px" },
        },
        31: {
            title: "我们需要更多声望",
            description: "声望获取提升至 1.05 次幂。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e316":1e45).pow(tmp.h.costExp11) },
            unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 21) },
        },
        32: {
            title: "仍旧无用",
            description: "平方 <b>力量升级</b> 效果。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e355":1e56).pow(tmp.h.costExp11) },
            unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 22) },
        },
        33: {
            title: "列长",
            description: "总声望加成上面两个升级的效果",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e436":1e60).pow(tmp.h.costExp11) },
            effect() { return player.p.total.plus(1).log10().plus(1).log10().div(5).plus(1).times(hasUpgrade("hn", 33) ? upgradeEffect("hn", 33) : 1) },
            unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 23) },
            effectDisplay() { return "^"+format(tmp.p.upgrades[33].effect) },
            formula() { return hasUpgrade("hn", 33) ? ("(log(log(x+1)+1)/5+1)*"+format(upgradeEffect("hn", 33))) : "log(log(x+1)+1)/5+1" },
        },
        34: {
            title: "阳光潜能",
            description: "阳光加成阳光获取。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11467":"ee7").pow(tmp.h.costExp11) },
            pseudoUnl() { return hasUpgrade("hn", 11) && (hasUpgrade("p", 24)||hasUpgrade("p", 33)) },
            pseudoReq: "需要: 30 成就",
            pseudoCan() { return player.a.achievements.length>=30 },
            unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.o.points.plus(1).log10().plus(1).log10().plus(1).log10().plus(1).times((hasUpgrade("hn", 34)) ? upgradeEffect("hn", 34) : 1) },
            effectDisplay() { return format(tmp.p.upgrades[34].effect)+"x" },
            formula: "log(log(log(x+1)+1)+1)+1",
        },
        41: {
            title: "声望递归",
            description: "声望加成声望获取。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e9570":"1e4460000").pow(tmp.h.costExp11) },
            pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 31) },
            pseudoReq: "需要: 25 总荣耀",
            pseudoCan() { return player.hn.total.gte(25) },
            unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
            effect() { 
                let eff = Decimal.pow(10, player.p.points.plus(1).log10().pow(.8));
                if (hasUpgrade("hn", 41)) eff = eff.pow(upgradeEffect("hn", 41));
                return eff;
            },
            effectDisplay() { return format(tmp.p.upgrades[41].effect)+"x" },
            formula() { return "10^(log(x+1)^0.8)"+(hasUpgrade("hn", 41)?("^"+format(upgradeEffect("hn", 41))):"") },
        },
        42: {
            title: "空间感知",
            description: "建筑价格减缓 50%。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11445":"e5960000").pow(tmp.h.costExp11) },
            pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 32) },
            pseudoReq: "需要: 1e100 阳光",
            pseudoCan() { return player.o.points.gte(1e100) },
            unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
        },
        43: {
            title: "增幅器潜能",
            description: "QE 加成增幅器效果。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11467":"e8888888").pow(tmp.h.costExp11) },
            pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 33) },
            pseudoReq: "需要: e10,000,000 点数",
            pseudoCan() { return player.points.gte("ee7") },
            unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
        },
        44: {
            title: "法术词典",
            description: "增幅器推迟前两个魔法的软上限。",
            cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11456":"e6500000").pow(tmp.h.costExp11) },
            pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 33) },
            pseudoReq: "需要: 150,000 第一建筑",
            pseudoCan() { return player.s.buyables[11].gte(1.5e5) },
            unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.b.points.plus(1).pow(3) },
            effectDisplay() { return format(tmp.p.upgrades[44].effect)+"x 延后" },
            formula: "(x+1)^3",
            style: {"font-size": "9px"},
        },
    },
})