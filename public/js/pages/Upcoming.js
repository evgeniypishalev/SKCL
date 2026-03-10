import { fetchList } from '../content.js';
import Spinner from '../components/Spinner.js';

export default {
  components: { Spinner },
  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>
    <main v-else class="page-upcoming" style="padding: 2rem; max-width: 1200px; margin: 0 auto; zoom: 0.9; font-family: 'Lexend Deca', sans-serif;">
      <h1 class="type-h1" style="margin-bottom: 2rem; border-bottom: 3px solid var(--color-primary); padding-bottom: 10px;">Upcoming Levels</h1>
      
      <div class="upcoming-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2rem;">
        <div v-for="level in upcomingLevels" :key="level._id" class="upcoming-card" 
          style="background: #151515; border: 2px solid var(--color-border); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="type-h2" style="color: var(--color-primary-level); margin: 0; font-size: 2.2rem;">{{ level.name }}</h2>
            <div :style="getStatusStyle(level.status)" 
              style="padding: 6px 12px; border-radius: 6px; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-family: 'Lexend Deca', sans-serif;">
              {{ level.status || 'TBA' }}
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="type-body" style="font-size: 1.1rem;"><strong style="color: var(--color-primary-level)">Creators:</strong> {{ level.creators?.join(', ') || level.author }}</div>
            <div class="type-body" style="font-size: 1.1rem;"><strong style="color: var(--color-primary-level)">Verifier:</strong> {{ level.verifier || 'N/A' }}</div>
            <div class="type-body" style="font-size: 1.1rem;"><strong style="color: var(--color-primary-level)">Publisher:</strong> {{ level.author }}</div>
          </div>

          <!-- Секция Best Record теперь принимает любой текст -->
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-top: 10px;">
            <div class="type-title-sm" style="color: #999; margin-bottom: 5px;">Best Record</div>
            <div class="type-body" style="font-size: 1.3rem; font-weight: 700;">
              {{ level.best_record_text || 'No records yet' }}
            </div>
          </div>

          <div v-if="level.note" style="margin-top: 5px; padding: 12px; border-left: 4px solid var(--color-primary); background: rgba(139, 0, 0, 0.05); font-style: italic; opacity: 0.8;" class="type-body">
            "{{ level.note }}"
          </div>
        </div>
      </div>
      
      <div v-if="upcomingLevels.length === 0" style="text-align: center; margin-top: 10rem; opacity: 0.2;">
        <h3 class="type-h1">No upcoming levels found.</h3>
      </div>
    </main>
  `,
  data: () => ({ loading: true, allLevels: [] }),
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
      return { background: '#333', color: '#aaa' };
    }
  }
};
