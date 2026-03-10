import { fetchList } from '../content.js';
import Spinner from '../components/Spinner.js';

export default {
 components: { Spinner },
 template: `
  <main v-if="loading">
   <Spinner></Spinner>
  </main>
  <main v-else class="page-upcoming" style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: 'Lexend Deca', sans-serif;">
   <h1 class="type-h1" style="margin-bottom: 2rem; border-bottom: 3px solid var(--color-primary); padding-bottom: 10px;">Upcoming Levels</h1>
   
   <div class="upcoming-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2.5rem;">
    <div v-for="level in upcomingLevels" :key="level._id" class="upcoming-card" 
     style="background: #111; border: 2px solid var(--color-border); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 1.2rem; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
     
     <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <h2 class="type-h2" style="color: var(--color-primary-level); margin: 0; font-size: 2.3rem; letter-spacing: -1px;">{{ level.name }}</h2>
      <div :style="getStatusStyle(level.status)" 
       style="padding: 6px 14px; border-radius: 6px; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px;">
       {{ level.status || 'TBA' }}
      </div>
     </div>
     
     <div style="display: flex; flex-direction: column; gap: 10px; opacity: 0.9;">
      <div class="type-body"><strong style="color: var(--color-primary-level)">Creators:</strong> {{ level.creators?.join(', ') || level.author }}</div>
      <div class="type-body"><strong style="color: var(--color-primary-level)">Verifier:</strong> {{ level.verifier || 'N/A' }}</div>
      <div class="type-body"><strong style="color: var(--color-primary-level)">Publisher:</strong> {{ level.author }}</div>
     </div>

     <div style="background: rgba(255,255,255,0.03); padding: 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
      <div class="type-title-sm" style="color: #666; margin-bottom: 8px; font-size: 0.8rem;">Best Record</div>
      <div class="type-body" style="font-size: 1.4rem; font-weight: 800; color: #fff;">
       {{ level.best_record_text || 'No records yet' }}
      </div>
     </div>

     <div v-if="level.note" style="padding: 15px; border-left: 4px solid var(--color-primary); background: rgba(139, 0, 0, 0.05); font-style: italic; font-size: 0.95rem; line-height: 1.5;" class="type-body">
      "{{ level.note }}"
     </div>
    </div>
   </div>
   
   <div v-if="upcomingLevels.length === 0" style="text-align: center; margin-top: 10rem; opacity: 0.2;">
    <h1 class="type-h1">Coming Soon...</h1>
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
   return { background: '#333', color: '#999' };
  }
 }
};
