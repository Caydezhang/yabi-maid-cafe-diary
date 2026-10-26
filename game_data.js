window.GAME_DATA = {
  assetsBase: "game_assets/",
  backgrounds: {
    cafe1f: "game_assets/bg_1f_maid_cafe.jpg",
    cheki2f: "game_assets/bg_2f_cheki_booth.jpg",
    liveB1: "game_assets/bg_b1_livehouse.jpg",
    rooftop3f: "game_assets/bg_3f_rooftop_night.jpg"
  },
  cgs: {
    prologueAlley: "game_assets/cg_prologue_alley_404.jpg",
    mahiruRain: "game_assets/cg_mahiru_rainy_night.jpg",
    duetZero: "game_assets/cg_reine_mahiru_duet.jpg",
    microwave: "game_assets/cg_kohaku_microwave.jpg",
    birthdayCake: "game_assets/cg_mahiru_birthday_cake.jpg",
    typhoonKohaku: "game_assets/cg_typhoon_kohaku.jpg",
    breakBadge: "game_assets/cg_luchen_break_badge.jpg",
    finaleLive: "game_assets/cg_new_year_live_finale.jpg"
  },
  characters: {
    mahiru: {
      id: "mahiru",
      name: "林真昼",
      tag: "NO.01 · 地雷系销冠",
      styleDesc: "前省重点理科尖子生 · 心算极快但极怕被扣分抛弃",
      avatar: "game_assets/char_mahiru_base.jpg",
      sprites: {
        normal: "game_assets/sprite_mahiru_normal.png",
        shy: "game_assets/sprite_mahiru_shy.png"
      },
      food: 60,
      charm: 85,
      stage: 35,
      social: 80,
      fatigue: 15,
      stress: 68, // Starts high on Day 1 so tutorial teaches resting or comforting her!
      bond: 20,
      capUnlocked: false,
      onDuty: true
    },
    reine: {
      id: "reine",
      name: "白石零音",
      tag: "NO.02 · 暗黑地偶主唱",
      styleDesc: "台上视觉系暴君 · 台下500度近视的炸厨房音乐苦行僧",
      avatar: "game_assets/char_reine_base.jpg",
      sprites: {
        normal: "game_assets/sprite_reine_stage.png",
        glasses: "game_assets/sprite_reine_glasses.png"
      },
      food: 18,
      charm: 55,
      stage: 92,
      social: 45,
      fatigue: 10,
      stress: 30,
      bond: 15,
      capUnlocked: false,
      onDuty: true
    },
    kohaku: {
      id: "kohaku",
      name: "陈琥珀",
      tag: "NO.03 · 涩谷辣妹大厨",
      styleDesc: "金粉狼尾高定裁缝 · 全店最懂柴米油盐的护短大姐头",
      avatar: "game_assets/char_kohaku_base.jpg",
      sprites: {
        normal: "game_assets/sprite_kohaku_normal.png",
        shy: "game_assets/sprite_kohaku_shy.png"
      },
      food: 82,
      charm: 75,
      stage: 42,
      social: 68,
      fatigue: 20,
      stress: 15,
      bond: 25,
      capUnlocked: false,
      onDuty: true
    },
    millie: {
      id: "millie",
      name: "苏千禧",
      tag: "NO.04 · Y2K赛博幽灵",
      styleDesc: "吧台底的天才原画师与黑客 · 线下社恐但线上梗图无敌",
      avatar: "game_assets/char_millie_base.jpg",
      sprites: {
        normal: "game_assets/sprite_millie_normal.png",
        happy: "game_assets/sprite_millie_happy.png"
      },
      food: 45,
      charm: 15,
      stage: 25,
      social: 95,
      fatigue: 10,
      stress: 25,
      bond: 20,
      capUnlocked: false,
      onDuty: true
    },
    luchen: {
      id: "luchen",
      name: "陆沉（店长）",
      tag: "前大厂P8 · 斯文疯批主理人",
      styleDesc: "看透优绩KPI虚无裸辞梭哈 · 用最温和的笑干最狠的护短",
      avatar: "game_assets/char_luchen_base.jpg",
      sprites: {
        normal: "game_assets/sprite_luchen_normal.png"
      }
    }
  },

  tutorialSteps: {
    1: {
      step: "新手引导 1 / 6 · 认识状态条与【反 007 排班休假】",
      title: "千禧（系统提示）：店长，先看右下角的店员状态卡！",
      body: "• 每位妹妹有两条负面状态：【🔵 体力疲劳（身体累）】和【🌸 亚比精神压力（情绪营业内耗）】。\n• 我们不是 007 血汗工厂！点击妹妹卡片右上角的按钮将她设为【★休假】，当天即可直接将她的体力疲劳与精神压力 100% 清零！\n👉 试着根据状态调整出勤名单，然后点击高亮的【▶ 确认今日出勤名单】按钮。",
      highlightSelector: "#btn-confirm-roster"
    },
    2: {
      step: "新手引导 2 / 6 · ① 上午时段（10:00 晨间训练）",
      title: "琥珀：上午还没开门迎客，专门用来【快速涨四维技能】！",
      body: "• 妹妹们初始严重偏科（比如零音唱跳 92，但美食只有 18，进厨房就会炸微波炉）。\n• 上午选训练方案，不仅能让出勤妹妹快速涨对应属性，还会触发【双人师徒搭档小剧场】！\n👉 请点击下方高亮的训练选项（推荐选 A 看零音炸微波炉 CG）！",
      highlightSelector: ".op-list"
    },
    3: {
      step: "新手引导 3 / 6 · ② 下午时段（14:00 点餐 vs 拍切）",
      title: "真昼：下午开门迎客，是赚【阶段房租】的主力时段！",
      body: "• 选【1F 招牌特调与蛋包饭】：检定美食力，收入稳健，只耗一点体力、不涨精神压力；\n• 选【2F 拍切特典冲量】：检定饭撒力，来钱最快！但长时间维持假笑营业会增加【🌸 亚比精神压力】。\n👉 请在下方选择今日下午的营业重心！",
      highlightSelector: ".op-list"
    },
    4: {
      step: "新手引导 4 / 6 · ③ 晚上时段（19:00 B1 地下舞台演出）",
      title: "零音：晚上七点，B1 防空洞地下舞台正式亮灯！",
      body: "• 晚场演出检定【唱跳力】，产出高额门票打赏与【同好粉丝】，同时推进我们 90 天对赌主线！\n• 注意：选择【B. 全员燃曲炸场 Live】虽然耗体力，但能把白天的闷气吼出来，帮全员宣泄 -20% 精神压力！\n👉 请选择今晚的 B1 舞台演出方案！",
      highlightSelector: ".op-list"
    },
    5: {
      step: "新手引导 5 / 6 · ④ 下班时段（22:00 社媒运营 & 留店剧情）",
      title: "千禧：21:30 打烊啦！下班有两件大事可以选：",
      body: "• 常规选项：发小红书或 B 站切片（检定社媒力），把今天的素材转化为【明天 +35%~45% 的客流倍率】！\n• ★ 金色特殊选项：当有妹妹压力高或逢特殊日，可点选【★ 21:30 打烊留店剧情】，解开心结清零压力并冲破技能上限！\n👉 请点击下方任意一个下班选项（推荐点 ★ 留店看真昼梅雨夜 CG）！",
      highlightSelector: ".op-list"
    },
    6: {
      step: "新手引导 6 / 6 · 深夜出租屋（微信秒撤回互动 & 关灯睡觉）",
      title: "千禧：最后一步！回出租屋刷一下【小红书】和【微信私聊】~",
      body: "• 平时下班各回各家！白天攒了精神压力的妹妹，半夜会在微信上发疯又秒撤回。\n• 选对懂她电波的回复，能当晚帮她消除 -35% 精神压力并大涨羁绊！回完消息点【🌙 关灯睡觉】即完成完整一天循环！",
      highlightSelector: "#wx-reply-box"
    }
  },

  calendar: [
    {
      dayIndex: 0,
      weekLabel: "第1周 · 周一 (10/07)",
      title: "试营业首日 & 四时段运营教学",
      rentGoal: 12000,
      specialId: "opening_day",
      specialHint: "★ 首日试营业：跟随右侧引导完成第一次四时段轻量化运营"
    },
    {
      dayIndex: 1,
      weekLabel: "第2周 · 周六 (10/15)",
      title: "模考结束日 & 《零分次品》合奏夜",
      rentGoal: 12000,
      specialId: "exam_duet",
      specialHint: "★ 今日特殊企划：【撕模拟卷换半价草莓奶】& 晚间《零分次品》首演"
    },
    {
      dayIndex: 2,
      weekLabel: "第4周 · 周四 (10/24)",
      title: "★ 林真昼生诞祭：零分次品的粉色王冠",
      rentGoal: 18000,
      specialId: "mahiru_bday",
      specialHint: "★ 今日真昼生日！全时段解锁【生诞祭限定选项】与深夜第二个小蛋糕"
    },
    {
      dayIndex: 3,
      weekLabel: "第5周 · 周四 (10/31)",
      title: "★ 万圣节狂欢：百鬼夜行小恶魔夜",
      rentGoal: 18000,
      specialId: "halloween",
      specialHint: "★ 今日万圣节！可触发全员血浆妆换装、烤南瓜派与假面视觉系Live"
    },
    {
      dayIndex: 4,
      weekLabel: "第6周 · 周六 (11/09)",
      title: "★ 台风倒灌夜：39.5度高烧与店长底牌",
      rentGoal: 24000,
      specialId: "typhoon_kohaku",
      specialHint: "★ 第二幕高潮：台风袭击B1舞台，琥珀高烧破防 & 全员发现店长裸辞病历"
    },
    {
      dayIndex: 5,
      weekLabel: "第8周 · 周四 (11/21)",
      title: "★ 暴雨审判日：折断的大厂P8工牌",
      rentGoal: 24000,
      specialId: "break_badge",
      specialHint: "★ 第三幕高潮：真昼母亲闯店抓人，陆沉当众折断大厂高管工牌护短！"
    },
    {
      dayIndex: 6,
      weekLabel: "第11周 · 周六 (12/20)",
      title: "★ 双向救赎 & 撕碎团服的血色独奏",
      rentGoal: 32000,
      specialId: "reine_rebel",
      specialHint: "★ 第四幕决战：4位妹妹堵门拽回自毁的店长 & 零音全网直播撕碎甜美团服！"
    },
    {
      dayIndex: 7,
      weekLabel: "第12周 · 跨年夜 (12/31)",
      title: "★ 终局：跨年千人安可祭 & 3F露台告白",
      rentGoal: 32000,
      specialId: "new_year_finale",
      specialHint: "★ 终幕大结局：千人地下Live达成，跨年烟花下进入四女主单人True End！"
    }
  ],

  periodOptions: {
    morning: [
      {
        id: "m_food",
        name: "A. 水吧特调新品试做（琥珀×零音）",
        desc: "快速猛涨【美食力 +12】｜体力疲劳 +10%｜触发《500度近视女王炸微波炉》CG",
        stat: "food",
        gain: 12,
        fatigue: 10,
        stress: -5,
        storyKey: "train_microwave"
      },
      {
        id: "m_stage",
        name: "B. B1声乐与核心体能合练（零音×真昼）",
        desc: "快速猛涨【唱跳力 +12】｜体力疲劳 +15%｜触发《前理科尖子生的换气公式》",
        stat: "stage",
        gain: 12,
        fatigue: 15,
        stress: 0,
        storyKey: "train_breath"
      },
      {
        id: "m_charm",
        name: "C. 2F拍切镜头与电子饭撒对练（真昼×千禧）",
        desc: "快速猛涨【饭撒力 +12】｜体力疲劳 +8%｜触发《隔着掌机屏幕的眨眼》",
        stat: "charm",
        gain: 12,
        fatigue: 8,
        stress: -5,
        storyKey: "train_cheki"
      },
      {
        id: "m_craft",
        name: "D. 束腰打歌服放宽改造（琥珀×真昼）",
        desc: "快速猛涨【社媒/整活力 +10】｜全员精神压力 -10%｜触发《悄悄放宽半寸的裙腰》",
        stat: "social",
        gain: 10,
        fatigue: 5,
        stress: -10,
        storyKey: "train_dress"
      },
      {
        id: "m_bday_prep",
        specialFor: "mahiru_bday",
        name: "★ [真昼生诞祭限定] 瞒着寿星偷布黑粉痛墙与小王冠",
        desc: "全员精神压力 -15%，今日生诞拍切与晚场票房翻倍！触发后台吹气球抓包戏",
        stat: "charm",
        gain: 15,
        fatigue: 5,
        stress: -15,
        storyKey: "special_bday_morning"
      }
    ],

    afternoon: [
      {
        id: "a_food",
        name: "A. 主推招牌特调与歪嘴猫蛋包饭（吃美食力）",
        desc: "1F水吧稳健吸金｜预计收入 +¥2,600｜体力疲劳 +12%，精神压力不涨",
        stat: "food",
        baseMoney: 2600,
        fatigue: 12,
        stress: 0,
        storyKey: "af_omurice"
      },
      {
        id: "a_cheki",
        name: "B. 2F 单人拍切特典冲量专场（吃饭撒力·暴利）",
        desc: "交房租最快印钞机！预计收入 +¥4,200｜体力 +10%，亚比精神压力 +28%",
        stat: "charm",
        baseMoney: 4200,
        fatigue: 10,
        stress: 28,
        storyKey: "af_cheki_rush"
      },
      {
        id: "a_cp",
        name: "C. 双人 CP 合拍特典（真昼×零音甜毒碰撞）",
        desc: "预计收入 +¥3,600｜双人分摊精神压力 (+12%)，大幅提升女女团魂默契",
        stat: "charm",
        baseMoney: 3600,
        fatigue: 10,
        stress: 12,
        storyKey: "af_cp_cheki"
      },
      {
        id: "a_exam",
        specialFor: "exam_duet",
        name: "★ [热搜特企] 模考结束日：撕碎试卷换半价草莓奶！",
        desc: "预计收入 +¥4,800｜真昼带头帮学生客撕卷解压，真昼精神压力直接 -25%！",
        stat: "charm",
        baseMoney: 4800,
        fatigue: 10,
        stress: -20,
        storyKey: "special_exam_shred"
      },
      {
        id: "a_bday_cheki",
        specialFor: "mahiru_bday",
        name: "★ [真昼生诞祭限定] 发售「真昼生诞手绘拍切套组」",
        desc: "预计收入暴击 +¥6,500！触发真昼戴小王冠破天荒用右手写工整感谢语剧情",
        stat: "charm",
        baseMoney: 6500,
        fatigue: 12,
        stress: -10,
        storyKey: "special_bday_afternoon"
      }
    ],

    evening: [
      {
        id: "e_solo",
        name: "A. 王牌主唱 Solo 摇滚夜（零音扛旗）",
        desc: "检定主唱【唱跳力】｜预计票房 +¥3,400｜主唱体力 +20%，其余人水吧卖酒水",
        stat: "stage",
        baseMoney: 3400,
        fatigue: 18,
        stress: 5,
        storyKey: "ev_reine_solo"
      },
      {
        id: "e_full_band",
        name: "B. 全员燃曲炸场 Live（检定全团唱跳·宣泄压力!）",
        desc: "预计票房 +¥5,000｜体力疲劳 +25%，但把闷气吼出来让全员【精神压力 -20%】！",
        stat: "stage",
        baseMoney: 5000,
        fatigue: 25,
        stress: -20,
        storyKey: "ev_full_live"
      },
      {
        id: "e_unplugged",
        name: "C. 走心 Unplugged 不插电夜（低耗高共鸣）",
        desc: "预计票房 +¥2,800｜全员疲劳仅 +8%，散场极易触发 21:30 留店交心剧情",
        stat: "stage",
        baseMoney: 2800,
        fatigue: 8,
        stress: -15,
        storyKey: "ev_unplugged"
      },
      {
        id: "e_zero_debut",
        specialFor: "exam_duet",
        name: "★ [第一幕高潮专场] 首演新曲《零分次品》（零音×真昼）",
        desc: "预计票房 +¥6,200！播放专属双人舞台CG，真昼与零音正式结成词曲共犯！",
        stat: "stage",
        baseMoney: 6200,
        fatigue: 20,
        stress: -30,
        storyKey: "act1_climax_duet"
      },
      {
        id: "e_halloween",
        specialFor: "halloween",
        name: "★ [万圣节专场] 百鬼夜行·视觉系假面狂欢 Live",
        desc: "预计票房暴击 +¥7,200！千禧披床单发糖、零音戴歌剧面具登台炸场",
        stat: "stage",
        baseMoney: 7200,
        fatigue: 20,
        stress: -20,
        storyKey: "special_halloween_live"
      }
    ],

    night: [
      {
        id: "n_rain_stay",
        name: "★ [21:30 打烊留店剧情] 梅雨夜擦湿账本的真昼 & 温草莓奶",
        desc: "播放专属全屏CG！真昼精神压力彻底清零，冲破心结瓶颈解锁【98分甜毒特调】",
        buffNext: 1.35,
        stressDelta: -100,
        storyKey: "stay_mahiru_rain"
      },
      {
        id: "n_red",
        name: "A. 发小红书：九宫格穿搭与特调种草（引流明日午市）",
        desc: "检定【社媒力】｜明日下午点餐与拍切收益 +35%｜刷妹妹小红书动态互动",
        buffNext: 1.35,
        stressDelta: -15,
        storyKey: "night_red_interaction"
      },
      {
        id: "n_video",
        name: "B. 发B站/视频号：B1舞台8-bit故障风高燃切片",
        desc: "检定千禧【社媒力】｜明日晚场演出票房 +45%，全员群聊抢夜宵红包消疲劳",
        buffNext: 1.45,
        stressDelta: -20,
        storyKey: "night_wx_group"
      },
      {
        id: "n_bday_cake",
        specialFor: "mahiru_bday",
        name: "★ [真昼生诞祭 22:30 留店] 打烊后的「第二个小蛋糕」与备用钥匙",
        desc: "播放生诞祭专属全屏CG！送出纯草莓玻璃盒与猫咪黄铜钥匙，真昼羁绊度满格！",
        buffNext: 1.5,
        stressDelta: -100,
        storyKey: "stay_mahiru_bday"
      }
    ]
  }
};
