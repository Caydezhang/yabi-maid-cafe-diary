(function () {
  const D = window.GAME_DATA;
  const S = window.GAME_STORIES;

  const state = {
    mode: "title", // title | prologue | game
    tutorialStep: 0, // 0 = off, 1..6 = active step
    unlockedDossiers: ["luchen"],
    dayIdx: 0,
    phase: "roster", // roster -> morning -> afternoon -> evening -> night
    money: 4500,
    fans: 320,
    nextBuff: 1.0,
    sideTab: "ops",
    activeStory: null,
    lineIdx: 0,
    typingTimer: null,
    wxReplied: false,
    voiceMuted: false,
    currentVoiceUrl: null
  };

  const voicePlayer = new Audio();
  voicePlayer.preload = "auto";

  function updateVoiceUi(isPlaying) {
    const vBtn = document.getElementById("gal-voice-btn");
    const vLabel = document.getElementById("gal-voice-label");
    const hudBtn = document.getElementById("hud-voice-btn");
    if (hudBtn) {
      hudBtn.textContent = state.voiceMuted ? "🔇 配音: 静音" : "🔊 配音: 开启";
    }
    if (!vBtn || !vLabel) return;
    if (!state.currentVoiceUrl) {
      vBtn.style.display = "none";
      return;
    }
    vBtn.style.display = "inline-flex";
    if (state.voiceMuted) {
      vBtn.classList.remove("playing");
      vLabel.textContent = "已静音 (点击重播)";
    } else if (isPlaying) {
      vBtn.classList.add("playing");
      vLabel.textContent = "配音播放中";
    } else {
      vBtn.classList.remove("playing");
      vLabel.textContent = "重播语音";
    }
  }

  voicePlayer.addEventListener("play", () => updateVoiceUi(true));
  voicePlayer.addEventListener("ended", () => updateVoiceUi(false));
  voicePlayer.addEventListener("pause", () => updateVoiceUi(false));

  function playVoiceClip(url) {
    state.currentVoiceUrl = url || null;
    try {
      voicePlayer.pause();
      voicePlayer.currentTime = 0;
    } catch (e) {}
    if (!url || state.voiceMuted || state.mode === "title") {
      updateVoiceUi(false);
      return;
    }
    voicePlayer.src = url;
    voicePlayer.play().catch(() => {
      updateVoiceUi(false);
    });
  }

  window.replayCurrentVoice = function (ev) {
    if (ev) ev.stopPropagation();
    if (state.voiceMuted) {
      state.voiceMuted = false;
    }
    if (state.currentVoiceUrl) {
      playVoiceClip(state.currentVoiceUrl);
    }
  };

  window.toggleVoiceMute = function () {
    state.voiceMuted = !state.voiceMuted;
    if (state.voiceMuted) {
      try {
        voicePlayer.pause();
      } catch (e) {}
      updateVoiceUi(false);
    } else if (state.currentVoiceUrl) {
      playVoiceClip(state.currentVoiceUrl);
    } else {
      updateVoiceUi(false);
    }
  };

  function curDay() {
    return D.calendar[state.dayIdx] || D.calendar[0];
  }

  function init() {
    renderAll();
    // Pre-load prologue behind title screen
    playStory("prologue_story");
  }

  // ==================== START & MODE SWITCHING ====================
  window.startGameMode = function (modeType) {
    const titleEl = document.getElementById("title-screen");
    if (titleEl) titleEl.classList.add("hidden");

    if (modeType === "prologue") {
      state.mode = "prologue";
      state.tutorialStep = 0;
      state.unlockedDossiers = ["luchen"];
      playStory("prologue_story");
      renderAll();
    } else if (modeType === "tutorial") {
      state.mode = "game";
      state.dayIdx = 0;
      state.phase = "roster";
      state.tutorialStep = 1;
      state.sideTab = "ops";
      playStory("opening_day");
      renderAll();
    } else {
      // sandbox
      state.mode = "game";
      state.dayIdx = 0;
      state.phase = "roster";
      state.tutorialStep = 0;
      state.sideTab = "ops";
      playStory("opening_day");
      renderAll();
    }
  };

  window.showTitleScreen = function () {
    const titleEl = document.getElementById("title-screen");
    if (titleEl) titleEl.classList.remove("hidden");
  };

  window.finishPrologueToTutorial = function () {
    state.mode = "game";
    state.dayIdx = 0;
    state.phase = "roster";
    state.tutorialStep = 1;
    state.sideTab = "ops";
    // Set Mahiru stress to 68% so player immediately sees how resting clears high stress
    D.characters.mahiru.stress = 68;
    D.characters.mahiru.onDuty = true;
    playStory("opening_day");
    renderAll();
  };

  window.skipTutorial = function () {
    state.tutorialStep = 0;
    renderAll();
  };

  window.toggleGuideModal = function (show) {
    const modal = document.getElementById("guide-modal");
    if (modal) modal.classList.toggle("show", !!show);
  };

  // ==================== STORY & GALGAME ENGINE ====================
  function playStory(key, customStory) {
    const st = customStory || S[key];
    if (!st) return;
    state.activeStory = st;
    state.lineIdx = 0;
    showCurrentLine();
  }

  function showCurrentLine() {
    const st = state.activeStory;
    if (!st) return;
    const ln = st.lines[state.lineIdx];
    if (!ln) return;

    if (ln.unlockDossier && !state.unlockedDossiers.includes(ln.unlockDossier)) {
      state.unlockedDossiers.push(ln.unlockDossier);
      if (state.mode === "prologue") renderAll();
    }

    const bgEl = document.getElementById("stage-bg");
    const cgEl = document.getElementById("stage-cg");
    const locTitle = document.getElementById("loc-title");
    const locSub = document.getElementById("loc-sub");

    const bgKey = ln.bg || st.bg || "cafe1f";
    if (D.backgrounds[bgKey]) bgEl.src = D.backgrounds[bgKey];

    // Only show full-screen CG if the current line explicitly specifies ln.cg (or if the story has st.cg and the line has no sprites)
    const cgKey = ln.cg || (!ln.sprites && st.cg) || null;
    if (cgKey && D.cgs[cgKey]) {
      cgEl.src = D.cgs[cgKey];
      cgEl.classList.add("show");
    } else {
      cgEl.classList.remove("show");
    }

    locTitle.textContent = st.loc || "1F · 404 女仆喫茶";
    locSub.textContent = st.sub || curDay().weekLabel;

    // Render transparent PNG sprites
    const spWrap = document.getElementById("sprite-layer");
    spWrap.innerHTML = "";
    if (!cgKey && ln.sprites && ln.sprites.length) {
      ln.sprites.forEach((token, idx) => {
        const [cid, mood] = token.split(":");
        const ch = D.characters[cid];
        if (!ch) return;
        const src = (ch.sprites && ch.sprites[mood]) || ch.sprites.normal;
        const img = document.createElement("img");
        img.className = "sprite-item";
        if (typeof ln.speaking === "number") {
          img.classList.add(ln.speaking === idx ? "speaking" : "dim");
        }
        img.src = src;
        spWrap.appendChild(img);
      });
    }

    document.getElementById("gal-speaker").textContent = ln.speaker || "旁白";
    document.getElementById("gal-tag").textContent = ln.tag || "";

    // Play neural TTS voice clip for this line
    playVoiceClip(ln.voice || null);

    const textEl = document.getElementById("gal-text");
    if (state.typingTimer) clearInterval(state.typingTimer);
    textEl.textContent = "";
    const full = ln.text || "";
    let i = 0;
    state.typingTimer = setInterval(() => {
      textEl.textContent = full.slice(0, ++i);
      if (i >= full.length) clearInterval(state.typingTimer);
    }, 14);

    // Render interactive dialogue choices or prologue completion button
    const choicesEl = document.getElementById("gal-choices");
    const nextHintEl = document.getElementById("gal-next-hint");
    choicesEl.innerHTML = "";

    if (ln.choices && ln.choices.length) {
      nextHintEl.textContent = "▲ 请在上方选择你的回应";
      ln.choices.forEach((ch) => {
        const btn = document.createElement("button");
        btn.className = "gal-choice-btn";
        btn.textContent = ch.label;
        btn.onclick = function (ev) {
          ev.stopPropagation();
          state.lineIdx = ch.nextLine;
          showCurrentLine();
        };
        choicesEl.appendChild(btn);
      });
    } else if (ln.isPrologueEnd) {
      nextHintEl.textContent = "▲ 点击上方按钮正式开启第一天试营业";
      const btn = document.createElement("button");
      btn.className = "gal-choice-btn";
      btn.textContent = "▶ 签下对赌协议 · 开启首日试营业（进入 6 步实机教学）";
      btn.onclick = function (ev) {
        ev.stopPropagation();
        window.finishPrologueToTutorial();
      };
      choicesEl.appendChild(btn);
    } else {
      nextHintEl.textContent =
        state.lineIdx < st.lines.length - 1
          ? "▼ 点击画面继续下一句对话"
          : state.mode === "prologue"
          ? "▼ 点击画面进入试营业教学"
          : "▼ 本段对话已读完 · 请在右侧面板点选经营操作";
    }

    const prog = document.getElementById("gal-progress");
    prog.textContent = `剧情进度 ${state.lineIdx + 1} / ${st.lines.length}`;
  }

  window.advanceDialogue = function () {
    const st = state.activeStory;
    if (!st) return;
    const textEl = document.getElementById("gal-text");
    const ln = st.lines[state.lineIdx];
    if (!ln) return;

    if (textEl.textContent.length < ln.text.length) {
      clearInterval(state.typingTimer);
      textEl.textContent = ln.text;
      return;
    }
    if (ln.choices && ln.choices.length) {
      return; // wait for player to click choice
    }
    if (ln.isPrologueEnd) {
      window.finishPrologueToTutorial();
      return;
    }
    if (state.lineIdx < st.lines.length - 1) {
      state.lineIdx++;
      showCurrentLine();
    }
  };

  // ==================== ROSTER & 4-PERIOD OPERATIONS ====================
  window.toggleDuty = function (cid) {
    if (state.phase !== "roster") return;
    const ch = D.characters[cid];
    ch.onDuty = !ch.onDuty;
    renderAll();
  };

  window.confirmRoster = function () {
    const restedNames = [];
    ["mahiru", "reine", "kohaku", "millie"].forEach((cid) => {
      const ch = D.characters[cid];
      if (!ch.onDuty) {
        ch.fatigue = 0;
        ch.stress = 0;
        restedNames.push(ch.name);
      }
    });
    state.phase = "morning";
    if (state.tutorialStep === 1) state.tutorialStep = 2;
    renderAll();

    const day = curDay();
    if (day.specialId === "typhoon_kohaku") {
      playStory("typhoon_kohaku");
    } else if (day.specialId === "break_badge") {
      playStory("break_badge");
    } else if (day.specialId === "reine_rebel") {
      playStory("reine_rebel");
    } else if (day.specialId === "new_year_finale") {
      playStory("new_year_finale");
    } else {
      playStory(null, {
        bg: "cafe1f",
        loc: "1F · 早会考勤完毕 · 进入①上午训练",
        sub: "反 007 轮休生效 · 休假人员负面状态已 100% 清零",
        lines: [
          {
            speaker: "陆沉（店长）",
            sprites: ["luchen:normal", "kohaku:normal"],
            speaking: 0,
            voice: restedNames.length
              ? "game_assets/voices/sys_roster_rest.mp3"
              : "game_assets/voices/sys_roster_all.mp3",
            text: restedNames.length
              ? `已批准【${restedNames.join("、")}】今日休假在家躺平，其体力疲劳与亚比精神压力已直接 100% 清零！现在请在右侧选择【① 上午 (10:00) 晨间训练】方案。`
              : "今日全员满状态出勤！现在请在右侧面板选择【① 上午 (10:00) 晨间训练】方案。"
          }
        ]
      });
    }
  };

  window.runOption = function (optId) {
    const list = D.periodOptions[state.phase] || [];
    const opt = list.find((o) => o.id === optId);
    if (!opt) return;

    const activeChars = ["mahiru", "reine", "kohaku", "millie"]
      .map((id) => D.characters[id])
      .filter((c) => c.onDuty);

    if (state.phase === "morning") {
      activeChars.forEach((c) => {
        if (opt.stat && typeof c[opt.stat] === "number") {
          c[opt.stat] = Math.min(100, c[opt.stat] + opt.gain);
        }
        c.fatigue = Math.max(0, Math.min(100, c.fatigue + opt.fatigue));
        c.stress = Math.max(0, Math.min(100, c.stress + opt.stress));
      });
      state.phase = "afternoon";
      if (state.tutorialStep === 2) state.tutorialStep = 3;
      if (opt.storyKey && S[opt.storyKey]) playStory(opt.storyKey);
    } else if (state.phase === "afternoon") {
      const avgSkill =
        activeChars.reduce((acc, c) => acc + (c[opt.stat] || 60), 0) /
        Math.max(1, activeChars.length);
      const earned = Math.round(opt.baseMoney * (0.75 + avgSkill / 180) * state.nextBuff);
      state.money += earned;
      activeChars.forEach((c) => {
        c[opt.stat] = Math.min(100, c[opt.stat] + 4);
        c.fatigue = Math.max(0, Math.min(100, c.fatigue + opt.fatigue));
        c.stress = Math.max(0, Math.min(100, c.stress + opt.stress));
      });
      state.phase = "evening";
      if (state.tutorialStep === 3) state.tutorialStep = 4;
      if (opt.storyKey && S[opt.storyKey]) playStory(opt.storyKey);
    } else if (state.phase === "evening") {
      const avgStage =
        activeChars.reduce((acc, c) => acc + c.stage, 0) / Math.max(1, activeChars.length);
      const earned = Math.round(opt.baseMoney * (0.8 + avgStage / 160) * state.nextBuff);
      state.money += earned;
      state.fans += Math.round(earned / 35);
      state.nextBuff = 1.0;
      activeChars.forEach((c) => {
        c.stage = Math.min(100, c.stage + 5);
        c.fatigue = Math.max(0, Math.min(100, c.fatigue + opt.fatigue));
        c.stress = Math.max(0, Math.min(100, c.stress + opt.stress));
      });
      state.phase = "night";
      state.wxReplied = false;
      if (state.tutorialStep === 4) state.tutorialStep = 5;
      if (opt.storyKey && S[opt.storyKey]) {
        playStory(opt.storyKey);
      } else {
        playStory(null, {
          bg: "liveB1",
          loc: "B1 · 地下 Livehouse 演出圆满落幕",
          sub: `晚场票房入账 +¥${earned} · 进入④下班社媒与留店选择`,
          lines: [
            {
              speaker: "白石零音",
              sprites: ["reine:normal", "mahiru:normal"],
              speaking: 0,
              voice: "game_assets/voices/sys_evening_done.mp3",
              text: `今晚 B1 舞台演出结算完成，门票与酒水打赏共入账 ¥${earned}！现在是 21:30 打烊时间，请在右侧选择【下班社媒宣发】或触发【★ 21:30 留店独处剧情】。`
            }
          ]
        });
      }
    } else if (state.phase === "night") {
      state.nextBuff = opt.buffNext || 1.3;
      ["mahiru", "reine", "kohaku", "millie"].forEach((id) => {
        const c = D.characters[id];
        c.stress = Math.max(0, c.stress + (opt.stressDelta || -15));
        c.bond = Math.min(100, c.bond + 8);
      });
      if (opt.storyKey && S[opt.storyKey]) {
        playStory(opt.storyKey);
      }
      if (state.tutorialStep === 5) state.tutorialStep = 6;
      state.sideTab = "phone";
    }
    renderAll();
  };

  window.replyWeChat = function (cid, stressClear, replyText, herResp) {
    const ch = D.characters[cid];
    if (ch) {
      ch.stress = Math.max(0, ch.stress - stressClear);
      ch.bond = Math.min(100, ch.bond + 10);
    }
    state.wxReplied = true;
    const wxStoryKey = cid === "mahiru" ? "wx_mahiru_reply" : "wx_reine_reply";
    if (S[wxStoryKey]) {
      playStory(wxStoryKey);
    }
    renderAll();
  };

  window.nextDay = function () {
    state.mode = "game";
    if (state.tutorialStep === 6) state.tutorialStep = 0; // Completed tutorial!
    if (state.dayIdx < D.calendar.length - 1) {
      state.dayIdx++;
    } else {
      state.dayIdx = 0;
    }
    state.phase = "roster";
    state.sideTab = "ops";
    state.wxReplied = false;
    renderAll();
    const d = curDay();
    playStory(null, {
      bg: "cafe1f",
      loc: d.weekLabel + " · " + d.title,
      sub: d.specialHint,
      lines: [
        {
          speaker: "陈琥珀",
          sprites: ["kohaku:normal", "luchen:normal"],
          speaking: 0,
          voice: "game_assets/voices/sys_new_day.mp3",
          text: `“新的一天开始啦老板（${d.weekLabel}）！${d.specialHint}。先在右侧排班表上看看今天谁出勤、谁放假休息吧！”`
        }
      ]
    });
  };

  window.jumpToDay = function (idx) {
    state.mode = "game";
    state.tutorialStep = 0;
    state.dayIdx = idx;
    state.phase = "roster";
    state.sideTab = "ops";
    renderAll();
    const d = curDay();
    if (d.specialId && S[d.specialId]) {
      playStory(d.specialId);
    } else {
      window.nextDay();
    }
  };

  window.triggerTrueEnd = function (cid) {
    state.mode = "game";
    const key = "true_end_" + cid;
    if (S[key]) {
      playStory(key);
    }
  };

  // ==================== UI RENDERING ====================
  function renderTutorialBanner() {
    if (state.mode !== "game" || !state.tutorialStep || !D.tutorialSteps[state.tutorialStep]) {
      return "";
    }
    const t = D.tutorialSteps[state.tutorialStep];
    return `
      <div class="tutorial-banner">
        <div class="tutorial-head">
          <span class="tutorial-badge">${t.step}</span>
          <button class="tutorial-skip" onclick="skipTutorial()">跳过引导 ✕</button>
        </div>
        <b>${t.title}</b>
        <p style="white-space:pre-line">${t.body}</p>
      </div>`;
  }

  function renderAll() {
    const d = curDay();
    document.getElementById("hud-day").textContent =
      state.mode === "prologue" ? "序章 · 接手前夜 (10/06)" : d.weekLabel;
    document.getElementById("hud-money").textContent = "¥" + state.money.toLocaleString();
    document.getElementById("hud-rent").textContent = "¥" + d.rentGoal.toLocaleString();
    document.getElementById("hud-fans").textContent = state.fans.toLocaleString();

    const phases = [
      { id: "roster", label: "0.反007排班" },
      { id: "morning", label: "①上午训练" },
      { id: "afternoon", label: "②下午点餐拍切" },
      { id: "evening", label: "③晚上演出" },
      { id: "night", label: "④下班社媒/夜生活" }
    ];
    const pOrder = phases.map((p) => p.id);
    const curIdx = state.mode === "prologue" ? -1 : pOrder.indexOf(state.phase);
    document.getElementById("hud-phases").innerHTML =
      state.mode === "prologue"
        ? `<span class="phase-pill active">🎬 序章剧情模式（阅读完左侧剧情后解锁店铺经营）</span>`
        : phases
            .map(
              (p, i) =>
                `<span class="phase-pill ${i === curIdx ? "active" : i < curIdx ? "done" : ""}">${p.label}</span>`
            )
            .join("");

    document.querySelectorAll(".side-tab").forEach((el) => {
      el.classList.toggle("active", el.dataset.tab === state.sideTab);
    });

    const body = document.getElementById("side-body");
    if (state.mode === "prologue" && state.sideTab === "ops") {
      renderPrologueSidebar(body);
    } else if (state.sideTab === "ops") {
      renderOpsTab(body, d);
    } else if (state.sideTab === "phone") {
      renderPhoneTab(body);
    } else {
      renderChaptersTab(body);
    }
  }

  function renderPrologueSidebar(body) {
    const cardsHtml = state.unlockedDossiers
      .map((cid) => {
        const c = D.characters[cid];
        if (!c) return "";
        return `
        <div class="char-card">
          <img class="char-avatar" src="${c.avatar}" alt="${c.name}">
          <div class="char-meta">
            <div class="char-top">
              <b>${c.name}</b>
              <span class="skill-pill"><em>${c.tag}</em></span>
            </div>
            <p style="font-size:11.5px;color:#b8aec8;line-height:1.45">${c.styleDesc || ""}</p>
          </div>
        </div>`;
      })
      .join("");

    body.innerHTML = `
      <div class="tutorial-banner">
        <div class="tutorial-head">
          <span class="tutorial-badge">序章 · 沉浸叙事模式</span>
          <button class="tutorial-skip" onclick="finishPrologueToTutorial()">跳过序章 ▶</button>
        </div>
        <b>欢迎来到《拯救亚比妹妹——仆咖经营日记》</b>
        <p>• 当前为【序章剧情】阶段：请点击左侧画面阅读陆沉从大厂裸辞、雨夜接手 404 喫茶并与四位亚比妹妹初遇的故事。\n• 随剧情推进，下方会逐一解锁登场人物档案；读完序章后将进入【首日手把手经营教学】！</p>
      </div>
      <div style="font-size:12px;color:#e9c76d;font-weight:700">📂 已解锁登场人物档案 (${state.unlockedDossiers.length} / 5)</div>
      ${cardsHtml}
      <button class="op-btn special" style="text-align:center;margin-top:auto" onclick="finishPrologueToTutorial()">
        <b>⚡ 跳过序章剧情 · 直接开始首日试营业教学</b>
      </button>`;
  }

  function renderOpsTab(body, d) {
    const tutBanner = renderTutorialBanner();

    const charHtml = ["mahiru", "reine", "kohaku", "millie"]
      .map((cid) => {
        const c = D.characters[cid];
        const highStress = c.stress >= 60 || c.fatigue >= 60;
        const highlightCard = state.tutorialStep === 1 && cid === "mahiru" ? "tut-highlight" : "";
        return `
        <div class="char-card ${!c.onDuty ? "resting" : highStress ? "warn" : ""} ${highlightCard}">
          <img class="char-avatar" src="${c.avatar}" alt="${c.name}">
          <div class="char-meta">
            <div class="char-top">
              <b>${c.name} <span style="font-size:11px;color:#b8aec8;font-weight:400">${c.tag}</span></b>
              <button class="duty-btn ${c.onDuty ? "work" : "rest"}" onclick="toggleDuty('${cid}')">
                ${c.onDuty ? "今日出勤" : "★休假(双清零)"}
              </button>
            </div>
            <div class="bars-row">
              <div class="mini-bar">
                🔵 体力疲劳 ${c.fatigue}%
                <div class="track"><div class="fill" style="width:${c.fatigue}%;background:#70b5ff"></div></div>
              </div>
              <div class="mini-bar">
                🌸 亚比精神压力 ${c.stress}%
                <div class="track"><div class="fill" style="width:${c.stress}%;background:${c.stress >= 60 ? "#ff4d6a" : "#ff5f91"}"></div></div>
              </div>
            </div>
            <div class="skill-pills">
              <span class="skill-pill">美食 <em>${c.food}</em></span>
              <span class="skill-pill">饭撒 <em>${c.charm}</em></span>
              <span class="skill-pill">唱跳 <em>${c.stage}</em></span>
              <span class="skill-pill">社媒 <em>${c.social}</em></span>
            </div>
          </div>
        </div>`;
      })
      .join("");

    let actionBox = "";
    if (state.phase === "roster") {
      const btnHighlight = state.tutorialStep === 1 ? "tut-highlight" : "";
      actionBox = `
        <div class="op-box">
          <div class="op-title">Step 0 · 反 007 考勤排班（点击下方卡片切换出勤/休假）</div>
          <p style="font-size:12px;color:#b8aec8;margin-bottom:10px;line-height:1.5">
            ${d.specialHint}<br>提示：真昼昨晚熬夜算账精神压力已达 68%，可点她卡片右上角设为【休假】一键清零，或带她出勤并在下班留店安慰她！
          </p>
          <button id="btn-confirm-roster" class="op-btn special ${btnHighlight}" style="width:100%;text-align:center" onclick="confirmRoster()">
            <b>▶ 确认今日出勤名单 · 开启一日四时段运营</b>
          </button>
        </div>`;
    } else {
      const opts = (D.periodOptions[state.phase] || []).filter(
        (o) => !o.specialFor || o.specialFor === d.specialId
      );
      const titles = {
        morning: "① 上午 (10:00) · 选择晨间训练与备场方案",
        afternoon: "② 下午 (14:00) · 选择点餐+拍切营业重心",
        evening: "③ 晚上 (19:00) · 选择 B1 舞台演出方案",
        night: "④ 下班 (22:00) · 社媒运营引流 & 留店剧情"
      };
      const listHighlight = state.tutorialStep >= 2 && state.tutorialStep <= 5 ? "tut-highlight" : "";
      actionBox = `
        <div class="op-box ${listHighlight}">
          <div class="op-title">${titles[state.phase]}</div>
          <div class="op-list">
            ${opts
              .map(
                (o) => `
              <button class="op-btn ${o.name.includes("★") ? "special" : ""}" onclick="runOption('${o.id}')">
                <b>${o.name}</b>
                <span>${o.desc}</span>
              </button>`
              )
              .join("")}
          </div>
        </div>`;
    }

    body.innerHTML =
      tutBanner +
      actionBox +
      `<div style="font-size:12px;color:#867a99;font-weight:700">店员状态与四维技能面板（点击右上角切换出勤/休假）</div>` +
      charHtml;
  }

  function renderPhoneTab(body) {
    const tutBanner = renderTutorialBanner();
    const wxHighlight = state.tutorialStep === 6 && !state.wxReplied ? "tut-highlight" : "";
    const sleepHighlight = state.tutorialStep === 6 && state.wxReplied ? "tut-highlight" : "";

    body.innerHTML = `
      ${tutBanner}
      <div class="phone-card">
        <div class="op-title">📱 小红书 (RED) · 妹妹夜间营业笔记</div>
        <div class="red-post">
          <img src="game_assets/cg_mahiru_rainy_night.jpg" alt="小红书配图">
          <div class="red-body">
            <b style="color:#ff8fb0">@林真昼_Mahiru</b> · 00:18 发布<br>
            今天2F拍切排到楼梯口啦，手腕都画酸了呢~（第9张角落不小心拍到了店长热的温草莓奶）<br>
            <span style="color:#867a99">#地雷系 #404女仆喫茶 #地下偶像</span>
          </div>
        </div>
      </div>

      <div id="wx-reply-box" class="phone-card ${wxHighlight}">
        <div class="op-title">💬 微信私聊 · 半夜秒撤回消息（点击回复帮她消除精神压力）</div>
        <div class="wx-bubble recall">“真昼🍓” 撤回了一条消息 (01:15)</div>
        <div class="wx-bubble"><b>真昼🍓：</b>今天最后那个客人非说我画的歪嘴猫不如隔壁店的圆……算了，反正我只会左手乱涂鸦，明天把拍切岗换给别人吧。</div>
        <div class="op-list" style="margin-top:8px">
          <button class="op-btn special" onclick="replyWeChat('mahiru', 35, '他眼神不好。你画的那张歪嘴猫我刚拿相框裱起来挂收银台正中间了，本店镇店非卖品。', '“……你有病吧挂那个干嘛！丑死了，明天早上我去换张画得更好看的挂上去！睡觉了不理你了！”（真昼精神压力 -35%）')">
            <b>▶ 回复真昼（懂她接梗 · 精神压力 -35%）</b>
            <span>“你画的那张歪嘴猫我裱起来挂收银台了，本店镇店非卖品。”</span>
          </button>
          <button class="op-btn" onclick="replyWeChat('reine', 35, '大晚上别戴着500度近视眼镜摸黑找糖罐。在出租屋等着，我刚煮了热可可挂你门把手上。', '“……谁让你送了。少放半勺糖，到了敲两下门就行，我没化妆不开门。”（零音精神压力 -35%）')">
            <b>▶ 回复零音（深夜送热可可 · 精神压力 -35%）</b>
            <span>“别戴着500度眼镜摸黑下楼，热可可五分钟后挂你门把手上。”</span>
          </button>
        </div>
      </div>

      <button class="op-btn special ${sleepHighlight}" style="text-align:center;padding:12px" onclick="nextDay()">
        <b>🌙 关灯睡觉 · 进入下一天日程 ${state.tutorialStep === 6 ? "（完成新手教学！）" : ""}</b>
      </button>`;
  }

  function renderChaptersTab(body) {
    const chList = D.calendar
      .map(
        (c, idx) => `
        <button class="op-btn ${idx === state.dayIdx && state.mode === "game" ? "special" : ""}" onclick="jumpToDay(${idx})">
          <b>${c.weekLabel} · ${c.title}</b>
          <span>${c.specialHint}</span>
        </button>`
      )
      .join("");

    body.innerHTML = `
      <div class="op-box">
        <div class="op-title">🎬 重新体验序章与新手引导</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button class="op-btn special" onclick="startGameMode('prologue')"><b>▶ 重播序章剧情</b><span>逃离大厂与初遇四女主</span></button>
          <button class="op-btn" onclick="startGameMode('tutorial')"><b>📘 重启首日教学</b><span>6步手把手实机引导</span></button>
        </div>
      </div>
      <div class="op-box">
        <div class="op-title">🌸 跨年露台 · 四女主单人 True End 快速直达</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button class="op-btn special" onclick="triggerTrueEnd('mahiru')"><b>真昼 True End</b><span>备用钥匙与99分</span></button>
          <button class="op-btn special" onclick="triggerTrueEnd('reine')"><b>零音 True End</b><span>第0号真话</span></button>
          <button class="op-btn special" onclick="triggerTrueEnd('kohaku')"><b>琥珀 True End</b><span>专属砂糖橘</span></button>
          <button class="op-btn special" onclick="triggerTrueEnd('millie')"><b>千禧 True End</b><span>永久存档点</span></button>
        </div>
      </div>
      <div class="op-box">
        <div class="op-title">📅 12 周五幕剧核心章节与特殊企划日直达</div>
        <div class="op-list">${chList}</div>
      </div>`;
  }

  window.switchSideTab = function (tab) {
    state.sideTab = tab;
    renderAll();
  };

  window.addEventListener("DOMContentLoaded", init);
})();
