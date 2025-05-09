// TODO: 路由背景样式配置
const backgroundConfig = {
  Home: { background: 'linear-gradient(to right, #4e54c8, #8f94fb)' },
  Test: { background: 'url("/images/test-bg.jpg") no-repeat center/cover' },
  KnowledgeList: {
    '--color': '#E1E1E1',
    backgroundColor: '#F3F3F3',
    backgroundImage: 'linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent)',
    backgroundSize: '55px 55px'
  },
  KnowledgeDetail: {
    '--color': '#E1E1E1',
    backgroundColor: '#F3F3F3',
    backgroundImage: 'linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent)',
    backgroundSize: '55px 55px'
  }
};

// TODO: 根据路由名获取对应背景样式
export default function getBackgroundStyle(name) {
  return backgroundConfig[name];
} 