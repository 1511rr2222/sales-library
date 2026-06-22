// sales-library/api/analyze.js
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const COMPETENCY_GROUPS = {
  Common: ["디지털 리터러시", "전략적 커뮤니케이션", "자기주도적 성과관리", "프로페셔널 매너"],
  Basic: ["제/상품 및 시공절차", "시장 및 산업 인사이트", "현장대응 및 문제해결", "고객관계 구축"],
  Curator: ["통합 솔루션", "가치 창출 크로스셀링", "전략적 시장리딩", "파트너십 매니지먼트"],
};

async function getCompetencyData() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const doc = new GoogleSpreadsheet(process.env.REACT_APP_SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();

  // 시트 이름 수정: competencies
  const sheet = doc.sheetsByTitle['competencies'];
  if (!sheet) throw new Error("'competencies' 시트를 찾을 수 없습니다.");

  const rows = await sheet.getRows();

  // 역량명별로 KPI 묶어서 반환
  return rows.map(row => {
    const obj = row.toObject();
    return {
      역량명: obj['역량명'] || '',
      KPI: [
        obj['핵심KPI01'], obj['핵심KPI02'], obj['핵심KPI03'],
        obj['핵심KPI04'], obj['핵심KPI05'], obj['핵심KPI06'],
      ].filter(Boolean),
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { memo } = req.body;
    if (!memo) return res.status(400).json({ error: 'memo가 없습니다.' });

    const competencyData = await getCompetencyData();

    const systemPrompt = `당신은 한솔홈데코의 영업 코칭 전문가 'Solo'입니다.
아래는 한솔홈데코의 12가지 영업 역량 체계와 각 역량의 핵심 KPI입니다.

[역량 체계 및 KPI]
${JSON.stringify(competencyData, null, 2)}

[역량 그룹 분류]
- Common: ${COMPETENCY_GROUPS.Common.join(', ')}
- Basic: ${COMPETENCY_GROUPS.Basic.join(', ')}
- Curator: ${COMPETENCY_GROUPS.Curator.join(', ')}

[지시]
영업사원의 세일즈 메모를 읽고, 각 역량이 메모에서 얼마나 드러나는지 0~100점으로 평가하세요.
점수는 KPI 기준으로 객관적으로 채점하세요. 메모에 근거가 없으면 낮게 주세요.

[응답 형식] 반드시 JSON만 출력. 마크다운 코드블록 금지.
{
  "Common": {
    "디지털 리터러시": 0,
    "전략적 커뮤니케이션": 0,
    "자기주도적 성과관리": 0,
    "프로페셔널 매너": 0
  },
  "Basic": {
    "제/상품 및 시공절차": 0,
    "시장 및 산업 인사이트": 0,
    "현장대응 및 문제해결": 0,
    "고객관계 구축": 0
  },
  "Curator": {
    "통합 솔루션": 0,
    "가치 창출 크로스셀링": 0,
    "전략적 시장리딩": 0,
    "파트너십 매니지먼트": 0
  },
  "Feedback": "여기에 코칭 피드백"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: '반드시 JSON만 출력하세요. 마크다운 코드블록이나 설명 문장은 절대 출력하지 마세요.',
        messages: [
          { role: 'user', content: systemPrompt + '\n\n[세일즈 메모]\n' + memo }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Claude API 실패:', errText);
      return res.status(500).json({ error: 'Claude API 호출 실패', detail: errText });
    }

    const claudeData = await response.json();
    const rawText = claudeData?.content?.[0]?.text || '';

    const cleanText = rawText.trim().replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(cleanText);
    } catch (e) {
      console.error('JSON 파싱 실패:', cleanText);
      return res.status(500).json({ error: 'JSON 파싱 실패', raw: rawText });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('analyze API 오류:', error);
    return res.status(500).json({ error: error.message });
  }
}