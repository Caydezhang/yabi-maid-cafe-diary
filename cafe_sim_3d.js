/**
 * 《拯救亚比妹妹——仆咖经营日记》高精 HD-2D 3D 箱庭引擎 v3
 * - 拟真骨骼蒙皮 2.5D 角色系统：独立左右腿交替迈步/抬脚屈膝、自然步态重心起伏、双臂反向摆动、头部独立稳像与张望、平滑3D转身
 * - 程序化精雕胡桃木吧台、霓虹拱窗夜景、天鹅绒卡座、2F拍切爱心霓虹布景、B1架子鼓音箱阵与频谱LED大屏
 */
(function () {
  const STAFF_DEFS = [
    { id: "luchen", tex: "chibi_luchen", name: "陆沉 · 店长", color: "#70b5ff", h: 1.95, quote: "☕ 手冲刚闷蒸好，慢用" },
    { id: "mahiru", tex: "chibi_mahiru", name: "真昼 · 拍切销冠", color: "#ff5f91", h: 1.92, quote: "📸 要画歪嘴猫签名吗♪" },
    { id: "reine",  tex: "chibi_reine",  name: "零音 · 主唱", color: "#ab75ff", h: 1.95, quote: "🎸 调音中，别离音箱太近" },
    { id: "kohaku", tex: "chibi_kohaku", name: "琥珀 · 主厨", color: "#e9c76d", h: 1.92, quote: "🍳 蛋包饭刚出锅！闪开~" },
    { id: "millie", tex: "chibi_millie", name: "千禧 · 黑客", color: "#7fe0a3", h: 1.82, quote: "🎮 别看我…社媒数据涨了！" }
  ];

  const GUEST_ARCHETYPES = [
    { tex: "chibi_guest_jirai",   tag: "地雷系同好", color: "#ff8fb0", quote: "💖 真昼今天的双马尾超可爱！" },
    { tex: "chibi_guest_wota",    tag: "地偶死忠粉", color: "#c9a0f5", quote: "🔥 等晚场零音开唱！" },
    { tex: "chibi_guest_vlogger", tag: "探店Up主",   color: "#ffe7a8", quote: "🎥 这家后巷女仆店超有氛围！" },
    { tex: "chibi_guest_office",  tag: "下班白领",   color: "#7fe0a3", quote: "🍓 下班喝杯草莓奶续命~" }
  ];

  // Pixel-calibrated 3-layer anatomical rig profiles per chibi sprite (u: left->right 0..1, v: feet->head 0..1)
  const RIG_PROFILES = {
    chibi_luchen:        { splitU: 0.530, legMinU: 0.21, legMaxU: 0.78, hipV: 0.27, neckV: 0.64, strideAmp: 0.28, armAmp: 0.11, hairSway: 0.6 },
    chibi_mahiru:        { splitU: 0.457, legMinU: 0.33, legMaxU: 0.61, hipV: 0.25, neckV: 0.60, strideAmp: 0.30, armAmp: 0.08, hairSway: 1.35 },
    chibi_reine:         { splitU: 0.440, legMinU: 0.18, legMaxU: 0.76, hipV: 0.30, neckV: 0.64, strideAmp: 0.28, armAmp: 0.07, hairSway: 1.2 },
    chibi_kohaku:        { splitU: 0.540, legMinU: 0.31, legMaxU: 0.79, hipV: 0.29, neckV: 0.60, strideAmp: 0.30, armAmp: 0.09, hairSway: 1.0 },
    chibi_millie:        { splitU: 0.486, legMinU: 0.18, legMaxU: 0.77, hipV: 0.27, neckV: 0.63, strideAmp: 0.27, armAmp: 0.07, hairSway: 0.9 },
    chibi_guest_jirai:   { splitU: 0.510, legMinU: 0.34, legMaxU: 0.73, hipV: 0.28, neckV: 0.61, strideAmp: 0.30, armAmp: 0.13, hairSway: 1.15 },
    chibi_guest_wota:    { splitU: 0.475, legMinU: 0.25, legMaxU: 0.72, hipV: 0.28, neckV: 0.63, strideAmp: 0.30, armAmp: 0.16, hairSway: 1.0 },
    chibi_guest_vlogger: { splitU: 0.509, legMinU: 0.17, legMaxU: 0.84, hipV: 0.32, neckV: 0.62, strideAmp: 0.28, armAmp: 0.11, hairSway: 0.9 },
    chibi_guest_office:  { splitU: 0.480, legMinU: 0.16, legMaxU: 0.78, hipV: 0.30, neckV: 0.63, strideAmp: 0.29, armAmp: 0.12, hairSway: 0.85 }
  };

  // Walkable obstacle circles so staff & guests naturally curve around cafe tables
  const WALK_OBSTACLES = [
    { x: -4.4, z: 1.35, r: 1.12 },
    { x: -1.3, z: 1.45, r: 1.12 },
    { x: -2.8, z: 3.65, r: 1.12 },
    { x:  2.45, z: 0.35, r: 0.85 }
  ];

  function clamp01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  }
  function smoothstep(edge0, edge1, x) {
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  const SPOTS = {
    door:       { x: -6.8, y: 0, z: 4.5 },
    barIn:      { x: -3.5, y: 0, z: -3.15 },
    barFront:   { x: -3.2, y: 0, z: -1.35 },
    nook:       { x: -6.0, y: 0, z: -3.0 },
    tables:     [ { x: -4.4, y: 0, z: 1.35 }, { x: -1.3, y: 0, z: 1.45 }, { x: -2.8, y: 0, z: 3.65 } ],
    chekiMaid:  { x: 2.35, y: 0.36, z: -2.95 },
    chekiGuest: { x: 2.35, y: 0.36, z: -1.45 },
    stageMid:   { x: 4.25, y: 0.42, z: 1.15 },
    stageL:     { x: 2.85, y: 0.42, z: 1.25 },
    stageR:     { x: 5.55, y: 0.42, z: 1.25 },
    djBooth:    { x: 4.25, y: 0.42, z: 0.15 },
    crowd:      [ { x: 2.5, y: 0, z: 3.4 }, { x: 3.9, y: 0, z: 3.9 }, { x: 5.4, y: 0, z: 3.45 }, { x: 3.2, y: 0, z: 4.65 }, { x: 4.8, y: 0, z: 4.6 } ]
  };

  class CafeSim3D {
    constructor() {
      this.container = null;
      this.popupLayer = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.visible = false;
      this.texCache = new Map();
      this.rigTexCache = new Map();

      this.yaw = 0.56;
      this.pitch = 0.54;
      this.dist = 16.2;
      this.dragging = false;
      this.lastMouse = { x: 0, y: 0 };

      this.staff = new Map();
      this.guests = [];
      this.fairyBulbs = [];
      this.spotCones = [];
      this.flashTimer = 0;
      this.spawnTimer = 0.5;
      this.currentFocus = "afternoon";
      this.lastOptId = "";
      this.clock = 0;
      this.lastTs = performance.now();
    }

    init(stageSelector) {
      if (!window.THREE) return false;
      const stage = document.querySelector(stageSelector);
      if (!stage) return false;

      this.container = document.createElement("div");
      this.container.id = "sim3d-wrap";
      this.container.className = "sim3d-wrap";
      this.container.innerHTML = `
        <div class="sim3d-hud">
          <span class="sim3d-pill">
            <i class="sim3d-live-dot"></i>
            <b id="sim3d-mode-label">3D 实时实况</b>
            <span class="info-tip" onclick="event.stopPropagation()" data-tip-title="3D 箱庭操作" data-tip="• 鼠标左键拖拽：旋转视角\n• 滚轮缩放：推拉特写\n• 点击店员小人：触发冒泡互动\n• 右侧切换休假：小人实时上下班">!</span>
          </span>
        </div>
        <div id="sim3d-popups" class="sim3d-popups"></div>
      `;
      stage.insertBefore(this.container, stage.querySelector(".gal-box"));
      this.popupLayer = this.container.querySelector("#sim3d-popups");

      const T = window.THREE;
      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x120d1d);
      this.scene.fog = new T.FogExp2(0x120d1d, 0.016);

      this.camera = new T.PerspectiveCamera(36, 16 / 9, 0.1, 100);
      this.renderer = new T.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = T.PCFSoftShadowMap;
      if ("outputEncoding" in this.renderer && T.sRGBEncoding) {
        this.renderer.outputEncoding = T.sRGBEncoding;
      }
      if ("ACESFilmicToneMapping" in T) {
        this.renderer.toneMapping = T.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.96;
      }
      this.container.insertBefore(this.renderer.domElement, this.container.firstChild);

      this._buildLights();
      this._buildProceduralTextures();
      this._buildArchitectureAndProps();
      this._buildStaffActors();
      this._bindControls();
      this.resize();

      for (let i = 0; i < 5; i++) this._spawnGuest(true);
      requestAnimationFrame((ts) => this._animate(ts));
      return true;
    }

    _loadAssetTex(key) {
      if (this.texCache.has(key)) return this.texCache.get(key);
      const T = window.THREE;
      const assets = window.CHIBI_3D_ASSETS || {};
      const item = assets[key];
      const tex = new T.Texture();
      if (item && item.uri) {
        const img = new Image();
        img.onload = () => {
          tex.image = img;
          if ("encoding" in tex && T.sRGBEncoding) tex.encoding = T.sRGBEncoding;
          tex.needsUpdate = true;
        };
        img.src = item.uri;
      }
      this.texCache.set(key, { tex, aspect: item ? item.w / item.h : 0.65 });
      return this.texCache.get(key);
    }

    _loadRigPartTextures(key, rig) {
      if (this.rigTexCache.has(key)) return this.rigTexCache.get(key);
      const T = window.THREE;
      const assets = window.CHIBI_3D_ASSETS || {};
      const item = assets[key];
      const aspect = item ? item.w / item.h : 0.65;
      const hipOverlap = 0.045;

      const makeTex = () => {
        const c = document.createElement("canvas");
        c.width = 4; c.height = 4;
        const tx = new T.CanvasTexture(c);
        if ("encoding" in tx && T.sRGBEncoding) tx.encoding = T.sRGBEncoding;
        return tx;
      };

      const bundle = {
        upperTex: makeTex(),
        legLTex: makeTex(),
        legRTex: makeTex(),
        aspect,
        hipOverlap
      };

      if (item && item.uri) {
        const img = new Image();
        img.onload = () => {
          const iw = img.naturalWidth || item.w;
          const ih = img.naturalHeight || item.h;

          // 1. Upper body + skirt/coat hem + outer twintails/straps (clears ONLY the central leg box)
          const uCvs = document.createElement("canvas");
          uCvs.width = iw; uCvs.height = ih;
          const uCtx = uCvs.getContext("2d");
          uCtx.drawImage(img, 0, 0, iw, ih);
          const lxPx = Math.floor(rig.legMinU * iw);
          const rxPx = Math.ceil(rig.legMaxU * iw);
          const hipTopY = Math.round((1 - rig.hipV) * ih);
          uCtx.clearRect(lxPx, hipTopY, Math.max(1, rxPx - lxPx), ih - hipTopY);
          bundle.upperTex.image = uCvs;
          bundle.upperTex.needsUpdate = true;

          // 2. Left Leg sub-sprite (cleanly cropped at splitU with +4.5% upper thigh tuck behind skirt)
          const splitPx = Math.round(rig.splitU * iw);
          const legTopY = Math.max(0, Math.round((1 - (rig.hipV + hipOverlap)) * ih));
          const legH = Math.max(2, ih - legTopY);

          const lW = Math.max(2, splitPx - lxPx);
          const lCvs = document.createElement("canvas");
          lCvs.width = lW; lCvs.height = legH;
          lCvs.getContext("2d").drawImage(img, lxPx, legTopY, lW, legH, 0, 0, lW, legH);
          bundle.legLTex.image = lCvs;
          bundle.legLTex.needsUpdate = true;

          // 3. Right Leg sub-sprite (zero shared vertices with left leg!)
          const rW = Math.max(2, rxPx - splitPx);
          const rCvs = document.createElement("canvas");
          rCvs.width = rW; rCvs.height = legH;
          rCvs.getContext("2d").drawImage(img, splitPx, legTopY, rW, legH, 0, 0, rW, legH);
          bundle.legRTex.image = rCvs;
          bundle.legRTex.needsUpdate = true;
        };
        img.src = item.uri;
      }

      this.rigTexCache.set(key, bundle);
      return bundle;
    }

    _buildProceduralTextures() {
      const T = window.THREE;
      // Rich café wood parquet + gothic tile floor texture
      const flCvs = document.createElement("canvas");
      flCvs.width = 512; flCvs.height = 512;
      const fctx = flCvs.getContext("2d");
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const even = (r + c) % 2 === 0;
          fctx.fillStyle = even ? "#2d2240" : "#211830";
          fctx.fillRect(c * 64, r * 64, 64, 64);
          fctx.strokeStyle = "rgba(255, 130, 190, 0.08)";
          fctx.lineWidth = 2;
          fctx.strokeRect(c * 64 + 2, r * 64 + 2, 60, 60);
        }
      }
      this.floorTex = new T.CanvasTexture(flCvs);
      this.floorTex.wrapS = this.floorTex.wrapT = T.RepeatWrapping;
      this.floorTex.repeat.set(3.5, 2.6);

      // Wallpaper wainscoting texture
      const wlCvs = document.createElement("canvas");
      wlCvs.width = 256; wlCvs.height = 256;
      const wctx = wlCvs.getContext("2d");
      const grad = wctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#241936");
      grad.addColorStop(0.62, "#1e152e");
      grad.addColorStop(0.64, "#6e4b5c");
      grad.addColorStop(0.67, "#2a1b2e");
      grad.addColorStop(1, "#1c1222");
      wctx.fillStyle = grad;
      wctx.fillRect(0, 0, 256, 256);
      wctx.fillStyle = "rgba(255, 95, 145, 0.045)";
      for (let x = 0; x < 256; x += 32) wctx.fillRect(x, 0, 12, 160);
      this.wallTex = new T.CanvasTexture(wlCvs);
      this.wallTex.wrapS = T.RepeatWrapping;
      this.wallTex.repeat.set(5, 1);
    }

    _buildLights() {
      const T = window.THREE;
      this.scene.add(new T.HemisphereLight(0xffe6f7, 0x261a38, 0.92));

      const sun = new T.DirectionalLight(0xfff4ea, 0.92);
      sun.position.set(-5, 14, 11);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -9;
      sun.shadow.camera.right = 9;
      sun.shadow.camera.top = 9;
      sun.shadow.camera.bottom = -9;
      this.scene.add(sun);

      const barWarm = new T.PointLight(0xffb469, 1.5, 11);
      barWarm.position.set(-3.5, 3.3, -2.2);
      this.scene.add(barWarm);

      this.chekiLight = new T.PointLight(0xff5ca8, 1.6, 9);
      this.chekiLight.position.set(2.35, 3.0, -2.4);
      this.scene.add(this.chekiLight);

      this.stageLightA = new T.PointLight(0xb266ff, 1.8, 12);
      this.stageLightA.position.set(3.2, 3.8, 1.4);
      this.stageLightB = new T.PointLight(0x4ddbff, 1.6, 12);
      this.stageLightB.position.set(5.4, 3.8, 1.8);
      this.scene.add(this.stageLightA, this.stageLightB);
    }

    _mesh(geo, matOpts, x, y, z) {
      const T = window.THREE;
      const m = new T.Mesh(geo, new T.MeshStandardMaterial(matOpts));
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.scene.add(m);
      return m;
    }

    _makeNeonSignTex(title, sub, borderCol) {
      const T = window.THREE;
      const c = document.createElement("canvas");
      c.width = 512; c.height = 192;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#1a1029";
      ctx.fillRect(0, 0, 512, 192);
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 8;
      ctx.strokeRect(12, 12, 488, 168);
      ctx.shadowColor = borderCol;
      ctx.shadowBlur = 22;
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 62px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, 256, 98);
      ctx.font = "bold 26px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = borderCol;
      ctx.fillText(sub, 256, 148);
      const t = new T.CanvasTexture(c);
      if ("encoding" in t && T.sRGBEncoding) t.encoding = T.sRGBEncoding;
      return t;
    }

    _buildArchitectureAndProps() {
      const T = window.THREE;

      // 1. Cutaway Diorama Slab & Walls
      this._mesh(new T.BoxGeometry(15.6, 0.36, 11.4), { color: 0x181124, roughness: 0.8 }, 0, -0.18, 0.4);
      const floorPlane = new T.Mesh(
        new T.PlaneGeometry(15.2, 11.0),
        new T.MeshStandardMaterial({ map: this.floorTex, roughness: 0.45, metalness: 0.08 })
      );
      floorPlane.rotation.x = -Math.PI / 2;
      floorPlane.position.set(0, 0.01, 0.4);
      floorPlane.receiveShadow = true;
      this.scene.add(floorPlane);

      // Back Wall + Left Wall with wainscoting & crown molding
      this._mesh(new T.BoxGeometry(15.6, 4.5, 0.28), { map: this.wallTex, roughness: 0.7 }, 0, 2.25, -5.0);
      this._mesh(new T.BoxGeometry(0.28, 4.5, 11.4), { map: this.wallTex, roughness: 0.7 }, -7.65, 2.25, 0.4);
      this._mesh(new T.BoxGeometry(15.7, 0.14, 0.38), { color: 0x5c3e58, roughness: 0.4 }, 0, 4.52, -5.0);
      this._mesh(new T.BoxGeometry(0.38, 0.14, 11.5), { color: 0x5c3e58, roughness: 0.4 }, -7.65, 4.52, 0.4);

      // Overhead Fairy-Light String across the cafe!
      for (let i = 0; i < 9; i++) {
        const bx = -6.6 + i * 1.65;
        const sag = Math.sin((i / 8) * Math.PI) * 0.45;
        const bulb = new T.Mesh(
          new T.SphereGeometry(0.09, 10, 10),
          new T.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffe099 : 0xff85b8 })
        );
        bulb.position.set(bx, 4.15 - sag, -4.65);
        this.scene.add(bulb);
        this.fairyBulbs.push(bulb);
      }

      // 2. Arched Rainy City Window (Back-Left) + Framed Anime Posters!
      const cityTex = this._loadAssetTex("window_city").tex;
      this._mesh(new T.BoxGeometry(2.7, 2.2, 0.12), { color: 0x3b2848 }, -3.6, 2.75, -4.84);
      const winGlass = new T.Mesh(
        new T.PlaneGeometry(2.45, 1.95),
        new T.MeshBasicMaterial({ map: cityTex })
      );
      winGlass.position.set(-3.6, 2.75, -4.77);
      this.scene.add(winGlass);

      // Framed Posters on Left & Back Walls
      const p1 = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), new T.MeshBasicMaterial({ map: this._loadAssetTex("poster_mahiru").tex }));
      p1.position.set(-1.3, 2.85, -4.82);
      const p2 = new T.Mesh(new T.PlaneGeometry(1.5, 0.9), new T.MeshBasicMaterial({ map: this._loadAssetTex("poster_duet").tex }));
      p2.rotation.y = Math.PI / 2;
      p2.position.set(-7.48, 2.75, -0.8);
      this.scene.add(p1, p2);

      // Entrance "404 MAID & LIVE" Glowing Neon Signboard + Welcome Rug
      const signTex = this._makeNeonSignTex("404 喫茶", "MAID CAFE & LIVE", "#ff5f91");
      const signBoard = new T.Mesh(new T.PlaneGeometry(2.2, 0.85), new T.MeshBasicMaterial({ map: signTex }));
      signBoard.rotation.y = Math.PI / 2;
      signBoard.position.set(-7.48, 3.05, 4.1);
      this.scene.add(signBoard);
      this._mesh(new T.BoxGeometry(1.5, 0.03, 1.9), { color: 0x992659, roughness: 0.9 }, -6.6, 0.02, 4.3);

      // 3. Detailed 1F Walnut Bar Counter + Brass Footrail + Barstools + Espresso + Strawberry Dispenser
      this._mesh(new T.BoxGeometry(4.6, 1.02, 0.88), { color: 0x422523, roughness: 0.5 }, -3.4, 0.51, -2.25);
      this._mesh(new T.BoxGeometry(4.85, 0.1, 1.08), { color: 0x6e3f37, roughness: 0.3 }, -3.4, 1.06, -2.25);
      this._mesh(new T.CylinderGeometry(0.03, 0.03, 4.6, 8), { color: 0xe6be6a, metalness: 0.8, roughness: 0.2 }, -3.4, 0.22, -1.72).rotation.z = Math.PI / 2;

      for (let i = 0; i < 3; i++) {
        const sx = -4.6 + i * 1.15;
        this._mesh(new T.CylinderGeometry(0.24, 0.24, 0.09, 16), { color: 0xc93872 }, sx, 0.72, -1.42);
        this._mesh(new T.CylinderGeometry(0.04, 0.06, 0.7, 10), { color: 0xd4af6a, metalness: 0.6 }, sx, 0.35, -1.42);
      }

      // Chrome Espresso Machine + Dessert Display Case + Glowing Strawberry Milk Dispenser
      this._mesh(new T.BoxGeometry(0.85, 0.65, 0.52), { color: 0xd8e0eb, metalness: 0.75, roughness: 0.2 }, -4.55, 1.42, -2.25);
      this._mesh(new T.BoxGeometry(1.05, 0.58, 0.56), { color: 0xfff0f6, transparent: true, opacity: 0.55 }, -3.3, 1.38, -2.25);
      this._mesh(new T.CylinderGeometry(0.2, 0.2, 0.22, 14), { color: 0xff5f91 }, -3.3, 1.28, -2.25); // Strawberry cake inside case!
      const milkJar = new T.Mesh(
        new T.CylinderGeometry(0.24, 0.24, 0.72, 18),
        new T.MeshStandardMaterial({ color: 0xff80b5, emissive: 0xff4791, emissiveIntensity: 0.65, transparent: true, opacity: 0.92 })
      );
      milkJar.position.set(-2.1, 1.46, -2.25);
      this.scene.add(milkJar);

      // Millie's Cyber Hacker Booth (Dual angled screens + RGB PC tower)
      this._mesh(new T.BoxGeometry(1.55, 0.82, 0.85), { color: 0x241d38 }, -6.25, 0.41, -3.55);
      this._mesh(new T.BoxGeometry(0.68, 0.46, 0.05), { color: 0x5ef2d6, emissive: 0x2cd4b8, emissiveIntensity: 0.8 }, -6.5, 1.12, -3.72).rotation.y = 0.2;
      this._mesh(new T.BoxGeometry(0.68, 0.46, 0.05), { color: 0xff6bb5, emissive: 0xff3b94, emissiveIntensity: 0.8 }, -5.82, 1.12, -3.72).rotation.y = -0.2;

      // 4. 1F Maid Cafe Frilly Round Tables + Velvet Chairs + Omurice & Parfaits
      SPOTS.tables.forEach((t) => {
        this._mesh(new T.CylinderGeometry(0.76, 0.82, 0.14, 24), { color: 0xf7edf4, roughness: 0.6 }, t.x, 0.76, t.z); // White lace cloth
        this._mesh(new T.CylinderGeometry(0.7, 0.7, 0.05, 24), { color: 0x5e3444, roughness: 0.4 }, t.x, 0.84, t.z);
        this._mesh(new T.CylinderGeometry(0.09, 0.26, 0.76, 12), { color: 0x2b2138 }, t.x, 0.38, t.z);
        // Two velvet chairs per table
        [-0.82, 0.82].forEach((ox) => {
          this._mesh(new T.CylinderGeometry(0.25, 0.22, 0.46, 14), { color: 0x8f2959 }, t.x + ox, 0.23, t.z);
          this._mesh(new T.BoxGeometry(0.12, 0.52, 0.42), { color: 0x8f2959 }, t.x + ox + (ox > 0 ? 0.18 : -0.18), 0.65, t.z);
        });
        // Omurice yellow dome + strawberry drink on table
        this._mesh(new T.SphereGeometry(0.18, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), { color: 0xffd24d }, t.x - 0.18, 0.87, t.z);
        this._mesh(new T.CylinderGeometry(0.09, 0.07, 0.26, 12), { color: 0xff7eb3, emissive: 0xff4791, emissiveIntensity: 0.35 }, t.x + 0.22, 0.99, t.z - 0.1);
      });

      // 5. 2F Elevated Cheki Polaroid Booth (Back-Right) with Ring-Light Tripod & Tufted Sofa
      this._mesh(new T.BoxGeometry(4.3, 0.36, 3.2), { color: 0x2e1d42 }, 2.35, 0.18, -3.15);
      this._mesh(new T.CircleGeometry(1.45, 24), { color: 0xff6ba8 }, 2.35, 0.37, -2.65).rotation.x = -Math.PI / 2;
      // Velvet Sofa
      this._mesh(new T.BoxGeometry(2.3, 0.48, 0.8), { color: 0xb8286c }, 2.35, 0.6, -3.85);
      this._mesh(new T.BoxGeometry(2.3, 1.05, 0.24), { color: 0x9c1e59 }, 2.35, 1.05, -4.18);
      // Glowing Neon Heart Sign on Back Wall
      const chekiSign = new T.Mesh(
        new T.PlaneGeometry(2.1, 0.82),
        new T.MeshBasicMaterial({ map: this._makeNeonSignTex("♥ CHEKI ♥", "拍立得特典角", "#ff6bb5") })
      );
      chekiSign.position.set(2.35, 2.75, -4.82);
      this.scene.add(chekiSign);
      // Ring light on tripod
      const ring = new T.Mesh(
        new T.TorusGeometry(0.24, 0.035, 10, 24),
        new T.MeshBasicMaterial({ color: 0xfff4fa })
      );
      ring.position.set(1.15, 1.65, -1.65);
      ring.rotation.y = -0.45;
      this.scene.add(ring);
      this._mesh(new T.CylinderGeometry(0.03, 0.05, 1.3, 8), { color: 0x22222c }, 1.15, 0.98, -1.65);

      // 6. B1 Underground Livehouse Stage (Front-Right) with Concert LED Backdrop, Drum Kit, Amps & Trusses
      this._mesh(new T.BoxGeometry(5.5, 0.42, 3.0), { color: 0x181529, roughness: 0.4 }, 4.35, 0.21, 1.05);
      this._mesh(new T.BoxGeometry(5.52, 0.07, 0.09), { color: 0xff4d94, emissive: 0xff3b8d, emissiveIntensity: 0.95 }, 4.35, 0.41, 2.54);

      // Giant Concert Visual LED Backdrop Screen!
      const ledTex = this._loadAssetTex("led_concert").tex;
      this._mesh(new T.BoxGeometry(4.7, 2.45, 0.16), { color: 0x12101c }, 4.35, 1.85, -0.35);
      this.ledScreenPlane = new T.Mesh(
        new T.PlaneGeometry(4.48, 2.24),
        new T.MeshBasicMaterial({ map: ledTex })
      );
      this.ledScreenPlane.position.set(4.35, 1.85, -0.26);
      this.scene.add(this.ledScreenPlane);

      // Drum Kit (Bass drum + Snare + Golden Cymbals) + Marshall Amp Stack
      const drumBass = this._mesh(new T.CylinderGeometry(0.38, 0.38, 0.42, 18), { color: 0xb8296b, metalness: 0.4 }, 2.45, 0.8, 0.35);
      drumBass.rotation.x = Math.PI / 2;
      this._mesh(new T.CylinderGeometry(0.28, 0.28, 0.02, 16), { color: 0xf5d061, metalness: 0.85, roughness: 0.15 }, 2.05, 1.35, 0.45);
      this._mesh(new T.BoxGeometry(0.88, 1.35, 0.58), { color: 0x191822 }, 6.35, 1.08, 0.45);
      this._mesh(new T.BoxGeometry(0.76, 0.52, 0.04), { color: 0x3b354d }, 6.35, 1.35, 0.75);

      // Volumetric Spotlight Cones above Stage
      [3.1, 4.35, 5.6].forEach((lx, i) => {
        const cone = new T.Mesh(
          new T.ConeGeometry(1.15, 3.4, 18, 1, true),
          new T.MeshBasicMaterial({
            color: i === 1 ? 0x55d8ff : 0xff5ca8,
            transparent: true,
            opacity: 0.11,
            side: T.DoubleSide,
            depthWrite: false
          })
        );
        cone.position.set(lx, 2.25, 1.15);
        this.scene.add(cone);
        this.spotCones.push(cone);
      });

      // Lu Chen's iconic welded front-row iron chair!
      this._mesh(new T.BoxGeometry(0.48, 0.42, 0.48), { color: 0x434a5e, metalness: 0.5 }, 4.25, 0.21, 3.02);
      this._mesh(new T.BoxGeometry(0.48, 0.55, 0.08), { color: 0xff5f91, emissive: 0xff4785, emissiveIntensity: 0.5 }, 4.25, 0.65, 3.24);
    }

    _makeNameBadge(text, borderHex) {
      const T = window.THREE;
      const c = document.createElement("canvas");
      c.width = 280; c.height = 68;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "rgba(17, 12, 28, 0.86)";
      ctx.strokeStyle = borderHex;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(6, 6, 268, 56, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px 'PingFang SC', 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 140, 35);
      const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthTest: false }));
      sp.scale.set(1.16, 0.28, 1);
      return sp;
    }

    _createStandeeActor(texKey, label, badgeCol, charH, quoteText) {
      const T = window.THREE;
      const h = charH || 1.88;
      const built = window.CHAR_3D_BUILDER.create3DCharacter(T, texKey, h);
      const root = built.root;

      // Soft ground contact shadow + subtle character aura ring
      const shadow = new T.Mesh(
        new T.CircleGeometry(0.42, 22),
        new T.MeshBasicMaterial({ color: 0x07040e, transparent: true, opacity: 0.45 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.018;
      root.add(shadow);

      const ring = new T.Mesh(
        new T.RingGeometry(0.38, 0.44, 24),
        new T.MeshBasicMaterial({ color: badgeCol, transparent: true, opacity: 0.40, side: T.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.024;
      root.add(ring);

      let badge = null;
      if (label) {
        badge = this._makeNameBadge(label, badgeCol);
        badge.position.set(0, h + 0.24, 0);
        root.add(badge);
      }

      root.userData = {
        rigRoot: built.rigRoot,
        joints: built.joints,
        faceMat: built.faceMat,
        faceTex: built.faceTex,
        spec: built.spec,
        baseHipY: built.baseHipY,
        scaleFactor: built.scaleFactor,
        pickMeshes: built.pickMeshes,
        shadow,
        badge,
        quote: quoteText || "💖 欢迎光临 404~",
        badgeCol,
        baseH: h,
        // Live 3D kinematic state
        gaitPhase: Math.random() * Math.PI * 2,
        moveBlend: 0,
        facingY: 0,
        targetFacingY: 0,
        idleFacingY: 0,
        reactTimer: 0,
        blinkTimer: 1.5 + Math.random() * 3.0,
        blinkState: false,
        lookAngle: 0,
        lookTarget: 0,
        lookTilt: 0,
        lookTiltTarget: 0,
        lookTimer: 1.8 + Math.random() * 3.0
      };
      this.scene.add(root);
      return root;
    }

    _deformLegPart(part, hipX, hipY, hipSwayX, bodyBob, grooveKnee, reactHop, legAng, lift, kneePull, zDepth) {
      const pos = part.geo.attributes.position;
      const arr = pos.array;
      const n = part.bx.length;
      const cosA = Math.cos(legAng);
      const sinA = Math.sin(legAng);
      const topFollow = bodyBob * 0.65 - grooveKnee;

      for (let i = 0; i < n; i++) {
        const bx = part.bx[i];
        const by = part.by[i];
        const r = part.reach[i];
        const rx = bx - hipX;
        const ry = by - hipY;
        // Rotate cleanly around hip joint + natural knee forward curve & foot lift!
        let x = hipX + rx * cosA - ry * sinA + hipSwayX * (1 - r * 0.7) - part.knee[i] * kneePull;
        let y = hipY + rx * sinA + ry * cosA + topFollow * (1 - r) + lift * r + reactHop;
        if (y < 0 && reactHop <= 0.001) y = 0;

        const idx3 = i * 3;
        arr[idx3] = x;
        arr[idx3 + 1] = y;
        arr[idx3 + 2] = zDepth;
      }
      pos.needsUpdate = true;
    }

    _deformActorRig(u, t, seed, mode) {
      const h = u.baseH;
      const w = u.baseW;
      const rig = u.rig;
      const mv = u.moveBlend; // 0 = idle, 1 = full natural walk
      const gp = u.gaitPhase;

      // Ensure upper body ALWAYS stays in front of thighs even after 180-deg Y-turn!
      const zSign = Math.cos(u.turnAngle) >= 0 ? 1 : -1;

      // Reaction hop when clicked (decays smoothly over 0.55s)
      let reactHop = 0;
      if (u.reactTimer > 0) {
        const p = 1 - u.reactTimer / 0.55;
        reactHop = Math.sin(p * Math.PI) * 0.20 * h;
      }

      // 1. Bipedal Leg Kinematics (Left & Right 180 deg out of phase — clean human stride!)
      const swingL = Math.sin(gp);
      const strideL = -Math.cos(gp);
      const swingR = Math.sin(gp + Math.PI);
      const strideR = -Math.cos(gp + Math.PI);

      const liftL = swingL > 0 ? Math.pow(swingL, 0.88) * 0.135 * h * mv : 0;
      const liftR = swingR > 0 ? Math.pow(swingR, 0.88) * 0.135 * h * mv : 0;
      // Negative angle swings foot toward -X (forward in local sprite space!)
      const legAngL = -strideL * rig.strideAmp * mv;
      const legAngR = -strideR * rig.strideAmp * mv;
      const kneeL = (swingL > 0 ? swingL : 0) * 0.052 * w * mv;
      const kneeR = (swingR > 0 ? swingR : 0) * 0.052 * w * mv;
      // Front-swinging leg passes cleanly in front of planted leg, both tucked neatly behind skirt hem!
      const legDepthL = (swingL * 0.014 - 0.004) * zSign;
      const legDepthR = (swingR * 0.014 - 0.004) * zSign;

      // 2. Calm, Solid Human Upper Body Dynamics (ZERO jitter, ZERO rubbery warping!)
      // Smooth cosine vertical rise per step (no sharp |sin| bounce!)
      const smoothStepBob = (1 - Math.cos(gp * 2)) * 0.5;
      let bodyBob = smoothStepBob * 0.019 * h * mv + reactHop;
      let hipSwayX = Math.cos(gp) * 0.008 * w * mv;
      // Subtle steady forward lean when walking (calm & grounded)
      let torsoLean = 0.036 * mv;

      // Gentle idle breathing (slow, calm ~0.28 Hz human breath)
      const breath = Math.sin(t * 1.75 + seed);
      const idleScale = 1 - mv;
      const breathRise = breath * 0.006 * h * idleScale;
      const idleWeightShift = Math.sin(t * 0.55 + seed) * 0.007 * w * idleScale;
      hipSwayX += idleWeightShift;

      // 3. Stabilized Head (real humans keep their head level while walking!)
      let headRot =
        (-torsoLean * 0.55) * mv +
        u.lookAngle * idleScale;

      // 4. Role-specific gentle motions (only when idle at stage / crowd / training)
      let grooveKnee = 0;
      let cheerArmLift = 0;
      if (idleScale > 0.15) {
        if (mode === "perform") {
          // Grounded musical groove (~115 BPM) — calm rhythmic sway & nod, zero shaking
          const beat = t * 4.6 + seed;
          const groove = Math.sin(beat);
          const pulse = (1 - Math.cos(beat * 2)) * 0.5;
          grooveKnee = (1 - pulse) * 0.028 * h * idleScale;
          bodyBob += pulse * 0.024 * h * idleScale;
          torsoLean += groove * 0.036 * idleScale;
          headRot += Math.sin(beat - 0.35) * 0.045 * idleScale;
        } else if (mode === "cheer") {
          // Crowd glowstick pumping on beat + gentle knee bounce
          const beat = t * 5.2 + seed;
          const pump = (Math.sin(beat) + 1) * 0.5;
          grooveKnee = (1 - pump) * 0.024 * h * idleScale;
          bodyBob += pump * 0.026 * h * idleScale;
          cheerArmLift = pump * 0.065 * h * idleScale;
          headRot += Math.sin(beat - 0.25) * 0.03 * idleScale;
        } else if (mode === "training") {
          const tr = Math.sin(t * 2.4 + seed);
          bodyBob += ((tr + 1) * 0.5) * 0.012 * h * idleScale;
          headRot += tr * 0.026 * idleScale;
        }
      }

      // Deform the 2 completely independent leg meshes first!
      this._deformLegPart(u.legL, u.hipLX, u.hipY, hipSwayX, bodyBob, grooveKnee, reactHop, legAngL, liftL, kneeL, legDepthL);
      this._deformLegPart(u.legR, u.hipRX, u.hipY, hipSwayX, bodyBob, grooveKnee, reactHop, legAngR, liftR, kneeR, legDepthR);

      // Now deform the Upper Body mesh cleanly (solid torso/props + subtle head tilt & hair breeze)
      const pos = u.upperGeo.attributes.position;
      const arr = pos.array;
      const n = u.baseX.length;

      // Single-frequency smooth hair trail (never double-frequency jitter!)
      const hairFactor = rig.hairSway || 1.0;
      const hairLag = (Math.sin(gp - 0.7) * 0.011 * mv + Math.sin(t * 1.35 + seed) * 0.006 * idleScale) * w * hairFactor;

      const cosLean = Math.cos(torsoLean);
      const sinLean = Math.sin(torsoLean);
      const cosHead = Math.cos(headRot);
      const sinHead = Math.sin(headRot);

      const hipY = u.hipY;
      const neckY = u.neckY;
      const hipCX = u.hipCenterX;
      const neckPivotX = hipCX + hipSwayX - (neckY - hipY) * sinLean;
      const neckPivotY = neckY + bodyBob + breathRise - grooveKnee;
      const upperZ = 0.026 * zSign;

      for (let i = 0; i < n; i++) {
        let x = u.baseX[i];
        let y = u.baseY[i];

        // Solid upper body lean + smooth pelvis ride + gentle breathing
        const rxU = x - hipCX;
        const ryU = y - hipY;
        x = hipCX + rxU * cosLean - ryU * sinLean + hipSwayX;
        y = hipY + rxU * sinLean + ryU * cosLean + bodyBob + breathRise - grooveKnee;

        // Glowstick vertical lift ONLY during concert cheering (keeps props solid during normal walking!)
        if (cheerArmLift > 0.001) {
          const wa = u.wArmL[i] + u.wArmR[i];
          if (wa > 0.001) {
            y += cheerArmLift * u.armReach[i] * wa;
          }
        }

        // Calm, stabilized head rotation locked cleanly onto Neck Pivot
        const wh = u.wHead[i];
        if (wh > 0.001) {
          const rx = x - neckPivotX;
          const ry = y - neckPivotY;
          const hX = neckPivotX + rx * cosHead - ry * sinHead;
          const hY = neckPivotY + rx * sinHead + ry * cosHead;
          x += (hX - x) * wh;
          y += (hY - y) * wh;
        }

        // Gentle secondary hair / coat-tail trail
        const whL = u.wHairL[i];
        const whR = u.wHairR[i];
        if (whL > 0.001) {
          x += (hairLag + 0.015 * w * mv) * whL;
        }
        if (whR > 0.001) {
          x += (hairLag + 0.015 * w * mv) * whR;
        }

        const idx3 = i * 3;
        arr[idx3] = x;
        arr[idx3 + 1] = y;
        arr[idx3 + 2] = upperZ;
      }

      pos.needsUpdate = true;

      if (u.shadow) {
        const sScale = 1 - Math.min(0.22, (bodyBob / h) * 1.2);
        u.shadow.scale.set(sScale * (1 + mv * 0.06), sScale, 1);
      }
      if (u.badge) {
        u.badge.position.y = h + 0.24 + bodyBob * 0.65;
      }
    }

    _buildStaffActors() {
      const initPos = {
        luchen: SPOTS.barIn,
        mahiru: SPOTS.chekiMaid,
        reine:  SPOTS.stageMid,
        kohaku: SPOTS.tables[0],
        millie: SPOTS.nook
      };
      STAFF_DEFS.forEach((d, idx) => {
        const mesh = this._createStandeeActor(d.tex, d.name, d.color, d.h, d.quote);
        const p = initPos[d.id];
        mesh.position.set(p.x, p.y, p.z);
        this.staff.set(d.id, {
          id: d.id,
          mesh,
          target: { ...p },
          speed: d.id === "kohaku" ? 2.55 : 2.15,
          waitTimer: 1.5 + idx * 0.9,
          role: d.id === "kohaku" ? "serving" : "station",
          seed: idx * 1.7
        });
      });
    }

    _spawnGuest(randomStart) {
      if (this.guests.length >= 8) return;
      const arch = GUEST_ARCHETYPES[Math.floor(Math.random() * GUEST_ARCHETYPES.length)];
      const mesh = this._createStandeeActor(arch.tex, arch.tag, arch.color, 1.78, arch.quote);
      const start = randomStart ? SPOTS.tables[Math.floor(Math.random() * SPOTS.tables.length)] : SPOTS.door;
      mesh.position.set(start.x, start.y, start.z);

      const dest = this._pickDestination();
      this.guests.push({
        mesh,
        state: randomStart ? "enjoying" : "entering",
        target: dest.pos,
        activity: dest.kind,
        timer: 3.4 + Math.random() * 3.8,
        speed: 1.85 + Math.random() * 0.42,
        seed: Math.random() * 6.28
      });
    }

    _pickDestination() {
      if (this.currentFocus === "evening") {
        const c = SPOTS.crowd[Math.floor(Math.random() * SPOTS.crowd.length)];
        return { kind: "concert", pos: { x: c.x + (Math.random() - 0.5) * 0.55, y: 0, z: c.z + (Math.random() - 0.5) * 0.35 } };
      }
      if (this.lastOptId.includes("cheki") || (this.currentFocus === "afternoon" && Math.random() < 0.45)) {
        return { kind: "cheki", pos: { x: SPOTS.chekiGuest.x + (Math.random() - 0.5) * 0.55, y: 0.36, z: SPOTS.chekiGuest.z } };
      }
      const tb = SPOTS.tables[Math.floor(Math.random() * SPOTS.tables.length)];
      return { kind: "table", pos: { x: tb.x + (Math.random() - 0.5) * 0.95, y: 0, z: tb.z + 0.55 } };
    }

    syncWithGameState(gameState, gameData, optId) {
      if (!this.scene) return;
      if (optId) this.lastOptId = optId;
      this.currentFocus = gameState.phase;

      const labelEl = document.getElementById("sim3d-mode-label");
      const phaseTitles = {
        roster: "3D 实况 · 早会排班",
        morning: "3D 实况 · 晨间特训",
        afternoon: "3D 实况 · 午市营业",
        evening: "3D 实况 · B1 演出中",
        night: "3D 实况 · 打烊收尾"
      };
      if (labelEl) labelEl.textContent = phaseTitles[gameState.phase] || "3D 实时实况";

      ["mahiru", "reine", "kohaku", "millie"].forEach((cid) => {
        const ch = gameData.characters[cid];
        const st = this.staff.get(cid);
        if (!st || !ch) return;
        st.mesh.visible = !!ch.onDuty;
        if (!ch.onDuty) return;

        if (gameState.phase === "evening") {
          const stageForm = { reine: SPOTS.stageMid, mahiru: SPOTS.stageL, kohaku: SPOTS.stageR, millie: SPOTS.djBooth };
          st.target = { ...stageForm[cid] };
          st.role = "performing";
        } else if (gameState.phase === "morning") {
          const trainForm = { kohaku: SPOTS.barFront, reine: { x: -1.9, y: 0, z: -1.35 }, mahiru: SPOTS.chekiMaid, millie: SPOTS.nook };
          st.target = { ...trainForm[cid] };
          st.role = "training";
        } else {
          const workForm = { mahiru: SPOTS.chekiMaid, kohaku: SPOTS.tables[0], reine: SPOTS.barFront, millie: SPOTS.nook };
          st.target = { ...workForm[cid] };
          st.role = cid === "kohaku" ? "serving" : "station";
        }
      });

      const lu = this.staff.get("luchen");
      if (lu) {
        lu.target = gameState.phase === "evening" ? { x: 4.25, y: 0, z: 2.85 } : { ...SPOTS.barIn };
      }

      if (optId) {
        for (let i = 0; i < 3; i++) this._spawnGuest(false);
        this.spawnFloatingPopup(0, 2.5, 0.2, "✨ 经营指令生效！同好顾客进店中", "#ffe7a8");
      }
    }

    setVisible(flag) {
      this.visible = !!flag;
      if (this.container) this.container.classList.toggle("active", this.visible);
      if (this.visible) this.resize();
    }

    spawnFloatingPopup(wx, wy, wz, text, color) {
      if (!this.popupLayer || !this.camera || !this.visible) return;
      const T = window.THREE;
      const v = new T.Vector3(wx, wy, wz).project(this.camera);
      if (v.z > 1) return;
      const sx = (v.x * 0.5 + 0.5) * (this.container.clientWidth || 800);
      const sy = (-v.y * 0.5 + 0.5) * (this.container.clientHeight || 500);
      const el = document.createElement("div");
      el.className = "sim3d-float-tag";
      el.style.left = `${sx.toFixed(0)}px`;
      el.style.top = `${sy.toFixed(0)}px`;
      el.style.color = color || "#7fe0a3";
      el.textContent = text;
      this.popupLayer.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }

    _wrapAngleDiff(target, current) {
      let diff = target - current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      return diff;
    }

    _updateStandeeMotion(mesh, target, speed, dt, seed, animMode, idleFaceY) {
      const dx = target.x - mesh.position.x;
      const dz = target.z - mesh.position.z;
      const dy = (target.y || 0) - mesh.position.y;
      const dist = Math.hypot(dx, dz);
      const u = mesh.userData;

      // Smooth floor elevation transitions (e.g. stepping onto 2F Cheki platform or B1 stage)
      mesh.position.y += dy * Math.min(1, dt * 7.5);

      if (u.reactTimer > 0) {
        u.reactTimer = Math.max(0, u.reactTimer - dt);
      }

      // Natural idle look-around head turn & slight tilt
      u.lookTimer -= dt;
      if (u.lookTimer <= 0) {
        u.lookTimer = 2.6 + Math.random() * 3.6;
        u.lookTarget = (Math.random() - 0.5) * 0.42;
        u.lookTiltTarget = (Math.random() - 0.5) * 0.12;
      }
      u.lookAngle += (u.lookTarget - u.lookAngle) * Math.min(1, dt * 2.4);
      u.lookTilt += (u.lookTiltTarget - u.lookTilt) * Math.min(1, dt * 2.4);

      const isWalking = dist > 0.07;
      if (isWalking) {
        // Gentle deceleration near destination for natural human stopping
        const easeFactor = dist < 0.45 ? 0.45 + 0.55 * (dist / 0.45) : 1.0;
        const step = Math.min(dist, speed * easeFactor * dt);
        let dirX = dx / dist;
        let dirZ = dz / dist;

        // Soft steering around cafe tables & drum kit so characters naturally walk AROUND furniture
        for (let oi = 0; oi < WALK_OBSTACLES.length; oi++) {
          const ob = WALK_OBSTACLES[oi];
          const toGoalOb = Math.hypot(target.x - ob.x, target.z - ob.z);
          if (toGoalOb < ob.r * 0.85) continue;
          const ox = mesh.position.x - ob.x;
          const oz = mesh.position.z - ob.z;
          const od = Math.hypot(ox, oz);
          if (od > 0.001 && od < ob.r + 0.35) {
            const push = (1 - od / (ob.r + 0.35)) * 1.45;
            dirX += (ox / od) * push;
            dirZ += (oz / od) * push;
          }
        }
        const dLen = Math.hypot(dirX, dirZ) || 1;
        dirX /= dLen;
        dirZ /= dLen;

        mesh.position.x += dirX * step;
        mesh.position.z += dirZ * step;

        // True 360-degree 3D heading toward movement direction!
        u.targetFacingY = Math.atan2(dirX, dirZ);

        // Stride phase locked strictly to real ground distance covered (zero foot sliding!)
        u.gaitPhase += step * 5.2;
        u.moveBlend += (1 - u.moveBlend) * Math.min(1, dt * 8.0);
      } else {
        // Turn smoothly toward logical station/audience direction when idle!
        if (typeof idleFaceY === "number") {
          u.targetFacingY = idleFaceY;
        }
        u.moveBlend += (0 - u.moveBlend) * Math.min(1, dt * 7.0);
        if (u.moveBlend < 0.005) u.moveBlend = 0;
      }

      // Smooth shortest-arc 360-deg rotation of the 3D character body!
      u.facingY += this._wrapAngleDiff(u.targetFacingY, u.facingY) * Math.min(1, dt * 8.5);
      u.rigRoot.rotation.y = u.facingY;

      // Drive the 14-joint 3D humanoid skeleton!
      window.CHAR_3D_BUILDER.animate3DCharacter(u, this.clock, dt, seed, animMode);

      return !isWalking;
    }

    _animate(ts) {
      const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) * 0.001));
      this.lastTs = ts;
      this.clock += dt;

      if (this.visible && this.renderer) {
        const cx = Math.sin(this.yaw) * Math.cos(this.pitch) * this.dist;
        const cy = Math.sin(this.pitch) * this.dist;
        const cz = Math.cos(this.yaw) * Math.cos(this.pitch) * this.dist;
        this.camera.position.set(cx, Math.max(3.6, cy), cz + 0.5);
        this.camera.lookAt(0.0, 1.15, 0.2);

        // Animate stage spotlight cones & Cheki Polaroid flash
        this.spotCones.forEach((c, i) => {
          c.rotation.z = Math.sin(this.clock * 1.8 + i * 1.6) * 0.22;
          c.material.opacity = this.currentFocus === "evening" ? 0.2 : 0.09;
        });
        if (this.flashTimer > 0) {
          this.flashTimer -= dt;
          this.chekiLight.intensity = 1.6 + this.flashTimer * 16.0;
        }

        // Staff update with natural station patrol routines & logical 3D facing
        this.staff.forEach((st) => {
          if (!st.mesh.visible) return;
          const animMode =
            st.role === "performing" ? "perform" :
            st.role === "training" ? "training" : "station";
          let idleFaceY = 0;
          if (st.role === "performing") {
            idleFaceY = 0.05; // Face B1 audience (+Z)
          } else if (st.id === "luchen") {
            idleFaceY = this.currentFocus === "evening" ? Math.PI : 0.15; // Face customers or B1 stage
          } else if (st.id === "mahiru") {
            idleFaceY = 0.1; // Face Cheki camera / guests (+Z)
          } else if (st.id === "millie") {
            idleFaceY = 0.55; // Peek out toward cafe floor
          }
          const arrived = this._updateStandeeMotion(
            st.mesh, st.target, st.speed, dt, st.seed, animMode, idleFaceY
          );
          if (arrived) {
            st.waitTimer -= dt;
            if (st.waitTimer <= 0) {
              if (st.role === "serving") {
                st.waitTimer = 2.6 + Math.random() * 2.2;
                const route = [SPOTS.barFront, ...SPOTS.tables];
                const pick = route[Math.floor(Math.random() * route.length)];
                st.target = { x: pick.x + 0.65, y: 0, z: pick.z + 0.15 };
              } else if (st.role === "station") {
                st.waitTimer = 3.8 + Math.random() * 3.5;
                if (st.id === "luchen") {
                  // Walk naturally along behind the walnut bar counter
                  st.target = { x: -4.4 + Math.random() * 2.3, y: 0, z: -3.15 };
                } else if (st.id === "mahiru") {
                  // Move smoothly around the 2F Cheki corner & greet guests
                  const pts = [
                    SPOTS.chekiMaid,
                    { x: 1.55, y: 0.36, z: -2.55 },
                    { x: 3.15, y: 0.36, z: -2.75 }
                  ];
                  st.target = { ...pts[Math.floor(Math.random() * pts.length)] };
                } else if (st.id === "reine") {
                  // Pace subtly between bar & open walkway near stage during prep/afternoon
                  const pts = [
                    SPOTS.barFront,
                    { x: 0.35, y: 0, z: 0.65 },
                    { x: 1.35, y: 0, z: 2.35 }
                  ];
                  st.target = { ...pts[Math.floor(Math.random() * pts.length)] };
                }
              }
            }
          }
        });

        // Customer flow update
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnTimer = this.currentFocus === "evening" ? 1.8 : 2.8;
          this._spawnGuest(false);
        }

        for (let i = this.guests.length - 1; i >= 0; i--) {
          const g = this.guests[i];
          const animMode = g.state === "enjoying" && g.activity === "concert" ? "cheer" : "station";
          // Guests face the stage (-Z) at concerts or Cheki booth (-Z) during Polaroid photos!
          const guestFaceY =
            g.activity === "concert" ? Math.PI :
            g.activity === "cheki" ? Math.PI : 0.25;
          const arrived = this._updateStandeeMotion(g.mesh, g.target, g.speed, dt, g.seed, animMode, guestFaceY);
          if (arrived) {
            if (g.state === "entering") {
              g.state = "enjoying";
              if (g.activity === "cheki") {
                this.flashTimer = 0.35;
                this.spawnFloatingPopup(g.mesh.position.x, 2.3, g.mesh.position.z, "📸 咔嚓! 拍切特典 +¥320", "#ff8fb0");
              } else if (g.activity === "concert") {
                this.spawnFloatingPopup(g.mesh.position.x, 2.2, g.mesh.position.z, "🎤 双棒打Call! 票房UP", "#c9a0f5");
              } else {
                this.spawnFloatingPopup(g.mesh.position.x, 2.1, g.mesh.position.z, "🍓 歪嘴猫蛋包饭♪", "#ffe7a8");
              }
            } else if (g.state === "enjoying") {
              g.timer -= dt;
              if (g.timer <= 0) {
                g.state = "leaving";
                g.target = { ...SPOTS.door };
                const tip = g.activity === "cheki" ? "+¥450 💖" : g.activity === "concert" ? "+¥380 🔥" : "+¥190 ☕";
                this.spawnFloatingPopup(g.mesh.position.x, 2.2, g.mesh.position.z, tip, "#7fe0a3");
              }
            } else {
              this.scene.remove(g.mesh);
              this.guests.splice(i, 1);
            }
          }
        }

        this.renderer.render(this.scene, this.camera);
      }

      requestAnimationFrame((t) => this._animate(t));
    }

    _bindControls() {
      const dom = this.renderer.domElement;
      const T = window.THREE;
      const raycaster = new T.Raycaster();
      const pointer = new T.Vector2();
      let downPos = { x: 0, y: 0 };

      dom.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.dragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        downPos = { x: e.clientX, y: e.clientY };
      });
      window.addEventListener("mousemove", (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        this.yaw = Math.max(-0.5, Math.min(1.25, this.yaw - dx * 0.006));
        this.pitch = Math.max(0.28, Math.min(1.05, this.pitch + dy * 0.005));
      });
      window.addEventListener("mouseup", () => { this.dragging = false; });
      dom.addEventListener("click", (e) => {
        e.stopPropagation();
        // Ignore click if user was dragging camera
        if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) return;

        const rect = dom.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, this.camera);

        const meshes = [];
        this.staff.forEach((st) => {
          const u = st.mesh.userData;
          if (st.mesh.visible && u && u.pickMeshes) {
            meshes.push(...u.pickMeshes);
          }
        });
        this.guests.forEach((g) => {
          const u = g.mesh.userData;
          if (u && u.pickMeshes) {
            meshes.push(...u.pickMeshes);
          }
        });

        const hits = raycaster.intersectObjects(meshes, false);
        if (hits.length > 0) {
          const actor = hits[0].object.userData.actorRoot;
          if (actor && actor.userData) {
            actor.userData.reactTimer = 0.55;
            this.spawnFloatingPopup(
              actor.position.x,
              actor.position.y + actor.userData.baseH + 0.35,
              actor.position.z,
              actor.userData.quote,
              actor.userData.badgeCol
            );
            return;
          }
        }
      });
      dom.addEventListener("wheel", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dist = Math.max(10.0, Math.min(22.5, this.dist + e.deltaY * 0.01));
      }, { passive: false });
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth || 960;
      const h = this.container.clientHeight || 640;
      this.camera.aspect = w / Math.max(1, h);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
  }

  window.CAFE_SIM_3D = new CafeSim3D();
})();
