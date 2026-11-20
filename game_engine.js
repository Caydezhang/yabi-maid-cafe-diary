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
    currentVoiceUrl: null,
    stageView: "l2d" // "3d" | "l2d"
  };

  function applyStageView(viewMode) {
    state.stageView = viewMode;
    const is3d = viewMode === "3d" && !!window.CAFE_SIM_3D;
    const stageWrap = document.querySelector(".stage-wrap");
    if (stageWrap) stageWrap.classList.toggle("sim3d-mode", is3d);
    if (window.CAFE_SIM_3D) {
      window.CAFE_SIM_3D.setVisible(is3d);
      if (is3d) window.CAFE_SIM_3D.syncWithGameState(state, D);
    }
    const b3d = document.getElementById("btn-view-3d");
    const bl2d = document.getElementById("btn-view-l2d");
    if (b3d) b3d.classList.toggle("active", is3d);
    if (bl2d) bl2d.classList.toggle("active", !is3d);
  }

  window.switchStageView = function (viewMode, ev) {
    if (ev) ev.stopPropagation();
    applyStageView(viewMode);
  };

  const voicePlayer = new Audio();
  voicePlayer.preload = "auto";

  // ==================== FLOATING (!) TOOLTIP ENGINE ====================
  function escAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function infoTip(title, text) {
    const tAttr = title ? ` data-tip-title="${escAttr(title)}"` : "";
    return `<span class="info-tip" onclick="event.stopPropagation()"${tAttr} data-tip="${escAttr(text)}">!</span>`;
  }

  function initTooltipSystem() {
    let tipEl = document.getElementById("global-tooltip");
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.id = "global-tooltip";
      document.body.appendChild(tipEl);
    }

    let activeTrigger = null;

    function positionTooltip(clientX, clientY, anchorEl) {
      const pad = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = tipEl.getBoundingClientRect();
      const w = rect.width || 240;
      const h = rect.height || 80;

      let x = clientX + 14;
      let y = clientY + 14;

      if (anchorEl && (clientX === 0 && clientY === 0)) {
        const ar = anchorEl.getBoundingClientRect();
        x = ar.left;
        y = ar.bottom + 8;
      }

      if (x + w + pad > vw) {
        x = Math.max(pad, clientX - w - 14);
      }
      if (y + h + pad > vh) {
        y = Math.max(pad, clientY - h - 14);
      }
      tipEl.style.left = Math.round(x) + "px";
      tipEl.style.top = Math.round(y) + "px";
    }

    function showTip(el, cx, cy) {
      const text = el.getAttribute("data-tip");
      if (!text) return;
      const title = el.getAttribute("data-tip-title");
      activeTrigger = el;
      el.classList.add("active");
      tipEl.innerHTML =
        (title ? `<span class="tip-title">${escAttr(title)}</span>` : "") +
        escAttr(text).replace(/\\n/g, "\n");
      tipEl.classList.add("show");
      positionTooltip(cx, cy, el);
    }

    function hideTip() {
      if (activeTrigger) activeTrigger.classList.remove("active");
      activeTrigger = null;
      tipEl.classList.remove("show");
    }
    window._hideGlobalTooltip = hideTip;

    document.addEventListener("mouseover", (e) => {
      const el = e.target && e.target.closest ? e.target.closest(".info-tip[data-tip]") : null;
      if (el) showTip(el, e.clientX, e.clientY);
    });

    document.addEventListener("mousemove", (e) => {
      if (activeTrigger && tipEl.classList.contains("show")) {
        positionTooltip(e.clientX, e.clientY, activeTrigger);
      }
    });

    document.addEventListener("mouseout", (e) => {
      const el = e.target && e.target.closest ? e.target.closest(".info-tip[data-tip]") : null;
      if (el && el === activeTrigger) {
        hideTip();
      }
    });

    document.addEventListener("click", (e) => {
      const el = e.target && e.target.closest ? e.target.closest(".info-tip[data-tip]") : null;
      if (el) {
        e.stopPropagation();
        if (activeTrigger === el && tipEl.classList.contains("show")) {
          hideTip();
        } else {
          showTip(el, e.clientX, e.clientY);
        }
      } else if (activeTrigger) {
        hideTip();
      }
    });
  }

  function updateVoiceUi(isPlaying) {
    const vBtn = document.getElementById("gal-voice-btn");
    const vLabel = document.getElementById("gal-voice-label");
    const hudBtn = document.getElementById("hud-voice-btn");
    if (hudBtn) {
      hudBtn.textContent = state.voiceMuted ? "🔇 静音" : "🔊 配音";
    }
    if (!vBtn || !vLabel) return;
    if (!state.currentVoiceUrl) {
      vBtn.style.display = "none";
      return;
    }
    vBtn.style.display = "inline-flex";
    if (state.voiceMuted) {
      vBtn.classList.remove("playing");
      vLabel.textContent = "已静音";
    } else if (isPlaying) {
      vBtn.classList.add("playing");
      vLabel.textContent = "配音中";
    } else {
      vBtn.classList.remove("playing");
      vLabel.textContent = "重播";
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
    initTooltipSystem();
    if (window.CAFE_SIM_3D) {
      window.CAFE_SIM_3D.init(".stage-wrap");
    }
    if (window.LIVE2D_STAGE) {
      window.LIVE2D_STAGE.init(".stage-wrap", voicePlayer);
    }
    applyStageView("l2d");
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
      applyStageView("l2d");
      playStory("prologue_story");
      renderAll();
    } else if (modeType === "tutorial") {
      state.mode = "game";
      state.dayIdx = 0;
      state.phase = "roster";
      state.tutorialStep = 1;
      state.sideTab = "ops";
      playStory("opening_day");
      applyStageView("3d");
      renderAll();
    } else {
      // sandbox
      state.mode = "game";
      state.dayIdx = 0;
      state.phase = "roster";
      state.tutorialStep = 0;
      state.sideTab = "ops";
      playStory("opening_day");
      applyStageView("3d");
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
    applyStageView("3d");
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
    if (window.LIVE2D_STAGE) window.LIVE2D_STAGE.setScene(bgKey);

    // Only show full-screen CG if the current line explicitly specifies ln.cg (or if the story has st.cg and the line has no sprites)
    const cgKey = ln.cg || (!ln.sprites && st.cg) || null;
    if (cgKey && D.cgs[cgKey]) {
      cgEl.src = D.cgs[cgKey];
      cgEl.classList.add("show");
      // Automatically reveal dramatic full-screen CGs (can still toggle back anytime)
      if (state.stageView === "3d") applyStageView("l2d");
    } else {
      cgEl.classList.remove("show");
    }

    locTitle.textContent = st.loc || "1F · 404 女仆喫茶";
    locSub.textContent = st.sub || curDay().weekLabel;

    // Render Live2D rigged models (plus DOM fallback if WebGL disabled)
    const spWrap = document.getElementById("sprite-layer");
    spWrap.innerHTML = "";
    const l2dList = [];
    if (!cgKey && ln.sprites && ln.sprites.length) {
      ln.sprites.forEach((token, idx) => {
        const [cid, mood] = token.split(":");
        const ch = D.characters[cid];
        if (!ch) return;
        const src = (ch.sprites && ch.sprites[mood]) || ch.sprites.normal;
        l2dList.push({ cid, mood: mood || "normal", src });
        if (!window.LIVE2D_STAGE || !window.LIVE2D_STAGE.enabled) {
          const img = document.createElement("img");
          img.className = "sprite-item";
          if (typeof ln.speaking === "number") {
            img.classList.add(ln.speaking === idx ? "speaking" : "dim");
          }
          img.src = src;
          spWrap.appendChild(img);
        }
      });
    }
    if (window.LIVE2D_STAGE && window.LIVE2D_STAGE.enabled) {
      window.LIVE2D_STAGE.setCharacters(l2dList, ln.speaking, !!cgKey);
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
      nextHintEl.textContent = "▲ 请选择回应";
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
      nextHintEl.textContent = "▲ 点击开启首日试营业";
      const btn = document.createElement("button");
      btn.className = "gal-choice-btn";
      btn.textContent = "▶ 签下对赌协议 · 开启首日试营业";
      btn.onclick = function (ev) {
        ev.stopPropagation();
        window.finishPrologueToTutorial();
      };
      choicesEl.appendChild(btn);
    } else {
      nextHintEl.textContent =
        state.lineIdx < st.lines.length - 1
          ? "▼ 点击继续"
          : state.mode === "prologue"
          ? "▼ 点击进入教学"
          : "▶ 请在右侧操作";
    }

    const prog = document.getElementById("gal-progress");
    prog.textContent = `${state.lineIdx + 1} / ${st.lines.length}`;
  }

  window.onStageClick = function (ev) {
    if (window.LIVE2D_STAGE && ev) {
      window.LIVE2D_STAGE.triggerTapBounce(ev.clientX, ev.clientY);
    }
    window.advanceDialogue();
  };

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
    if (window.CAFE_SIM_3D) window.CAFE_SIM_3D.syncWithGameState(state, D);
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
    const day = curDay();
    const isMajorCgDay = ["typhoon_kohaku", "break_badge", "reine_rebel", "new_year_finale"].includes(day.specialId);
    applyStageView(isMajorCgDay ? "l2d" : "3d");
    renderAll();
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
        loc: "1F · 考勤完毕 · 进入①训练",
        sub: restedNames.length ? `${restedNames.join("、")} 休假（状态已清零）` : "全员满状态出勤",
        lines: [
          {
            speaker: "陆沉（店长）",
            sprites: ["luchen:normal", "kohaku:normal"],
            speaking: 0,
            voice: restedNames.length
              ? "game_assets/voices/sys_roster_rest.mp3"
              : "game_assets/voices/sys_roster_all.mp3",
            text: restedNames.length
              ? `【${restedNames.join("、")}】今日休假，疲劳与压力已清零！请在右侧选择上午训练方案。`
              : "今日全员出勤！请在右侧选择上午训练方案。"
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

    const executedPhase = state.phase;
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
      applyStageView("3d");
      if (window.CAFE_SIM_3D) window.CAFE_SIM_3D.syncWithGameState({ ...state, phase: "morning" }, D, optId);
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
      applyStageView("3d");
      if (window.CAFE_SIM_3D) window.CAFE_SIM_3D.syncWithGameState({ ...state, phase: "afternoon" }, D, optId);
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
      applyStageView("3d");
      if (window.CAFE_SIM_3D) window.CAFE_SIM_3D.syncWithGameState({ ...state, phase: "evening" }, D, optId);
      if (opt.storyKey && S[opt.storyKey]) {
        playStory(opt.storyKey);
      } else {
        playStory(null, {
          bg: "liveB1",
          loc: "B1 · 演出落幕",
          sub: `票房 +¥${earned} · 进入④夜生活`,
          lines: [
            {
              speaker: "白石零音",
              sprites: ["reine:normal", "mahiru:normal"],
              speaking: 0,
              voice: "game_assets/voices/sys_evening_done.mp3",
              text: `今晚票房入账 ¥${earned}！已到 21:30 打烊时间，请在右侧选择社媒宣发或留店剧情。`
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
      applyStageView("l2d"); // Switch back to intimate Live2D / CG stage for late-night story & WeChat!
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
    applyStageView("l2d");
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
    applyStageView("3d");
    renderAll();
    const d = curDay();
    playStory(null, {
      bg: "cafe1f",
      loc: d.weekLabel + " · " + d.title,
      sub: d.shortHint || d.specialHint,
      lines: [
        {
          speaker: "陈琥珀",
          sprites: ["kohaku:normal", "luchen:normal"],
          speaking: 0,
          voice: "game_assets/voices/sys_new_day.mp3",
          text: `“早安老板！今天是 ${d.weekLabel}（${d.shortHint || d.title}），先在右侧排班吧！”`
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
    applyStageView("l2d");
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
          <span class="tutorial-head-left">
            <span class="tutorial-badge">${t.step}</span>
            ${infoTip(t.step, t.detail || t.body || "")}
          </span>
          <button class="tutorial-skip" onclick="skipTutorial()">跳过 ✕</button>
        </div>
        <b>${t.title}</b>
      </div>`;
  }

  function renderAll() {
    if (window._hideGlobalTooltip) window._hideGlobalTooltip();
    const d = curDay();
    document.getElementById("hud-day").textContent =
      state.mode === "prologue" ? "序章 · 10/06" : d.weekLabel;
    document.getElementById("hud-money").textContent = "¥" + state.money.toLocaleString();
    document.getElementById("hud-rent").textContent = "¥" + d.rentGoal.toLocaleString();
    document.getElementById("hud-fans").textContent = state.fans.toLocaleString();

    const phases = [
      { id: "roster", label: "0.排班" },
      { id: "morning", label: "①训练" },
      { id: "afternoon", label: "②午市" },
      { id: "evening", label: "③演出" },
      { id: "night", label: "④夜生活" }
    ];
    const pOrder = phases.map((p) => p.id);
    const curIdx = state.mode === "prologue" ? -1 : pOrder.indexOf(state.phase);
    document.getElementById("hud-phases").innerHTML =
      state.mode === "prologue"
        ? `<span class="phase-pill active">🎬 序章剧情中</span>`
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
              <span class="char-name-row">
                <b>${c.name}</b>
                ${infoTip(c.name + " · 档案", c.styleDesc || "")}
              </span>
              <span class="skill-pill"><em>${c.tag}</em></span>
            </div>
          </div>
        </div>`;
      })
      .join("");

    body.innerHTML = `
      <div class="tutorial-banner">
        <div class="tutorial-head">
          <span class="tutorial-head-left">
            <span class="tutorial-badge">序章剧情</span>
            ${infoTip("序章说明", "点击左侧画面推进雨夜接手 404 喫茶的开篇剧情，下方将随出场逐一解锁人物档案；读完自动进入首日 6 步经营教学。")}
          </span>
          <button class="tutorial-skip" onclick="finishPrologueToTutorial()">跳过序章 ▶</button>
        </div>
        <b>点击左侧推进剧情，逐一解锁店员档案</b>
      </div>
      <div class="section-head">📂 人物档案 (${state.unlockedDossiers.length} / 5) ${infoTip("人物档案", "鼠标悬停各角色名字旁的感叹号可查看详细背景设定。")}</div>
      ${cardsHtml}
      <button class="op-btn special" style="text-align:center;margin-top:auto" onclick="finishPrologueToTutorial()">
        <b>⚡ 跳过序章 · 直接进入首日教学</b>
      </button>`;
  }

  function renderChips(chips) {
    if (!chips || !chips.length) return "";
    return `<div class="op-chips">${chips
      .map((c) => `<span class="chip ${c.tone || ""}">${c.text}</span>`)
      .join("")}</div>`;
  }

  function renderOpsTab(body, d) {
    const tutBanner = renderTutorialBanner();

    const charHtml = ["mahiru", "reine", "kohaku", "millie"]
      .map((cid) => {
        const c = D.characters[cid];
        const highStress = c.stress >= 60 || c.fatigue >= 60;
        const highlightCard = state.tutorialStep === 1 && cid === "mahiru" ? "tut-highlight" : "";
        const shortRole = (c.tag.split("·")[1] || c.tag).trim();
        const charDetail = `${c.styleDesc}\n\n• 美食 ${c.food} ｜ 饭撒 ${c.charm}\n• 唱跳 ${c.stage} ｜ 社媒 ${c.social}\n• 羁绊 ${c.bond}%（休假可当日一键清零疲劳与压力）`;
        return `
        <div class="char-card ${!c.onDuty ? "resting" : highStress ? "warn" : ""} ${highlightCard}">
          <img class="char-avatar" src="${c.avatar}" alt="${c.name}">
          <div class="char-meta">
            <div class="char-top">
              <span class="char-name-row">
                <b>${c.name}</b>
                <span class="char-role">${shortRole}</span>
                ${infoTip(c.name + " · " + shortRole, charDetail)}
              </span>
              <button class="duty-btn ${c.onDuty ? "work" : "rest"}" onclick="toggleDuty('${cid}')">
                ${c.onDuty ? "出勤" : "★休假"}
              </button>
            </div>
            <div class="bars-row">
              <div class="mini-bar">
                🔵 疲劳 ${c.fatigue}%
                <div class="track"><div class="fill" style="width:${c.fatigue}%;background:#70b5ff"></div></div>
              </div>
              <div class="mini-bar">
                🌸 压力 ${c.stress}%
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
      const rosterTip = "每天早会可自由切换任意妹妹为【★休假】，休假者当天体力疲劳与精神压力直接 100% 清零！\n\n提示：真昼当前压力较高，可先放假或带她出勤并在晚间留店安慰。";
      actionBox = `
        <div class="op-box">
          <div class="op-title">
            <span class="op-title-left">0. 今日排班 ${infoTip("反 007 排班说明", rosterTip)}</span>
            <span class="chip green">休假双清零</span>
          </div>
          <div class="day-event-bar">
            <span>${d.shortHint || d.title}</span>
            ${infoTip(d.weekLabel + " · 今日日程", d.specialHint)}
          </div>
          <button id="btn-confirm-roster" class="op-btn special ${btnHighlight}" style="width:100%;text-align:center" onclick="confirmRoster()">
            <b>▶ 确认出勤名单 · 开始营业</b>
          </button>
        </div>`;
    } else {
      const opts = (D.periodOptions[state.phase] || []).filter(
        (o) => !o.specialFor || o.specialFor === d.specialId
      );
      const phaseMeta = {
        morning: {
          title: "① 上午训练 (10:00)",
          tip: "闭店备场时段：快速提升全队四维技能，触发双人师徒搭档小剧场与专属 CG。"
        },
        afternoon: {
          title: "② 下午营业 (14:00)",
          tip: "午市赚钱主力：1F 点餐吃美食力（稳赚不涨压力），2F 拍切吃饭撒力（暴利但涨精神压力）。"
        },
        evening: {
          title: "③ 晚上演出 (19:00)",
          tip: "B1 地下舞台：按唱跳力结算票房与粉丝，全员燃曲 Live 还能宣泄白天压力！"
        },
        night: {
          title: "④ 夜生活 (22:00)",
          tip: "发社媒为明日加成 +35%~45% 收益；点选金色 ★ 留店剧情可彻底清零妹妹压力并看全屏 CG！"
        }
      };
      const meta = phaseMeta[state.phase] || { title: "经营决策", tip: "" };
      const listHighlight = state.tutorialStep >= 2 && state.tutorialStep <= 5 ? "tut-highlight" : "";
      actionBox = `
        <div class="op-box ${listHighlight}">
          <div class="op-title">
            <span class="op-title-left">${meta.title} ${infoTip(meta.title, meta.tip)}</span>
            ${state.nextBuff > 1 ? `<span class="chip gold">客流 ×${state.nextBuff.toFixed(2)}</span>` : ""}
          </div>
          <div class="op-list">
            ${opts
              .map(
                (o) => `
              <button class="op-btn ${o.name.includes("★") ? "special" : ""}" onclick="runOption('${o.id}')">
                <div class="op-btn-row">
                  <b>${o.name}</b>
                  ${infoTip(o.name, o.desc)}
                </div>
                ${renderChips(o.chips)}
              </button>`
              )
              .join("")}
          </div>
        </div>`;
    }

    const staffTip = "点击右上角【出勤 / ★休假】仅在 Step 0 排班阶段可切换。\n• 🔵 疲劳：干活与唱跳累积\n• 🌸 压力：2F 拍切假笑营业累积\n• 四维技能决定对应时段收益与演出评分";
    body.innerHTML =
      tutBanner +
      actionBox +
      `<div class="section-head">店员状态 ${infoTip("店员面板说明", staffTip)}</div>` +
      charHtml;
  }

  function renderPhoneTab(body) {
    const tutBanner = renderTutorialBanner();
    const wxHighlight = state.tutorialStep === 6 && !state.wxReplied ? "tut-highlight" : "";
    const sleepHighlight = state.tutorialStep === 6 && state.wxReplied ? "tut-highlight" : "";

    body.innerHTML = `
      ${tutBanner}
      <div class="phone-card">
        <div class="op-title">
          <span class="op-title-left">📱 小红书 · 夜间动态 ${infoTip("小红书动态", "妹妹们下班后发布的营业笔记与暗戳戳的日常切片。")}</span>
        </div>
        <div class="red-post">
          <img src="game_assets/cg_mahiru_rainy_night.jpg" alt="小红书配图">
          <div class="red-body">
            <b style="color:#ff8fb0">@林真昼_Mahiru</b> · 00:18<br>
            今天拍切排到楼梯口啦，手腕画酸了~（角落不小心拍到店长热的草莓奶）<br>
            <span style="color:#867a99">#地雷系 #404女仆喫茶</span>
          </div>
        </div>
      </div>

      <div id="wx-reply-box" class="phone-card ${wxHighlight}">
        <div class="op-title">
          <span class="op-title-left">💬 微信私聊 ${infoTip("微信秒撤回减压", "白天攒了压力的妹妹半夜会发疯又秒撤回。选懂她电波的回复可立消 -35% 精神压力并大幅提升羁绊！")}</span>
          <span class="chip green">回复减压 -35%</span>
        </div>
        <div class="wx-bubble recall">“真昼🍓” 撤回了一条消息 (01:15)</div>
        <div class="wx-bubble"><b>真昼🍓：</b>刚才有客人说我画的歪嘴猫不如隔壁圆……明天拍切换别人吧。</div>
        <div class="op-list" style="margin-top:8px">
          <button class="op-btn special" onclick="replyWeChat('mahiru', 35, '他眼神不好。你画的那张歪嘴猫我刚拿相框裱起来挂收银台正中间了，本店镇店非卖品。', '“……你有病吧挂那个干嘛！丑死了，明天早上我去换张画得更好看的挂上去！睡觉了不理你了！”（真昼精神压力 -35%）')">
            <div class="op-btn-row">
              <b>▶ 回复真昼：把歪嘴猫裱起来</b>
              ${infoTip("回复内容预览", "“他眼神不好。你画的那张歪嘴猫我刚拿相框裱起来挂收银台正中间了，本店镇店非卖品。”")}
            </div>
            <div class="op-chips"><span class="chip green">真昼压力 -35%</span><span class="chip pink">羁绊 +10</span></div>
          </button>
          <button class="op-btn" onclick="replyWeChat('reine', 35, '大晚上别戴着500度近视眼镜摸黑找糖罐。在出租屋等着，我刚煮了热可可挂你门把手上。', '“……谁让你送了。少放半勺糖，到了敲两下门就行，我没化妆不开门。”（零音精神压力 -35%）')">
            <div class="op-btn-row">
              <b>▶ 回复零音：深夜送热可可</b>
              ${infoTip("回复内容预览", "“大晚上别戴着500度近视眼镜摸黑找糖罐。在出租屋等着，我刚煮了热可可挂你门把手上。”")}
            </div>
            <div class="op-chips"><span class="chip green">零音压力 -35%</span><span class="chip pink">羁绊 +10</span></div>
          </button>
        </div>
      </div>

      <button class="op-btn special ${sleepHighlight}" style="text-align:center;padding:11px" onclick="nextDay()">
        <b>🌙 关灯睡觉 · 进入次日 ${state.tutorialStep === 6 ? "（完成教学）" : ""}</b>
      </button>`;
  }

  function renderChaptersTab(body) {
    const chList = D.calendar
      .map(
        (c, idx) => `
        <button class="op-btn ${idx === state.dayIdx && state.mode === "game" ? "special" : ""}" onclick="jumpToDay(${idx})">
          <div class="op-btn-row">
            <b>${c.weekLabel} · ${c.title}</b>
            ${infoTip(c.title, c.specialHint)}
          </div>
        </button>`
      )
      .join("");

    body.innerHTML = `
      <div class="op-box">
        <div class="op-title"><span class="op-title-left">🎬 序章与教学</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button class="op-btn special" onclick="startGameMode('prologue')">
            <div class="op-btn-row"><b>▶ 重播序章</b>${infoTip("序章剧情", "重温陆沉大厂裸辞、雨夜接店与初遇四位亚比妹妹的完整开篇。")}</div>
          </button>
          <button class="op-btn" onclick="startGameMode('tutorial')">
            <div class="op-btn-row"><b>📘 首日教学</b>${infoTip("首日教学", "从第 1 天重新开启 6 步互动经营引导。")}</div>
          </button>
        </div>
      </div>
      <div class="op-box">
        <div class="op-title">
          <span class="op-title-left">🌸 跨年露台 True End ${infoTip("单人结局直达", "直接体验跨年千人 Live 结束后，3F 露台烟花下的四女主单人 True End 告白剧情。")}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button class="op-btn special" onclick="triggerTrueEnd('mahiru')"><div class="op-btn-row"><b>真昼 End</b>${infoTip("林真昼 True End", "《备用钥匙与 99 分》：深夜烟花下交出 404 的猫咪黄铜钥匙。")}</div></button>
          <button class="op-btn special" onclick="triggerTrueEnd('reine')"><div class="op-btn-row"><b>零音 End</b>${infoTip("白石零音 True End", "《第 0 号真话》：摘下舞台面具后，写给第 0 号观众的歌。")}</div></button>
          <button class="op-btn special" onclick="triggerTrueEnd('kohaku')"><div class="op-btn-row"><b>琥珀 End</b>${infoTip("陈琥珀 True End", "《专属砂糖橘》：终于肯靠在别人肩上喊累的大姐头。")}</div></button>
          <button class="op-btn special" onclick="triggerTrueEnd('millie')"><div class="op-btn-row"><b>千禧 End</b>${infoTip("苏千禧 True End", "《永久存档点》：走出吧台隐私帘，把现实设为永不回档的主线。")}</div></button>
        </div>
      </div>
      <div class="op-box">
        <div class="op-title">
          <span class="op-title-left">📅 五幕主线日程直达 ${infoTip("日程跳转", "点击任意关键日程直接跳转，悬停右侧感叹号可预览该日高潮剧情与限定企划。")}</span>
        </div>
        <div class="op-list">${chList}</div>
      </div>`;
  }

  window.switchSideTab = function (tab) {
    state.sideTab = tab;
    renderAll();
  };

  window.addEventListener("DOMContentLoaded", init);
})();
