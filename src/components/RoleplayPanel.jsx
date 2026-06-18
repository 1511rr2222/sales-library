import { useState, useEffect } from 'react';
import { getEpisodes } from '../api/spreadsheet';

export default function RolePlayPanel() {
  const [customerTypes, setCustomerTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    getEpisodes().then(data => {
      // 데이터에서 고유한 고객 유형만 추출 (중복 제거 및 빈 값 제거)
      const allTypes = data.flatMap(item => [item.customerType1, item.customerType2]);
      const uniqueTypes = [...new Set(allTypes.filter(type => type && type.trim() !== ''))];
      setCustomerTypes(uniqueTypes);
    });
  }, []);

  // 디자인 스타일 객체 정의
  const styles = {
    panel: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      margin: '20px auto',
      textAlign: 'center'
    },
    title: { fontSize: '18px', marginBottom: '20px', color: '#333' },
    select: {
      width: '100%',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '6px',
      border: '1px solid #ccc'
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: selectedType ? '#007bff' : '#ccc',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: selectedType ? 'pointer' : 'not-allowed'
    }
  };

  return (
    <div style={styles.panel}>
      <h2 style={styles.title}>영업 롤플레잉 설정</h2>
      <select 
        style={styles.select}
        value={selectedType} 
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="">고객 유형 선택</option>
        {customerTypes.map((type, index) => (
          <option key={index} value={type}>{type}</option>
        ))}
      </select>
      <button style={styles.button} disabled={!selectedType}>시작하기</button>
    </div>
  );
}
