// global-vr.js
window.isVRMode = false; // 记录当前是否是 VR 状态

window.initVRMode = async function(options = {}) {
    const vrBtn = document.createElement('button');
    vrBtn.innerText = "VR";
    vrBtn.style.cssText = `
        position: fixed; 
        bottom: 24px; 
        left: 24px; 
        z-index: 9999;
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

    vrBtn.onmouseover = () => {
        vrBtn.style.background = "rgb(255, 0, 132)";
        vrBtn.style.boxShadow = "0 0 20px rgba(255, 100, 180, 0.5)";
    };
    vrBtn.onmouseout = () => {
        if (!window.isVRMode) {
            vrBtn.style.background = "rgba(255, 100, 180, 0.25)";
            vrBtn.style.boxShadow = "0 0 15px rgba(255, 100, 180, 0.3)";
        }
    };

    if (document.querySelector('a-scene')) {
        vrBtn.addEventListener('click', () => { document.querySelector('a-scene').enterVR(); });
        return; 
    }

    const viewer = options.viewer;
    const THREE = options.THREE;
    if (!viewer || !THREE) return;

    let stereoEffect = null;
    let orientationControls = null;
    let originalRender = null;

    vrBtn.addEventListener('click', async () => {
        if (!window.isVRMode) {
            window.isVRMode = true; 
            
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(e => console.warn(e));
            }

            // 从网络加载分屏和陀螺仪组件
            const { StereoEffect } = await import('https://unpkg.com/three@0.160.0/examples/jsm/effects/StereoEffect.js');
            const { DeviceOrientationControls } = await import('https://unpkg.com/three@0.160.0/examples/jsm/controls/DeviceOrientationControls.js');

            if (!stereoEffect) {
                stereoEffect = new StereoEffect(viewer.renderer);
                stereoEffect.setSize(window.innerWidth, window.innerHeight);
            }

            // iOS 13+ 需要请求陀螺仪权限
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission !== 'granted') {
                        alert("需要陀螺仪权限才能随着头部转动视角！"); 
                        window.isVRMode = false; 
                        return;
                    }
                } catch (e) { console.log(e); }
            }

            if (!orientationControls) orientationControls = new DeviceOrientationControls(viewer.camera);

            // ================= 核心修复部分 =================
            if (!originalRender) {
                originalRender = viewer.renderer.render.bind(viewer.renderer);
                
                // 将拦截函数赋值给一个明确的变量，避免 this 指向错误
                const patchedRender = function(scene, camera) {
                    if (window.isVRMode) {
                        if (orientationControls) orientationControls.update(); 
                        
                        // 临时恢复原生 render，防止 StereoEffect 内部调用时死循环
                        viewer.renderer.render = originalRender;
                        // 渲染左右分屏（内部会调用两次原生 render）
                        stereoEffect.render(scene, camera); 
                        // 重新挂载拦截函数
                        viewer.renderer.render = patchedRender; 
                    } else {
                        originalRender(scene, camera);
                    }
                };
                viewer.renderer.render = patchedRender;
            }
            // ===============================================

            vrBtn.innerText = "❌ EXIT VR";
            vrBtn.style.background = "rgba(255, 100, 180, 0.5)";

        } else {
            window.isVRMode = false; 
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(e => {});
            }
            
            // 退出 VR 时，重置视口和裁剪
            viewer.renderer.setScissorTest(false);
            viewer.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            viewer.renderer.setSize(window.innerWidth, window.innerHeight);

            vrBtn.innerText = "🕶️ ENTER VR";
            vrBtn.style.background = "rgba(255, 100, 180, 0.25)";
        }
    });

    window.addEventListener('resize', () => {
        if (window.isVRMode && stereoEffect) {
            stereoEffect.setSize(window.innerWidth, window.innerHeight);
        }
    });
};