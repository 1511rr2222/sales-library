export default async function handler(req, res) {
  console.log("들어온 요청:", req.method);

  try {
    const { messages, episode } = req.body || {};

    if (!messages) {
      return res.status(400).json({ error: "messages가 없습니다." });
    }

    const conversationText = messages
      .filter((msg) => msg && msg.content)
      .map((msg) => `${msg.role === 'user' ? '영업사원' : '고객'}: ${msg.content}`)
      .join('\n');

    const episodeText = episode
      ? (typeof episode === 'string' ? episode : JSON.stringify(episode, null, 2))
      : '정보 없음';

    const prompt = `
당신은 영업 코칭 및 롤플레잉 평가 전문가입니다.
아래의 영업사원-고객 대화를 분석해서 영업사원의 역량을 평가하세요.

[상황 정보]
${episodeText}

[대화 내용]
${conversationText}

[평가 항목]
1. 신뢰/관계: 라포 형성, 공감 표현, 관계 중심 흐름
2. 니즈 파악: 질문을 통한 고객 상황/니즈 파악
3. 솔루션 제안: 니즈 연결된 구체적 해결책 제시
4. 매너: 예의 바른 말투, 고객 존중 표현

[채점 규칙]
- 각 점수는 0~100 사이 정수
- 실제 대화 기준으로 냉정하게 평가
- 질문이 부족하면 니즈 파악 점수 낮게
- 솔루션이 니즈와 무관하면 점수 낮게

[문체 규칙 — 반드시 준수]
- 호감도 수치나 턴 번호를 절대 언급하지 마세요. ("호감도 40", "3턴에서" 금지)
- 한 항목은 한 문장으로, 짧고 간결하게.
- 딱딱한 평가 말투 금지. ("~하였다", "~함으로써", "~을 통해" 지양)
- 사람이 말하듯 자연스럽게. ("~했어요", "~했죠" 처럼)
- 강점은 구체적인 행동 중심으로, 수식어 남발 금지.
- 주의점은 비판이 아닌 코칭 톤으로. ("~했으면 더 좋았을 것" 대신 "~를 먼저 물어봤다면 달랐을 거예요" 처럼)

[응답 형식] 반드시 JSON만 출력. 마크다운 코드블록 금지.
{
  "scores": { "신뢰/관계": 0, "니즈 파악": 0, "솔루션 제안": 0, "매너": 0 },
  "강점": ["문장1", "문장2", "문장3"],
  "주의점": ["문장1", "문장2", "문장3"]
}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY가 없습니다.' });
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: '당신은 영업 롤플레잉 평가 전문가입니다. 반드시 JSON만 출력하세요. 코드블록이나 설명 문장은 절대 출력하지 마세요.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const rawText = await claudeResponse.text();

    if (!claudeResponse.ok) {
      console.error('Claude API 호출 실패:', rawText);
      return res.status(500).json({ error: 'Claude API 호출 실패', detail: rawText });
    }

    const claudeJson = JSON.parse(rawText);
    const modelText = claudeJson?.content?.find((item) => item.type === 'text')?.text || '';

    if (!modelText) {
      return res.status(500).json({ error: 'Claude 응답 텍스트가 비어 있습니다.' });
    }

    const cleanText = modelText.trim().replace(/```json/g, '').replace(/```/g, '');

    let parsedReport;
    try {
      parsedReport = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('리포트 JSON 파싱 실패:', cleanText);
      return res.status(500).json({ error: '평가 결과 JSON 파싱 실패', raw: modelText });
    }

    return res.status(200).json(parsedReport);

  } catch (error) {
    console.error('evaluate API 전체 오류:', error);
    return res.status(500).json({ error: '서버 처리 중 오류 발생', details: error.message });
  }
}
