// global-vr.js
window.isVRMode = false; // 记录当前是否是 VR 状态

// 核心改动：不再使用 export，而是直接挂载到全局 window 对象上
window.initVRMode = async function(options = {}) {
// 在 global-vr.js 中找到并替换创建按钮的部分：
const vrBtn = document.createElement('button');
vrBtn.innerText = "VR";
vrBtn.style.cssText = `
    position: fixed; 
    bottom: 24px; 
    left: 24px; 
    z-index: 9999;
    /* 这是你想要的粉色系配色 */
    background: rgba(255, 100, 180, 0.25); 
    border: 1px solid #ff64b4;
    color: #ffb0d8;
    padding: 10px 20px; 
    border-radius: 30px;
    font-family: 'AkzidenzGrotesk-Extended', monospace, sans-serif;
    font-size: 12px; 
    cursor: pointer; 
    backdrop-filter: blur(8px);
    transition: all 0.3s; 
    box-shadow: 0 0 15px rgba(255, 100, 180, 0.3);
`;
document.body.appendChild(vrBtn);

// 鼠标悬停时的粉色发光效果
vrBtn.onmouseover = () => {
    vrBtn.style.background = "rgb(255, 0, 132)";
    vrBtn.style.boxShadow = "0 0 20px rgba(255, 100, 180, 0.5)";
};
vrBtn.onmouseout = () => {
    vrBtn.style.background = "rgba(255, 100, 180, 0.25)";
    vrBtn.style.boxShadow = "0 0 15px rgba(255, 100, 180, 0.3)";
};

    // ==== 如果是 A-Frame 场景 (比如 neon dreams 页面) ====
    if (document.querySelector('a-scene')) {
        vrBtn.addEventListener('click', () => { document.querySelector('a-scene').enterVR(); });
        return; 
    }

    // ==== 高斯粒子场景逻辑 ====
    const viewer = options.viewer;
    const THREE = options.THREE;
    if (!viewer || !THREE) return;

    let stereoEffect = null;
    let orientationControls = null;
    let originalRender = null;

    vrBtn.addEventListener('click', async () => {
        if (!window.isVRMode) {
            window.isVRMode = true; 
            
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();

            // 从网络加载分屏和陀螺仪组件，避开本地黑屏
            const { StereoEffect } = await import('https://unpkg.com/three@0.160.0/examples/jsm/effects/StereoEffect.js');
            const { DeviceOrientationControls } = await import('https://unpkg.com/three@0.160.0/examples/jsm/controls/DeviceOrientationControls.js');

            if (!stereoEffect) {
                stereoEffect = new StereoEffect(viewer.renderer);
                stereoEffect.setSize(window.innerWidth, window.innerHeight);
            }

            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission !== 'granted') {
                        alert("需要陀螺仪权限才能转头！"); window.isVRMode = false; return;
                    }
                } catch (e) { console.log(e); }
            }

            if (!orientationControls) orientationControls = new DeviceOrientationControls(viewer.camera);

            if (!originalRender) {
                originalRender = viewer.renderer.render.bind(viewer.renderer);
                viewer.renderer.render = function(scene, camera) {
                    if (window.isVRMode) {
                        if (orientationControls) orientationControls.update(); 
                        viewer.renderer.render = originalRender;
                        stereoEffect.render(scene, camera); 
                        viewer.renderer.render = this; 
                    } else {
                        originalRender(scene, camera);
                    }
                };
            }

            vrBtn.innerText = "❌ EXIT VR";
            vrBtn.style.background = "rgba(255, 100, 180, 0.2)";
            vrBtn.style.borderColor = "#ff64b4";
            vrBtn.style.color = "#ffb0d8";

        } else {
            window.isVRMode = false; 
            if (document.exitFullscreen) document.exitFullscreen();
            
            viewer.renderer.setScissorTest(false);
            viewer.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            viewer.renderer.setSize(window.innerWidth, window.innerHeight);

            vrBtn.innerText = "🕶️ ENTER VR";
            vrBtn.style.background = "rgba(0, 210, 255, 0.15)";
            vrBtn.style.borderColor = "rgba(0, 210, 255, 0.4)";
            vrBtn.style.color = "#88ddff";
        }
    });

    window.addEventListener('resize', () => {
        if (window.isVRMode && stereoEffect) stereoEffect.setSize(window.innerWidth, window.innerHeight);
    });
};