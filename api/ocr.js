export default async function handler(req, res) {
  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'image required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: image }
            },
            {
              type: 'text',
              text: `Bu ürün etiketindeki seri numarasını bul ve SADECE seri numarasını yaz, başka hiçbir şey yazma.
Seri numarası genellikle "S.N." veya "SN:" yazısının yanında olur.
Format: 1-4 büyük harf + rakamlar. Örnek: AG050626001
Eğer bulamazsan sadece "YOK" yaz.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || 'YOK';
    res.status(200).json({ serial: text });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
