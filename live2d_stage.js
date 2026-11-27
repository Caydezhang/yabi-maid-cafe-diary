/**
 * 《拯救亚比妹妹——仆咖经营日记》高清静态立绘舞台与场景氛围光影引擎
 * - 100% 静态无变形原画渲染（移除所有面部/口型/眨眼/呼吸网格拉伸动效，避免立绘扭曲抽搐）
 * - 说话高亮 / 非说话柔和压暗、平滑淡入与边缘氛围轮廓光
 * - 场景动态光束、3F 飘雪与霓虹微粒氛围层
 */
(function () {
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

    varying vec2 v_uv;

    void main() {
      v_uv = a_uv;
      vec2 localPos = vec2(a_uv.x - 0.5, 1.0 - a_uv.y);
      vec2 clipPos = u_slotOffset + localPos * u_slotScale;
      gl_Position = vec4(clipPos, 0.0, 1.0);
    }
  `;

  const FS_SRC = `
    precision highp float;
    varying vec2 v_uv;

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

      // Subtle edge rim-light so crisp 2D portraits blend naturally with neon scenes
      float aL = texture2D(u_tex, v_uv - vec2(u_texel.x * 2.5, 0.0)).a;
      float aR = texture2D(u_tex, v_uv + vec2(u_texel.x * 2.5, 0.0)).a;
      float aU = texture2D(u_tex, v_uv - vec2(0.0, u_texel.y * 2.5)).a;
      float edgeRim = clamp((1.0 - min(min(aL, aR), aU)) * col.a, 0.0, 1.0);

      vec3 rgb = col.rgb * u_ambTint;
      float rimStrength = (0.18 + 0.22 * u_speaking) * u_dim;
      rgb += u_rimColor * pow(edgeRim, 1.6) * rimStrength;
      rgb *= u_dim;

      gl_FragColor = vec4(rgb, col.a * u_alpha);
    }
  `;

  class StaticPortraitStageEngine {
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

      this.slots = [];
      this.bgMode = "cafe";
      this.tint = SCENE_TINTS.cafe1f;

      this.particles = [];
      this.lastTime = performance.now();
    }

    init(stageSelector) {
      this.stageEl = document.querySelector(stageSelector);
      if (!this.stageEl) return false;

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
        this.enabled = false;
        return false;
      }

      if (spriteLayer) spriteLayer.classList.add("l2d-active");

      this._initShaders();
      this._initQuadMesh();
      this._initParticles(60);
      window.addEventListener("resize", () => this.resize());
      this.resize();

      requestAnimationFrame((t) => this._tick(t));
      return true;
    }

    // No-op hooks kept for API compatibility with game_engine.js
    bindAudioElement() {}
    triggerTapBounce() {}

    _compileShader(type, src) {
      const gl = this.gl;
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Stage shader error:", gl.getShaderInfoLog(sh));
      }
      return sh;
    }

    _initShaders() {
      const gl = this.gl;
      const vs = this._compileShader(gl.VERTEX_SHADER, VS_SRC);
      const fs = this._compileShader(gl.FRAGMENT_SHADER, FS_SRC);
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      this.prog = prog;

      this.locs = {
        a_uv: gl.getAttribLocation(prog, "a_uv"),
        u_slotOffset: gl.getUniformLocation(prog, "u_slotOffset"),
        u_slotScale: gl.getUniformLocation(prog, "u_slotScale"),
        u_speaking: gl.getUniformLocation(prog, "u_speaking"),
        u_tex: gl.getUniformLocation(prog, "u_tex"),
        u_texel: gl.getUniformLocation(prog, "u_texel"),
        u_dim: gl.getUniformLocation(prog, "u_dim"),
        u_alpha: gl.getUniformLocation(prog, "u_alpha"),
        u_rimColor: gl.getUniformLocation(prog, "u_rimColor"),
        u_ambTint: gl.getUniformLocation(prog, "u_ambTint")
      };
    }

    _initQuadMesh() {
      const gl = this.gl;
      const verts = new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        1, 1
      ]);
      const indices = new Uint16Array([0, 2, 1, 1, 2, 3]);
      this.indexCount = indices.length;

      this.meshBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
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
        const texEntry = this._loadTexture(desc.src);
        const isSpeaking = typeof speakingIdx === "number" ? speakingIdx === idx : true;
        const targetX = count === 1 ? 0.0 : idx === 0 ? -0.34 : 0.34;

        return {
          cid: desc.cid,
          src: desc.src,
          texEntry,
          isSpeaking,
          curX: prev ? prev.curX : targetX,
          targetX,
          curDim: prev ? prev.curDim : isSpeaking ? 1.0 : 0.62,
          targetDim: isSpeaking ? 1.0 : 0.60,
          curScale: prev ? prev.curScale : isSpeaking ? 1.02 : 0.96,
          targetScale: isSpeaking ? 1.02 : 0.96,
          alpha: prev ? prev.alpha : 0.0
        };
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
          r: 1.2 + Math.random() * 2.6,
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

    _tick(nowMs) {
      const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastTime) * 0.001));
      this.lastTime = nowMs;
      const nowSec = nowMs * 0.001;

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

          const ordered = [...this.slots].sort((a, b) => (a.isSpeaking === b.isSpeaking ? 0 : a.isSpeaking ? 1 : -1));

          ordered.forEach((slot) => {
            if (!slot.texEntry.ready) return;

            slot.curX += (slot.targetX - slot.curX) * Math.min(1, dt * 8.0);
            slot.curDim += (slot.targetDim - slot.curDim) * Math.min(1, dt * 8.5);
            slot.curScale += (slot.targetScale - slot.curScale) * Math.min(1, dt * 8.0);
            slot.alpha = Math.min(1.0, slot.alpha + dt * 5.0);

            const spriteAspect = slot.texEntry.w / slot.texEntry.h;
            const clipH = 1.84 * slot.curScale;
            const clipW = clipH * (spriteAspect / stageAspect);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, slot.texEntry.tex);
            gl.uniform1i(this.locs.u_tex, 0);
            gl.uniform2f(this.locs.u_texel, 1.0 / slot.texEntry.w, 1.0 / slot.texEntry.h);

            gl.uniform2f(this.locs.u_slotOffset, slot.curX, -1.0);
            gl.uniform2f(this.locs.u_slotScale, clipW, clipH);
            gl.uniform1f(this.locs.u_speaking, slot.isSpeaking ? 1.0 : 0.0);
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

  window.LIVE2D_STAGE = new StaticPortraitStageEngine();
})();
