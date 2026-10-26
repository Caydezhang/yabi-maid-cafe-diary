window.GAME_STORIES = {
  prologue_story: {
    bg: "cafe1f",
    cg: "prologueAlley",
    loc: "序章 · 逃离优绩塔尖与后巷的 404",
    sub: "10月06日 · 暴雨夜 · 在一切开始之前",
    lines: [
      {
        speaker: "旁白",
        cg: "prologueAlley",
        unlockDossier: "luchen",
        text: "10月6日凌晨三点，城市CBD第42层。这是陆沉作为头部互联网大厂P8首席架构师拿下的第三个年度S级绩效——也是他决定彻底掀桌的那个夜晚。"
      },
      {
        speaker: "陆沉（内心独白）",
        tag: "前大厂P8 · 30岁",
        cg: "prologueAlley",
        text: "两小时前，组里那个刚毕业、为了冲转正KPI连续熬了四个通宵的实习生，在消防通道里胃穿孔吐了一地血。而救护车还没开出地库，高管微信群里弹出的第一条消息却是：【法务和公关先把词条压下去，别影响下周财报路演】。"
      },
      {
        speaker: "旁白",
        cg: "prologueAlley",
        text: "早上九点，陆沉把辞职信和价值两百万的未归属期权放弃书一起拍在了副总裁桌上。他撑着一把黑伞走出写字楼，鬼使神差地拐进了平时深夜买咖啡的那条潮湿后巷——停在了亮着粉紫色霓虹灯的『404 女仆喫茶 & Live』门前。"
      },
      {
        speaker: "旁白",
        bg: "cafe1f",
        sprites: ["luchen:normal"],
        text: "推开贴着转让封条的玻璃门，店里一片狼藉。前任老板三天前卷款跑路，只留下一台嘶嘶漏气的意式咖啡机，和四个正守着行李不肯散场的年轻女孩。"
      },
      {
        speaker: "林真昼",
        tag: "初遇 · NO.01 地雷系销冠",
        bg: "cafe1f",
        sprites: ["mahiru:normal", "luchen:normal"],
        speaking: 0,
        unlockDossier: "mahiru",
        text: "（坐在吧台高脚凳上晃着十厘米的厚底玛丽珍鞋，手里转着贴满水钻的翻盖痛机，斜眼打量你）“哟，穿得人模狗样的，你是房东派来收房子的律师，还是来看笑话的？先说好哦，前任老板还欠本销冠三百二十块拍立得提成，不结清我今天就睡在收银台上了！”"
      },
      {
        speaker: "陆沉（店长）",
        bg: "cafe1f",
        sprites: ["mahiru:normal", "luchen:normal"],
        speaking: 1,
        text: "（看了一眼她脚边写满精准心算流水的烟盒背面，和她左锁骨蕾丝领口别着的一枚生锈安全别针，从皮夹抽出三百二十块现金压在她手机下）“我不是收房子的。我是刚把这间店盘下来的新店长，陆沉。上个月欠你的提成，结清了。”"
      },
      {
        speaker: "陈琥珀",
        tag: "初遇 · NO.03 涩谷辣妹裁缝",
        bg: "cafe1f",
        sprites: ["kohaku:normal", "mahiru:normal"],
        speaking: 0,
        unlockDossier: "kohaku",
        text: "（拎着一柄扳手和一锅热气腾腾的排骨汤从后厨冲出来，金粉狼尾发梢还沾着雨水）“等等！你真是新老板？！那我可得把丑话说前头——角落那台重机缝纫机是我自己掏钱买的，还有我每天下午四点半得去市三院给我外婆送汤，你要是敢搞黑心老板扣全勤那套，老娘现在就把扳手撂这儿！”"
      },
      {
        speaker: "白石零音",
        tag: "初遇 · NO.02 暗黑地偶主唱",
        bg: "cafe1f",
        sprites: ["reine:glasses", "kohaku:normal"],
        speaking: 0,
        unlockDossier: "reine",
        text: "（B1地下室的铁门被推开，一个长发少女架着500度厚底黑框眼镜走上来，手里握着缠满白绷带的战损麦克风，冷冷地眯眼审视你）“一楼女仆店怎么折腾我不管。但如果新老板打算把B1的地下舞台拆了改仓库……我现在就背琴走人。”"
      },
      {
        speaker: "苏千禧",
        tag: "初遇 · NO.04 Y2K赛博幽灵",
        bg: "cafe1f",
        sprites: ["millie:normal", "luchen:normal"],
        speaking: 0,
        unlockDossier: "millie",
        text: "（吧台最里侧的黑色蕾丝防窥帘掀开一条缝，戴着发光猫耳耳机的少女用改装掌机挡着半张脸，把一纸《白昼商业地产：90天限期清退与跨年千人Live对赌协议》推到你面前，小声说）“……新店长，现在反悔还来得及。白昼娱乐要吞掉整条后巷，除非我们能在跨年夜办成千人原创Live，而且每周还要交齐高额房租……”"
      },
      {
        speaker: "陆沉（店长）",
        bg: "cafe1f",
        sprites: ["luchen:normal", "mahiru:normal"],
        speaking: 0,
        choices: [
          {
            label: "▶ 签下对赌协议：“我在大厂看够了按KPI把人当耗材的嘴脸。未来90天，404我保定了。”",
            nextLine: 10
          },
          {
            label: "▶ 签下对赌协议：“B1舞台不仅不拆，我还要掏空家底陪你们四个把白昼娱乐的脸打肿。”",
            nextLine: 10
          }
        ],
        text: "看着眼前这四个满身是刺、却又死死守着这间破店不肯走的女孩，陆沉拿起吧台上的钢笔，拔开了笔帽——"
      },
      {
        speaker: "陆沉（店长）",
        bg: "cafe1f",
        sprites: ["luchen:normal", "reine:glasses"],
        speaking: 0,
        text: "（在90天对赌协议上签下『陆沉』两个字，推了推银框眼镜，露出一抹温和却疯劲十足的笑）“签好了。从今天起，404 只有两条店规：第一，绝不搞 007 强制加班，谁累了直接休假；第二，在这间店里不用考一百分，天塌下来老板先顶着。”"
      },
      {
        speaker: "苏千禧",
        bg: "cafe1f",
        sprites: ["millie:happy", "kohaku:normal"],
        speaking: 0,
        isPrologueEnd: true,
        text: "（千禧头顶的猫耳耳机第一次闪起了代表安心的粉光，她把一台装好店铺管理系统的平板递给你）“那……欢迎入伙，陆店长！我已经把店铺的【反007排班】和【一日四时段运营系统】部署好了，现在让我手把手带你跑一遍第一天的试营业吧！”"
      }
    ]
  },

  opening_day: {
    bg: "cafe1f",
    loc: "1F · 404 女仆喫茶前厅",
    sub: "第1周 · 周一 (10/07) · 首日试营业与新手引导",
    lines: [
      {
        speaker: "苏千禧（新手引导）",
        tag: "NO.04 · 店铺系统管理员",
        sprites: ["millie:happy", "luchen:normal"],
        speaking: 0,
        text: "“店长早上好！请看屏幕右侧的【📋 四时段排班运营】面板——我已经为你开启了 6 步实机引导，跟着金色高亮框点选一圈，3分钟就能完全掌握怎么经营我们 404 啦！”"
      },
      {
        speaker: "林真昼",
        tag: "NO.01 · 地雷系销冠",
        sprites: ["mahiru:normal", "kohaku:normal"],
        speaking: 0,
        text: "“喂陆沉，我昨晚为了算清前任老板留下的烂账熬到凌晨三点，现在【亚比精神压力】已经 68% 了哦！你要是真像昨天发誓那样不当黑心老板，就看你今天怎么排班了~”"
      }
    ]
  },

  train_microwave: {
    bg: "cafe1f",
    cg: "microwave",
    loc: "1F · 水吧特调研发台",
    sub: "上午训练 · 琥珀 × 零音 师徒剧场",
    lines: [
      {
        speaker: "陈琥珀",
        sprites: ["kohaku:normal", "reine:glasses"],
        speaking: 0,
        text: "“祖宗！！白石零音！你往冰沙机里倒的那勺白色粉末是【粗海盐】！还有，我让你拿出来回温的宇治抹茶砖呢？！”"
      },
      {
        speaker: "白石零音",
        sprites: ["kohaku:normal", "reine:glasses"],
        speaking: 1,
        text: "（鼻梁上架着500度厚底黑框眼镜，指了指身后嗡嗡作响的微波炉）“自然回温太慢，不符合效率。我连着锡纸包装调了高火三分钟。”"
      },
      {
        speaker: "旁白",
        cg: "microwave",
        text: "“啪——滋啦！！”微波炉爆出一团电火花与黑烟！陆沉一步跨过去拔掉插座，琥珀眼疾手快揪住零音后衣领把她拖出两米远。零音鼻尖蹭了两道黑灰，耳根红透却还在强装镇定推眼镜。"
      },
      {
        speaker: "白石零音",
        cg: "microwave",
        text: "“……咳。我在测试金属高频涡流对抹茶多酚的焦化反应。这是第19号实验性黑暗料理，凡人不懂。”"
      },
      {
        speaker: "陈琥珀",
        cg: "microwave",
        text: "“噗哈哈哈还第19号实验呢！脸都成花猫了大小姐！别动，姐拿湿巾给你擦擦，我外婆说了，连热饭都不会的姑娘自己住出租屋是要饿出胃病的！”"
      }
    ]
  },

  train_breath: {
    bg: "liveB1",
    loc: "B1 · 地下舞台排练室",
    sub: "上午训练 · 零音 × 真昼 唱跳特训",
    lines: [
      {
        speaker: "白石零音",
        sprites: ["reine:normal", "mahiru:normal"],
        speaking: 0,
        text: "（居高临下用鼓槌敲了敲瘫在地板上喘气的真昼鞋底）“第三小节换气又抢了半拍。林真昼，你平时在二楼算拍切提成的时候，心算不是快得像计算机吗？”"
      },
      {
        speaker: "林真昼",
        sprites: ["reine:normal", "mahiru:shy"],
        speaking: 1,
        text: "（一边大口喘气，一边掏出三色圆珠笔在歌谱空白处列了一排呼吸时间轴函数）“闭嘴！本销冠只是在计算肺活量最优解……把伴奏倒回去再来一遍，这次错半拍我跟你姓！”"
      }
    ]
  },

  train_cheki: {
    bg: "cheki2f",
    loc: "2F · 拍立得特典角",
    sub: "上午训练 · 真昼 × 千禧 电子饭撒",
    lines: [
      {
        speaker: "林真昼",
        sprites: ["mahiru:normal", "millie:normal"],
        speaking: 0,
        text: "“笨死了小地鼠，谁让你直视客人眼睛了？实在害怕的时候，就把你那台改装掌机举起来挡住半张脸，只露出一双眼睛比个耶——这就叫赛博犹抱琵琶半遮面！”"
      },
      {
        speaker: "苏千禧",
        sprites: ["mahiru:normal", "millie:happy"],
        speaking: 1,
        text: "（把掌机举到鼻尖前，露出一双弯弯的眼睛小声跟读）“……像这样吗？谢谢惠顾，多爆金币~”"
      }
    ]
  },

  train_dress: {
    bg: "cheki2f",
    loc: "2F · 后台更衣室",
    sub: "上午训练 · 琥珀 × 真昼 改衣日常",
    lines: [
      {
        speaker: "陈琥珀",
        sprites: ["kohaku:normal", "mahiru:shy"],
        speaking: 0,
        text: "“吸什么肚子，胃还要不要了？这礼拜天天喝陆店长给你热的草莓牛奶，长了二两肉气色才好看！转过去，姐给你把腰线暗褶往外放半寸，正面看照样细！”"
      },
      {
        speaker: "林真昼",
        sprites: ["kohaku:normal", "mahiru:shy"],
        speaking: 1,
        text: "“……那你不准告诉陆沉我腰围胖了半寸啊，不然我把你今天炖的排骨汤全喝光！”"
      }
    ]
  },

  af_omurice: {
    bg: "cafe1f",
    loc: "1F · 水吧与点餐区",
    sub: "下午营业 · 招牌特调与手绘蛋包饭",
    lines: [
      {
        speaker: "陈琥珀",
        sprites: ["kohaku:normal", "mahiru:normal"],
        speaking: 0,
        text: "后厨颠勺的火光映亮了半个水吧，浓香的咖喱味顺着排风扇飘进后巷。真昼拿着番茄酱挤压瓶，三秒钟在蛋包饭上画出一只歪嘴黑猫。"
      },
      {
        speaker: "林真昼",
        sprites: ["kohaku:normal", "mahiru:normal"],
        speaking: 1,
        text: "“看什么看，歪嘴猫是本店隐藏限定款，多收你五块钱手工费都是便宜你了喵~”客人被怼得眉开眼笑，当场又加点了一杯草莓特调。"
      }
    ]
  },

  af_cheki_rush: {
    bg: "cheki2f",
    loc: "2F · 拍立得特典角",
    sub: "下午营业 · 拍切冲量专场（高收益·涨精神压力）",
    lines: [
      {
        speaker: "旁白",
        sprites: ["mahiru:normal"],
        text: "2F 拍切角的闪光灯连续亮了整整两个小时。真昼熟练地配合每位客人比心、眨眼；趁着下一位客人还没上楼的十秒空隙，她飞快卸下笑容揉了揉发酸的腮帮子，仰头喝了一口陆沉放在桌角的温水。"
      }
    ]
  },

  af_cp_cheki: {
    bg: "cheki2f",
    loc: "2F · 拍立得特典角",
    sub: "下午营业 · 双人 CP 合拍特典",
    lines: [
      {
        speaker: "林真昼",
        sprites: ["mahiru:normal", "reine:normal"],
        speaking: 0,
        text: "真昼趁相机读秒时故意往零音肩上靠，拿头上的蕾丝蝴蝶结去蹭零音冷酷的银灰长发；零音嘴角抽搐着伸出一根手指抵住真昼额头把她推开——这张抓拍直接卖断了三盒相纸！"
      }
    ]
  },

  special_exam_shred: {
    bg: "cafe1f",
    loc: "1F · 吧台门口「零分庇护所」",
    sub: "★ 热搜特企 · 撕碎模拟卷换半价草莓奶",
    lines: [
      {
        speaker: "陆沉（店长）",
        sprites: ["luchen:normal", "mahiru:normal"],
        speaking: 0,
        text: "早会刷到同城热搜 #一模分数线出炉，陆沉直接搬出一台办公碎纸机放在吧台门口，写了块黑板牌：【今日凭任何考砸的卷子进店，撕碎即享特调半价，考0分免单】。"
      },
      {
        speaker: "林真昼",
        sprites: ["luchen:normal", "mahiru:shy"],
        speaking: 1,
        text: "真昼站在碎纸机旁，一边毒舌吐槽“才扣二十分就哭鼻子，姐姐当年可是直接交白卷的”，一边手脚麻利地往每杯温牛奶里多加一勺草莓酱，自己心里的弦也在欢呼声中松开了大半。"
      }
    ]
  },

  act1_climax_duet: {
    bg: "liveB1",
    cg: "duetZero",
    loc: "B1 · 地下 Livehouse 舞台",
    sub: "★ 第一幕高潮 · 被谱成摇滚曲的《零分次品》",
    lines: [
      {
        speaker: "林真昼",
        sprites: ["mahiru:shy", "reine:normal"],
        speaking: 0,
        text: "“白石零音！把手机还我！谁准你偷看我昨天落下的翻盖机备忘录的？！看我一模考砸的笑话很爽是吧？！”"
      },
      {
        speaker: "白石零音",
        cg: "duetZero",
        text: "“滋——哐！！”零音没有嘲笑她，而是一脚重重踩下失真效果器踏板，在紫粉色的舞台追光下，用沙哑滚烫的嗓音把真昼备忘录里那句『零分的次品该往哪里逃命』原封不动唱成了炸裂的后朋克主歌！"
      },
      {
        speaker: "白石零音",
        cg: "duetZero",
        text: "“我讨厌说假话的人，林真昼——但你半夜两点躲在被子里写的这几句，是真话。这首《零分次品》词作者署名归你，以后我的歌，词全归你写了。”"
      },
      {
        speaker: "林真昼",
        cg: "duetZero",
        text: "（死死把五线谱抱在胸口，眼眶通红却把下巴抬得老高）“……谁答应跟你五五开了！词是我写的，我要拿五成半！第二段副歌明天上午十点我重填！”"
      }
    ]
  },

  stay_mahiru_rain: {
    bg: "cafe1f",
    cg: "mahiruRain",
    loc: "1F · 21:40 打烊后的深夜吧台",
    sub: "★ 留店深度剧情 · 烟盒背面的 98 分与温草莓奶",
    lines: [
      {
        speaker: "旁白",
        cg: "mahiruRain",
        text: "卷帘门拉下一半，外面下着梅雨。陆沉从B1检查完电闸上来时，发现真昼还没走。她踢掉了那双十厘米的厚底玛丽珍鞋，光着脚踩在吧台凳横档上，正慌张地擦拭一张被奶昔染成粉红色的盘点表。"
      },
      {
        speaker: "林真昼",
        cg: "mahiruRain",
        text: "“哎呀被抓包了~手滑把半杯奶昔扣账本上了，今天三十二单拍切流水全糊了哦。店长现在发火还来得及——要扣光我底薪，还是让我明天不用来了？”（她的左手却在围裙下死死抠着锁骨上的旧安全别针）"
      },
      {
        speaker: "陆沉（店长）",
        cg: "mahiruRain",
        text: "（没有接她带刺的话，只是把一杯恒温55度的热草莓牛奶推到她手边）“三十二单拍切，零钱抽屉多出三十五块客人没要的找零——你七点半交班前，不是早就用铅笔把总数心算好写在烟盒背面了吗？”"
      },
      {
        speaker: "陆沉（店长）",
        cg: "mahiruRain",
        text: "“心算比收银机还快的人，不用假装自己不会记账。404 的及格线是 0 分，把热牛奶喝了，胃不疼了就穿鞋回家。”"
      },
      {
        speaker: "林真昼",
        cg: "mahiruRain",
        text: "（盯着那杯冒热气的草莓牛奶好半天没动，声音低了八度）“……多管闲事。谁胃疼了，我只是嫌这破鞋磨脚。”"
      }
    ]
  },

  stay_mahiru_bday: {
    bg: "cafe1f",
    cg: "birthdayCake",
    loc: "1F · 10月24日 22:30 熄灯后的吧台",
    sub: "★ 真昼生诞祭 · 打烊后的「第二个小蛋糕」",
    lines: [
      {
        speaker: "旁白",
        cg: "birthdayCake",
        text: "庆功宴的大蛋糕被琥珀和零音分完了。等大家走后，陆沉在熄了灯的吧台从冷藏柜最底层端出一个只有巴掌大、去掉了所有腻人奶油、只铺满新鲜红颜草莓的玻璃方盒，旁边放着一枚挂粉色猫咪牌的店门备用钥匙。"
      },
      {
        speaker: "陆沉（店长）",
        cg: "birthdayCake",
        text: "“刚才看你嫌大蛋糕奶油腻，全刮到零音盘子里了。以后下雨天要是来得早，不用在后巷屋檐下蹲着等我开门，自己拿备用钥匙进来，热奶机一直开着。”"
      },
      {
        speaker: "林真昼",
        cg: "birthdayCake",
        text: "（烛光映在她亮晶晶的琥珀色瞳孔里，她一把抓过那枚钥匙塞进贴身口袋，趴在吧台上小声说）“……小气鬼陆沉，连个包装盒都没有。钥匙是你求我收下的，明年十月二十四号，这间店也还要在啊。”"
      }
    ]
  },

  typhoon_kohaku: {
    bg: "liveB1",
    cg: "typhoonKohaku",
    loc: "B1 · 台风夜倒灌的后勤配电间",
    sub: "★ 第二幕大高潮 · 39.5度高烧的大姐头与店长底牌",
    lines: [
      {
        speaker: "陈琥珀",
        cg: "typhoonKohaku",
        text: "（高烧39.5度跪在积水里死死攥着缝衣针，看到陆沉下来慌张地把脸往阴影里藏）“店长你别开灯……眼线全花了丑死了。别告诉真昼她们我外婆进急诊的事，我歇五分钟就能把演出服缝好……我要是塌了，这帮小哭包怎么办啊……”"
      },
      {
        speaker: "陆沉（店长）",
        cg: "typhoonKohaku",
        text: "（直接啪地拉下总电闸，半蹲在她面前把滚烫的她背上后背）“在 404，还轮不到一个二十岁的小姑娘拿命替老板扛事。外婆的住院押金我已经交了。陈琥珀，你今晚唯一的排班，就是趴在我背上去医院睡觉。”"
      },
      {
        speaker: "苏千禧",
        sprites: ["millie:normal", "mahiru:shy"],
        speaking: 0,
        text: "（当晚店里，千禧第一次钻出吧台替琥珀焊好灯控；而在帮陆沉拿换洗外套去医院时，姑娘们从他公文包里翻出了大厂P8裸辞单、重度失眠诊断书与押上全部身家的对赌协议——原来这个温和的男人，是在拿这90天当自己人生的最后一场豪赌。）"
      }
    ]
  },

  break_badge: {
    bg: "cafe1f",
    cg: "breakBadge",
    loc: "1F · 暴雨夜的审判与护短",
    sub: "★ 第三幕大高潮 · 当众折断的大厂P8烫金工牌",
    lines: [
      {
        speaker: "旁白",
        cg: "breakBadge",
        text: "真昼的教导主任母亲闯进店里，当众拽着真昼羞辱她“一模考砸就自甘堕落，穿成这副鬼样子怎么进大厂当体面人”。真昼脸色惨白浑身发抖，陆沉温和地走上前把真昼挡在身后，掏出自己那张烫金的大厂P8首席架构师工牌。"
      },
      {
        speaker: "陆沉（店长）",
        cg: "breakBadge",
        text: "（当着真昼母亲的面，双手捏住那张无数家长奉若神明的烫金工牌，“咔嚓”一声脆响将其折成两半扔进垃圾桶，微笑着推了推眼镜）“林老师，您逼真昼拿命去考的那个终点，我上个月刚当垃圾扔了。那里凌晨三点有人在消防通道吐血，一点意思都没有。”"
      },
      {
        speaker: "林真昼",
        cg: "mahiruRain",
        text: "（卷帘门拉下后，陆沉替蹲在地上哭的真昼解下了左锁骨上那枚扎了她两年的生锈安全别针）“在我这儿不用考一百分。考零分，你的工位也永远留着。”"
      }
    ]
  },

  reine_rebel: {
    bg: "liveB1",
    cg: "duetZero",
    loc: "B1 · 第四幕决战：五个疯子的双向救赎",
    sub: "★ 反救店长 & 全网直播撕碎甜美团服",
    lines: [
      {
        speaker: "林真昼",
        sprites: ["mahiru:shy", "kohaku:normal"],
        speaking: 0,
        text: "（第10周深夜，发现陆沉签好个人破产顶罪书准备独自扛雷消失，四个姑娘用撬棍撬开卷帘门把他死死堵在吧台，真昼抢过顶罪书撕得粉碎甩在他脸上）“大骗子！！你说过404不准交白卷当逃兵，结果你自己想跑路？！我不签字，你哪儿也别想去！”"
      },
      {
        speaker: "白石零音",
        sprites: ["reine:normal", "luchen:normal"],
        speaking: 0,
        text: "（指着B1第一排被琥珀用电焊焊死在地板上的旧铁椅）“看清楚了大厂逃兵，那把椅子焊死了。明晚八点全网直播，你就给我坐在这儿看我怎么掀翻白昼娱乐的桌！”"
      },
      {
        speaker: "旁白",
        cg: "duetZero",
        text: "次日晚直播开启，面对虚伪的假唱垫音，零音创伤失音发作手抖。台下第一排的陆沉直接跨进控台推掉全部商业垫音，用鼓槌敲响原曲真正的4/4拍！零音眼底燃起疯火，当众一把扯碎粉色甜美罩衫露出黑银荆棘战袍，用泣血真声唱回原曲，千禧同步将盗曲铁证投满全屏！"
      }
    ]
  },

  new_year_finale: {
    bg: "rooftop3f",
    cg: "finaleLive",
    loc: "B1 跨年千人安可祭 → 3F 飘雪露台",
    sub: "★ 第五幕终局 · 裂缝里的安可曲",
    lines: [
      {
        speaker: "旁白",
        cg: "finaleLive",
        text: "12月31日跨年夜，B1地下舞台被上千名挥舞荧光棒的年轻同好挤得水泄不通！千禧戴着发光猫耳面具在DJ台控场，琥珀掌管战袍与特调，真昼与零音并肩唱响《裂缝里的安可曲》，90天保卫战大获全胜！"
      },
      {
        speaker: "系统提示",
        bg: "rooftop3f",
        sprites: ["luchen:normal"],
        text: "23:55 庆功火锅局散去，零点的跨年烟花即将升空。你的手机在口袋里震动了一下——今晚你想邀请哪位妹妹登上【3F 飘雪露台】迎接零点钟声？（可在右侧面板随时切换体验四位妹妹的完整 True End 告白！）"
      }
    ]
  }
};
