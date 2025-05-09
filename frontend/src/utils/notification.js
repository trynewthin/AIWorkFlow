import { reactive, readonly } from 'vue';

// TODO: 通知存储列表
const notifications = reactive([]);

// TODO: 显示通知，消息将在默认1.5s后自动消失
function notify(message) {
  const id = Date.now() + Math.random();
  notifications.push({ id, message });
  setTimeout(() => {
    const index = notifications.findIndex(item => item.id === id);
    if (index !== -1) notifications.splice(index, 1);
  }, 1500);
}

// TODO: 清空所有通知
function clearNotifications() {
  notifications.splice(0);
}

// TODO: 提供通知列表和方法
export default function useNotificationStore() {
  return {
    notifications: readonly(notifications),
    notify,
    clearNotifications
  };
} 