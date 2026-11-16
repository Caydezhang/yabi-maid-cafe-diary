/**
 * 《拯救亚比妹妹——仆咖经营日记》高精 HD-2D / 蔚蓝档案咖啡厅级 3D 箱庭引擎 v2
 * - 商业级二头身手绘 SD Q版立牌小人（Paper-Mario / Blue-Archive 弹性蹦跳阴影立牌）
 * - 程序化精雕胡桃木吧台、霓虹拱窗夜景、天鹅绒卡座、2F拍切爱心霓虹布景、B1架子鼓音箱阵与频谱LED大屏
 */
(function () {
  const STAFF_DEFS = [
    { id: "luchen", tex: "chibi_luchen", name: "陆沉 · 店长", color: "#70b5ff", h: 1.95 },
    { id: "mahiru", tex: "chibi_mahiru", name: "真昼 · 拍切销冠", color: "#ff5f91", h: 1.92 },
    { id: "reine",  tex: "chibi_reine",  name: "零音 · 主唱", color: "#ab75ff", h: 1.95 },
    { id: "kohaku", tex: "chibi_kohaku", name: "琥珀 · 主厨", color: "#e9c76d", h: 1.92 },
    { id: "millie", tex: "chibi_millie", name: "千禧 · 黑客", color: "#7fe0a3", h: 1.82 }
  ];

  const GUEST_ARCHETYPES = [
    { tex: "chibi_guest_jirai",   tag: "地雷系同好", color: "#ff8fb0" },
    { tex: "chibi_guest_wota",    tag: "地偶死忠粉", color: "#c9a0f5" },
    { tex: "chibi_guest_vlogger", tag: "探店Up主",   color: "#ffe7a8" },
    { tex: "chibi_guest_office",  tag: "下班白领",   color: "#7fe0a3" }
  ];

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
          <span class="sim3d-pill"><i class="sim3d-live-dot"></i> <b id="sim3d-mode-label">3D 店铺实时经营箱庭</b></span>
          <span class="sim3d-hint">🖱️ 按住拖拽旋转视角 · 滚轮推拉特写 · 点击小人互动</span>
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

      const sun = new T.DirectionalLight(0xfff0dd, 0.85);
      sun.position.set(-7, 15, 10);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
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
      sp.scale.set(1.52, 0.37, 1);
      return sp;
    }

    _createStandeeActor(texKey, label, badgeCol, charH) {
      const T = window.THREE;
      const root = new T.Group();
      const asset = this._loadAssetTex(texKey);
      const h = charH || 1.88;
      const w = h * asset.aspect;

      // Soft ground contact shadow + glowing character aura ring
      const shadow = new T.Mesh(
        new T.CircleGeometry(0.46, 20),
        new T.MeshBasicMaterial({ color: 0x07040e, transparent: true, opacity: 0.62 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      root.add(shadow);

      const ring = new T.Mesh(
        new T.RingGeometry(0.42, 0.49, 24),
        new T.MeshBasicMaterial({ color: badgeCol, transparent: true, opacity: 0.48, side: T.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.025;
      root.add(ring);

      // Pivot at feet (y=0) so squash-and-stretch & waddle tilt anchor cleanly on the floor!
      const pivot = new T.Group();
      root.add(pivot);

      const planeGeo = new T.PlaneGeometry(w, h);
      planeGeo.translate(0, h / 2, 0);
      const standee = new T.Mesh(
        planeGeo,
        new T.MeshBasicMaterial({ map: asset.tex, transparent: true, alphaTest: 0.08, side: T.DoubleSide })
      );
      pivot.add(standee);

      if (label) {
        const badge = this._makeNameBadge(label, badgeCol);
        badge.position.set(0, h + 0.26, 0);
        root.add(badge);
      }

      root.userData = { pivot, standee, baseH: h, flip: 1 };
      this.scene.add(root);
      return root;
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
        const mesh = this._createStandeeActor(d.tex, d.name, d.color, d.h);
        const p = initPos[d.id];
        mesh.position.set(p.x, p.y, p.z);
        this.staff.set(d.id, {
          id: d.id,
          mesh,
          target: { ...p },
          speed: 2.75,
          waitTimer: 1.2 + idx * 0.6,
          role: d.id === "kohaku" ? "serving" : "station",
          seed: idx * 1.7
        });
      });
    }

    _spawnGuest(randomStart) {
      if (this.guests.length >= 8) return;
      const arch = GUEST_ARCHETYPES[Math.floor(Math.random() * GUEST_ARCHETYPES.length)];
      const mesh = this._createStandeeActor(arch.tex, arch.tag, arch.color, 1.78);
      const start = randomStart ? SPOTS.tables[Math.floor(Math.random() * SPOTS.tables.length)] : SPOTS.door;
      mesh.position.set(start.x, start.y, start.z);

      const dest = this._pickDestination();
      this.guests.push({
        mesh,
        state: randomStart ? "enjoying" : "entering",
        target: dest.pos,
        activity: dest.kind,
        timer: 3.0 + Math.random() * 3.5,
        speed: 2.15 + Math.random() * 0.45,
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
        roster: "3D 店铺早会备场 · 右侧切换【出勤/休假】小人实时上下班",
        morning: "3D 晨间特训实况 · 妹妹们正在店内对练涨四维技能",
        afternoon: "3D 午市营业实况 · 顾客进店吃蛋包饭 & 2F拍切闪光爆金币",
        evening: "3D B1 地下 Live 演出实况 · 全员登台演出 & 台下荧光棒打Call！",
        night: "3D 打烊收尾与夜间社媒引流"
      };
      if (labelEl) labelEl.textContent = phaseTitles[gameState.phase] || "3D 店铺实时经营箱庭";

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

    _updateStandeeMotion(mesh, target, speed, dt, seed, danceMode) {
      const dx = target.x - mesh.position.x;
      const dz = target.z - mesh.position.z;
      const dy = (target.y || 0) - mesh.position.y;
      const dist = Math.hypot(dx, dz);
      const u = mesh.userData;

      mesh.position.y += dy * Math.min(1, dt * 8);
      // Billboard cleanly toward camera yaw so 2D hand-drawn SD art never looks paper-flat from the side!
      u.pivot.rotation.y = this.yaw;

      if (dist > 0.08) {
        const step = Math.min(dist, speed * dt);
        mesh.position.x += (dx / dist) * step;
        mesh.position.z += (dz / dist) * step;
        if (Math.abs(dx) > 0.02) u.flip = dx >= 0 ? 1 : -1;

        // Paper-Mario / Blue-Archive lively hop-and-waddle animation!
        const w = this.clock * 14 + seed;
        const hop = Math.abs(Math.sin(w));
        u.pivot.position.y = hop * 0.16;
        u.standee.rotation.z = Math.sin(w) * 0.09;
        u.standee.scale.set(u.flip * (1 + (1 - hop) * 0.05), 1 - (1 - hop) * 0.04, 1);
        return false;
      } else {
        if (danceMode === "perform" || danceMode === "cheer") {
          const b = this.clock * 10.5 + seed;
          const jump = Math.abs(Math.sin(b));
          u.pivot.position.y = jump * (danceMode === "perform" ? 0.24 : 0.15);
          u.standee.rotation.z = Math.sin(b * 0.5) * 0.11;
          u.standee.scale.set(u.flip * (1.04 - jump * 0.06), 0.96 + jump * 0.08, 1);
        } else {
          // Gentle idle squash-breath
          const br = Math.sin(this.clock * 3.1 + seed);
          u.pivot.position.y = 0;
          u.standee.rotation.z = br * 0.02;
          u.standee.scale.set(u.flip * (1 - br * 0.018), 1 + br * 0.022, 1);
        }
        return true;
      }
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

        // Staff update
        this.staff.forEach((st) => {
          if (!st.mesh.visible) return;
          const arrived = this._updateStandeeMotion(
            st.mesh, st.target, st.speed, dt, st.seed, st.role === "performing" ? "perform" : null
          );
          if (arrived && st.role === "serving") {
            st.waitTimer -= dt;
            if (st.waitTimer <= 0) {
              st.waitTimer = 2.8 + Math.random() * 1.8;
              const route = [SPOTS.barFront, ...SPOTS.tables];
              const pick = route[Math.floor(Math.random() * route.length)];
              st.target = { x: pick.x + 0.65, y: 0, z: pick.z + 0.15 };
            }
          }
        });

        // Customer flow update
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnTimer = this.currentFocus === "evening" ? 1.7 : 2.6;
          this._spawnGuest(false);
        }

        for (let i = this.guests.length - 1; i >= 0; i--) {
          const g = this.guests[i];
          const dance = g.state === "enjoying" && g.activity === "concert" ? "cheer" : null;
          const arrived = this._updateStandeeMotion(g.mesh, g.target, g.speed, dt, g.seed, dance);
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
      dom.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.dragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
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
        this.spawnFloatingPopup((Math.random() - 0.5) * 4, 2.3, (Math.random() - 0.5) * 3, "💖 店长巡店互动~", "#ff8fb0");
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
