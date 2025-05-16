import React from 'react';

/**
 * @description 提供多彩流光背景动画的组件，使用多个不同颜色、大小的光球
 * @returns {JSX.Element}
 */
const BlobPattern = () => {
  return (
    <div className="blob-pattern-container">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <div className="blob blob-4"></div>
      <div className="blob blob-5"></div>
      <div className="blob blob-6"></div>
      <div className="base-gradient"></div>
      
      <style jsx>{`
        .blob-pattern-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
          background-color: #111827; /* 深色背景 */
        }
        
        .base-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(25, 30, 60, 0.3) 0%,
            rgba(15, 20, 40, 0.6) 50%,
            rgba(10, 10, 25, 0.8) 100%
          );
        }
        
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          mix-blend-mode: screen;
          animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.95);
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        
        .blob-1 {
          width: 40vw;
          height: 40vw;
          left: 0%;
          top: 15%;
          background: linear-gradient(to right, #ff3e88, #ff5b49);
          animation: float-1 14s infinite;
        }
        
        .blob-2 {
          width: 50vw;
          height: 50vw;
          right: -10%;
          top: -20%;
          background: linear-gradient(to right, #7928ca, #3d67ff);
          animation: float-2 16s infinite;
        }
        
        .blob-3 {
          width: 45vw;
          height: 45vw;
          right: 10%;
          bottom: 0%;
          background: linear-gradient(to right, #0ea5e9, #6366f1);
          animation: float-3 18s infinite;
        }
        
        .blob-4 {
          width: 30vw;
          height: 30vw;
          left: 20%;
          bottom: 10%;
          background: linear-gradient(to right, #10b981, #3b82f6);
          animation: float-4 15s infinite;
        }
        
        .blob-5 {
          width: 25vw;
          height: 25vw;
          left: 45%;
          top: 30%;
          background: linear-gradient(to right, #f59e0b, #ef4444);
          animation: float-5 12s infinite;
        }
        
        .blob-6 {
          width: 35vw;
          height: 35vw;
          left: 0%;
          bottom: -10%;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          animation: float-6 20s infinite;
        }
        
        @keyframes float-1 {
          0% { transform: translate(0, 0) scale(0.9) rotate(0deg); }
          100% { transform: translate(100px, 50px) scale(1.1) rotate(10deg); }
        }
        
        @keyframes float-2 {
          0% { transform: translate(0, 0) scale(0.85) rotate(0deg); }
          100% { transform: translate(-70px, 80px) scale(1) rotate(-15deg); }
        }
        
        @keyframes float-3 {
          0% { transform: translate(0, 0) scale(0.8) rotate(0deg); }
          100% { transform: translate(-120px, -60px) scale(1.05) rotate(20deg); }
        }
        
        @keyframes float-4 {
          0% { transform: translate(0, 0) scale(0.95) rotate(0deg); }
          100% { transform: translate(50px, -90px) scale(1.15) rotate(-10deg); }
        }
        
        @keyframes float-5 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { transform: translate(-50px, -30px) scale(1.2) rotate(15deg); }
        }
        
        @keyframes float-6 {
          0% { transform: translate(0, 0) scale(0.75) rotate(0deg); }
          100% { transform: translate(80px, -40px) scale(0.95) rotate(-20deg); }
        }
      `}</style>
    </div>
  );
};

export default BlobPattern; 