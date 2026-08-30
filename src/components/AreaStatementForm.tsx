import React from 'react';
import {
  Calculator,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Droplets,
  Sun,
  ShieldAlert,
  Car,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { AreaStatementData, FloorAreaDetail, Language } from '../types';

interface AreaStatementFormProps {
  data: AreaStatementData;
  onChange: (updated: Partial<AreaStatementData>) => void;
  language: Language;
  onNext: () => void;
  onPrev: () => void;
}

export const AreaStatementForm: React.FC<AreaStatementFormProps> = ({
  data,
  onChange,
  language,
  onNext,
  onPrev,
}) => {
  const isMl = language === 'ml';

  // Handle Plot Area Conversion (1 Cent = 40.4686 sq.m)
  const handlePlotSqMChange = (sqm: number) => {
    const cents = Number((sqm / 40.4686).toFixed(3));
    onChange({ plotAreaSqM: sqm, plotAreaCents: cents });
  };

  const handlePlotCentsChange = (cents: number) => {
    const sqm = Number((cents * 40.4686).toFixed(2));
    onChange({ plotAreaCents: cents, plotAreaSqM: sqm });
  };

  // Floor area helpers
  const handleAddFloor = () => {
    const newFloorNumber = data.floors.length + 1;
    const newFloors: FloorAreaDetail[] = [
      ...data.floors,
      {
        floorName: `Floor ${newFloorNumber}`,
        builtUpArea: 60.0,
        carpetArea: 48.0,
        occupancy: data.occupancyGroup,
        heightFromGround: 3.0 * newFloorNumber,
      },
    ];
    const totalBuiltUp = newFloors.reduce((sum, f) => sum + f.builtUpArea, 0);
    const totalFloor = newFloors.reduce((sum, f) => sum + f.builtUpArea, 0);
    const totalCarpet = newFloors.reduce((sum, f) => sum + f.carpetArea, 0);
    onChange({
      floors: newFloors,
      numberOfFloors: newFloors.length,
      totalBuiltUpAreaSqM: totalBuiltUp,
      totalFloorAreaSqM: totalFloor,
      totalCarpetAreaSqM: totalCarpet,
    });
  };

  const handleRemoveFloor = (index: number) => {
    if (data.floors.length <= 1) return;
    const newFloors = data.floors.filter((_, idx) => idx !== index);
    const totalBuiltUp = newFloors.reduce((sum, f) => sum + f.builtUpArea, 0);
    const totalFloor = newFloors.reduce((sum, f) => sum + f.builtUpArea, 0);
    const totalCarpet = newFloors.reduce((sum, f) => sum + f.carpetArea, 0);
    onChange({
      floors: newFloors,
      numberOfFloors: newFloors.length,
      totalBuiltUpAreaSqM: totalBuiltUp,
      totalFloorAreaSqM: totalFloor,
      totalCarpetAreaSqM: totalCarpet,
    });
  };

  const handleFloorChange = (index: number, partial: Partial<FloorAreaDetail>) => {
    const newFloors = [...data.floors];
    newFloors[index] = { ...newFloors[index], ...partial };
    const totalBuiltUp = newFloors.reduce((sum, f) => sum + f.builtUpArea, 0);
    const totalFloor = newFloors.reduce((sum, f) => sum + f.builtUpArea, 0);
    const totalCarpet = newFloors.reduce((sum, f) => sum + f.carpetArea, 0);
    onChange({
      floors: newFloors,
      totalBuiltUpAreaSqM: totalBuiltUp,
      totalFloorAreaSqM: totalFloor,
      totalCarpetAreaSqM: totalCarpet,
    });
  };

  const coveragePercent = data.plotAreaSqM > 0 ? (data.groundCoverageSqM / data.plotAreaSqM) * 100 : 0;
  const far = data.plotAreaSqM > 0 ? data.totalFloorAreaSqM / data.plotAreaSqM : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Step 3 of 5
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isMl ? 'കെ.എം.ബി.ആർ / കെ.പി.ബി.ആർ ചട്ട അളവുകൾ' : 'Engineering Area Statement & Parameter Entry'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {isMl ? 'പ്ലോട്ട്, ബിൽഡിംഗ് അളവുകളും സെറ്റ്ബാക്കുകളും' : 'Plot, Building Dimensions & Setback Provisions'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isMl
                ? 'പ്ലോട്ട് വിസ്തീർണ്ണം, റോഡ് വീതി, നിർദ്ദിഷ്ട സെറ്റ്ബാക്കുകൾ, പാർക്കിംഗ്, കിണർ അകലം, മഴവെള്ള സംഭരണി എന്നിവ നൽകുക.'
                : 'Enter plot area, road frontage, proposed setbacks, parking bays, well clearances, and RWH parameters.'}
            </p>
          </div>

          {/* Quick Real-time Metric Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <div className="text-slate-500 text-[11px]">{isMl ? 'കവറേജ്:' : 'Coverage:'}</div>
              <div className={`font-bold text-sm ${coveragePercent > 65 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {coveragePercent.toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <div className="text-slate-500 text-[11px]">FAR:</div>
              <div className="font-bold text-sm text-slate-900">{far.toFixed(3)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Plot & Road Frontage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '1. പ്ലോട്ട് വിസ്തീർണ്ണവും വഴിവീതിയും' : '1. Plot Area & Road Access'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'പ്ലോട്ട് വിസ്തീർണ്ണം (ച.മീറ്റർ / m²):' : 'Plot Area (Sq.m):'}
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={data.plotAreaSqM}
                onChange={(e) => handlePlotSqMChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'സെന്റിൽ (Cents):' : 'In Cents (Auto-calculated):'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={data.plotAreaCents}
                onChange={(e) => handlePlotCentsChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'പ്രധാന വഴി വീതി (Road Width in m):' : 'Access Road Width (m):'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={data.roadAccessWidthM}
                onChange={(e) => onChange({ roadAccessWidthM: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Rule 22: Min clear motorable access
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'പ്ലോട്ട് മുൻവശ വീതി (Plot Width in m):' : 'Plot Frontage Width (m):'}
              </label>
              <input
                type="number"
                step="0.1"
                value={data.plotWidthM}
                onChange={(e) => onChange({ plotWidthM: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Setbacks Provided */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '2. നൽകിയിരിക്കുന്ന സെറ്റ്ബാക്കുകൾ (Setbacks in Meters)' : '2. Proposed Open Space Setbacks (Meters)'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'മുൻവശം (Front Setback):' : 'Front Setback (FOS):'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={data.frontSetbackM}
                  onChange={(e) => onChange({ frontSetbackM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-slate-500 font-medium">m</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">From street boundary</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'പിൻവശം (Rear Setback):' : 'Rear Setback (ROS):'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={data.rearSetbackM}
                  onChange={(e) => onChange({ rearSetbackM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-slate-500 font-medium">m</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">To rear plot boundary</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'ഇടതുവശം (Side 1 Setback):' : 'Side Setback 1 (Left):'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={data.sideSetback1M}
                  onChange={(e) => onChange({ sideSetback1M: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-slate-500 font-medium">m</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'വലതുവശം (Side 2 Setback):' : 'Side Setback 2 (Right):'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={data.sideSetback2M}
                  onChange={(e) => onChange({ sideSetback2M: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-slate-500 font-medium">m</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'ബാൽക്കണി തള്ളിനിൽക്കൽ (Balcony Cantilever):' : 'Balcony Projection (m):'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={data.balconyProjectionM || 0}
                  onChange={(e) => onChange({ balconyProjectionM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-slate-500 font-medium">m</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Max 1.20m into setback</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'സൺഷെയ്ഡ് / കാനോപി (Canopy):' : 'Canopy / Sunshade (m):'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={data.canopyProjectionM || 0.6}
                  onChange={(e) => onChange({ canopyProjectionM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-slate-500 font-medium">m</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Min 1.0m clear to boundary</span>
            </div>
          </div>
        </div>

        {/* Section 3: Building Height & Ground Coverage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '3. കെട്ടിട ഉയരവും ഗ്രൗണ്ട് കവറേജും' : '3. Building Height & Footprint'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'ആകെ ഉയരം (Total Height in m):' : 'Total Building Height (m):'}
              </label>
              <input
                type="number"
                step="0.1"
                min="2.5"
                value={data.buildingHeightM}
                onChange={(e) => onChange({ buildingHeightM: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {data.buildingHeightM > 16 ? '⚠️ High Rise Building (>16m)' : 'Standard Building (<=16m)'}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'ഗ്രൗണ്ട് കവറേജ് (Ground Footprint m²):' : 'Ground Coverage (sq.m):'}
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={data.groundCoverageSqM}
                onChange={(e) => onChange({ groundCoverageSqM: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {coveragePercent.toFixed(1)}% of Plot Area
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Parking Provisions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Car className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '4. പാർക്കിംഗ് സൗകര്യങ്ങൾ (Rule 31)' : '4. Parking Bays Provided'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'കാർ പാർക്കിംഗ്:' : 'Cars:'}</label>
              <input
                type="number"
                min="0"
                value={data.carParkingProvided}
                onChange={(e) => onChange({ carParkingProvided: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'ബൈക്ക്/സ്കൂട്ടർ:' : 'Bikes:'}</label>
              <input
                type="number"
                min="0"
                value={data.twoWheelerParkingProvided}
                onChange={(e) => onChange({ twoWheelerParkingProvided: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'ഭിന്നശേഷി:' : 'PwD Bay:'}</label>
              <input
                type="number"
                min="0"
                value={data.disabledParkingProvided}
                onChange={(e) => onChange({ disabledParkingProvided: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'ലോഡിംഗ് ബേ:' : 'Loading:'}</label>
              <input
                type="number"
                min="0"
                value={data.loadingBaysProvided}
                onChange={(e) => onChange({ loadingBaysProvided: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Sanitation, Open Well & Septic Tank Clearances */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Droplets className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '5. സാനിറ്റേഷൻ & കിണർ അകലം (Rule 47)' : '5. Sanitation & Open Well Clearances'}
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800">
                  {isMl ? 'പ്ലോട്ടിൽ കുടിവെള്ള കിണർ ഉണ്ടോ?' : 'Is there an Open Well in the Plot / Boundary?'}
                </span>
                <p className="text-[11px] text-slate-500">
                  Rule 47 requires min 7.5m clear distance to septic tank & soak pit
                </p>
              </div>
              <input
                type="checkbox"
                checked={data.openWellInPlot}
                onChange={(e) => onChange({ openWellInPlot: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>

            {data.openWellInPlot && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/60">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {isMl ? 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിൽ (m):' : 'Well to Septic Tank (m):'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.distanceWellToSepticTankM}
                    onChange={(e) => onChange({ distanceWellToSepticTankM: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-emerald-800">Min 7.50m required</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {isMl ? 'കിണറും സോക്ക് പിറ്റും തമ്മിൽ (m):' : 'Well to Soak Pit (m):'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.distanceWellToSoakPitM}
                    onChange={(e) => onChange({ distanceWellToSoakPitM: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-emerald-800">Min 7.50m required</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'സെപ്റ്റിക് ടാങ്കും പ്ലോട്ട് അതിർത്തിയും തമ്മിൽ (m):' : 'Septic Tank to Boundary Clearance (m):'}
              </label>
              <input
                type="number"
                step="0.05"
                value={data.distanceSepticTankToBoundaryM}
                onChange={(e) => onChange({ distanceSepticTankToBoundaryM: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Rule 47(2): Min 1.20m clearance</span>
            </div>
          </div>
        </div>

        {/* Section 6: Environmental, RWH & Solar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sun className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '6. മഴവെള്ള സംഭരണിയും സോളാർ പാനലും' : '6. Rainwater Harvesting & Solar Rooftop'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'മഴവെള്ള സംഭരണി അളവ് (Litres):' : 'RWH Tank Capacity (Litres):'}
              </label>
              <input
                type="number"
                step="500"
                value={data.rwhTankCapacityLiters}
                onChange={(e) => onChange({ rwhTankCapacityLiters: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Rule 48: 25 Litres per sq.m of roof plinth
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'സോളാർ റൂഫ്‌ടോപ്പ് കപ്പാസിറ്റി (kWp):' : 'Solar Rooftop PV (kWp):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={data.solarPvCapacityKwp}
                onChange={(e) => onChange({ solarPvCapacityKwp: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Rule 49: Mandatory for &gt;= 500 sq.m built-up
              </span>
            </div>
          </div>
        </div>

        {/* Section 7: Staircase, Egress & Accessibility */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '7. സ്റ്റെയർകേസ് & എക്സിറ്റ് അളവുകൾ' : '7. Staircase & Egress Dimensions'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'കോണി വീതി (m):' : 'Flight Width (m):'}</label>
              <input
                type="number"
                step="0.05"
                value={data.mainStaircaseWidthM}
                onChange={(e) => onChange({ mainStaircaseWidthM: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Min 1.0m (A1) / 1.5m (Pub)</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'റൈസർ (cm):' : 'Riser (cm):'}</label>
              <input
                type="number"
                step="0.5"
                value={data.staircaseRiserCm}
                onChange={(e) => onChange({ staircaseRiserCm: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Max 17.5cm / 15cm</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'ട്രെഡ്ഡ് (cm):' : 'Tread (cm):'}</label>
              <input
                type="number"
                step="0.5"
                value={data.staircaseTreadCm}
                onChange={(e) => onChange({ staircaseTreadCm: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Min 25cm / 30cm</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium mb-1">{isMl ? 'സ്റ്റെയർകേസ് എണ്ണം:' : 'Staircase Count:'}</label>
              <input
                type="number"
                min="1"
                value={data.staircaseCount || 1}
                onChange={(e) => onChange({ staircaseCount: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Dual required for Public/KER</span>
            </div>
          </div>
        </div>

        {/* Section 8: Specialized Educational Norms (Conditional for Group B) */}
        {data.occupancyGroup === 'B' && (
          <div className="bg-blue-50/40 rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b border-blue-200/60">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-950 text-sm sm:text-base">
                {isMl ? 'കേരള എഡ്യൂക്കേഷൻ റൂൾസ് (KER) സ്കൂൾ മാനദണ്ഡങ്ങൾ (Group B Norms)' : 'Kerala Education Rules (KER) School Structural Norms'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <label className="block text-slate-700 font-semibold mb-1">
                  {isMl ? 'ക്ലാസ്സ് മുറി വിസ്തീർണ്ണം (m²):' : 'Min Classroom Area (m²):'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.minClassroomAreaSqM || 36.0}
                  onChange={(e) => onChange({ minClassroomAreaSqM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
                />
                <span className="text-[10px] text-blue-800 font-medium">KER Chapter IV: Min 36.0 m² (6m × 6m)</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <label className="block text-slate-700 font-semibold mb-1">
                  {isMl ? 'ക്ലാസ്സ് മുറി ഉയരം (m):' : 'Classroom Ceiling Height (m):'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.minClassroomHeightM || 3.0}
                  onChange={(e) => onChange({ minClassroomHeightM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
                />
                <span className="text-[10px] text-blue-800 font-medium">KER Standard: Min 3.00m clear</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <label className="block text-slate-700 font-semibold mb-1">
                  {isMl ? 'കളിസ്ഥലം വിസ്തീർണ്ണം (m²):' : 'Playground Open Yard (m²):'}
                </label>
                <input
                  type="number"
                  step="50"
                  value={data.playgroundAreaSqM || 600}
                  onChange={(e) => onChange({ playgroundAreaSqM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
                />
                <span className="text-[10px] text-blue-800 font-medium">Min 5 sq.m per student</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 9: Fire Safety & High-Rise (Conditional) */}
        {(data.buildingHeightM > 16 || data.occupancyGroup === 'D' || data.occupancyGroup === 'F' || data.occupancyGroup === 'B' || data.occupancyGroup === 'C' || data.occupancyGroup === 'I') && (
          <div className="bg-rose-50/40 rounded-2xl border border-rose-200 p-5 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-200/60">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-rose-950 text-sm sm:text-base">
                {isMl ? 'ഫയർ സേഫ്റ്റി & എൻ.ബി.സി (NBC Part IV & Kerala Fire Services)' : 'Fire & Life Safety (NBC Part IV & Kerala Fire & Rescue)'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-white p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{isMl ? 'ഫയർ എൻ.ഒ.സി പ്ലാൻ സമർപ്പിച്ചോ?' : 'Fire NOC Scheme Attached?'}</span>
                  <p className="text-[10px] text-slate-500">Mandatory for &gt;16m / Assembly</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!data.hasFireNoc}
                  onChange={(e) => onChange({ hasFireNoc: e.target.checked })}
                  className="w-5 h-5 text-rose-600 rounded"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{isMl ? 'പുറം ഫയർ എസ്കേപ്പ് സ്റ്റെയർകേസ്?' : 'External Fire Escape Stair?'}</span>
                  <p className="text-[10px] text-slate-500">Direct discharge to ground</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!data.hasExternalFireEscapeStair}
                  onChange={(e) => onChange({ hasExternalFireEscapeStair: e.target.checked })}
                  className="w-5 h-5 text-rose-600 rounded"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-100">
                <label className="block text-slate-700 font-semibold mb-1">
                  {isMl ? 'ഫയർ എഞ്ചിൻ പാത (Fire Way in m):' : 'Fire Tender Way Width (m):'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.clearFirePassageWidthM}
                  onChange={(e) => onChange({ clearFirePassageWidthM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
                />
                <span className="text-[10px] text-rose-800 font-medium">Min 5.0m clear around high-rise</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floor-wise Area Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '7. നില തിരിച്ചുളള വിസ്തീർണ്ണ പട്ടിക (Floor-wise Area Statement)' : '7. Floor-wise Built-up & Carpet Area Statement'}
            </h3>
          </div>

          <button
            type="button"
            id="add-floor-btn"
            onClick={handleAddFloor}
            className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isMl ? '+ നില ചേർക്കുക' : '+ Add Floor'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Floor Level</th>
                <th className="p-2.5">Built-up Area (m²)</th>
                <th className="p-2.5">Carpet Area (m²)</th>
                <th className="p-2.5">Height from Ground (m)</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.floors.map((floor, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-medium">
                    <input
                      type="text"
                      value={floor.floorName}
                      onChange={(e) => handleFloorChange(idx, { floorName: e.target.value })}
                      className="bg-transparent border border-slate-200 rounded px-2 py-1 text-xs w-full max-w-[180px] focus:bg-white"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      step="0.1"
                      value={floor.builtUpArea}
                      onChange={(e) => handleFloorChange(idx, { builtUpArea: parseFloat(e.target.value) || 0 })}
                      className="bg-transparent border border-slate-200 rounded px-2 py-1 text-xs w-24 focus:bg-white font-semibold"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      step="0.1"
                      value={floor.carpetArea}
                      onChange={(e) => handleFloorChange(idx, { carpetArea: parseFloat(e.target.value) || 0 })}
                      className="bg-transparent border border-slate-200 rounded px-2 py-1 text-xs w-24 focus:bg-white"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      step="0.1"
                      value={floor.heightFromGround}
                      onChange={(e) => handleFloorChange(idx, { heightFromGround: parseFloat(e.target.value) || 0 })}
                      className="bg-transparent border border-slate-200 rounded px-2 py-1 text-xs w-20 focus:bg-white"
                    />
                  </td>
                  <td className="p-2.5 text-center">
                    {data.floors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFloor(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="p-2.5">Total</td>
                <td className="p-2.5 text-emerald-800">{data.totalBuiltUpAreaSqM.toFixed(2)} m²</td>
                <td className="p-2.5">{data.totalCarpetAreaSqM.toFixed(2)} m²</td>
                <td className="p-2.5" colSpan={2}>
                  {data.numberOfFloors} Floors
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          id="btn-prev-drawings"
          onClick={onPrev}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isMl ? 'മുമ്പത്തെ ഘട്ടം' : 'Back to Drawings'}</span>
        </button>

        <button
          type="button"
          id="btn-proceed-scrutiny"
          onClick={onNext}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 text-xs sm:text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isMl ? 'പൂർണ്ണ ചട്ട പരിശോധന നടത്തുക' : 'Run Full Rule Scrutiny Engine'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
