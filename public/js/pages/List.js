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
          <!-- DDL / DCL Toggle -->
          <div style="display: flex; background: var(--color-primary-light); border-radius: 8px; border: 1px solid var(--color-border); overflow: hidden; width: 100%;">
            <button @click="store.listMode = 'main'" 
                :style="store.listMode === 'main' ? 'background: var(--color-primary); color: white;' : ''"
                style="flex: 1; padding: 10px; border: none; cursor: pointer; font-weight: bold; transition: 0.2s;">DDL</button>
            <button @click="store.listMode = 'challenge'" 
                :style="store.listMode === 'challenge' ? 'background: var(--color-primary); color: white;' : ''"
                style="flex: 1; padding: 10px; border: none; cursor: pointer; font-weight: bold; transition: 0.2s;">DCL</button>
          </div>
          
          <input v-model="searchQuery" type="text" placeholder="Search levels..." class="search-input" style="width: 100%;" />
        </div>

        <table class="list">
          <tr v-for="(item, i) in filteredList" :key="item.originalIndex">
            <td class="rank">
              <p class="type-label-lg">
                <span :class="i + 1 <= 150 ? 'goldhighlight' : ''"
                   :style="i + 1 > 150 ? 'color: var(--color-text-legacy)' : ''">
                  #{{ i + 1 }}
                </span>
              </p>
            </td>
            <td class="level" :class="{ 'active': selected == item.originalIndex }">
              <button @click="selected = item.originalIndex">
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
          <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
          <ul class="stats">
            <li><div class="type-title-sm">Points</div><p>{{ score(selected + 1, 100, level.percentToQualify) }}</p></li>
            <li><div class="type-title-sm">ID</div><p>{{ level.id || 'N/A' }}</p></li>
            <li><div class="type-title-sm">FPS</div><p>{{ level.hz || 'Any' }}</p></li>
          </ul>
          <h2>Records</h2>
          <p v-if="selected + 1 <= 150"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
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
            <button onclick="window.location.href='/#/upcoming'" class="btn-goto-admin" style="background: var(--color-primary-light); border-style: solid; color: white;">
              ✨ View Upcoming Levels
            </button>
          </div>
          <h3>List Editors</h3>
          <ol class="editors">
            <li v-for="editor in editors">
              <img :src="\`/assets/\${roleIconMap[editor.role]}-dark.svg\`">
              <p>{{ editor.name }}</p>
            </li>
          </ol>
          <h3>Submission Rules</h3>
          <div v-if="rules" v-for="rule in rules.level_rules" class="rule-text" v-html="parseRule(rule)"></div>
        </div>
      </div>
    </main>
  `,
  data: () => ({ list: [], editors: [], rules: null, loading: true, selected: 0, searchQuery: "", store, roleIconMap }),
  computed: {
    filteredList() {
      if (!this.list) return [];
      // Фильтруем по типу (DDL или DCL)
      const typeToFilter = store.listMode === 'main' ? 'main' : 'challenge';
      let mapped = this.list
        .map(([level, err], index) => ({ level, err, originalIndex: index }))
        .filter(item => item.level && (item.level.type || 'main') === typeToFilter);

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        mapped = mapped.filter(i => i.level.name.toLowerCase().includes(q));
      }
      return mapped;
    },
    level() { return this.list[this.selected] && this.list[this.selected][0]; },
    video() { return embed(this.level.verification); }
  },
  async mounted() {
    this.list = await fetchList();
    this.editors = await fetchEditors();
    this.rules = await fetchRules();
    this.loading = false;
  },
  methods: { embed, score, parseRule(text) { return text; } } // Упростил для примера
};
