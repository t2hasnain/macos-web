// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';

export default function CalculatorApp() {
  const [activeTab, setActiveTab] = useState<'standard' | 'scientific' | 'currency'>('standard');
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [resetOnInput, setResetOnInput] = useState(false);

  // Currency Converter states
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [currencyAmount, setCurrencyAmount] = useState('1');
  const [convertedResult, setConvertedResult] = useState('0.92');

  const exchangeRates: Record<string, Record<string, number>> = {
    USD: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155.6, CAD: 1.36, AUD: 1.50 },
    EUR: { USD: 1.09, EUR: 1, GBP: 0.86, JPY: 169.1, CAD: 1.48, AUD: 1.63 },
    GBP: { USD: 1.27, EUR: 1.16, GBP: 1, JPY: 196.4, CAD: 1.72, AUD: 1.90 },
    JPY: { USD: 0.0064, EUR: 0.0059, GBP: 0.0051, JPY: 1, CAD: 0.0087, AUD: 0.0096 },
    CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 114.4, CAD: 1, AUD: 1.10 },
    AUD: { USD: 0.67, EUR: 0.61, GBP: 0.53, JPY: 103.7, CAD: 0.91, AUD: 1 }
  };

  const handleNum = (num: string) => {
    if (display === '0' || resetOnInput) {
      setDisplay(num);
      setResetOnInput(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setResetOnInput(true);
  };

  const handleScientific = (func: string) => {
    try {
      const val = Number(display);
      let res = 0;
      switch (func) {
        case 'sin': res = Math.sin(val); break;
        case 'cos': res = Math.cos(val); break;
        case 'tan': res = Math.tan(val); break;
        case 'sqrt': res = Math.sqrt(val); break;
        case 'log': res = Math.log10(val); break;
        case 'ln': res = Math.log(val); break;
        case 'sq': res = val * val; break;
        case 'pi': res = Math.PI; break;
        case 'e': res = Math.E; break;
      }
      setDisplay(Number(res.toFixed(8)).toString());
      setResetOnInput(true);
    } catch {
      setDisplay('Error');
    }
  };

  const handleEqual = () => {
    if (!equation) return;
    try {
      const fullEq = equation + display;
      const res = new Function(`return ${fullEq}`)();
      setDisplay(Number(res).toString());
      setEquation('');
      setResetOnInput(true);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setResetOnInput(false);
  };

  const calculateCurrency = (amount: string, from: string, to: string) => {
    const num = Number(amount);
    if (isNaN(num)) return;
    const rate = exchangeRates[from]?.[to] || 1;
    setConvertedResult(Number((num * rate).toFixed(2)).toString());
  };

  const handleCurrencyChange = (val: string) => {
    setCurrencyAmount(val);
    calculateCurrency(val, fromCurrency, toCurrency);
  };

  return (
    <div className="macos-app flex flex-col h-full backdrop-blur-2xl p-4 gap-3.5 select-none">
      
      {/* Top Segment Mode Selection */}
      <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
        <button 
          onClick={() => setActiveTab('standard')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'standard' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
        >
          Standard
        </button>
        <button 
          onClick={() => setActiveTab('scientific')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'scientific' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
        >
          Scientific
        </button>
        <button 
          onClick={() => setActiveTab('currency')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'currency' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
        >
          Currency
        </button>
      </div>

      {activeTab !== 'currency' ? (
        <>
          {/* Main Display screen */}
          <div className="flex flex-col items-end justify-end flex-1 bg-black/45 border border-white/5 rounded-2xl p-4 select-text">
            <span className="text-[10px] text-white/30 h-4 font-mono">{equation}</span>
            <span className="text-3xl font-light font-mono truncate w-full text-right">{display}</span>
          </div>

          {/* Combined Grid Buttons */}
          <div className="flex gap-2">
            {/* Scientific Left Panel */}
            {activeTab === 'scientific' && (
              <div className="grid grid-cols-2 gap-2 w-1/3">
                <CalcBtn label="sin" onClick={() => handleScientific('sin')} variant="sci" />
                <CalcBtn label="cos" onClick={() => handleScientific('cos')} variant="sci" />
                <CalcBtn label="tan" onClick={() => handleScientific('tan')} variant="sci" />
                <CalcBtn label="√" onClick={() => handleScientific('sqrt')} variant="sci" />
                <CalcBtn label="x²" onClick={() => handleScientific('sq')} variant="sci" />
                <CalcBtn label="log" onClick={() => handleScientific('log')} variant="sci" />
                <CalcBtn label="ln" onClick={() => handleScientific('ln')} variant="sci" />
                <CalcBtn label="π" onClick={() => handleScientific('pi')} variant="sci" />
              </div>
            )}

            {/* Core numbers grid */}
            <div className={`grid gap-2 flex-1 ${activeTab === 'scientific' ? 'grid-cols-4' : 'grid-cols-4'}`}>
              <CalcBtn label="C" onClick={handleClear} variant="danger" />
              <CalcBtn label="±" onClick={() => setDisplay((Number(display) * -1).toString())} variant="op" />
              <CalcBtn label="%" onClick={() => setDisplay((Number(display) / 100).toString())} variant="op" />
              <CalcBtn label="/" onClick={() => handleOperator('/')} variant="orange" />

              <CalcBtn label="7" onClick={() => handleNum('7')} />
              <CalcBtn label="8" onClick={() => handleNum('8')} />
              <CalcBtn label="9" onClick={() => handleNum('9')} />
              <CalcBtn label="*" onClick={() => handleOperator('*')} variant="orange" />

              <CalcBtn label="4" onClick={() => handleNum('4')} />
              <CalcBtn label="5" onClick={() => handleNum('5')} />
              <CalcBtn label="6" onClick={() => handleNum('6')} />
              <CalcBtn label="-" onClick={() => handleOperator('-')} variant="orange" />

              <CalcBtn label="1" onClick={() => handleNum('1')} />
              <CalcBtn label="2" onClick={() => handleNum('2')} />
              <CalcBtn label="3" onClick={() => handleNum('3')} />
              <CalcBtn label="+" onClick={() => handleOperator('+')} variant="orange" />

              <CalcBtn label="0" onClick={() => handleNum('0')} span={2} />
              <CalcBtn label="." onClick={() => handleNum('.')} />
              <CalcBtn label="=" onClick={handleEqual} variant="orangeEqual" />
            </div>
          </div>
        </>
      ) : (
        /* Currency Converter Viewport */
        <div className="flex-1 flex flex-col justify-center gap-4 p-2">
          {/* Input Currency */}
          <div className="flex flex-col gap-1.5 bg-black/30 border border-white/5 p-4 rounded-xl">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">From Base Currency</span>
            <div className="flex gap-3">
              <select 
                value={fromCurrency}
                onChange={(e) => { setFromCurrency(e.target.value); calculateCurrency(currencyAmount, e.target.value, toCurrency); }}
                className="bg-[#242427] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none flex-1"
              >
                {Object.keys(exchangeRates).map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
              <input 
                type="number"
                value={currencyAmount}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                placeholder="Amount"
                className="bg-[#242427] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-semibold outline-none w-28 text-right"
              />
            </div>
          </div>

          {/* Swap icon */}
          <button 
            onClick={() => {
              const temp = fromCurrency;
              setFromCurrency(toCurrency);
              setToCurrency(temp);
              calculateCurrency(currencyAmount, toCurrency, temp);
            }}
            className="self-center p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={12} className="text-blue-400" />
          </button>

          {/* Result Currency */}
          <div className="flex flex-col gap-1.5 bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl shadow-inner">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">To Target Currency</span>
            <div className="flex gap-3">
              <select 
                value={toCurrency}
                onChange={(e) => { setToCurrency(e.target.value); calculateCurrency(currencyAmount, fromCurrency, e.target.value); }}
                className="bg-[#242427] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none flex-1"
              >
                {Object.keys(exchangeRates).map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
              <div className="bg-[#242427] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-blue-400 flex items-center justify-end w-28">
                {convertedResult}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalcBtn({ label, onClick, variant = 'num', span = 1 }: { label: string; onClick: () => void; variant?: 'num' | 'op' | 'orange' | 'orangeEqual' | 'danger' | 'sci'; span?: number }) {
  const getStyle = () => {
    switch (variant) {
      case 'danger': return 'bg-[#3f3f46]/50 border-white/5 hover:bg-[#52525b]/50 text-white font-medium';
      case 'op': return 'bg-[#3f3f46]/50 border-white/5 hover:bg-[#52525b]/50 text-white font-medium';
      case 'sci': return 'bg-[#27272a]/70 border-white/5 hover:bg-[#3f3f46]/70 text-blue-400 font-semibold text-xs';
      case 'orange': return 'bg-[#f97316] hover:bg-[#ea580c] border-transparent text-white font-bold';
      case 'orangeEqual': return 'bg-[#f97316] hover:bg-[#ea580c] border-transparent text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.35)]';
      default: return 'bg-[#27272a]/60 border-white/5 hover:bg-[#3f3f46]/60 text-white/90 font-medium';
    }
  };

  return (
    <button 
      onClick={onClick}
      className={`py-3.5 rounded-xl border flex items-center justify-center transition-all active:scale-95 text-xs font-semibold ${getStyle()}`}
      style={{ gridColumn: span > 1 ? `span ${span}` : 'auto' }}
    >
      {label}
    </button>
  );
}
