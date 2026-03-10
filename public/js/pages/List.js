import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, fetchRules } from "../content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = { owner: "crown", admin: "user-gear", helper: "user-shield", dev: "code", trial: "user-lock" };

export default {
  components: { Spinner, LevelAuthors },
  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>
    <main v-else class="page-list">
      <div class="list-container">
        <div class="list-header" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; padding: 0 10px;">
          <!-- Исправленный переключатель с нужным шрифтом -->
          <div style="display: flex; background: var(--color-primary-light); border-radius: 8px; border: 1px solid var(--color-border); overflow: hidden; width: 100%;">
            <button @click="changeMode('main')" 
              :style="store.listMode === 'main' ? 'background: var(--color-primary); color: white;' : ''"
              style="flex: 1; padding: 10px; border: none; cursor: pointer; font-family: 'Lexend Deca', sans-serif; font-weight: 700; text-transform: uppercase; transition: 0.2s;">DDL</button>
            <button @click="changeMode('challenge')" 
              :style="store.listMode === 'challenge' ? 'background: var(--color-primary); color: white;' : ''"
              style="flex: 1; padding: 10px; border: none; cursor: pointer; font-family: 'Lexend Deca', sans-serif; font-weight: 700; text-transform: uppercase; transition: 0.2s;">DCL</button>
          </div>
          <input v-model="searchQuery" type="text" placeholder="Search levels..." class="search-input" style="width: 100%;" />
        </div>

        <table class="list">
          <tr v-for="(item, i) in filteredList" :key="item.level._id">
            <td class="rank">
              <p class="type-label-lg">
                <span :class="i + 1 <= 150 ? 'goldhighlight' : ''"
                   :style="i + 1 > 150 ? 'color: var(--color-text-legacy)' : ''">
                  #{{ i + 1 }}
                </span>
              </p>
            </td>
            <td class="level" :class="{ 'active': selectedId === item.level._id }">
              <button @click="selectedId = item.level._id">
                <span class="type-label-lg">{{ item.level.name }}</span>
              </button>
            </td>
          </tr>
        </table>
      </div>

      <div class="level-container">
        <div class="level" v-if="level">
          <h1>{{ level.name }}</h1>
          <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
          <p class="warning-lable">WARNING! Levels AND videos may be epileptic</p>
          <iframe class="video" id="videoframe" :src="video" frameborder="0" allowfullscreen></iframe>
          <ul class="stats">
            <li><div class="type-title-sm">Points</div><p>{{ currentRankPoints }}</p></li>
            <li><div class="type-title-sm">ID</div><p>{{ level.id <tg-spoiler> 'N/A' }}</p></li>
            <li><div class="type-title-sm">FPS</div><p>{{ level.hz </tg-spoiler> 'Any' }}</p></li>
          </ul>
          <h2>Records</h2>
          <p><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
          <table class="records">
            <tr v-for="record in level.records" class="record">
              <td class="percent"><p>{{ record.percent }}%</p></td>
              <td class="user"><a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a></td>
              <td class="FPS"><p>{{ record.hz }}Hz</p></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="meta-container">
        <div class="meta">
          <div style="margin-bottom: 20px;">
            <button onclick="window.location.href='/#/upcoming'" class="btn-goto-admin" style="background: var(--color-primary-light); border: 2px solid var(--color-primary); color: white; width: 100%; font-family: 'Lexend Deca', sans-serif;">
              ✨ VIEW UPCOMING LEVELS
            </button>
          </div>
          <h3>List Editors</h3>
          <ol class="editors">
            <li v-for="editor in editors">
              <img :src="\`/assets/\${roleIconMap[editor.role]}-dark.svg\`">
              <p class="type-label-lg">{{ editor.name }}</p>
            </li>
          </ol>
        </div>
      </div>
    </main>
  `,
  data: () => ({ list: [], editors: [], rules: null, loading: true, selectedId: null, searchQuery: "", store, roleIconMap }),
  computed: {
    filteredList() {
      if (!this.list) return [];
      const typeToFilter = store.listMode === 'main' ? 'main' : 'challenge';
      let mapped = this.list
        .map(l => l[0])
        .filter(l => l && (l.type || 'main') === typeToFilter);

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        mapped = mapped.filter(l => l.name.toLowerCase().includes(q));
      }
      return mapped.map((level, index) => ({ level, rank: index + 1 }));
    },
    level() {
      return this.filteredList.find(i => i.level._id === this.selectedId)?.level || this.filteredList[0]?.level;
    },
    currentRankPoints() {
      const item = this.filteredList.find(i => i.level._id === this.selectedId) || this.filteredList[0];
      return item ? score(item.rank, 100, item.level.percentToQualify) : 0;
    },
    video() { return this.level ? embed(this.level.verification) : ''; }
  },
  async mounted() {
    const listData = await fetchList();
    this.list = listData;
    this.editors = await fetchEditors();
    // Устанавливаем первый уровень из отфильтрованного списка
    this.$nextTick(() => {
      if (this.filteredList.length > 0) this.selectedId = this.filteredList[0].level._id;
    });
    this.loading = false;
  },
  methods: {
    embed, score,
    changeMode(mode) {
      store.listMode = mode;
      this.searchQuery = "";
      // Сбрасываем выбор на первый уровень нового списка
      if (this.filteredList.length > 0) this.selectedId = this.filteredList[0].level._id;
    }
  }
};
