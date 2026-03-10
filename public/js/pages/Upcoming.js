import { fetchList } from '../content.js';
import { embed } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
  components: { Spinner },
  template: `
    <main v-if="loading"><Spinner></Spinner></main>
    <main v-else class="page-list">
      <div class="list-container">
        <div class="list-header" style="padding: 10px;">
          <h2 class="type-h2" style="color: var(--color-primary-level); margin-bottom: 15px;">UPCOMING</h2>
        </div>
        <table class="list">
          <tr v-for="(lvl, i) in upcomingLevels" :key="lvl._id">
            <td class="rank"><p class="type-label-lg">#{{ i + 1 }}</p></td>
            <td class="level" :class="{ 'active': selectedId === lvl._id }">
              <button @click="selectedId = lvl._id">
                <span class="type-label-lg">{{ lvl.name }}</span>
              </button>
            </td>
          </tr>
        </table>
      </div>

      <div class="level-container">
        <div class="level" v-if="level">
          <h1>{{ level.name }}</h1>
          <div class="level-authors">
            <div class="type-title-sm">CREATOR</div><p class="type-body">{{ level.creators?.join(', ') || level.author }}</p>
            <div class="type-title-sm">PUBLISHER</div><p class="type-body">{{ level.author }}</p>
          </div>
          <iframe class="video" :src="embed(level.verification)" frameborder="0" allowfullscreen></iframe>
          
          <ul class="stats">
            <li><div class="type-title-sm">STATUS</div><p>{{ level.status || 'Unknown' }}</p></li>
            <li><div class="type-title-sm">ID (IF AVAILABLE)</div><p>{{ level.id || 'N/A' }}</p></li>
            <li><div class="type-title-sm">RECORD</div><p>{{ level.best_record_text || 'None' }}</p></li>
          </ul>

          <div v-if="level.note" style="margin-top: 2rem; padding: 1.5rem; border-left: 4px solid var(--color-primary); background: rgba(255,255,255,0.03);">
            <p class="type-body" style="font-style: italic;">"{{ level.note }}"</p>
          </div>
        </div>
      </div>
    </main>
  `,
  data: () => ({ loading: true, allLevels: [], selectedId: null }),
  computed: {
    upcomingLevels() { return this.allLevels.filter(l => l.type === 'upcoming'); },
    level() { return this.upcomingLevels.find(l => l._id === this.selectedId) || this.upcomingLevels[0]; }
  },
  async mounted() {
    const list = await fetchList();
    this.allLevels = list ? list.map(l => l[0]) : [];
    if (this.upcomingLevels.length > 0) this.selectedId = this.upcomingLevels[0]._id;
    this.loading = false;
  },
  methods: { embed }
};
