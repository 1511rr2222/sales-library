// src/api/chat.js
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// 이 함수를 handler 내부에서만 실행되게 두세요
async function getSheetData() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const doc = new GoogleSpreadsheet(process.env.REACT_APP_SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['episodes'];
  const rows = await sheet.getRows();
  return rows.map(row => row.toObject());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages, systemPrompt } = req.body;
    
    // 1. 서버 내부에서만 구글 시트 데이터를 가져옴 (브라우저와 격리됨)
    const sheetData = await getSheetData();
    const formattedKnowledge = sheetData.map(d => `상황: ${d['상황(SITUATION)']}`).join('\n');

    // 2. Claude API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `${systemPrompt}\n[지식]: ${formattedKnowledge}`,
        messages: messages
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
