const AGES = ['30代後半', '40代前半', '40代後半', '50代前半', '50代後半', '60代以上'];
const LOVES = ['冷めた', 'やや冷めた', 'ふつう', '好き', '今も大好き'];
const QUESTION_COUNT = 17;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { age, love, answers } = body;

    if (!AGES.includes(age) || !LOVES.includes(love)) {
      return res.status(400).json({ ok: false, error: 'Invalid profile' });
    }
    if (!Array.isArray(answers) || answers.length !== QUESTION_COUNT ||
        !answers.every(a => a === 'ある' || a === 'ない')) {
      return res.status(400).json({ ok: false, error: 'Invalid answers' });
    }

    const count = answers.filter(a => a === 'ある').length;
    const result = count >= 3
      ? '男性ホルモンが低下している可能性があります。'
      : '目立ったテストステロン低下傾向は見られません。';

    const gasRes = await fetch(process.env.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age, love, count, result, answers }),
      redirect: 'follow'
    });

    if (!gasRes.ok) {
      return res.status(502).json({ ok: false, error: 'GAS error' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
