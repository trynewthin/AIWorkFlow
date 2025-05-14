import React from 'react';

/**
 * @description 提供彩色流光背景动画的组件，使用纯CSS
 * @returns {JSX.Element}
 */
const BlobPattern = () => {
  return (
    <div className="blob-pattern-container">
      <div className="blob-gradient"></div>
    </div>
  );
};

export default BlobPattern; 