export async function getEpisodes() {
  try {
    // 서버의 API를 호출합니다.
    const response = await fetch('/api/get-episodes'); 
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("서버 응답 에러:", errorData);
      throw new Error('데이터를 불러오는데 실패했습니다.');
    }
    
    // 서버에서 받은 JSON 데이터를 가져옵니다.
    const data = await response.json();
    
    // 데이터를 우리가 원하는 이름으로 매핑합니다.
    // ※ 주의: 시트의 헤더명이 '사건ID', '고객유형_01' 등과 정확히 일치해야 합니다.
    return data.map(item => ({
      id: item['사건ID'], 
      customerType1: item['고객유형_01'],
      customerType2: item['고객유형_02'],
      situation1: item['문제상황_01'],
      situation2: item['문제상황_02'],
    }));

  } catch (error) {
    console.error('에피소드 데이터 로딩 에러:', error);
    // 에러가 나면 빈 배열을 반환하여 앱이 멈추지 않게 합니다.
    return [];
  }
}