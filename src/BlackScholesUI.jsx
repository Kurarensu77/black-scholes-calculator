import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="px-4 sm:px-0">
      <Card className="w-full max-w-xl mx-auto p-4 sm:p-6">
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-700">
            <p><strong>Black-Scholes Formula (European Call):</strong></p>
            <p>C = S*N(d₁) - K*e<sup>-rT</sup>*N(d₂)</p>
            <p><strong>Put-Call Parity:</strong></p>
            <p>C - P = S - K*e<sup>-rT</sup></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries({
              S: "Spot Price (S) [$]",
              K: "Strike Price (K) [$]",
              T: "Time to Maturity (T) [years]",
              r: "Risk-Free Rate (r) [% as decimal]",
              sigma: "Volatility (σ) [% as decimal]",
            }).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input type="number" value={inputs[key]} onChange={e => setInputs({ ...inputs, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <Label>Option Type</Label>
              <select
                value={inputs.optionType}
                onChange={e => setInputs({ ...inputs, optionType: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </div>
          </div>

          <Button onClick={handleCalculate}>Calculate</Button>

          {result && (
            <div className="pt-4 space-y-1 text-sm">
              {Object.entries(result).map(([k, v]) => (
                <div key={k}><strong>{k}:</strong> {v.toFixed(4)}</div>
              ))}
              {parityResult && (
                <div><strong>{parityResult.label}:</strong> {parityResult.value.toFixed(4)}</div>
              )}
              {oppositeResult && (
                <div><strong>{oppositeResult.label}:</strong> {oppositeResult.value.toFixed(4)}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
