/**
 * 《拯救亚比妹妹——仆咖经营日记》高精真 3D 拟真卡通小人骨骼建造器 v2
 * - 14 关节真 3D 骨骼（骨盆、脊柱、颈部、头部、左右髋/膝/踝、左右肩/肘/腕 + 3D 随动发束）
 * - ACES 柔和哑光 PBR 手办级着色 + 512x512 手绘二次元眨眼表情贴图 + 精细服饰纹理贴图（蕾丝/豹纹/格子/领带/机能印花）
 * - 360° 真 3D 转向、自然人类屈膝步行步态、手臂自然摆动、立体发丝与专属 3D 道具
 */
(function () {
  const CHAR_SPECS = {
    chibi_luchen: {
      skin: "#f2cbb6", skinShade: "#d49f84",
      hair: "#252938", hairTip: "#3b4259", hairStyle: "short_fluffy",
      eyeColor: "#5e4030", eyeHi: "#b88663", eyeShape: "gentle",
      outfit: "barista",
      topColor: "#e6eaf2", apronColor: "#1d2d4f", pantsColor: "#262b3b", shoeColor: "#382319",
      glasses: true, prop: "coffee"
    },
    chibi_mahiru: {
      skin: "#f7d4cc", skinShade: "#dcaba2",
      hair: "#24172e", hairTip: "#e83e84", hairStyle: "twintails_drill",
      eyeColor: "#e83a7d", eyeHi: "#ffd166", eyeShape: "heart", mole: true,
      outfit: "maid_skirt",
      topColor: "#201729", skirtColor: "#1d1526", accentColor: "#f05b96",
      sockColor: "#201829", shoeColor: "#1a131f",
      headband: "maid", prop: "camera"
    },
    chibi_reine: {
      skin: "#f3d4da", skinShade: "#d1a6b0",
      hair: "#1f172e", hairTip: "#6e44b0", hairStyle: "long_hime",
      eyeColor: "#d11944", eyeHi: "#ff7fa3", eyeShape: "sharp",
      outfit: "gothic_coat",
      topColor: "#1c1626", coatColor: "#1a1426", accentColor: "#8b54db",
      sockColor: "#271d36", shoeColor: "#18121f",
      prop: "guitar"
    },
    chibi_kohaku: {
      skin: "#d69267", skinShade: "#b06d44",
      hair: "#d99b29", hairTip: "#e83f8a", hairStyle: "wolf_spiky",
      eyeColor: "#e89417", eyeHi: "#ffea85", eyeShape: "bright", fang: true,
      outfit: "gyaru_jacket",
      topColor: "#1d1b24", skirtColor: "#a66c2e", accentColor: "#f0ecf5",
      sockColor: "#d69267", shoeColor: "#1a1721",
      prop: "tray"
    },
    chibi_millie: {
      skin: "#f4d3ce", skinShade: "#d6a8a2",
      hair: "#1d2030", hairTip: "#8ee036", hairStyle: "twin_buns",
      eyeColor: "#7c56d4", eyeHi: "#5be3db", eyeShape: "cute",
      outfit: "cyber_hoodie",
      topColor: "#9caae0", hoodieAccent: "#56dfd4", pantsColor: "#1e1b2b",
      sockColor: "#221e30", shoeColor: "#9c94d4",
      headphones: true, prop: "console"
    },
    chibi_guest_jirai: {
      skin: "#f7d5ce", skinShade: "#daa9a0",
      hair: "#2a2036", hairTip: "#e86ca5", hairStyle: "twintails_soft",
      eyeColor: "#9644cc", eyeHi: "#ff9ed0", eyeShape: "sparkle",
      outfit: "jirai_cardigan",
      topColor: "#e69ab8", skirtColor: "#291e33", accentColor: "#e85492",
      sockColor: "#271d2e", shoeColor: "#211826",
      headband: "maid", prop: "fan"
    },
    chibi_guest_wota: {
      skin: "#f5d3cc", skinShade: "#d6a69d",
      hair: "#261e33", hairTip: "#784ad6", hairStyle: "twintails_short",
      eyeColor: "#8042de", eyeHi: "#d4a6ff", eyeShape: "bright",
      outfit: "punk_hoodie",
      topColor: "#231e30", pantsColor: "#1c1826", accentColor: "#9a4ef0",
      sockColor: "#241e33", shoeColor: "#1e1929",
      prop: "glowsticks"
    },
    chibi_guest_vlogger: {
      skin: "#f5d4cc", skinShade: "#d6a79d",
      hair: "#4f3e78", hairTip: "#7a5eb0", hairStyle: "bob_wavy",
      eyeColor: "#7540cc", eyeHi: "#c7a3ff", eyeShape: "cute",
      outfit: "cargo_jacket",
      topColor: "#9b87d4", pantsColor: "#7360ab", accentColor: "#e8e3f5",
      shoeColor: "#c2b4e6",
      beret: true, prop: "gimbal"
    },
    chibi_guest_office: {
      skin: "#f4d0c5", skinShade: "#d4a496",
      hair: "#857268", hairTip: "#635249", hairStyle: "bob_soft",
      eyeColor: "#634f9c", eyeHi: "#b8a3f0", eyeShape: "gentle",
      outfit: "trench_suit",
      topColor: "#bfa88a", innerColor: "#2a334d", pantsColor: "#2b3247",
      shoeColor: "#3d2921",
      prop: "drink"
    }
  };

  const faceTexCache = new Map();
  const outfitTexCache = new Map();

  // Soft plush Nintendo / Blue-Archive matte PBR shading (zero overexposed white blowout!)
  function softMat(T, color, opts) {
    const o = opts || {};
    return new T.MeshStandardMaterial({
      color: color,
      map: o.map || null,
      roughness: o.roughness !== undefined ? o.roughness : 0.78,
      metalness: o.metalness !== undefined ? o.metalness : 0.04,
      emissive: o.emissive || 0x000000,
      emissiveIntensity: o.emissiveIntensity || 0,
      transparent: !!o.transparent,
      opacity: o.opacity !== undefined ? o.opacity : 1,
      side: o.side || T.FrontSide
    });
  }

  function makeOutfitTexture(T, key, spec) {
    const ck = "top_" + key;
    if (outfitTexCache.has(ck)) return outfitTexCache.get(ck);
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d");

    ctx.fillStyle = spec.topColor;
    ctx.fillRect(0, 0, 256, 256);

    // Cylinder front faces u=0.5 (x=128) when rotated cleanly; draw crisp anime details at x=128!
    const cx = 128;
    if (spec.outfit === "maid_skirt") {
      // Pink lace chest panel + white collar + black bow
      ctx.fillStyle = "#f285b4";
      ctx.fillRect(cx - 32, 48, 64, 165);
      ctx.fillStyle = "#fff5fa";
      ctx.fillRect(cx - 36, 48, 7, 165);
      ctx.fillRect(cx + 29, 48, 7, 165);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(cx - 44, 0); ctx.lineTo(cx, 54); ctx.lineTo(cx + 44, 0); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff4e93";
      ctx.fillRect(cx - 18, 42, 36, 16);
    } else if (spec.outfit === "gothic_coat") {
      // White ruffled jabot + silver buttons & chains
      ctx.fillStyle = "#e6dff2";
      ctx.fillRect(cx - 16, 24, 32, 160);
      ctx.fillStyle = "#b8b0cc";
      for (let y = 55; y <= 175; y += 34) {
        ctx.beginPath(); ctx.arc(cx - 30, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 30, y, 5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (spec.outfit === "gyaru_jacket") {
      // Leather jacket open over white maid apron bib + pink heart choker
      ctx.fillStyle = "#f0ecf5";
      ctx.fillRect(cx - 28, 35, 56, 185);
      ctx.fillStyle = "#2b2633";
      ctx.fillRect(cx - 16, 40, 32, 100);
      ctx.strokeStyle = "#d9d4e6";
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - 30, 35, 60, 185);
    } else if (spec.outfit === "barista") {
      // Crisp white shirt collar + navy apron straps & pocket stitching
      ctx.fillStyle = spec.apronColor;
      ctx.fillRect(cx - 46, 75, 92, 181);
      ctx.fillRect(cx - 36, 0, 14, 90);
      ctx.fillRect(cx + 22, 0, 14, 90);
      ctx.fillStyle = "#d4a96a";
      ctx.fillRect(cx - 36, 68, 14, 8);
      ctx.fillRect(cx + 22, 68, 14, 8);
    } else if (spec.outfit === "cyber_hoodie") {
      // Open holographic hoodie over dark graphic tee
      ctx.fillStyle = "#1c1929";
      ctx.fillRect(cx - 34, 0, 68, 256);
      ctx.fillStyle = "#ff4fa3";
      ctx.fillRect(cx - 20, 75, 40, 16);
      ctx.fillStyle = "#56dfd4";
      ctx.fillRect(cx - 14, 102, 32, 12);
      ctx.fillStyle = "#96f249";
      ctx.fillRect(cx - 18, 124, 24, 14);
    } else if (spec.outfit === "jirai_cardigan") {
      // White blouse + pink bow + cardigan buttons
      ctx.fillStyle = "#fff5fa";
      ctx.fillRect(cx - 24, 0, 48, 256);
      ctx.fillStyle = "#261b2e";
      ctx.fillRect(cx - 20, 32, 40, 16);
      ctx.fillStyle = "#ff5f91";
      ctx.beginPath(); ctx.arc(cx, 40, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#261b2e";
      for (let y = 85; y <= 200; y += 36) {
        ctx.beginPath(); ctx.arc(cx - 30, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 30, y, 5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (spec.outfit === "trench_suit") {
      // Open beige trench over white shirt + striped navy tie!
      ctx.fillStyle = "#f2f4f8";
      ctx.fillRect(cx - 26, 0, 52, 256);
      ctx.fillStyle = "#2c3654";
      ctx.fillRect(cx - 42, 0, 18, 256);
      ctx.fillRect(cx + 24, 0, 18, 256);
      ctx.fillStyle = "#36446b";
      ctx.beginPath();
      ctx.moveTo(cx - 8, 12); ctx.lineTo(cx + 8, 12); ctx.lineTo(cx + 10, 165); ctx.lineTo(cx, 185); ctx.lineTo(cx - 10, 165);
      ctx.closePath();
      ctx.fill();
    } else if (spec.outfit === "cargo_jacket") {
      ctx.fillStyle = "#f4f2f8";
      ctx.fillRect(cx - 28, 20, 56, 130);
      ctx.fillStyle = spec.skin;
      ctx.fillRect(cx - 24, 150, 48, 106);
    } else if (spec.outfit === "punk_hoodie") {
      ctx.fillStyle = "#9a4ef0";
      ctx.fillRect(cx - 4, 0, 8, 256);
      ctx.fillStyle = "#e854a2";
      ctx.beginPath(); ctx.arc(cx - 26, 95, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#9a4ef0";
      ctx.beginPath(); ctx.arc(cx + 26, 115, 10, 0, Math.PI * 2); ctx.fill();
    }

    const tx = new T.CanvasTexture(c);
    if ("encoding" in tx && T.sRGBEncoding) tx.encoding = T.sRGBEncoding;
    tx.needsUpdate = true;
    outfitTexCache.set(ck, tx);
    return tx;
  }

  function makeSkirtTexture(T, key, spec) {
    const ck = "skirt_" + key;
    if (outfitTexCache.has(ck)) return outfitTexCache.get(ck);
    const c = document.createElement("canvas");
    c.width = 256; c.height = 128;
    const ctx = c.getContext("2d");

    ctx.fillStyle = spec.skirtColor || "#221a2e";
    ctx.fillRect(0, 0, 256, 128);

    if (spec.outfit === "gyaru_jacket") {
      // Kohaku's iconic leopard print skirt!
      ctx.fillStyle = "#3b2314";
      for (let i = 0; i < 36; i++) {
        const lx = (i * 41) % 256;
        const ly = 14 + ((i * 29) % 92);
        ctx.beginPath();
        ctx.ellipse(lx, ly, 8, 5, (i % 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // White maid mini-apron centered at front (x=128)
      ctx.fillStyle = "#f2eef7";
      ctx.beginPath();
      ctx.arc(128, 0, 44, 0, Math.PI);
      ctx.fill();
    } else if (spec.outfit === "maid_skirt") {
      // Crisp pleated stripes + pink accent band + cute rounded front apron!
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      for (let x = 0; x < 256; x += 18) ctx.fillRect(x, 0, 6, 128);
      ctx.fillStyle = spec.accentColor;
      ctx.fillRect(0, 92, 256, 14);
      ctx.fillStyle = "#fff4fa";
      ctx.fillRect(0, 110, 256, 18);
      // Pink rounded maid apron centered on front (x=128)
      ctx.fillStyle = "#f58ab8";
      ctx.beginPath();
      ctx.arc(128, 6, 42, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#fff5fa";
      ctx.lineWidth = 6;
      ctx.stroke();
    } else if (spec.outfit === "jirai_cardigan") {
      // Pink-black plaid jirai skirt!
      ctx.fillStyle = "rgba(255, 118, 175, 0.45)";
      for (let x = 0; x < 256; x += 24) ctx.fillRect(x, 0, 8, 128);
      for (let y = 16; y < 128; y += 28) ctx.fillRect(0, y, 256, 7);
      ctx.fillStyle = "#fff2f8";
      ctx.fillRect(0, 114, 256, 14);
    }

    const tx = new T.CanvasTexture(c);
    if ("encoding" in tx && T.sRGBEncoding) tx.encoding = T.sRGBEncoding;
    tx.needsUpdate = true;
    outfitTexCache.set(ck, tx);
    return tx;
  }

  function makeAnimeFaceTextures(T, key, spec) {
    if (faceTexCache.has(key)) return faceTexCache.get(key);

    // True 2:1 equirectangular canvas (1024x512) so anime eyes & circles NEVER stretch horizontally on SphereGeometry!
    const drawFace = (blinking) => {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext("2d");

      // Rich warm skin base
      ctx.fillStyle = spec.skin;
      ctx.fillRect(0, 0, 1024, 512);

      // Subtle warm anime cheek/chin soft shading
      const grad = ctx.createLinearGradient(0, 150, 0, 440);
      grad.addColorStop(0, "rgba(0,0,0,0.02)");
      grad.addColorStop(0.62, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(180,95,100,0.11)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Back & sides of head painted in hair color so 3D hair blends 100% seamlessly
      ctx.fillStyle = spec.hair;
      ctx.fillRect(0, 0, 1024, 178);
      ctx.fillRect(0, 0, 315, 512);
      ctx.fillRect(709, 0, 315, 512);

      const cx = 512;
      const eyeY = 278;
      const eyeDx = 56;

      // Soft rosy anime blush right below outer eyes
      [-1, 1].forEach((s) => {
        const bx = cx + s * (eyeDx + 16);
        const by = eyeY + 35;
        const rg = ctx.createRadialGradient(bx, by, 3, bx, by, 28);
        rg.addColorStop(0, "rgba(255, 112, 148, 0.42)");
        rg.addColorStop(1, "rgba(255, 112, 148, 0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.ellipse(bx, by, 28, 13, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Polished Nendoroid / MiHoYo-style anime eyes (almond-clipped so NO startled owl-eye white above iris!)
      [-1, 1].forEach((s) => {
        const ex = cx + s * eyeDx;
        if (blinking) {
          ctx.strokeStyle = "#24162b";
          ctx.lineWidth = 7.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(ex - 25, eyeY + 4);
          ctx.quadraticCurveTo(ex, eyeY + 18, ex + 25, eyeY + 4);
          ctx.stroke();
        } else {
          const ew = spec.eyeShape === "gentle" ? 26 : 29;
          const eh = spec.eyeShape === "sharp" ? 24 : spec.eyeShape === "gentle" ? 25 : 29;

          // 1. Clipped almond/rounded eye socket mask
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ex - ew, eyeY + 3);
          ctx.bezierCurveTo(ex - ew * 0.72, eyeY - eh * 1.15, ex + ew * 0.72, eyeY - eh * 1.15, ex + ew, eyeY + 2);
          ctx.bezierCurveTo(ex + ew * 0.75, eyeY + eh * 1.05, ex - ew * 0.75, eyeY + eh * 1.05, ex - ew, eyeY + 3);
          ctx.closePath();
          ctx.fillStyle = "#fcfaff";
          ctx.fill();
          ctx.clip();

          // Soft upper eyelid shadow cast onto sclera + iris
          const lidShadow = ctx.createLinearGradient(ex, eyeY - eh, ex, eyeY + 4);
          lidShadow.addColorStop(0, "rgba(38, 22, 58, 0.28)");
          lidShadow.addColorStop(1, "rgba(38, 22, 58, 0)");
          ctx.fillStyle = lidShadow;
          ctx.fillRect(ex - ew, eyeY - eh, ew * 2, eh + 4);

          // 2. Large glossy anime iris tucked naturally behind upper lash (zero white gap above!)
          const irisW = ew * 0.78;
          const irisH = eh * 0.96;
          const ig = ctx.createLinearGradient(ex, eyeY - irisH, ex, eyeY + irisH);
          ig.addColorStop(0, "#1d102b");
          ig.addColorStop(0.42, spec.eyeColor);
          ig.addColorStop(0.84, spec.eyeHi);
          ig.addColorStop(1, "#fff6fb");
          ctx.fillStyle = ig;
          ctx.beginPath();
          ctx.ellipse(ex, eyeY - 1, irisW, irisH, 0, 0, Math.PI * 2);
          ctx.fill();

          // Deep pupil
          ctx.fillStyle = "#1a0e26";
          ctx.beginPath();
          ctx.ellipse(ex, eyeY - 1, irisW * 0.44, irisH * 0.46, 0, 0, Math.PI * 2);
          ctx.fill();

          // Mahiru glowing heart catchlight
          if (spec.eyeShape === "heart") {
            ctx.fillStyle = "#ffea94";
            ctx.beginPath();
            ctx.arc(ex - 4, eyeY + 8, 4.4, 0, Math.PI * 2);
            ctx.arc(ex + 4, eyeY + 8, 4.4, 0, Math.PI * 2);
            ctx.lineTo(ex, eyeY + 16);
            ctx.closePath();
            ctx.fill();
          }

          // Crisp twin specular catchlights
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.ellipse(ex - 8, eyeY - 10, 7.5, 6.2, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + 9, eyeY + 9, 3.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // 3. Thick sleek curved anime upper eyelash + delicate wing flick
          ctx.strokeStyle = "#1c1124";
          ctx.lineWidth = spec.eyeShape === "sharp" ? 9.5 : 8.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(ex - ew - (s < 0 ? 4 : 1), eyeY + 2);
          ctx.bezierCurveTo(ex - ew * 0.65, eyeY - eh * 1.18, ex + ew * 0.65, eyeY - eh * 1.18, ex + ew + (s > 0 ? 4 : 1), eyeY + 1);
          ctx.stroke();

          // Delicate upper eyelid crease line
          ctx.strokeStyle = "rgba(70, 42, 62, 0.45)";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(ex - ew * 0.7, eyeY - eh - 5);
          ctx.quadraticCurveTo(ex, eyeY - eh - 12, ex + ew * 0.7, eyeY - eh - 5);
          ctx.stroke();

          // Soft lower lash accent
          ctx.strokeStyle = "rgba(42, 24, 52, 0.55)";
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(ex - ew * 0.52, eyeY + eh * 0.85);
          ctx.quadraticCurveTo(ex, eyeY + eh * 1.04, ex + ew * 0.52, eyeY + eh * 0.85);
          ctx.stroke();
        }

        // Expressive anime eyebrows (painted softly above eyes)
        ctx.strokeStyle = spec.hair;
        ctx.lineWidth = 4.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        const browTilt = spec.eyeShape === "sharp" ? s * -4 : s * 2;
        ctx.moveTo(ex - 16, eyeY - 38 - browTilt);
        ctx.quadraticCurveTo(ex, eyeY - 43, ex + 16, eyeY - 38 + browTilt);
        ctx.stroke();
      });

      // Soft cast shadow from bangs onto forehead (instant 3D anime depth!)
      const drawBangStrands = (yOffset, fillStyle) => {
        ctx.fillStyle = fillStyle;
        const strands = [
          // Wide side-framing bangs sweeping softly past temples
          { x0: cx - 190, x1: cx - 115, tipX: cx - 138, tipY: 318 + yOffset },
          { x0: cx + 115, x1: cx + 190, tipX: cx + 138, tipY: 318 + yOffset },
          // Sweeping layered forehead bangs (soft curves, NOT jagged teeth!)
          { x0: cx - 132, x1: cx - 58,  tipX: cx - 88,  tipY: 244 + yOffset },
          { x0: cx - 74,  x1: cx - 4,   tipX: cx - 28,  tipY: 238 + yOffset },
          { x0: cx - 18,  x1: cx + 52,  tipX: cx + 16,  tipY: 242 + yOffset },
          { x0: cx + 38,  x1: cx + 118, tipX: cx + 82,  tipY: 240 + yOffset }
        ];
        strands.forEach((st) => {
          ctx.beginPath();
          ctx.moveTo(st.x0, 168);
          ctx.quadraticCurveTo((st.x0 + st.tipX) * 0.5, (168 + st.tipY) * 0.56, st.tipX, st.tipY);
          ctx.quadraticCurveTo((st.x1 + st.tipX) * 0.5, (168 + st.tipY) * 0.52, st.x1, 168);
          ctx.closePath();
          ctx.fill();
        });
      };
      drawBangStrands(10, "rgba(65, 35, 58, 0.16)");
      drawBangStrands(0, spec.hair);

      // Soft anime angelic hair highlight arc across bangs
      ctx.strokeStyle = "rgba(255,255,255,0.26)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 105, 198);
      ctx.quadraticCurveTo(cx, 184, cx + 105, 198);
      ctx.stroke();

      // Tiny anime nose dot
      ctx.fillStyle = spec.skinShade;
      ctx.beginPath();
      ctx.arc(cx, eyeY + 23, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Sweet petite anime mouth
      ctx.strokeStyle = "#8c424e";
      ctx.lineWidth = 3.4;
      ctx.lineCap = "round";
      if (spec.fang || spec.eyeShape === "bright" || spec.eyeShape === "sparkle") {
        ctx.fillStyle = "#f27d95";
        ctx.beginPath();
        ctx.arc(cx, eyeY + 40, 9.5, 0.05 * Math.PI, 0.95 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (spec.fang) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(cx + 3.5, eyeY + 41);
          ctx.lineTo(cx + 6.2, eyeY + 47);
          ctx.lineTo(cx + 9.0, eyeY + 41);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.arc(cx, eyeY + 37, 9.5, Math.PI * 0.22, Math.PI * 0.78, false);
        ctx.stroke();
      }

      if (spec.mole) {
        ctx.fillStyle = "#2b1924";
        ctx.beginPath();
        ctx.arc(cx - eyeDx - 15, eyeY + 26, 3.0, 0, Math.PI * 2);
        ctx.fill();
      }

      const tx = new T.CanvasTexture(c);
      if ("encoding" in tx && T.sRGBEncoding) tx.encoding = T.sRGBEncoding;
      tx.needsUpdate = true;
      return tx;
    };

    const bundle = { open: drawFace(false), blink: drawFace(true) };
    faceTexCache.set(key, bundle);
    return bundle;
  }

  function addShadow(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    return mesh;
  }

  function build3DHair(T, headGroup, spec) {
    const hairMat = softMat(T, spec.hair, { roughness: 0.62 });
    const tipMat = softMat(T, spec.hairTip || spec.hair, { roughness: 0.62 });
    const swayParts = [];

    // 1. Sleek sculpted hair crown helmet (smooth continuous silhouette, ZERO lumpy forehead balls!)
    const cap = addShadow(new T.Mesh(new T.SphereGeometry(0.312, 26, 20), hairMat));
    cap.scale.set(1.045, 0.99, 1.03);
    cap.position.set(0, 0.048, -0.046);
    headGroup.add(cap);

    // 2. Smooth crown cap accent hugging top of skull without covering painted sweeping bangs
    const fringeCrown = new T.Mesh(new T.SphereGeometry(0.305, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.34), hairMat);
    fringeCrown.scale.set(1.04, 0.97, 1.01);
    fringeCrown.position.set(0, 0.022, -0.005);
    fringeCrown.rotation.x = 0.04;
    headGroup.add(fringeCrown);

    // 3. Graceful cheek-framing 3D side locks (slightly tucked in so they frame cheeks naturally)
    [-1, 1].forEach((side) => {
      const lock = new T.Mesh(new T.CapsuleGeometry(0.040, 0.19, 6, 10), hairMat);
      lock.position.set(side * 0.268, -0.05, 0.072);
      lock.rotation.z = side * 0.10;
      headGroup.add(lock);

      const lockTip = new T.Mesh(new T.ConeGeometry(0.036, 0.12, 8), tipMat);
      lockTip.rotation.x = Math.PI;
      lockTip.position.set(side * 0.278, -0.20, 0.068);
      headGroup.add(lockTip);
    });

    // 4. Character-specific 3D hair silhouettes
    if (spec.hairStyle === "twintails_drill" || spec.hairStyle === "twintails_soft" || spec.hairStyle === "twintails_short") {
      const isLong = spec.hairStyle === "twintails_drill";
      const isShort = spec.hairStyle === "twintails_short";
      const ribbonMat = softMat(T, spec.accentColor || "#ff5f91", { roughness: 0.55 });

      [-1, 1].forEach((side) => {
        const pivot = new T.Group();
        pivot.position.set(side * 0.29, 0.14, -0.07);
        headGroup.add(pivot);

        const bow = new T.Mesh(new T.BoxGeometry(0.14, 0.075, 0.05), ribbonMat);
        bow.rotation.z = side * -0.35;
        pivot.add(bow);

        const segLen = isShort ? 0.22 : isLong ? 0.36 : 0.30;
        const upper = addShadow(new T.Mesh(new T.CapsuleGeometry(0.088, segLen, 6, 10), hairMat));
        upper.position.set(side * 0.08, -segLen * 0.55, -0.05);
        upper.rotation.z = side * 0.24;
        pivot.add(upper);

        const lower = addShadow(new T.Mesh(new T.ConeGeometry(0.084, isLong ? 0.34 : 0.22, 9), tipMat));
        lower.rotation.x = Math.PI;
        lower.rotation.z = side * -0.14;
        lower.position.set(side * 0.13, -segLen - (isLong ? 0.15 : 0.09), -0.07);
        pivot.add(lower);

        swayParts.push(pivot);
      });
    } else if (spec.hairStyle === "long_hime") {
      const backPivot = new T.Group();
      backPivot.position.set(0, 0.06, -0.16);
      headGroup.add(backPivot);

      const curtain = addShadow(new T.Mesh(new T.CylinderGeometry(0.27, 0.34, 0.72, 14, 1, false, Math.PI * 0.65, Math.PI * 1.7), hairMat));
      curtain.position.set(0, -0.34, -0.02);
      backPivot.add(curtain);

      const tipBand = new T.Mesh(new T.CylinderGeometry(0.34, 0.31, 0.16, 14), tipMat);
      tipBand.position.set(0, -0.74, -0.03);
      tipBand.scale.set(1.0, 1.0, 0.55);
      backPivot.add(tipBand);

      swayParts.push(backPivot);
    } else if (spec.hairStyle === "wolf_spiky") {
      const backPivot = new T.Group();
      backPivot.position.set(0, 0.02, -0.14);
      headGroup.add(backPivot);

      for (let k = -2; k <= 2; k++) {
        const spike = addShadow(new T.Mesh(new T.ConeGeometry(0.080, 0.26, 7), k % 2 === 0 ? tipMat : hairMat));
        spike.rotation.x = Math.PI + 0.32;
        spike.rotation.z = k * 0.24;
        spike.position.set(k * 0.105, -0.16, -0.08 + Math.abs(k) * 0.03);
        backPivot.add(spike);
      }
      const ahoge = new T.Mesh(new T.ConeGeometry(0.044, 0.15, 6), hairMat);
      ahoge.position.set(0.03, 0.35, 0.02);
      ahoge.rotation.z = -0.35;
      headGroup.add(ahoge);
      swayParts.push(backPivot);
    } else if (spec.hairStyle === "twin_buns") {
      [-1, 1].forEach((side) => {
        const bun = addShadow(new T.Mesh(new T.SphereGeometry(0.115, 12, 10), hairMat));
        bun.position.set(side * 0.26, 0.25, -0.05);
        headGroup.add(bun);
        const streak = new T.Mesh(new T.TorusGeometry(0.095, 0.018, 6, 14), tipMat);
        streak.position.set(side * 0.26, 0.25, -0.05);
        streak.rotation.y = side * 0.5;
        headGroup.add(streak);
      });
    } else if (spec.hairStyle === "bob_wavy" || spec.hairStyle === "bob_soft") {
      const bobBack = addShadow(new T.Mesh(new T.SphereGeometry(0.315, 18, 14), hairMat));
      bobBack.scale.set(1.06, 0.92, 0.96);
      bobBack.position.set(0, -0.03, -0.09);
      headGroup.add(bobBack);
    } else {
      const back = addShadow(new T.Mesh(new T.SphereGeometry(0.305, 16, 12), hairMat));
      back.position.set(0, 0.01, -0.07);
      headGroup.add(back);
      const ahoge = new T.Mesh(new T.ConeGeometry(0.032, 0.13, 6), hairMat);
      ahoge.position.set(-0.04, 0.34, 0.03);
      ahoge.rotation.z = 0.4;
      headGroup.add(ahoge);
    }

    // 5. Headgear Accessories
    if (spec.headband === "maid") {
      const lace = new T.Mesh(new T.TorusGeometry(0.29, 0.030, 8, 22, Math.PI), softMat(T, "#f5eef5"));
      lace.position.set(0, 0.09, 0.04);
      lace.rotation.x = -0.35;
      headGroup.add(lace);
    }
    if (spec.headphones) {
      const band = new T.Mesh(new T.TorusGeometry(0.31, 0.022, 8, 22, Math.PI), softMat(T, "#2a2842", { roughness: 0.4 }));
      band.position.set(0, 0.05, 0.0);
      headGroup.add(band);
      const neonCyan = softMat(T, "#56f0ea", { emissive: 0x2fd4db, emissiveIntensity: 0.65 });
      const neonPink = softMat(T, "#ff5ca8", { emissive: 0xff3b94, emissiveIntensity: 0.65 });
      [-1, 1].forEach((side) => {
        const cup = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.055, 14), softMat(T, "#2a2842", { roughness: 0.4 }));
        cup.rotation.z = Math.PI / 2;
        cup.position.set(side * 0.32, 0.01, 0.01);
        headGroup.add(cup);
        const led = new T.Mesh(new T.TorusGeometry(0.068, 0.014, 6, 16), side < 0 ? neonCyan : neonPink);
        led.rotation.y = Math.PI / 2;
        led.position.set(side * 0.35, 0.01, 0.01);
        headGroup.add(led);
        const ear = new T.Mesh(new T.ConeGeometry(0.066, 0.13, 4), neonCyan);
        ear.position.set(side * 0.16, 0.365, 0.02);
        ear.rotation.z = side * -0.28;
        headGroup.add(ear);
      });
    }
    if (spec.beret) {
      const beret = addShadow(new T.Mesh(new T.CylinderGeometry(0.28, 0.25, 0.10, 16), softMat(T, "#5f478a")));
      beret.position.set(0.06, 0.30, -0.02);
      beret.rotation.z = -0.22;
      headGroup.add(beret);
    }
    if (spec.glasses) {
      const gMat = new T.MeshStandardMaterial({ color: 0xb8c2d6, metalness: 0.8, roughness: 0.22 });
      [-0.088, 0.088].forEach((gx) => {
        const rim = new T.Mesh(new T.TorusGeometry(0.058, 0.008, 6, 16), gMat);
        rim.scale.set(1.18, 0.78, 1);
        rim.position.set(gx, -0.025, 0.284);
        headGroup.add(rim);
      });
      const bridge = new T.Mesh(new T.BoxGeometry(0.045, 0.009, 0.009), gMat);
      bridge.position.set(0, -0.018, 0.288);
      headGroup.add(bridge);
    }

    return swayParts;
  }

  function attach3DProps(T, joints, spec) {
    const rHand = joints.rightHand;
    const lHand = joints.leftHand;
    const torso = joints.torso;

    if (spec.prop === "coffee") {
      const metal = new T.MeshStandardMaterial({ color: 0xcbd2e0, metalness: 0.75, roughness: 0.22 });
      const kettle = new T.Mesh(new T.CylinderGeometry(0.055, 0.075, 0.13, 12), metal);
      kettle.position.set(0, -0.04, 0.07);
      rHand.add(kettle);
      const spout = new T.Mesh(new T.CylinderGeometry(0.01, 0.016, 0.10, 8), metal);
      spout.rotation.x = 0.85;
      spout.position.set(0, -0.02, 0.14);
      rHand.add(spout);

      const mug = new T.Mesh(new T.CylinderGeometry(0.046, 0.042, 0.085, 12), softMat(T, "#ebe4da"));
      mug.position.set(0, -0.02, 0.06);
      lHand.add(mug);
    } else if (spec.prop === "camera") {
      const cam = new T.Group();
      cam.position.set(0, -0.01, 0.09);
      cam.add(new T.Mesh(new T.BoxGeometry(0.14, 0.12, 0.08), softMat(T, "#f07aa6", { roughness: 0.45 })));
      const lens = new T.Mesh(new T.CylinderGeometry(0.036, 0.04, 0.04, 12), softMat(T, "#241d2e", { roughness: 0.3 }));
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0.005, 0.05);
      cam.add(lens);
      rHand.add(cam);
    } else if (spec.prop === "guitar") {
      const gtr = new T.Group();
      gtr.position.set(0.02, 0.16, 0.19);
      gtr.rotation.z = 0.48;
      const gMat = softMat(T, "#582099", { roughness: 0.25, metalness: 0.3 });
      const lowerBout = addShadow(new T.Mesh(new T.CylinderGeometry(0.145, 0.145, 0.045, 16), gMat));
      lowerBout.rotation.x = Math.PI / 2;
      lowerBout.scale.set(1.05, 1.0, 0.85);
      lowerBout.position.set(-0.08, -0.10, 0);
      gtr.add(lowerBout);
      const upperBout = addShadow(new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.045, 16), gMat));
      upperBout.rotation.x = Math.PI / 2;
      upperBout.position.set(-0.08, 0.04, 0);
      gtr.add(upperBout);
      const pickguard = new T.Mesh(new T.CylinderGeometry(0.085, 0.085, 0.01, 14), softMat(T, "#f4eef8", { roughness: 0.35 }));
      pickguard.rotation.x = Math.PI / 2;
      pickguard.position.set(-0.05, -0.05, 0.024);
      gtr.add(pickguard);
      const neck = new T.Mesh(new T.BoxGeometry(0.048, 0.44, 0.024), softMat(T, "#2a1f36"));
      neck.position.set(-0.08, 0.31, 0.005);
      gtr.add(neck);
      const head = new T.Mesh(new T.BoxGeometry(0.075, 0.11, 0.024), softMat(T, "#191322"));
      head.position.set(-0.08, 0.56, 0.005);
      head.rotation.z = 0.14;
      gtr.add(head);
      torso.add(gtr);
    } else if (spec.prop === "tray") {
      const tray = new T.Group();
      tray.position.set(0.0, -0.02, 0.09);
      tray.rotation.x = 1.20;
      const plate = new T.Mesh(new T.CylinderGeometry(0.19, 0.17, 0.022, 18), new T.MeshStandardMaterial({ color: 0xd0d6e3, metalness: 0.65, roughness: 0.25 }));
      tray.add(plate);
      const omu = new T.Mesh(new T.SphereGeometry(0.078, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), softMat(T, "#f7c23e"));
      omu.scale.set(1.25, 0.85, 0.88);
      omu.position.set(-0.045, 0.015, 0.01);
      tray.add(omu);
      const ketchup = new T.Mesh(new T.SphereGeometry(0.026, 8, 6), softMat(T, "#e8344e"));
      ketchup.scale.set(1.2, 0.45, 0.9);
      ketchup.position.set(-0.045, 0.076, 0.01);
      tray.add(ketchup);
      const drink = new T.Mesh(new T.CylinderGeometry(0.038, 0.028, 0.13, 12), softMat(T, "#f56ca3", { emissive: 0xd93b7a, emissiveIntensity: 0.22 }));
      drink.position.set(0.075, 0.075, -0.01);
      tray.add(drink);
      const cream = new T.Mesh(new T.SphereGeometry(0.036, 10, 8), softMat(T, "#fff8fc"));
      cream.position.set(0.075, 0.142, -0.01);
      tray.add(cream);
      rHand.add(tray);
    } else if (spec.prop === "console") {
      const con = new T.Mesh(new T.BoxGeometry(0.18, 0.10, 0.03), softMat(T, "#2a273d", { emissive: 0x2fd4db, emissiveIntensity: 0.35 }));
      con.position.set(0.06, 0.0, 0.10);
      rHand.add(con);
    } else if (spec.prop === "glowsticks") {
      const sL = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.28, 8), softMat(T, "#ff5fa8", { emissive: 0xff3b94, emissiveIntensity: 0.85 }));
      sL.position.set(0, 0.10, 0.05);
      lHand.add(sL);
      const sR = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.28, 8), softMat(T, "#b66bff", { emissive: 0x9b4dff, emissiveIntensity: 0.85 }));
      sR.position.set(0, 0.10, 0.05);
      rHand.add(sR);
    } else if (spec.prop === "fan") {
      const stick = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 0.16, 6), softMat(T, "#241d2e"));
      stick.position.set(0, 0.06, 0.04);
      rHand.add(stick);
      const heart = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.02, 14), softMat(T, "#f08ab8"));
      heart.rotation.x = Math.PI / 2;
      heart.position.set(0, 0.19, 0.04);
      rHand.add(heart);
    } else if (spec.prop === "gimbal") {
      const g = new T.Mesh(new T.BoxGeometry(0.05, 0.14, 0.05), softMat(T, "#363348"));
      g.position.set(0, 0.05, 0.06);
      rHand.add(g);
    } else if (spec.prop === "drink") {
      const cup = new T.Mesh(new T.CylinderGeometry(0.042, 0.032, 0.12, 10), softMat(T, "#f084b0"));
      cup.position.set(0, 0.01, 0.05);
      rHand.add(cup);
    }
  }

  function create3DCharacter(T, texKey, targetH) {
    const spec = CHAR_SPECS[texKey] || CHAR_SPECS.chibi_guest_office;
    const root = new T.Group();
    const scaleFactor = (targetH || 1.88) / 1.88;

    const rigRoot = new T.Group();
    rigRoot.scale.setScalar(scaleFactor);
    root.add(rigRoot);

    const skinMat = softMat(T, spec.skin, { roughness: 0.68, emissive: spec.skin, emissiveIntensity: 0.08 });
    const topPlainMat = softMat(T, spec.topColor);
    const topTexMat = softMat(T, "#ffffff", { map: makeOutfitTexture(T, texKey, spec) });
    const shoeMat = softMat(T, spec.shoeColor || "#1f1a26", { roughness: 0.45 });
    const sockMat = softMat(T, spec.sockColor || spec.pantsColor || spec.skin);
    const pantsMat = softMat(T, spec.pantsColor || spec.skirtColor || "#221d2e");
    const accentMat = softMat(T, spec.accentColor || "#ff5f91");

    // 1. HIPS / PELVIS (base y = 0.76)
    const baseHipY = 0.76;
    const hips = new T.Group();
    hips.position.y = baseHipY;
    rigRoot.add(hips);

    const pelvis = addShadow(new T.Mesh(new T.SphereGeometry(0.145, 14, 10), pantsMat));
    pelvis.scale.set(1.06, 0.85, 0.92);
    hips.add(pelvis);

    // 2. ARTICULATED 3D LEGS (Hip -> Thigh -> Knee -> Shin -> Shoe)
    const buildLeg = (side) => {
      const isPants = spec.outfit === "barista" || spec.outfit === "trench_suit" || spec.outfit === "cargo_jacket";
      const hipJ = new T.Group();
      hipJ.position.set(side * 0.095, -0.02, 0);
      hips.add(hipJ);

      const thighMat = isPants ? pantsMat : skinMat;
      const thigh = addShadow(new T.Mesh(new T.CylinderGeometry(0.072, 0.058, 0.32, 12), thighMat));
      thigh.position.y = -0.16;
      hipJ.add(thigh);

      const kneeJ = new T.Group();
      kneeJ.position.y = -0.32;
      hipJ.add(kneeJ);

      const kneeCap = new T.Mesh(new T.SphereGeometry(0.056, 10, 8), isPants ? pantsMat : skinMat);
      kneeJ.add(kneeCap);

      const shin = addShadow(new T.Mesh(new T.CylinderGeometry(0.056, 0.048, 0.30, 12), isPants ? pantsMat : sockMat));
      shin.position.y = -0.15;
      kneeJ.add(shin);

      const foot = new T.Group();
      foot.position.y = -0.32;
      kneeJ.add(foot);

      const shoe = addShadow(new T.Mesh(new T.CapsuleGeometry(0.058, 0.09, 6, 10), shoeMat));
      shoe.rotation.x = Math.PI / 2;
      shoe.scale.set(0.95, 1.0, 0.78);
      shoe.position.set(0, -0.02, 0.035);
      foot.add(shoe);

      return { hip: hipJ, knee: kneeJ, foot };
    };

    const leftLeg = buildLeg(1);
    const rightLeg = buildLeg(-1);

    // 3. TORSO & 3D LAYERED OUTFIT (with painted outfit textures facing +Z!)
    const torso = new T.Group();
    torso.position.y = 0.05;
    hips.add(torso);

    const chest = addShadow(new T.Mesh(new T.CylinderGeometry(0.146, 0.126, 0.42, 18), topTexMat));
    chest.position.y = 0.21;
    // Cylinder UV u=0.5 faces -Z by default, so rotate PI to put painted front details cleanly on +Z chest!
    chest.rotation.y = Math.PI;
    torso.add(chest);

    // Smooth rounded shoulder/collar dome so torso doesn't have a sharp flat cylinder top
    const chestCap = new T.Mesh(new T.SphereGeometry(0.145, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), topPlainMat);
    chestCap.scale.set(1.0, 0.42, 0.96);
    chestCap.position.y = 0.415;
    torso.add(chestCap);

    if (spec.outfit === "maid_skirt" || spec.outfit === "gyaru_jacket" || spec.outfit === "jirai_cardigan") {
      const skMat = softMat(T, "#ffffff", { map: makeSkirtTexture(T, texKey, spec) });
      const skirt = addShadow(new T.Mesh(new T.CylinderGeometry(0.145, 0.31, 0.34, 20), skMat));
      skirt.position.y = -0.11;
      skirt.rotation.y = Math.PI;
      hips.add(skirt);

      const frill = new T.Mesh(new T.TorusGeometry(0.298, 0.020, 7, 22), softMat(T, "#f5ecf5"));
      frill.rotation.x = Math.PI / 2;
      frill.position.y = -0.27;
      hips.add(frill);

      // Cute waist bow on the back
      const backBow = new T.Mesh(new T.BoxGeometry(0.18, 0.10, 0.055), accentMat);
      backBow.position.set(0, -0.02, -0.185);
      hips.add(backBow);
    } else if (spec.outfit === "gothic_coat") {
      const coat = addShadow(new T.Mesh(new T.CylinderGeometry(0.15, 0.32, 0.46, 16, 1, true, Math.PI * 0.25, Math.PI * 1.5), softMat(T, spec.coatColor, { side: T.DoubleSide })));
      coat.position.y = -0.18;
      hips.add(coat);
      const gem = new T.Mesh(new T.OctahedronGeometry(0.042), softMat(T, "#a86bff", { emissive: 0x7b3fff, emissiveIntensity: 0.6 }));
      gem.position.set(0, 0.34, 0.148);
      torso.add(gem);
    } else if (spec.outfit === "barista") {
      const apron = addShadow(new T.Mesh(new T.CylinderGeometry(0.150, 0.182, 0.54, 16, 1, false, -Math.PI * 0.48, Math.PI * 0.96), softMat(T, spec.apronColor)));
      apron.position.y = 0.02;
      hips.add(apron);
    } else if (spec.outfit === "cyber_hoodie" || spec.outfit === "punk_hoodie" || spec.outfit === "cargo_jacket") {
      const jacket = addShadow(new T.Mesh(new T.CylinderGeometry(0.172, 0.215, 0.36, 16), topTexMat));
      jacket.position.y = 0.14;
      jacket.rotation.y = Math.PI;
      torso.add(jacket);
      const collar = new T.Mesh(new T.TorusGeometry(0.14, 0.032, 8, 16), softMat(T, spec.hoodieAccent || spec.accentColor || "#e6e0f5"));
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.39;
      torso.add(collar);
    } else if (spec.outfit === "trench_suit") {
      const coat = addShadow(new T.Mesh(new T.CylinderGeometry(0.158, 0.25, 0.56, 16, 1, true, Math.PI * 0.26, Math.PI * 1.48), softMat(T, spec.topColor, { side: T.DoubleSide })));
      coat.position.y = -0.02;
      hips.add(coat);
    }

    // 4. ARTICULATED 3D ARMS (with smooth rounded shoulder puff caps!)
    const buildArm = (side) => {
      const shJ = new T.Group();
      shJ.position.set(side * 0.172, 0.365, 0);
      torso.add(shJ);

      const puff = new T.Mesh(new T.SphereGeometry(0.058, 12, 10), topPlainMat);
      shJ.add(puff);

      const uArm = addShadow(new T.Mesh(new T.CapsuleGeometry(0.046, 0.15, 5, 10), topPlainMat));
      uArm.position.y = -0.10;
      shJ.add(uArm);

      const elJ = new T.Group();
      elJ.position.y = -0.20;
      shJ.add(elJ);

      const fArm = addShadow(new T.Mesh(new T.CapsuleGeometry(0.040, 0.14, 5, 10), spec.outfit === "gyaru_jacket" ? topPlainMat : skinMat));
      fArm.position.y = -0.09;
      elJ.add(fArm);

      const hand = new T.Group();
      hand.position.y = -0.19;
      elJ.add(hand);
      hand.add(new T.Mesh(new T.SphereGeometry(0.044, 10, 8), skinMat));

      return { shoulder: shJ, elbow: elJ, hand };
    };

    const leftArm = buildArm(1);
    const rightArm = buildArm(-1);

    // 5. NECK & SCULPTED 3D ANIME HEAD + LIVE BLINKING FACE
    const neck = new T.Mesh(new T.CylinderGeometry(0.054, 0.064, 0.10, 12), skinMat);
    neck.position.y = 0.455;
    torso.add(neck);

    const head = new T.Group();
    head.position.y = 0.72;
    torso.add(head);

    const faceTex = makeAnimeFaceTextures(T, texKey, spec);
    const faceMat = softMat(T, "#ffffff", { map: faceTex.open, roughness: 0.66, emissive: "#ffe4e0", emissiveIntensity: 0.09 });
    const headMesh = addShadow(new T.Mesh(new T.SphereGeometry(0.292, 32, 24), faceMat));
    headMesh.scale.set(1.03, 0.96, 0.97);
    headMesh.rotation.y = -Math.PI / 2;
    head.add(headMesh);

    [-1, 1].forEach((side) => {
      const ear = new T.Mesh(new T.SphereGeometry(0.050, 8, 8), skinMat);
      ear.scale.set(0.65, 1.0, 0.75);
      ear.position.set(side * 0.282, -0.02, 0.0);
      head.add(ear);
    });

    const hairSway = build3DHair(T, head, spec);

    const joints = {
      hips,
      torso,
      head,
      leftHip: leftLeg.hip,
      leftKnee: leftLeg.knee,
      rightHip: rightLeg.hip,
      rightKnee: rightLeg.knee,
      leftShoulder: leftArm.shoulder,
      leftElbow: leftArm.elbow,
      leftHand: leftArm.hand,
      rightShoulder: rightArm.shoulder,
      rightElbow: rightArm.elbow,
      rightHand: rightArm.hand,
      hairSway
    };

    attach3DProps(T, joints, spec);

    const pickMeshes = [];
    rigRoot.traverse((obj) => {
      if (obj.isMesh) {
        obj.userData.actorRoot = root;
        pickMeshes.push(obj);
      }
    });

    return {
      root,
      rigRoot,
      joints,
      faceMat,
      faceTex,
      spec,
      baseHipY,
      pickMeshes,
      scaleFactor
    };
  }

  function animate3DCharacter(u, t, dt, seed, mode) {
    const j = u.joints;
    const mv = u.moveBlend;
    const gp = u.gaitPhase;
    const idle = 1 - mv;

    // 1. Natural Blinking (every 2.6~5.4s for 130ms)
    u.blinkTimer -= dt;
    if (u.blinkTimer <= 0) {
      u.blinkState = !u.blinkState;
      u.blinkTimer = u.blinkState ? 0.13 : (2.6 + Math.random() * 2.8);
      if (u.faceMat && u.faceTex) {
        u.faceMat.map = u.blinkState ? u.faceTex.blink : u.faceTex.open;
        u.faceMat.needsUpdate = true;
      }
    }

    // 2. Reaction jump & wave on click
    let reactHop = 0;
    let reactWave = 0;
    if (u.reactTimer > 0) {
      const p = 1 - u.reactTimer / 0.55;
      reactHop = Math.sin(p * Math.PI) * 0.26;
      reactWave = Math.sin(p * Math.PI * 3) * 0.45;
    }

    // 3. True 3D Human Bipedal Walk Cycle (Real sagittal leg swing + natural backward knee bend!)
    const sL = Math.sin(gp);
    const sR = Math.sin(gp + Math.PI);
    let hipLX = -sL * 0.56 * mv;
    let hipRX = -sR * 0.56 * mv;
    let kneeLX = Math.max(0, Math.cos(gp - 0.35)) * 0.70 * mv;
    let kneeRX = Math.max(0, Math.cos(gp + Math.PI - 0.35)) * 0.70 * mv;

    // Smooth cosine center-of-mass walk bob (zero jitter!)
    const walkBob = ((1 - Math.cos(gp * 2)) * 0.5) * 0.032 * mv;
    let hipY = u.baseHipY + walkBob + reactHop;

    // Subtle real human pelvis & torso counter-twist + calm forward lean
    let hipTwistY = sL * 0.08 * mv;
    let torsoTwistY = -sL * 0.10 * mv;
    let torsoPitchX = 0.068 * mv;
    let torsoRollZ = Math.sin(gp) * 0.022 * mv;

    // 4. Natural Counter-Swinging Arms
    const prop = u.spec.prop;
    let shLX = sL * 0.42 * mv;
    let elLX = -0.22 - Math.max(0, -sL) * 0.24 * mv;
    let shRX = sR * 0.42 * mv;
    let elRX = -0.22 - Math.max(0, -sR) * 0.24 * mv;
    let shLZ = 0.12;
    let shRZ = -0.12;

    if (prop === "tray" || prop === "camera" || prop === "drink" || prop === "gimbal") {
      shRX = -0.42 + sR * 0.08 * mv;
      elRX = -0.78;
    } else if (prop === "coffee") {
      shRX = -0.38; elRX = -0.68;
      shLX = -0.38; elLX = -0.68;
    } else if (prop === "console") {
      shRX = -0.58; elRX = -0.82; shRZ = 0.22;
      shLX = -0.58; elLX = -0.82; shLZ = -0.22;
    } else if (prop === "guitar") {
      shRX = -0.45; elRX = -0.72;
      shLX = -0.55; elLX = -0.68;
    }

    // 5. Calm Idle Breathing & Look-Around + Role Activities
    const breath = Math.sin(t * 1.85 + seed);
    let headPitchX = -torsoPitchX * 0.45 + breath * 0.022 * idle;
    let headYawY = u.lookAngle * idle;
    let headRollZ = u.lookTilt * idle;

    if (idle > 0.1) {
      hipY += breath * 0.007 * idle;

      if (mode === "perform") {
        const beat = t * 4.6 + seed;
        const pulse = (1 - Math.cos(beat * 2)) * 0.5;
        const kneeDip = (1 - pulse) * 0.16 * idle;
        hipLX -= kneeDip * 0.6;
        hipRX -= kneeDip * 0.6;
        kneeLX += kneeDip * 1.2;
        kneeRX += kneeDip * 1.2;
        hipY -= kneeDip * 0.12;
        torsoTwistY += Math.sin(beat) * 0.12 * idle;
        headPitchX += Math.sin(beat * 2 - 0.3) * 0.065 * idle;
        if (prop === "guitar") {
          shRX += Math.sin(beat * 2) * 0.22 * idle;
        } else {
          shLX -= (0.4 + Math.sin(beat) * 0.24) * idle;
          shRX -= (0.4 - Math.sin(beat) * 0.24) * idle;
        }
      } else if (mode === "cheer") {
        const beat = t * 5.2 + seed;
        const pump = Math.sin(beat);
        const kneeDip = Math.max(0, -pump) * 0.14 * idle;
        hipLX -= kneeDip * 0.5;
        hipRX -= kneeDip * 0.5;
        kneeLX += kneeDip;
        kneeRX += kneeDip;
        hipY -= kneeDip * 0.11;
        shLX = -1.65 + pump * 0.42;
        shRX = -1.65 - pump * 0.42;
        elLX = -0.35;
        elRX = -0.35;
        headPitchX += pump * 0.05 * idle;
      } else if (mode === "training") {
        const tr = Math.sin(t * 2.6 + seed);
        torsoTwistY += tr * 0.10 * idle;
        headPitchX += tr * 0.04 * idle;
      }
    }

    if (u.reactTimer > 0) {
      shLX = -2.2;
      shLZ = 0.25 + reactWave;
      elLX = -0.35;
    }

    j.hips.position.y = hipY;
    j.hips.rotation.y = hipTwistY;

    j.leftHip.rotation.x = hipLX;
    j.leftKnee.rotation.x = kneeLX;
    j.rightHip.rotation.x = hipRX;
    j.rightKnee.rotation.x = kneeRX;

    j.torso.rotation.set(torsoPitchX, torsoTwistY, torsoRollZ);
    j.head.rotation.set(headPitchX, headYawY, headRollZ);

    j.leftShoulder.rotation.set(shLX, 0, shLZ);
    j.leftElbow.rotation.x = elLX;
    j.rightShoulder.rotation.set(shRX, 0, shRZ);
    j.rightElbow.rotation.x = elRX;

    const hairBackPitch = 0.14 * mv + Math.sin(gp - 0.5) * 0.035 * mv + Math.sin(t * 1.5 + seed) * 0.025 * idle;
    j.hairSway.forEach((p) => {
      p.rotation.x = hairBackPitch;
    });

    if (u.shadow) {
      const s = 1 - Math.min(0.24, Math.max(0, (hipY - u.baseHipY) * 0.9));
      u.shadow.scale.set(s, s, 1);
    }
    if (u.badge) {
      u.badge.position.y = u.baseH + 0.30 + (hipY - u.baseHipY) * u.scaleFactor;
    }
  }

  window.CHAR_3D_BUILDER = {
    create3DCharacter,
    animate3DCharacter
  };
})();
