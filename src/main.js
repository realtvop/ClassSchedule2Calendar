import { createApp } from 'vue';
import 'mdui';
import { setColorScheme } from 'mdui';
import 'mdui/mdui.css';
import './style.css';
import App from './App.vue';

setColorScheme("#64c8ff");
createApp(App)
    .mount('#app');