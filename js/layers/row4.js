
/*
                        
                        
                        
                        
                        
                        
   mmmmmmm    mmmmmmm   
 mm:::::::m  m:::::::mm 
m::::::::::mm::::::::::m
m::::::::::::::::::::::m
m:::::mmm::::::mmm:::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
mmmmmm   mmmmmm   mmmmmm
                        
                        
                        
                        
                        
                        
                        
*/
addLayer("m", {
    name: "magic", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        spellTimes: {
            11: new Decimal(0),
            12: new Decimal(0),
            13: new Decimal(0),
            14: new Decimal(0),
            15: new Decimal(0),
            16: new Decimal(0),
        },
        spellInputs: {
            11: new Decimal(1),
            12: new Decimal(1),
            13: new Decimal(1),
            14: new Decimal(1),
            15: new Decimal(1),
            16: new Decimal(1),
        },
        spellInput: "1",
        distrAll: false,
        hexes: new Decimal(0),
        auto: false,
        first: 0,
    }},
    color: "#eb34c0",
    requires: new Decimal(1e285), // Can be a function that takes requirement increases into account
    resource: "魔法", // Name of prestige currency
    baseResource: "障碍灵魂", // Name of resource prestige is based on
    baseAmount() {return player.h.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.0085:0.007) }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasAchievement("a", 74)) mult = mult.times(challengeEffect("h", 32));
        return mult.times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.purpleBlue:new Decimal(1));
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "按 M 进行魔法重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        if (hasMilestone("hn", 0)) keep.push("milestones")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    passiveGeneration() { return (hasMilestone("hn", 1)&&player.ma.current!="m")?1:0 },
    layerShown(){return player.h.unlocked&&player.o.unlocked },
    branches: ["o","h","q"],
    spellTime() { 
        let time = new Decimal(60);
        if (hasMilestone("m", 3)) time = time.times(tmp.m.spellInputAmt.div(100).plus(1).log10().plus(1));
        return time;
    },
    spellPower() { 
        if (!unl(this.layer)) return new Decimal(0);
        let power = new Decimal(1);
        if (tmp.ps.impr[21].unlocked) power = power.plus(tmp.ps.impr[21].effect.sub(1));
        if (player.n.buyables[11].gte(3)) power = power.plus(buyableEffect("o", 31));
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) power = power.plus(.5);
        return power;
    },
    hexGain() { 
        let gain = new Decimal(1);
        if (tmp.ps.impr[12].unlocked) gain = gain.times(tmp.ps.impr[12].effect);
        return gain;
    },
    mainHexEff() { return player.m.hexes.times(2).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5:10) },
    hexEff() { return softcap("hex", tmp.m.mainHexEff) },
    update(diff) {
        if (!player.m.unlocked) return;
        if (player.m.auto && hasMilestone("hn", 2) && player.m.distrAll && player.ma.current!="m") layers.m.castAllSpells(true, diff);
        for (let i=11;i<=(10+tmp.m.spellsUnlocked);i++) {
            if (tmp.m.buyables[i].unlocked && player.m.auto && hasMilestone("hn", 2) && (!player.m.distrAll||tmp.t.effect2.gt(1)) && player.ma.current!="m") {
                player.m.spellInputs[i] = (player.m.spellTimes[i].gt(0)?player.m.spellInputs[i].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(player.m.spellInputs[i]).times(diff)));
                player.m.spellTimes[i] = tmp.m.spellTime;
            } else if (player.m.spellTimes[i].gt(0)) player.m.spellTimes[i] = player.m.spellTimes[i].sub(diff).max(0);
        }
    },
    spellInputAmt() {
        if (hasMilestone("m", 3) && player.m.spellInput!="1") {
            let factor = new Decimal(player.m.spellInput.split("%")[0]).div(100);
            return player.m.points.times(factor.max(0.01)).floor().max(1);
        } else return new Decimal(1);
    },
    hexEffDesc() {
        let nerd = (tmp.nerdMode?" (2*x+1)^5":"")
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) return "增幅障碍灵魂、诡异和 SE 获取 "+format(tmp.m.mainHexEff)+"x，并增幅子空间获取 "+format(tmp.m.hexEff) + "x" + nerd
        else return "增幅障碍灵魂、诡异、 SE 和子空间获取 "+format(tmp.m.hexEff)+"x"+nerd
    },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "milestones",
        "blank",
        ["display-text", function() { return tmp.m.spellPower.eq(1)?"":("魔法强度: "+format(tmp.m.spellPower.times(100))+"%") }], "blank",
        "buyables",
        ["display-text",
            function() {return "你有 "+formatWhole(player.m.hexes)+" 妖术, "+tmp.m.hexEffDesc },
                {}],
    ],
    spellsUnlocked() { return 3+player.i.buyables[13].toNumber() },
    castAllSpells(noSpend=false, diff=1) {
        let cost = tmp.m.spellInputAmt;
        let input = tmp.m.spellInputAmt.div(tmp.m.spellsUnlocked);
        for (let i=11;i<=(10+tmp.m.spellsUnlocked);i++) {
            player.m.spellInputs[i] = (player.m.spellTimes[i].gt(0)?player.m.spellInputs[i].max(input):input);
            player.m.spellTimes[i] = tmp.m.spellTime;
        }
        if (!noSpend) player.m.points = player.m.points.sub(cost)
        player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost).times(diff)))
    },
    buyables: {
        rows: 1,
        cols: 6,
        11: {
            title: "装载增幅器",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return tmp.m.spellInputAmt;
            },
            effect() {
                let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
                if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
                let eff = power.div(2).plus(1)
                if (hasUpgrade("ba", 31)) eff = Decimal.pow(1.1, power).times(eff);
                eff = softcap("spell1", eff);
                return eff.div(1.5).max(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = "效果: 增幅器底数提升至 ^1.05 次幂， x" + format(data.effect)+"\n\
                时间: "+formatTime(player.m.spellTimes[this.id]||0);
                if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: ((log(inserted+1)+1)/2+1)/1.5"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() { 
                if (player.m.distrAll && hasMilestone("m", 4)) {
                    layers.m.castAllSpells();
                    return;
                }
                cost = tmp[this.layer].buyables[this.id].cost
                player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                player.m.points = player.m.points.sub(cost)
                player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
                player.m.spellTimes[this.id] = tmp.m.spellTime;
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'150px', 'width':'150px'},
        },
        12: {
            title: "时间折跃",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
              return tmp.m.spellInputAmt;
            },
            effect() {
                let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
                if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
                let eff = power.div(5).plus(1)
                if (hasUpgrade("ba", 31)) eff = Decimal.pow(1.1, power).times(eff);
                eff = softcap("spell2", eff);
                return eff.div(1.2).max(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = "效果: 时间胶囊底数提升至 ^1.1 次幂， x" + format(data.effect)+"\n\
                时间: "+formatTime(player.m.spellTimes[this.id]||0);
                if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: ((log(inserted+1)+1)/5+1)/1.2"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() { 
                if (player.m.distrAll && hasMilestone("m", 4)) {
                    layers.m.castAllSpells();
                    return;
                }
                cost = tmp[this.layer].buyables[this.id].cost
                player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                player.m.points = player.m.points.sub(cost)
                player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
                player.m.spellTimes[this.id] = tmp.m.spellTime;
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'150px', 'width':'150px'},
        },
        13: {
            title: "诡异聚焦",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return tmp.m.spellInputAmt;
            },
            effect() {
                let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
                if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
                let eff = power.times(1.25)
                eff = softcap("spell3", eff);
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = "效果: +" + format(data.effect)+" 个免费诡异层\n\
                时间: "+formatTime(player.m.spellTimes[this.id]||0);
                if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: (log(inserted+1)+1)*1.25"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() { 
                if (player.m.distrAll && hasMilestone("m", 4)) {
                    layers.m.castAllSpells();
                    return;
                }
                cost = tmp[this.layer].buyables[this.id].cost
                player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                player.m.points = player.m.points.sub(cost)
                player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
                player.m.spellTimes[this.id] = tmp.m.spellTime;
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'150px', 'width':'150px'},
        },
        14: {
            title: "空间压缩",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return tmp.m.spellInputAmt;
            },
            effect() {
                let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
                if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
                let eff = Decimal.sub(1, Decimal.div(1, power.plus(1).log10().div(500).plus(1).sqrt()));
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = "效果: 建筑价格缩放减缓 " + format(data.effect.times(100))+"%\n\
                时间: "+formatTime(player.m.spellTimes[this.id]||0);
                if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: 1-1/sqrt(log(log(inserted+1)+1)/500+1)"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(1) }, 
            canAfford() {
                return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() { 
                if (player.m.distrAll && hasMilestone("m", 4)) {
                    layers.m.castAllSpells();
                    return;
                }
                cost = tmp[this.layer].buyables[this.id].cost
                player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                player.m.points = player.m.points.sub(cost)
                player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
                player.m.spellTimes[this.id] = tmp.m.spellTime;
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'150px', 'width':'150px'},
        },
        15: {
            title: "超越阻碍",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return tmp.m.spellInputAmt;
            },
            effect() {
                let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
                if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
                let eff = Decimal.sub(1, Decimal.div(1, power.plus(1).log10().times(140).plus(1).sqrt()));
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = "效果: 可重复障碍的需求缩放减缓 " + format(data.effect.times(100))+"%\n\
                时间: "+formatTime(player.m.spellTimes[this.id]||0);
                if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: 1-1/sqrt(log(log(inserted+1)+1)*140+1)"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(2) }, 
            canAfford() {
                return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() { 
                if (player.m.distrAll && hasMilestone("m", 4)) {
                    layers.m.castAllSpells();
                    return;
                }
                cost = tmp[this.layer].buyables[this.id].cost
                player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                player.m.points = player.m.points.sub(cost)
                player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
                player.m.spellTimes[this.id] = tmp.m.spellTime;
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'150px', 'width':'150px'},
        },
        16: {
            title: "生成器扩容",
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
               return tmp.m.spellInputAmt;
            },
            effect() {
                let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
                if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
                let eff = power.plus(1).pow(400);
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = "效果: 超级生成器底数乘以 " + format(data.effect)+"\n\
                时间: "+formatTime(player.m.spellTimes[this.id]||0);
                if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: (log(inserted+1)+1)^400"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
                return display;
            },
            unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(3) }, 
            canAfford() {
                return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() { 
                if (player.m.distrAll && hasMilestone("m", 4)) {
                    layers.m.castAllSpells();
                    return;
                }
                cost = tmp[this.layer].buyables[this.id].cost
                player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                player.m.points = player.m.points.sub(cost)
                player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
                player.m.spellTimes[this.id] = tmp.m.spellTime;
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'150px', 'width':'150px'},
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 总魔法",
            done() { return player.m.total.gte(2) || (hasMilestone("hn", 0)) },
            effectDescription: "每秒获取 100% 阳光和阳光购买项。",
        },
        1: {
            requirementDescription: "3 总魔法",
            done() { return player.m.total.gte(3) || (hasMilestone("hn", 0)) },
            effectDescription: '对任何重置保留已完成的障碍。',
        },
        2: {
            requirementDescription: "10 总魔法",
            done() { return player.m.total.gte(10) || (hasMilestone("hn", 0)) },
            effectDescription: "每秒获取 100% 障碍灵魂。",
        },
        3: {
            requirementDescription: "5,000 总魔法",
            done() { return player.m.total.gte(5e3) || (hasMilestone("hn", 0)) },
            effectDescription: "你可以插入更多魔法来使它们更长更强。",
            toggles: [{
                layer: "m",
                varName: "spellInput",
                options: ["1","10%","50%","100%"],
            }],
        },
        4: {
            unlocked() { return hasMilestone("m", 3) },
            requirementDescription: "1e10 总魔法",
            done() { return player.m.total.gte(1e10) || (hasMilestone("hn", 0)) },
            effectDescription: "释放一个魔法时，同时释放其他魔法（魔法消耗是分散的）。",
            toggles: [["m", "distrAll"]],
        },
    },
})
/*
                                  
bbbbbbbb                              
b::::::b                              
b::::::b                              
b::::::b                              
b:::::b                              
b:::::bbbbbbbbb      aaaaaaaaaaaaa   
b::::::::::::::bb    a::::::::::::a  
b::::::::::::::::b   aaaaaaaaa:::::a 
b:::::bbbbb:::::::b           a::::a 
b:::::b    b::::::b    aaaaaaa:::::a 
b:::::b     b:::::b  aa::::::::::::a 
b:::::b     b:::::b a::::aaaa::::::a 
b:::::b     b:::::ba::::a    a:::::a 
b:::::bbbbbb::::::ba::::a    a:::::a 
b::::::::::::::::b a:::::aaaa::::::a 
b:::::::::::::::b   a::::::::::aa:::a
bbbbbbbbbbbbbbbb     aaaaaaaaaa  aaaa
                                  
                                  
                                  
                                  
                                  
                                  
                                  
*/
addLayer("ba", {
    name: "balance", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        allotted: 0.5,
        pos: new Decimal(0),
        neg: new Decimal(0),
        keepPosNeg: false,
        first: 0,
    }},
    color: "#fced9f",
    requires: new Decimal("1e365"), // Can be a function that takes requirement increases into account
    resource: "平衡", // Name of prestige currency
    baseResource: "诡异", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.0125:0.005) }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasAchievement("a", 74)) mult = mult.times(challengeEffect("h", 32));
        if (player.mc.unlocked) mult = mult.times(clickableEffect("mc", 22));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "按 A 进行平衡重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        if (!(hasMilestone("ba", 4) && player.ba.keepPosNeg)) {
            player.ba.pos = new Decimal(0);
            player.ba.neg = new Decimal(0);
        }
        if (hasMilestone("hn", 0)) keep.push("milestones")
        if (hasMilestone("hn", 3)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return player.q.unlocked&&player.ss.unlocked },
    branches: ["q","ss"],
    update(diff) {
        if (!player.ba.unlocked) return;
        player.ba.pos = player.ba.pos.plus(tmp.ba.posGain.times(diff));
        player.ba.neg = player.ba.neg.plus(tmp.ba.negGain.times(diff));
    },
    passiveGeneration() { return (hasMilestone("hn", 1)&&player.ma.current!="ba")?1:0 },
    dirBase() { return player.ba.points.times(10) },
    posGainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("ba", 24)) mult = mult.times(upgradeEffect("ba", 24).pos);
        return mult;
    },
    posGain() { return Decimal.pow(tmp.ba.dirBase, (hasMilestone("hn", 2)&&player.ma.current!="ba")?1:player.ba.allotted).times((hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(player.ba.allotted)).times(tmp.ba.posGainMult) },
    posBuff() { 
        let eff = player.ba.pos.plus(1).log10().plus(1).div(tmp.ba.negNerf); 
        eff = softcap("posBuff", eff);
        return eff;
    },
    noNerfs() {
        return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)
    },
    posNerf() { return tmp.ba.noNerfs?new Decimal(1):(player.ba.pos.plus(1).sqrt().pow(inChallenge("h", 41)?100:1)) },
    negGainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("ba", 24)) mult = mult.times(upgradeEffect("ba", 24).neg);
        return mult;
    },
    negGain() { return Decimal.pow(tmp.ba.dirBase, (hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(1-player.ba.allotted)).times((hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(1-player.ba.allotted)).times(tmp.ba.negGainMult) },
    negBuff() { 
        let eff = player.ba.neg.plus(1).pow((hasUpgrade("ba", 13))?10:1).div(tmp.ba.posNerf);
        eff = softcap("negBuff", eff);
        return eff;
    },
    negNerf() { return tmp.ba.noNerfs?new Decimal(1):(player.ba.neg.plus(1).log10().plus(1).sqrt().pow(inChallenge("h", 41)?100:1).div(hasUpgrade("ba", 14)?2:1).max(1)) },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "milestones",
        "blank",
        ["clickable", 31],
        ["row", [["clickable", 21], ["clickable", 11], "blank", ["bar", "balanceBar"], "blank", ["clickable", 12], ["clickable", 22]]],
        ["row", [
            ["column", [["display-text", function() {return tmp.nerdMode?("获取公式: "+format(tmp.ba.dirBase)+"^(1-barPercent/100)*(1-barBercent/100)"+(tmp.ba.negGainMult.eq(1)?"":("*"+format(tmp.ba.negGainMult)))):("+"+format(tmp.ba.negGain)+"/sec")}, {}], ["display-text", function() {return "消极: "+format(player.ba.neg)}, {}], ["display-text", function() {return (tmp.nerdMode?("效果公式: "+((hasUpgrade("ba", 13))?"(x+1)^10":"x+1")):("效果: 加成诡异层 "+format(tmp.ba.negBuff) + "x"))}, {}], ["display-text", function() {return tmp.ba.noNerfs?"":(tmp.nerdMode?("惩罚公式: "+(hasUpgrade("ba", 14)?"sqrt(log(x+1)+1)"+(inChallenge("h", 41)?"^100":"")+"/2":"sqrt(log(x+1)+1)")):("惩罚: 将积极效果除以 "+format(tmp.ba.negNerf)))}, {}], "blank", ["row", [["upgrade", 11], ["upgrade", 13]]]], {"max-width": "240px"}], 
            "blank", "blank", "blank", 
            ["column", 
            [["display-text", function() {return tmp.nerdMode?("获取公式: "+format(tmp.ba.dirBase)+"^(barPercent/100)*(barBercent/100)"+(tmp.ba.posGainMult.eq(1)?"":("*"+format(tmp.ba.posGainMult)))):("+"+format(tmp.ba.posGain)+"/sec")}, {}], ["display-text", function() {return "积极: "+format(player.ba.pos)}, {}], ["display-text", function() {return (tmp.nerdMode?("效果公式: log(x+1)+1"):("效果: 加成子空间和时间底数 "+format(tmp.ba.posBuff + "x")))}, {}], ["display-text", function() {return tmp.ba.noNerfs?"":(tmp.nerdMode?("惩罚公式: sqrt(x+1)"+(inChallenge("h", 41)?"^100":"")):("惩罚: 将消极效果除以 "+format(tmp.ba.posNerf)))}, {}], "blank", ["row", [["upgrade", 14], ["upgrade", 12]]]], {"max-width": "240px"}]], {"visibility": function() { return player.ba.unlocked?"visible":"hidden" }}],
        ["row", [["upgrade", 22], ["upgrade", 21], ["upgrade", 23]]],
        ["row", [["upgrade", 31], ["upgrade", 24], ["upgrade", 32]]],
        ["upgrade", 33],
        "blank", "blank"
    ],
    bars: {
        balanceBar: {
            direction: RIGHT,
            width: 400,
            height: 20,
            progress() { return player.ba.allotted },
            unlocked() { return player.ba.unlocked },
            fillStyle() { 
                let r = 235 + (162 - 235) * tmp.ba.bars.balanceBar.progress;
                let g = 64 + (249 - 64) * tmp.ba.bars.balanceBar.progress;
                let b = 52 + (252 - 52) * tmp.ba.bars.balanceBar.progress;
                return {"background-color": ("rgb("+r+", "+g+", "+b+")") } 
            },
            borderStyle() { return {"border-color": "#fced9f"} },
        },
    },
    clickables: {
        rows: 3,
        cols: 2,
        11: {
            title: "-",
            unlocked() { return player.ba.unlocked },
            canClick() { return player.ba.allotted>0 },
            onClick() { player.ba.allotted = Math.max(player.ba.allotted-0.05, 0) },
            style: {"height": "50px", "width": "50px", "background-color": "rgb(235, 64, 52)"},
        },
        12: {
            title: "+",
            unlocked() { return player.ba.unlocked },
            canClick() { return player.ba.allotted<1 },
            onClick() { player.ba.allotted = Math.min(player.ba.allotted+0.05, 1) },
            style: {"height": "50px", "width": "50px", "background-color": "rgb(162, 249, 252)"},
        },
        21: {
            title: "&#8592;",
            unlocked() { return player.ba.unlocked },
            canClick() { return player.ba.allotted>0 },
            onClick() { player.ba.allotted = 0 },
            style: {"height": "50px", "width": "50px", "background-color": "rgb(235, 64, 52)"},
        },
        22: {
            title: "&#8594;",
            unlocked() { return player.ba.unlocked },
            canClick() { return player.ba.allotted<1 },
            onClick() { player.ba.allotted = 1 },
            style: {"height": "50px", "width": "50px", "background-color": "rgb(162, 249, 252)"},
        },
        31: {
            title: "C",
            unlocked() { return player.ba.unlocked },
            canClick() { return player.ba.allotted!=.5 },
            onClick() { player.ba.allotted = .5 },
            style: {"height": "50px", "width": "50px", "background-color": "yellow"},
        },
    },
    upgrades: {
        rows: 3,
        cols: 4,
        11: {
            title: "阴离子",
            description: "消极加成太阳能。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e166666":5e7) },
            currencyDisplayName: "消极",
            currencyInternalName: "neg",
            currencyLayer: "ba",
            unlocked() { return hasMilestone("ba", 3) },
            effect() { 
                let ret = player.ba.neg.plus(1).log10().sqrt().div(10);
                ret = softcap("ba11", ret);
                return ret;
            },
            effectDisplay() { return "+"+format(tmp.ba.upgrades[11].effect.times(100))+"%" },
            formula: "sqrt(log(x+1))*10",
        },
        12: {
            title: "阳离子",
            description: "积极加成建筑效果和所有子空间效果。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e166666":5e7) },
            currencyDisplayName: "积极",
            currencyInternalName: "pos",
            currencyLayer: "ba",
            unlocked() { return hasMilestone("ba", 3) },
            effect() { return softcap("ba12", player.ba.pos.plus(1).log10().cbrt().div(10)) },
            effectDisplay() { return "+"+format(tmp.ba.upgrades[12].effect.times(100))+"%" },
            formula: "cbrt(log(x+1))*10",
        },
        13: {
            title: "消极力量",
            description: "将消极效果提升至 10 次幂",
            cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
            currencyDisplayName: "消极",
            currencyInternalName: "neg",
            currencyLayer: "ba",
            unlocked() { return hasMilestone("ba", 3) },
        },
        14: {
            title: "积极氛围",
            description: "减半消极惩罚。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
            currencyDisplayName: "积极",
            currencyInternalName: "pos",
            currencyLayer: "ba",
            unlocked() { return hasMilestone("ba", 3) },
        },
        21: {
            title: "中性原子",
            description: "障碍灵魂的效果提升至 8 次幂。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
            unlocked() { return hasUpgrade("ba", 13)&&hasUpgrade("ba", 14) },
        },
        22: {
            title: "负质量",
            description: "消极同样加成障碍灵魂和诡异获取。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e203000":2.5e11) },
            currencyDisplayName: "消极",
            currencyInternalName: "neg",
            currencyLayer: "ba",
            unlocked() { return hasUpgrade("ba", 21) },
        },
        23: {
            title: "高阶",
            description: "积极降低阳光价格。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e203000":2.5e11) },
            currencyDisplayName: "积极",
            currencyInternalName: "pos",
            currencyLayer: "ba",
            unlocked() { return hasUpgrade("ba", 21) },
        },
        24: {
            title: "净中立",
            description: "积极和消极加成对方获取。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e205000":2.5e12) },
            unlocked() { return hasUpgrade("ba", 22) && hasUpgrade("ba", 23) },
            effect() { 
                let ret = {
                    pos: player.ba.neg.div(1e12).plus(1).log10().plus(1).pow(hasUpgrade("ba", 33)?15:5),
                    neg: player.ba.pos.div(1e12).plus(1).log10().plus(1).pow(hasUpgrade("ba", 33)?15:5),
                } 
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) {
                    ret.pos = Decimal.pow(10, ret.pos.log10().pow(1.5));
                    ret.neg = Decimal.pow(10, ret.neg.log10().pow(1.5));
                }
                return ret;
            },
            effectDisplay() { return "Pos: "+format(tmp.ba.upgrades[24].effect.pos)+"x, Neg: "+format(tmp.ba.upgrades[24].effect.neg)+"x" },
            formula() { return "Pos: (log(neg/1e12+1)+1)^"+(hasUpgrade("ba", 33)?15:5)+", Neg: (log(pos/1e12+1)+1)^"+(hasUpgrade("ba", 33)?15:5) },
            style: {"font-size": "9px"},
        },
        31: {
            title: "实体退化",
            description: "前两个魔法使用更好的公式。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e205500":1e52) },
            currencyDisplayName: "消极",
            currencyInternalName: "neg",
            currencyLayer: "ba",
            unlocked() { return hasChallenge("h", 41) },
        },
        32: {
            title: "实体重生",
            description: "积极加成超级生成器底数。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e205500":1e52) },
            currencyDisplayName: "积极",
            currencyInternalName: "pos",
            currencyLayer: "ba",
            unlocked() { return hasChallenge("h", 41) },
            effect() { 
                let eff = softcap("ba32", player.ba.pos.plus(1).log10().div(50).plus(1).pow(10));
                if (hasUpgrade("hn", 44)) eff = eff.times(upgradeEffect("p", 44));
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(10);
                return eff;
            },
            effectDisplay() { return format(tmp.ba.upgrades[32].effect)+"x" },
            formula: "(log(x+1)/50+1)^10",
            style: {"font-size": "9px"},
        },
        33: {
            title: "绝对平等",
            description: "<b>净中立</b> 的两个效果提升至三次方。",
            cost() { return new Decimal(player.ma.current=="ba"?"1e207500":2.5e51) },
            unlocked() { return hasChallenge("h", 41) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 总平衡",
            done() { return player.ba.total.gte(2) || (hasMilestone("hn", 0)) },
            effectDescription: "每秒获得 100% 诡异，对所有重置保留诡异升级。",
        },
        1: {
            requirementDescription: "3 总平衡",
            done() { return player.ba.total.gte(3) || (hasMilestone("hn", 0)) },
            effectDescription: "解锁自动诡异层。",
            toggles: [["q", "auto"]],
        },
        2: {
            requirementDescription: "10 总平衡",
            done() { return player.ba.total.gte(10) || (hasMilestone("hn", 0)) },
            effectDescription: "对任何重置保留子空间升级，解锁自动子空间能量，子空间能量不再重置任何东西。",
            toggles: [["ss", "auto"]],
        },
        3: {
            unlocked() { return hasMilestone("ba", 2) },
            requirementDescription: "200,000 总平衡",
            done() { return player.ba.total.gte(2e5) || (hasMilestone("hn", 0)) },
            effectDescription: "解锁平衡升级。",
        },
        4: {
            unlocked() { return hasMilestone("ba", 3) },
            requirementDescription: "1e12 总平衡",
            done() { return player.ba.total.gte(1e12) || (hasMilestone("hn", 0)) },
            effectDescription: "你可以在重置时保留消极和积极。",
            toggles: [["ba", "keepPosNeg"]],
        },
    },
})
/*
                                 
                                 
                                 
                                 
                                 
                                 
ppppp   ppppppppp       ssssssssss   
p::::ppp:::::::::p    ss::::::::::s  
p:::::::::::::::::p ss:::::::::::::s 
pp::::::ppppp::::::ps::::::ssss:::::s
p:::::p     p:::::p s:::::s  ssssss 
p:::::p     p:::::p   s::::::s      
p:::::p     p:::::p      s::::::s   
p:::::p    p::::::pssssss   s:::::s 
p:::::ppppp:::::::ps:::::ssss::::::s
p::::::::::::::::p s::::::::::::::s 
p::::::::::::::pp   s:::::::::::ss  
p::::::pppppppp      sssssssssss    
p:::::p                             
p:::::p                             
p:::::::p                            
p:::::::p                            
p:::::::p                            
ppppppppp                            
                                 
*/
addLayer("ps", {
    name: "phantom souls", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        prevH: new Decimal(0),
        souls: new Decimal(0),
        power: new Decimal(0),
        auto: false,
        autoW: false,
        autoGhost: false,
        first: 0,
    }},
    color: "#b38fbf",
    requires() { return new Decimal("1e16000") }, // Can be a function that takes requirement increases into account
    resource: "幽魂", // Name of prestige currency
    baseResource: "QE", // Name of resource prestige is based on
    baseAmount() {return player.q.energy}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1.5), // Prestige currency exponent
    base() { 
        let b = new Decimal("1e8000").root(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1);
        if (tmp.ps.impr[32].unlocked) b = b.root(improvementEffect("ps", 32));
        return b;
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.i.buyables[11].gte(2)) mult = mult.div(buyableEffect("s", 17));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return hasMilestone("hn", 9) },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "P", description: "按 Shift+P 进行幽魂重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("hn", 6) },
    doReset(resettingLayer){ 
        let keep = [];
        player.ps.souls = new Decimal(0);
        let keptGS = new Decimal(0);
        if (layers[resettingLayer].row <= this.row+1) keptGS = new Decimal(player.ps.buyables[21]);
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        player.ps.buyables[21] = keptGS;
    },
    update(diff) {
        if (hasMilestone("hn", 5)) {
            if (player.ps.autoW) layers.ps.buyables[11].buyMax();
            player.ps.souls = player.ps.souls.max(tmp.ps.soulGain.times(player.h.points.max(1).log10()))
        } else player.ps.souls = player.ps.souls.plus(player.h.points.max(1).log10().sub(player.ps.prevH.max(1).log10()).max(0).times(tmp.ps.soulGain));
        player.ps.prevH = new Decimal(player.h.points);
        if (hasMilestone("hn", 7)) player.ps.power = player.ps.power.root(tmp.ps.powerExp).plus(tmp.ps.powerGain.times(diff)).pow(tmp.ps.powerExp);
        else player.ps.power = new Decimal(0);
        if (player.ps.autoGhost && hasMilestone("ma", 0) && player.ma.current!="ps") layers.ps.buyables[21].buyMax();
    },
    autoPrestige() { return hasMilestone("hn", 4) && player.ps.auto && player.ma.current!="ps" },
    layerShown(){return player.m.unlocked && player.ba.unlocked},
    branches: ["q", ["h", 2]],
    soulGainExp() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.2:1.5 },
    soulGainMult() {
        let mult = new Decimal(1);
        if (tmp.ps.buyables[11].effects.damned) mult = mult.times(tmp.ps.buyables[11].effects.damned||1);
        if (player.i.buyables[11].gte(1)) mult = mult.times(buyableEffect("s", 16));
        if (player.c.unlocked) mult = mult.times(tmp.c.eff4);
        return mult.times(tmp.n.dustEffs.purple);
    },
    soulGain() {
        let gain = (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?Decimal.pow(tmp.ps.soulGainExp, player.ps.points):Decimal.pow(player.ps.points, tmp.ps.soulGainExp)).div(9.4).times(layers.ps.soulGainMult());
        return gain;
    },
    gainDisplay() {
        let gain = tmp.ps.soulGain;
        let display = "";
        if (gain.eq(0)) display = "0"
        else if (gain.gte(1)) display = "每 OoM 障碍灵魂生成" + format(gain)
        else display = "每 "+format(gain.pow(-1))+" OoM 障碍灵魂生成 1 个"
        return display;
    },
    soulEffExp() {
        let exp = new Decimal(1.5e3);
        if (tmp.ps.buyables[11].effects.damned) exp = exp.times(tmp.ps.buyables[11].effects.damned||1);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(100);
        return exp;
    },
    soulEff() {
        let eff = player.ps.souls.plus(1).pow(layers.ps.soulEffExp());
        return eff;
    },
    powerGain() { return player.ps.souls.plus(1).times(tmp.ps.buyables[21].effect).times(tmp.n.dustEffs.purple) },
    powerExp() { return player.ps.points.sqrt().times(tmp.ps.buyables[21].effect) },
    tabFormat: {
        "Main Tab": {
            content: ["main-display",
                "prestige-button",
                "resource-display",
                "blank",
                ["display-text", function() { return "你有 "+formatWhole(player.ps.souls)+" 恶魂 "+(tmp.nerdMode?("(公式: ("+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("ps"):false)?(format(tmp.ps.soulGainExp)+"^PS"):("PS^"+format(tmp.ps.soulGainExp)))+")*"+format(tmp.ps.soulGainMult.div(10))+")"):("(获得: "+tmp.ps.gainDisplay+")"))+": 将诡异改良需求除以 "+format(tmp.ps.soulEff)+(tmp.nerdMode?(" (x+1)^("+formatWhole(tmp.ps.soulEffExp)+")"):"") }],
                "blank",
                ["buyable", 11],
            ],
        },
        Boosters: {
            unlocked() { return hasMilestone("hn", 7) },
            buttonStyle() { return {'background-color': '#b38fbf'} },
            content: [
                "main-display",
                "blank",
                ["buyable", 21],
                "blank",
                ["display-text",
                    function() {return '你有 ' + formatWhole(player.ps.power)+' 魂力'+(tmp.nerdMode?(" (获取公式: (damned+1), 指数公式: sqrt(ps))"):" (+"+format(tmp.ps.powerGain)+"/sec (基于恶魂)， 然后提升至 "+format(tmp.ps.powerExp)+" 次幂(基于幽魂))")+'，提供了下面的幽魂增幅器 (下一个在 '+format(tmp.ps.impr.overallNextImpr)+')'},
                        {}],
                "blank",
                "improvements"],
        },
    },
    buyables: {
        rows: 2,
        cols: 1,
        11: {
            title: "幽灵",
            scaleSlow() {
                let speed = new Decimal(1);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) speed = speed.times(2);
                return speed;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost1 = x.div(tmp.ps.buyables[this.id].scaleSlow).times(2).plus(1).floor();
                let cost2 = x.div(tmp.ps.buyables[this.id].scaleSlow).plus(1).pow(4).times(174).plus(200).floor();
                return { phantom: cost1, damned: cost2 };
            },
            effects(adj=0) {
                let data = {};
                let x = player[this.layer].buyables[this.id].plus(adj);
                if (x.gte(1)) data.hindr = x.min(3).toNumber();
                if (x.gte(2)) data.damned = x.sub(1).times(0.5).div(10/9.4).plus(1);
                if (x.gte(4)) data.quirkImpr = x.div(2).sub(1).floor().min(3).toNumber();
                return data;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ((tmp.nerdMode?("价格公式: 2*x+1 幽魂, (x+1)^4*174+200 恶魂"):("价格: " + formatWhole(data.cost.phantom) + " 幽魂， "+formatWhole(data.cost.damned)+" 恶魂"))+"\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
                效果: ")
                let curr = data.effects;
                let next = this.effects(1);
                if (Object.keys(next).length>0) {
                    if (next.hindr) {
                        display += "\n"
                        if (curr.hindr) display += curr.hindr+" 新的障碍"+(curr.hindr>=3?" (已满)":"")
                        else display += "<b>下一个: 解锁一个新的障碍</b>"
                    }
                    if (next.damned) {
                        display += "\n"
                        if (curr.damned) display += "将恶魂获取和效果指数乘以 "+format(curr.damned)+(tmp.nerdMode?" ((x-1)*0.5+1)":"");
                        else display += "<b>下一个: 加成恶魂获取和效果指数</b>"
                    }
                    if (next.quirkImpr) {
                        display += "\n"
                        if (curr.quirkImpr) display += curr.quirkImpr+" 新诡异改良"+(curr.quirkImpr>=3?" (已满)":"")
                        else if (next.quirkImpr>(curr.quirkImpr||0)) display += "<b>下一个: 解锁一个新的诡异改良</b>"
                    }
                } else display += "None"
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.ps.points.gte(tmp[this.layer].buyables[this.id].cost.phantom)&&player.ps.souls.gte(tmp[this.layer].buyables[this.id].cost.damned)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (!hasMilestone("hn", 4)) {
                    player.ps.points = player.ps.points.sub(cost.phantom)
                    player.ps.souls = player.ps.souls.sub(cost.damned)
                } 
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                let target = player.ps.points.sub(1).div(2).min(player.ps.souls.sub(200).div(174).root(4).sub(1)).times(tmp.ps.buyables[this.id].scaleSlow).plus(1).floor().max(0)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target)
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return hasMilestone("hn", 5) && player.ps.autoW },
        },
        21: {
            title: "灵魂",
            scaleSlow() {
                let slow = new Decimal(1);
                if (hasUpgrade("hn", 51)) slow = slow.times(2);
                if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) slow = slow.times(1.2);
                if (tmp.ps.impr[31].unlocked) slow = slow.times(improvementEffect("ps", 31));
                return slow;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(10, Decimal.pow(2, x.div(this.scaleSlow()))).times(x.eq(0)?1e21:1e22);
                if (hasUpgrade("hn", 51)) cost = cost.div(upgradeEffect("hn", 51));
                return cost;
            },
            effect() {
                return player[this.layer].buyables[this.id].div(25).plus(1).pow(2);
            },
            effect2() {
                return player[this.layer].buyables[this.id].div(10).plus(1);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                let display = ((tmp.nerdMode?("价格公式: (10^(2^x))*1e22"):("价格: " + formatWhole(data.cost) + " 魂力"))+"\n\
                数量: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
                效果: "+(tmp.nerdMode?("公式 1: (x/25+1)^2, 公式 2: (x/10+1)"):("加成魂力获取 "+format(tmp.ps.buyables[this.id].effect)+"，并增幅幽魂增幅器效果 "+format(tmp.ps.buyables[this.id].effect2.sub(1).times(100))+"%")))
                return display;
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.ps.power.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.ps.power = player.ps.power.sub(cost);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {
                let target = player.ps.power.times(hasUpgrade("hn", 51)?upgradeEffect("hn", 51):1).div(1e22).max(1).log10().max(1).log(2).times(this.scaleSlow()).plus(1).floor();
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return player.ps.autoGhost && hasMilestone("ma", 0) && player.ma.current!="ps" },
        },
    },
    impr: {
        baseReq() { 
            let req = new Decimal(1e20).div(99);
            return req;
        },
        amount() { 
            let amt = player.ps.power.div(this.baseReq()).plus(1).log10().div(4).root(1.5).max(0);
            //if (amt.gte(270)) amt = amt.log10().times(270/Math.log10(270));
            return amt.floor();
        },
        overallNextImpr() { 
            let impr = tmp.ps.impr.amount.plus(1);
            //if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
            return Decimal.pow(10, impr.pow(1.5).times(4)).sub(1).times(this.baseReq()) 
        },
        nextAt(id=11) { 
            let impr = getImprovements("ps", id).times(tmp.ps.impr.activeRows*tmp.ps.impr.activeCols).add(tmp.ps.impr[id].num);
            //if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
            return Decimal.pow(10, impr.pow(1.5).times(4)).sub(1).times(this.baseReq());
        },
        power() { return tmp.ps.buyables[21].effect2.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
        resName: "魂力",
        rows: 3,
        cols: 2,
        activeRows: 2,
        activeCols: 2,
        11: {
            num: 1,
            title: "幽魂增幅器 I",
            description: "增幅太阳能。",
            unlocked() { return hasMilestone("hn", 7) },
            effect() { return getImprovements("ps", 11).times(tmp.ps.impr.power).div(20).plus(1).sqrt() },
            effectDisplay() { return "+"+format(tmp.ps.impr[11].effect.sub(1).times(100))+"% (累乘)" },
            formula: "sqrt(x*5%)",
            style: {height: "150px", width: "150px"},
        },
        12: {
            num: 2,
            title: "幽魂增幅器 II",
            description: "增幅妖术获取。",
            unlocked() { return hasMilestone("hn", 7) },
            effect() { return Decimal.pow(10, getImprovements("ps", 11).times(tmp.ps.impr.power).pow(2.5)) },
            effectDisplay() { return format(tmp.ps.impr[12].effect)+"x" },
            formula: "10^(x^2.5)",
            style: {height: "150px", width: "150px"},
        },
        21: {
            num: 3,
            title: "幽魂增幅器 III",
            description: "加成魔法效果。",
            unlocked() { return hasMilestone("hn", 7) },
            effect() { return getImprovements("ps", 21).times(tmp.ps.impr.power).div(10).plus(1) },
            effectDisplay() { return format(tmp.ps.impr[21].effect.sub(1).times(100))+"% 增强" },
            formula: "x*10%",
            style: {height: "150px", width: "150px"},
        },
        22: {
            num: 4,
            title: "幽魂增幅器 IV",
            description: "减缓诡异改良价格增长。",
            unlocked() { return hasMilestone("hn", 7) },
            effect() { return getImprovements("ps", 22).times(tmp.ps.impr.power).div(20).plus(1) },
            effectDisplay() { return format(tmp.ps.impr[22].effect)+"x 减缓" },
            formula: "x/20+1",
            style: {height: "150px", width: "150px"},
        },
        31: {
            num: 1500,
            title: "幽魂增幅器 V",
            description: "灵魂价格缩放减缓。",
            unlocked() { return hasMilestone("hn", 7) && player.i.buyables[14].gte(1) },
            effect() { return getImprovements("ps", 31).times(tmp.ps.impr.power).plus(1).log10().div(25).plus(1) },
            effectDisplay() { return "减缓 " + format(Decimal.sub(1, tmp.ps.impr[31].effect.pow(-1)).times(100))+"%" },
            formula: "log(x+1)/25+1",
            style: {height: "150px", width: "150px"},
        },
        32: {
            num: 1751,
            title: "幽魂增幅器 VI",
            description: "幽魂降低幽魂价格底数。",
            unlocked() { return hasMilestone("hn", 7) && player.i.buyables[14].gte(2) },
            effect() { return getImprovements("ps", 31).times(tmp.ps.impr.power).pow(2).times(player.ps.points).plus(1).log10().plus(1).pow(1.2) },
            effectDisplay() { return "降低至 "+format(tmp.ps.impr[32].effect)+" 次根" },
            formula: "(log((x^2)*PS+1)+1)^1.2",
            style: {height: "150px", width: "150px"},
        },
    },
})





































/*
                                      
                                      
                                      
                                      
                                      
                                      
    eeeeeeeeeeee    nnnn  nnnnnnnn    
  ee::::::::::::ee  n:::nn::::::::nn  
 e::::::eeeee:::::een::::::::::::::nn 
e::::::e     e:::::enn:::::::::::::::n
e:::::::eeeee::::::e  n:::::nnnn:::::n
e:::::::::::::::::e   n::::n    n::::n
e::::::eeeeeeeeeee    n::::n    n::::n
e:::::::e             n::::n    n::::n
e::::::::e            n::::n    n::::n
 e::::::::eeeeeeee    n::::n    n::::n
  ee:::::::::::::e    n::::n    n::::n
    eeeeeeeeeeeeee    nnnnnn    nnnnnn
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("en", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "EN", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        bestOnReset: new Decimal(0),
        total: new Decimal(0),
        stored: new Decimal(0),
        target: 0,
        tw: new Decimal(0),
        ow: new Decimal(0),
        sw: new Decimal(0),
        mw: new Decimal(0),
        first: 0,
    }},
    color: "#fbff05",
    nodeStyle() {return {
        "background-color": (((player.en.unlocked||canReset("en"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#fbff05":"#bf8f8f"),
    }},
    resource: "能量", // Name of prestige currency
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    baseResource: "阳光",
    baseAmount() { return player.o.points },
    req() { return (player[this.layer].unlockOrder>0&&!player.en.unlocked)?new Decimal("1e15825"):new Decimal("1e15000") },
    requires() { return this.req() },
    increaseUnlockOrder: ["ne"],
    exp() { return Decimal.add(.8, tmp.en.clickables[11].eff) },
    exponent() { return tmp[this.layer].exp },
    gainMult() {
        let mult = new Decimal(1);
        if (hasMilestone("en", 0)) mult = mult.times(2);
        if (hasMilestone("en", 2)) mult = mult.times(player.o.points.plus(1).log10().plus(1).log10().plus(1));
        if (player.ne.unlocked && hasMilestone("ne", 5)) mult = mult.times(tmp.ne.thoughtEff3);
        if (player.r.unlocked) mult = mult.times(tmp.r.producerEff);
        if (hasMilestone("r", 0)) mult = mult.times(player.r.maxMinibots.max(1));
        if (player.ai.unlocked && tmp.ai) mult = mult.times(tmp.ai.conscEff1);
        return mult;
    },
    getResetGain() {
        let gain = player.o.points.div(tmp.en.req).plus(1).log2().pow(tmp.en.exp);
        return gain.times(tmp.en.gainMult).floor();
    },
    resetGain() { return this.getResetGain() },
    getNextAt() {
        let gain = tmp.en.getResetGain.div(tmp.en.gainMult).plus(1)
        return Decimal.pow(2, gain.root(tmp.en.exp)).times(tmp.en.req);
    },
    passiveGeneration() { return hasMilestone("en", 0)?0.1:0 },
    canReset() {
        return player.o.points.gte(tmp.en.req) && tmp.en.getResetGain.gt(0) && (hasMilestone("en", 0)?player.en.points.lt(tmp.en.getResetGain):player.en.points.eq(0))
    },
    dispGainFormula() {
        let start = tmp.en.req;
        let exp = tmp.en.exp;
        return "log2(x / "+format(start)+")^"+format(exp)
    },
    prestigeButtonText() {
        if (tmp.nerdMode) return "获取公式: "+tmp.en.dispGainFormula;
        else return `${ player.en.points.lt(1e3) ? (tmp.en.resetDescription !== undefined ? tmp.en.resetDescription : "重置获得 ") : ""}+<b>${formatWhole(tmp.en.getResetGain)}</b> ${tmp.en.resource} ${tmp.en.resetGain.lt(100) && player.en.points.lt(1e3) ? `<br><br>下一个位于 ${format(tmp.en.nextAt)}` : ""}`
    },
    prestigeNotify() {
        if (!canReset("en")) return false;
        if (tmp.en.getResetGain.gte(player.o.points.times(0.1).max(1)) && !tmp.en.passiveGeneration) return true;
        else return false;
    },
    tooltip() { return formatWhole(player.en.points)+" 能量" },
    tooltipLocked() { return "达到 "+formatWhole(tmp.en.req)+" 阳光解锁（你有 "+formatWhole(player.o.points)+" 阳光）" },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "y", description: "按 Y 进行能量重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        if (resettingLayer==this.layer) player.en.target = player.en.target%(hasMilestone("en", 3)?4:3)+1;
        if (layers[resettingLayer].row<7 && resettingLayer!="r" && resettingLayer!="ai" && resettingLayer!="c") {
            keep.push("tw");
            keep.push("sw");
            keep.push("ow");
            keep.push("mw");		
            if (hasMilestone("en", 1)) keep.push("milestones");
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    onPrestige(gain) { player.en.bestOnReset = player.en.bestOnReset.max(gain) },
    layerShown(){return player.mc.unlocked },
    branches: ["sb","o"],
    update(diff) {
        if (!player[this.layer].unlocked) return;
        let subbed = new Decimal(0);
        if (player.en.points.gt(0)) {
            subbed = player.en.points.times(Decimal.sub(1, Decimal.pow(0.75, diff))).plus(diff);
            player.en.points = player.en.points.times(Decimal.pow(0.75, diff)).sub(diff).max(0);
            if (hasMilestone("en", 1)) player.en.stored = player.en.stored.plus(subbed.div(5));
        }
        let sw_mw_exp = hasUpgrade("ai", 34)?0.8:1
        if (hasMilestone("r", 1)) {
            subbed = subbed.times(player.r.total.max(1));
            if (hasMilestone("r", 4) && tmp.r) subbed = subbed.times(tmp.r.producerEff.max(1));
            player.en.tw = player.en.tw.pow(1.5).plus(subbed.div(player.en.target==1?1:3)).root(1.5);
            player.en.ow = player.en.ow.pow(1.5).plus(subbed.div(player.en.target==2?1:3)).root(1.5);
            player.en.sw = player.en.sw.pow(sw_mw_exp*(hasMilestone("en", 4)?2.5:4)).plus(subbed.div(player.en.target==3?1:3)).root(sw_mw_exp*(hasMilestone("en", 4)?2.5:4));
            if (hasMilestone("en", 3)) player.en.mw = player.en.mw.pow(sw_mw_exp*(hasMilestone("en", 4)?5.5:7)).plus(subbed.div(player.en.target==4?1:3)).root(sw_mw_exp*(hasMilestone("en", 4)?5.5:7));
            
        } else switch(player.en.target) {
            case 1: 
                player.en.tw = player.en.tw.pow(1.5).plus(subbed).root(1.5);
                break;
            case 2: 
                player.en.ow = player.en.ow.pow(1.5).plus(subbed).root(1.5);
                break;
            case 3: 
                player.en.sw = player.en.sw.pow(sw_mw_exp*(hasMilestone("en", 4)?2.5:4)).plus(subbed).root(sw_mw_exp*(hasMilestone("en", 4)?2.5:4));
                break;
            case 4: 
                if (hasMilestone("en", 3)) player.en.mw = player.en.mw.pow(sw_mw_exp*(hasMilestone("en", 4)?5.5:7)).plus(subbed).root(sw_mw_exp*(hasMilestone("en", 4)?5.5:7));
                break;
        }
    },
    storageLimit() { return player.en.total.div(2) },
    twEff() { return player.en.tw.plus(1).log10().plus(1).log10().times(10).plus(1).pow(4) },
    owEff() { return player.en.ow.plus(1).log10().plus(1).log10().times(40).pow(1.8) },
    swEff() { return player.en.sw.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
    mwEff() { return hasMilestone("en", 3)?player.en.mw.plus(1).log10().plus(1).log10().div(5).plus(1).pow(2):new Decimal(1) },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display", "blank",
        "milestones",
        "blank", "blank", 
        "clickables",
        "blank", "blank",
        ["row", [
            ["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==1?"#e1ffde;":"#8cfa82;")+"'>"+(player.en.target==1?"时间能量":"时间能量")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #8cfa82;'>"+formatWhole(player.en.tw)+"</h4><br><br>增强非扩展时空胶囊 <span style='color: #8cfa82; font-weight: bold; font-size: 20px;'>"+format(tmp.en.twEff.sub(1).times(100))+"</span>%" }]], {width: "100%"}],
            ]], "blank", "blank", ["row", [
            ["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==2?"#fff0d9":"#ffd187;")+"'>"+(player.en.target==2?"太阳能量":"太阳能量")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #ffd187;'>"+formatWhole(player.en.ow)+"</h4><br><br>对阳光获取指数增加 <span style='color: #ffd187; font-weight: bold; font-size: 20px;'>"+format(tmp.en.owEff)+"</span>" }]], {width: "50%"}],
            ["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==3?"#dbfcff":"#8cf5ff;")+"'>"+(player.en.target==3?"超级能量":"超级能量")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #8cf5ff;'>"+formatWhole(player.en.sw)+"</h4><br><br>增强超级增幅器 <span style='color: #8cf5ff; font-weight: bold: font-size: 20px;'>"+format(tmp.en.swEff.sub(1).times(100))+"</span>%" }]], {width: "50%"}],
            ]], "blank", "blank", ["row", [
            ["column", [["display-text", function() { return hasMilestone("en", 3)?("<h3 style='color: "+(player.en.target==4?"#f4deff;":"#d182ff;")+"'>"+(player.en.target==4?"思维能量":"思维能量")+"</h3>"):"" }], ["display-text", function() { return hasMilestone("en", 3)?("<h4 style='color: #d182ff;'>"+formatWhole(player.en.mw)+"</h4><br><br>增强思考效果 <span style='color: #d182ff; font-weight: bold; font-size: 20px;'>"+format(tmp.en.mwEff.sub(1).times(100))+"</span>%，并且增幅信号获取 <span style='color: #d182ff; font-weight: bold; font-size: 20px;'>"+format(tmp.en.mwEff.pow(40))+"</span>x"):"" }]], {width: "75%"}],
        ], function() { return {display: hasMilestone("en", 3)?"none":""} }],
        "blank", "blank", "blank",
    ],
    milestones: {
        0: {
            requirementDescription: "一次重置获得 8,750 能量",
            done() { return player.en.bestOnReset.gte(8750) || hasAchievement("a", 151) },
            effectDescription: "每秒获得 10% 的能量，小于 100% 获得的能量时就可以进行能量重置，双倍能量获取。",
        },
        1: {
            requirementDescription: "一次重置获得 22,500 能量",
            done() { return player.en.bestOnReset.gte(22500) || hasAchievement("a", 151) },
            effectDescription: "流失的 20% 能量转换为储存，能量里程碑对于第七行重置保留（除了机器人和人工智能），小于 1 时，储存能量效果被根号。",
        },
        2: {
            requirementDescription: "一次重置获得 335,000 能量",
            done() { return player.en.bestOnReset.gte(335e3) || hasAchievement("a", 151) },
            effectDescription() { return "你阳光的两次 log 加成能量获取  ("+format(player.o.points.plus(1).log10().plus(1).log10().plus(1))+"x)." },
        },
        3: {
            unlocked() { return player.en.unlocked && player.ne.unlocked },
            requirementDescription: "250,000,000 总能量 & 26 思考",
            done() { return (player.en.total.gte(2.5e8) && player.ne.thoughts.gte(26)) || player.en.milestones.includes(3) },
            effectDescription() { return "解锁思维能量。" },
        },
        4: {
            unlocked() { return hasMilestone("en", 3) || hasAchievement("a", 151) },
            requirementDescription: "一次重置获得 10,000,000 能量",
            done() { return player.en.bestOnReset.gte(1e7) || hasAchievement("a", 151) },
            effectDescription() { return "思维能量 & 超级能量获取根降低 1.5。" },
        },
    },
    clickables: {
        rows: 1,
        cols: 2,
        11: {
            title: "储存能量",
            display(){
                return "储存的能量: <span style='font-size: 20px; font-weight: bold;'>"+formatWhole(player.en.stored)+" / "+formatWhole(tmp.en.storageLimit)+"</span><br><br>"+(tmp.nerdMode?("效果公式: log(log(x+1)+1)/5"):("能量获取指数增加 <span style='font-size: 20px; font-weight: bold;'>"+format(tmp.en.clickables[11].eff)+"</span>"))
            },
            eff() { 
                let e = player.en.stored.plus(1).log10().plus(1).log10().div(5);
                if (hasMilestone("en", 1) && e.lt(1)) e = e.sqrt();
                return e;
            },
            unlocked() { return player.en.unlocked },
            canClick() { return player.en.unlocked && player.en.points.gt(0) },
            onClick() { 
                player.en.stored = player.en.stored.plus(player.en.points).min(tmp.en.storageLimit);
                player.en.points = new Decimal(0);
            },
            style: {width: "160px", height: "160px"},
        },
        12: {
            title: "释放能量",
            display: "",
            unlocked() { return player.en.unlocked },
            canClick() { return player.en.unlocked && player.en.stored.gt(0) },
            onClick() { 
                player.en.points = player.en.points.plus(player.en.stored);
                player.en.best = player.en.best.max(player.en.points);
                player.en.stored = new Decimal(0);
            },
            style: {width: "80px", height: "80px"},
        },
    },
})
/*
                                  
                                  
                                  
                                  
                                  
                                  
nnnn  nnnnnnnn        eeeeeeeeeeee    
n:::nn::::::::nn    ee::::::::::::ee  
n::::::::::::::nn  e::::::eeeee:::::ee
nn:::::::::::::::ne::::::e     e:::::e
n:::::nnnn:::::ne:::::::eeeee::::::e
n::::n    n::::ne:::::::::::::::::e 
n::::n    n::::ne::::::eeeeeeeeeee  
n::::n    n::::ne:::::::e           
n::::n    n::::ne::::::::e          
n::::n    n::::n e::::::::eeeeeeee  
n::::n    n::::n  ee:::::::::::::e  
nnnnnn    nnnnnn    eeeeeeeeeeeeee  
                                  
                                  
                                  
                                  
                                  
                                  
                                  
*/
addLayer("ne", {
    name: "neurons", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "NE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        first: 0,
        signals: new Decimal(0),
        thoughts: new Decimal(0),
        auto: false,
        autoNN: false,
    }},
    color: "#ded9ff",
    requires() { return (player[this.layer].unlockOrder>0&&!player.ne.unlocked)?new Decimal("1e1160000"):new Decimal("1e1000000") }, // Can be a function that takes requirement increases into account
    increaseUnlockOrder: ["en"],
    resource: "神经元", // Name of prestige currency
    baseResource: "子空间", // Name of resource prestige is based on
    baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(2.5), // Prestige currency exponent
    base: new Decimal("1e10000"),
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    canBuyMax() { return false },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "按 U 进行神经元重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return player.ne.auto },
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row<7&&resettingLayer!="id"&&resettingLayer!="ai"&&resettingLayer!="c") {
            keep.push("thoughts")
            keep.push("buyables")
            if (hasMilestone("ne", 1)) keep.push("milestones");
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    effect() {
        let eff = player[this.layer].points.div(2).plus(1).pow(0.75).sub(1);
        if (hasMilestone("ne", 3)) eff = eff.times(Decimal.pow(1.5, player[this.layer].points.sqrt()).plus(player[this.layer].points));
        if (hasMilestone("ne", 6)) eff = eff.pow(2);
        if (hasMilestone("id", 1)) eff = eff.pow(2).times(player[this.layer].buyables[11].max(1));
        return eff;
    },
    effectDescription() { return "将信号获取速度乘以 <h2 style='color: #ded9ff; text-shadow: #ded9ff 0px 0px 10px;'>"+format(tmp[this.layer].effect)+"</h2>。" },
    autoPrestige() { return player.ne.auto },
    layerShown(){return player.mc.unlocked},
    branches: ["ss", "sg"],
    update(diff) {
        if (player.ne.unlocked && (player.ne.activeChallenge==11||hasAchievement("a", 151))) {
            player.ne.signals = player.ne.signals.plus(tmp.ne.challenges[11].amt.times(diff)).min((hasMilestone("ne", 4)||hasMilestone("id", 0))?(1/0):tmp.ne.signalLim);
            if (player.ne.signals.gte(tmp.ne.signalLim.times(0.999))) {
                if (hasMilestone("id", 0)) player.ne.thoughts = player.ne.thoughts.max(tmp.ne.thoughtTarg);
                else {
                    if (!hasMilestone("ne", 4) && !hasUpgrade("ai", 14)) player.ne.signals = new Decimal(0);
                    player.ne.thoughts = player.ne.thoughts.plus(1);
                }
            }
            if (player.ne.autoNN && hasMilestone("ne", 7)) layers.ne.buyables[11].buyMax();
        }
    },
    signalLimThresholdInc() {
        let inc = new Decimal(hasMilestone("ne", 4)?2:(hasMilestone("ne", 3)?2.5:(hasMilestone("ne", 2)?3:5)));
        if (player.id.unlocked) inc = inc.sub(tmp.id.effect);
        return inc;
    },
    signalLimThresholdDiv() {
        let div = new Decimal(1);
        if (player.c.unlocked && tmp.c) div = div.times(tmp.c.eff2);
        return div;
    },
    signalLim() { return Decimal.pow(tmp[this.layer].signalLimThresholdInc, player.ne.thoughts).times(100).div(tmp[this.layer].signalLimThresholdDiv) },
    thoughtTarg() { return player.ne.signals.times(tmp[this.layer].signalLimThresholdDiv).div(100).max(1).log(tmp[this.layer].signalLimThresholdInc).plus(1).floor() },
    thoughtPower() {
        let pow = new Decimal(1);
        if (player.en.unlocked && hasMilestone("en", 3)) pow = pow.times(tmp.en.mwEff);
        if (hasMilestone("id", 1)) pow = pow.times(1.2);
        return pow;
    },
    thoughtEff1() { return player.ne.thoughts.times(tmp.ne.thoughtPower).plus(1).log10().plus(1).pow(hasMilestone("ne", 1)?2:1) },
    thoughtEff2() { return Decimal.pow("1e800", player.ne.thoughts.times(tmp.ne.thoughtPower).pow(.75)).pow(hasMilestone("ne", 2)?2:1) },
    thoughtEff3() { return Decimal.pow(1.2, player.ne.thoughts.times(hasMilestone("ne", 5)?tmp.ne.thoughtPower:0).sqrt()) },
    challenges: {
        rows: 1,
        cols: 1,
        11: {
            name: "大脑",
            challengeDescription: "声望升级 2、增幅器、生成器禁用。<br>",
            unlocked() { return player.ne.unlocked && player.ne.points.gt(0) },
            goal() { return new Decimal(1/0) },
            currencyDisplayName: "",
            currencyInternalName: "points",
            gainMult() { 
                let mult = tmp.ne.effect.times(player.ne.signals.plus(1).log10().plus(1));
                if (hasMilestone("ne", 0)) mult = mult.times(player.ss.points.plus(1).sqrt());
                if (hasMilestone("ne", 2)) mult = mult.times(player.ne.points.max(1));
                if (player.en.unlocked && hasMilestone("en", 3)) mult = mult.times(tmp.en.mwEff.pow(40));
                if (hasAchievement("a", 143)) mult = mult.times(3);
                if (hasMilestone("r", 0)) mult = mult.times(player.r.maxMinibots.max(1));
                if (hasMilestone("r", 4) && tmp.r) mult = mult.times(tmp.r.producerEff.max(1));
                if (hasMilestone("id", 3) && tmp.mc) mult = mult.times(Decimal.pow(2, player.mc.buyables[11].max(1).log10()));
                if (player.ai.unlocked && tmp.ai) mult = mult.times(tmp.ai.conscEff1);
                if (player.c.unlocked && tmp.c) mult = mult.times(tmp.c.eff3);
                if (hasUpgrade("ai", 42)) mult = mult.times(upgradeEffect("ai", 42));
                return mult;
            },
            amt() { 
                let a = Decimal.pow(10, player.points.plus(1).log10().plus(1).log10().div(player.ne.activeChallenge==11?11:14).pow(3)).pow(tmp.ne.buyables[11].effect).times(tmp.ne.challenges[11].gainMult).floor();
                if (!a.eq(a)) return new Decimal(0);
                return a;
            },
            next() { return Decimal.pow(10, Decimal.pow(10, new Decimal((player.ne.activeChallenge==11||hasAchievement("a", 151))?tmp.ne.challenges[11].amt:0).plus(1).div(tmp.ne.challenges[11].gainMult).root(tmp.ne.buyables[11].effect).log10().root(3).times(11)).sub(1)).sub(1) },
            rewardDescription() { return "<br>信号: <h3 style='color: #ded9ff'>"+formatWhole(player.ne.signals)+"/"+formatWhole(tmp.ne.signalLim)+"</h3> "+(tmp.nerdMode?("(获取公式: 10^((log(log(points+1)+1)/11)^3)*"+format(tmp.ne.challenges[11].gainMult)+")"):("(+"+formatWhole((player.ne.activeChallenge==11||hasAchievement("a", 151))?tmp.ne.challenges[11].amt:0)+"/s"+(tmp.ne.challenges[11].amt.lt(1e3)?(", 下一个获取于 "+format(tmp.ne.challenges[11].next)+" 点数)"):")")))+"<br><br><br>思考: <h3 style='color: #ffbafa'>"+formatWhole(player.ne.thoughts)+"</h3> (下一个位于 "+formatWhole(tmp.ne.signalLim)+" 信号)<br><br>效果"+(tmp.ne.thoughtPower.eq(1)?"":(" (力量: "+format(tmp.ne.thoughtPower.times(100))+"%)"))+"<br>降低子空间能量价格 "+(tmp.nerdMode?" (公式: (log(思考+1)+1)"+(hasMilestone("ne", 1)?"^2":"")+")":(format(tmp.ne.thoughtEff1)+"x"))+"<br>子空间和超级生成器底数乘以 "+(tmp.nerdMode?" (公式: (1e800^(思考^0.75))"+(hasMilestone("ne", 2)?"^2":"")+")":format(tmp.ne.thoughtEff2)+"x")+(hasMilestone("ne", 5)?("<br>能量获取乘以 "+(tmp.nerdMode?" (公式: (1.2^sqrt(思考)))":(format(tmp.ne.thoughtEff3)+"x"))):"") },
            style() { return {'background-color': "#484659", filter: "brightness("+(100+player.ne.signals.plus(1).log10().div(tmp.ne.signalLim.plus(1).log10()).times(50).toNumber())+"%)", color: "white", 'border-radius': "25px", height: "400px", width: "400px"}},
            onStart(testInput=false) {
                if (testInput && player.ne.auto) {
                    doReset("m", true);
                    player.ne.activeChallenge = 11;
                    updateTemp();
                }
            },
        },
    },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "神经网络",
            ss() { return hasMilestone("id", 0)?12:10 },
            cost(x=player[this.layer].buyables[this.id]) {
                if (x.gte(tmp[this.layer].buyables[this.id].ss)) x = Decimal.pow(tmp[this.layer].buyables[this.id].ss, x.log(tmp[this.layer].buyables[this.id].ss).pow(hasMilestone("id", 0)?Math.sqrt(2):2));
                return Decimal.pow(4, x.pow(1.2)).times(2e4);
            },
            bulk(r=player.ne.signals) {
                let b = r.div(2e4).max(1).log(4).root(1.2);
                if (b.gte(tmp[this.layer].buyables[this.id].ss)) b = Decimal.pow(tmp[this.layer].buyables[this.id].ss, b.log(tmp[this.layer].buyables[this.id].ss).root(hasMilestone("id", 0)?Math.sqrt(2):2));
                return b.plus(1).floor();
            },
            power() {
                let p = new Decimal(1);
                if (player.c.unlocked && tmp.c) p = p.times(tmp.c.eff5);
                return p;
            },
            effect() { return player[this.layer].buyables[this.id].times(tmp.ne.buyables[11].power).div(3).plus(1) },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = "价格: "+format(cost)+" 信号"+(tmp.nerdMode?(" (价格公式: 4^("+(amt.gte(data.ss)?(formatWhole(data.ss)+"^(log"+formatWhole(data.ss)+"(x)^"+format(hasMilestone("id", 0)?Math.sqrt(2):2)+")"):"x")+"^1.2)*2e4)"):"")+".<br><br>等级: "+formatWhole(amt)+"<br><br>效果: 从点数获取的信号提高到 "+format(data.effect)+(tmp.nerdMode?" 次幂 (公式: x/3+1)":" 次幂");
                return display;
            },
            unlocked() { return unl(this.layer) && hasMilestone("ne", 0) }, 
            canAfford() {
                if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                return player[this.layer].unlocked && player.ne.signals.gte(layers[this.layer].buyables[this.id].cost());
            },
            buy() { 
                player.ne.signals = player.ne.signals.sub(tmp[this.layer].buyables[this.id].cost).max(0)
                player.ne.buyables[this.id] = player.ne.buyables[this.id].plus(1);
            },
            buyMax() { player.ne.buyables[this.id] = player.ne.buyables[this.id].max(tmp.ne.buyables[11].bulk) },
            style: {'height':'250px', 'width':'250px', 'background-color'() { return tmp.ne.buyables[11].canAfford?'#a2cade':'#bf8f8f' }, "border-color": "#a2cade"},
            autoed() { return hasMilestone("ne", 7)&&player.ne.autoNN },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2,750 信号",
            done() { return player.ne.signals.gte(2750) || player.ne.milestones.includes(0) },
            effectDescription() { return "子空间能量使信号获取乘以 ("+format(player.ss.points.plus(1).sqrt())+"x)，解锁神经网络。" },
        },
        1: {
            requirementDescription: "50,000 信号",
            done() { return player.ne.signals.gte(5e4) || player.ne.milestones.includes(1) },
            effectDescription() { return "思考第一效果平方，神经元里程碑对于第七行重置保留（除了想法）。" },
        },
        2: {
            requirementDescription: "3,000,000 信号",
            done() { return player.ne.signals.gte(3e6) || player.ne.milestones.includes(2) },
            effectDescription() { return "思考需求增长减缓 (5x -> 3x)，思考第二效果平方，神经元加成信号获取翻倍。" },
        },
        3: {
            requirementDescription: "150,000,000 信号",
            done() { return player.ne.signals.gte(1.5e8) || player.ne.milestones.includes(3) },
            effectDescription() { return "思考需求增长减缓 (3x -> 2.5x)，神经元效果使用更好的公式 (用指数代替亚线性)" },
        },
        4: {
            requirementDescription: "2.5e9 信号",
            done() { return player.ne.signals.gte(2.5e9) || player.ne.milestones.includes(4) },
            effectDescription() { return "思考需求增长减缓 (2.5x -> 2x)，获得思考不重置信号。" },
        },
        5: {
            unlocked() { return player.en.unlocked && player.ne.unlocked },
            requirementDescription() { return "8 神经元"+(player.id.unlocked?"":" & 一次重置获得 2,500,000 能量") },
            done() { return (player.ne.best.gte(8) && (player.id.unlocked||player.en.bestOnReset.gte(2.5e6))) },
            effectDescription() { return "神经元不再重置任何东西，解锁自动神经元和第三思考效果。" },
            toggles: [["ne", "auto"]],
        },
        6: {
            unlocked() { return player.id.unlocked },
            requirementDescription: "1e21 信号",
            done() { return player.ne.signals.gte(1e21) || player.ne.milestones.includes(6) },
            effectDescription() { return "神经元效果平方，并被神经网络等级乘。" },
        },
        7: {
            unlocked() { return false },
            requirementDescription: "9 神经元",
            done() { return false && player.ne.best.gte(9) },
            effectDescription: "解锁自动神经网络。",
            toggles: [["ne", "autoNN"]],
        },
    },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display", "blank", 
        "milestones", "blank", "blank",
        "challenges", "blank",
        "buyables",
        "blank", "blank", "blank",
    ],
})