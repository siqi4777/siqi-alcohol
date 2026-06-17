// global-vr.js
window.isVRMode = false; // 记录当前是否是 VR 状态

export async function initVRMode(options = {}) {
    // 1. 创建全站统一的 VR 按钮（左下角）
    const vrBtn = document.createElement('button');
    vrBtn.innerText = "🕶️ ENTER VR";
    vrBtn.style.cssText = `
        position: fixed; bottom: 24px; left: 24px; z-index: 9999;
        background: rgba(0, 210, 255, 0.15); border: 1px solid rgba(0, 210, 255, 0.4);
        color: #88ddff; padding: 10px 20px; border-radius: 30px;
        font-family: 'AkzidenzGrotesk-Extended', monospace, sans-serif;
        font-size: 12px; cursor: pointer; backdrop-filter: blur(8px);
        transition: all 0.3s; box-shadow: 0 0 10px rgba(0, 210, 255, 0.2);
    `;
    document.body.appendChild(vrBtn);

    // ==== 如果是 A-Frame 场景 (你的 neon dreams 页面) ====
    if (document.querySelector('a-scene')) {
        vrBtn.addEventListener('click', () => { document.querySelector('a-scene').enterVR(); });
        return; 
    }

    // ==== 下面是你现在这种高斯粒子场景的逻辑 ====
    const viewer = options.viewer;
    const THREE = options.THREE;
    if (!viewer || !THREE) return;

    let stereoEffect = null;
    let orientationControls = null;
    let originalRender = null;

    vrBtn.addEventListener('click', async () => {
        if (!window.isVRMode) {
            window.isVRMode = true; // 进入 VR
            
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();

            // 动态加载分屏和陀螺仪组件
            const { StereoEffect } = await import('https://unpkg.com/three@0.160.0/examples/jsm/effects/StereoEffect.js');
            const { DeviceOrientationControls } = await import('https://unpkg.com/three@0.160.0/examples/jsm/controls/DeviceOrientationControls.js');

            if (!stereoEffect) {
                stereoEffect = new StereoEffect(viewer.renderer);
                stereoEffect.setSize(window.innerWidth, window.innerHeight);
            }

            // 请求手机陀螺仪权限 (iPhone 必须)
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission !== 'granted') {
                        alert("需要陀螺仪权限才能转头！"); window.isVRMode = false; return;
                    }
                } catch (e) { console.log(e); }
            }

            if (!orientationControls) orientationControls = new DeviceOrientationControls(viewer.camera);

            // 核心：强行接管高斯渲染器，把原画面劈成两半
            if (!originalRender) {
                originalRender = viewer.renderer.render.bind(viewer.renderer);
                viewer.renderer.render = function(scene, camera) {
                    if (window.isVRMode) {
                        if (orientationControls) orientationControls.update(); 
                        viewer.renderer.render = originalRender;
                        stereoEffect.render(scene, camera); // 渲染双屏
                        viewer.renderer.render = this; 
                    } else {
                        originalRender(scene, camera);
                    }
                };
            }

            // 按钮变粉色
            vrBtn.innerText = "❌ EXIT VR";
            vrBtn.style.background = "rgba(255, 100, 180, 0.2)";
            vrBtn.style.borderColor = "#ff64b4";
            vrBtn.style.color = "#ffb0d8";

        } else {
            window.isVRMode = false; // 退出 VR
            if (document.exitFullscreen) document.exitFullscreen();
            
            viewer.renderer.setScissorTest(false);
            viewer.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            viewer.renderer.setSize(window.innerWidth, window.innerHeight);

            // 按钮恢复蓝色
            vrBtn.innerText = "🕶️ ENTER VR";
            vrBtn.style.background = "rgba(0, 210, 255, 0.15)";
            vrBtn.style.borderColor = "rgba(0, 210, 255, 0.4)";
            vrBtn.style.color = "#88ddff";
        }
    });

    window.addEventListener('resize', () => {
        if (window.isVRMode && stereoEffect) stereoEffect.setSize(window.innerWidth, window.innerHeight);
    });
}
// 启动全局 VR 按钮
        import { initVRMode } from './global-vr.js';
        initVRMode({ viewer: viewer, THREE: THREE });