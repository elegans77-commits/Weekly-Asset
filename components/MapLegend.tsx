const legendItems = [
  { color: '#8b0000', label: '+0.30% 이상' },
  { color: '#c62828', label: '+0.20% 이상' },
  { color: '#ef5350', label: '+0.10% 이상' },
  { color: '#ffcdd2', label: '+0.03% 이상' },
  { color: '#f5f5f5', label: '-0.03% 초과 ~ +0.03% 미만' },
  { color: '#90caf9', label: '-0.03% 이하' },
  { color: '#1976d2', label: '-0.10% 이하' },
  { color: '#0d47a1', label: '-0.20% 이하' },
  { color: '#efefef', label: '데이터 없음' },
];

export default function MapLegend() {
  return (
    <div className="legend">
      <strong style={{ display: 'block', marginBottom: 8 }}>범례</strong>
      {legendItems.map((item) => (
        <div key={item.label} className="legend-item">
          <span className="legend-color" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
