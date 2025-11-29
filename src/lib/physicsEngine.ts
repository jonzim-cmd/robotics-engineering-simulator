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

// ============================================
// LEVEL 4: ELEKTRONIK & SPANNUNGSVERSORGUNG
// ============================================

/**
 * Elektronik-Komponenten für Level 4
 */
export const ELECTRONIC_COMPONENTS = {
  batteries: {
    standard: {
      id: 'standard' as const,
      name: 'Standard-Akku',
      cost: 10,
      voltage: 12 as number, // Volt (Nennspannung)
      internalResistance: 1.0, // Ohm - Erhöht, damit 8.5A * 1.0 Ohm = 8.5V Drop -> 3.5V Restspannung (Brownout)
      description: 'Günstig, aber hoher Innenwiderstand. Bei hohem Strombedarf bricht die Spannung ein.',
      icon: '🔋'
    },
    standard_grey: {
      id: 'standard_grey' as const,
      name: 'Standard-Akku',
      cost: 7,
      voltage: 12 as number,
      internalResistance: 1.8, // Unklare Qualität, bricht noch stärker ein
      description: 'Hoher Innenwiderstand. Bei hohem Strombedarf bricht die Spannung ein. Herkunft unklar.',
      icon: '🔋'
    },
    performance: {
      id: 'performance' as const,
      name: 'Performance-Akku',
      cost: 120, // WICHTIG: Über 50 Credits, damit Harald eingreifen muss
      voltage: 12 as number,
      internalResistance: 0.2, // Ohm
      description: 'Premium-Qualität mit niedrigem Innenwiderstand. Stabile Spannung auch unter allen Bedingungen.',
      icon: '⚡'
    }
  },
  capacitors: {
    none: {
      id: 'none' as const,
      name: 'Kein Kondensator',
      cost: 0,
      capacitance: 0, // Farad
      description: 'Die CPU (Steuereinheit) ist direkt von der Batteriespannung abhängig.',
      icon: '📈'
    },
    small: {
      id: 'small' as const,
      name: 'Stützkondensator',
      cost: 15,
      capacitance: 0.14, // 140mF - genug, um Standard-Akku-Anlauf zu stützen
      description: 'Speichert Energie und gibt sie bei kurzen Spannungseinbrüchen ab.',
      icon: '⚡'
    },
    large: {
      id: 'large' as const,
      name: 'Pufferkondensator (groß)',
      cost: 35,
      capacitance: 0.2, // 200mF
      description: 'Großer Energiespeicher für längere Überbrückung.',
      icon: '🔌'
    }
  }
};

// Typen ableiten
export type BatteryType = keyof typeof ELECTRONIC_COMPONENTS.batteries;
export type CapacitorType = keyof typeof ELECTRONIC_COMPONENTS.capacitors;

/**
 * Systemkonstanten für die Simulation
 */
export const ELECTRONICS_CONSTANTS = {
  CPU_MIN_VOLTAGE: 5.0, // Volt - unter diesem Wert: Brownout/Reset
  MOTOR_RUNNING_CURRENT: 2.0, // Ampere - Normalbetrieb
  MOTOR_INRUSH_CURRENT: 8.5, // Ampere - Anlaufstrom (reduziert, aber kritisch)
  INRUSH_DURATION_MS: 50, // Millisekunden - Dauer des Anlaufstroms
  SIMULATION_DURATION_MS: 200, // Millisekunden - Gesamte Simulationsdauer
  SIMULATION_STEPS: 300, // Anzahl der Datenpunkte - erhöht für weichere Zeitlupe
};

/**
 * Ergebnis eines einzelnen Simulationsschritts
 */
export interface ElectronicsDataPoint {
  time: number; // ms
  batteryVoltage: number; // V (nach Innenwiderstand)
  cpuVoltage: number; // V (nach Kondensator-Pufferung)
  motorCurrent: number; // A
  capacitorCharge: number; // 0-1 (relativ)
}

/**
 * Gesamtergebnis der Elektronik-Simulation
 */
export interface ElectronicsSimulationResult {
  dataPoints: ElectronicsDataPoint[];
  minCpuVoltage: number;
  maxMotorCurrent: number;
  brownoutOccurred: boolean;
  brownoutTime: number | null; // ms - wann der Brownout auftrat
  testResult: 'SUCCESS' | 'BROWNOUT';
  resultMessage: string;
  customResultHeader?: string; // Added for custom display headings
}

/**
 * Berechnet den Spannungsverlauf bei Motorstart
 *
 * Physik-Modell (vereinfacht aber korrekt):
 * 1. U_batterie_real = U_nenn - (I * R_innen)
 * 2. Kondensator puffert kurze Einbrüche
 * 3. CPU braucht mindestens 5V
 */
export function calculateElectronicsSimulation(
  batteryType: BatteryType,
  capacitorType: CapacitorType
): ElectronicsSimulationResult {
  const battery = ELECTRONIC_COMPONENTS.batteries[batteryType];
  const capacitor = ELECTRONIC_COMPONENTS.capacitors[capacitorType];
  const C = ELECTRONICS_CONSTANTS;

  const dataPoints: ElectronicsDataPoint[] = [];
  let minCpuVoltage = battery.voltage;
  let maxMotorCurrent = 0;
  let brownoutOccurred = false;
  let brownoutTime: number | null = null;

  // Kondensator-Ladezustand (startet voll geladen)
  let capacitorCharge = 1.0;

  // Zeitschritt
  const dt = C.SIMULATION_DURATION_MS / C.SIMULATION_STEPS;

    for (let step = 0; step <= C.SIMULATION_STEPS; step++) {
      const time = step * dt;
      const progress = step / C.SIMULATION_STEPS; // 0.0 bis 1.0
  
      // 1. Motorstrom bestimmen (Trapez-Profil für bessere Visualisierung)
      // Wir wollen, dass der hohe Strom (und damit der Spannungsabfall)
      // lange genug "stehen bleibt", damit man ihn sehen kann.
      let motorCurrent: number;
      
          if (progress < 0.1) {
            // Phase 1: Rasanter Anstieg von 0 (Start) auf Anlaufstrom
            const rampUp = progress / 0.1;
            motorCurrent = 0 + (C.MOTOR_INRUSH_CURRENT - 0) * rampUp;
          } else if (progress < 0.7) {
            // Phase 2: PLATEAU (10-70%) - Hier halten wir den "Fehlerzustand" fest
            motorCurrent = C.MOTOR_INRUSH_CURRENT;
          } else {
            // Phase 3: Abklingen auf Normalwert (70-100%)
            const rampDown = (progress - 0.7) / 0.3; // 0.0 bis 1.0
            // Smoothstep für weicheres Ausklingen
            const smooth = rampDown * rampDown * (3 - 2 * rampDown);
            motorCurrent = C.MOTOR_INRUSH_CURRENT - (C.MOTOR_INRUSH_CURRENT - C.MOTOR_RUNNING_CURRENT) * smooth;
          }    // 2. Batteriespannung nach Innenwiderstand (Ohmsches Gesetz)
    // U_real = U_nenn - I * R_innen
    const batteryVoltage = battery.voltage - (motorCurrent * battery.internalResistance);

    // 3. CPU-Spannung mit Kondensator-Pufferung
    let cpuVoltage: number;

    if (capacitor.capacitance === 0) {
      // Ohne Kondensator: CPU bekommt direkt die Batteriespannung
      cpuVoltage = batteryVoltage;
    } else {
      // Mit Kondensator: Pufferung bei Spannungseinbruch
      // Vereinfachtes Modell: Kondensator gleicht Differenz aus

      const targetVoltage = Math.max(batteryVoltage, C.CPU_MIN_VOLTAGE + 0.5);

      if (batteryVoltage < targetVoltage && capacitorCharge > 0) {
        // Kondensator gibt Energie ab
        const voltageDiff = targetVoltage - batteryVoltage;
        const energyNeeded = voltageDiff * 0.05; // Energie-Faktor reduziert für realistische Entladung
        const energyAvailable = capacitorCharge * capacitor.capacitance * 10;

        if (energyAvailable >= energyNeeded) {
          cpuVoltage = targetVoltage;
          capacitorCharge -= (energyNeeded / (capacitor.capacitance * 10)) * (dt / 10);
          capacitorCharge = Math.max(0, capacitorCharge);
        } else {
          // Kondensator leer, Spannung fällt
          cpuVoltage = batteryVoltage + (energyAvailable / 0.1);
          capacitorCharge = 0;
        }
      } else {
        // Batteriespannung OK oder Kondensator leer
        cpuVoltage = batteryVoltage;

        // Kondensator lädt sich wieder auf wenn Spannung OK
        if (batteryVoltage > C.CPU_MIN_VOLTAGE + 1) {
          capacitorCharge = Math.min(1, capacitorCharge + 0.05);
        }
      }
    }

    // 4. Tracking
    minCpuVoltage = Math.min(minCpuVoltage, cpuVoltage);
    maxMotorCurrent = Math.max(maxMotorCurrent, motorCurrent);

    if (cpuVoltage < C.CPU_MIN_VOLTAGE && !brownoutOccurred) {
      brownoutOccurred = true;
      brownoutTime = time;
    }

    // 5. Datenpunkt speichern
    dataPoints.push({
      time,
      batteryVoltage: Math.max(0, batteryVoltage),
      cpuVoltage: Math.max(0, cpuVoltage),
      motorCurrent,
      capacitorCharge
    });
  }

  // Ergebnis bestimmen (Basis)
  const baseTestResult: 'SUCCESS' | 'BROWNOUT' = brownoutOccurred ? 'BROWNOUT' : 'SUCCESS';

  let resultMessage: string;
  if (brownoutOccurred) {
    resultMessage = `SYSTEM FAILURE: CPU-Spannung fiel auf ${minCpuVoltage.toFixed(1)}V (Minimum: ${C.CPU_MIN_VOLTAGE}V). Neustart ausgelöst bei t=${brownoutTime?.toFixed(0)}ms.`;
  } else {
    resultMessage = `SYSTEM STABLE: CPU-Spannung blieb stabil bei mindestens ${minCpuVoltage.toFixed(1)}V. Motorstart erfolgreich.`;
  }

  const isPerfectCombo = batteryType === 'standard' && capacitorType === 'small';
  const isGreyImport = batteryType === 'standard_grey';
  const isPerformance = batteryType === 'performance';
  const isNoCap = capacitorType === 'none';
  const isOverkillCap = capacitorType === 'large';

  // Basisergebnis
  const baseResult: ElectronicsSimulationResult = {
    dataPoints,
    minCpuVoltage,
    maxMotorCurrent,
    brownoutOccurred,
    brownoutTime,
    testResult: baseTestResult,
    resultMessage
  };

  if (isOverkillCap) {
    return {
      ...baseResult,
      brownoutOccurred: true, // Still a "fail" for the system
      testResult: 'BROWNOUT',
      resultMessage: 'Der Pufferkondensator ist unnötig groß. Er wird aus Designgründen nicht genehmigt. Diese Konfiguration ist deshalb nicht erlaubt.',
      customResultHeader: 'KONDENSATOR ÜBERDIMENSIONIERT'
    };
  }

  if (isPerformance) {
    return {
      ...baseResult,
      brownoutOccurred: false,
      testResult: 'SUCCESS',
      resultMessage: 'Technisch stabil. Spannungsversorgung gewährleistet aufgrund hoher Leistung des Akkus.'
    };
  }

  if (isNoCap) {
    return {
      ...baseResult,
      brownoutOccurred: true,
      testResult: 'BROWNOUT',
      resultMessage: 'Brownout (Spannungseinbruch) ausgelöst. Die CPU hatte kurz zu wenig Strom bekommen und musste neu starten.'
    };
  }

  if (isGreyImport) {
    return {
      ...baseResult,
      brownoutOccurred: true,
      testResult: 'BROWNOUT',
      resultMessage: 'Qualitative Mängel festgestellt. Akku kollabiert und erzeugt einen Spannungsabfall in der Spannungseinheit (CPU).'
    };
  }

  if (isPerfectCombo && !brownoutOccurred) {
    return {
      ...baseResult,
      brownoutOccurred: false,
      testResult: 'SUCCESS',
      resultMessage: 'Motorstart stabil: Standard-Akku + Stützkondensator halten die CPU-Spannung über 5V, kein kritischer Spannungsabfall.'
    };
  }

  return {
    ...baseResult,
    brownoutOccurred: true,
    testResult: 'BROWNOUT',
    resultMessage: 'Qualitative Mängel festgestellt. Akku kollabiert und erzeugt einen Spannungsabfall in der Spannungseinheit (CPU).'
  };
}

/**
 * Berechnet die Gesamtkosten einer Konfiguration
 */
export function calculateElectronicsCost(
  batteryType: BatteryType,
  capacitorType: CapacitorType
): number {
  return ELECTRONIC_COMPONENTS.batteries[batteryType].cost +
         ELECTRONIC_COMPONENTS.capacitors[capacitorType].cost;
}
