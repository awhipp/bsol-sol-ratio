import React from 'react';
import { Percent, TrendingUp, AlertCircle } from 'lucide-react';

export default function StakingYieldCard({ apyData, feeRate, setFeeRate, isLoading }) {
  const grossApy = apyData ? apyData.apy : 0;
  const netApy = Math.max(0, grossApy - feeRate);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <TrendingUp size={20} color="var(--accent-color)" />
        <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Staking Yield Parameters</h2>
      </div>

      {apyData?.isFallback && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0.5rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '0.5rem 0.75rem', 
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={16} style={{ marginTop: '0.1rem', flexShrink: 0, color: 'var(--text-red)' }} />
          <p style={{ margin: 0 }}>
            Live APY data is currently unavailable. Using baseline network APY for projections.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Gross Staking APY</span>
            {isLoading ? (
              <div className="skeleton" style={{ width: '40px', height: '1rem' }}></div>
            ) : (
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{(grossApy * 100).toFixed(2)}%</span>
            )}
          </div>
          <div style={{ height: '6px', background: 'var(--bg-color)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'var(--accent-color)', opacity: 0.7 }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ETF Fee Rate (Editable)</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              step="0.01" 
              min="0"
              value={feeRate * 100} 
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFeeRate(isNaN(val) ? 0 : val / 100);
              }}
              style={{ paddingRight: '2rem', padding: '0.4rem 0.6rem', fontSize: '0.9rem' }}
            />
            <Percent size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          </div>
        </div>

        <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', fontSize: '1rem' }}>Net Staking APY</span>
            {isLoading ? (
              <div className="skeleton" style={{ width: '60px', height: '1.5rem' }}></div>
            ) : (
              <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--accent-color)' }}>
                {(netApy * 100).toFixed(2)}%
              </span>
            )}
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Drives ratio compounding over time after fees.
          </p>
        </div>
      </div>
    </div>
  );
}
