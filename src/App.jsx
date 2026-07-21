import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import RatioDashboard from './components/RatioDashboard';
import StakingYieldCard from './components/StakingYieldCard';
import Calculator from './components/Calculator';
import { loadRatioData } from './services/marketData';

function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [feeRate, setFeeRate] = useState(0.0020); // 0.20% default

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const ratioData = await loadRatioData();
        
        if (isMounted) {
          setData(ratioData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load market data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Derive Gross APY from historical market ratio growth + default fee (0.20%)
  const grossApy = useMemo(() => {
    if (data.length < 2) return 0.055;
    const start = data[0];
    const end = data[data.length - 1];
    const days = (end.timestamp - start.timestamp) / (1000 * 60 * 60 * 24);
    if (days <= 0) return 0.055;
    const historicalNetGrowth = Math.pow(end.ratio / start.ratio, 365 / days) - 1;
    // Underlying Solana gross APY before fee
    return historicalNetGrowth + 0.0020;
  }, [data]);

  // Net APY = Gross APY - User editable Fee Rate
  const netApy = Math.max(0, grossApy - feeRate);

  const currentRatio = data.length > 0 ? data[data.length - 1].ratio : null;
  const currentSolPrice = data.length > 0 ? data[data.length - 1].solPrice : null;
  const currentBsolPrice = data.length > 0 ? data[data.length - 1].bsolPrice : null;
  
  const apyData = data.length > 0 ? { apy: grossApy, isFallback: false } : null;

  return (
    <>
      <Header />
      <main className="container">
        <div className="dashboard-grid">
          {/* Main Chart Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <RatioDashboard 
              data={data} 
              isLoading={isLoading} 
              error={error} 
              currentSolPrice={currentSolPrice}
              currentBsolPrice={currentBsolPrice}
              netApy={netApy}
            />
            <Calculator 
              currentRatio={currentRatio} 
              netApy={netApy} 
              isLoading={isLoading} 
            />
          </div>
          
          {/* Side Panel Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <StakingYieldCard 
              apyData={apyData} 
              feeRate={feeRate} 
              setFeeRate={setFeeRate} 
              isLoading={isLoading} 
            />
            
            <div className="card glass-panel">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                About this Tool & Market Mechanics
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: 0 }}>
                  This tracker monitors the exchange ratio between <strong>Bitwise Solana Staking ETF (BSOL)</strong> and native <strong>Solana (SOL)</strong>. Because the ETF stakes its SOL holdings and automatically reinvests staking rewards, each BSOL share represents an increasing amount of SOL over time.
                </p>
                
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Why does the daily ratio oscillate?</strong>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <li>
                      <strong>24/7 Crypto vs. NYSE Hours:</strong> SOL trades continuously 24/7 globally, whereas BSOL stock trades on NYSE Arca only on weekdays during US market hours (9:30 AM – 4:00 PM ET). Crypto price shifts over weekends or overnight cause intraday repricing at market open.
                    </li>
                    <li>
                      <strong>Market Premium & Discount to NAV:</strong> ETF share prices fluctuate based on stock market order flow, occasionally trading at a slight premium or discount to their true underlying Net Asset Value (NAV).
                    </li>
                    <li>
                      <strong>Daily Market Noise:</strong> Short-term liquidity variations cause daily ratios to bounce above and below the baseline.
                    </li>
                  </ul>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Staking Yield Baseline</strong>
                  <p style={{ margin: 0 }}>
                    The dashed green line shows the theoretical compounding yield baseline (~5.32% net APY after ETF management fees). While daily market ratios noise around short-term sentiment, the overall trend trends upward along this yield curve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
