import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const doc = new GoogleSpreadsheet(process.env.REACT_APP_SPREADSHEET_ID, serviceAccountAuth);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['episodes'];
    
    if (!sheet) {
      return res.status(404).json({ error: "시트 이름을 찾을 수 없습니다." });
    }

    // 헤더 행을 로드하고 데이터를 가져옵니다.
    await sheet.loadHeaderRow(); 
    const rows = await sheet.getRows();
    
    // 데이터를 객체 형태로 변환
    // 혹시 모를 헤더 이름의 공백을 제거하기 위해 trim()을 추가했습니다.
    const data = rows.map(row => {
      const rawObj = row.toObject();
      const cleanedObj = {};
      Object.keys(rawObj).forEach(key => {
        cleanedObj[key.trim()] = rawObj[key];
      });
      return cleanedObj;
    });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('구글 시트 로딩 에러:', error);
    res.status(500).json({ error: error.message });
  }
}
