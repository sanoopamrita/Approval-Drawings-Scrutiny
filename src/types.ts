export type JurisdictionType = 'KMBR' | 'KPBR'; // KMBR: Municipality/Corp, KPBR: Grama Panchayat

export type Language = 'ml' | 'en';

export type TabType = 
  | 'authority' 
  | 'drawings' 
  | 'areastatement' 
  | 'scrutiny' 
  | 'report' 
  | 'rulebook' 
  | 'chatbot'
  | 'admin';

export type BuildingFormData = AreaStatementData;

export const SUPER_ADMIN_EMAIL = 'sanoop.amrita@gmail.com';
export const SUPER_ADMIN_EMAILS = [
  'sanoop.amrita@gmail.com',
  'sanoopsadanandhan@gmail.com',
];

export type UserRole = 'super_admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  licenseNumber?: string;
  provider: 'google' | 'email' | 'guest';
  createdAt: number;
  lastLoginAt: number;
  isSuperAdmin: boolean;
}

export interface AccessLogMetadata {
  id: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  timestamp: number;
  sessionDurationSeconds: number;
  actionType: 
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'SCRUTINY_EXECUTED'
    | 'REPORT_DOWNLOADED'
    | 'AI_ADVISOR_CONSULTED'
    | 'RULE_CONFIG_UPDATED'
    | 'DRAWING_MEMORY_PURGED';
  jurisdiction: JurisdictionType;
  referenceId?: string;
  complianceStatus?: string;
  deviceInfo: string;
}

export interface SystemNoticeConfig {
  id: string;
  enabled: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  titleEn: string;
  titleMl: string;
  messageEn: string;
  messageMl: string;
  updatedAt: number;
  updatedBy: string;
}

export interface FeatureFlagConfig {
  enableAiVisionAnalysis: boolean;
  enableAutomaticSmallPlotRule60: boolean;
  enableStrictDrinkingWellClearance: boolean;
  enableRwhFormulaEnforcement: boolean;
  enableSolarRooftopMandate500SqM: boolean;
  enableRealTimeComparisonTable: boolean;
  enableGuestTrialMode: boolean;
  enforceZeroStorageStatelessProcessing: boolean;
}

export interface SystemConfig {
  systemPromptModifier: string;
  kbrVersionKmbr: string;
  kbrVersionKpbr: string;
  lastRulesUpdatedDate: string; // e.g. "30-08-2026"
  syncedKnowledgeSummary?: string;
  syncedItemsCount?: number;
  baseFarResidentialKmbr: number;
  baseFarResidentialKpbr: number;
  minDrinkingWellDistanceM: number;
  rwhLitersPerSqM: number;
  maxSmallPlotAreaSqM: number;
  notice: SystemNoticeConfig;
  features: FeatureFlagConfig;
  lastModifiedAt: number;
  lastModifiedBy: string;
}

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
  preparedByName: string; // Prepared by (Name)
  preparedByDesignation: string; // Prepared by (Designation)
  architectEngineerName?: string; // Optional backwards compatibility
  licenseNumber?: string; // Optional backwards compatibility
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
  staircaseCount?: number;
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

  // Specialized Educational Norms (Group B / KER - Kerala Education Rules)
  numberOfStudents?: number;
  playgroundAreaSqM?: number;
  minClassroomAreaSqM?: number;
  minClassroomHeightM?: number;
  numberOfClassrooms?: number;
  separateSanitationBoysGirls?: boolean;
  toiletSeatsBoys?: number;
  toiletSeatsGirls?: number;
  urinalsCount?: number;

  // Specialized Fire Safety (NBC Part IV & Kerala Fire & Rescue Services)
  hasFireNoc?: boolean;
  hasExternalFireEscapeStair?: boolean;
  travelDistanceToExitM?: number;
  refugeAreaProvided?: boolean;
  fireHydrantRiserProvided?: boolean;
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
