
/*
                                          
                                          
                                          
                                          
                                          
                                          
   mmmmmmm    mmmmmmm     aaaaaaaaaaaaa   
 mm:::::::m  m:::::::mm   a::::::::::::a  
m::::::::::mm::::::::::m  aaaaaaaaa:::::a 
m::::::::::::::::::::::m           a::::a 
m:::::mmm::::::mmm:::::m    aaaaaaa:::::a 
m::::m   m::::m   m::::m  aa::::::::::::a 
m::::m   m::::m   m::::m a::::aaaa::::::a 
m::::m   m::::m   m::::ma::::a    a:::::a 
m::::m   m::::m   m::::ma::::a    a:::::a 
m::::m   m::::m   m::::ma:::::aaaa::::::a 
m::::m   m::::m   m::::m a::::::::::aa:::a
mmmmmm   mmmmmm   mmmmmm  aaaaaaaaaa  aaaa
                                          
                                          
                                          
                                          
                                          
                                          
                                          
*/
addLayer("ma", {
    name: "mastery", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        first: 0,
        mastered: [],
        selectionActive: false,
        current: null,
    }},
    color: "#ff9f7f",
    requires() { return new Decimal(100) }, // Can be a function that takes requirement increases into account
    resource: "专精", // Name of prestige currency
    baseResource: "幽魂", // Name of resource prestige is based on
    baseAmount() {return player.ps.points}, // Get the current amount of baseResource
    roundUpCost: true,
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1.1), // Prestige currency exponent
    base: new Decimal(1.05),
    effectBase() {
        return new Decimal(1e20);
    },
    effect() {
        return Decimal.pow(tmp.ma.effectBase, player.ma.points);
    },
    effectDescription() {
        return "增幅荣耀和超空间能量获取 "+format(tmp.ma.effect)+(tmp.nerdMode?("x (每个 "+format(tmp.ma.effectBase)+"x)"):"x")+"，并使超建筑增益 +"+format(tmp.ma.effect.max(1).log10().times(2.5))+"%"+(tmp.nerdMode?(" (每个 +"+format(tmp.ma.effectBase.max(1).log10().times(2.5))+"%)"):"")
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasAchievement("a", 131)) mult = mult.div(1.1);
        if (hasAchievement("a", 95)) mult = mult.div(1.15);
        if (hasAchievement("a", 134)) mult = mult.times(Decimal.pow(.999925, player.ps.points));
        if (hasAchievement("a", 163)) mult = mult.div(Decimal.pow(1.1, player.a.achievements.filter(x => x>160).length));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return false },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "A", description: "按 Shift+A 进行专精重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return false },
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    autoPrestige() { return false },
    layerShown(){return player.ps.unlocked && player.i.unlocked},
    branches: ["hn", "hs", ["ps", 2]],
    tabFormat: {
        Mastery: {
            content: ["main-display",
                "prestige-button",
                "resource-display",
                "blank", "milestones",
                "blank", "blank",
                "clickables",
            ],
        }, 
        "Mastery Rewards": {
            buttonStyle() { return {'background-color': '#ff9f7f', 'color': 'black'} },
            content: ["blank", "blank", "blank", ["raw-html", function() { return tmp.ma.rewardDesc }]],
        },
    },
    rewardDesc() {
        let desc = "";
        if (player.ma.mastered.includes("p")) desc += "<h2>声望</h2><br><br><ul><li>基础声望获取指数提高 (0.5 -> 0.75)</li><li><b>声望增益</b> 提高 ^1.1 (软上限之后)</li><li><b>自协同</b> 提高 ^75</li><li><b>更多声望</b> 提高 (+80% -> +1e52%)</li><li><b>力量升级</b> 提高 ^40</li><li><b>翻转声望增益</b> 提高 ^1.5</li></ul><br><br>";
        if (player.ma.mastered.includes("b")) desc += "<h2>增幅器</h2><br><br><ul><li>降低增幅器价格底数 (5 -> 1.5)</li><li>降低增幅器价格指数 (1.25 -> 0.75)</li><li><b>BP 连击</b> & <b>一折</b> 提高 ^1.5</li><li><b>交叉污染</b> & <b>PB 反转</b> 增幅超级增幅器底数</li><li><b>差的 BP 连击</b> 提高 ^20,000</li><li><b>更更多添加物</b> 提高至立方</li></ul><br><br>";
        if (player.ma.mastered.includes("g")) desc += "<h2>生成器</h2><br><br><ul><li>生成器价格底数降低 (5 -> 2.5)</li><li>生成器价格指数降低 (1.25 -> 1.1)</li><li>GP 效果提高 ^1.05</li><li><b>GP 连击</b> 提高 ^500,000</li><li><b>给我更多 III</b> 提高 ^10,000</li></ul><br><br>";
        if (player.ma.mastered.includes("t")) desc += "<h2>时间</h2><br><br><ul><li>时间价格底数降低 (1e15 -> 10)</li><li>时间价格指数降低 (1.85 -> 1.4)</li><li>时间胶囊获得新效果</li><li>任何加成 TE 上限底数的效果增益增幅器和生成器底数（乘）</li><li>TE 第一效果软上限延迟 (e3.1e9)</li><li>扩展时空胶囊价格降低至 ^0.9</li><li><b>伪增益</b> & <b>底数</b> 加成 TE 获取（乘），且效果提升至立方</li><li><b>增强时间</b> 提升至 1.1 次幂</li></ul><br><br>";
        if (player.ma.mastered.includes("e")) desc += "<h2>增强</h2><br><br><ul><li>增强获取指数提高 (0.02 -> 0.025)</li><li>增强子第二效果提升至 100 次方</li><li><b>增强声望</b> 影响点数获取，且效果提高 ^1.5</li><li><b>进入 E-空间</b> 加强 250%</li><li><b>野兽般增长</b> 底数提高 (1.1 -> 1e2,000)</li><li><b>进阶</b> 提高至立方</li></ul><br><br>";
        if (player.ma.mastered.includes("s")) desc += "<h2>空间</h2><br><br><ul><li>空间价格底数降低 (1e10 -> 10)</li><li>空间价格指数降低 (1.85 -> 1.4)</li><li>建筑增益除以 3.85，但建筑价格缩放被 5 倍减缓</li></ul><br><br>";
        if (player.ma.mastered.includes("sb")) desc += "<h2>超级增幅器</h2><br><br><ul><li>超级增幅器价格底数降低 (1.05 -> 1.025)</li><li>超级增幅器价格指数降低 (1.25 -> 1.075)</li><li>超级增幅器价格除以 1.333</li><li>超级增幅器提供虚增幅器</li></ul><br><br>";
        if (player.ma.mastered.includes("sg")) desc += "<h2>超级生成器</h2><br><br><ul><li>超级生成器价格底数降低 (1.05 -> 1.04)</li><li>超级生成器价格指数降低 (1.25 -> 1.225)</li><li>超级生成器价格除以 1.1</li><li>超级 GP 效果平方</li><li>超级生成器随时间提供虚生成器</li></ul><br><br>";
        if (player.ma.mastered.includes("q")) desc += "<h2>诡异</h2><br><br><ul><li>诡异获取指数提高 (7.5e-3 -> 8e-3)</li><li>QE 效果软上限开始提高 ^1.5</li><li>诡异层价格底数降低至 ^0.75</li><li><b>千种能力</b> 提高 50%</li><li>第十建筑等级提供免费的诡异改良（等于其等级除以 4）</li></ul><br><br>";
        if (player.ma.mastered.includes("h")) desc += "<h2>障碍</h2><br><br><ul><li>障碍灵魂获取指数提高 (0.125 -> 0.2)</li><li>障碍灵魂软上限效果变弱 (指数 4 次根 -> 指数 2.5 次根)</li><li>解锁一个新障碍里程碑</li><li><b>速度之魔</b> 有第二效果</li><li><b>空间紧缺</b> 提高 40%</li><li><b>永恒</b> & <b>D 选项</b> 不再有完成次数限制</li><li><b>永恒</b> 效果提升 ^5</li><li><b>减产</b>对诡异层价格底数的削弱更强 (0.15 -> 0.2)</li></ul><br><br>";
        if (player.ma.mastered.includes("o")) desc += "<h2>阳光</h2><br><br><ul><li>每个超级增幅器为阳光获取指数提高 0.5%（叠加）</li><li>SE 获取指数限制提高到 0.15，但 0.1 之后它增长大幅度减缓</li><li>SE 第二效果提高 10%</li><li>每 OoM 阳光为太阳能 +20%</li><li>阳光可购买项获取提高 ^2.6</li><li>一行阳光可购买项的所有效果提升 ^1.1</li><li><b>对流能</b> 效果提高 ^25</li><li>第二行所有阳光可购买项的所有效果乘以 1.4</li><li>第三行阳光可购买项的效果乘以 1.9</li></ul><br><br>";
        if (player.ma.mastered.includes("ss")) desc += "<h2>子空间</h2><br><br><ul><li>子空间价格底数降低 (1.15 -> 1.1)</li><li>子空间价格指数降低 (1.1 -> 1.07)</li><li>每个子空间能量将子空间底数乘 1e10</li><li>第三建筑效果提高 ^3</li><li>当 <b>子空间觉醒</b> 效果超过 100%，其被立方但除以 10,000</li><li><b>粉碎使徒</b> 效果提升 ^400</li><li><b>止步</b> 效果翻倍</li><li><b>挑战加速</b> 的临界点大幅度提高 (e1,000,000 -> e1e11)</li></ul><br><br>";
        if (player.ma.mastered.includes("m")) desc += "<h2>魔法</h2><br><br><ul><li>魔法获取指数提高 (7e-3 -> 8.5e-3)</li><li>魔法强度 +50%</li><li>妖术效果软上限不再作用于对障碍灵魂、诡异和 SE 的获取增幅，但这个效果被开方</li><li>每 OoM 魔法延迟妖术效果软上限 1e-3%</li><li>妖术效果软上限指数提高 (10 -> 2e3)</li></ul><br><br>";
        if (player.ma.mastered.includes("ba")) desc += "<h2>平衡</h2><br><br><ul><li>平衡获取指数提高 (5e-3 -> 0.0125)</li><li>消极和积极不再有惩罚</li><li><b>净中立</b> 的两个效果指数提高 ^2.5</li><li><b>实体重生</b> 提高 ^10</li></ul><br><br>";
        if (player.ma.mastered.includes("ps")) desc += "<h2>幽魂</h2><br><br><ul><li>幽魂价格底数开方</li><li>幽魂获取公式提高 (PS^1.5 -> 1.2^PS)</li><li>恶魂效果提高 ^100</li><li>幽魂价格缩放减缓 50% </li><li>灵魂价格缩放减缓 20%</li><li>幽魂增幅器增强 10%</li></ul><br><br>";
        if (player.ma.mastered.includes("hn")) desc += "<h2>荣耀</h2><br><br><ul><li>对于平衡的荣耀获取指数提高 (0.02 -> 0.05)</li><li>第二个荣耀升级不再有软上限</li><li><b>自自协同</b> 效果乘 5</li><li><b>点数效率</b> 上限由 90% 提高至 92%%</li><li><b>超级升级</b> 效果乘 3</li><li><b>翻转强化</b> 提高 10%</li><li><b>列长长</b> 提高 10%</li><li><b>一次又一次</b> 效果翻倍</li><li><b>诅咒</b> 效果提高到 ^50</li></ul><br><br>";
        if (player.ma.mastered.includes("n")) desc += "<h2>星云</h2><br><br><ul><li>星云获取指数提高 (0.03 -> 0.05)</li><li>一级星尘效果提升 ^1.6</li><li>二级星尘效果提升 ^1.4</li><li>星尘获取提升 1e30x</li></ul><br><br>";
        if (player.ma.mastered.includes("hs")) desc += "<h2>超空间</h2><br><br><ul><li>超建筑上限需求缩放减缓 20%</li><li>每个购买的超空间提供 0.1% 超建筑增益</li><li>超建筑软上限延迟 0.1 等级开始</li></ul><br><br>";
        if (player.ma.mastered.includes("i")) desc += "<h2>砖石</h2><br><br><ul><li>帝国建筑价格底数降低 (1e250 -> 1e100)</li><li>每个星云砖将星云获取乘以 10</li><li>每个超空间砖将超空间能量获取乘以 10</li><li>解锁 2 个新的帝国建筑</li></ul><br><br>";
        return desc;
    },
    milestones: {
        0: {
            requirementDescription: "1 专精",
            done() { return player.ma.best.gte(1) },
            effectDescription: "对于所有第七行重置保留超空间和星团，解锁自动幽灵。",
            toggles: [["ps", "autoGhost"]],
        },
        1: {
            requirementDescription: "2 专精",
            done() { return player.ma.best.gte(2) },
            effectDescription: "你可以最大购买砖石（同时不重置任何东西），每秒获得 100% 的荣耀，对于任何重置保留荣耀里程碑和荣耀升级。",
        },
        2: {
            requirementDescription: "3 专精",
            done() { return player.ma.best.gte(3) },
            effectDescription: "重置时保留帝国建筑 I 和超建筑，每秒获取 100% 超空间能量。",
        },
        3: {
            requirementDescription: "4 专精",
            done() { return player.ma.best.gte(4) },
            effectDescription: "每秒获得 100% 星云。",
        },
        4: {
            requirementDescription: "5 专精",
            done() { return player.ma.best.gte(5) },
            effectDescription: "解锁自动砖石。",
            toggles: [["i", "auto"]],
        },
        5: {
            unlocked() { return hasMilestone("ma", 4) },
            requirementDescription: "16 专精",
            done() { return player.ma.best.gte(16) },
            effectDescription: "解锁自动超空间",
            toggles: [["hs", "auto"]],
        },
    },
    clickables: {
        rows: 1,
        cols: 1,
        11: {
            title: "镀金",
            cap: 19,
            display() {
                if (player.ma.current!==null) return "正在镀金: "+tmp[player.ma.current].name+"。点此结束此运行。";
                else return player.ma.selectionActive?"你在镀金模式中。点击你想要镀金的层，点此退出镀金。":("开始一次镀金。<br><br>"+((tmp.ma.amtMastered>=this.cap)?"已满":("需要: "+formatWhole(tmp[this.layer].clickables[this.id].req)+" 专精")));
            },
            unlocked() { return player.ma.unlocked },
            req() { return [2,5,7,8,9,9,10,10,11,12,14,14,15,16,18,20,21,22,23,(1e300)][tmp.ma.amtMastered||0] },
            canClick() { return player.ma.unlocked && (player.ma.selectionActive?true:(tmp.ma.amtMastered<this.cap&&player.ma.points.gte(tmp[this.layer].clickables[this.id].req))) },
            onClick() { 
                if (player.ma.current !== null) {
                    if (!confirm("你确定要退出此次镀金运行吗？")) return;
                    player.ma.selectionActive = false;
                    player.ma.current = null;
                    doReset("ma", true);
                } else player.ma.selectionActive = !player.ma.selectionActive;
            },
            style: {"height": "200px", "width": "200px"},
        },
    },
    amtMastered() {
        let amt = tmp.ma.mastered.length;
        if (player.ma.current!==null) if (player.ma.mastered.includes(player.ma.current)) amt--;
        return amt;
    },
    mastered() {
        if (player.ma.current!==null) return player.ma.mastered.concat(player.ma.current);
        return player.ma.mastered;
    },
    canBeMastered() {
        if (!player.ma.selectionActive) return [];
        if (player.ma.mastered.length==0) return ["p"];
        let rows = player.ma.mastered.map(x => tmp[x].row)
        let realRows = rows.filter(y => Object.keys(ROW_LAYERS[y]).every(z => player.ma.mastered.includes(z) || tmp.ma.masteryGoal[z]===undefined));
        let furthestRow = Math.max(...realRows)+((player.ma.current !== null)?0:1);
        let m = Object.keys(layers).filter(x => (tmp[x].row<=furthestRow&&tmp.ma.masteryGoal[x]!==undefined&&(tmp.ma.specialReqs[x]?tmp.ma.specialReqs[x].every(y => player.ma.mastered.includes(y)):true))||player.ma.mastered.includes(x));
        if (player.ma.current !== null) m.push(player.ma.current);
        
        return m;
    },
    startMastery(layer) {
        if (!confirm("你确定要开始镀金 "+tmp[layer].name+" 吗？这会进行一次第七行重置，并使你处于仅镀金层以及正在镀金层活跃的运行。")) return;
        player.ma.current = layer;
        
        if (player[layer].upgrades) player[layer].upgrades = [];
        if (player[layer].challenges) for (let n in player[layer].challenges) player[layer].challenges[n] = null;
        if (player.subtabs[layer]) player.subtabs[layer].mainTabs = "Main Tab";
        if (layer=="n") {
            resetBuyables("n");
            player.n.activeSecondaries = {purpleBlue: false, blueOrange: false, orangePurple: false};
        }
        if (layer=="hs") {
            resetBuyables("hs")
            player.hs.spentHS = new Decimal(0);
        }
        if (layer=="i") resetBuyables("i");
        
        doReset("ma", true);
    },
    completeMastery(layer) {
        let data = tmp.ma;
        if (player[layer].points.lt(data.masteryGoal[layer])) return;
        if (!player.ma.mastered.includes(layer)) player.ma.mastered.push(layer);
        player.ma.selectionActive = false;
        player.ma.current = null;
        doReset("ma", true);
    },
    specialReqs: {
        sb: ["t","e","s"],
        sg: ["t","e","s"],
        h: ["q"],
        o: ["q","h"],
        ss: ["q","h"],
        ps: ["m","ba"],
        n: ["hn"],
        hs: ["hn"],
        i: ["n","hs"],
    },
    masteryGoal: {
        p: new Decimal("1e11488"),
        b: new Decimal(2088),
        g: new Decimal(1257),
        t: new Decimal(814),
        e: new Decimal("e3469000"),
        s: new Decimal(817),
        sb: new Decimal(36),
        sg: new Decimal(20),
        q: new Decimal("e480000"),
        h: new Decimal("e416000"),
        o: new Decimal(1e34),
        ss: new Decimal(21),
        m: new Decimal("1e107350"),
        ba: new Decimal("1e207500"),
        ps: new Decimal(115),
        hn: new Decimal("1e31100"),
        n: new Decimal("1e397"),
        hs: new Decimal("1e512"),
        i: new Decimal(43),
    },
    rowLimit: 6,
})
/*
                                    
                                    
                                    
                                    
                                    
                                    
ggggggggg   ggggg    eeeeeeeeeeee    
g:::::::::ggg::::g  ee::::::::::::ee  
g:::::::::::::::::g e::::::eeeee:::::ee
g::::::ggggg::::::gge::::::e     e:::::e
g:::::g     g:::::g e:::::::eeeee::::::e
g:::::g     g:::::g e:::::::::::::::::e 
g:::::g     g:::::g e::::::eeeeeeeeeee  
g::::::g    g:::::g e:::::::e           
g:::::::ggggg:::::g e::::::::e          
g::::::::::::::::g  e::::::::eeeeeeee  
gg::::::::::::::g   ee:::::::::::::e  
gggggggg::::::g     eeeeeeeeeeeeee  
        g:::::g                     
gggggg      g:::::g                     
g:::::gg   gg:::::g                     
g::::::ggg:::::::g                     
gg:::::::::::::g                      
ggg::::::ggg                        
   gggggg                           
*/
addLayer("ge", {
    name: "gears", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "GE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        rotations: new Decimal(0),
        energy: new Decimal(0),
        toothPower: new Decimal(0),
        shrinkPower: new Decimal(0),
        boosted: new Decimal(0),
        maxToggle: false,
        auto: false,
        autoTime: new Decimal(0),
    }},
    color: "#bfbfbf",
    nodeStyle() { return {
        background: (player.ge.unlocked||canReset("ge"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #bfbfbf 0%, #838586 100%)":"#838586"):"#bf8f8f",
    }},
    componentStyles: {
        background() { return (player.ge.unlocked||canReset("ge"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #bfbfbf 0%, #838586 100%)":"#bfbfbf"):"#bf8f8f" },
    },
    requires: new Decimal(1e256), // Can be a function that takes requirement increases into account
    resource: "齿轮", // Name of prestige currency 
    baseResource: "尘积", // Name of resource prestige is based on
    baseAmount() {return tmp.n.dustProduct}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(0.01), // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (player.mc.unlocked) mult = mult.times(clickableEffect("mc", 12));
        if (player.mc.upgrades.includes(11)) mult = mult.times(buyableEffect("mc", 12));
        if (hasMilestone("ge", 2)) mult = mult.times(player.en.total.max(1));
        if (player.r.unlocked) mult = mult.times(tmp.r.buildingEff);
        if (hasMilestone("id", 5) && tmp.id) mult = mult.times(tmp.id.rev.max(1));
        if (hasUpgrade("ai", 33)) mult = mult.times(upgradeEffect("ai", 33));
        if (hasUpgrade("ai", 44)) mult = mult.times(upgradeEffect("ai", 44));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (hasUpgrade("ai", 34)) exp = exp.times(1.2);
        return exp;
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "E", description: "按 Shift+E 进行齿轮重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    passiveGeneration() { return hasMilestone("ge", 2)?0.01:0 },
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        if (layers[resettingLayer].row >= this.row) {
            player.ge.energy = new Decimal(0);
            player.ge.toothPower = new Decimal(0);
            player.ge.shrinkPower = new Decimal(0);
            player.ge.rotations = new Decimal(0);
        }
    },
    layerShown(){return player.ma.unlocked },
    branches: ["n", "r"],
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display", "blank",
        "milestones",
        "blank", "blank", 
        ["display-text", function() { return "<h3>齿轮速度: "+format(tmp.ge.gearSpeed)+"x</h3>"+(tmp.nerdMode?" (cbrt(gears))":"") }],
        "blank",
        ["display-text", function() { return "<b>齿轮半径: "+format(tmp.ge.radius)+"m</b>"+(tmp.nerdMode?" (teeth*toothSize/6.28)":"") }], "blank",
        ["row", [["display-text", function() { return "<h3>转速: "+formatWhole(player.ge.rotations, true)+" ("+tmp.ge.rotDesc+")</h3><br>转速效果: 加成星云和星尘获取 "+format(tmp.ge.rotEff)+(tmp.nerdMode?" ((x+1)^5)":"") }]]],
        "blank", "blank",
        ["clickable", 21],
        "blank", "blank",
        ["row", [["column", [["raw-html", function() { return "<h3>齿: "+(hasMilestone("ge", 3)?format(tmp.ge.teeth):formatWhole(tmp.ge.teeth, true))+"</h3>" }], "blank", ["clickable", 11]], {"background-color": "#b0babf", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}], ["column", [["raw-html", function() { return "<h3>动能: "+format(player.ge.energy)+" J</h3><br><br>速度: "+format(tmp.ge.speed)+"m/s"+(tmp.nerdMode?" (sqrt(x))":"") }], "blank", ["clickable", 12]], {"background-color": "#dec895", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}], ["column", [["raw-html", function() { return "<h3>齿大小: "+format(tmp.ge.toothSize)+"m</h3><br><br>" }], "blank", ["clickable", 13]], {"background-color": "#bfa1b8", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}]]], "blank",
        ["buyable", 11], "blank",
    ],
    update(diff) {
        if (!player.ge.unlocked) return;
        let factor = tmp.ge.gearSpeed
        player.ge.energy = player.ge.energy.plus(factor.times(diff).times(tmp.ge.clickables[12].effect));
        player.ge.toothPower = player.ge.toothPower.plus(factor.times(diff));
        player.ge.shrinkPower = player.ge.shrinkPower.plus(factor.times(diff));
        player.ge.rotations = player.ge.rotations.plus(tmp.ge.rps.times(diff));
        player.ge.autoTime = player.ge.autoTime.plus(diff);
        if (player.ge.auto && hasMilestone("ge", 3) && player.ge.autoTime.gte(.5)) {
            player.ge.autoTime = new Decimal(0);
            if (layers.ge.clickables[11].canClick()) layers.ge.clickables[11].onClick();
            if (layers.ge.clickables[12].canClick()) layers.ge.clickables[12].onClick();
            if (layers.ge.clickables[13].canClick()) layers.ge.clickables[13].onClick();
        }
    },
    rotEff() {
        return softcap("rotEff", player.ge.rotations.round().plus(1).pow(5));
    },
    gearSpeed() {
        let speed = player.ge.points.cbrt().times(player.mc.unlocked?tmp.mc.mechEff:1);
        if (player.mc.upgrades.includes(11)) speed = speed.times(buyableEffect("mc", 12));
        return speed;
    },
    rps() {
        return tmp.ge.speed.div(tmp.ge.teeth.times(tmp.ge.toothSize)).times(tmp.ge.gearSpeed)
    },
    rotDesc() {
        let rps = tmp.ge.rps;
        let desc = "";
        if (rps.lt(1)) desc = format(rps.times(60))+" RPM";
        else desc = format(rps)+" RPS";
        
        if (tmp.nerdMode) desc += " </h3>((velocity*gearSpeed)/(radius*6.28))<h3>"
        return desc;
    },
    speed() {
        return player.ge.energy.sqrt();
    },
    teeth() {
        let t = player.ge.toothPower.pow(1.5).plus(100).div(tmp.ge.clickables[11].unlocked?tmp.ge.clickables[11].effect:1);
        if (hasMilestone("ge", 3)) return t.max(0);
        else return t.floor().max(1);
    },
    toothSize() {
        return player.ge.shrinkPower.plus(1).pow(-0.5).div(tmp.ge.clickables[13].effect).times(player.mc.unlocked?tmp.mc.buyables[11].effect.pow(hasAchievement("a", 125)?(-1):1):1);
    },
    radius() { return tmp.ge.teeth.times(tmp.ge.toothSize).div(2*Math.PI) },
    boostReducedPurch() { return tmp.ge.buyables[11].effect.times(4) },
    boostReq() { 
        let x = player.ge.boosted.sub(tmp.ge.boostReducedPurch);
        if (x.gte(20)) x = x.pow(2).div(20);
        return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
    },
    boostReqFormula() { return player.ge.boosted.sub(tmp.ge.boostReducedPurch).gte(20)?"1e10^(((totalBought^2)/20)^1.2) * 1e280":"1e10^(totalBought^1.2) * 1e280" },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "齿轮进化",
            costDiv() {
                let div = new Decimal(1);
                if (hasAchievement("a", 124)) div = div.times(3);
                return div;
            },
            free() {
                let free = new Decimal(0);
                if (hasAchievement("a", 132)) free = free.plus(2);
                return free;
            },
            power() {
                let pow = new Decimal(1);
                if (hasAchievement("a", 124)) pow = pow.times(1.2);
                if (hasUpgrade("ai", 14)) pow = pow.times(1.111);
                return pow;
            },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(15)) x = x.times(1.63);
                return Decimal.pow(125, x.pow(1.425)).times(1e3).div(tmp.ge.buyables[this.id].costDiv)
            },
            effectPer() { return Decimal.div(tmp.ge.buyables[this.id].power, 2) },
            effect() { return Decimal.mul(tmp[this.layer].buyables[this.id].effectPer, player[this.layer].buyables[this.id].plus(tmp.ge.buyables[this.id].free).times(hasUpgrade("ai", 13)?1.5:1)) },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = "重置所有齿轮升级，并进行一次第七行重置，对每个效果底数加成 "+format(data.effectPer)+"，并降低它们的价格 "+format(data.effectPer.times(4))+" 次购买。<br><br>需要: "+formatWhole(cost)+" 转速"+(tmp.nerdMode?" (价格公式: 125^(x^1.425)*1e3)":"")+".<br>当前: 底数+"+format(data.effect)+"，价格降低 "+format(data.effect.times(4))+" 购买";
                return display;
            },
            unlocked() { return unl(this.layer) }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player[this.layer].unlocked && player.ge.rotations.gte(cost);
            },
            buy() { 
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.ge.boosted = new Decimal(0);
                for (let i=11;i<=13;i++) player.ge.clickables[i] = "";
                if (!hasMilestone("ge", 3)) doReset("ge", true);
            },
            buyMax() {
                // later :)
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return false },
        },
    },
    clickables: {
        rows: 2,
        cols: 3,
        11: {
            title() { return "齿数量除以 "+format(tmp.ge.clickables[this.id].effectPer) },
            display() { 
                return "需要: "+format(tmp.ge.clickables[this.id].req)+" 尘积"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>当前: /"+format(tmp.ge.clickables[this.id].effect);
            },
            req() {
                if (hasMilestone("ge", 1)) {
                    let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
                    if (x.gte(20)) x = x.pow(2).div(20);
                    return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
                } else return tmp.ge.boostReq;
            },
            effectPer() { return Decimal.add(2, tmp.ge.buyables[11].effect) },
            effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
            unlocked() { return player.ge.unlocked && hasAchievement("a", 133) },
            canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
            onClick() { 
                if (player.ge.maxToggle && hasMilestone("ge", 0)) {
                    let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
                    if (x.gte(20)) x = x.times(20).sqrt();
                    x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
                    let totalOther;
                    if (hasMilestone("ge", 1)) totalOther = 0;
                    else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
                    let target = x.sub(totalOther).max(0);
                    player.ge.boosted = player.ge.boosted.max(x);
                    player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
                } else {
                    player.ge.boosted = player.ge.boosted.plus(1);
                    player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
                }
            },
            style: {"height": "150px", "width": "150px"},
        },
        12: {
            title() { return "增幅动能 "+format(tmp.ge.clickables[this.id].effectPer)+"x" },
            display() { 
                return "需要: "+format(tmp.ge.clickables[this.id].req)+" 尘积"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>当前: "+format(tmp.ge.clickables[this.id].effect)+"x";
            },
            req() {
                if (hasMilestone("ge", 1)) {
                    let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
                    if (x.gte(20)) x = x.pow(2).div(20);
                    return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
                } else return tmp.ge.boostReq;
            },
            effectPer() { return Decimal.add(6, tmp.ge.buyables[11].effect).times(hasAchievement("a", 123)?4:1) },
            effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
            unlocked() { return player.ge.unlocked },
            canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
            onClick() { 
                if (player.ge.maxToggle && hasMilestone("ge", 0)) {
                    let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
                    if (x.gte(20)) x = x.times(20).sqrt();
                    x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
                    let totalOther;
                    if (hasMilestone("ge", 1)) totalOther = 0;
                    else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
                    let target = x.sub(totalOther).max(0);
                    player.ge.boosted = player.ge.boosted.max(x);
                    player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
                } else {
                    player.ge.boosted = player.ge.boosted.plus(1);
                    player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
                }
            },
            style: {"height": "150px", "width": "150px"},
        },
        13: {
            title() { return "齿大小除以 "+format(tmp.ge.clickables[this.id].effectPer) },
            display() { 
                return "需要: "+format(tmp.ge.clickables[this.id].req)+" 尘积"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>当前: /"+format(tmp.ge.clickables[this.id].effect);
            },
            req() {
                if (hasMilestone("ge", 1)) {
                    let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
                    if (x.gte(20)) x = x.pow(2).div(20);
                    return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
                } else return tmp.ge.boostReq;
            },
            effectPer() { return Decimal.add(2, tmp.ge.buyables[11].effect) },
            effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
            unlocked() { return player.ge.unlocked },
            canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
            onClick() { 
                if (player.ge.maxToggle && hasMilestone("ge", 0)) {
                    let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
                    if (x.gte(20)) x = x.times(20).sqrt();
                    x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
                    let totalOther;
                    if (hasMilestone("ge", 1)) totalOther = 0;
                    else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
                    let target = x.sub(totalOther).max(0);
                    player.ge.boosted = player.ge.boosted.max(x);
                    player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
                } else {
                    player.ge.boosted = player.ge.boosted.plus(1);
                    player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
                }
            },
            style: {"height": "150px", "width": "150px"},
        },
        21: {
            title: "重置齿轮升级",
            unlocked() { return player.ge.unlocked },
            canClick() { return player.ge.unlocked && player.ge.boosted.gt(0) },
            onClick() { 
                if (!confirm("你确定要重置齿轮升级吗？这会导致一次齿轮重置。")) return;
                player.ge.boosted = new Decimal(0);
                for (let i=11;i<=13;i++) player.ge.clickables[i] = "";
                doReset("ge", true);
            },
            style: {"height": "75px", "width": "100px"},
        },
    },
    milestones: {
        0: {
            requirementDescription: "1,000,000 齿轮",
            done() { return player.ge.best.gte(1e6) },
            effectDescription: "你可以最大购买齿轮升级。",
            toggles: [["ge", "maxToggle"]],
        },
        1: {
            requirementDescription: "2e22 齿轮",
            unlocked() { return player.ge.best.gte(1e6) },
            done() { return player.ge.best.gte(2e22) },
            effectDescription: "每个齿轮升级的价格增长独立计算。",
        },
        2: {
            requirementDescription: "5e47 齿轮 & 25,000,000 总能量",
            unlocked() { return player.en.unlocked },
            done() { return player.en.unlocked && player.ge.best.gte(5e47) && player.en.total.gte(25e6) },
            effectDescription: "总能量乘以齿轮获取，每秒获得 1% 的齿轮。",
        },
        3: {
            requirementDescription: "1e141 齿轮",
            unlocked() { return hasUpgrade("ai", 13) },
            done() { return hasUpgrade("ai", 13) && player.ge.best.gte(1e141) },
            effectDescription: "齿可以是小数（小于 1），齿轮进化不再强制进行第七行重置，解锁自动齿轮升级。",
            toggles: [["ge", "auto"]],
        },
    },
})
/*
                                        
                                        
                                        
                                        
                                        
                                        
mmmmmmm    mmmmmmm       cccccccccccccccc
mm:::::::m  m:::::::mm   cc:::::::::::::::c
m::::::::::mm::::::::::m c:::::::::::::::::c
m::::::::::::::::::::::mc:::::::cccccc:::::c
m:::::mmm::::::mmm:::::mc::::::c     ccccccc
m::::m   m::::m   m::::mc:::::c             
m::::m   m::::m   m::::mc:::::c             
m::::m   m::::m   m::::mc::::::c     ccccccc
m::::m   m::::m   m::::mc:::::::cccccc:::::c
m::::m   m::::m   m::::m c:::::::::::::::::c
m::::m   m::::m   m::::m  cc:::::::::::::::c
mmmmmm   mmmmmm   mmmmmm    cccccccccccccccc
                                        
                                        
                                        
                                        
                                        
                                        
                                        
*/
addLayer("mc", {
    name: "machines", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MC", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        mechEn: new Decimal(0),
        autoSE: false,
        auto: false,
    }},
    color: "#c99a6b",
    nodeStyle() { return {
        background: (player.mc.unlocked||canReset("mc"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #c99a6b 0%, #706d6d 100%)":"#c99a6b"):"#bf8f8f",
    }},
    componentStyles: {
        "prestige-button": {
            background() { return (canReset("mc"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #c99a6b 0%, #706d6d 100%)":"#c99a6b"):"#bf8f8f" },
        },
    },
    requires: new Decimal(128000), // Can be a function that takes requirement increases into account
    resource: "组件", // Name of prestige currency 
    baseResource: "星云砖", // Name of resource prestige is based on
    baseAmount() {return player.i.hb}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(4), // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (player.mc.upgrades.includes(11)) mult = mult.times(buyableEffect("mc", 12));
        if (hasMilestone("mc", 0)) mult = mult.times(player.ne.thoughts.max(1));
        if (hasUpgrade("ai", 33)) mult = mult.times(upgradeEffect("ai", 33));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "按 C 进行机械重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    passiveGeneration() { return hasMilestone("mc", 0)?0.01:0 },
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return player.ma.unlocked },
    branches: ["hs", "i", "id"],
    update(diff) {
        if (!player[this.layer].unlocked) return;
        player.mc.mechEn = player.mc.mechEn.plus(player.ge.rotations.times(tmp.mc.mechPer).times(diff)).times(tmp.mc.decayPower.pow(diff));
        if (hasMilestone("id", 3) && player.mc.autoSE) layers.mc.buyables[11].buyMax();
        if (hasMilestone("mc", 1) && player.mc.auto) {
            player.mc.clickables[11] = player.mc.clickables[11].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
            player.mc.clickables[12] = player.mc.clickables[12].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
            player.mc.clickables[21] = player.mc.clickables[21].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
            player.mc.clickables[22] = player.mc.clickables[22].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
        }
    },
    mechEnMult() {
        let mult = new Decimal(1);
        if (player.id.unlocked) mult = mult.times(tmp.id.revEff);
        if (player.c.unlocked) mult = mult.times(tmp.c.eff4);
        return mult;
    },
    mechPer() { return tmp.mc.buyables[11].effect.pow(tmp.mc.buyables[11].buffExp).times(clickableEffect("mc", 11)) },
    decayPower() { return player.mc.mechEn.plus(1).log10().div(hasUpgrade("ai", 31)?2:1).plus(1).pow(-2) },
    mechEff() { return Decimal.pow(10, player.mc.mechEn.plus(1).log10().root(4).div(2)) },
    tabFormat: {
        "The Shell": {
            buttonStyle() { return {'background-color': '#706d6d'} },
            content: ["main-display",
            "prestige-button",
            "resource-display", "blank",
            "milestones",
            "blank", 
            "respec-button", "blank", ["buyable", 11],
        ]},
        "The Motherboard": {
            buttonStyle() { return {'background-color': '#c99a6b', color: "black"} },
            content: ["blank", ["display-text", function() { return "每齿轮转速提供 "+format(tmp.mc.mechPer)+" 机械能量，总计 <h3>"+format(player.mc.mechEn.times(tmp.mc.mechEnMult))+" 机械能量</h3>" }],
            "blank", ["display-text", function() { return tmp.mc.decayPower.eq(1)?"":("由于储存力差，每秒丢失 "+format(tmp.mc.decayPower.pow(-1).log10())+" OoMs。") }],
            "blank", ["display-text", function() { return "其增幅齿轮速度 "+format(tmp.mc.mechEff)+(tmp.nerdMode?"x (公式: 10^((log(x+1)^0.25)/2))":"x") }],
            "blank", ["upgrade", 11], "blank",
            "clickables",
        ]},
        "The Core": {
            unlocked() { return player.mc.upgrades.includes(11) },
            buttonStyle() { return {'background-color': '#c76e6b', "border-color": "#c76e6b", color: "black"} },
            content: ["blank", ["buyable", 12]],
        },
    },
    milestones: {
        0: {
            requirementDescription: "125,000,000 组件 & 1e9 信号",
            unlocked() { return player.ne.unlocked && player.mc.unlocked },
            done() { return player.ne.unlocked && ((player.mc.best.gte(1.25e8) && player.ne.signals.gte(1e9)) || player.mc.milestones.includes(0)) },
            effectDescription: "思考加成组件获取，每秒获取 1% 的组件。",
        },
        1: {
            requirementDescription: "1e50,000 机械能量",
            unlocked() { return hasUpgrade("ai", 31) },
            done() { return hasUpgrade("ai", 31) && player.mc.mechEn.times(tmp.mc.mechEnMult).gte("1e50000") },
            effectDescription: "CPU 效果提升至 25 次方，解锁自动主板。",
            toggles: [["mc", "auto"]],
        },
    },
    clickables: {
        rows: 2,
        cols: 2,
        activeLimit() { return hasAchievement("a", 141)?4:(hasAchievement("a", 133)?2:1) },
        11: {
            title: "CPU",
            display() { 
                return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 动能增幅机械能量获取 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (kineticEnergy+1)^(1-1/sqrt(log(activeMechEnergy+1)+1)))":"x");
            },
            effect() { 
                let eff = Decimal.pow(player.ge.energy.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).sqrt())));
                if (hasMilestone("mc", 1)) eff = eff.pow(25);
                if (!eff.eq(eff)) return new Decimal(1);
                return eff;
            },
            unlocked() { return player.mc.unlocked },
            canClick() { return player.mc.unlocked },
            onClick() {
                if (player.mc.clickables[this.id].eq(0)) {
                    let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
                    if (activeClickables>=tmp.mc.clickables.activeLimit) {
                        player.mc.clickables = getStartClickables("mc");
                        doReset("mc", true);
                    }
                }
                player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
                player.mc.mechEn = new Decimal(0);
            },
            style: {id: "11", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
        },
        12: {
            title: "接口",
            display() { 
                return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 幽魂增幅齿轮获取 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (phantomSouls+1)^(1-1/sqrt(log(activeMechEnergy+1)+1)))":"x");
            },
            effect() { return Decimal.pow(player.ps.points.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).sqrt()))) },
            unlocked() { return player.mc.unlocked },
            canClick() { return player.mc.unlocked },
            onClick() {
                if (player.mc.clickables[this.id].eq(0)) {
                    let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
                    if (activeClickables>=tmp.mc.clickables.activeLimit) {
                        player.mc.clickables = getStartClickables("mc");
                        doReset("mc", true);
                    }
                }
                player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
                player.mc.mechEn = new Decimal(0);
            },
            style: {id: "12", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
        },
        21: {
            title: "北桥",
            display() { 
                return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 阳光增幅超级生成器底数 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (solarity+1)^("+formatWhole(tmp.mc.clickables[this.id].effExp)+"-"+formatWhole(tmp.mc.clickables[this.id].effExp)+"/((log(activeMechEnergy+1)+1)^0.125)))":"x");
            },
            effExp() { return hasAchievement("a", 133)?3:1 },
            effect() { return Decimal.pow(player.o.points.plus(1), Decimal.sub(tmp.mc.clickables[this.id].effExp, Decimal.div(tmp.mc.clickables[this.id].effExp, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).root(8)))) },
            unlocked() { return player.mc.unlocked },
            canClick() { return player.mc.unlocked },
            onClick() {
                if (player.mc.clickables[this.id].eq(0)) {
                    let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
                    if (activeClickables>=tmp.mc.clickables.activeLimit) {
                        player.mc.clickables = getStartClickables("mc");
                        doReset("mc", true);
                    }
                }
                player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
                player.mc.mechEn = new Decimal(0);
            },
            style: {id: "21", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
        },
        22: {
            title: "南桥",
            display() { 
                return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 超空间能量加成平衡获取 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (hyperspaceEnergy+1)^(1-1/cbrt(log(activeMechEnergy+1)+1)))":"x");
            },
            effect() { return Decimal.pow(player.hs.points.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).cbrt()))) },
            unlocked() { return player.mc.unlocked },
            canClick() { return player.mc.unlocked },
            onClick() {
                if (player.mc.clickables[this.id].eq(0)) {
                    let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
                    if (activeClickables>=tmp.mc.clickables.activeLimit) {
                        player.mc.clickables = getStartClickables("mc");
                        doReset("mc", true);
                    }
                }
                player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
                player.mc.mechEn = new Decimal(0);
            },
            style: {id: "22", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
        },
    },
    buyables: {
        showRespec() { return player.mc.unlocked },
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            resetBuyables(this.layer)
            doReset(this.layer, true) // Force a reset
        },
        rows: 1,
        cols: 2,
        11: {
            title: "命令行扩展",
            costDiv() { return new Decimal(hasAchievement("a", 132)?7:1) },
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return x.div(10).plus(0.5).div(tmp[this.layer].buyables[this.id].costDiv).ceil();
            },
            buffExp() { 
                let exp = hasAchievement("a", 132)?25:5;
                if (hasUpgrade("ai", 33)) exp *= 100;
                return exp;
            },
            effect() { return player[this.layer].buyables[this.id].plus(1).sqrt() },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = "需要: "+formatWhole(cost)+" 组件"+(tmp.nerdMode?" (价格公式: floor((x/10+0.5)^1.1)":"")+".<br><br><h3>当前命令行大小: "+formatWhole(amt)+"m</h3>，加成机械能量获取 "+format(data.effect.pow(data.buffExp))+(tmp.nerdMode?" (公式: (x+1)^2.5)":"")+" "+(hasAchievement("a", 125)?"并除以":"但乘以")+"齿轮的齿大小 "+format(data.effect)+(tmp.nerdMode?" (公式: sqrt(x+1))":"");
                return display;
            },
            unlocked() { return unl(this.layer) }, 
            canAfford() {
                let cost = tmp[this.layer].buyables[this.id].cost
                return player[this.layer].unlocked && player.mc.points.gte(cost);
            },
            buy() { 
                let b = player[this.layer].buyables[this.id];
                let c = player.mc.points.times(tmp[this.layer].buyables[this.id].costDiv);
                let n = b.pow(2).times(4).plus(b.times(36)).plus(c.times(80)).plus(81).sqrt().sub(11).div(2).plus(1).floor();
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(n)
                 if (n.sub(b).eq(1)) 
                    player.mc.points = player.mc.points.sub(tmp[this.layer].buyables[this.id].cost);
                else player.mc.points = player.mc.points.sub(n.sub(b).times(b.plus(n).plus(10)).times(0.05).max(n.sub(b)).div(tmp[this.layer].buyables[this.id].costDiv).floor()).max(0);
            },
            buyMax() {
                let c = player.mc.points.times(tmp[this.layer].buyables[this.id].costDiv);
                let n = c.sub(.5).times(10).plus(1).floor().max(0);
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(n);
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return hasMilestone("id", 3) && player.mc.autoSE },
        },
        12: {
            title: "核心",
            cost(x=player[this.layer].buyables[this.id]) {
                if (x.gte(4)) x = x.pow(4).div(64);
                return Decimal.pow(10, Decimal.pow(1.5, x.plus(1).cbrt()).times(3e14))
            },
            effect() { return player[this.layer].buyables[this.id].times(1e4).plus(1).pow(.56) },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = "价格: "+format(cost)+" 点数"+(tmp.nerdMode?" (价格公式: 10^((1.5^cbrt("+(amt.gte(4)?"(x^4)/64":"x")+"+1))*3e14)":"")+".<br><br>等级: "+formatWhole(amt)+"<br><br>效果: GP 效果提升 ^"+format(data.effect)+"，齿轮获取、组件获取以及齿轮速度乘以 "+format(data.effect)+(tmp.nerdMode?" (公式: (10,000*level+1)^0.56)":"");
                return display;
            },
            unlocked() { return unl(this.layer) && player.mc.upgrades.includes(11) }, 
            canAfford() {
                if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                let cost = tmp[this.layer].buyables[this.id].cost
                return player[this.layer].unlocked && player.points.gte(cost);
            },
            buy() { 
                player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
                player.mc.buyables[this.id] = player.mc.buyables[this.id].plus(1);
            },
            style: {'height':'250px', 'width':'250px', 'background-color'() { return tmp.mc.buyables[12].canAfford?'#c76e6b':'#bf8f8f' }, "border-color": "#c76e6b"},
            autoed() { return false },
        },
    },
    upgrades: {
        rows: 1,
        cols: 1,
        11: {
            title: "解锁核心",
            unlocked() { return !player.mc.upgrades.includes(11) },
            multiRes: [
                {
                    cost: new Decimal(5e3),
                },
                {
                    currencyDisplayName: "机械能量",
                    currencyInternalName: "mechEn",
                    currencyLayer: "mc",
                    cost: new Decimal("1e420"),
                },
            ],
        },
    },
})



















































































/*
                          
                          
                    iiii  
                   i::::i 
                    iiii  
                          
  aaaaaaaaaaaaa   iiiiiii 
  a::::::::::::a  i:::::i 
  aaaaaaaaa:::::a  i::::i 
           a::::a  i::::i 
    aaaaaaa:::::a  i::::i 
  aa::::::::::::a  i::::i 
 a::::aaaa::::::a  i::::i 
a::::a    a:::::a  i::::i 
a::::a    a:::::a i::::::i
a:::::aaaa::::::a i::::::i
 a::::::::::aa:::ai::::::i
  aaaaaaaaaa  aaaaiiiiiiii
                          
                          
                          
                          
                          
                          
                          
*/
addLayer("ai", {
    name: "AI", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        time: new Decimal(0),
        consc: new Decimal(0),
    }},
    color: "#e6ffcc",
    nodeStyle() { return {
        background: (player.ai.unlocked||canReset("ai"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #e6ffcc 0%, #566b65 100%)":"#e6ffcc"):"#bf8f8f",
    }},
    componentStyles: {
        "prestige-button": {
            background() { return (canReset("ai"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #e6ffcc 0%, #566b65 100%)":"#e6ffcc"):"#bf8f8f" },
        },
    },
    requires: new Decimal(1e20), // Can be a function that takes requirement increases into account
    resource: "超级智能", // Name of prestige currency 
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(0.1), // Prestige currency exponent
    roundUpCost: true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        mult = mult.times(buyableEffect("ai",12));
        if (hasUpgrade("ai", 22)) mult = mult.times(upgradeEffect("ai", 22));
        if(hasUpgrade("ai",23)) mult = mult.mul(upgradeEffect("ai",23).ai)

        if (hasUpgrade("ai", 41)) mult = mult.times(upgradeEffect("ai", 41));
        if (hasUpgrade("ai", 43)) mult = mult.times(upgradeEffect("ai", 43));
        if (hasUpgrade("ai", 44)) mult = mult.times(player.ai.buyables[11].max(1));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "R", description: "按 Shift+R 进行 AI 重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    passiveGeneration() { return 0 },
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row == this.row) {
            player.ai.time = new Decimal(0);
            player.ai.consc = new Decimal(0);
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return player.c.unlocked },
    branches: ["r", ["id", 3]],
    update(diff) {
        if (!player[this.layer].unlocked) return;
        player.ai.time = player.ai.time.plus(diff);
        // player.ai.consc = player.ai.consc.plus(tmp.ai.buyables[11].effect.times(diff)).div(Decimal.pow(tmp.ai.divConsc, diff));
        if (tmp.ai.divConsc.lte(1.00001)) player.ai.consc = player.ai.consc.add(tmp.ai.buyables[11].effect.mul(diff));
        else player.ai.consc = player.ai.consc.add(tmp.ai.buyables[11].effect.mul(0.001).sub(player.ai.consc.mul(tmp.ai.divConsc.pow(0.001).sub(1))).mul(tmp.ai.divConsc.pow(0.001).sub(1).recip().mul(Decimal.sub(1, tmp.ai.divConsc.pow(0.001).recip().pow(diff*1000)))))

        if (hasMilestone("ai", 3)) for (let i=3;i>=1;i--) layers.ai.buyables[10+i].buyMax();
    },
    divConsc() {
        var div = player.ai.time.plus(1).log10().plus(1).sqrt() 
        if(hasUpgrade("ai",12)) div = div.cbrt()
        if(hasMilestone("ai",2)) div = new Decimal(1)
        return div
    },
    conscEff1() { return player.ai.consc.plus(1).pow(player.ai.consc.add(10).log10().root(2).add(1)) },
    //conscEff2() { return player.ai.consc.plus(1).log(3).plus(1) },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display", "blank",
        "milestones","buyables", "blank",
        ["display-text", function() { return "<h3>"+format(player.ai.consc)+"</h3> 人工意识（基于当前第一行重置后时间，每秒除以 "+format(tmp.ai.divConsc)+"）" }], 
        ["display-text", function() { return "效果：将点数取乘以 "+format(tmp.ai.conscEff1)+(tmp.nerdMode?" (x+1)":"")}],"blank", "blank",
        ["clickable", 11],
        ["display-text", function() { return "节点："+formatWhole(player.ai.upgrades.length)+" / "+formatWhole(tmp.ai.nodeSlots) }], "blank",
        "upgrades", "blank",
    ],
    nodeSlots() {
        var slots = player.ai.buyables[11].div(2).plus(player.ai.buyables[11].sub(6).div(2).max(0)).plus(player.ai.buyables[11].gte(1)?1:0)
        if(slots.gte(5)) slots = slots.add(5**(1/0.44)-5).pow(0.44)
        return slots.floor().min(16).toNumber()
    },
    upgrades: {
        rows: 4,
        cols: 4,
        11: {
            title: "节点 AA",
            description: "文明力量增强 20%。",
            multiRes: [
                {
                    cost: new Decimal(10),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(5),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked },
            style: {height: '150px', width: '150px'},
        },
        12: {
            title: "节点 AB",
            description: "意识降低速度变为其立方根。",
            multiRes: [
                {
                    cost: new Decimal(10),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(180),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked },
            style: {height: '150px', width: '150px'},
        },
        13: {
            title: "节点 AC",
            description: "人口能影响对应能量。",
            multiRes: [
                {
                    cost: new Decimal(1e6),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(1e6),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
            style: {height: '150px', width: '150px'},
        },
        14: {
            title: "Node AD",
            description: "启示获取提高 50%，齿轮进化效果增强 11.1%。",
            multiRes: [
                {
                    cost: new Decimal(5e3),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(5e8),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
            style: {height: '150px', width: '150px'},
        },
        21: {
            title: "节点 BA",
            description: "超级智能加成人工意识获取。",
            multiRes: [
                {
                    cost: new Decimal(50),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(300),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked },
            effect() { return softcap("AI_BA", Decimal.pow(3,player.ai.points.add(10).log10().root(1.25).sub(1))) },
            effectDisplay() { return format(tmp.ai.upgrades[21].effect)+"x" },
            style: {height: '150px', width: '150px'},
        },
        22: {
            title: "节点 BB",
            description: "基于人工意识提升超级智能获取。",
            multiRes: [
                {
                    cost: new Decimal(50),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(2e3),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            effect() { return player.ai.consc.div(1000).add(1).cbrt() },
            effectDisplay() { return format(tmp.ai.upgrades[this.id].effect)+"x" },
            unlocked() { return player.ai.unlocked },
            style: {height: '150px', width: '150px'},
        },
        23: {
            title: "节点 BC",
            description: "超级智能和文明互相加成。解锁一些里程碑。",
            multiRes: [
                {
                    cost: new Decimal(2e26),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(2e20),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            effect() {
                var eff = {}
                eff.ai = player.c.points.add(1).pow(1.919810)
                eff.c = player.ai.points.add(1).sqrt()
                return eff
            },
            effectDisplay() {
                 return `超级智能: x${format(tmp.ai.upgrades[this.id].effect.ai)}
                 文明价格: /${format(tmp.ai.upgrades[this.id].effect.c)}`
                },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
            style: {height: '150px', width: '150px'},
        },
        24: {
            title: "节点 BD",
            description: "齿轮加成星云获取。",
            multiRes: [
                {
                    cost: new Decimal(2e4),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(2e9),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
            style: {height: '150px', width: '150px'},
            effect() { return player.ge.points.max(1).pow(5) },
            effectDisplay() { return format(tmp.ai.upgrades[24].effect)+"x" },
            formula: "x^5",
        },
        31: {
            title: "节点 CA",
            description: "复刻上方两个升级。",
            multiRes: [
                {
                    cost: new Decimal(1e40),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(1e29),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
            style: {height: '150px', width: '150px'},
        },
        32: {
            title: "节点 CB",
            description: "“AI文明”&“意识进化”效果^2。",
            multiRes: [
                {
                    cost: new Decimal(1e125),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(1e75),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
            style: {height: '150px', width: '150px'},
        },
        33: {
            title: "节点 CC",
            description: "咕咕咕",
            multiRes: [
                {
                    cost: new Decimal("1e14514"),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(790000),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
            style: {height: '150px', width: '150px'},
            effect() { return player.ai.points.plus(1).pow(1.5) },
            effectDisplay() { return format(tmp.ai.upgrades[33].effect)+"x" },
            formula: "(x+1)^1.5",
        },
        34: {
            title: "节点 CD",
            description: "超级能量，思维能量，齿轮获取提高到 1.2 次幂。",
            multiRes: [
                {
                    cost: new Decimal(5e4),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(1e10),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
            style: {height: '150px', width: '150px'},
        },
        41: {
            title: "节点 DA",
            description: "专精加成超级能量获取。",
            multiRes: [
                {
                    cost: new Decimal(5e3),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(5e8),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
            style: {height: '150px', width: '150px'},
            effect() { return Decimal.pow(1.05, player.ma.points) },
            effectDisplay() { return format(tmp.ai.upgrades[41].effect)+"x" },
            formula: "1.05^x",
        },
        42: {
            title: "节点 DB",
            description: "每个激活的 AI 节点将信号获取乘以 100。",
            multiRes: [
                {
                    cost: new Decimal(2e4),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(2e9),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
            style: {height: '150px', width: '150px'},
            effect() { return Decimal.pow(100, player.ai.upgrades.length) },
            effectDisplay() { return format(tmp.ai.upgrades[42].effect)+"x" },
            formula: "100^x",
        },
        43: {
            title: "节点 DC",
            description: "想法增幅超级能量获取。",
            multiRes: [
                {
                    cost: new Decimal(5e4),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(1e10),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
            style: {height: '150px', width: '150px'},
            effect() { return Decimal.pow(1.075, player.id.points) },
            effectDisplay() { return format(tmp.ai.upgrades[43].effect)+"x" },
            formula: "1.075^x",
        },
        44: {
            title: "节点 DD",
            description: "人工意识增幅齿轮获取，AI 网络乘以超级智能获取。",
            multiRes: [
                {
                    cost: new Decimal(1e6),
                },
                {
                    currencyDisplayName: "人工意识",
                    currencyInternalName: "consc",
                    currencyLayer: "ai",
                    cost: new Decimal(5e11),
                },
            ],
            canAfford() {
                let a = canAffordUpgrade(this.layer, this.id, true);
                return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
            },
            unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
            style: {height: '150px', width: '150px'},
            effect() { return player.ai.consc.plus(1).pow(5) },
            effectDisplay() { return format(tmp.ai.upgrades[44].effect)+"x" },
            formula: "x^5",
        },
    },
    buyables: {
        rows: 1,
        cols: 3,
        11: {
            title: "AI 网络",
            cost(x=player[this.layer].buyables[this.id]) {
                return {
                    ai: Decimal.pow(3, x.add(3).pow(1.2)).div(5),
                };
            },
            effect() {
                var eff = Decimal.pow(4, player[this.layer].buyables[this.id]).sub(1).times(hasAchievement("a", 163)?player.id.points.max(1):1) 
                if(hasUpgrade("ai",21)) eff = eff.mul(upgradeEffect("ai",21))
                if(hasUpgrade("ai",31)) eff = eff.mul(upgradeEffect("ai",21))
                return eff
                },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = formatWhole(player.ai.points)+" / "+formatWhole(cost.ai)+" 超级智能"+(tmp.nerdMode?(" (10^(x+1))"):"")+"<br><br>等级: "+formatWhole(amt)+"<br><br>奖励: 每秒产生 "+formatWhole(data.effect)+" 人工意识"+(tmp.nerdMode?" (4^x-1)":".");
                return display;
            },
            unlocked() { return unl(this.layer) }, 
            canAfford() {
                if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                let cost = layers[this.layer].buyables[this.id].cost();
                return player[this.layer].unlocked && player.ai.points.gte(cost.ai);
            },
            buy() { 
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.ai.points = player.ai.points.sub(cost.ai);
                player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(1);
            },
            buyMax(){
                var t = player.ai.points.max(1).mul(5).log(3).root(1.2).sub(2).sub(player.ai.buyables[this.id]).floor().max(0)
                player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(t);
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return hasMilestone("ai",3) },
        },
        12: {
            title: "意识进化",
            cost(x=player[this.layer].buyables[this.id]) {
                return {
                    consc: Decimal.pow(3.14, x.pow(1.1)).mul(300),
                };
            },
            effect() {
                var eff = Decimal.pow(2,player[this.layer].buyables[this.id].add(1).pow(0.8).sub(1))
                if(hasUpgrade("ai",32)) eff = eff.pow(2)
                //if(hasUpgrade("ai",21)) eff = eff.mul(upgradeEffect("ai",21))
                return eff
                },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = formatWhole(player.ai.consc)+" / "+formatWhole(cost.consc)+" 人工意识"+(tmp.nerdMode?(" (10^(x+2)^1.1)"):"")+"<br><br>等级: "+formatWhole(amt)+"<br><br>奖励: 超级智能获取x "+format(data.effect)+(tmp.nerdMode?" (4^x-1)":".");
                return display;
            },
            unlocked() { return unl(this.layer) }, 
            canAfford() {
                if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                let cost = layers[this.layer].buyables[this.id].cost();
                return player[this.layer].unlocked && player.ai.consc.gte(cost.consc);
            },
            buy() { 
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.ai.consc = player.ai.consc.sub(cost.consc);
                player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(1);
                if(!hasMilestone("ai",1)) doReset(this.layer)
            },
            buyMax(){
                var t = player.ai.consc.max(1).div(300).log(3.14).root(1.1).add(1).sub(player.ai.buyables[this.id]).floor().max(0)
                player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(t);
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return hasMilestone("ai",3) },
        },
        13: {
            title: "AI文明",
            cost(x=player[this.layer].buyables[this.id]) {
                return {
                    consc: Decimal.pow(3.14, x.add(1).pow(1.14514)).mul(31400),
                };
            },
            effect() {
                var eff = Decimal.pow(2,player[this.layer].buyables[this.id].add(1).pow(0.375).sub(1))
                if(hasUpgrade("ai",32)) eff = eff.pow(2)
                eff = softcap("AI_C",eff)
                return eff
                },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = formatWhole(player.ai.consc)+" / "+formatWhole(cost.consc)+" 人工意识"+(tmp.nerdMode?(" (10^(x+2)^1.1)"):"")+"<br><br>等级: "+formatWhole(amt)+"<br><br>奖励: 文明重置要求变为其 "+format(data.effect)+(tmp.nerdMode?" 次根(4^x-1)":" 次根.");
                return display;
            },
            unlocked() { return unl(this.layer) }, 
            canAfford() {
                if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                let cost = layers[this.layer].buyables[this.id].cost();
                return player[this.layer].unlocked && player.ai.consc.gte(cost.consc);
            },
            buy() { 
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.ai.consc = player.ai.consc.sub(cost.consc);
                player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(1);
                if(!hasMilestone("ai",1)) doReset(this.layer)
            },
            buyMax(){
                var t = player.ai.consc.max(1).div(31400).log(3.14).root(1.14514).sub(player.ai.buyables[this.id]).floor().max(0)
                player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(t);
            },
            style: {'height':'200px', 'width':'200px'},
            autoed() { return hasMilestone("ai",3) },
        },
    },
    clickables: {
        rows: 1,
        cols: 1,
        11: {
            title: "删除所有 AI 节点",
            display: "",
            unlocked() { return player.ai.unlocked },
            canClick() { return player.ai.unlocked && player.ai.upgrades.length>0 },
            onClick() { 
                if (!confirm("你确定要删除所有节点吗？会强制进行一次 AI 重置！")) return;
                player.ai.upgrades = [];
                doReset("ai", true);
            },
            style: {width: "80px", height: "80px"},
        },
    },
    milestones:{
        1:{
            requirementDescription:"1e40超级智能",
            effectDescription:"购买可重复购买项时不会进行一次重置。",
            unlocked(){return hasUpgrade("ai",23)},
            done(){return hasUpgrade("ai",23) && player.ai.points.gte(1e40)}
        },
        2:{
            requirementDescription:"1e60超级智能",
            effectDescription:"每秒获得10%的超级智能。您的人工意识不再衰减。",
            unlocked(){return hasUpgrade("ai",23)},
            done(){return hasUpgrade("ai",23) && player.ai.points.gte(1e50)}
        },
        3:{
            requirementDescription:"1e100超级智能",
            effectDescription:"自动ai购买项。",
            unlocked(){return hasUpgrade("ai",23)},
            done(){return hasUpgrade("ai",23) && player.ai.points.gte(1e100)}
        }
    },
    passiveGeneration(){return hasMilestone("ai",2)?0.1:0}
})
/*
                
                
                
                
                
                
cccccccccccccccc
cc:::::::::::::::c
c:::::::::::::::::c
c:::::::cccccc:::::c
c::::::c     ccccccc
c:::::c             
c:::::c             
c::::::c     ccccccc
c:::::::cccccc:::::c
c:::::::::::::::::c
cc:::::::::::::::c
cccccccccccccccc
                
                
                
                
                
                
                
*/
addLayer("c", {
    name: "civilizations", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        assigned: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
        gainedPower: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
        first: 0,
    }},
    color: "#edb3ff",
    requires() { return Decimal.sub(10, hasAchievement("a", 164)?player.c.buyables[11].times(2):0).max(2) }, // Can be a function that takes requirement increases into account
    resource: "文明力量", // Name of prestige currency
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    roundUpCost: true,
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1.25), // Prestige currency exponent
    base: new Decimal(10),
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.div(tmp.c.eff4)
        if(hasUpgrade("ai",23)) mult = mult.div(upgradeEffect("ai",23).c)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        var exp = new Decimal(1)
        exp = exp.mul(buyableEffect("ai",13))
        return exp
    },
    canBuyMax() { return false },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "C", description: "按 Shift+C 进行文明重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return false },
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    autoPrestige() { return false },
    layerShown(){return true},
    branches: [["i", 2], "id"],
    update(diff) {
        if (!player.c.unlocked) return;
        for (let i=0;i<5;i++){
            player.c.gainedPower[i] = Decimal.pow(2, player.c.gainedPower[i]).pow(3).plus(Decimal.pow(10, player.c.assigned[i]).sub(1).max(0).times(diff/10)).cbrt().log2()
        };
    },
    power() {
        let data = [];
        for (let i=1;i<=5;i++){
            data[i] = player.c.points.sub(i).div(5).plus(1).floor().max(0).sqrt().plus(player.c.gainedPower[i-1].sqrt()).mul(tmp.c.eff5)
            if(hasUpgrade("ai",11)) data[i] = data[i].mul(1.2)
            if(hasUpgrade("ai",31)) data[i] = data[i].mul(1.2)
            if(hasUpgrade("ai",13)) data[i] = data[i].pow(player.c.assigned[i-1].add(1).pow(0.05))
        };
        return data;
    },
    totalAssigned() { return player.c.assigned.reduce((a,c) => Decimal.add(a, c)) },
    minAssigned() { return player.c.assigned.reduce((a,c) => Decimal.min(a, c)) },
    eff1() { return Decimal.pow(25, tmp.c.power[1]).div(5).sub(1) },
    eff2() {
        var eff = player.points.add(10).log10().pow(tmp.c.power[2].pow(0.5).mul(2)) 
        //eff = powsoftcap(eff,n(10000),3)
        return eff
    },
    eff3() {
        var eff = Decimal.pow(player.c.points, tmp.c.power[3].add(3)) 
        eff = powsoftcap(eff,n(1000),2)
        return eff
    },
    eff4() { return player.points.add(10).log10().pow(tmp.c.power[4].pow(0.75)) },
    eff5() { return tmp.c.power[5].pow(2).plus(1).log(4).div(3).plus(1) },
    tabFormat: ["main-display",
        "prestige-button",
        "resource-display", "blank",
        "milestones",
        ["row", [
            ["column", [
                ["display-text", "<h3>文明<sub>1</sub></h3>"],
                ["display-text", function() { return (player.c.assigned[0].gt(0)?("人口: "+formatWhole(player.c.assigned[0])+"<br>"):"")+"力量: "+format(tmp.c.power[1].times(100))+"%" }], "blank",
                ["display-text", function() { return "效果: +"+format(tmp.c.eff1)+"点数/s" }],
                "blank", ["clickable", 11],
            ], function() { return {width: "9em", visibility: player.c.points.gte(1)?"visible":"hidden"}}],
            ["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(2)?"visible":"hidden"}}],
            ["column", [
                ["display-text", "<h3>文明<sub>2</sub></h3>"],
                ["display-text", function() { return (player.c.assigned[1].gt(0)?("人口: "+formatWhole(player.c.assigned[1])+"<br>"):"")+"力量: "+format(tmp.c.power[2].times(100))+"%" }], "blank",
                ["display-text", function() { return "效果: 点数增幅自身: x"+format(tmp.c.eff2) }],
                "blank", ["clickable", 12],
            ], function() { return {width: "9em", visibility: player.c.points.gte(2)?"visible":"hidden"}}],
            ["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(3)?"visible":"hidden"}}],
            ["column", [
                ["display-text", "<h3>文明<sub>3</sub></h3>"],
                ["display-text", function() { return (player.c.assigned[2].gt(0)?("人口: "+formatWhole(player.c.assigned[2])+"<br>"):"")+"力量: "+format(tmp.c.power[3].times(100))+"%" }], "blank",
                ["display-text", function() { return "效果: 点数产量乘以 "+format(tmp.c.eff3) + " (基于文明点数)" }],
                "blank", ["clickable", 13],
            ], function() { return {width: "9em", visibility: player.c.points.gte(3)?"visible":"hidden"}}],
            ["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(4)?"visible":"hidden"}}],
            ["column", [
                ["display-text", "<h3>文明<sub>4</sub></h3>"],
                ["display-text", function() { return (player.c.assigned[3].gt(0)?("人口: "+formatWhole(player.c.assigned[3])+"<br>"):"")+"力量: "+format(tmp.c.power[4].times(100))+"%" }], "blank",
                ["display-text", function() { return "效果: 文明要求/ "+format(tmp.c.eff4)+" (基于点数)" }],
                "blank", ["clickable", 14],
            ], function() { return {width: "9em", visibility: player.c.points.gte(4)?"visible":"hidden"}}],
            ["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(5)?"visible":"hidden"}}],
            ["column", [
                ["display-text", "<h3>文明<sub>5</sub></h3>"],
                ["display-text", function() { return (player.c.assigned[4].gt(0)?("人口: "+formatWhole(player.c.assigned[4])+"<br>"):"")+"力量: "+format(tmp.c.power[5].times(100))+"%" }], "blank",
                ["display-text", function() { return "效果: 所有力量乘以 "+format(tmp.c.eff5) }],
                "blank", ["clickable", 15],
            ], function() { return {width: "9em", visibility: player.c.points.gte(5)?"visible":"hidden"}}],
        ], function() { return {visibility: player.c.unlocked?"visible":"hidden"} }], "blank", "blank",
        "buyables",
    ],
    buyables: {
        showRespec() { return player.c.points.gte(6) },
        respec() {
            player[this.layer].points = player[this.layer].points.add(player[this.layer].spentOnBuyables);
            player.c.assigned = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)];
            player.c.gainedPower = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)];
            doReset(this.layer, true);
        },
        respecText: "重置人口",
        rows: 1,
        cols: 1,
        11: {
            title: "人口",
            cost(x=player[this.layer].buyables[this.id]) {
                return Decimal.pow(10, x.pow(1.75)).times(1e8).round();
            },
            cap() { 
                let cap = player.c.points.sub(4).max(0);
                cap = cap.plus(player.c.points.div(5).sub(1).max(0).floor().times(2));
                cap = cap.plus(player.c.points.div(12).max(0).floor());
                cap = cap.div(2)
                return cap;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = formatWhole(player.points)+" / "+formatWhole(cost)+" 点数"+(tmp.nerdMode?(" (1.5^(x^1.1))*400,000"):"")+"<br><br>人口: "+formatWhole(amt)+" / "+formatWhole(data.cap);
                return display;
            },
            unlocked() { return unl(this.layer) && player.c.points.gte(6) }, 
            canAfford() {
                if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                let cost = layers[this.layer].buyables[this.id].cost();
                return player[this.layer].unlocked && player.points.gte(cost) && player.c.buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap);
            },
            buy() { 
                let cost = tmp[this.layer].buyables[this.id].cost;
                player.points = player.points.sub(cost);
                player.c.buyables[this.id] = player.c.buyables[this.id].plus(1);
                doReset(this.layer, true);
            },
            style: {'height':'140px', 'width':'140px'},
            autoed() { return false },
        },
    },
    clickables: {
        rows: 1,
        cols: 5,
        11: {
            title: "+1 人口",
            display: "",
            unlocked() { return player.c.unlocked && player.c.points.gte(6) },
            canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[0]) },
            onClick() { 
                player.c.assigned[0] = player.c.assigned[0].plus(1);
            },
            style: {width: "120px", height: "50px", "border-radius": "0px"},
        },
        12: {
            title: "+1 人口",
            display: "",
            unlocked() { return player.c.unlocked && player.c.points.gte(6) },
            canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[1]) },
            onClick() { 
                player.c.assigned[1] = player.c.assigned[1].plus(1);
            },
            style: {width: "120px", height: "50px", "border-radius": "0px"},
        },
        13: {
            title: "+1 人口",
            display: "",
            unlocked() { return player.c.unlocked && player.c.points.gte(6) },
            canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[2]) },
            onClick() { 
                player.c.assigned[2] = player.c.assigned[2].plus(1);
            },
            style: {width: "120px", height: "50px", "border-radius": "0px"},
        },
        14: {
            title: "+1 人口",
            display: "",
            unlocked() { return player.c.unlocked && player.c.points.gte(6) },
            canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[3]) },
            onClick() { 
                player.c.assigned[3] = player.c.assigned[3].plus(1);
            },
            style: {width: "120px", height: "50px", "border-radius": "0px"},
        },
        15: {
            title: "+1 人口",
            display: "",
            unlocked() { return player.c.unlocked && player.c.points.gte(6) },
            canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[4]) },
            onClick() { 
                player.c.assigned[4] = player.c.assigned[4].plus(1);
            },
            style: {width: "120px", height: "50px", "border-radius": "0px"},
        },
    },
    milestones:{
        1:{
            requirementDescription:"100文明",
            effectDescription:"文明不会重置任何东西，自动文明重置，文明可以购买最大。",
            unlocked(){return hasUpgrade("ai",23)},
            done(){return hasUpgrade("ai",23) && player.ai.points.gte(1e40)}
        },
    },
    canBuyMax(){return hasMilestone("c",1)},
    autoPrestige(){return hasMilestone("c",1)},
    resetsNothing(){return hasMilestone("c",1)},
})