import { store } from '../main.js';
import { fetchList, fetchRules, fetchPacks } from '../content.js';
import Spinner from '../components/Spinner.js';

export default {
  components: { Spinner },
  template: `
    <main v-if="loading" class="loading-container">
      <Spinner></Spinner>
    </main>

    <main v-else-if="!isAuthenticated" class="page-login">
      <div class="login-card">
        <h2>Admin Access</h2>
        <form @submit.prevent="handleLogin" class="admin-form">
          <div class="form-group"><label>Username</label><input v-model="loginUsername" type="text" required /></div>
          <div class="form-group"><label>Email</label><input v-model="loginEmail" type="email" required /></div>
          <div class="form-group"><label>Password</label><input v-model="loginPassword" type="password" required /></div>
          <button type="submit" class="btn-submit" :disabled="isLoggingIn">{{ isLoggingIn ? 'Verifying...' : 'Login' }}</button>
          <div v-if="loginError" class="message error-message">{{ loginError }}</div>
        </form>
      </div>
    </main>

    <main v-else class="page-admin">
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2>Admin Panel</h2>
          <button @click="logout" class="btn-logout">Logout</button>
        </div>

        <div class="sidebar-tabs">
          <button :class="{ active: currentTab === 'levels' }" @click="currentTab = 'levels'">Levels</button>
          <button :class="{ active: currentTab === 'packs' }" @click="currentTab = 'packs'">Packs</button>
        </div>

        <div v-if="currentTab === 'levels'">
          <button @click="openRulesModal" class="btn-toggle" style="margin-bottom: 1.5rem;">Edit Rules</button>
          <h3 style="border-bottom: 1px solid var(--color-border); padding-bottom: 5px;">Add Level</h3>
          <form @submit.prevent="submitLevel" class="admin-form" style="margin-top: 1rem;">
            <div class="form-group"><label>Name</label><input v-model="formData.name" type="text" required /></div>
            
            <!-- ВЫБОР ТИПА УРОВНЯ -->
            <div class="form-group">
              <label>List Type</label>
              <select v-model="formData.type" class="search-input" style="width:100%; background:#000; color:#fff; border:1px solid #333; padding:8px;">
                <option value="main">SKCDL (Demon)</option>
                <option value="challenge">SKCCL (Challenge)</option>
                <option value="upcoming">Upcoming Level</option>
              </select>
            </div>

            <!-- ПОЛЯ ДЛЯ UPCOMING -->
			<div v-if="formData.type === 'upcoming'" style="background: rgba(139,0,0,0.1); padding: 15px; border-radius: 8px; border: 1px dashed var(--color-primary); margin-bottom: 10px;">
			 <div class="form-group">
			  <label>Upcoming Status</label>
			  <input v-model="formData.status" placeholder="Finished / Verifying / Unreleased" />
			 </div>
 			<div class="form-group">
			  <label>Best Record Display Text</label>
			  <input v-model="formData.best_record_text" placeholder="e.g. 98% by Cursed" />
			 </div>
			 <div class="form-group">
			  <label>Custom Note</label>
			  <textarea v-model="formData.note" placeholder="Any additional info..." style="min-height:60px;"></textarea>
			 </div>
			</div>

            <div class="form-group"><label>ID</label><input v-model.number="formData.id" type="number" required /></div>
            <div class="form-group"><label>Author</label><input v-model="formData.author" type="text" placeholder="Name, Name2..." required /></div>
            <div class="form-group"><label>Verifier</label><input v-model="formData.verifier" type="text" required /></div>
            <div class="form-group"><label>Video</label><input v-model="formData.verification" type="text" placeholder="https://youtu.be/..." required /></div>
            
            <div style="display:flex; gap:10px;">
              <div style="flex:1"><label>Percent</label><input v-model.number="formData.percentToQualify" type="number" min="0" max="100" required /></div>
              <div style="flex:1"><label>Placement</label><input v-model.number="formData.placement" type="number" :placeholder="'Max: ' + maxPlacement" /></div>
            </div>

            <button type="button" @click="toggleRecordSection" class="btn-toggle">{{ showRecords ? '▼ Hide Records' : '► Add Initial Records' }}</button>
            <div v-if="showRecords" class="records-section">
              <div v-for="(record, index) in formData.records" :key="index" class="record-item">
                <div class="record-header"><span>Record {{ index + 1 }}</span><button type="button" @click="removeRecord(index)" class="btn-remove">Remove</button></div>
                <input v-model="record.user" placeholder="User" style="margin-bottom:5px;" required />
                <input v-model="record.link" placeholder="Link" style="margin-bottom:5px;" required />
                <div class="record-row"><input v-model.number="record.percent" placeholder="%" /><input v-model.number="record.hz" placeholder="Hz" /></div>
              </div>
              <button type="button" @click="addRecord" class="btn-add-record">+ Add Record</button>
            </div>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">{{ isSubmitting ? 'Saving...' : 'Add Level' }}</button>
            <div v-if="successMessage" class="message success-message">✓ {{ successMessage }}</div>
            <div v-if="errorMessage" class="message error-message">✗ {{ errorMessage }}</div>
          </form>
        </div>

        <div v-if="currentTab === 'packs'">
          <button @click="createNewPack" class="btn-submit" style="margin-bottom: 1.5rem;">+ Create New Pack</button>
          <h3 style="border-bottom: 1px solid var(--color-border); padding-bottom: 5px;">All Packs</h3>
          <div style="display:flex; flex-direction:column; gap: 8px; margin-top: 1rem;">
            <div v-for="pack in packsList" :key="pack.id" class="pack-card-mini" :class="{ active: editingPack.original_id === pack.id }" @click="selectPack(pack)">
              <div class="pack-info">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div :style="{width:'10px', height:'10px', borderRadius:'50%', background: pack.color || '#fff'}"></div>
                  <strong>{{ pack.name }}</strong>
                </div>
                <small>{{ pack.levels ? pack.levels.length : 0 }} Levels</small>
              </div>
              <button class="btn-icon-sm" @click.stop="deletePack(pack)">🗑</button>
            </div>
          </div>
        </div>
        <div style="margin-top: auto;">
          <button class="btn-goto-admin" onclick="window.location.href='/#/manage'">Go To Management Page</button>
        </div>
      </aside>

      <section class="admin-content">
        <div v-if="currentTab === 'levels'" class="levels-list">
          <div class="list-header">
            <h2>Current Levels ({{ levelsList.length }})</h2>
            <input v-model="searchQuery" type="text" placeholder="Search levels..." class="search-input" />
          </div>
          <div class="table-container" ref="tableContainer">
            <table class="levels-table">
              <thead><tr><th>Rank</th><th>Type</th><th>Name</th><th>Actions</th></tr></thead>
              <tbody>
                <tr v-for="(level, index) in filteredLevels" :key="level._id" class="level-row" :draggable="!searchQuery" @dragstart="onDragStart($event, index)" @dragover.prevent="onDragOver($event, index)" @drop.prevent="onDrop" @dragend="onDragEnd" :class="{ 'is-dragging': draggedItem === level }">
                  <td><div class="rank-display-wrapper"><span class="goldhighlight" style="font-size: 1.2rem; font-weight: bold;">#{{ index + 1 }}</span><span class="drag-handle" v-if="!searchQuery">::</span></div></td>
                  <td><span style="font-size: 0.7rem; background: #333; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">{{ level.type || 'main' }}</span></td>
                  <td><span style="font-weight:700;">{{ level.name }}</span></td>
                  <td class="actions">
                    <button class="btn-icon" @click.stop="openEditRecordsModal(level)">✎</button>
                    <button class="btn-icon" @click.stop="deleteLevel(level)">🗑</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="currentTab === 'packs'" class="pack-workspace">
          <div class="pack-header-bar">
            <div class="pack-meta-inputs"><div style="flex: 2;"><label>Pack Name</label><input v-model="editingPack.name" type="text" /></div><div style="flex: 0 0 100px;"><label>Color</label><input v-model="editingPack.color" type="color" style="height: 43px; padding: 2px;" /></div></div>
            <button @click="savePack" class="btn-submit" style="width: auto; padding: 12px 30px;">Save Pack</button>
          </div>
          <div class="pack-drag-container">
            <div class="drag-column"><h3>Levels In Pack</h3><div class="drag-list" ref="packListContainer" @dragover.prevent @drop="onDropToPack($event)"><div v-for="(lvl, idx) in editingPack.levels" :key="idx" class="drag-item" draggable="true" @dragstart="onDragStartPack($event, idx)" @dragover.prevent="onDragOverPack($event, idx)"><span>{{ lvl.name }}</span><button @click="removeFromPack(idx)" class="btn-icon-sm">✕</button></div></div></div>
            <div class="drag-column"><h3>Available Levels</h3><input v-model="packSearch" placeholder="Search..." /><div class="drag-list"><div v-for="lvl in filteredAvailableLevels" :key="lvl._id" class="drag-item source" @click="addToPack(lvl)">{{ lvl.name }} <span class="goldhighlight">+</span></div></div></div>
          </div>
        </div>
      </section>

      <!-- EDIT MODAL -->
      <div v-if="editingRecordsLevel" class="modal-overlay" @click="closeEditRecordsModal">
        <div class="polished-modal" @click.stop style="max-width: 800px;">
          <div class="modal-header"><h1>Edit: {{ editingLevel.name }}</h1><button class="modal-close-btn" @click="closeEditRecordsModal">✕</button></div>
          <div class="modal-scroll-area">
            <div class="admin-form">
              <div><label>Name</label><input v-model="editingLevel.name"></div>
              
              <div>
                <label>List Type</label>
                <select v-model="editingLevel.type" class="search-input" style="width:100%; background:#000; color:#fff; border:1px solid #333; padding:8px;">
                  <option value="main">SKCDL (Demon)</option>
                  <option value="challenge">SKCCL (Challenge)</option>
                  <option value="upcoming">Upcoming Level</option>
                </select>
              </div>

              <div v-if="editingLevel.type === 'upcoming'" style="background: rgba(139,0,0,0.1); padding: 15px; border-radius: 8px; border: 1px dashed var(--color-primary);">
                <div class="form-group"><label>Status</label><input v-model="editingLevel.status" /></div>
                <div class="form-group"><label>Best Record (%)</label><input v-model.number="editingLevel.best_record.percent" type="number" /></div>
                <div class="form-group"><label>Record Player</label><input v-model="editingLevel.best_record.player" /></div>
                <div class="form-group"><label>Custom Note</label><textarea v-model="editingLevel.note" style="min-height:60px;"></textarea></div>
              </div>

              <div><label>Author</label><input v-model="editingLevel.author"></div>
              <div><label>Verifier</label><input v-model="editingLevel.verifier"></div>
              <div><label>ID</label><input v-model.number="editingLevel.id" type="number"></div>
              <div><label>Video</label><input v-model="editingLevel.verification"></div>
              <div><label>Percent</label><input v-model.number="editingLevel.percentToQualify"></div>
            </div>
            <h3 style="margin-top:2rem;">Records</h3>
            <div v-for="(record, index) in editingLevel.records" :key="index" style="display:flex; gap:5px; margin-bottom:5px;">
              <input v-model="record.user" placeholder="User" style="flex:1"><input v-model="record.link" placeholder="Link" style="flex:1"><input v-model.number="record.percent" style="width:60px"><button @click="editingLevel.records.splice(index, 1)" class="btn-icon-sm">✕</button>
            </div>
            <button @click="addEditingRecord" class="btn-toggle">+ Add Record</button>
          </div>
          <div class="modal-footer"><button @click="saveEditLevel" class="btn-submit">Save Changes</button></div>
        </div>
      </div>

      <!-- RULES MODAL (KEEP ORIGINAL) -->
      <div v-if="showRulesModal" class="modal-overlay" @click="closeRulesModal">
        <div class="polished-modal rules-modal" @click.stop style="max-width: 95vw; height: 90vh;">
          <div class="modal-header"><h1>Edit Rules</h1><button class="modal-close-btn" @click="closeRulesModal">✕</button></div>
          <div class="rules-tabs-nav"><button :class="{ active: rulesTab === 'level' }" @click="rulesTab = 'level'">Level Rules</button><button :class="{ active: rulesTab === 'record' }" @click="rulesTab = 'record'">Record Rules</button></div>
          <div class="rules-split-body">
            <div class="rules-pane editor-pane"><textarea v-model="rulesEditText[rulesTab]" class="rules-textarea"></textarea></div>
          </div>
          <div class="modal-footer"><button @click="saveRules" class="btn-submit">Save All Rules</button></div>
        </div>
      </div>
    </main>
  `,
  data() {
    return {
      store, loading: true, isAuthenticated: false, currentTab: 'levels',
      loginUsername: '', loginEmail: '', loginPassword: '', isLoggingIn: false, loginError: '', token: null,
      levelsList: [], searchQuery: '', 
      formData: { 
        id: null, name: '', author: '', verifier: '', verification: '', 
        percentToQualify: 100, password: 'free Copyable', records: [], creators: [], placement: null,
        type: 'main', status: 'Unreleased', note: '', best_record_text: '', player: ''
      },
      showRecords: false, isSubmitting: false, successMessage: '', errorMessage: '',
      packsList: [], editingPack: { name: '', pack_id: '', original_id: null, color: '#d4c217', levels: [] },
      packSearch: '', isSavingPack: false, packMessage: '', packError: false, draggedSourceLevel: null, draggedPackIndex: null,
      showRulesModal: false, rulesTab: 'level', rulesEditText: { level: '', record: '' }, isSavingRules: false,
      editingRecordsLevel: null, editingLevel: null, draggedItem: null, dragStartIndex: null
    };
  },
  computed: {
    maxPlacement() { return this.levelsList.length + 1; },
    filteredLevels() {
      if (!this.searchQuery) return this.levelsList;
      const q = this.searchQuery.toLowerCase();
      return this.levelsList.filter(l => l.name.toLowerCase().includes(q) || String(l.id).includes(q));
    },
    filteredAvailableLevels() {
      const q = this.packSearch.toLowerCase();
      const inPackIds = new Set(this.editingPack.levels.map(l => l._id));
      return this.levelsList.filter(l => l.name.toLowerCase().includes(q) && !inPackIds.has(l._id));
    }
  },
  async mounted() {
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      this.token = storedToken; this.isAuthenticated = true;
      await Promise.all([this.refreshLevels(), this.refreshPacks()]);
    }
    this.loading = false;
  },
  methods: {
    async handleLogin() {
      this.isLoggingIn = true;
      try {
        const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: this.loginUsername, email: this.loginEmail, password: this.loginPassword }) });
        const data = await res.json();
        if (res.ok && data.success) {
          this.token = data.token; localStorage.setItem('admin_token', data.token); this.isAuthenticated = true;
          await Promise.all([this.refreshLevels(), this.refreshPacks()]);
        } else { this.loginError = data.error || 'Failed'; }
      } catch (e) { this.loginError = 'Error'; } finally { this.isLoggingIn = false; }
    },
    logout() { this.isAuthenticated = false; this.token = null; localStorage.removeItem('admin_token'); },
    getAuthHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` }; },
    async refreshLevels() { const list = await fetchList(); if (list) this.levelsList = list.map(([l]) => l).filter(l => l); },
    async refreshPacks() { const packs = await fetchPacks(); if (packs) this.packsList = packs; },
    
    async submitLevel() {
      this.isSubmitting = true; this.errorMessage = '';
      let levelData = { ...this.formData };
      if (levelData.type === 'upcoming') {
        levelData.status = levelData.status || 'Unreleased';
        levelData.best_record = levelData.best_record || { percent: 0, player: '' };
      }
      const payload = { levelData, placement: this.formData.placement };
      try {
        const res = await fetch('/api/add-level', { method: 'POST', headers: this.getAuthHeaders(), body: JSON.stringify(payload) });
        if (res.ok) { this.successMessage = "Added!"; await this.refreshLevels(); } else { this.errorMessage = "Failed"; }
      } catch (e) { this.errorMessage = "Error"; } finally { this.isSubmitting = false; }
    },

    async saveEditLevel() {
      let newLevelData = { ...this.editingLevel };
      const authors = newLevelData.author.split(',').map(a => a.trim()).filter(a => a);
      if (authors.length > 1) { newLevelData.creators = authors; newLevelData.author = authors[0]; }
      try {
        const res = await fetch('/api/update-records', { method: 'POST', headers: this.getAuthHeaders(), body: JSON.stringify({ oldLevelId: this.editingRecordsLevel._id, newLevelData }) });
        if (res.ok) { await this.refreshLevels(); this.closeEditRecordsModal(); }
      } catch (e) { console.error(e); }
    },

    openEditRecordsModal(level) { 
      this.editingRecordsLevel = level; 
      this.editingLevel = JSON.parse(JSON.stringify(level)); 
      if (!this.editingLevel.type) this.editingLevel.type = 'main';
      if (!this.editingLevel.best_record) this.editingLevel.best_record = { percent: 0, player: '' };
    },
    closeEditRecordsModal() { this.editingRecordsLevel = null; },
    addEditingRecord() { this.editingLevel.records.push({ user: '', link: '', percent: 100, hz: 240 }); },
    
    // Reordering & Drag/Drop
    onDragStart(evt, idx) { this.draggedItem = this.levelsList[idx]; this.dragStartIndex = idx; },
    onDragOver(evt, idx) {
      const dragIdx = this.levelsList.indexOf(this.draggedItem);
      if (dragIdx !== idx) { const item = this.levelsList.splice(dragIdx, 1)[0]; this.levelsList.splice(idx, 0, item); }
    },
    async onDrop() {
      const newIdx = this.levelsList.indexOf(this.draggedItem);
      if (newIdx !== this.dragStartIndex) {
        await fetch('/api/move-level', { method: 'POST', headers: this.getAuthHeaders(), body: JSON.stringify({ oldIndex: this.dragStartIndex, newIndex: newIdx }) });
      }
      this.draggedItem = null;
    },
    onDragEnd() { this.draggedItem = null; },

    // Packs
    createNewPack() { this.editingPack = { name: '', pack_id: '', original_id: null, color: '#d4c217', levels: [] }; },
    selectPack(p) { this.editingPack = { ...p, original_id: p.id, levels: p.levels.map(id => this.levelsList.find(l => String(l.id) === String(id))).filter(l => l) }; },
    addToPack(l) { if (!this.editingPack.levels.find(x => x._id === l._id)) this.editingPack.levels.push(l); },
    removeFromPack(idx) { this.editingPack.levels.splice(idx, 1); },
    async savePack() {
      const payload = { action: 'save', id: this.editingPack.original_id || this.editingPack.name.toLowerCase().replace(/ /g, '_'), name: this.editingPack.name, color: this.editingPack.color, levels: this.editingPack.levels.map(l => String(l.id)) };
      await fetch('/api/packs', { method: 'POST', headers: this.getAuthHeaders(), body: JSON.stringify(payload) });
      await this.refreshPacks();
    },
    async deletePack(p) { if (confirm('Delete?')) { await fetch('/api/packs', { method: 'POST', headers: this.getAuthHeaders(), body: JSON.stringify({ action: 'delete', id: p.id }) }); await this.refreshPacks(); } },

    // Rules
    async openRulesModal() { const r = await fetchRules(); this.rulesEditText = { level: r.level_rules.join('\n'), record: r.record_rules.join('\n') }; this.showRulesModal = true; },
    closeRulesModal() { this.showRulesModal = false; },
    async saveRules() { await fetch('/api/rules', { method: 'POST', headers: this.getAuthHeaders(), body: JSON.stringify({ rules: { level_rules: this.rulesEditText.level.split('\n'), record_rules: this.rulesEditText.record.split('\n') } }) }); this.showRulesModal = false; },
    
    toggleRecordSection() { this.showRecords = !this.showRecords; },
    addRecord() { this.formData.records.push({ user: '', link: '', percent: 100, hz: 240 }); },
    removeRecord(idx) { this.formData.records.splice(idx, 1); }
  }
};
