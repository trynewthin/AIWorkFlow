import React from 'react';

/**
 * @description 提供彩色流光背景动画的组件，使用纯CSS
 * @returns {JSX.Element}
 */
const BlobPattern = () => {
  return (
    <div className="blob-pattern-container">
      <div className="blob-gradient"></div>
      <style jsx>{`
        .blob-pattern-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
          opacity: 0.8;
        }
        
        .blob-gradient {
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            132deg,
            rgb(45, 50, 89) 0%,
            rgb(76, 59, 122) 25%,
            rgb(35, 82, 114) 50%,
            rgb(57, 82, 126) 75%,
            rgb(45, 50, 89) 100%
          );
          filter: blur(24px);
          animation: rotate 25s linear infinite;
        }
        
        .blob-gradient::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            transparent 0%,
            rgba(0, 0, 0, 0.15) 40%,
            rgba(0, 0, 0, 0.3) 80%
          );
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default BlobPattern; 