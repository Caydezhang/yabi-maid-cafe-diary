/**
 * 《拯救亚比妹妹——仆咖经营日记》Three.js 3D 模拟经营箱庭场景引擎
 * 包含：404 女仆喫茶立体箱庭（1F 水吧点餐区 + 2F 拍切特典角 + B1 地下 Live 舞台）
 * 动态 3D Q版小人：店长陆沉 + 4位亚比妹妹（按出勤/休假实时上岗走动）+ 推门进店点单/拍切/打Call爆金币的顾客流
 */
(function () {
  const CHAR_STYLES = {
    luchen:  { name: "陆沉", body: 0x222940, apron: 0xf4f4f8, skin: 0xffdfc8, hair: 0x1d2233, type: "manager" },
    mahiru:  { name: "真昼", body: 0x23192d, apron: 0xff6b9d, skin: 0xffe4d4, hair: 0x1e1826, accent: 0xff4785, type: "twintail" },
    reine:   { name: "零音", body: 0x1b1729, apron: 0x9c6bff, skin: 0xfce6e2, hair: 0x171424, accent: 0xd9385a, type: "long" },
    kohaku:  { name: "琥珀", body: 0x292024, apron: 0xf5c85c, skin: 0xf0be98, hair: 0xf5ca63, accent: 0xff4f9a, type: "wolf" },
    millie:  { name: "千禧", body: 0xc8d4ee, apron: 0x5ef2a8, skin: 0xfce8df, hair: 0x1f2430, accent: 0x65ff8f, type: "buns" }
  };

  const GUEST_PALETTES = [
    { body: 0x3a4968, hair: 0x2b2420, glow: 0xff5f91, tag: "地雷同好" },
    { body: 0x4b385c, hair: 0x523928, glow: 0xab75ff, tag: "地偶死忠" },
    { body: 0x2e4f4f, hair: 0x1c1c24, glow: 0x7fe0a3, tag: "下班社畜" },
    { body: 0x593a47, hair: 0xc9965b, glow: 0xe9c76d, tag: "探店Up主" }
  ];

  const WAYPOINTS = {
    door:    { x: -6.8, y: 0, z: 4.8 },
    barFront:{ x: -2.8, y: 0, z: -1.6 },
    barIn:   { x: -3.2, y: 0, z: -3.2 },
    nook:    { x: -5.8, y: 0, z: -3.1 },
    tables: [
      { x: -4.2, y: 0, z: 1.5 },
      { x: -1.4, y: 0, z: 1.6 },
      { x: -2.7, y: 0, z: 3.6 }
    ],
    chekiBooth: { x: 2.3, y: 0.35, z: -2.8 },
    chekiGuest: { x: 2.3, y: 0.35, z: -1.3 },
    stageCenter:{ x: 4.2, y: 0.35, z: 1.3 },
    stageLeft:  { x: 2.8, y: 0.35, z: 1.0 },
    crowdSpots: [
      { x: 2.4, y: 0, z: 3.4 },
      { x: 3.9, y: 0, z: 3.8 },
      { x: 5.4, y: 0, z: 3.3 },
      { x: 3.2, y: 0, z: 4.6 },
      { x: 4.8, y: 0, z: 4.5 }
    ]
  };

  class CafeSim3D {
    constructor() {
      this.container = null;
      this.overlayHud = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.visible = false;
      this.autoLockedByUser = false;

      // Camera orbit state
      this.yaw = 0.62;
      this.pitch = 0.66;
      this.dist = 16.5;
      this.dragging = false;
      this.lastMouse = { x: 0, y: 0 };

      this.staffActors = new Map();
      this.guests = [];
      this.floatPopups = [];
      this.spotLights = [];
      this.flashTimer = 0;
      this.spawnTimer = 0.4;
      this.currentFocus = "afternoon"; // morning | afternoon | evening | night
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
          <span class="sim3d-hint">🖱️ 按住拖拽旋转视角 · 滚轮缩放 · 点击小人互动</span>
        </div>
        <div id="sim3d-popups" class="sim3d-popups"></div>
      `;
      const galBox = stage.querySelector(".gal-box");
      stage.insertBefore(this.container, galBox);
      this.popupLayer = this.container.querySelector("#sim3d-popups");

      const T = window.THREE;
      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x110c1c);
      this.scene.fog = new T.FogExp2(0x110c1c, 0.022);

      this.camera = new T.PerspectiveCamera(40, 16 / 9, 0.1, 100);
      this.renderer = new T.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = T.PCFSoftShadowMap;
      this.container.insertBefore(this.renderer.domElement, this.container.firstChild);

      this._buildLighting();
      this._buildDiorama();
      this._buildStaff();
      this._bindControls();
      this.resize();

      for (let i = 0; i < 4; i++) this._spawnGuest(true);
      requestAnimationFrame((ts) => this._animate(ts));
      return true;
    }

    _buildLighting() {
      const T = window.THREE;
      const hemi = new T.HemisphereLight(0xd9c2ff, 0x241834, 0.85);
      this.scene.add(hemi);

      const mainDir = new T.DirectionalLight(0xffe7c4, 0.95);
      mainDir.position.set(-6, 14, 8);
      mainDir.castShadow = true;
      mainDir.shadow.mapSize.set(1024, 1024);
      this.scene.add(mainDir);

      // Warm bar light + Pink Cheki neon + Cyan/Magenta Livehouse stage lights
      const barPt = new T.PointLight(0xffad66, 1.35, 11);
      barPt.position.set(-3.5, 3.2, -2.5);
      this.scene.add(barPt);

      this.chekiFlashLight = new T.PointLight(0xff5f9f, 1.4, 9);
      this.chekiFlashLight.position.set(2.3, 3.0, -2.5);
      this.scene.add(this.chekiFlashLight);

      const stagePt1 = new T.PointLight(0xab55ff, 1.6, 12);
      stagePt1.position.set(3.2, 3.8, 1.2);
      const stagePt2 = new T.PointLight(0x45d2ff, 1.4, 12);
      stagePt2.position.set(5.2, 3.8, 1.8);
      this.scene.add(stagePt1, stagePt2);
      this.spotLights.push(stagePt1, stagePt2);
    }

    _box(w, h, d, color, x, y, z, emissive) {
      const T = window.THREE;
      const mat = new T.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0.15,
        emissive: emissive || 0x000000,
        emissiveIntensity: emissive ? 0.85 : 0
      });
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.scene.add(m);
      return m;
    }

    _buildDiorama() {
      const T = window.THREE;
      // Floor base with checker tiles on 1F & dark concrete on B1 right zone
      this._box(15.2, 0.3, 11.2, 0x231b34, 0, -0.15, 0.4);
      for (let ix = -7; ix <= 0; ix++) {
        for (let iz = -4; iz <= 5; iz++) {
          const c = (ix + iz) % 2 === 0 ? 0x2e2342 : 0x221a33;
          this._box(0.96, 0.04, 0.96, c, ix + 0.5, 0.01, iz);
        }
      }

      // Back & Left Walls (Cutaway isometric style)
      this._box(15.2, 4.2, 0.28, 0x1d162c, 0, 2.1, -4.9);
      this._box(0.28, 4.2, 11.2, 0x211933, -7.45, 2.1, 0.4);

      // Entrance Neon "404" Archway (front-left)
      this._box(0.25, 2.8, 1.8, 0x34264d, -7.32, 1.4, 4.6);
      this._box(0.12, 0.55, 1.5, 0xff4d88, -7.2, 2.55, 4.6, 0xff3b7f);

      // 1F Walnut Bar Counter + Espresso Machine + Glowing Pink Strawberry Milk Dispenser
      this._box(4.8, 1.05, 0.85, 0x4d2e28, -3.4, 0.52, -2.3);
      this._box(5.0, 0.12, 1.0, 0x70453b, -3.4, 1.08, -2.3);
      this._box(0.85, 0.72, 0.55, 0xc9d2e0, -4.4, 1.48, -2.3); // Espresso
      const milkJar = new T.Mesh(
        new T.CylinderGeometry(0.26, 0.26, 0.75, 16),
        new T.MeshStandardMaterial({ color: 0xff7eb3, emissive: 0xff4791, emissiveIntensity: 0.7, transparent: true, opacity: 0.9 })
      );
      milkJar.position.set(-2.4, 1.5, -2.3);
      this.scene.add(milkJar);

      // Millie's Cyber Hacker Nook (back-left behind bar with dual glowing monitors)
      this._box(1.5, 0.8, 0.9, 0x28203d, -6.1, 0.4, -3.7);
      this._box(0.65, 0.48, 0.08, 0x5ef2d6, -6.35, 1.12, -3.9, 0x36d6b8);
      this._box(0.65, 0.48, 0.08, 0xff6bb5, -5.65, 1.12, -3.9, 0xff479a);

      // 1F Cafe Tables & Cute Chairs (3 tables)
      WAYPOINTS.tables.forEach((t) => {
        const top = new T.Mesh(
          new T.CylinderGeometry(0.68, 0.68, 0.1, 20),
          new T.MeshStandardMaterial({ color: 0x59393c, roughness: 0.4 })
        );
        top.position.set(t.x, 0.78, t.z);
        top.castShadow = true;
        const leg = new T.Mesh(
          new T.CylinderGeometry(0.1, 0.22, 0.76, 12),
          new T.MeshStandardMaterial({ color: 0x221c2b })
        );
        leg.position.set(t.x, 0.38, t.z);
        this.scene.add(top, leg);
        // Strawberry parfaits on tables
        this._box(0.18, 0.26, 0.18, 0xff80b5, t.x + 0.15, 0.95, t.z, 0xff4d94);
      });

      // 2F Elevated Cheki Polaroid Booth Platform (back-right)
      this._box(4.2, 0.35, 3.2, 0x332247, 2.3, 0.175, -3.1);
      // Velvet Magenta Sofa + Neon Heart Backdrop
      this._box(2.2, 0.55, 0.75, 0xb8296b, 2.3, 0.62, -3.8);
      this._box(2.2, 1.1, 0.22, 0x991f59, 2.3, 0.92, -4.15);
      this._box(1.3, 1.1, 0.1, 0xff4d94, 2.3, 2.35, -4.68, 0xff3b8d);

      // B1 Livehouse Stage Platform (mid/front-right) + Glitch LED Screen + Amps + Lu Chen's Welded Chair
      this._box(5.2, 0.38, 3.0, 0x1c1a2e, 4.3, 0.19, 1.0);
      this._box(5.2, 0.06, 0.08, 0xff4d94, 4.3, 0.39, 2.48, 0xff4d94); // Stage neon edge
      this.ledScreen = this._box(4.4, 2.3, 0.16, 0x6f3bff, 4.3, 1.9, -0.35, 0x6228eb);
      // Guitar Amps & Mic stand
      this._box(0.8, 1.2, 0.6, 0x181820, 6.1, 0.98, 0.5);
      this._box(0.06, 1.35, 0.06, 0xd8e0f0, 4.2, 1.05, 1.55);
      // Lu Chen's iconic welded front-row iron chair!
      this._box(0.46, 0.45, 0.46, 0x4b5266, 4.2, 0.22, 2.95);
      this._box(0.46, 0.55, 0.08, 0xff5f91, 4.2, 0.68, 3.16, 0xff4785);
    }

    _makeLabelSprite(text, borderHex) {
      const T = window.THREE;
      const cvs = document.createElement("canvas");
      cvs.width = 256;
      cvs.height = 72;
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "rgba(18, 13, 30, 0.88)";
      ctx.strokeStyle = borderHex || "#ff5f91";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 56, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 37);

      const tex = new T.CanvasTexture(cvs);
      const mat = new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const sp = new T.Sprite(mat);
      sp.scale.set(1.55, 0.44, 1);
      sp.position.set(0, 2.05, 0);
      return sp;
    }

    _createChibiMesh(cfg, labelText, labelColor) {
      const T = window.THREE;
      const root = new T.Group();

      // Shadow disc
      const shadow = new T.Mesh(
        new T.CircleGeometry(0.38, 16),
        new T.MeshBasicMaterial({ color: 0x05030a, transparent: true, opacity: 0.55 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      root.add(shadow);

      const bodyPivot = new T.Group();
      root.add(bodyPivot);

      // Legs
      const legMat = new T.MeshStandardMaterial({ color: 0x221b2e });
      const legL = new T.Mesh(new T.CylinderGeometry(0.08, 0.07, 0.38, 10), legMat);
      const legR = legL.clone();
      legL.position.set(-0.12, 0.19, 0);
      legR.position.set(0.12, 0.19, 0);
      bodyPivot.add(legL, legR);

      // Torso / Maid Dress Cone
      const dressGeo = cfg.type === "manager"
        ? new T.CylinderGeometry(0.23, 0.21, 0.62, 14)
        : new T.CylinderGeometry(0.18, 0.36, 0.62, 16);
      const dress = new T.Mesh(dressGeo, new T.MeshStandardMaterial({ color: cfg.body, roughness: 0.5 }));
      dress.position.y = 0.64;
      dress.castShadow = true;
      bodyPivot.add(dress);

      // Cute Maid Apron / Accent Ribbon
      const apron = new T.Mesh(
        new T.BoxGeometry(0.28, 0.44, 0.14),
        new T.MeshStandardMaterial({ color: cfg.apron || 0xffffff, roughness: 0.4 })
      );
      apron.position.set(0, 0.62, 0.18);
      bodyPivot.add(apron);

      // Arms
      const armMat = new T.MeshStandardMaterial({ color: cfg.skin || 0xffe0d0 });
      const armL = new T.Mesh(new T.CylinderGeometry(0.06, 0.055, 0.4, 10), armMat);
      const armR = armL.clone();
      armL.position.set(-0.28, 0.72, 0.04);
      armL.rotation.z = 0.32;
      armR.position.set(0.28, 0.72, 0.04);
      armR.rotation.z = -0.32;
      bodyPivot.add(armL, armR);

      // Chibi Big Head + Eyes
      const headGroup = new T.Group();
      headGroup.position.y = 1.24;
      bodyPivot.add(headGroup);

      const head = new T.Mesh(
        new T.SphereGeometry(0.32, 20, 18),
        new T.MeshStandardMaterial({ color: cfg.skin || 0xffe4d4, roughness: 0.45 })
      );
      head.castShadow = true;
      headGroup.add(head);

      const eyeMat = new T.MeshBasicMaterial({ color: cfg.accent || 0x24182e });
      const eyeL = new T.Mesh(new T.SphereGeometry(0.048, 10, 10), eyeMat);
      const eyeR = eyeL.clone();
      eyeL.position.set(-0.11, -0.02, 0.285);
      eyeR.position.set(0.11, -0.02, 0.285);
      headGroup.add(eyeL, eyeR);

      // Hair Cap + Distinct Character Silhouette!
      const hairMat = new T.MeshStandardMaterial({ color: cfg.hair, roughness: 0.4 });
      const hairCap = new T.Mesh(
        new T.SphereGeometry(0.34, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
        hairMat
      );
      hairCap.position.y = 0.03;
      headGroup.add(hairCap);

      if (cfg.type === "twintail") {
        // Mahiru's Black-Pink Twin-tails
        const tailMat = new T.MeshStandardMaterial({ color: 0xff4785 });
        const tL = new T.Mesh(new T.ConeGeometry(0.13, 0.62, 12), tailMat);
        const tR = tL.clone();
        tL.position.set(-0.34, -0.1, -0.04);
        tL.rotation.z = -0.35;
        tR.position.set(0.34, -0.1, -0.04);
        tR.rotation.z = 0.35;
        headGroup.add(tL, tR);
      } else if (cfg.type === "long") {
        // Reine's Long Visual-Kei Hime Hair
        const backHair = new T.Mesh(new T.BoxGeometry(0.56, 0.72, 0.2), hairMat);
        backHair.position.set(0, -0.24, -0.18);
        headGroup.add(backHair);
      } else if (cfg.type === "buns") {
        // Millie's Space Buns + Glowing Cyan/Pink Cat-Ear Headphones
        const bunL = new T.Mesh(new T.SphereGeometry(0.13, 12, 12), new T.MeshStandardMaterial({ color: 0x5ef2a8 }));
        const bunR = bunL.clone();
        bunL.position.set(-0.26, 0.28, 0);
        bunR.position.set(0.26, 0.28, 0);
        const earMat = new T.MeshStandardMaterial({ color: 0xff5f9f, emissive: 0xff4791, emissiveIntensity: 0.9 });
        const earL = new T.Mesh(new T.ConeGeometry(0.09, 0.2, 4), earMat);
        const earR = earL.clone();
        earL.position.set(-0.2, 0.42, 0.05);
        earR.position.set(0.2, 0.42, 0.05);
        headGroup.add(bunL, bunR, earL, earR);
      } else if (cfg.type === "wolf") {
        // Kohaku's Pink-tipped Blonde Wolf-cut
        const flare = new T.Mesh(
          new T.ConeGeometry(0.36, 0.35, 12),
          new T.MeshStandardMaterial({ color: 0xff4f9a })
        );
        flare.position.set(0, -0.12, -0.06);
        headGroup.add(flare);
      }

      if (labelText) {
        root.add(this._makeLabelSprite(labelText, labelColor));
      }

      root.userData = { bodyPivot, legL, legR, armL, armR, headGroup };
      this.scene.add(root);
      return root;
    }

    _buildStaff() {
      const defs = [
        { id: "luchen", color: "#70b5ff", start: WAYPOINTS.barIn },
        { id: "mahiru", color: "#ff5f91", start: WAYPOINTS.chekiBooth },
        { id: "reine",  color: "#ab75ff", start: WAYPOINTS.stageCenter },
        { id: "kohaku", color: "#e9c76d", start: WAYPOINTS.tables[0] },
        { id: "millie", color: "#7fe0a3", start: WAYPOINTS.nook }
      ];
      defs.forEach((d, idx) => {
        const style = CHAR_STYLES[d.id];
        const mesh = this._createChibiMesh(style, style.name, d.color);
        mesh.position.set(d.start.x, d.start.y, d.start.z);
        this.staffActors.set(d.id, {
          id: d.id,
          mesh,
          target: { ...d.start },
          speed: 2.6,
          waitTimer: idx * 0.7,
          role: "idle",
          phaseSeed: idx * 1.5
        });
      });
    }

    _spawnGuest(initialRandom) {
      if (this.guests.length >= 9) return;
      const pal = GUEST_PALETTES[Math.floor(Math.random() * GUEST_PALETTES.length)];
      const mesh = this._createChibiMesh(
        { body: pal.body, apron: pal.glow, skin: 0xffdfc8, hair: pal.hair, type: "guest" },
        pal.tag,
        "#70b5ff"
      );
      // Glowstick in right hand for evening concerts!
      const T = window.THREE;
      const stick = new T.Mesh(
        new T.CylinderGeometry(0.03, 0.03, 0.34, 8),
        new T.MeshStandardMaterial({ color: pal.glow, emissive: pal.glow, emissiveIntensity: 1.0 })
      );
      stick.position.set(0, -0.18, 0.1);
      stick.rotation.x = Math.PI / 3;
      mesh.userData.armR.add(stick);
      mesh.userData.glowstick = stick;

      const startPos = initialRandom
        ? WAYPOINTS.tables[Math.floor(Math.random() * WAYPOINTS.tables.length)]
        : WAYPOINTS.door;
      mesh.position.set(startPos.x, startPos.y, startPos.z);

      const dest = this._pickGuestDestination();
      this.guests.push({
        mesh,
        state: initialRandom ? "enjoying" : "entering",
        target: dest.pos,
        activity: dest.kind,
        timer: 2.5 + Math.random() * 3.5,
        speed: 2.2 + Math.random() * 0.5,
        seed: Math.random() * 6.28
      });
    }

    _pickGuestDestination() {
      if (this.currentFocus === "evening") {
        const sp = WAYPOINTS.crowdSpots[Math.floor(Math.random() * WAYPOINTS.crowdSpots.length)];
        return { kind: "concert", pos: { x: sp.x + (Math.random() - 0.5) * 0.5, y: 0, z: sp.z + (Math.random() - 0.5) * 0.4 } };
      }
      if (this.lastOptId.includes("cheki") || (this.currentFocus === "afternoon" && Math.random() < 0.45)) {
        return { kind: "cheki", pos: { x: WAYPOINTS.chekiGuest.x + (Math.random() - 0.5) * 0.6, y: 0.35, z: WAYPOINTS.chekiGuest.z } };
      }
      const tb = WAYPOINTS.tables[Math.floor(Math.random() * WAYPOINTS.tables.length)];
      return { kind: "table", pos: { x: tb.x + (Math.random() - 0.5) * 0.9, y: 0, z: tb.z + 0.55 } };
    }

    syncWithGameState(gameState, gameData, optId) {
      if (!this.scene) return;
      if (optId) this.lastOptId = optId;
      this.currentFocus = gameState.phase;

      const labelEl = document.getElementById("sim3d-mode-label");
      const phaseNames = {
        roster: "3D 店铺早会备场 · 切换右侧出勤/休假实时生效",
        morning: "3D 晨间特训实况 · 妹妹们正在店内训练涨技能",
        afternoon: "3D 午市营业实况 · 顾客进店点餐 & 2F拍切爆金币",
        evening: "3D B1 地下 Live 演出实况 · 全场挥舞荧光棒打Call！",
        night: "3D 打烊收尾与夜间社媒引流"
      };
      if (labelEl) labelEl.textContent = phaseNames[gameState.phase] || "3D 店铺实时经营箱庭";

      // Update staff visibility (resting staff go home!) & assign active station waypoints
      ["mahiru", "reine", "kohaku", "millie"].forEach((cid) => {
        const chData = gameData.characters[cid];
        const actor = this.staffActors.get(cid);
        if (!actor || !chData) return;
        actor.mesh.visible = !!chData.onDuty;
        if (!chData.onDuty) return;

        if (gameState.phase === "evening") {
          // Evening Livehouse concert formation!
          const stageMap = {
            reine: WAYPOINTS.stageCenter,
            mahiru: WAYPOINTS.stageLeft,
            kohaku: { x: 5.4, y: 0.35, z: 1.1 },
            millie: { x: 4.3, y: 0.35, z: 0.1 }
          };
          actor.target = { ...stageMap[cid] };
          actor.role = "performing";
        } else if (gameState.phase === "morning") {
          const trainMap = {
            kohaku: WAYPOINTS.barFront,
            reine: { x: -1.8, y: 0, z: -1.6 },
            mahiru: WAYPOINTS.chekiBooth,
            millie: WAYPOINTS.nook
          };
          actor.target = { ...trainMap[cid] };
          actor.role = "training";
        } else {
          // Afternoon service patrol
          const workMap = {
            mahiru: WAYPOINTS.chekiBooth,
            kohaku: WAYPOINTS.tables[0],
            reine: WAYPOINTS.barFront,
            millie: WAYPOINTS.nook
          };
          actor.target = { ...workMap[cid] };
          actor.role = cid === "kohaku" ? "serving" : cid === "mahiru" ? "cheki" : "working";
        }
      });

      // Lu Chen watches from front-row welded chair during evening Live, otherwise tends espresso bar!
      const lu = this.staffActors.get("luchen");
      if (lu) {
        lu.target = gameState.phase === "evening"
          ? { x: 4.2, y: 0, z: 2.75 }
          : { ...WAYPOINTS.barIn };
      }

      // Burst of new customers when running an operation
      if (optId) {
        for (let i = 0; i < 3; i++) this._spawnGuest(false);
        this.spawnFloatingPopup(0, 2.2, 0, "✨ 营业指令已下达！客流涌入中", "#ffd97d");
      }
    }

    setVisible(flag) {
      this.visible = !!flag;
      if (this.container) {
        this.container.classList.toggle("active", this.visible);
      }
      if (this.visible) this.resize();
    }

    spawnFloatingPopup(wx, wy, wz, text, color) {
      if (!this.popupLayer || !this.camera || !this.visible) return;
      const T = window.THREE;
      const v = new T.Vector3(wx, wy, wz);
      v.project(this.camera);
      if (v.z > 1) return;
      const w = this.container.clientWidth || 800;
      const h = this.container.clientHeight || 500;
      const sx = (v.x * 0.5 + 0.5) * w;
      const sy = (-v.y * 0.5 + 0.5) * h;

      const el = document.createElement("div");
      el.className = "sim3d-float-tag";
      el.style.left = `${sx.toFixed(0)}px`;
      el.style.top = `${sy.toFixed(0)}px`;
      el.style.color = color || "#7fe0a3";
      el.textContent = text;
      this.popupLayer.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }

    _moveActor(mesh, target, speed, dt, walkSeed, clock, isDancing) {
      const dx = target.x - mesh.position.x;
      const dz = target.z - mesh.position.z;
      const dy = (target.y || 0) - mesh.position.y;
      const dist = Math.hypot(dx, dz);
      const u = mesh.userData;

      mesh.position.y += dy * Math.min(1, dt * 8);

      if (dist > 0.08) {
        const step = Math.min(dist, speed * dt);
        mesh.position.x += (dx / dist) * step;
        mesh.position.z += (dz / dist) * step;
        const targetAngle = Math.atan2(dx, dz);
        mesh.rotation.y = targetAngle;

        // Cute brisk chibi waddle walk cycle
        const w = clock * 13 + walkSeed;
        u.bodyPivot.position.y = Math.abs(Math.sin(w)) * 0.11;
        u.bodyPivot.rotation.z = Math.sin(w) * 0.08;
        u.legL.rotation.x = Math.sin(w) * 0.65;
        u.legR.rotation.x = -Math.sin(w) * 0.65;
        u.armL.rotation.x = -Math.sin(w) * 0.55;
        u.armR.rotation.x = Math.sin(w) * 0.55;
        return false; // still walking
      } else {
        // Arrived: face forward or dance/cheer!
        if (isDancing === "perform") {
          mesh.rotation.y = 0; // face crowd
          const b = clock * 9 + walkSeed;
          u.bodyPivot.position.y = Math.abs(Math.sin(b)) * 0.18;
          u.armL.rotation.x = -2.2 + Math.sin(b) * 0.4;
          u.armR.rotation.x = -2.2 - Math.sin(b) * 0.4;
          u.headGroup.rotation.z = Math.sin(b * 0.5) * 0.14;
        } else if (isDancing === "cheer") {
          mesh.rotation.y = Math.PI; // face stage
          const b = clock * 10 + walkSeed;
          u.bodyPivot.position.y = Math.abs(Math.sin(b)) * 0.12;
          u.armR.rotation.x = -2.5 + Math.sin(b) * 0.55; // wave glowstick!
        } else {
          mesh.rotation.y += (0 - mesh.rotation.y) * Math.min(1, dt * 5);
          u.bodyPivot.position.y = Math.sin(clock * 3.2 + walkSeed) * 0.03;
          u.bodyPivot.rotation.z = 0;
          u.legL.rotation.x = 0;
          u.legR.rotation.x = 0;
          u.armL.rotation.x = Math.sin(clock * 2.5 + walkSeed) * 0.12;
          u.armR.rotation.x = -Math.sin(clock * 2.5 + walkSeed) * 0.12;
        }
        return true; // arrived
      }
    }

    _animate(ts) {
      const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) * 0.001));
      this.lastTs = ts;
      this.clock += dt;

      if (this.visible && this.renderer) {
        // Update Orbit Camera
        const cx = Math.sin(this.yaw) * Math.cos(this.pitch) * this.dist;
        const cy = Math.sin(this.pitch) * this.dist;
        const cz = Math.cos(this.yaw) * Math.cos(this.pitch) * this.dist;
        this.camera.position.set(cx, Math.max(3.5, cy), cz + 0.6);
        this.camera.lookAt(0.2, 0.9, 0.4);

        // Animate stage spotlights & LED glitch screen
        this.spotLights.forEach((lt, idx) => {
          lt.intensity = (this.currentFocus === "evening" ? 2.4 : 1.1) + Math.sin(this.clock * 5 + idx * 2) * 0.45;
        });
        if (this.ledScreen) {
          const hue = (this.clock * 0.12) % 1;
          this.ledScreen.material.emissive.setHSL(0.75 + Math.sin(hue * 6.28) * 0.12, 0.85, 0.45);
        }
        if (this.flashTimer > 0) {
          this.flashTimer -= dt;
          this.chekiFlashLight.intensity = 1.4 + this.flashTimer * 14.0;
        }

        // Update Staff Patrol & Choreography
        this.staffActors.forEach((st) => {
          if (!st.mesh.visible) return;
          const danceMode = st.role === "performing" ? "perform" : null;
          const arrived = this._moveActor(st.mesh, st.target, st.speed, dt, st.phaseSeed, this.clock, danceMode);
          if (arrived && st.role === "serving") {
            st.waitTimer -= dt;
            if (st.waitTimer <= 0) {
              st.waitTimer = 2.6 + Math.random() * 1.8;
              // Kohaku walks back and forth between espresso bar and tables delivering omurice!
              const nextSpots = [WAYPOINTS.barFront, ...WAYPOINTS.tables];
              const pick = nextSpots[Math.floor(Math.random() * nextSpots.length)];
              st.target = { x: pick.x + 0.55, y: 0, z: pick.z };
            }
          }
        });

        // Spawn & Update Guests walking in, ordering, taking Polaroids, cheering & paying!
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnTimer = this.currentFocus === "evening" ? 1.6 : 2.5;
          this._spawnGuest(false);
        }

        for (let i = this.guests.length - 1; i >= 0; i--) {
          const g = this.guests[i];
          g.mesh.userData.glowstick.visible = g.activity === "concert" || this.currentFocus === "evening";
          const dance = g.state === "enjoying" && g.activity === "concert" ? "cheer" : null;
          const arrived = this._moveActor(g.mesh, g.target, g.speed, dt, g.seed, this.clock, dance);

          if (arrived) {
            if (g.state === "entering") {
              g.state = "enjoying";
              if (g.activity === "cheki") {
                this.flashTimer = 0.35;
                this.spawnFloatingPopup(g.mesh.position.x, 2.1, g.mesh.position.z, "📸 咔嚓! 拍切特典 +¥280", "#ff8fb0");
              } else if (g.activity === "concert") {
                this.spawnFloatingPopup(g.mesh.position.x, 2.0, g.mesh.position.z, "🎤 打Call应援! 热度UP", "#c9a0f5");
              } else {
                this.spawnFloatingPopup(g.mesh.position.x, 1.9, g.mesh.position.z, "🍓 歪嘴猫蛋包饭♪", "#ffe7a8");
              }
            } else if (g.state === "enjoying") {
              g.timer -= dt;
              if (g.timer <= 0) {
                g.state = "leaving";
                g.target = { ...WAYPOINTS.door };
                const tip = g.activity === "cheki" ? "+¥420 💖" : g.activity === "concert" ? "+¥380 🔥" : "+¥180 ☕";
                this.spawnFloatingPopup(g.mesh.position.x, 2.1, g.mesh.position.z, tip, "#7fe0a3");
              }
            } else if (g.state === "leaving") {
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
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
      });
      window.addEventListener("mousemove", (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
        this.yaw = Math.max(-0.55, Math.min(1.35, this.yaw - dx * 0.006));
        this.pitch = Math.max(0.32, Math.min(1.15, this.pitch + dy * 0.005));
      });
      window.addEventListener("mouseup", () => {
        this.dragging = false;
      });
      dom.addEventListener("click", (e) => {
        e.stopPropagation();
        // Spawn a cheerful heart/coin reaction when player clicks the 3D cafe!
        this.spawnFloatingPopup((Math.random() - 0.5) * 4, 2.2, (Math.random() - 0.5) * 3, "💖 店长巡店督导中~", "#ff8fb0");
      });
      dom.addEventListener("wheel", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dist = Math.max(10.5, Math.min(23.0, this.dist + e.deltaY * 0.01));
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
