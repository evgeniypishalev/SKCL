import { round, score } from './score.js';

export async function fetchList() {
 try {
 const response = await fetch('/api/levels');
 if (!response.ok) throw new Error(`API Error ${response.status}`);
 const list = await response.json();
 return list.map((level) => [{
  ...level,
  type: level.type || 'main',
  records: (level.records || []).sort((a, b) => b.percent - a.percent),
  _id: level._id || level.id,
 }, null]);
 } catch (err) { return null; }
}

export async function fetchEditors() {
 try {
 const response = await fetch('/api/editors');
 return response.ok ? await response.json() : [];
 } catch (e) { return []; }
}

export async function fetchRules() {
 try {
 const response = await fetch('/api/rules');
 if (!response.ok) return { level_rules: [], record_rules: [] };
 const data = await response.json();
 return data.rules || { level_rules: [], record_rules: [] };
 } catch (e) { return { level_rules: [], record_rules: [] }; }
}

export async function fetchPacks() {
 try {
 const response = await fetch('/api/packs');
 return response.ok ? await response.json() : [];
 } catch (e) { return []; }
}

export async function fetchLeaderboard() {
 const listData = await fetchList();
 if (!listData) return [null, ["Failed to load list"]];

 const scoreMap = {};
 const ddlLevels = listData.filter(l => l[0] && l[0].type === 'main');
 const dclLevels = listData.filter(l => l[0] && l[0].type === 'challenge');

 const processList = (levels) => {
 levels.forEach(([level], index) => {
  const rank = index + 1;
  const points = score(rank, 100, level.percentToQualify || 100);

  const initUser = (u) => {
  if (!u) return null;
  const name = u.trim();
  if (!name) return null;
  scoreMap[name] ??= { verified: [], completed: [], progressed: [], packs: [], total: 0 };
  return name;
  };

  if (level.verifier) {
  const v = initUser(level.verifier);
  if (v) scoreMap[v].verified.push({ rank, level: level.name, score: points });
  }

  (level.records || []).forEach(record => {
  const u = initUser(record.user);
  if (!u) return;
  const s = record.percent === 100 ? points : score(rank, record.percent, level.percentToQualify || 100);
  if (record.percent === 100) scoreMap[u].completed.push({ rank, level: level.name, score: s });
  else scoreMap[u].progressed.push({ rank, level: level.name, score: s, percent: record.percent });
  });
 });
 };

 processList(ddlLevels);
 processList(dclLevels);

 const res = Object.entries(scoreMap).map(([user, data]) => {
 const total = [...data.verified, ...data.completed, ...data.progressed].reduce((a, b) => a + (b.score || 0), 0);
 // ВАЖНО: total должен быть ПОСЛЕ ...data, чтобы не перезаписаться нулем!
 return { ...data, user, total: round(total) };
 });

 return [res.sort((a, b) => b.total - a.total), []];
}
