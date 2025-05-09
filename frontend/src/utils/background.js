// TODO: 底层背景样式存储器
import { reactive, readonly } from 'vue';

const backgroundStyle = reactive({});

// TODO: 设置背景样式
export function setBackground(styleObj) {
  Object.assign(backgroundStyle, styleObj);
}

// TODO: 清除背景样式
export function clearBackground() {
  Object.keys(backgroundStyle).forEach(key => delete backgroundStyle[key]);
}

// TODO: 提供只读背景样式
export default function useBackgroundStore() {
  return {
    backgroundStyle: readonly(backgroundStyle),
    setBackground,
    clearBackground
  };
} 