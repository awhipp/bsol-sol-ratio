import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TIMEFRAMES = {
  '1D': 1,
  '1M': 30,
  '6M': 182,
  '1Y': 365,
  'ALL': null
};

export default function RatioDashboard({ data, isLoading, error, currentSolPrice, currentBsolPrice, netApy = 0.053 }) {
  const [timeframe, setTimeframe] = useState('ALL');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let subset = data;
    if (timeframe !== 'ALL') {
      const days = TIMEFRAMES[timeframe];
      const latestTimestamp = data[data.length - 1].timestamp;
      const cutoff = latestTimestamp - days * 24 * 60 * 60 * 1000;
      subset = data.filter(d => d.timestamp >= cutoff);
    }

    if (subset.length === 0) return [];

    const startRatio = subset[0].ratio;
    const startTimestamp = subset[0].timestamp;

    // Add compounding baseline to each point
    return subset.map((d) => {
      const daysFromStart = (d.timestamp - startTimestamp) / (1000 * 60 * 60 * 24);
      const compoundingBaseline = startRatio * Math.pow(1 + netApy, daysFromStart / 365);

      return {
        ...d,
        compoundingBaseline
      };
    });
  }, [data, timeframe, netApy]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const ratios = filteredData.map(d => d.ratio);
    const startRatio = ratios[0];
    const endRatio = ratios[ratios.length - 1];
    
    return {
      latest: endRatio,
      mean: ratios.reduce((a, b) => a + b, 0) / ratios.length,
      min: Math.min(...ratios),
      max: Math.max(...ratios),
      pctChange: ((endRatio - startRatio) / startRatio) * 100
    };
  }, [filteredData]);

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', color: 'var(--text-red)', padding: '3rem 1rem' }}>
        <h3>Error loading market data</h3>
        <p>{error}</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--chart-tooltip-bg)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          boxShadow: 'var(--card-shadow)'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ margin: '0.25rem 0 0 0', color: entry.color, fontWeight: 'bold', fontSize: '0.875rem' }}>
              {entry.name}: {entry.value?.toFixed(4)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>BSOL / SOL Price Ratio</h2>
        
        <div style={{ display: 'flex', background: 'var(--bg-color)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid var(--border-color)' }}>
          {Object.keys(TIMEFRAMES).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: timeframe === tf ? 'bold' : 'normal',
                backgroundColor: timeframe === tf ? 'var(--panel-bg)' : 'transparent',
                color: timeframe === tf ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: timeframe === tf ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="metrics-row">
        <MetricCard label="SOL Price" value={currentSolPrice} isLoading={isLoading} format={v => `$${v.toFixed(2)}`} />
        <MetricCard label="BSOL Price" value={currentBsolPrice} isLoading={isLoading} format={v => `$${v.toFixed(2)}`} />
        <div className="metric-item">
          <div className="metric-label">Current Ratio (BSOL/SOL)</div>
          {isLoading ? (
            <div className="skeleton" style={{ height: '1.5rem', width: '70%', marginTop: '0.25rem' }}></div>
          ) : (
            <div className="metric-value">
              {stats?.latest?.toFixed(4)}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '0.25rem' }}>
                (1 SOL = {(1 / stats?.latest).toFixed(4)} BSOL)
              </div>
            </div>
          )}
        </div>
        <MetricCard 
          label="% Change" 
          value={stats?.pctChange} 
          isLoading={isLoading} 
          format={v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}
          valueClass={stats?.pctChange >= 0 ? 'text-green' : 'text-red'}
        />
        <MetricCard label="Mean (Window)" value={stats?.mean} isLoading={isLoading} format={v => v.toFixed(4)} />
        <MetricCard label="Min (Window)" value={stats?.min} isLoading={isLoading} format={v => v.toFixed(4)} />
        <MetricCard label="Max (Window)" value={stats?.max} isLoading={isLoading} format={v => v.toFixed(4)} />
      </div>

      <div style={{ height: '320px', width: '100%', marginTop: '2rem' }}>
        {isLoading ? (
          <div className="skeleton" style={{ width: '100%', height: '100%' }}></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']} 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={val => val.toFixed(3)}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.875rem', paddingBottom: '0.5rem' }} />
              <Line 
                type="monotone" 
                dataKey="ratio" 
                name="Daily Market Ratio"
                stroke="var(--accent-color)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'var(--accent-color)', stroke: 'var(--panel-bg)', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="compoundingBaseline" 
                name="Staking Yield Baseline"
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, isLoading, format = v => v, valueClass = '' }) {
  return (
    <div className="metric-item">
      <div className="metric-label">{label}</div>
      {isLoading ? (
        <div className="skeleton" style={{ height: '1.5rem', width: '70%', marginTop: '0.25rem' }}></div>
      ) : (
        <div className={`metric-value ${valueClass}`}>
          {value !== undefined && value !== null ? format(value) : '-'}
        </div>
      )}
    </div>
  );
}
