/**
 * Country Tax Modules Index
 * Exports all Tier-1 country calculators
 */

import { calculateUK } from "./gb.js";
import { calculateUS } from "./us.js";
import { calculateDE } from "./de.js";
import { calculateFR } from "./fr.js";
import { calculateAU } from "./au.js";
import { calculateSG } from "./sg.js";
import { calculateAE } from "./ae.js";
import { calculateCA } from "./ca.js";
import { calculateIE } from "./ie.js";
import { calculateNL } from "./nl.js";

// Map of ISO codes to custom calculator functions
export const calculators = {
  GB: calculateUK,
  US: calculateUS,
  DE: calculateDE,
  FR: calculateFR,
  AU: calculateAU,
  SG: calculateSG,
  AE: calculateAE,
  CA: calculateCA,
  IE: calculateIE,
  NL: calculateNL,
};

// Default export for country data
export { default as GB } from "./gb.js";
export { default as US } from "./us.js";
export { default as DE } from "./de.js";
export { default as FR } from "./fr.js";
export { default as AU } from "./au.js";
export { default as SG } from "./sg.js";
export { default as AE } from "./ae.js";
export { default as CA } from "./ca.js";
export { default as IE } from "./ie.js";
export { default as NL } from "./nl.js";
