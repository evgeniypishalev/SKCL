import routes from './routes.js';

export const store = Vue.reactive({
  dark: JSON.parse(localStorage.getItem('dark')) || false,
  listMode: 'main', // Вот это важно
  toggleDark() {
    this.dark = !this.dark;
    localStorage.setItem('dark', JSON.stringify(this.dark));
  },
});

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  let title = "Sakupen Circles List";
  if (to.path === '/leaderboard') title = "Leaderboard | SKCL";
  else if (to.path === '/roulette') title = "Roulette | SKCL";
  else if (to.path === '/admin') title = "Admin Panel | SKCL";
  else if (to.path === '/manage') title = "Management Panel | SKCL";
  else if (to.path === '/upcoming') title = "Upcoming | SKCL";

  document.title = title;
  next();
});

const app = Vue.createApp({
  data: () => ({ store }),
});

app.use(router);
app.mount('#app');
