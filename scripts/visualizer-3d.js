/**
 * ZYRO 3D Zero-G Visualizer
 * Powered by Three.js & WebGL with real-time audio reactivity
 */

class Zyro3DVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationFrameId = null;

    // Groups & Meshes
    this.mainGroup = null;
    this.outerRingGroup = null;
    this.innerRingGroup = null;
    this.particleSystem = null;
    this.coreSphere = null;
    this.ringBars = [];
    this.innerBars = [];

    // Interaction & State
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.currentMode = 'ring'; // 'ring' | 'wave' | 'nebula'
    this.idleTime = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 580;
    const height = this.container.clientHeight || 580;

    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 18);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00E5FF, 3.5, 30);
    cyanPointLight.position.set(8, 6, 8);
    this.scene.add(cyanPointLight);

    const mintPointLight = new THREE.PointLight(0x00FFA3, 4.0, 30);
    mintPointLight.position.set(-8, -6, 8);
    this.scene.add(mintPointLight);

    const whiteHighlight = new THREE.DirectionalLight(0xffffff, 2.0);
    whiteHighlight.position.set(0, 12, 12);
    this.scene.add(whiteHighlight);

    // 5. Construct Visualizer Hierarchy
    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);

    this.buildOuterRing();
    this.buildInnerRing();
    this.buildCoreSphere();
    this.buildZeroGParticles();

    // 6. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Support dragging to inspect the 3D ring
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    this.container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX += deltaY * 0.008;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    });

    // Touch support
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX += deltaY * 0.008;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // 7. Start Animation Loop
    this.animate();
  }

  buildOuterRing() {
    this.outerRingGroup = new THREE.Group();
    this.mainGroup.add(this.outerRingGroup);

    const radius = 5.6;
    const barCount = 72;
    const barGeo = new THREE.BoxGeometry(0.09, 0.45, 0.28);

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Color alternating between pure white, electric cyan, and neon mint
      let barColor = 0xffffff;
      if (i % 6 === 0) barColor = 0x00FFA3;
      else if (i % 3 === 0) barColor = 0x00E5FF;

      const mat = new THREE.MeshPhysicalMaterial({
        color: barColor,
        emissive: barColor,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.85,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.92
      });

      const mesh = new THREE.Mesh(barGeo, mat);
      mesh.position.set(x, y, 0);
      mesh.rotation.z = angle + Math.PI / 2;
      mesh.userData = {
        baseScaleY: 1.0,
        initialAngle: angle,
        index: i
      };

      this.ringBars.push(mesh);
      this.outerRingGroup.add(mesh);
    }

    // Outer smooth guide halo ring
    const haloGeo = new THREE.TorusGeometry(radius, 0.025, 16, 120);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x00FFA3,
      emissive: 0x00FFA3,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.5
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.outerRingGroup.add(haloMesh);
  }

  buildInnerRing() {
    this.innerRingGroup = new THREE.Group();
    this.mainGroup.add(this.innerRingGroup);
    this.innerRingGroup.rotation.x = Math.PI / 3.2;
    this.innerRingGroup.rotation.y = Math.PI / 5.5;

    const radius = 4.2;
    const barCount = 48;
    const barGeo = new THREE.BoxGeometry(0.07, 0.35, 0.22);

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const barColor = i % 2 === 0 ? 0x00E5FF : 0xffffff;
      const mat = new THREE.MeshPhysicalMaterial({
        color: barColor,
        emissive: barColor,
        emissiveIntensity: 0.5,
        roughness: 0.15,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85
      });

      const mesh = new THREE.Mesh(barGeo, mat);
      mesh.position.set(x, y, 0);
      mesh.rotation.z = angle + Math.PI / 2;
      mesh.userData = {
        baseScaleY: 1.0,
        initialAngle: angle,
        index: i
      };

      this.innerBars.push(mesh);
      this.innerRingGroup.add(mesh);
    }

    // Inner subtle thin ring
    const innerHaloGeo = new THREE.TorusGeometry(radius, 0.02, 16, 100);
    const innerHaloMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00E5FF,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.4
    });
    this.innerRingGroup.add(new THREE.Mesh(innerHaloGeo, innerHaloMat));
  }

  buildCoreSphere() {
    // Core geodesic holographic sphere
    const sphereGeo = new THREE.IcosahedronGeometry(2.3, 3);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x0A0C10,
      emissive: 0x00FFA3,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.95,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });

    this.coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    this.mainGroup.add(this.coreSphere);

    // Inner glowing solid mini nucleus
    const nucGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const nucMat = new THREE.MeshPhysicalMaterial({
      color: 0x00FFA3,
      emissive: 0x00FFA3,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7
    });
    this.nucleus = new THREE.Mesh(nucGeo, nucMat);
    this.mainGroup.add(this.nucleus);
  }

  buildZeroGParticles() {
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const mintColor = new THREE.Color(0x00FFA3);
    const cyanColor = new THREE.Color(0x00E5FF);
    const whiteColor = new THREE.Color(0xFFFFFF);

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical/spherical dispersion around the rings
      const radius = 3.5 + Math.random() * 5.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) + (Math.random() - 0.5) * 2;

      // Color variation
      let pColor = whiteColor;
      const rnd = Math.random();
      if (rnd < 0.45) pColor = mintColor;
      else if (rnd < 0.8) pColor = cyanColor;

      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;

      sizes[i] = Math.random() * 2.5 + 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Particle texture generator (soft circular glow)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.mainGroup.add(this.particleSystem);
  }

  setVisualizerMode(mode) {
    this.currentMode = mode;
    if (mode === 'nebula') {
      this.outerRingGroup.visible = false;
      this.innerRingGroup.visible = false;
      this.coreSphere.visible = true;
      if (this.particleSystem) {
        this.particleSystem.material.size = 0.32;
      }
    } else if (mode === 'wave') {
      this.outerRingGroup.visible = true;
      this.innerRingGroup.visible = false;
      this.coreSphere.visible = true;
      if (this.particleSystem) {
        this.particleSystem.material.size = 0.14;
      }
    } else {
      // Ring mode (default)
      this.outerRingGroup.visible = true;
      this.innerRingGroup.visible = true;
      this.coreSphere.visible = true;
      if (this.particleSystem) {
        this.particleSystem.material.size = 0.18;
      }
    }
  }

  onMouseMove(e) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.mouseX = (e.clientX / width) * 2 - 1;
    this.mouseY = -(e.clientY / height) * 2 + 1;
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.idleTime += 0.012;

    // Real-time audio frequency integration
    let freqData = null;
    let avgFreq = 0;
    let bassEnergy = 0;

    if (window.zyroAudio && window.zyroAudio.isPlaying) {
      freqData = window.zyroAudio.getFrequencyData();
      avgFreq = window.zyroAudio.getAverageFrequency();
      bassEnergy = window.zyroAudio.getBassEnergy();
    } else {
      // Gentle rhythmic idle breathing
      avgFreq = 22 + Math.sin(this.idleTime * 2.2) * 8;
      bassEnergy = 35 + Math.sin(this.idleTime * 1.5) * 12;
    }

    const bassScale = 1.0 + (bassEnergy / 255) * 0.45;
    const energyNorm = Math.min(1.0, avgFreq / 180);

    // Smooth gyroscopic rotations
    if (this.outerRingGroup) {
      this.outerRingGroup.rotation.z += 0.003 + energyNorm * 0.006;
    }
    if (this.innerRingGroup) {
      this.innerRingGroup.rotation.z -= 0.004 + energyNorm * 0.007;
      this.innerRingGroup.rotation.y = Math.PI / 5.5 + Math.sin(this.idleTime * 0.6) * 0.2;
    }
    if (this.coreSphere) {
      this.coreSphere.rotation.x += 0.002;
      this.coreSphere.rotation.y += 0.003;
      this.coreSphere.scale.set(bassScale, bassScale, bassScale);
    }
    if (this.nucleus) {
      const nucScale = 1.0 + (bassEnergy / 255) * 0.7;
      this.nucleus.scale.set(nucScale, nucScale, nucScale);
    }
    if (this.particleSystem) {
      this.particleSystem.rotation.z += 0.001 + energyNorm * 0.003;
      this.particleSystem.rotation.y += 0.0008;
    }

    // Audio reactivity for Outer Ring Bars
    if (this.ringBars.length > 0) {
      for (let i = 0; i < this.ringBars.length; i++) {
        const bar = this.ringBars[i];
        let val = 1.0;

        if (freqData && freqData.length > 0) {
          const binIdx = Math.floor((i / this.ringBars.length) * (freqData.length * 0.65));
          val = 1.0 + (freqData[binIdx] / 255) * 3.8;
        } else {
          val = 1.0 + Math.sin(this.idleTime * 3.0 + i * 0.2) * 0.45;
        }

        // Lerp scale
        bar.scale.y += (val - bar.scale.y) * 0.25;
        // Radial extrusion based on bass
        const baseRadius = 5.6 + (bassEnergy / 255) * 0.35;
        const angle = bar.userData.initialAngle;
        bar.position.x = Math.cos(angle) * baseRadius;
        bar.position.y = Math.sin(angle) * baseRadius;
      }
    }

    // Audio reactivity for Inner Ring Bars
    if (this.innerBars.length > 0) {
      for (let i = 0; i < this.innerBars.length; i++) {
        const bar = this.innerBars[i];
        let val = 1.0;
        if (freqData && freqData.length > 0) {
          const binIdx = Math.floor((i / this.innerBars.length) * (freqData.length * 0.5));
          val = 1.0 + (freqData[binIdx] / 255) * 2.8;
        } else {
          val = 1.0 + Math.cos(this.idleTime * 2.5 + i * 0.3) * 0.35;
        }
        bar.scale.y += (val - bar.scale.y) * 0.25;
      }
    }

    // Interactive mouse Parallax tilt
    this.targetRotationY += (this.mouseX * 0.4 - this.targetRotationY) * 0.05;
    this.targetRotationX += (-this.mouseY * 0.3 - this.targetRotationX) * 0.05;

    if (this.mainGroup) {
      this.mainGroup.rotation.y = this.targetRotationY;
      this.mainGroup.rotation.x = this.targetRotationX;
      // Gentle Zero-G hover float
      this.mainGroup.position.y = Math.sin(this.idleTime * 1.2) * 0.35;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

window.Zyro3DVisualizer = Zyro3DVisualizer;
