// Physics constants and formulas for Project ARES

export const GRAVITY = 9.81; // m/s^2

// Level 1: Material Properties and Arm Physics
// Based on realistic material data and cantilever beam mechanics

// Fixed geometry for Level 1 (tuned for gameplay balance)
const ARM_GEOMETRY = {
  LENGTH: 0.5,        // m (500 mm)
  WIDTH: 0.03,        // m (30 mm)
  HEIGHT: 0.025,      // m (25 mm)
  VOLUME_CM3: 250,    // cm³ (tuned for balance: Aluminum should be viable)
  // Moment of Inertia for rectangular cross-section: I = b*h³/12
  // I = 0.03 * 0.025³ / 12 = 3.90625e-8 m⁴
  INERTIA: 3.90625e-8 // m⁴
};

// Requirements from game design
const REQUIREMENTS = {
  MAX_ARM_MASS: 1000,   // g
  MAX_DEFLECTION: 2.0,  // mm
  LOAD: 5              // kg
};

// Realistic material database for Level 1
export const MATERIALS = {
  wood: {
    name: 'Spezial-Industrieholz (gehärtet)',
    density: 0.75,   // g/cm³
    stiffness: 12,   // GPa
    color: '#8B4513',
    description: 'Behandeltes Hartholz. Leicht, aber geringe Steifigkeit.',
    cost: 10
  },
  abs: {
    name: 'ABS Plastik',
    density: 1.04,   // g/cm³
    stiffness: 2.3,  // GPa
    color: '#FFE4B5',
    description: '3D-Druck Material. Sehr flexibel, nicht für Struktur geeignet.',
    cost: 5
  },
  aluminum: {
    name: 'Aluminium 6061-T6',
    density: 2.70,   // g/cm³
    stiffness: 69,   // GPa
    color: '#C0C0C0',
    description: 'Standard im Flugzeugbau. Gutes Gewichts-Steifigkeits-Verhältnis.',
    cost: 30
  },
  titan: {
    name: 'Titan Grade 5',
    density: 4.43,   // g/cm³
    stiffness: 114,  // GPa
    color: '#D3D3D3',
    description: 'Hochfeste Legierung. Schwer, aber extrem steif.',
    cost: 80
  },
  steel: {
    name: 'Stahl 4340',
    density: 7.85,   // g/cm³
    stiffness: 210,  // GPa
    color: '#708090',
    description: 'Industrie-Standard. Höchste Steifigkeit, aber sehr schwer.',
    cost: 20
  },
  carbon: {
    name: 'Carbon (CFK)',
    density: 1.60,   // g/cm³
    stiffness: 150,  // GPa
    color: '#1a1a1a',
    description: 'High-End Verbundwerkstoff. Leicht und steif, aber sehr teuer!',
    cost: 100
  }
};

/**
 * Calculate arm physics based on material properties
 * @param densityGPerCm3 - Material density in g/cm³
 * @param stiffnessGPa - Young's modulus in GPa
 * @returns Physics calculation results
 */
export function calculateArmPhysics(densityGPerCm3: number, stiffnessGPa: number) {
  // A. Calculate arm mass
  const armMassG = ARM_GEOMETRY.VOLUME_CM3 * densityGPerCm3;

  // B. Calculate deflection using cantilever beam formula
  // δ = (F * L³) / (3 * E * I)
  const force = REQUIREMENTS.LOAD * GRAVITY; // Convert kg to N
  const stiffnessPa = stiffnessGPa * 1e9;    // Convert GPa to Pa

  const deflectionM = (force * Math.pow(ARM_GEOMETRY.LENGTH, 3)) /
                      (3 * stiffnessPa * ARM_GEOMETRY.INERTIA);
  const deflectionMM = deflectionM * 1000;

  // C. Check against requirements
  const isSafeMass = armMassG <= REQUIREMENTS.MAX_ARM_MASS;
  const isSafeDeflection = deflectionMM <= REQUIREMENTS.MAX_DEFLECTION;

  return {
    mass: armMassG,
    deflection: deflectionMM,
    isSafeMass,
    isSafeDeflection,
    isSuccess: isSafeMass && isSafeDeflection
  };
}

// Legacy function for backward compatibility
export function calculateBeamDeflection(loadKg: number, stiffness: number, length: number = 1): number {
  const force = loadKg * GRAVITY;
  const deflection = (force * Math.pow(length, 3)) / (3 * stiffness);
  return deflection * 1000;
}

// Level 2: Transmission
// Torque = Power / AngularVelocity (roughly)
// OutTorque = InTorque * Ratio
// OutRPM = InRPM / Ratio
export function calculateTransmission(motorTorque: number, motorRPM: number, ratio: number) {
  return {
    outputTorque: motorTorque * ratio,
    outputRPM: motorRPM / ratio,
  };
}

// Level 3: Electronics (Battery Voltage Drop)
// V_terminal = V_emf - I * R_internal
export function calculateVoltageDrop(loadCurrent: number, internalResistance: number, baseVoltage: number = 12): number {
  return Math.max(0, baseVoltage - (loadCurrent * internalResistance));
}
