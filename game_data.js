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
      tag: "NO.01 · 拍切担当",
      styleDesc: "原本是省重点的理科尖子生，心算极快，嘴硬又极怕出错被赶走。",
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
      stress: 68,
      bond: 20,
      capUnlocked: false,
      onDuty: true
    },
    reine: {
      id: "reine",
      name: "白石零音",
      tag: "NO.02 · 地下主唱",
      styleDesc: "B1 舞台的视觉系主唱，唱功很硬；摘了隐形是五百度近视，进厨房必翻车。",
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
      tag: "NO.03 · 主厨兼裁缝",
      styleDesc: "后厨和缝纫机一把抓，每天下午还要去医院给外婆送饭，习惯替别人兜底。",
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
      tag: "NO.04 · 宣发与杂务",
      styleDesc: "常年缩在吧台最里头的帘子后，怕生不敢见客，但画图、剪片和玩梗很有一套。",
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
      name: "陆沉",
      tag: "店长 · 前大厂架构师",
      styleDesc: "三十岁裸辞，花积蓄盘下这条后巷里的旧喫茶店。平时话不多，但真出事时顶得住。",
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
      detail: "• 🔵 疲劳：干活和演出累积；🌸 压力：拍切营业累积。\n• 设为【★休假】的店员当天疲劳与压力全部清零。\n• 真昼今天压力偏高，可以先放她休一天，或晚上留店陪她聊聊。",
      highlightSelector: "#btn-confirm-roster"
    },
    2: {
      step: "引导 2 / 6 · ① 上午备场",
      title: "选一项上午备场安排（选 A 可触发专属 CG）",
      detail: "• 开门前用来提升【美食 / 饭撒 / 唱跳 / 社媒】四项能力。\n• 每个人擅长方向不同，搭档备场还会触发对应的日常剧情。",
      highlightSelector: ".op-list"
    },
    3: {
      step: "引导 3 / 6 · ② 下午营业",
      title: "选下午重心：1F 稳赚餐食，或 2F 高收益拍切",
      detail: "• 1F 点餐：看美食力，收入稳定，不增加压力。\n• 2F 拍切：看饭撒力，来钱最快，但长时间营业会攒压力。",
      highlightSelector: ".op-list"
    },
    4: {
      step: "引导 4 / 6 · ③ 晚间演出",
      title: "安排今晚 B1 舞台的演出形式",
      detail: "• 晚场看【唱跳力】，赚门票钱的同时涨粉丝。\n• 选【B. 全员乐队场】虽然累一点，但能帮全员降 20% 压力。",
      highlightSelector: ".op-list"
    },
    5: {
      step: "引导 5 / 6 · ④ 打烊后",
      title: "发一条宣发动态，或点 ★ 留店看真昼雨夜剧情",
      detail: "• 宣发选项：发图文或演出切片，次日客流收益提升 35%～45%。\n• ★ 留店选项：打烊后独处剧情，直接清零压力并解锁全屏 CG。",
      highlightSelector: ".op-list"
    },
    6: {
      step: "引导 6 / 6 · 睡前手机",
      title: "回一条微信消息减压，再点【🌙 关灯睡觉】",
      detail: "• 压力高的店员半夜会在微信发消息又撤回。\n• 顺着她的话回一句，能直接降 35% 压力并加羁绊。",
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
      shortHint: "★ 试营业第一天",
      specialHint: "试营业首日：按早会、备场、营业、演出走完一天流程。真昼初始压力偏高，记得照顾她的状态。"
    },
    {
      dayIndex: 1,
      weekLabel: "W2 · 周六 (10/15)",
      title: "一模出分日 · 《零分次品》",
      rentGoal: 12000,
      specialId: "exam_duet",
      shortHint: "★ 碎卷换草莓奶 & 新歌首演",
      specialHint: "全市高三一模出分日：下午开放「碎试卷换半价饮料」，晚上解锁零音与真昼合作的《零分次品》首演。"
    },
    {
      dayIndex: 2,
      weekLabel: "W4 · 周四 (10/24)",
      title: "★ 真昼生日",
      rentGoal: 18000,
      specialId: "mahiru_bday",
      shortHint: "★ 生日限定全天活动",
      specialHint: "林真昼生日：全天解锁生日限定安排（偷偷布置大厅、手写生日拍立得、打烊后的第二个小蛋糕）。"
    },
    {
      dayIndex: 3,
      weekLabel: "W5 · 周四 (10/31)",
      title: "★ 万圣节夜场",
      rentGoal: 18000,
      specialId: "halloween",
      shortHint: "★ 万圣变装演出",
      specialHint: "万圣节当晚：B1 开放变装特别场，千禧也会破例披着床单走出吧台给观众发糖。"
    },
    {
      dayIndex: 4,
      weekLabel: "W6 · 周六 (11/09)",
      title: "★ 台风夜",
      rentGoal: 24000,
      specialId: "typhoon_kohaku",
      shortHint: "★ 第二幕：台风倒灌 B1",
      specialHint: "台风登陆，雨水倒灌地下室。硬撑的琥珀烧到 39.5 度，店员们也无意间翻出了陆沉的旧病历与合同。"
    },
    {
      dayIndex: 5,
      weekLabel: "W8 · 周四 (11/21)",
      title: "★ 折断的工牌",
      rentGoal: 24000,
      specialId: "break_badge",
      shortHint: "★ 第三幕：暴雨夜访客",
      specialHint: "真昼的母亲雨夜闯进店里抓人，陆沉当场折断了自己的旧大厂工牌。"
    },
    {
      dayIndex: 6,
      weekLabel: "W11 · 周六 (12/20)",
      title: "★ 谁也不许退场",
      rentGoal: 32000,
      specialId: "reine_rebel",
      shortHint: "★ 第四幕：全网直播场",
      specialHint: "四个人把打算独自顶下违约金的陆沉堵在店里；次日全网直播，零音当场扯掉了强塞的甜美罩衫。"
    },
    {
      dayIndex: 7,
      weekLabel: "W12 · 跨夜 (12/31)",
      title: "★ 跨年夜与露台",
      rentGoal: 32000,
      specialId: "new_year_finale",
      shortHint: "★ 终幕：千人场与个人结局",
      specialHint: "九十天到期，跨年场顺利落幕。零点前去三楼露台，进入四位店员各自的结局剧情。"
    }
  ],

  periodOptions: {
    morning: [
      {
        id: "m_food",
        name: "A. 水吧试做新品",
        chips: [
          { text: "美食 +12", tone: "gold" },
          { text: "疲劳 +10%", tone: "blue" },
          { text: "★ 专属CG", tone: "pink" }
        ],
        desc: "琥珀带零音试做新饮品，拉高全队美食力，触发微波炉翻车专属 CG，顺带降 5% 压力。",
        stat: "food",
        gain: 12,
        fatigue: 10,
        stress: -5,
        storyKey: "train_microwave"
      },
      {
        id: "m_stage",
        name: "B. B1 声乐合练",
        chips: [
          { text: "唱跳 +12", tone: "gold" },
          { text: "疲劳 +15%", tone: "blue" }
        ],
        desc: "零音带真昼抠节拍和换气点，提升全队唱跳力，触发排练室日常对话。",
        stat: "stage",
        gain: 12,
        fatigue: 15,
        stress: 0,
        storyKey: "train_breath"
      },
      {
        id: "m_charm",
        name: "C. 2F 镜头对练",
        chips: [
          { text: "饭撒 +12", tone: "gold" },
          { text: "疲劳 +8%", tone: "blue" },
          { text: "压力 -5%", tone: "green" }
        ],
        desc: "真昼教千禧怎么躲在掌机后头自然看镜头，提升饭撒力，顺带松弛一下心情。",
        stat: "charm",
        gain: 12,
        fatigue: 8,
        stress: -5,
        storyKey: "train_cheki"
      },
      {
        id: "m_craft",
        name: "D. 改宽松演出服",
        chips: [
          { text: "社媒 +10", tone: "gold" },
          { text: "压力 -10%", tone: "green" },
          { text: "疲劳 +5%", tone: "blue" }
        ],
        desc: "琥珀帮真昼把勒胃的腰线暗褶放宽半寸，提升社媒表现，全员压力 -10%。",
        stat: "social",
        gain: 10,
        fatigue: 5,
        stress: -10,
        storyKey: "train_dress"
      },
      {
        id: "m_bday_prep",
        specialFor: "mahiru_bday",
        name: "★ 偷偷布置生日角",
        chips: [
          { text: "饭撒 +15", tone: "gold" },
          { text: "压力 -15%", tone: "green" },
          { text: "★ 生日限定", tone: "pink" }
        ],
        desc: "趁真昼出去买草莓，大家在店里挂气球装灯带，全员压力 -15%。",
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
        name: "A. 1F 餐食与招牌特调",
        chips: [
          { text: "预计 +¥2,600", tone: "gold" },
          { text: "看美食力", tone: "purple" },
          { text: "压力 +0%", tone: "green" }
        ],
        desc: "主推蛋包饭和特调饮品，按美食力结算。耗 12% 体力，不会额外攒压力。",
        stat: "food",
        baseMoney: 2600,
        fatigue: 12,
        stress: 0,
        storyKey: "af_omurice"
      },
      {
        id: "a_cheki",
        name: "B. 2F 单人拍切加场",
        chips: [
          { text: "预计 +¥4,200", tone: "gold" },
          { text: "看饭撒力", tone: "purple" },
          { text: "压力 +28%", tone: "pink" }
        ],
        desc: "交房租最快的办法，按饭撒力高倍率结算，但连轴假笑营业会让压力上涨 28%。",
        stat: "charm",
        baseMoney: 4200,
        fatigue: 10,
        stress: 28,
        storyKey: "af_cheki_rush"
      },
      {
        id: "a_cp",
        name: "C. 双人合影特典",
        chips: [
          { text: "预计 +¥3,600", tone: "gold" },
          { text: "压力 +12%", tone: "pink" },
          { text: "氛围轻松", tone: "green" }
        ],
        desc: "真昼和零音搭档接合影，两个人互相分担气氛，压力只涨 12%。",
        stat: "charm",
        baseMoney: 3600,
        fatigue: 10,
        stress: 12,
        storyKey: "af_cp_cheki"
      },
      {
        id: "a_exam",
        specialFor: "exam_duet",
        name: "★ 碎试卷换半价草莓奶",
        chips: [
          { text: "预计 +¥4,800", tone: "gold" },
          { text: "压力 -20%", tone: "green" },
          { text: "★ 一模限定", tone: "pink" }
        ],
        desc: "门口摆上碎纸机，学生带考砸的卷子来碎掉就半价，人气爆棚且全员减压 20%。",
        stat: "charm",
        baseMoney: 4800,
        fatigue: 10,
        stress: -20,
        storyKey: "special_exam_shred"
      },
      {
        id: "a_bday_cheki",
        specialFor: "mahiru_bday",
        name: "★ 真昼生日手写拍立得",
        chips: [
          { text: "预计 +¥6,500", tone: "gold" },
          { text: "压力 -10%", tone: "green" },
          { text: "★ 生日限定", tone: "pink" }
        ],
        desc: "生日限定场，熟客排到楼梯口，真昼破例用右手一笔一划写满背面寄语。",
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
        name: "A. 零音摇滚专场",
        chips: [
          { text: "预计 +¥3,400", tone: "gold" },
          { text: "看唱跳力", tone: "purple" },
          { text: "疲劳 +18%", tone: "blue" }
        ],
        desc: "零音扛主唱，其余人看吧台卖酒水。按唱跳力结算票房和新增粉丝。",
        stat: "stage",
        baseMoney: 3400,
        fatigue: 18,
        stress: 5,
        storyKey: "ev_reine_solo"
      },
      {
        id: "e_full_band",
        name: "B. 全员乐队场",
        chips: [
          { text: "预计 +¥5,000", tone: "gold" },
          { text: "压力 -20%", tone: "green" },
          { text: "疲劳 +25%", tone: "blue" }
        ],
        desc: "四个人一起上台，票房和涨粉都很可观。虽耗 25% 体力，但唱完能降 20% 压力。",
        stat: "stage",
        baseMoney: 5000,
        fatigue: 25,
        stress: -20,
        storyKey: "ev_full_live"
      },
      {
        id: "e_unplugged",
        name: "C. 不插电慢歌夜",
        chips: [
          { text: "预计 +¥2,800", tone: "gold" },
          { text: "疲劳 +8%", tone: "blue" },
          { text: "压力 -15%", tone: "green" }
        ],
        desc: "搬高脚凳坐着弹木吉他，消耗低、气氛松弛，适合大伙儿连轴转之后缓口气。",
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
        desc: "零音把真昼备忘录里的字谱成了新歌，两人同台首演，解锁专属舞台 CG。",
        stat: "stage",
        baseMoney: 6200,
        fatigue: 20,
        stress: -30,
        storyKey: "act1_climax_duet"
      },
      {
        id: "e_halloween",
        specialFor: "halloween",
        name: "★ 万圣节变装专场",
        chips: [
          { text: "预计 +¥7,200", tone: "gold" },
          { text: "压力 -20%", tone: "green" },
          { text: "★ 万圣限定", tone: "pink" }
        ],
        desc: "万圣夜特别演出，千禧披着床单发糖，全场气氛拉满。",
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
        name: "★ 21:30 留店：雨夜吧台",
        chips: [
          { text: "压力清零", tone: "green" },
          { text: "次日 +35%", tone: "gold" },
          { text: "★ 专属CG", tone: "pink" }
        ],
        desc: "打烊后留下来陪真昼收拾账本、喝杯热草莓奶，解锁雨夜全屏 CG，压力直接清零。",
        buffNext: 1.35,
        stressDelta: -100,
        storyKey: "stay_mahiru_rain"
      },
      {
        id: "n_red",
        name: "A. 发小红书图文",
        chips: [
          { text: "次日 +35%", tone: "gold" },
          { text: "压力 -15%", tone: "green" }
        ],
        desc: "整理今天的特调和穿搭照片发出去，明天营业收益提升 35%。",
        buffNext: 1.35,
        stressDelta: -15,
        storyKey: "night_red_interaction"
      },
      {
        id: "n_video",
        name: "B. 剪演出片段发视频",
        chips: [
          { text: "次日 +45%", tone: "gold" },
          { text: "压力 -20%", tone: "green" }
        ],
        desc: "千禧剪一段今晚 B1 副歌切片传同城，明天收益提升 45%，顺带降 20% 压力。",
        buffNext: 1.45,
        stressDelta: -20,
        storyKey: "night_wx_group"
      },
      {
        id: "n_bday_cake",
        specialFor: "mahiru_bday",
        name: "★ 22:30 留店：第二个小蛋糕",
        chips: [
          { text: "压力清零", tone: "green" },
          { text: "次日 +50%", tone: "gold" },
          { text: "★ 生日CG", tone: "pink" }
        ],
        desc: "人群散场后，把刮掉厚奶油的草莓方盒和备用钥匙交给真昼，解锁生日专属 CG。",
        buffNext: 1.5,
        stressDelta: -100,
        storyKey: "stay_mahiru_bday"
      }
    ]
  }
};
