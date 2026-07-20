import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { mockRevenueTrend } from '../services/api';

export const RevenueChart: React.FC = () => {
  const [hoveredData, setHoveredData] = useState<{ month: string; revenue: number; x: number; y: number } | null>(null);

  // Chart dimensions & scaling
  const width = 650;
  const height = 210;
  const padding = { top: 20, right: 30, bottom: 30, left: 20 };

  const minRevenue = 30000;
  const maxRevenue = 90000;

  const points = mockRevenueTrend.map((item, index) => {
    const x = padding.left + (index / (mockRevenueTrend.length - 1)) * (width - padding.left - padding.right);
    const y = height - padding.bottom - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * (height - padding.top - padding.bottom);
    return { ...item, x, y };
  });

  // Generate smooth cubic bezier SVG curve path
  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');

  // Closed area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding.bottom} L ${points[0].x},${height - padding.bottom} Z`;

  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="card-header">
        <div>
          <div className="card-title">Revenue Trends</div>
          <div className="card-subtitle">Monthly overview of financial collections</div>
        </div>
        <button type="button" className="time-filter-btn">
          Last 6 Months <ChevronDown size={14} />
        </button>
      </div>

      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          {[40000, 60000, 80000].map((val) => {
            const y = height - padding.bottom - ((val - minRevenue) / (maxRevenue - minRevenue)) * (height - padding.top - padding.bottom);
            return (
              <line
                key={val}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area gradient */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Main Blue Trend Line */}
          <path d={pathD} fill="none" stroke="#1d4ed8" strokeWidth="3.5" strokeLinecap="round" />

          {/* Interactive Data Points */}
          {points.map((pt) => (
            <g key={pt.month}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredData?.month === pt.month ? "6" : "3.5"}
                fill={hoveredData?.month === pt.month ? "#1d4ed8" : "#ffffff"}
                stroke="#1d4ed8"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredData(pt)}
                onMouseLeave={() => setHoveredData(null)}
              />
              {/* X-Axis Month Label */}
              <text
                x={pt.x}
                y={height - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#64748b"
                fontWeight="500"
              >
                {pt.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredData && (
          <div
            style={{
              position: 'absolute',
              left: `${(hoveredData.x / width) * 100}%`,
              top: `${(hoveredData.y / height) * 100 - 20}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
              zIndex: 10
            }}
          >
            {hoveredData.month}: ${hoveredData.revenue.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
