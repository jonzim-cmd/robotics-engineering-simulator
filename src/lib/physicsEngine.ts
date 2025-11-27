// Physics constants and formulas for Project ARES

export const GRAVITY = 9.81; // m/s^2

// Level 1: Beam Bending (Cantilever)
// delta = (F * L^3) / (3 * E * I)
// Simplified for the game: Deflection = (Load * LengthFactor) / Stiffness
export function calculateBeamDeflection(loadKg: number, stiffness: number, length: number = 1): number {
  const force = loadKg * GRAVITY;
  // Arbitrary scaling factors for gameplay balance
  const deflection = (force * Math.pow(length, 3)) / (3 * stiffness); 
  return deflection * 1000; // Return in mm (scaled)
}

export const MATERIALS = {
  wood: { name: 'Holz', density: 0.6, stiffness: 10, color: '#A0522D' }, // Low stiffness
  aluminum: { name: 'Aluminium', density: 2.7, stiffness: 70, color: '#C0C0C0' }, // Med stiffness
  steel: { name: 'Stahl', density: 7.8, stiffness: 210, color: '#708090' }, // High stiffness
};

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
