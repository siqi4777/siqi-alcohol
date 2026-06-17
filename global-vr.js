// global-vr.js 的基础逻辑模板

function initGlobalVR() {
    // 1. 动态创建一个全站统一的 VR 按钮
    const vrBtn = document.createElement('button');
    vrBtn.innerText = "VR";
    // 这里可以加上你统一的赛博朋克粉/蓝色 CSS 样式
    vrBtn.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 9999;
        background: rgba(255, 100, 180, 0.2);
        border: 1px solid #ff64b4;
        color: #ffb0d8;
        padding: 10px 20px;
        border-radius: 30px;
        font-family: 'AkzidenzGrotesk-Extended', monospace;
        cursor: pointer;
        backdrop-filter: blur(8px);
    `;
    
    document.body.appendChild(vrBtn);

    // 2. 绑定点击事件，检测当前页面的运行环境
    vrBtn.addEventListener('click', () => {
        // 情况 A: 如果当前页面是 A-Frame (比如你的 neon dreams 页面)
        if (document.querySelector('a-scene')) {
            const scene = document.querySelector('a-scene');
            scene.enterVR(); // 直接调用 A-Frame 原生的进入 VR 方法
        } 
        // 情况 B: 如果当前页面是高斯粒子 / 原生 Three.js (比如 F1.html)
        else if (window.viewer && window.viewer.camera) {
            // 这里需要调用 Three.js 的 VR 或者 StereoEffect 逻辑
            alert("即将为高斯粒子场景开启双目 VR 分屏！");
            // enableStereoEffect(window.viewer.camera, window.viewer.renderer);
        } else {
            console.log("当前页面未检测到支持的 3D 场景");
        }
    });
}

// 页面加载完毕后执行
window.addEventListener('DOMContentLoaded', initGlobalVR);