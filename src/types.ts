export type JurisdictionType = 'KMBR' | 'KPBR'; // KMBR: Municipality/Corp, KPBR: Grama Panchayat

export type Language = 'ml' | 'en';

export type OccupancyGroup = 
  | 'A1' // Residential Single/Multi/Apartments
  | 'A2' // Special Residential / Hostel / Lodging
  | 'B'  // Educational
  | 'C'  // Medical / Hospital
  | 'D'  // Assembly / Community Hall
  | 'E'  // Office / Business
  | 'F'  // Mercantile / Commercial / Shopping Mall
  | 'G1' // Industrial (Low Hazard)
  | 'G2' // Industrial (Moderate Hazard)
  | 'H'  // Storage / Warehouse
  | 'I'; // Hazardous

export type PlotType = 'normal' | 'small_plot' | 'crz' | 'heritage' | 'industrial_zone';

export type DrawingCategory = 
  | 'location_plan'
  | 'site_plan'
  | 'floor_plans'
  | 'elevation_plans'
  | 'section_plans'
  | 'service_plans'
  | 'parking_plans'
  | 'rwh_solar_plans';

export interface UploadedDrawing {
  id: string;
  category: DrawingCategory;
  name: string;
  size: number;
  dataUrl?: string;
  previewUrl?: string;
  status: 'pending' | 'verified' | 'flagged';
  scale: string; // e.g. "1:100", "1:200", "1:400"
  sheetsCount: number;
  extractedLabels: string[];
  remarks?: string;
  uploadedAt: number;
}

export interface FloorAreaDetail {
  floorName: string; // e.g. "Ground Floor", "First Floor", "Terrace"
  builtUpArea: number; // in sq.m
  carpetArea: number; // in sq.m
  occupancy: OccupancyGroup;
  heightFromGround: number; // in m
}

export interface AreaStatementData {
  // Project & Authority Identification
  projectName: string;
  applicantName: string;
  architectEngineerName: string;
  licenseNumber: string;
  localBodyName: string;
  wardNumber: string;
  surveyNumber: string;
  villageName: string;
  talukName: string;
  district: string;
  jurisdiction: JurisdictionType;
  occupancyGroup: OccupancyGroup;
  plotType: PlotType;

  // Plot Parameters
  plotAreaSqM: number;
  plotAreaCents: number;
  plotWidthM: number;
  plotDepthM: number;
  roadAccessWidthM: number; // in meters (frontage road)
  secondaryRoadWidthM?: number;

  // Building General
  buildingHeightM: number; // total height from ground
  numberOfFloors: number;
  groundCoverageSqM: number;
  totalBuiltUpAreaSqM: number;
  totalFloorAreaSqM: number;
  totalCarpetAreaSqM: number;
  floors: FloorAreaDetail[];

  // Setbacks Provided (in meters)
  frontSetbackM: number;
  rearSetbackM: number;
  sideSetback1M: number; // Left / Side 1
  sideSetback2M: number; // Right / Side 2
  avgFrontSetbackM?: number;
  avgRearSetbackM?: number;
  canopyProjectionM?: number;
  balconyProjectionM?: number;

  // Parking Provisions
  carParkingProvided: number;
  twoWheelerParkingProvided: number;
  disabledParkingProvided: number;
  loadingBaysProvided: number;
  parkingBayWidthM: number;
  parkingBayLengthM: number;
  drivewayWidthM: number;

  // Sanitation, Well & Services
  openWellInPlot: boolean;
  distanceWellToSepticTankM: number;
  distanceWellToSoakPitM: number;
  distanceSepticTankToBoundaryM: number;
  rwhTankCapacityLiters: number;
  solarPvCapacityKwp: number;
  solidWasteUnitProvided: boolean;
  biogasPlantOrCompostProvided: boolean;

  // Architectural Standards & Safety
  mainStaircaseWidthM: number;
  staircaseTreadCm: number;
  staircaseRiserCm: number;
  staircaseHeadroomM: number;
  minHabitableRoomAreaSqM: number;
  minHabitableRoomWidthM: number;
  minHabitableRoomHeightM: number;
  minKitchenAreaSqM: number;
  minKitchenWidthM: number;
  ventilationRatioPercent: number; // % of floor area
  clearFirePassageWidthM: number;
  hasLift: boolean;
  hasRampForDisabled: boolean;
  rampSlopeRatio: number; // e.g. 10 for 1:10
}

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'exempt';
export type CheckSeverity = 'critical' | 'high' | 'medium' | 'info';

export interface ScrutinyCheckResult {
  id: string;
  category: 
    | 'drawings'
    | 'access_road'
    | 'coverage_far'
    | 'setbacks'
    | 'height_limits'
    | 'parking'
    | 'sanitation_rwh'
    | 'architecture'
    | 'fire_safety';
  ruleNoKmbr: string;
  ruleNoKpbr: string;
  titleEn: string;
  titleMl: string;
  requirementEn: string;
  requirementMl: string;
  providedValue: string;
  requiredValue: string;
  status: CheckStatus;
  severity: CheckSeverity;
  technicalNoteEn: string;
  technicalNoteMl: string;
  rectificationAdviceEn?: string;
  rectificationAdviceMl?: string;
}

export interface ScrutinyReportSummary {
  totalChecks: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  exemptCount: number;
  overallStatus: 'APPROVED' | 'REJECTED_DEFECTIVE' | 'CONDITIONAL_APPROVAL';
  maxPermissibleCoveragePercent: number;
  providedCoveragePercent: number;
  permissibleFarWithoutFee: number;
  maxPermissibleFarWithFee: number;
  providedFar: number;
  requiredCarParking: number;
  requiredTwoWheelerParking: number;
  requiredRwhCapacityLiters: number;
  requiredSolarKwp: number;
  scrutinyTimestamp: number;
  scrutinyReferenceId: string;
}

export interface RuleAmendmentRecord {
  id: string;
  orderNumber: string;
  notificationDate: string;
  titleEn: string;
  titleMl: string;
  affectedRules: string[];
  summaryEn: string;
  summaryMl: string;
  sourceUrl?: string;
}
