export default async function handler(req, res) {
  console.log("요청 메서드 확인:", req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, episode } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'messages가 비어있거나 올바른 형식이 아닙니다.'
      });
    }

    const conversationText = messages
      .filter((msg) => msg && msg.content)
      .map((msg) => {
        const speaker = msg.role === 'user' ? '영업사원' : '고객';
        return `${speaker}: ${msg.content}`;
      })
      .join('\n');

    const episodeText = episode
      ? typeof episode === 'string'
        ? episode
        : JSON.stringify(episode, null, 2)
      : '정보 없음';

    const prompt = `
당신은 영업 코칭 및 롤플레잉 평가 전문가입니다.
아래의 영업사원-고객 대화를 분석해서 영업사원의 역량을 평가하세요.

[상황 정보]
${episodeText}

[대화 내용]
${conversationText}

[평가 목적]
- 영업사원의 실제 대화 역량을 분석한다.
- 잘한 점과 부족한 점을 구체적으로 알려준다.
- 이후 더 나은 영업 대화를 위한 실전 노하우를 제공한다.

[평가 항목]
1. 신뢰/관계
- 고객과 라포를 형성했는가
- 공감과 신뢰를 쌓는 표현이 있었는가
- 일방적 제안보다 관계를 만드는 흐름이 있었는가

2. 니즈 파악
- 고객의 상황과 문제를 질문으로 잘 파악했는가
- 고객의 숨은 니즈를 확인하려는 시도가 있었는가

3. 솔루션 제안
- 고객의 니즈와 연결된 해결책을 제시했는가
- 제안이 구체적이고 설득력 있었는가
- 너무 이르거나 일방적인 제안은 아니었는가

4. 매너
- 말투가 예의 바르고 부담스럽지 않았는가
- 고객을 존중하는 표현을 사용했는가
- 영업사원으로서 기본적인 커뮤니케이션 태도가 좋았는가

[채점 규칙]
- 각 점수는 0~100 사이의 정수로 작성
- 실제 대화 내용 기준으로 냉정하게 평가
- 근거 없는 고득점 금지
- 질문이 부족하면 니즈 파악 점수를 낮게 줄 것
- 솔루션 제안이 고객 니즈와 연결되지 않으면 점수를 낮게 줄 것
- 말투가 무난하고 예의 있으면 매너 점수는 상대적으로 높게 줄 수 있음

[핵심노하우 작성 규칙]
- 반드시 배열 형태
- 최소 3개, 최대 5개
- 잘한 점 + 실전에서 계속 살려야 할 포인트를 작성
- 추상적 표현보다 실제 행동 중심으로 작성

[주의점 작성 규칙]
- 반드시 배열 형태
- 최소 3개, 최대 5개
- 부족했던 점과 개선 방향을 작성
- 비판만 하지 말고 어떻게 고치면 되는지도 포함

[응답 형식]
반드시 JSON만 출력하세요.
마크다운 코드블록 사용 금지.
설명 문장 금지.
아래 형식을 정확히 지키세요.

{
  "scores": {
    "신뢰/관계": 0,
    "니즈 파악": 0,
    "솔루션 제안": 0,
    "매너": 0
  },
  "핵심노하우": [
    "문장1",
    "문장2",
    "문장3"
  ],
  "주의점": [
    "문장1",
    "문장2",
    "문장3"
  ],
}
`;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: '서버 환경변수에 ANTHROPIC_API_KEY가 없습니다.'
      });
    }

    const claudeResponse = await fetch('[api.anthropic.com](https://api.anthropic.com/v1/messages)', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1500,
        temperature: 0.4,
        system:
          '당신은 영업 롤플레잉 평가 전문가입니다. 반드시 JSON만 출력하세요. 코드블록이나 설명 문장은 절대 출력하지 마세요.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const rawText = await claudeResponse.text();

    if (!claudeResponse.ok) {
      console.error('Claude API 호출 실패:', rawText);
      return res.status(500).json({
        error: 'Claude API 호출 실패',
        detail: rawText
      });
    }

    let claudeJson;
    try {
      claudeJson = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Claude 원본 응답 JSON 파싱 실패:', rawText);
      return res.status(500).json({
        error: 'Claude 원본 응답 파싱 실패'
      });
    }

    const modelText =
      claudeJson?.content?.find((item) => item.type === 'text')?.text || '';

    if (!modelText) {
      console.error('Claude 응답 텍스트 없음:', claudeJson);
      return res.status(500).json({
        error: 'Claude 응답 텍스트가 비어 있습니다.'
      });
    }

    let cleanText = modelText.trim();
    cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');

  // ... (Claude API 호출 및 파싱 부분은 유지)

    let parsedReport;
    try {
      parsedReport = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('최종 리포트 JSON 파싱 실패:', cleanText);
      return res.status(500).json({
        error: '평가 결과 JSON 파싱 실패',
        raw: modelText
      });
    }

    // [수정 핵심] 고정 데이터를 쓰지 말고, Claude가 준 parsedReport를 그대로 반환합니다!
    return res.status(200).json(parsedReport);

  } catch (error) { 
    // 이 catch는 전체를 감싸는 가장 큰 try의 catch여야 합니다.
    console.error('evaluate API 전체 오류:', error);
    return res.status(500).json({
      error: "서버 처리 중 오류 발생",
      details: error.message
    });
  }
}