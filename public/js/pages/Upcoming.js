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
     <h2 class="type-h2" style="color: var(--color-primary-level); margin-bottom: 15px; font-family: 'Lexend Deca';">UPCOMING</h2>
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
     <div class="level-authors" style="display: grid; grid-template-columns: max-content 1fr; gap: 10px;">
      <div class="type-title-sm">CREATORS</div><p class="type-body">{{ level.creators?.join(', ') || level.author }}</p>
      <div class="type-title-sm">VERIFIER</div><p class="type-body">{{ level.verifier || 'N/A' }}</p>
      <div class="type-title-sm">PUBLISHER</div><p class="type-body">{{ level.author }}</p>
     </div>
     <iframe class="video" :src="embed(level.verification)" frameborder="0" allowfullscreen style="width: 100%; aspect-ratio: 16/9; margin-top: 20px;"></iframe>

     <ul class="stats" style="display: flex; justify-content: space-around; margin-top: 20px; text-align: center;">
      <li><div class="type-title-sm">STATUS</div><p style="font-weight: bold; color: var(--color-primary-level);">{{ level.status || 'Unknown' }}</p></li>
      <li><div class="type-title-sm">ID</div><p>{{ level.id || 'N/A' }}</p></li>
      <li><div class="type-title-sm">BEST RECORD</div><p>{{ level.best_record_text || 'None' }}</p></li>
     </ul>

     <div v-if="level.note" style="margin-top: 2rem; padding: 1.5rem; border-left: 4px solid var(--color-primary); background: rgba(255,255,255,0.03);">
      <p class="type-body" style="font-style: italic; font-size: 0.9rem; opacity: 0.8;">"{{ level.note }}"</p>
     </div>
    </div>
    <div v-else class="level" style="height: 100%; display: flex; justify-content: center; align-items: center;">
      <p style="opacity: 0.5;">No upcoming levels yet.</p>
    </div>
   </div>
  </main>
 `,
 data: () => ({ loading: true, allLevels: [], selectedId: null }),
 computed: {
  upcomingLevels() { return this.allLevels.filter(l => l.type === 'upcoming'); },
  level() { 
    if (this.upcomingLevels.length === 0) return null;
    return this.upcomingLevels.find(l => l._id === this.selectedId) || this.upcomingLevels[0]; 
  }
 },
 async mounted() {
  const list = await fetchList();
  this.allLevels = list ? list.map(l => l[0]) : [];
  if (this.upcomingLevels.length > 0) this.selectedId = this.upcomingLevels[0]._id;
  this.loading = false;
 },
 methods: { embed }
};
