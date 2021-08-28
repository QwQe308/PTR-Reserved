
/*
                  
                  
                  
                  
                  
                  
  aaaaaaaaaaaaa   
  a::::::::::::a  
  aaaaaaaaa:::::a 
           a::::a 
    aaaaaaa:::::a 
  aa::::::::::::a 
 a::::aaaa::::::a 
a::::a    a:::::a 
a::::a    a:::::a 
a:::::aaaa::::::a 
 a::::::::::aa:::a
  aaaaaaaaaa  aaaa
                  
                  
                  
                  
                  
                  
                  
*/
addLayer("a", {
    startData() { return {
        unlocked: true,
    }},
    color: "yellow",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("成就")
    },
    achievements: {
        rows: 16,
        cols: 5,
        11: {
            name: "进展开始！",
            done() { return player.p.points.gt(0) },
            tooltip: "进行一次声望重置。",
            image: "images/achs/11.png",
        },
        12: {
            name: "点数鼹鼠",
            done() { return player.points.gte(25) },
            tooltip: "达到 25 点数。",
            image: "images/achs/12.png",
        },
        13: {
            name: "一直声望",
            done() { return player.p.upgrades.length>=3 },
            tooltip: "购买 3 个声望升级。\n奖励: 声望获取增加 10%。",
            image: "images/achs/13.png",
        },
        14: {
            name: "声望^2",
            done() { return player.p.points.gte(25) },
            tooltip: "达到 25 声望。",
            image: "images/achs/14.png",
        },
        15: {
            name: "第一终端",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("p") },
            tooltip: "镀金声望。",
            image: "images/achs/15.png",
        },
        21: {
            name: "新的行在召唤！",
            done() { return player.b.unlocked||player.g.unlocked },
            tooltip: "进行一次第二行的重置。\n奖励: 点数生成速度加快 10%，解锁 3 个新的声望升级。",
            image: "images/achs/21.png",
        },
        22: {
            name: "我终将获得所有的层！",
            done() { return player.b.unlocked&&player.g.unlocked },
            tooltip: "解锁 增幅器 & 生成器。",
            image: "images/achs/22.png",
        },
        23: {
            name: "声望^3",
            done() { return player.p.points.gte(1e45) },
            tooltip: "达到 1e45 声望。\n奖励: 解锁 3 个新的声望升级。",
            image: "images/achs/23.png",
        },
        24: {
            name: "喂？我还没拥有那家公司！",
            done() { return player.points.gte(1e100) },
            tooltip: "达到 1e100 点数。",
            image: "images/achs/24.png",
        },
        25: {
            name: "第二终端",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("b")&&player.ma.mastered.includes("g") },
            tooltip: "镀金增幅器和生成器。",
            image: "images/achs/25.png",
        },
        31: {
            name: "深深深入",
            done() { return player.e.unlocked||player.t.unlocked||player.s.unlocked },
            tooltip: "进行一次第三行的重置。奖励: 点数生成速度加快 50%，并且增幅器和生成器不再提高对方的需求。",
            image: "images/achs/31.png",
        },
        32: {
            name: "为啥没有元层？",
            done() { return player.points.gte(Number.MAX_VALUE) },
            tooltip: "达到 1.8e308 点数。\n奖励: 双倍声望获取。",
            image: "images/achs/32.png",
        },
        33: {
            name: "那很快",
            done() { return player.e.unlocked&&player.t.unlocked&&player.s.unlocked },
            tooltip: "解锁时间、增强和空间。\n奖励: 解锁新的时间、增强和空间升级。",
            image: "images/achs/33.png",
        },
        34: {
            name: "有谁会一直需要第二行？",
            done() { return player.b.best.eq(0) && player.g.best.eq(0) && player.points.gte("1e525") },
            tooltip: "不使用增幅器和生成器的情况下到达 1e525 点数。",
            image: "images/achs/34.png",
        },
        35: {
            name: "工具增强速度",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("t")&&player.ma.mastered.includes("e")&&player.ma.mastered.includes("s") },
            tooltip: "镀金时间、增强和空间。",
            image: "images/achs/35.png",
        },
        41: {
            name: "超级超级",
            done() { return player.sb.unlocked },
            tooltip: "解锁超级增幅器。\n奖励: 声望升级永远保留，解锁 3 个新的增幅器升级。",
            image: "images/achs/41.png",
        },
        42: {
            name: "另一个- [版权]",
            done() { return player.g.power.gte(Number.MAX_VALUE) },
            tooltip: "达到 1.8e308 GP。",
            image: "images/achs/42.png",
        },
        43: {
            name: "增强一家公司",
            done() { return player.e.points.gte(1e100) },
            tooltip: "达到 1e100 增强。",
            image: "images/achs/43.png",
        },
        44: {
            name: "空间留给怪胎",
            done() { return tmp.s.manualBuildingLevels.eq(0) && player.g.power.gte("1e370") },
            tooltip: "不使用建筑的情况下达到 1e370 GP。",
            image: "images/achs/44.png",
        },
        45: {
            name: "超精密",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("sb")&&player.ma.mastered.includes("sg") },
            tooltip: "镀金超级增幅器和超级生成器。",
            image: "images/achs/45.png",
        },
        51: {
            name: "又一行",
            done() { return player.h.unlocked||player.q.unlocked },
            tooltip: "进行一次第四行重置。\n奖励: 时间/增强/空间 不再提高对方的需求。",
            image: "images/achs/51.png",
        },
        52: {
            name: "障碍正在路上",
            done() { return inChallenge("h", 11) && player.points.gte("1e7250") },
            tooltip: '在 "升级荒漠" 中达到 e7,250 点数。',
            image: "images/achs/52.png",
        },
        53: {
            name: "已经？？？？",
            done() { return player.sg.unlocked },
            tooltip: "进行一次超级生成器重置。\n奖励: 获得两个额外空间。",
            image: "images/achs/53.png",
        },
        54: {
            name: "无敌 bug",
            done() { return player.sg.best.eq(0) && player.sb.best.eq(0) && player.points.gte("1e15500") },
            tooltip: "不使用超级增幅器和超级生成器的情况下达到 1e15,500 点数。",
            image: "images/achs/54.png",
        },
        55: {
            name: "邪恶的 HQ",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("q")&&player.ma.mastered.includes("h") },
            tooltip: "镀金诡异和障碍。",
            image: "images/achs/55.png",
        },
        61: {
            name: "SS",
            done() { return player.ss.unlocked || player.o.unlocked },
            tooltip: "进行一次阳光重置或一次子空间重置",
            image: "images/achs/61.png",
        },
        62: {
            name: "全抓走",
            done() { return player.ss.unlocked && player.o.unlocked },
            tooltip: "进行一次太阳重置和子空间重置。\n奖励: 太阳和子空间以首先选择其的方式运行。",
            image: "images/achs/62.png",
        },
        63: {
            name: "广袤",
            done() { return inChallenge("h", 21) && player.g.best.eq(0) && player.points.gte("1e25000") },
            tooltip: '在 "空间紧缺" 中不使用任何生成器达到 1e25,000 点数。',
            image: "images/achs/63.png",
        },
        64: {
            name: "永恒^2",
            done() { return player.h.challenges[31]>=10 },
            tooltip: '完成 10 次 "永恒"。\n奖励: 永远保留第 2/3 行的升级。',
            image: "images/achs/64.png",
        },
        65: {
            name: "血月",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("o")&&player.ma.mastered.includes("ss") },
            tooltip: "镀金阳光和子空间。",
            image: "images/achs/65.png",
        },
        71: {
            name: "另一个咬铁锈的",
            done() { return player.m.unlocked || player.ba.unlocked },
            tooltip: '进行一次第五行重置。\n奖励: 永远保留 2/3/4 行里程碑，"永恒" 可以被额外完成 10 次。',
            image: "images/achs/71.png",
        },
        72: {
            name: "生成器慢点",
            done() { return player.g.best.gte(1225) },
            tooltip: "达到 1,225 生成器。",
            image: "images/achs/72.png",
        },
        73: {
            name: "感觉很熟悉？",
            done() { return player.ps.unlocked },
            tooltip: "解锁幽魂。",
            image: "images/achs/73.png",
        },
        74: {
            name: "超级平衡",
            done() { return player.ba.points.gte(1e100) },
            tooltip: '达到 1e100 平衡。\n距离: "永恒" 可以被额外完成 10 次，"D 选项" 同样加成魔法和平衡获取。',
            image: "images/achs/74.png",
        },
        75: {
            name: "完美练习",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("m")&&player.ma.mastered.includes("ba")&&player.ma.mastered.includes("ps") },
            tooltip: "镀金魔法、平衡和幽魂。",
            image: "images/achs/75.png",
        },
        81: {
            name: "是的我的是",
            done() { return player.hn.unlocked },
            tooltip: '进行一次荣耀重置。\n奖励: 障碍不再重置你的声望和增幅器升级。',
            image: "images/achs/81.png",
        },
        82: {
            name: "不再是障碍了",
            done() { return player.points.gte("ee7") && player.h.activeChallenge>20 },
            tooltip: "在前两个之外的挑战中达到 e10,000,000 点数。",
            image: "images/achs/82.png",
        },
        83: {
            name: "不可能的任务",
            done() { return hasMilestone("hn", 7) },
            tooltip: "解锁幽魂增幅器。",
            image: "images/achs/83.png",
        },
        84: {
            name: "超越基础",
            done() { return player.points.gte("e9250000") && player.b.best.eq(0) && player.g.best.eq(0) },
            tooltip: "无增幅器和生成器达到 e9,250,000 点数。",
            image: "images/achs/84.png",
        },
        85: {
            name: "我理解你的痛苦",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("hn") },
            tooltip: "镀金荣耀。",
            image: "images/achs/85.png",
        },
        91: {
            name: "SPAAACE!!!!",
            done() { return player.n.unlocked || player.hs.unlocked },
            tooltip: "解锁星云或超空间。\n奖励: 荣耀获取增多 10%。",
            image: "images/achs/91.png",
        },
        92: {
            name: "银河",
            done() { return player.n.unlocked && player.hs.unlocked },
            tooltip: "解锁星云和超空间。\n奖励: 星云和超空间以首先选择其的方式运行。",
            image: "images/achs/92.png",
        },
        93: {
            name: "单位取消",
            done() { return player.i.unlocked },
            tooltip: "解锁帝国。",
            image: "images/achs/93.png",
        },
        94: {
            name: "终于打完障碍了",
            done() { return player.h.challenges[31]>=30 && player.h.challenges[32]>=10 },
            tooltip: '完成 30 次 "永恒" 和 10 次 "D 选项"。',
            image: "images/achs/94.png",
        },
        95: {
            name: "我讨厌这个机修",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("n")||player.ma.mastered.includes("hs") },
            tooltip: "镀金星云或超空间。\n奖励: 专精价格下降 15%。",
            image: "images/achs/95.png",
        },
        101: {
            name: "不可能领域",
            done() { return player.q.points.gte("e1e6") },
            tooltip: "达到 e1,000,000 诡异。\n奖励: 诡异层价格底数降低 0.2。",
            image: "images/achs/101.png",
        },
        102: {
            name: "我们不是在这之后吗？",
            done() { return inChallenge("h", 31) && player.h.challenges[31]>=30 && player.points.gte("e2e7") },
            tooltip: '在 "永恒" 障碍中达到 e20,000,000 点数（障碍需要至少被完成 30 次）。',
            image: "images/achs/102.png",
        },
        103: {
            name: "十亿个 0",
            done() { return player.points.gte("e1e9") },
            tooltip: "达到 e1e9 点数。\n奖励：建筑增益 +10%。",
            image: "images/achs/103.png",
        },
        104: {
            name: "集群",
            done() { return player.n.buyables[11].gte(5) },
            tooltip: "购买 5 星团。",
            image: "images/achs/104.png",
        },
        105: {
            name: "真正的建筑",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ma.mastered.includes("i") },
            tooltip: "镀金砖石。",
            image: "images/achs/105.png",
        },
        111: {
            name: "造物之地",
            done() { return player.ma.unlocked },
            tooltip: '进行一次专精重置。\n奖励: 对任何重置保留帝国建筑 II，你可以大批量完成 "永恒" 和 "D 选项"，这些障碍不会随完成次数提高而变难，解锁一列新成就。',
            image: "images/achs/111.png",
        },
        112: {
            name: "真实支配",
            done() { return player.ma.points.gte(10) },
            tooltip: "达到 10 专精。",
            image: "images/achs/112.png",
        },
        113: {
            name: "一万亿个 0",
            done() { return player.points.gte("ee12") },
            tooltip: "达到 e1e12 点数。\n奖励: 超建筑增益 +10%。",
            image: "images/achs/113.png",
        },
        114: {
            name: "E 选项？",
            done() { return player.h.challenges[32]>=900 },
            tooltip: '完成 "D 选项" 至少 900 次。',
            image: "images/achs/114.png",
        },
        115: {
            name: "永恒缠身",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ps.points.gte(1350) },
            tooltip: "达到 1,375 幽魂。\n奖励: 命令行扩展对齿轮大小的削弱改为增强。",
            image: "images/achs/115.png",
        },
        121: {
            name: "准备好了吗",
            done() { return player.ge.unlocked },
            tooltip() { return "解锁齿轮。\n奖励: 总超空间延缓超建筑软上限"+(tmp.nerdMode?" (公式: (x^0.2)/100)":" (当前: +"+format(player.hs.buyables[11].root(5).times(.1))+")") },
            image: "images/achs/121.png",
        },
        122: {
            name: "过多齿！",
            done() { return tmp.ge.teeth.gte(1e4) },
            tooltip: "使你的齿轮有至少 10,000 齿。",
            image: "images/achs/122.png",
        },
        123: {
            name: "年太阳能发电量",
            done() { return player.ge.energy.gte(1.2e34) },
            tooltip: "达到 1.2e34 J 动能。\n奖励: 动能升级效果翻四倍。",
            image: "images/achs/123.png",
        },
        124: {
            name: "完美之人",
            done() { return player.hn.points.gte("ee6") },
            tooltip: "达到 e1,000,000 荣耀。\n奖励: 齿轮进化价格需要 3 倍少的转速，同时增强 20%。",
            image: "images/achs/124.png",
        },
        125: {
            name: "无底洞",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.points.gte("e2.5e13") && inChallenge("h", 42) },
            tooltip: '在 "减产" 障碍中达到 e2.5e13 点数。',
            image: "images/achs/125.png",
        },
        131: {
            name: "人工无意识",
            done() { return player.mc.unlocked },
            tooltip: "解锁机械。\n奖励: 专精价格降低 10%。",
            image: "images/achs/131.png",
        },
        132: {
            name: "龟龟神",
            done() { return player.mc.buyables[11].gte(200) },
            tooltip: "命令行大小超过 200m。\n奖励: 命令行扩展的效果提升至 5 次幂，其价格除以 7，获得 2 个免费的齿轮进化。",
            image: "images/achs/132.png",
        },
        133: {
            name: "突破屏障",
            done() { return player.mc.mechEn.times(tmp.mc.mechEnMult).gte("1e375") },
            tooltip: "达到 1e375 机械能量。\n奖励: 你可以同时启用两个主板功能，北桥效果提升至立方，启用一个新的齿轮升级。",
            image: "images/achs/133.png",
        },
        134: {
            name: "内心的渴望",
            done() { return player.mc.upgrades.includes(11) },
            tooltip() { return "解锁核心。\n奖励: 每个幽魂降价专精价格 0.0075%。 (当前降价: "+format(Decimal.sub(1, Decimal.pow(.999925, player.ps.points)).times(100))+"%)" },
            image: "images/achs/134.png",
        },
        135: {
            name: "一千万亿个零！",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.points.gte("ee15") },
            tooltip: "达到 e1e15 点数。",
            image: "images/achs/135.png",
        },
        141: {
            name: "思维强大",
            done() { return player.en.unlocked || player.ne.unlocked },
            tooltip: "解锁能量或神经元。\n奖励: 你可以同时激活主板的所有效果。",
            image: "images/achs/141.png",
        },
        142: {
            name: "失败",
            done() { return player.en.sw.gte(104) },
            tooltip: "达到 104 超级能量。",
            image: "images/achs/142.png",
        },
        143: {
            name: "「大」脑",
            done() { return inChallenge("ne", 11) && player.points.gte("e5e11") },
            tooltip: "在大脑中达到 e5e11 点数。\n奖励: 三倍信号获取。",
            image: "images/achs/143.png",
        },
        144: {
            name: "修脚",
            done() { return player.mc.points.gte(1e11) },
            tooltip: "达到 1e11 组件。",
            image: "images/achs/144.png",
        },
        145: {
            name: "中心旋转",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ge.rotations.gte(2.5e19) && player.ge.boosted.eq(0) },
            tooltip: "无齿轮升级达到 2.5e19 转速。",
            image: "images/achs/145.png",
        },
        151: {
            name: "计划胜利",
            done() { return player.id.unlocked && player.r.unlocked },
            tooltip: "解锁机器人和想法。\n奖励: 永久保留能量里程碑 1-3 & 5，在大脑之外以降低速度获得信号。",
            image: "images/achs/151.png",
        },
        152: {
            name: "不太重要",
            done() { return player.g.power.gte("ee12") },
            tooltip: "达到 e1e12 GP。\n奖励: GP 效果提升至 1.4 次幂。",
            image: "images/achs/152.png",
        },
        153: {
            name: "加冕",
            done() { return player.hn.points.gte(Decimal.pow(10, 1e8)) },
            tooltip: "达到 e100,000,000 荣耀。",
            image: "images/achs/153.png",
        },
        154: {
            name: "悬浮棱镜",
            done() { return player.ne.thoughts.gte(625) && player.ne.points.lt(player.id.points) },
            tooltip: "在神经元少于想法的情况下，达到 625 思考。",
            image: "images/achs/154.png",
        },
        155: {
            name: "超级大脑",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.ne.thoughts.gte(1000) },
            tooltip: "达到 1,000 思考。\n 奖励: 想法效果增加 0.005。",
            image: "images/achs/155.png",
        },
        161: {
            name: "世界属于我们！",
            done() { return player.ai.unlocked },
            tooltip: "解锁 AI。",
            image: "images/achs/161.png",
        },
        162: {
            name: "这功能咋没用啊？",
            done() { return tmp.id.rev.gte(1650) && player.ai.upgrades.length==0 },
            tooltip: "无 AI 节点达到 1,650 启示。",
            image: "images/achs/162.png",
        },
        163: {
            name: "坐拥天下",
            done() { return player.c.unlocked },
            tooltip() { return "解锁文明。\n奖励: 想法乘以人工意识获取，这一行及以下的每个成就将专精需求除以 1.1（/"+format(Decimal.pow(1.1, player.a.achievements.filter(x => x>160).length))+"）。" },
            image: "images/achs/163.png",
        },
        164: {
            name: "存在即错误",
            done() { return player.c.buyables[11].gte(1) },
            tooltip() { return "获得至少 1 人口。\n奖励: 永远保留想法里程碑 1/5，每人口降低文明力量需求 2（-"+formatWhole(player.c.buyables[11].times(2).min(100))+"，上限位于 -100）。" },
            image: "images/achs/164.png",
        },
        165: {
            name: "F 选项？",
            unlocked() { return hasAchievement("a", 111) },
            done() { return player.h.challenges[32]>=1e6 },
            tooltip: "完成 D 选项至少 1e6 次。",
            image: "images/achs/165.png",
        },
    },
    tabFormat: [
        "blank", 
        ["display-text", function() { return "成就: "+player.a.achievements.length+"/"+(Object.keys(tmp.a.achievements).length-2) }], 
        "blank", "blank",
        "achievements",
    ],
    update(diff) {	// Added this section to call adjustNotificationTime every tick, to reduce notification timers
        adjustNotificationTime(diff);
    },	
}, 
)