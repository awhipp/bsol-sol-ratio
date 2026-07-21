import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Calculator as CalcIcon } from 'lucide-react';

export default function Calculator({ currentRatio, netApy, isLoading }) {
  const [solInput, setSolInput] = useState('1.00');
  const [bsolInput, setBsolInput] = useState('');
  const [horizon, setHorizon] = useState(1);

  // Auto-calculate BSOL when currentRatio loads or updates
  useEffect(() => {
    if (currentRatio && solInput !== '' && !isNaN(parseFloat(solInput))) {
      setBsolInput((parseFloat(solInput) / currentRatio).toFixed(4));
    }
  }, [currentRatio]);

  // Handle bidirectional updates
  const handleSolChange = (e) => {
    const val = e.target.value;
    // Basic sanitization
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setSolInput(val);
      if (val !== '' && currentRatio) {
        setBsolInput((parseFloat(val) / currentRatio).toFixed(4));
      } else {
        setBsolInput('');
      }
    }
  };

  const handleBsolChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setBsolInput(val);
      if (val !== '' && currentRatio) {
        setSolInput((parseFloat(val) * currentRatio).toFixed(4));
      } else {
        setSolInput('');
      }
    }
  };

  // Projections
  const projectedRatio = currentRatio ? currentRatio * Math.pow(1 + netApy, horizon) : 0;
  const bsolAmount = parseFloat(bsolInput) || 0;
  const projectedSolValue = bsolAmount * projectedRatio;

  const currentSolValue = parseFloat(solInput) || 0;
  const solGain = projectedSolValue - currentSolValue;
  const pctGain = currentSolValue > 0 ? (solGain / currentSolValue) * 100 : 0;

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <CalcIcon size={24} color="var(--accent-color)" />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Conversion & Projection</h2>
        </div>
        <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="skeleton" style={{ height: '2rem', width: '60%', margin: '0 auto 1rem' }}></div>
          <p>Loading live market ratio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <CalcIcon size={24} color="var(--accent-color)" />
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Conversion & Projection</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            SOL Amount
          </label>
          <input
            type="text"
            placeholder="1.00"
            value={solInput}
            onChange={handleSolChange}
          />
        </div>

        <div style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          <ArrowRightLeft size={20} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            BSOL Amount
          </label>
          <input
            type="text"
            placeholder="0.00"
            value={bsolInput}
            onChange={handleBsolChange}
          />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Future Projection</h3>
          <select
            value={horizon}
            onChange={(e) => setHorizon(parseInt(e.target.value))}
            style={{ width: 'auto', padding: '0.5rem', cursor: 'pointer' }}
          >
            <option value={1}>1 Year</option>
            <option value={3}>3 Years</option>
            <option value={5}>5 Years</option>
            <option value={10}>10 Years</option>
          </select>
        </div>

        <div className="metrics-row" style={{ marginBottom: 0 }}>
          <div className="metric-item">
            <div className="metric-label">Projected Rate ({horizon}Y)</div>
            <div className="metric-value">
              1 BSOL = {projectedRatio.toFixed(4)} SOL
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '0.25rem' }}>
                (1 SOL = {(1 / projectedRatio).toFixed(4)} BSOL)
              </div>
            </div>
          </div>
          <div className="metric-item" style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'var(--accent-color)' }}>
            <div className="metric-label">Projected SOL Value</div>
            <div className="metric-value">{projectedSolValue.toFixed(4)} SOL</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Estimated Yield</div>
            <div className="metric-value text-green">
              +{solGain.toFixed(4)} SOL ({pctGain.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
