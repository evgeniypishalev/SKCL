import { fetchList } from '../content.js';
import Spinner from '../components/Spinner.js';

export default {
  components: { Spinner },
  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>
    <main v-else class="page-upcoming" style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <h1 class="type-h1" style="margin-bottom: 2rem;">Upcoming Levels</h1>
      
      <div class="upcoming-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
        <div v-for="level in upcomingLevels" :key="level._id" class="upcoming-card" 
           style="background: var(--color-primary-light); border: 2px solid var(--color-border); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          
          <h2 class="type-h2" style="color: var(--color-primary-level); margin: 0;">{{ level.name }}</h2>
          
          <div class="info-row"><strong>Creators:</strong> {{ level.creators?.join(', ') || level.author }}</div>
          <div class="info-row"><strong>Verifier:</strong> {{ level.verifier }}</div>
          <div class="info-row"><strong>Publisher:</strong> {{ level.author }}</div>
          
          <div class="status-badge" :style="getStatusStyle(level.status)" 
             style="padding: 4px 10px; border-radius: 6px; font-weight: bold; width: fit-content; margin: 0.5rem 0; text-transform: uppercase; font-size: 0.8rem;">
            {{ level.status || 'Unknown' }}
          </div>

          <div class="best-record" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
            <strong>Best Record:</strong> 
            <span v-if="level.best_record">
              {{ level.best_record.percent }}% by {{ level.best_record.player }}
            </span>
            <span v-else>None</span>
          </div>

          <div v-if="level.note" class="note" style="font-style: italic; opacity: 0.7; font-size: 0.9rem; margin-top: 0.5rem; border-left: 3px solid var(--color-primary); padding-left: 10px;">
            "{{ level.note }}"
          </div>
        </div>
      </div>
      <div v-if="upcomingLevels.length === 0" style="text-align: center; opacity: 0.5; margin-top: 5rem;">
        No upcoming levels found.
      </div>
    </main>
  `,
  data: () => ({
    loading: true,
    allLevels: []
  }),
  computed: {
    upcomingLevels() {
      return this.allLevels.filter(l => l.type === 'upcoming');
    }
  },
  async mounted() {
    const list = await fetchList();
    this.allLevels = list ? list.map(([l]) => l).filter(l => l) : [];
    this.loading = false;
  },
  methods: {
    getStatusStyle(status) {
      const s = status?.toLowerCase();
      if (s === 'finished') return { background: '#27ae60', color: '#fff' };
      if (s === 'verifying') return { background: '#f1c40f', color: '#000' };
      if (s === 'unreleased') return { background: '#e74c3c', color: '#fff' };
      return { background: 'var(--color-border)', color: 'var(--color-text-secondary)' };
    }
  }
};
