# BSOL / SOL Ratio & Staking Tracker

A modern web application built with React and Vite that tracks the price ratio between the Bitwise Solana Staking ETF (BSOL) and native Solana (SOL).

## Purpose

The primary purpose of this tool is to visualize and analyze the historical divergence between BSOL and spot SOL. Since the ETF automatically accrues staking rewards, the price of BSOL naturally appreciates relative to SOL over time.

This tracker allows users to:

1. **Visualize Historical Growth**: See how the ratio has compounded historically due to accumulated staking yields.
2. **Analyze Staking Performance**: Automatically derive the implied net staking APY based on the historical growth rate of the ratio.
3. **Project Future Value**: Convert current SOL holdings to BSOL and project their future compounded value based on the historical staking yield minus management fees.

## Features

- **Interactive Ratio Chart**: Zoomable historical line chart using Recharts, showing the BSOL/SOL ratio.
- **Timeframe Filtering**: Filter by 1D, 1M, 6M, 1Y, or ALL to view summary metrics (mean, min, max, percentage change).
- **Yield Calculation**: Derives the implied staking yield purely from the market pricing of BSOL vs SOL.
- **Conversion Calculator**: Instantly convert between SOL and BSOL at the current ratio, and project the outcome 1, 3, 5, or 10 years into the future.
- **Dark Mode**: Fully supports Light and Dark mode, persisting user preference locally.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:5173/bsol-sol-ratio/](http://localhost:5173/bsol-sol-ratio/) in your browser to see the application.

## Deployment

This project is configured to automatically build and deploy to GitHub Pages via a GitHub Action on pushes to the main branch.
