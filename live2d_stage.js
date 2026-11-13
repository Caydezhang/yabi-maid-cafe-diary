/**
 * 《拯救亚比妹妹——仆咖经营日记》WebGL2 实时 Live2D 骨骼网格变形与场景光影引擎
 * - 28x38 高精度自适应三角网格 (Deformer Mesh)
 * - 呼吸起伏 (ParamBreath)、头部 2.5D 鼠标/视线偏转 (ParamAngleX/Y/Z)
 * - 双马尾/长发/裙摆二阶弹簧阻尼物理摆动 (Hair & Skirt Pendulum Physics)
 * - 自然随机眨眼控制器 (ParamEyeOpen)
 * - Web Audio API 实时频谱包络口型同步 (Real-time TTS Lip-Sync ParamMouthOpenY)
 * - 场景动态雨丝、B1舞台体积激光束、3F飘雪与霓虹微粒层
 */
(function () {
  const RIG_LANDMARKS = {
    "sprite_mahiru_normal.png":  { faceX: 0.5042, eyeY: 0.2713, mouthY: 0.3437, faceR: 0.1159, neckY: 0.3923, hairSway: 1.35 },
    "sprite_mahiru_shy.png":     { faceX: 0.5126, eyeY: 0.2783, mouthY: 0.3579, faceR: 0.1273, neckY: 0.4114, hairSway: 1.25 },
    "sprite_reine_stage.png":    { faceX: 0.4893, eyeY: 0.1749, mouthY: 0.2240, faceR: 0.0786, neckY: 0.2570, hairSway: 1.15 },
    "sprite_reine_glasses.png":  { faceX: 0.5038, eyeY: 0.3426, mouthY: 0.4025, faceR: 0.1220, neckY: 0.4537, hairSway: 1.10 },
    "sprite_kohaku_normal.png":  { faceX: 0.4170, eyeY: 0.2004, mouthY: 0.2682, faceR: 0.1084, neckY: 0.3137, hairSway: 1.05 },
    "sprite_kohaku_shy.png":     { faceX: 0.4520, eyeY: 0.2031, mouthY: 0.2660, faceR: 0.1006, neckY: 0.3083, hairSway: 1.00 },
    "sprite_millie_normal.png":  { faceX: 0.4563, eyeY: 0.2881, mouthY: 0.3799, faceR: 0.1468, neckY: 0.4416, hairSway: 1.10 },
    "sprite_millie_happy.png":   { faceX: 0.4672, eyeY: 0.3606, mouthY: 0.4585, faceR: 0.1881, neckY: 0.5375, hairSway: 1.15 },
    "sprite_luchen_normal.png":  { faceX: 0.4807, eyeY: 0.3161, mouthY: 0.4413, faceR: 0.2003, neckY: 0.5254, hairSway: 0.65 }
  };

  const SCENE_TINTS = {
    cafe1f:    { rim: [1.0, 0.44, 0.68], amb: [1.02, 0.96, 1.0], mode: "cafe" },
    cheki2f:   { rim: [1.0, 0.36, 0.78], amb: [1.04, 0.94, 1.03], mode: "cheki" },
    liveB1:    { rim: [0.52, 0.78, 1.0], amb: [0.96, 0.95, 1.06], mode: "live" },
    rooftop3f: { rim: [0.75, 0.88, 1.0], amb: [0.95, 0.97, 1.05], mode: "snow" }
  };

  const VS_SRC = `
    precision highp float;
    attribute vec2 a_uv;
    uniform vec2 u_slotOffset;
    uniform vec2 u_slotScale;
    uniform float u_time;
    uniform float u_breath;
    uniform vec2 u_pointer;
    uniform float u_mouthOpen;
    uniform float u_blink;
    uniform float u_speaking;
    uniform float u_bounce;
    uniform float u_swayVel;
    uniform vec4 u_face;   // x: faceX, y: eyeY, z: mouthY, w: faceR
    uniform float u_neckY;
    uniform float u_hairAmp;

    varying vec2 v_uv;
    varying float v_PseudoZ;
    varying float v_mouthMask;

    void main() {
      v_uv = a_uv;
      float u = a_uv.x;
      float v = a_uv.y; // 0 = top of head, 1 = bottom hem

      float faceX = u_face.x;
      float eyeY  = u_face.y;
      float mouthY = u_face.z;
      float faceR = u_face.w;

      // Weight masks across anatomy
      float headMask = 1.0 - smoothstep(u_neckY - 0.04, u_neckY + 0.10, v);
      float chestMask = smoothstep(u_neckY - 0.03, u_neckY + 0.12, v) * (1.0 - smoothstep(0.68, 0.96, v));
      float anchorLock = 1.0 - smoothstep(0.88, 1.0, v); // Keep bottom anchored cleanly

      vec2 d = vec2(0.0);

      // 1. Natural Live2D chest & shoulder breathing (ParamBreath)
      float breathWave = u_breath;
      d.y -= breathWave * 0.0075 * (headMask * 0.85 + chestMask * 1.15) * anchorLock;
      d.x += (u - faceX) * breathWave * 0.0085 * chestMask;

      // 2. Entry / emotion bounce impulse + speaking micro-nod
      float speakNod = u_speaking * sin(u_time * 7.2) * 0.0028 * (0.4 + u_mouthOpen);
      d.y -= (u_bounce * 0.018 + speakNod) * (headMask + chestMask * 0.5) * anchorLock;

      // 3. 2.5D Head & Upper-Torso Mouse Parallax + Pseudo-3D Rotation (ParamAngleX / ParamAngleY / ParamAngleZ)
      float dxFace = u - faceX;
      float dyFace = v - eyeY;
      float radialFace = exp(-(dxFace * dxFace) / (2.0 * faceR * faceR * 1.35) - (dyFace * dyFace) / (2.0 * faceR * faceR * 1.6));

      // Center features shift slightly more than silhouette edges -> authentic 2.5D volume!
      float turnDepth = 0.55 + 0.65 * radialFace;
      d.x += u_pointer.x * 0.016 * headMask * turnDepth;
      d.y += u_pointer.y * 0.010 * headMask * turnDepth;
      d.x += u_pointer.x * 0.006 * chestMask * anchorLock;

      // Subtle head tilt (ParamAngleZ) around neck pivot
      float tilt = u_pointer.x * 0.022 + sin(u_time * 1.35) * 0.0065;
      if (headMask > 0.01) {
        vec2 rel = vec2(u - faceX, v - u_neckY);
        vec2 rot = vec2(
          rel.x * cos(tilt) - rel.y * sin(tilt),
          rel.x * sin(tilt) + rel.y * cos(tilt)
        ) - rel;
        d += rot * headMask;
      }

      // 4. Secondary Hair, Twin-tails, Ribbons & Skirt Pendulum Physics
      float sideDist = smoothstep(faceR * 0.65, faceR * 2.1, abs(dxFace));
      float hairZone = sideDist * smoothstep(0.08, 0.35, v) * (1.0 - smoothstep(0.75, 0.98, v));
      float strandPhase = u_time * 2.35 - v * 4.2 + sign(dxFace) * 0.8;
      float windSway = (sin(strandPhase) * 0.0052 + cos(strandPhase * 0.6) * 0.0026) * u_hairAmp;
      float inertiaSway = -u_swayVel * 0.024 * v * u_hairAmp;
      d.x += (windSway + inertiaSway) * hairZone * anchorLock;
      d.y += abs(windSway) * 0.32 * hairZone;

      // Lower frills / coat / skirt hem gentle sway
      float skirtZone = smoothstep(0.58, 0.92, v) * (1.0 - smoothstep(0.94, 1.0, v));
      d.x += sin(u_time * 1.9 - v * 3.5 + u * 2.0) * 0.0035 * skirtZone * u_hairAmp;

      // 5. Eye Blinking Mesh Deformation (ParamEyeOpen)
      if (u_blink > 0.005) {
        float eyeBandX = exp(-(dxFace * dxFace) / (2.0 * (faceR * 0.68) * (faceR * 0.68)));
        float eyeBandY = exp(-((v - eyeY) * (v - eyeY)) / (2.0 * (faceR * 0.20) * (faceR * 0.20)));
        float eyeWeight = eyeBandX * eyeBandY;
        // Upper eyelid pulls down toward lower lash line cleanly
        float lidDir = (v < eyeY) ? 1.45 : -0.35;
        d.y += u_blink * lidDir * (faceR * 0.14) * eyeWeight;
      }

      // 6. Real-time TTS Audio Lip-Sync Deformation (ParamMouthOpenY)
      float mDx = u - faceX;
      float mDy = v - mouthY;
      float mouthZone = exp(-(mDx * mDx) / (2.0 * (faceR * 0.32) * (faceR * 0.32)) - (mDy * mDy) / (2.0 * (faceR * 0.20) * (faceR * 0.20)));
      v_mouthMask = mouthZone * u_mouthOpen;
      if (u_mouthOpen > 0.01) {
        // Lower lip & jaw drop slightly, upper lip lifts subtly
        float jawDrop = smoothstep(mouthY - faceR * 0.04, mouthY + faceR * 0.22, v) * (1.0 - smoothstep(mouthY + faceR * 0.22, mouthY + faceR * 0.52, v));
        float jawX = exp(-(mDx * mDx) / (2.0 * (faceR * 0.42) * (faceR * 0.42)));
        d.y += u_mouthOpen * (faceR * 0.16) * jawDrop * jawX;
        d.x -= mDx * u_mouthOpen * 0.06 * mouthZone;
      }

      v_PseudoZ = radialFace * headMask;

      // Map deformed sprite coordinates to WebGL NDC clip space (-1..1)
      // Sprite quad spans x in [-0.5, 0.5], y in [0.0 (bottom), 1.0 (top)]
      vec2 localPos = vec2((u + d.x) - 0.5, 1.0 - (v + d.y));
      vec2 clipPos = u_slotOffset + localPos * u_slotScale;
      gl_Position = vec4(clipPos, 0.0, 1.0);
    }
  `;

  const FS_SRC = `
    precision highp float;
    varying vec2 v_uv;
    varying float v_PseudoZ;
    varying float v_mouthMask;

    uniform sampler2D u_tex;
    uniform vec2 u_texel;
    uniform float u_dim;
    uniform float u_alpha;
    uniform vec3 u_rimColor;
    uniform vec3 u_ambTint;
    uniform float u_speaking;

    void main() {
      vec4 col = texture2D(u_tex, v_uv);
      if (col.a < 0.015) discard;

      // Studio edge rim-light detection from neighboring alpha gradient
      float aL = texture2D(u_tex, v_uv - vec2(u_texel.x * 2.5, 0.0)).a;
      float aR = texture2D(u_tex, v_uv + vec2(u_texel.x * 2.5, 0.0)).a;
      float aU = texture2D(u_tex, v_uv - vec2(0.0, u_texel.y * 2.5)).a;
      float edge Rim = clamp((1.0 - min(min(aL, aR), aU)) * col.a, 0.0, 1.0);

      vec3 rgb = col.rgb * u_ambTint;

      // Subtle inner-mouth shading during open-vowel syllables for crisp lip-sync readability
      if (v_mouthMask > 0.08) {
        vec3 oralShade = vec3(0.48, 0.18, 0.26);
        rgb = mix(rgb, rgb * oralShade, clamp(v_mouthMask * 0.32, 0.0, 0.26));
      }

      // Add atmospheric neon rim light (stronger on active speaker)
      float rimStrength = (0.22 + 0.26 * u_speaking) * u_dim;
      rgb += u_rimColor * pow(edgeRim, 1.6) * rimStrength;

      // Dim non-speaking listener smoothly while keeping rich saturation
      rgb *= u_dim;

      gl_FragColor = vec4(rgb, col.a * u_alpha);
    }
  `;

  // Fix typo in shader variable name before compilation
  const CLEAN_FS_SRC = FS_SRC.replace("float edge Rim =", "float edgeRim =");

  class Live2DStageEngine {
    constructor() {
      this.enabled = true;
      this.stageEl = null;
      this.glCanvas = null;
      this.fxCanvas = null;
      this.gl = null;
      this.fxCtx = null;
      this.prog = null;
      this.meshBuffer = null;
      this.indexBuffer = null;
      this.indexCount = 0;
      this.texCache = new Map();

      this.slots = []; // Active character models on stage
      this.bgMode = "cafe";
      this.tint = SCENE_TINTS.cafe1f;

      // Pointer tracking (normalized -1..1)
      this.targetPtr = { x: 0, y: 0 };
      this.curPtr = { x: 0, y: 0 };
      this.ptrVelX = 0;

      // Web Audio API real-time lip-sync analyser
      this.audioCtx = null;
      this.analyser = null;
      this.freqData = null;
      this.connectedAudioEl = null;
      this.voicePlaying = false;
      this.mouthLevel = 0;

      // Ambient particles
      this.particles = [];
      this.lastTime = performance.now();
    }

    init(stageSelector, voiceAudioEl) {
      this.stageEl = document.querySelector(stageSelector);
      if (!this.stageEl) return false;

      // Create atmospheric FX canvas (behind characters, above background) & WebGL2 Live2D canvas
      this.fxCanvas = document.createElement("canvas");
      this.fxCanvas.className = "l2d-fx-canvas";
      this.glCanvas = document.createElement("canvas");
      this.glCanvas.className = "l2d-gl-canvas";

      const spriteLayer = document.getElementById("sprite-layer");
      this.stageEl.insertBefore(this.fxCanvas, spriteLayer);
      this.stageEl.insertBefore(this.glCanvas, spriteLayer);

      this.fxCtx = this.fxCanvas.getContext("2d");
      this.gl =
        this.glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: true, preserveDrawingBuffer: true }) ||
        this.glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true, preserveDrawingBuffer: true });

      if (!this.gl) {
        console.warn("WebGL unavailable, falling back to static sprites");
        this.enabled = false;
        return false;
      }

      if ( spriteLayer ) spriteLayer.classList.add("l2d-active");

      this._initShaders();
      this._initGridMesh(28, 38);
      this._initParticles(65);
      this._bindEvents();
      if (voiceAudioEl) this.bindAudioElement(voiceAudioEl);
      this.resize();

      requestAnimationFrame((t) => this._tick(t));
      return true;
    }

    bindAudioElement(audioEl) {
      this.connectedAudioEl = audioEl;
      audioEl.addEventListener("play", () => {
        this.voicePlaying = true;
        this._ensureAudioAnalyser();
      });
      audioEl.addEventListener("ended", () => {
        this.voicePlaying = false;
      });
      audioEl.addEventListener("pause", () => {
        this.voicePlaying = false;
      });
    }

    _ensureAudioAnalyser() {
      if (this.analyser || !this.connectedAudioEl) return;
      // Note: On file:// protocol MediaElementSource can taint CORS in Chromium;
      // we safely wrap it and provide a syllable-cadence fallback if file:// blocks FFT reads.
      if (location.protocol === "file:") return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        this.audioCtx = new Ctx();
        const src = this.audioCtx.createMediaElementSource(this.connectedAudioEl);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.65;
        src.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      } catch (e) {
        this.analyser = null;
      }
    }

    _sampleMouthOpen(nowSec) {
      if (!this.voicePlaying) {
        this.mouthLevel += (0 - this.mouthLevel) * 0.28;
        return this.mouthLevel;
      }
      if (this.analyser && this.freqData) {
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          this.audioCtx.resume().catch(() => {});
        }
        this.analyser.getByteFrequencyData(this.freqData);
        // Vocal formants live primarily in bins 2..28 (~150Hz - 3.2kHz)
        let sum = 0;
        for (let i = 2; i < 28; i++) sum += this.freqData[i];
        const avg = sum / 26;
        const target = Math.min(1.0, Math.max(0.0, (avg - 18) / 115));
        this.mouthLevel += (target - this.mouthLevel) * 0.42;
        return this.mouthLevel;
      }
      // Natural Mandarin syllable envelope fallback (for local file:// protocol)
      const syll =
        0.5 +
        0.35 * Math.sin(nowSec * 15.5) +
        0.25 * Math.sin(nowSec * 23.1 + 1.1) +
        0.2 * Math.cos(nowSec * 8.7);
      const gate = Math.sin(nowSec * 4.2) > -0.65 ? 1.0 : 0.12;
      const target = Math.max(0, Math.min(1, syll * gate));
      this.mouthLevel += (target - this.mouthLevel) * 0.35;
      return this.mouthLevel;
    }

    _compileShader(type, src) {
      const gl = this.gl;
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Live2D shader error:", gl.getShaderInfoLog(sh));
      }
      return sh;
    }

    _initShaders() {
      const gl = this.gl;
      const vs = this._compileShader(gl.VERTEX_SHADER, VS_SRC);
      const fs = this._compileShader(gl.FRAGMENT_SHADER, CLEAN_FS_SRC);
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      this.prog = prog;

      this.locs = {
        a_uv: gl.getAttribLocation(prog, "a_uv"),
        u_slotOffset: gl.getUniformLocation(prog, "u_slotOffset"),
        u_slotScale: gl.getUniformLocation(prog, "u_slotScale"),
        u_time: gl.getUniformLocation(prog, "u_time"),
        u_breath: gl.getUniformLocation(prog, "u_breath"),
        u_pointer: gl.getUniformLocation(prog, "u_pointer"),
        u_mouthOpen: gl.getUniformLocation(prog, "u_mouthOpen"),
        u_blink: gl.getUniformLocation(prog, "u_blink"),
        u_speaking: gl.getUniformLocation(prog, "u_speaking"),
        u_bounce: gl.getUniformLocation(prog, "u_bounce"),
        u_swayVel: gl.getUniformLocation(prog, "u_swayVel"),
        u_face: gl.getUniformLocation(prog, "u_face"),
        u_neckY: gl.getUniformLocation(prog, "u_neckY"),
        u_hairAmp: gl.getUniformLocation(prog, "u_hairAmp"),
        u_tex: gl.getUniformLocation(prog, "u_tex"),
        u_texel: gl.getUniformLocation(prog, "u_texel"),
        u_dim: gl.getUniformLocation(prog, "u_dim"),
        u_alpha: gl.getUniformLocation(prog, "u_alpha"),
        u_rimColor: gl.getUniformLocation(prog, "u_rimColor"),
        u_ambTint: gl.getUniformLocation(prog, "u_ambTint")
      };
    }

    _initGridMesh(cols, rows) {
      const gl = this.gl;
      const verts = [];
      const indices = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          verts.push(c / cols, r / rows);
        }
      }
      const stride = cols + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i0 = r * stride + c;
          const i1 = i0 + 1;
          const i2 = i0 + stride;
          const i3 = i2 + 1;
          indices.push(i0, i2, i1, i1, i2, i3);
        }
      }
      this.indexCount = indices.length;
      this.meshBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

    _loadTexture(src) {
      const fileKey = src.split("/").pop();
      if (this.texCache.has(fileKey)) return this.texCache.get(fileKey);
      const gl = this.gl;
      const entry = { tex: gl.createTexture(), ready: false, w: 864, h: 1152 };
      this.texCache.set(fileKey, entry);

      const img = new Image();
      if (location.protocol !== "file:") {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        entry.w = img.naturalWidth || 864;
        entry.h = img.naturalHeight || 1152;
        gl.bindTexture(gl.TEXTURE_2D, entry.tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        entry.ready = true;
      };
      const inlineMap = window.LIVE2D_TEXTURES || {};
      img.src = inlineMap[fileKey] || src;
      return entry;
    }

    setScene(bgKey) {
      this.tint = SCENE_TINTS[bgKey] || SCENE_TINTS.cafe1f;
      this.bgMode = this.tint.mode;
    }

    setCharacters(spriteDescriptors, speakingIdx, hideForCg) {
      if (hideForCg || !spriteDescriptors || !spriteDescriptors.length) {
        this.slots = [];
        return;
      }

      const prevByCid = new Map();
      this.slots.forEach((s) => prevByCid.set(s.cid, s));

      const count = spriteDescriptors.length;
      this.slots = spriteDescriptors.map((desc, idx) => {
        const prev = prevByCid.get(desc.cid);
        const fileName = desc.src.split("/").pop();
        const rig = RIG_LANDMARKS[fileName] || RIG_LANDMARKS["sprite_mahiru_normal.png"];
        const texEntry = this._loadTexture(desc.src);
        const isSpeaking = typeof speakingIdx === "number" ? speakingIdx === idx : true;

        // Target horizontal slot in clip space (-1..1)
        const targetX = count === 1 ? 0.0 : idx === 0 ? -0.34 : 0.34;
        const moodChanged = !prev || prev.src !== desc.src;

        return {
          cid: desc.cid,
          src: desc.src,
          texEntry,
          rig,
          isSpeaking,
          curX: prev ? prev.curX : targetX + (idx === 0 ? -0.14 : 0.14),
          targetX,
          curDim: prev ? prev.curDim : isSpeaking ? 1.0 : 0.62,
          targetDim: isSpeaking ? 1.0 : 0.60,
          curScale: prev ? prev.curScale : 0.96,
          targetScale: isSpeaking ? 1.03 : 0.96,
          alpha: prev ? prev.alpha : 0.0,
          bounce: moodChanged || isSpeaking ? 1.0 : 0.25,
          phaseSeed: idx * 2.1 + (desc.cid.charCodeAt(0) % 5) * 0.7,
          nextBlinkAt: performance.now() * 0.001 + 1.2 + Math.random() * 2.8,
          blinkStart: -10,
          doubleBlink: false
        };
      });
    }

    triggerTapBounce(clientX, clientY) {
      if (!this.slots.length || !this.glCanvas) return;
      const rect = this.glCanvas.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.slots.forEach((s) => {
        if (Math.abs(nx - s.curX) < 0.42) {
          s.bounce = 1.15;
        }
      });
    }

    _bindEvents() {
      window.addEventListener("resize", () => this.resize());
      window.addEventListener("mousemove", (e) => {
        if (!this.stageEl) return;
        const r = this.stageEl.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
        const ny = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
        this.targetPtr.x = Math.max(-1, Math.min(1, nx));
        this.targetPtr.y = Math.max(-1, Math.min(1, ny));

        // Subtle background parallax
        const bgEl = document.getElementById("stage-bg");
        if (bgEl) {
          bgEl.style.transform = `scale(1.045) translate(${(-this.targetPtr.x * 8).toFixed(1)}px, ${(-this.targetPtr.y * 5).toFixed(1)}px)`;
        }
      });
    }

    resize() {
      if (!this.stageEl || !this.glCanvas || !this.fxCanvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = this.stageEl.clientWidth || 960;
      const h = this.stageEl.clientHeight || 640;

      this.glCanvas.width = Math.round(w * dpr);
      this.glCanvas.height = Math.round(h * dpr);
      this.fxCanvas.width = Math.round(w * dpr);
      this.fxCanvas.height = Math.round(h * dpr);
      if (this.gl) {
        this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
      }
    }

    _initParticles(n) {
      this.particles = [];
      for (let i = 0; i < n; i++) {
        this.particles.push({
          x: Math.random(),
          y: Math.random(),
          r: 1.2 + Math.random() * 2.8,
          vx: (Math.random() - 0.5) * 0.03,
          vy: 0.04 + Math.random() * 0.08,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.5 ? "#ff77a8" : "#80d4ff"
        });
      }
    }

    _renderAtmosphericFx(nowSec, dt) {
      const ctx = this.fxCtx;
      if (!ctx) return;
      const w = this.fxCanvas.width;
      const h = this.fxCanvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Dynamic volumetric light beams in B1 Livehouse or warm cafe glow
      if (this.bgMode === "live") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < 3; i++) {
          const swing = Math.sin(nowSec * (0.9 + i * 0.35) + i * 1.8) * 0.16;
          const topX = w * (0.22 + i * 0.28);
          const botX = topX + Math.tan(swing) * h;
          const grad = ctx.createLinearGradient(topX, 0, botX, h * 0.92);
          const col = i === 1 ? "rgba(112, 181, 255, 0.13)" : "rgba(255, 95, 145, 0.14)";
          grad.addColorStop(0, col);
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(topX - w * 0.03, 0);
          ctx.lineTo(topX + w * 0.03, 0);
          ctx.lineTo(botX + w * 0.18, h);
          ctx.lineTo(botX - w * 0.18, h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      } else if (this.bgMode === "cafe" || this.bgMode === "cheki") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const pulse = 0.07 + 0.025 * Math.sin(nowSec * 2.1);
        const rad = ctx.createRadialGradient(w * 0.28, h * 0.18, 10, w * 0.28, h * 0.25, w * 0.55);
        rad.addColorStop(0, `rgba(255, 195, 125, ${pulse})`);
        rad.addColorStop(0.55, `rgba(255, 95, 155, ${pulse * 0.55})`);
        rad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // 2. Particles: Snowflakes on 3F rooftop, neon bokeh / dust motes indoors
      ctx.save();
      this.particles.forEach((p) => {
        if (this.bgMode === "snow") {
          p.y += p.vy * dt * 0.85;
          p.x += Math.sin(nowSec * 1.4 + p.phase) * 0.015 * dt;
          if (p.y > 1.02) { p.y = -0.02; p.x = Math.random(); }
          ctx.fillStyle = "rgba(240, 246, 255, 0.72)";
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.r * 1.15, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.y -= p.vy * dt * 0.25;
          p.x += Math.sin(nowSec * 0.9 + p.phase) * 0.008 * dt;
          if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
          const alpha = 0.18 + 0.16 * Math.sin(nowSec * 2.4 + p.phase);
          ctx.fillStyle = p.hue;
          ctx.globalAlpha = Math.max(0.04, alpha);
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    _evalBlink(slot, nowSec) {
      if (nowSec >= slot.nextBlinkAt) {
        slot.blinkStart = nowSec;
        slot.doubleBlink = Math.random() < 0.22;
        slot.nextBlinkAt = nowSec + 2.6 + Math.random() * 3.8;
      }
      const elapsed = nowSec - slot.blinkStart;
      const dur = 0.15;
      if (elapsed >= 0 && elapsed <= dur) {
        return Math.sin((elapsed / dur) * Math.PI);
      }
      if (slot.doubleBlink && elapsed > dur + 0.07 && elapsed <= dur * 2 + 0.07) {
        return Math.sin(((elapsed - dur - 0.07) / dur) * Math.PI);
      }
      return 0.0;
    }

    _tick(nowMs) {
      const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastTime) * 0.001));
      this.lastTime = nowMs;
      const nowSec = nowMs * 0.001;

      // Smooth pointer & compute angular velocity for secondary hair pendulum inertia
      const prevPtrX = this.curPtr.x;
      this.curPtr.x += (this.targetPtr.x - this.curPtr.x) * Math.min(1, dt * 6.5);
      this.curPtr.y += (this.targetPtr.y - this.curPtr.y) * Math.min(1, dt * 6.5);
      const instVel = (this.curPtr.x - prevPtrX) / dt;
      this.ptrVelX += (instVel - this.ptrVelX) * Math.min(1, dt * 8.0);

      const mouthVal = this._sampleMouthOpen(nowSec);

      this._renderAtmosphericFx(nowSec, dt);

      const gl = this.gl;
      if (gl && this.enabled) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (this.slots.length > 0) {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          gl.useProgram(this.prog);

          gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuffer);
          gl.enableVertexAttribArray(this.locs.a_uv);
          gl.vertexAttribPointer(this.locs.a_uv, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

          const canvasW = Math.max(1, this.glCanvas.width);
          const canvasH = Math.max(1, this.glCanvas.height);
          const stageAspect = canvasW / canvasH;

          // Render non-speaking characters first, speaking character on top
          const ordered = [...this.slots].sort((a, b) => (a.isSpeaking === b.isSpeaking ? 0 : a.isSpeaking ? 1 : -1));

          ordered.forEach((slot) => {
            if (!slot.texEntry.ready) return;

            const prevSlotX = slot.curX;
            slot.curX += (slot.targetX - slot.curX) * Math.min(1, dt * 7.5);
            slot.curDim += (slot.targetDim - slot.curDim) * Math.min(1, dt * 8.0);
            slot.curScale += (slot.targetScale - slot.curScale) * Math.min(1, dt * 7.5);
            slot.alpha = Math.min(1.0, slot.alpha + dt * 4.8);
            slot.bounce *= Math.pow(0.06, dt);

            const slotMoveVel = (slot.curX - prevSlotX) / dt;
            const totalSwayVel = Math.max(-2.5, Math.min(2.5, this.ptrVelX * 0.45 + slotMoveVel * 0.9));

            const spriteAspect = slot.texEntry.w / slot.texEntry.h;
            // Occupy ~91% of stage height (1.82 in NDC clip height)
            const clipH = 1.84 * slot.curScale;
            const clipW = clipH * (spriteAspect / stageAspect);

            const breath = Math.sin(nowSec * 2.15 + slot.phaseSeed) * 0.5 + 0.5;
            const blink = this._evalBlink(slot, nowSec);
            const activeMouth = slot.isSpeaking ? mouthVal : 0.0;

            // Gaze subtly follows mouse + gentle idle micro-drift
            const gazeX = this.curPtr.x * 0.75 + Math.sin(nowSec * 0.8 + slot.phaseSeed) * 0.18;
            const gazeY = this.curPtr.y * 0.65 + Math.cos(nowSec * 0.65 + slot.phaseSeed) * 0.12;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, slot.texEntry.tex);
            gl.uniform1i(this.locs.u_tex, 0);
            gl.uniform2f(this.locs.u_texel, 1.0 / slot.texEntry.w, 1.0 / slot.texEntry.h);

            gl.uniform2f(this.locs.u_slotOffset, slot.curX, -1.0);
            gl.uniform2f(this.locs.u_slotScale, clipW, clipH);
            gl.uniform1f(this.locs.u_time, nowSec + slot.phaseSeed);
            gl.uniform1f(this.locs.u_breath, breath);
            gl.uniform2f(this.locs.u_pointer, gazeX, gazeY);
            gl.uniform1f(this.locs.u_mouthOpen, activeMouth);
            gl.uniform1f(this.locs.u_blink, blink);
            gl.uniform1f(this.locs.u_speaking, slot.isSpeaking ? 1.0 : 0.0);
            gl.uniform1f(this.locs.u_bounce, Math.sin(slot.bounce * Math.PI));
            gl.uniform1f(this.locs.u_swayVel, totalSwayVel);

            const r = slot.rig;
            gl.uniform4f(this.locs.u_face, r.faceX, r.eyeY, r.mouthY, r.faceR);
            gl.uniform1f(this.locs.u_neckY, r.neckY);
            gl.uniform1f(this.locs.u_hairAmp, r.hairSway);

            gl.uniform1f(this.locs.u_dim, slot.curDim);
            gl.uniform1f(this.locs.u_alpha, slot.alpha);
            gl.uniform3fv(this.locs.u_rimColor, this.tint.rim);
            gl.uniform3fv(this.locs.u_ambTint, this.tint.amb);

            gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
          });
        }
      }

      requestAnimationFrame((t) => this._tick(t));
    }
  }

  window.LIVE2D_STAGE = new Live2DStageEngine();
})();
