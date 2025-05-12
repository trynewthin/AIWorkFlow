/**
 * @description 页面菜单配置
 *
 * 使用指南：
 * 1. pageKey 对应 TopNav 中根据路径计算的键值，如 ''、'knowledge'、'knowledgeDetail' 等。
 * 2. 每个 pageKey 对应一个菜单项数组，数组项对象属性说明：
 *    - key: string 唯一标识，用于渲染和引用。
 *    - label: string 显示在菜单按钮上的文字。
 *    - onClick: () => void 点击时执行的函数，可调用业务逻辑或派发全局事件。
 * 3. 若需在页面中打开弹窗，可在 onClick 中使用全局事件：
 *    window.dispatchEvent(new CustomEvent('openCreateKB'));
 * 4. 若需自定义页面菜单，可在父组件中通过 TopNav 的 menuItems 属性传入覆盖默认配置。
 *
 * @type {{ [key: string]: { key: string; label: string; onClick: () => void; }[] }}
 */
const pageMenus = {
  '': [
    { key: 'refresh', label: '刷新', onClick: () => window.location.reload() }
  ],
  'knowledge': [
    { key: 'new', label: '新建知识库', onClick: () => window.dispatchEvent(new CustomEvent('openCreateKB')) }
  ],
  'knowledgeDetail': [
    { key: 'addDocument', label: '添加文档', onClick: () => window.dispatchEvent(new CustomEvent('openAddDocument')) }
  ]
};

export default pageMenus; 