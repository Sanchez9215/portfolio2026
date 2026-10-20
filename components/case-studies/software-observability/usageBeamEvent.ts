// The Success section's squares drive a beam that the Framework Adaptation
// eye (satelliteA) draws on its own layer — nothing is drawn for it in the
// Success section itself. Because the squares' timeline can run backwards when
// you scroll up, the eye draws whatever progress it is told (0 → 1).

// Reveal asks the eye where its pupil is (viewport px): `respond` is called back.
export const USAGE_BEAM_EYE_EVENT = "usage-beam-eye";
export type UsageBeamEyeDetail = {
  respond: (eye: { x: number; y: number }) => void;
};

// Reveal tells the eye how far out the beam is (0 = nothing, 1 = fully out).
export const USAGE_BEAM_PROGRESS_EVENT = "usage-beam-progress";
export type UsageBeamProgressDetail = {
  progress: number;
  // Viewport coordinates of the point to aim at (the square's centre).
  clientX: number;
  clientY: number;
  // Radius of the beam's base circle: half the square's diagonal, so the base
  // completely covers the square.
  coverRadius: number;
};
