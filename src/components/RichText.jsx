function RichText({ text, highlights = "", className = "text-gray-700 leading-relaxed" }) {
    if (!text) return null;
  
    // 하이라이트 키워드 파싱
    const keywords = highlights
      ? highlights.split('\n').map(k => k.trim()).filter(Boolean)
      : [];
  
    // 키워드 매핑 함수
    function applyHighlights(line) {
      if (keywords.length === 0) return line;
  
      const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
      return line.split(regex).map((part, i) =>
        keywords.includes(part)
          ? <mark key={i} style={{ backgroundColor: '#FFF000', borderRadius: '2px', padding: '0 2px' }}>{part}</mark>
          : part
      );
    }
  
    return (
      <div className={className}>
        {text.split('\n').map((line, i) => (
          <span key={i}>
            {applyHighlights(line)}
            <br />
          </span>
        ))}
      </div>
    );
  }
  
  export default RichText;