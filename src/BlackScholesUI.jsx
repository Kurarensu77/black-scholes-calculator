import { useState } from "react";

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Black-Scholes Option Pricing Calculator</h1>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Black-Scholes Formula (European Call):</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono mb-2">C = S*N(d₁) - K*e<sup>-rT</sup>*N(d₂)</p>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Put-Call Parity:</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">C - P = S - K*e<sup>-rT</sup></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {Object.entries({
                S: { label: "Spot Price (S)", unit: "$", step: "0.01" },
                K: { label: "Strike Price (K)", unit: "$", step: "0.01" },
                T: { label: "Time to Maturity (T)", unit: "years", step: "0.01" },
                r: { label: "Risk-Free Rate (r)", unit: "%", step: "0.0001" },
                sigma: { label: "Volatility (σ)", unit: "%", step: "0.0001" },
              }).map(([key, { label, unit, step }]) => (
                <div key={key} className="space-y-1">
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} <span className="text-xs text-gray-500">({unit})</span>
                  </label>
                  <input
                    id={key}
                    type="number"
                    step={step}
                    value={inputs[key]}
                    onChange={e => setInputs({ ...inputs, [key]: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              ))}
              
              <div className="space-y-1">
                <label htmlFor="optionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Option Type
                </label>
                <select
                  id="optionType"
                  value={inputs.optionType}
                  onChange={e => setInputs({ ...inputs, optionType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="call">Call Option</option>
                  <option value="put">Put Option</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Calculate
            </button>

            {result && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {key}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {typeof value === 'number' ? value.toFixed(4) : value}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Put-Call Parity Verification</h3>
                  <div className="space-y-2">
                    {parityResult && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{parityResult.label}:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {parityResult.value.toFixed(4)}
                        </span>
                      </div>
                    )}
                    {oppositeResult && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{oppositeResult.label}:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {oppositeResult.value.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Black-Scholes Option Pricing Model</p>
        </div>
      </div>
    </div>
  );
}
