addLayer("sc", {
	startData() { return {unlocked: true}},
	color: "#e6ff69",
	symbol: "SC",
	row: "side",
	layerShown() { return player.c.points.gte(6) && player.scShown },
	tooltip: "软上限",
	tabFormat: [
		"blank", "blank", "blank",
		["raw-html", function() {
			let html = ""
			for (let id in SOFTCAPS) {
				let data = SOFTCAPS[id];
				if (data.display) if (data.display()) {
					html += "<div><h3>"+data.title+"</h3><br>"+data.info();
					html += "</div><br><br>";
				}
			}
			return html;
		}],
	],
}) 
/*
                                      
                  bbbbbbbb            
                  b::::::b            
                  b::::::b            
                  b::::::b            
                   b:::::b            
  aaaaaaaaaaaaa    b:::::bbbbbbbbb    
  a::::::::::::a   b::::::::::::::bb  
  aaaaaaaaa:::::a  b::::::::::::::::b 
           a::::a  b:::::bbbbb:::::::b
    aaaaaaa:::::a  b:::::b    b::::::b
  aa::::::::::::a  b:::::b     b:::::b
 a::::aaaa::::::a  b:::::b     b:::::b
a::::a    a:::::a  b:::::b     b:::::b
a::::a    a:::::a  b:::::bbbbbb::::::b
a:::::aaaa::::::a  b::::::::::::::::b 
 a::::::::::aa:::a b:::::::::::::::b  
  aaaaaaaaaa  aaaa bbbbbbbbbbbbbbbb   
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("ab", {
	startData() { return {unlocked: true}},
	color: "yellow",
	symbol: "AB",
	row: "side",
	layerShown() { return player.t.unlocked || player.s.unlocked },
	tooltip: "自动购买",
	clickables: {
		rows: 6,
		cols: 4,
		11: {
			title: "增幅器",
			display(){
				return hasMilestone("t", 3)?(player.b.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.t.unlocked },
			canClick() { return hasMilestone("t", 3) },
			onClick() { player.b.auto = !player.b.auto },
			style: {"background-color"() { return player.b.auto?"#6e64c4":"#666666" }},
		},
		12: {
			title: "生成器",
			display(){
				return hasMilestone("s", 3)?(player.g.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.s.unlocked },
			canClick() { return hasMilestone("s", 3) },
			onClick() { player.g.auto = !player.g.auto },
			style: {"background-color"() { return player.g.auto?"#a3d9a5":"#666666" }},
		},
		13: {
			title: "增强子",
			display(){
				return hasMilestone("q", 1)?(player.e.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 1) },
			onClick() { player.e.auto = !player.e.auto },
			style: {"background-color"() { return player.e.auto?"#b82fbd":"#666666" }},
		},
		14: {
			title: "扩展时间胶囊",
			display(){
				return hasMilestone("q", 1)?(player.t.autoExt?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 1) },
			onClick() { player.t.autoExt = !player.t.autoExt },
			style: {"background-color"() { return player.t.autoExt?"#006609":"#666666" }},
		},
		21: {
			title: "时间胶囊",
			display(){
				return hasMilestone("q", 3)?(player.t.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 3) },
			onClick() { player.t.auto = !player.t.auto },
			style: {"background-color"() { return player.t.auto?"#006609":"#666666" }},
		},
		22: {
			title: "空间能量",
			display(){
				return hasMilestone("q", 3)?(player.s.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 3) },
			onClick() { player.s.auto = !player.s.auto },
			style: {"background-color"() { return player.s.auto?"#dfdfdf":"#666666" }},
		},
		23: {
			title: "超级增幅器",
			display(){
				return hasMilestone("q", 4)?(player.sb.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 4) },
			onClick() { player.sb.auto = !player.sb.auto },
			style: {"background-color"() { return player.sb.auto?"#504899":"#666666" }},
		},
		24: {
			title: "超级生成器",
			display(){
				return hasMilestone("q", 6)?(player.sg.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.sg.unlocked },
			canClick() { return hasMilestone("q", 6) },
			onClick() { player.sg.auto = !player.sg.auto },
			style: {"background-color"() { return player.sg.auto?"#248239":"#666666" }},
		},
		31: {
			title: "建筑",
			display(){
				return hasMilestone("q", 7)?(player.s.autoBld?"开":"关"):"禁用"
			},
			unlocked() { return player.sg.unlocked },
			canClick() { return hasMilestone("q", 7) },
			onClick() { player.s.autoBld = !player.s.autoBld },
			style: {"background-color"() { return player.s.autoBld?"#dfdfdf":"#666666" }},
		},
		32: {
			title: "诡异层",
			display(){
				return hasMilestone("ba", 1)?(player.q.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ba.unlocked },
			canClick() { return hasMilestone("ba", 1) },
			onClick() { player.q.auto = !player.q.auto },
			style: {"background-color"() { return player.q.auto?"#c20282":"#666666" }},
		},
		33: {
			title: "子空间能量",
			display(){
				return hasMilestone("ba", 2)?(player.ss.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ba.unlocked },
			canClick() { return hasMilestone("ba", 2) },
			onClick() { player.ss.auto = !player.ss.auto },
			style: {"background-color"() { return player.ss.auto?"#e8ffff":"#666666" }},
		},
		34: {
			title: "施法",
			display(){
				return hasMilestone("hn", 2)?(player.m.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.hn.unlocked },
			canClick() { return hasMilestone("hn", 2) },
			onClick() { player.m.auto = !player.m.auto },
			style: {"background-color"() { return player.m.auto?"#eb34c0":"#666666" }},
		},
		41: {
			title: "幽魂",
			display(){
				return hasMilestone("hn", 4)?(player.ps.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.hn.unlocked },
			canClick() { return hasMilestone("hn", 4) },
			onClick() { player.ps.auto = !player.ps.auto },
			style: {"background-color"() { return player.ps.auto?"#b38fbf":"#666666" }},
		},
		42: {
			title: "幽灵",
			display(){
				return hasMilestone("hn", 5)?(player.ps.autoW?"开":"关"):"禁用"
			},
			unlocked() { return player.hn.unlocked },
			canClick() { return hasMilestone("hn", 5) },
			onClick() { player.ps.autoW = !player.ps.autoW },
			style: {"background-color"() { return player.ps.autoW?"#b38fbf":"#666666" }},
		},
		43: {
			title: "灵魂",
			display(){
				return hasMilestone("ma", 0)?(player.ps.autoGhost?"开":"关"):"禁用"
			},
			unlocked() { return player.ma.unlocked },
			canClick() { return hasMilestone("ma", 0) },
			onClick() { player.ps.autoGhost = !player.ps.autoGhost },
			style: {"background-color"() { return player.ps.autoGhost?"#b38fbf":"#666666" }},
		},
		44: {
			title: "砖石",
			display(){
				return hasMilestone("ma", 4)?(player.i.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ma.unlocked },
			canClick() { return hasMilestone("ma", 4) },
			onClick() { player.i.auto = !player.i.auto },
			style: {"background-color"() { return player.i.auto?"#e5dab7":"#666666" }},
		},
		51: {
			title: "超空间",
			display(){
				return hasMilestone("ma", 5)?(player.hs.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ma.unlocked },
			canClick() { return hasMilestone("ma", 5) },
			onClick() { player.hs.auto = !player.hs.auto },
			style: {"background-color"() { return player.hs.auto?"#dfdfff":"#666666" }},
		},
		52: {
			title: "齿轮升级",
			display() { return hasMilestone("ge", 3)?(player.ge.auto?"开":"关"):"禁用" },
			unlocked() { return player.ai.unlocked && player.ge.unlocked },
			canClick() { return hasMilestone("ge", 3) },
			onClick() { player.ge.auto = !player.ge.auto },
			style: {"background-color"() { return player.ge.auto?"#ababab":"#666666" }},
		},
		53: {
			title: "命令行扩展",
			display() {
				return hasMilestone("id", 3)?(player.mc.autoSE?"开":"关"):"禁用"
			},
			unlocked() { return player.id.unlocked && player.mc.unlocked },
			canClick() { return hasMilestone("id", 3) },
			onClick() { player.mc.autoSE = !player.mc.autoSE },
			style: {"background-color"() { return player.mc.autoSE?"#c99a6b":"#666666" }},
		},
		54: {
			title: "主板",
			display() { return hasMilestone("mc", 1)?(player.mc.auto?"开":"关"):"禁用" },
			unlocked() { return player.ai.unlocked && player.mc.unlocked },
			canClick() { return hasMilestone("mc", 1) },
			onClick() { player.mc.auto = !player.mc.auto },
			style: {"background-color"() { return player.mc.auto?"#c99a6b":"#666666" }},
		},
		61: {
			title: "神经元",
			display() {
				return hasMilestone("ne", 5)?(player.ne.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ne.unlocked && player.en.unlocked },
			canClick() { return hasMilestone("ne", 5) },
			onClick() { player.ne.auto = !player.ne.auto },
			style: {"background-color"() { return player.ne.auto?"#ded9ff":"#666666" }},
		},
		62: {
			title: "神经网络",
			display() {
				return hasMilestone("ne", 7)?(player.ne.autoNN?"开":"关"):"禁用"
			},
			unlocked() { return player.ne.unlocked && player.ai.unlocked },
			canClick() { return hasMilestone("ne", 7) },
			onClick() { player.ne.autoNN = !player.ne.autoNN },
			style: {"background-color"() { return player.ne.autoNN?"#ded9ff":"#666666" }},
		},
		63: {
			title: "想法",
			display() { return hasMilestone("id", 4)?(player.id.auto?"开":"关"):"禁用" },
			unlocked() { return player.id.unlocked && player.ai.unlocked },
			canClick() { return hasMilestone("id", 4) },
			onClick() { player.id.auto = !player.id.auto },
			style: {"background-color"() { return player.id.auto?"#fad682":"#666666" }},
		},
	},
})
