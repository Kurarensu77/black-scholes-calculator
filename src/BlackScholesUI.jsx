import { useState, useEffect } from "react";

export default function BlackScholesUI() {
  const [inputs, setInputs] = useState({
    S: 100,
    K: 100,
    T: 1,
    r: 0.05,
    sigma: 0.2,
    optionType: "call",
  });
  const [result, setResult] = useState(null);
  const [parityResult, setParityResult] = useState(null);
  const [oppositeResult, setOppositeResult] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check for saved theme preference or use system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setDarkMode(false);
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference if no saved preference
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  function normCDF(x) {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1 / (1 + 0.3275911 * x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
    const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * erf);
  }

  function normPDF(x) {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
  }

  function blackScholesPrice(S, K, T, r, sigma, optionType) {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    let price, delta, theta, rho;
    if (optionType === "call") {
      price = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
      delta = normCDF(d1);
      theta = (-S * normPDF(d1) * sigma / (2 * Math.sqrt(T)) -
        r * K * Math.exp(-r * T) * normCDF(d2)) / 365;
      rho = K * T * Math.exp(-r * T) * normCDF(d2) / 100;
    } else {
      price = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
      delta = normCDF(d1) - 1;
      theta = (-S * normPDF(d1) * sigma / (2 * Math.sqrt(T)) +
        r * K * Math.exp(-r * T) * normCDF(-d2)) / 365;
      rho = -K * T * Math.exp(-r * T) * normCDF(-d2) / 100;
    }

    const gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));
    const vega = S * normPDF(d1) * Math.sqrt(T) / 100;

    return { price, delta, gamma, vega, theta, rho };
  }

  const handleCalculate = () => {
    const { S, K, T, r, sigma, optionType } = inputs;
    const numericInputs = {
      S: Number(S),
      K: Number(K),
      T: Number(T),
      r: Number(r),
      sigma: Number(sigma),
    };

    const res = blackScholesPrice(
      numericInputs.S, numericInputs.K, numericInputs.T,
      numericInputs.r, numericInputs.sigma, optionType
    );
    setResult(res);

    const discount = numericInputs.K * Math.exp(-numericInputs.r * numericInputs.T);
    if (optionType === "call") {
      const impliedPut = res.price - numericInputs.S + discount;
      setParityResult({ label: "Put (via parity)", value: impliedPut });
      const putRes = blackScholesPrice(
        numericInputs.S, numericInputs.K, numericInputs.T,
        numericInputs.r, numericInputs.sigma, "put"
      );
      setOppositeResult({ label: "Put (via Black-Scholes)", value: putRes.price });
    } else {
      const impliedCall = res.price + numericInputs.S - discount;
      setParityResult({ label: "Call (via parity)", value: impliedCall });
      const callRes = blackScholesPrice(
        numericInputs.S, numericInputs.K, numericInputs.T,
        numericInputs.r, numericInputs.sigma, "call"
      );
      setOppositeResult({ label: "Call (via Black-Scholes)", value: callRes.price });
    }
  };

  const handleInputChange = (key, value) => {
    setInputs({ ...inputs, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Black-Scholes Option Pricing</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-4 6a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50">
          <div className="p-6 sm:p-8">
            <div className="bg-white/60 dark:bg-slate-700/60 p-4 rounded-lg mb-6 space-y-4 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Black-Scholes Formula (European Call):</h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-mono mb-2">C = S*N(d₁) - K*e<sup>-rT</sup>*N(d₂)</p>
              </div>
              
              <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Where:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">d₂ = d₁ - σ√T</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 dark:text-slate-400">S = Current stock price</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">K = Strike price</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">r = Risk-free interest rate</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">σ = Volatility</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">T = Time to expiration (years)</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">N() = Standard normal CDF</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Put-Call Parity:</h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">C - P = S - K*e<sup>-rT</sup></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {Object.entries(inputs).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {key === 'S' ? 'Stock Price (S)' : 
                     key === 'K' ? 'Strike Price (K)' : 
                     key === 'T' ? 'Time to Expiry (T)' : 
                     key === 'r' ? 'Risk-free Rate (r)' : 
                     key === 'sigma' ? 'Volatility (σ)' : 
                     'Option Type'}
                  </label>
                  {key === 'optionType' ? (
                    <select
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="call">Call Option</option>
                      <option value="put">Put Option</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      step={key === 'T' ? '0.01' : '0.0001'}
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleCalculate}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors hover:shadow-md transform hover:-translate-y-0.5"
            >
              Calculate
            </button>

            {result && (
              <div className="mt-8 border-t border-slate-200/50 dark:border-slate-700/50 pt-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result).map(([key, value]) => (
                    <div key={key} className="bg-slate-50/50 dark:bg-slate-700/50 p-3 rounded-lg backdrop-blur-sm">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {key}
                      </div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {typeof value === 'number' ? value.toFixed(4) : value}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Put-Call Parity Verification</h3>
                  <div className="space-y-2">
                    {parityResult && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{parityResult.label}:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{parityResult.value.toFixed(4)}</span>
                      </div>
                    )}
                    {oppositeResult && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{oppositeResult.label}:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{oppositeResult.value.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Black-Scholes Option Pricing Model</p>
        </div>
      </div>
    </div>
  );
}
