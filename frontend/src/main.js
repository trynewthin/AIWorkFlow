import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.less';
import './assets/tailwind.css'; // 导入 Tailwind CSS
import Router from './router/index';

const app = createApp(App)

app.use(Router).mount('#app')
