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