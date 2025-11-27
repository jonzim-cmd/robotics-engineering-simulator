export const MATERIALS = {
  steel: { 
    name: 'Stahl 4340', 
    density: 7.85, 
    stiffness: 210.0, 
    cost: 10,
    color: '#475569',
    description: 'Extrem belastbar, aber sehr schwer. Für massive Bauteile.'
  },
  titanium: { 
    name: 'Titan Grade 5', 
    density: 4.43, 
    stiffness: 114.0, 
    cost: 45,
    color: '#c084fc',
    description: 'Luxus-Material. Teuer, aber exzellente Eigenschaften.'
  },
  abs: { 
    name: 'ABS Kunststoff', 
    density: 1.04, 
    stiffness: 2.3, 
    cost: 5,
    color: '#facc15',
    description: 'Leicht und billig. Allerdings sehr flexibel.'
  },
  carbon: { 
    name: 'Carbon Fiber (CFK)', 
    density: 1.60, 
    stiffness: 150.0, 
    cost: 35,
    color: '#1e293b',
    description: 'High-Tech Verbundwerkstoff. Ultraleicht und steif.'
  },
  aluminum: { 
    name: 'Aluminium 6061-T6', 
    density: 2.70, // g/cm^3
    stiffness: 68.9, // GPa
    cost: 15, // Credits
    color: '#cbd5e1',
    description: 'Standard im Flugzeugbau. Gutes Verhältnis von Gewicht zu Festigkeit.'
  },
};

export interface SimulationResult {
  mass: number; // g
  deflection: number; // mm
  isSafeMass: boolean; // <= 1000g
  isSafeDeflection: boolean; // <= 2mm
  status: 'SUCCESS' | 'FAIL_MASS' | 'FAIL_DEFLECTION' | 'FAIL_BOTH';
}

/**
 * Calculates the physics for Level 1 (Cantilever Beam)
 * Fixed Geometry: 500mm length, equivalent to ~250cm^3 volume for the puzzle logic.
 */
export const calculateArmPhysics = (densityInput: number, stiffnessInputGPa: number): SimulationResult => {
  // 1. Mass Calculation
  // We assume a fixed volume that makes sense for the puzzle.
  const volumeCm3 = 250;
  const mass = densityInput * volumeCm3;

  // 2. Deflection Calculation
  // Constants
  const loadKg = 5;
  const F = loadKg * 9.81; // ~49.05 N
  const L = 0.5; // 500 mm = 0.5 m
  
  // Tuned constant I for desired gameplay balance
  const I = 1.41e-8; // Tuned constant

  const E = stiffnessInputGPa * 1e9; // GPa to Pa
  
  let deflectionMeters = 0;
  if (E > 0) {
    deflectionMeters = (F * Math.pow(L, 3)) / (3 * E * I);
  } else {
    deflectionMeters = 999; // Infinite deflection if stiffness is 0
  }
  
  const deflectionMm = deflectionMeters * 1000;

  // 3. Evaluation
  const isSafeMass = mass <= 1000;
  const isSafeDeflection = deflectionMm <= 2.0;

  let status: SimulationResult['status'] = 'SUCCESS';
  if (!isSafeMass && !isSafeDeflection) status = 'FAIL_BOTH';
  else if (!isSafeMass) status = 'FAIL_MASS';
  else if (!isSafeDeflection) status = 'FAIL_DEFLECTION';

  return {
    mass,
    deflection: deflectionMm,
    isSafeMass,
    isSafeDeflection,
    status
  };
};

export const calculateBeamDeflection = (load: number, stiffness: number): number => {
   const res = calculateArmPhysics(2.7, stiffness); 
   return (res.deflection / 5) * load; 
};

/**
 * Level 2: Transmission / Gear Ratios
 * outputRPM = inputRPM / ratio
 * outputTorque = inputTorque * ratio
 */
export const calculateTransmission = (inputTorque: number, inputRPM: number, gearRatio: number) => {
  // Simplified physics: P_out = P_in (ignoring efficiency loss for now)
  // Power = Torque * RPM (factor constant omitted)
  // If Ratio > 1 (Reduction): Torque UP, RPM DOWN
  const outputTorque = inputTorque * gearRatio;
  const outputRPM = inputRPM / gearRatio;

  return { outputTorque, outputRPM };
};

/**
 * Level 2: Advanced Transmission Physics for Tuning Simulation
 *
 * Physical Constants:
 * - Vehicle mass: 200 kg
 * - Gravity: 9.81 m/s²
 * - Ramp angle: 20°
 * - Wheel radius: 0.25 m
 * - Max motor torque: 50 Nm
 * - Max motor speed: 300 rad/s (~2865 RPM)
 */

// Physical constants
const VEHICLE_MASS = 200; // kg
const GRAVITY = 9.81; // m/s²
const RAMP_ANGLE_DEG = 20; // degrees
const RAMP_ANGLE_RAD = (RAMP_ANGLE_DEG * Math.PI) / 180;
const WHEEL_RADIUS = 0.25; // m

// The Puzzle Design ("Goldilocks Zone")
// Goal: Gear ratio must be between ~8.5 and ~14.0
// Goal: Motor speed must be > 70%

const MAX_MOTOR_TORQUE = 20; // Nm (Significantly reduced to force higher gear ratios)
const MAX_MOTOR_SPEED = 90; // rad/s (Reduced to force trade-off)

// Gear ratio range
export const GEAR_RATIO_MIN = 3.0; 
export const GEAR_RATIO_MAX = 20.0;

// Calculate required torque to climb the 20° ramp
const hangingForce = VEHICLE_MASS * GRAVITY * Math.sin(RAMP_ANGLE_RAD); // ~671 N
export const REQUIRED_TORQUE_AT_WHEEL = hangingForce * WHEEL_RADIUS; // ~167.7 Nm

// Reference speed for evaluation (Minimum acceptable speed)
export const MIN_SPEED_MS = 1.5; // m/s (~5.4 km/h)

export interface Level2SimulationParams {
  gearRatio: number; // Transmission ratio (3-20)
  motorSpeedFactor: number; // Motor speed factor (0-1)
}

export interface Level2SimulationResult {
  torqueAtWheel: number; // Nm
  wheelSpeed: number; // m/s
  torqueRatio: number; // Ratio of actual torque to required torque
  speedRatio: number; // Ratio of actual speed to minimum speed
  torqueLevel: string; 
  speedLevel: string;
  testResult: 'STALLED' | 'TIMEOUT' | 'SUCCESS';
  resultMessage: string;
}

/**
 * Maps a ratio value to a qualitative level
 * Used for both torque and speed displays
 */
function toQualitativeLevel(valueRatio: number): string {
  if (valueRatio < 0.4) return "sehr gering";
  if (valueRatio < 0.8) return "gering";
  if (valueRatio < 1.2) return "mittel";
  if (valueRatio < 1.6) return "hoch";
  return "sehr hoch";
}

/**
 * Calculate the physics and evaluate the test drive
 * @param gearRatio - Transmission ratio (GEAR_RATIO_MIN to GEAR_RATIO_MAX)
 * @param motorSpeedFactor - Motor speed as factor 0-1
 */
export const calculateLevel2Physics = (
  gearRatio: number,
  motorSpeedFactor: number
): Level2SimulationResult => {
  // 1. Calculate motor speed
  const motorSpeed = motorSpeedFactor * MAX_MOTOR_SPEED; // rad/s

  // 2. Motor torque (simplified: constant)
  const motorTorque = MAX_MOTOR_TORQUE; // Nm

  // 3. Calculate torque and speed at the wheel
  const torqueAtWheel = motorTorque * gearRatio; // M_rad = i * M_motor
  const wheelAngularSpeed = motorSpeed / gearRatio; // ω_rad = ω_motor / i
  const wheelSpeed = wheelAngularSpeed * WHEEL_RADIUS; // v = ω * r (in m/s)

  // 4. Calculate ratios against REQUIREMENTS
  const torqueRatio = torqueAtWheel / REQUIRED_TORQUE_AT_WHEEL;
  const speedRatio = wheelSpeed / MIN_SPEED_MS;

  // 5. Map to qualitative levels (for UI feedback)
  const torqueLevel = toQualitativeLevel(torqueRatio);
  const speedLevel = toQualitativeLevel(speedRatio);

  // 6. Evaluate test result (Strict Logic)
  let testResult: Level2SimulationResult['testResult'];
  let resultMessage: string;

  if (torqueAtWheel < REQUIRED_TORQUE_AT_WHEEL) {
    // FAIL: Not enough force to move up the slope
    testResult = 'STALLED';
    resultMessage = "ANTRIEB ÜBERLASTET. Der Rover bleibt stehen.";
  } else if (wheelSpeed < MIN_SPEED_MS) {
    // FAIL: Moving, but too slow for logistics requirements
    testResult = 'TIMEOUT';
    resultMessage = "TIMEOUT. Der Rover bewegt sich sehr langsam. Es kommt zu einem Stau";
  } else {
    // SUCCESS: Moving and fast enough
    testResult = 'SUCCESS';
    resultMessage = "OPTIMALER BETRIEB. Steigung in guter Geschwindigkeit bewältigt.";
  }

  return {
    torqueAtWheel,
    wheelSpeed,
    torqueRatio,
    speedRatio,
    torqueLevel,
    speedLevel,
    testResult,
    resultMessage
  };
};