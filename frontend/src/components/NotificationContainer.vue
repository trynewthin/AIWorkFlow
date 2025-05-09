<template>
  <transition-group name="notification" tag="ul" class="notification-container">
    <li v-for="item in notifications" :key="item.id" class="notification-item">
      <div class="notification-content">
        <div class="notification-text">{{ item.message }}</div>
      </div>
      <div class="notification-progress-bar"></div>
    </li>
  </transition-group>
</template>

<script>
import useNotificationStore from '@/utils/notification';

export default {
  name: 'NotificationContainer',
  setup() {
    const { notifications } = useNotificationStore();
    return { notifications };
  }
};
</script>

<style scoped>
/* Notification container */
.notification-container {
  position: fixed;
  left: 50%;
  bottom: 10%;
  transform: translateX(-50%) scale(1.2);
  transform-origin: bottom center;
  z-index: 9999;

  --content-color: black;
  --background-color: #f3f3f3;
  --font-size-content: 0.75em;
  --icon-size: 1em;

  max-width: 80%;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  list-style-type: none;
  font-family: sans-serif;
  color: var(--content-color);
}

/* Notification Item */
.notification-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  gap: 1em;
  overflow: hidden;
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: rgba(111, 111, 111, 0.2) 0px 8px 24px;
  background-color: var(--background-color);
  transition: all 250ms ease;

  /* Background Pattern */
  --grid-color: rgba(225, 225, 225, 0.7);
  background-image: linear-gradient(
      0deg,
      transparent 23%,
      var(--grid-color) 24%,
      var(--grid-color) 25%,
      transparent 26%,
      transparent 73%,
      var(--grid-color) 74%,
      var(--grid-color) 75%,
      transparent 76%,
      transparent
    ),
    linear-gradient(
      90deg,
      transparent 23%,
      var(--grid-color) 24%,
      var(--grid-color) 25%,
      transparent 26%,
      transparent 73%,
      var(--grid-color) 74%,
      var(--grid-color) 75%,
      transparent 76%,
      transparent
    );
  background-size: 55px 55px;
}

.notification-item:hover {
  transform: scale(1.01);
}

.notification-item:active {
  transform: scale(1.05);
}

/* Notification content */
.notification-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5em;
}

.notification-text {
  font-size: var(--font-size-content);
  user-select: none;
}

/* Notification progress bar */
.notification-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 1px;
  background: var(--content-color);
  width: 100%;
  transform: translateX(100%);

  animation: progressBar 1.5s linear forwards;
}

@keyframes progressBar {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* 进出场动画 */
.notification-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.notification-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.notification-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.notification-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s;
}
</style> 