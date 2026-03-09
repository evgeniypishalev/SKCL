import { query } from './_db.js';

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const newEditors = req.body;
      
      await query(
        "UPDATE public.system SET data = $1 WHERE key = '_editors'",
        [JSON.stringify(newEditors)]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Save error:", error);
      return res.status(500).json({ error: "Failed to save editors" });
    }
  }

  try {
    const result = await query("SELECT data FROM public.system WHERE key = '_editors'");
    if (result.rows.length === 0) return res.json([]);
    
    res.status(200).json(result.rows[0].data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch editors" });
  }
}
