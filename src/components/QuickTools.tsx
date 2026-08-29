import { useState } from 'react';
import { Calculator, Code2, Scale, AlignLeft, Copy, Check } from 'lucide-react';

export function QuickTools() {
  const [activeTool, setActiveTool] = useState<'calc' | 'converter' | 'json' | 'counter'>('calc');
  const [copied, setCopied] = useState(false);

  // Calculator State
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp'>('length');
  const [unitVal, setUnitVal] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('miles');

  // JSON Formatter State
  const [jsonInput, setJsonInput] = useState('{"name":"Web App","status":"ready","modules":["tasks","notes","timer"]}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Word Counter State
  const [textCountInput, setTextCountInput] = useState('Welcome to Web Workspace. Type or paste your text here to analyze statistics.');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const evaluateMath = () => {
    try {
      // Safe sanitized arithmetic evaluator
      const sanitized = calcInput.replace(/[^0-9+\-*/().%\s]/g, '');
      if (!sanitized) return;
      // eslint-disable-next-line no-new-func
      const res = Function(`'use strict'; return (${sanitized})`)();
      setCalcResult(String(res));
    } catch {
      setCalcResult('Error');
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (err: unknown) {
      setJsonError((err as Error).message);
      setJsonOutput('');
    }
  };

  const calculateConversion = () => {
    if (unitCategory === 'length') {
      // Base: meters
      const toMeters: Record<string, number> = { km: 1000, m: 1, cm: 0.01, miles: 1609.34, feet: 0.3048, inches: 0.0254 };
      const meters = unitVal * (toMeters[fromUnit] || 1);
      return (meters / (toMeters[toUnit] || 1)).toFixed(4);
    }
    if (unitCategory === 'weight') {
      // Base: kg
      const toKg: Record<string, number> = { kg: 1, g: 0.001, lbs: 0.453592, oz: 0.0283495 };
      const kg = unitVal * (toKg[fromUnit] || 1);
      return (kg / (toKg[toUnit] || 1)).toFixed(4);
    }
    if (unitCategory === 'temp') {
      if (fromUnit === 'C' && toUnit === 'F') return ((unitVal * 9) / 5 + 32).toFixed(2);
      if (fromUnit === 'F' && toUnit === 'C') return (((unitVal - 32) * 5) / 9).toFixed(2);
      if (fromUnit === 'C' && toUnit === 'K') return (unitVal + 273.15).toFixed(2);
      return unitVal.toFixed(2);
    }
    return 0;
  };

  const wordCount = textCountInput.trim() ? textCountInput.trim().split(/\s+/).length : 0;
  const charCount = textCountInput.length;
  const lineCount = textCountInput ? textCountInput.split('\n').length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="space-y-6">
      {/* Utility Nav */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTool('calc')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTool === 'calc' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculator</span>
        </button>
        <button
          onClick={() => setActiveTool('converter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTool === 'converter' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Unit Converter</span>
        </button>
        <button
          onClick={() => setActiveTool('json')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTool === 'json' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>JSON Formatter</span>
        </button>
        <button
          onClick={() => setActiveTool('counter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTool === 'counter' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Text & Word Counter</span>
        </button>
      </div>

      {/* Tool Panes */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        {/* Calculator */}
        {activeTool === 'calc' && (
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Math Scratchpad & Calculator</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && evaluateMath()}
                placeholder="e.g. (150 * 1.2) + 45 / 3"
                className="w-full text-lg font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={evaluateMath}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Calculate =
                </button>
                <div className="text-right">
                  <span className="text-xs text-slate-400 mr-2">Result:</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {calcResult || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '%', '+'].map(
                (char) => (
                  <button
                    key={char}
                    onClick={() => setCalcInput((prev) => prev + char)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-mono text-sm font-semibold text-slate-800 cursor-pointer"
                  >
                    {char}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Unit Converter */}
        {activeTool === 'converter' && (
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Unit Converter</h3>
            <div className="flex gap-2">
              {(['length', 'weight', 'temp'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setUnitCategory(cat);
                    if (cat === 'length') {
                      setFromUnit('km');
                      setToUnit('miles');
                    } else if (cat === 'weight') {
                      setFromUnit('kg');
                      setToUnit('lbs');
                    } else {
                      setFromUnit('C');
                      setToUnit('F');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                    unitCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">From Value</label>
                <input
                  type="number"
                  value={unitVal}
                  onChange={(e) => setUnitVal(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono mb-2"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {unitCategory === 'length' && ['km', 'm', 'cm', 'miles', 'feet', 'inches'].map((u) => <option key={u} value={u}>{u}</option>)}
                  {unitCategory === 'weight' && ['kg', 'g', 'lbs', 'oz'].map((u) => <option key={u} value={u}>{u}</option>)}
                  {unitCategory === 'temp' && ['C', 'F', 'K'].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Converted Value</label>
                <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-indigo-700 mb-2 truncate">
                  {calculateConversion()}
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {unitCategory === 'length' && ['miles', 'km', 'm', 'cm', 'feet', 'inches'].map((u) => <option key={u} value={u}>{u}</option>)}
                  {unitCategory === 'weight' && ['lbs', 'kg', 'g', 'oz'].map((u) => <option key={u} value={u}>{u}</option>)}
                  {unitCategory === 'temp' && ['F', 'C', 'K'].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* JSON Formatter */}
        {activeTool === 'json' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">JSON Formatter & Validator</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={formatJson}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Format JSON
                </button>
                {jsonOutput && (
                  <button
                    onClick={() => handleCopy(jsonOutput)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Raw JSON Input</label>
                <textarea
                  rows={10}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Formatted Output</label>
                {jsonError ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-mono">
                    Invalid JSON: {jsonError}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    rows={10}
                    value={jsonOutput || 'Click "Format JSON" above...'}
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Word Counter */}
        {activeTool === 'counter' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Text & Word Counter</h3>
            <textarea
              rows={8}
              value={textCountInput}
              onChange={(e) => setTextCountInput(e.target.value)}
              placeholder="Paste content here to count words, characters, sentences..."
              className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-900">{wordCount}</div>
                <div className="text-xs text-slate-500">Words</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-900">{charCount}</div>
                <div className="text-xs text-slate-500">Characters</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-900">{lineCount}</div>
                <div className="text-xs text-slate-500">Lines</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-900">~{readingTime}m</div>
                <div className="text-xs text-slate-500">Read Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
