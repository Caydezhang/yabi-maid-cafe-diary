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
      step: "引导 1 / 6 · 早会排班",
      title: "点真昼右上角设为【休假】，或直接点确认出勤",
      detail: "• 🔵 疲劳：干活/演出累积；🌸 压力：拍切营业内耗累积。\n• 我们不是 007 血汗工厂！设为【★休假】当天直接将双状态 100% 清零。\n• 真昼当前压力 68%，可先放她休假，或带她出勤并在晚间留店安慰她。",
      highlightSelector: "#btn-confirm-roster"
    },
    2: {
      step: "引导 2 / 6 · ① 上午训练",
      title: "选 1 个晨间训练方案涨技能（推荐选 A 看专属 CG）",
      detail: "• 上午闭店备场，专门快速拉升【美食 / 饭撒 / 唱跳 / 社媒】四维属性。\n• 妹妹们初始严重偏科（如零音唱跳 92、美食仅 18），训练还会触发双人搭档喜剧小剧场！",
      highlightSelector: ".op-list"
    },
    3: {
      step: "引导 3 / 6 · ② 下午营业",
      title: "选今日午市重心：1F 稳赚点餐 vs 2F 暴利拍切",
      detail: "• 1F 点餐：检定美食力，稳赚不涨精神压力。\n• 2F 拍切：检定饭撒力，交房租最快印钞机，但假笑营业会明显增加精神压力。",
      highlightSelector: ".op-list"
    },
    4: {
      step: "引导 4 / 6 · ③ 晚上演出",
      title: "选今晚 B1 地下舞台演出方案",
      detail: "• 晚场检定【唱跳力】，产出高额票房与【粉丝】。\n• 选【B. 全员燃曲 Live】虽然耗体力，但吼出闷气能帮全员宣泄 -20% 精神压力！",
      highlightSelector: ".op-list"
    },
    5: {
      step: "引导 5 / 6 · ④ 夜生活",
      title: "选下班社媒引流，或点 ★ 留店看真昼 CG",
      detail: "• 常规选项：发小红书/B站切片，给次日加 +35%~45% 收益倍率。\n• ★ 金色选项：21:30 打烊留店独处，彻底清零妹妹压力、解锁全屏 CG 并突破上限！",
      highlightSelector: ".op-list"
    },
    6: {
      step: "引导 6 / 6 · 深夜手机",
      title: "回复真昼撤回的微信减压，再点【🌙 关灯睡觉】",
      detail: "• 白天攒了压力的妹妹半夜会在微信发疯又秒撤回。\n• 选懂她电波的回复可立消 -35% 精神压力并涨羁绊，随后关灯进入次日！",
      highlightSelector: "#wx-reply-box"
    }
  },

  calendar: [
    {
      dayIndex: 0,
      weekLabel: "W1 · 周一 (10/07)",
      title: "试营业首日",
      rentGoal: 12000,
      specialId: "opening_day",
      shortHint: "★ 首日试营业",
      specialHint: "首日试营业：完成一次完整四时段轻量化运营（真昼初始压力 68%，可排休或下班留店安慰）。"
    },
    {
      dayIndex: 1,
      weekLabel: "W2 · 周六 (10/15)",
      title: "模考日 & 《零分次品》",
      rentGoal: 12000,
      specialId: "exam_duet",
      shortHint: "★ 撕卷换草莓奶 & 新曲首演",
      specialHint: "模考结束日特殊企划：下午解锁【撕模拟卷换半价草莓奶】，晚上解锁第一幕高潮《零分次品》合奏 CG！"
    },
    {
      dayIndex: 2,
      weekLabel: "W4 · 周四 (10/24)",
      title: "★ 林真昼生诞祭",
      rentGoal: 18000,
      specialId: "mahiru_bday",
      shortHint: "★ 真昼生日限定全时段解锁",
      specialHint: "林真昼生诞祭：全时段解锁生诞限定选项（偷布痛墙、手绘拍切套组暴击收益、22:30 第二个小蛋糕全屏 CG）！"
    },
    {
      dayIndex: 3,
      weekLabel: "W5 · 周四 (10/31)",
      title: "★ 万圣节百鬼夜行",
      rentGoal: 18000,
      specialId: "halloween",
      shortHint: "★ 万圣假面狂欢 Live",
      specialHint: "万圣节狂欢夜：解锁全员血浆妆换装、千禧披床单发糖与零音戴歌剧面具视觉系 Live！"
    },
    {
      dayIndex: 4,
      weekLabel: "W6 · 周六 (11/09)",
      title: "★ 台风夜与高烧",
      rentGoal: 24000,
      specialId: "typhoon_kohaku",
      shortHint: "★ 第二幕高潮：台风袭击 B1",
      specialHint: "第二幕高潮剧情：台风倒灌袭击 B1 舞台，琥珀 39.5 度高烧破防，全员意外发现店长裸辞病历。"
    },
    {
      dayIndex: 5,
      weekLabel: "W8 · 周四 (11/21)",
      title: "★ 折断的 P8 工牌",
      rentGoal: 24000,
      specialId: "break_badge",
      shortHint: "★ 第三幕高潮：暴雨护短",
      specialHint: "第三幕高潮剧情：真昼母亲暴雨夜闯店抓人，陆沉当众折断大厂 P8 高管工牌正面硬刚护短！"
    },
    {
      dayIndex: 6,
      weekLabel: "W11 · 周六 (12/20)",
      title: "★ 血色独奏与救赎",
      rentGoal: 32000,
      specialId: "reine_rebel",
      shortHint: "★ 第四幕决战：撕碎团服",
      specialHint: "第四幕决战：4 位妹妹堵门拽回试图独自扛雷的店长，零音在全网直播舞台上撕碎甜美团服！"
    },
    {
      dayIndex: 7,
      weekLabel: "W12 · 跨夜 (12/31)",
      title: "★ 跨年千人安可祭",
      rentGoal: 32000,
      specialId: "new_year_finale",
      shortHint: "★ 终幕大结局 & 露台告白",
      specialHint: "终幕大结局：90 天对赌千人地下 Live 达成，在跨年烟花下的 3F 露台进入四女主单人 True End！"
    }
  ],

  periodOptions: {
    morning: [
      {
        id: "m_food",
        name: "A. 水吧特调试做",
        chips: [
          { text: "美食 +12", tone: "gold" },
          { text: "疲劳 +10%", tone: "blue" },
          { text: "★ 专属CG", tone: "pink" }
        ],
        desc: "琥珀 × 零音搭档试做新品。快速拉升全队美食力，触发《500度近视女王炸微波炉》专属 CG，压力 -5%。",
        stat: "food",
        gain: 12,
        fatigue: 10,
        stress: -5,
        storyKey: "train_microwave"
      },
      {
        id: "m_stage",
        name: "B. B1 声乐体能合练",
        chips: [
          { text: "唱跳 +12", tone: "gold" },
          { text: "疲劳 +15%", tone: "blue" }
        ],
        desc: "零音 × 真昼合练发声与核心体能。大幅提升唱跳力，触发《前理科尖子生的换气公式》小剧场。",
        stat: "stage",
        gain: 12,
        fatigue: 15,
        stress: 0,
        storyKey: "train_breath"
      },
      {
        id: "m_charm",
        name: "C. 2F 拍切饭撒对练",
        chips: [
          { text: "饭撒 +12", tone: "gold" },
          { text: "疲劳 +8%", tone: "blue" },
          { text: "压力 -5%", tone: "green" }
        ],
        desc: "真昼 × 千禧对练镜头感与电子饭撒。提升饭撒力，触发《隔着掌机屏幕的眨眼》可爱互动。",
        stat: "charm",
        gain: 12,
        fatigue: 8,
        stress: -5,
        storyKey: "train_cheki"
      },
      {
        id: "m_craft",
        name: "D. 打歌服放宽改造",
        chips: [
          { text: "社媒 +10", tone: "gold" },
          { text: "压力 -10%", tone: "green" },
          { text: "疲劳 +5%", tone: "blue" }
        ],
        desc: "琥珀 × 真昼亲手放宽紧绷束腰。提升社媒整活力，全员减压，触发《悄悄放宽半寸的裙腰》暖心剧情。",
        stat: "social",
        gain: 10,
        fatigue: 5,
        stress: -10,
        storyKey: "train_dress"
      },
      {
        id: "m_bday_prep",
        specialFor: "mahiru_bday",
        name: "★ 偷布真昼生诞痛墙",
        chips: [
          { text: "饭撒 +15", tone: "gold" },
          { text: "压力 -15%", tone: "green" },
          { text: "★ 生诞限定", tone: "pink" }
        ],
        desc: "【真昼生诞祭限定】瞒着寿星布置黑粉痛墙与小王冠，触发后台吹气球抓包戏，全员压力 -15%！",
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
        name: "A. 1F 招牌特调与蛋包饭",
        chips: [
          { text: "预计 +¥2,600", tone: "gold" },
          { text: "吃美食力", tone: "purple" },
          { text: "压力 +0%", tone: "green" }
        ],
        desc: "1F 水吧稳健吸金，按团队美食力结算收益。体力疲劳 +12%，不产生精神营业内耗。",
        stat: "food",
        baseMoney: 2600,
        fatigue: 12,
        stress: 0,
        storyKey: "af_omurice"
      },
      {
        id: "a_cheki",
        name: "B. 2F 单人拍切冲量",
        chips: [
          { text: "预计 +¥4,200", tone: "gold" },
          { text: "吃饭撒力", tone: "purple" },
          { text: "压力 +28%", tone: "pink" }
        ],
        desc: "交房租最快的印钞机！按饭撒力高倍率结算，体力 +10%，但长时间假笑营业会大涨精神压力 +28%。",
        stat: "charm",
        baseMoney: 4200,
        fatigue: 10,
        stress: 28,
        storyKey: "af_cheki_rush"
      },
      {
        id: "a_cp",
        name: "C. 双人 CP 合拍特典",
        chips: [
          { text: "预计 +¥3,600", tone: "gold" },
          { text: "压力 +12%", tone: "pink" },
          { text: "团魂UP", tone: "green" }
        ],
        desc: "真昼 × 零音甜毒碰撞双人拍切，双人分摊精神压力（仅 +12%），大幅增进默契。",
        stat: "charm",
        baseMoney: 3600,
        fatigue: 10,
        stress: 12,
        storyKey: "af_cp_cheki"
      },
      {
        id: "a_exam",
        specialFor: "exam_duet",
        name: "★ 撕试卷换半价草莓奶",
        chips: [
          { text: "预计 +¥4,800", tone: "gold" },
          { text: "压力 -20%", tone: "green" },
          { text: "★ 热搜特企", tone: "pink" }
        ],
        desc: "【模考结束日限定】真昼带头帮学生客撕模拟卷解压，爆红热搜营收暴涨，全员压力直接 -20%！",
        stat: "charm",
        baseMoney: 4800,
        fatigue: 10,
        stress: -20,
        storyKey: "special_exam_shred"
      },
      {
        id: "a_bday_cheki",
        specialFor: "mahiru_bday",
        name: "★ 真昼生诞手绘拍切",
        chips: [
          { text: "预计 +¥6,500", tone: "gold" },
          { text: "压力 -10%", tone: "green" },
          { text: "★ 生诞限定", tone: "pink" }
        ],
        desc: "【真昼生诞祭限定】限量发售手绘拍切套组，收益暴击！触发真昼戴小王冠破天荒用右手写感谢语剧情。",
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
        name: "A. 王牌主唱 Solo 摇滚",
        chips: [
          { text: "预计 +¥3,400", tone: "gold" },
          { text: "吃唱跳力", tone: "purple" },
          { text: "疲劳 +18%", tone: "blue" }
        ],
        desc: "零音扛旗镇场，其余人在吧台卖酒水。按唱跳力结算门票打赏与同好粉丝。",
        stat: "stage",
        baseMoney: 3400,
        fatigue: 18,
        stress: 5,
        storyKey: "ev_reine_solo"
      },
      {
        id: "e_full_band",
        name: "B. 全员燃曲炸场 Live",
        chips: [
          { text: "预计 +¥5,000", tone: "gold" },
          { text: "压力 -20%", tone: "green" },
          { text: "疲劳 +25%", tone: "blue" }
        ],
        desc: "全员登台炸场！高额票房与涨粉，虽耗体力 +25%，但把白天闷气吼出来让全员精神压力 -20%！",
        stat: "stage",
        baseMoney: 5000,
        fatigue: 25,
        stress: -20,
        storyKey: "ev_full_live"
      },
      {
        id: "e_unplugged",
        name: "C. 不插电走心民谣夜",
        chips: [
          { text: "预计 +¥2,800", tone: "gold" },
          { text: "疲劳 +8%", tone: "blue" },
          { text: "压力 -15%", tone: "green" }
        ],
        desc: "低体力消耗、高情绪共鸣的小型不插电演出，适合连轴转后保存全员体力。",
        stat: "stage",
        baseMoney: 2800,
        fatigue: 8,
        stress: -15,
        storyKey: "ev_unplugged"
      },
      {
        id: "e_zero_debut",
        specialFor: "exam_duet",
        name: "★ 首演《零分次品》",
        chips: [
          { text: "预计 +¥6,200", tone: "gold" },
          { text: "压力 -30%", tone: "green" },
          { text: "★ 高潮CG", tone: "pink" }
        ],
        desc: "【第一幕高潮专场】零音 × 真昼双人首演原创曲《零分次品》，播放专属舞台 CG，两人正式结成词曲共犯！",
        stat: "stage",
        baseMoney: 6200,
        fatigue: 20,
        stress: -30,
        storyKey: "act1_climax_duet"
      },
      {
        id: "e_halloween",
        specialFor: "halloween",
        name: "★ 万圣假面狂欢 Live",
        chips: [
          { text: "预计 +¥7,200", tone: "gold" },
          { text: "压力 -20%", tone: "green" },
          { text: "★ 万圣限定", tone: "pink" }
        ],
        desc: "【万圣节专场】百鬼夜行视觉系 Live！千禧披床单发糖、零音戴歌剧面具登台，票房暴击！",
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
        name: "★ 21:30 留店：梅雨夜真昼",
        chips: [
          { text: "压力清零", tone: "green" },
          { text: "次日 +35%", tone: "gold" },
          { text: "★ 专属CG", tone: "pink" }
        ],
        desc: "打烊留店独处剧情！播放梅雨夜擦湿账本与温草莓奶专属全屏 CG，真昼压力彻底清零并冲破瓶颈。",
        buffNext: 1.35,
        stressDelta: -100,
        storyKey: "stay_mahiru_rain"
      },
      {
        id: "n_red",
        name: "A. 发小红书图文种草",
        chips: [
          { text: "次日 +35%", tone: "gold" },
          { text: "压力 -15%", tone: "green" }
        ],
        desc: "九宫格穿搭与特调种草（检定社媒力），为明日下午点餐与拍切引流 +35% 收益倍率。",
        buffNext: 1.35,
        stressDelta: -15,
        storyKey: "night_red_interaction"
      },
      {
        id: "n_video",
        name: "B. 发 B 站故障风切片",
        chips: [
          { text: "次日 +45%", tone: "gold" },
          { text: "压力 -20%", tone: "green" }
        ],
        desc: "千禧剪辑 B1 舞台 8-bit 高燃切片，为明日晚场引流 +45% 收益，群聊抢夜宵红包消疲劳。",
        buffNext: 1.45,
        stressDelta: -20,
        storyKey: "night_wx_group"
      },
      {
        id: "n_bday_cake",
        specialFor: "mahiru_bday",
        name: "★ 生诞留店：第二个小蛋糕",
        chips: [
          { text: "压力清零", tone: "green" },
          { text: "次日 +50%", tone: "gold" },
          { text: "★ 生诞CG", tone: "pink" }
        ],
        desc: "【真昼生诞祭 22:30 留店】播放专属全屏 CG！送出纯草莓玻璃盒与猫咪黄铜备用钥匙，羁绊满格！",
        buffNext: 1.5,
        stressDelta: -100,
        storyKey: "stay_mahiru_bday"
      }
    ]
  }
};
