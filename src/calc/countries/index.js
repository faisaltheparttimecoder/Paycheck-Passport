/**
 * Country Tax Modules Index
 * Exports all Tier-1 country calculators (30 countries)
 */

import { calculateUK } from './gb.js';
import { calculateUS } from './us.js';
import { calculateDE } from './de.js';
import { calculateFR } from './fr.js';
import { calculateAU } from './au.js';
import { calculateSG } from './sg.js';
import { calculateAE } from './ae.js';
import { calculateCA } from './ca.js';
import { calculateIE } from './ie.js';
import { calculateNL } from './nl.js';
import { calculateES } from './es.js';
import { calculateIT } from './it.js';
import { calculatePT } from './pt.js';
import { calculateBE } from './be.js';
import { calculateAT } from './at.js';
import { calculateCH } from './ch.js';
import { calculateSE } from './se.js';
import { calculateNO } from './no.js';
import { calculateDK } from './dk.js';
import { calculateFI } from './fi.js';
import { calculatePL } from './pl.js';
import { calculateCZ } from './cz.js';
import { calculateNZ } from './nz.js';
import { calculateHK } from './hk.js';
import { calculateJP } from './jp.js';
import { calculateSA } from './sa.js';
import { calculateIN } from './in.js';
import { calculateBR } from './br.js';
import { calculateMX } from './mx.js';
import { calculateZA } from './za.js';

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
    ES: calculateES,
    IT: calculateIT,
    PT: calculatePT,
    BE: calculateBE,
    AT: calculateAT,
    CH: calculateCH,
    SE: calculateSE,
    NO: calculateNO,
    DK: calculateDK,
    FI: calculateFI,
    PL: calculatePL,
    CZ: calculateCZ,
    NZ: calculateNZ,
    HK: calculateHK,
    JP: calculateJP,
    SA: calculateSA,
    IN: calculateIN,
    BR: calculateBR,
    MX: calculateMX,
    ZA: calculateZA,
};

// Default export for country data
export { default as GB } from './gb.js';
export { default as US } from './us.js';
export { default as DE } from './de.js';
export { default as FR } from './fr.js';
export { default as AU } from './au.js';
export { default as SG } from './sg.js';
export { default as AE } from './ae.js';
export { default as CA } from './ca.js';
export { default as IE } from './ie.js';
export { default as NL } from './nl.js';
export { default as ES } from './es.js';
export { default as IT } from './it.js';
export { default as PT } from './pt.js';
export { default as BE } from './be.js';
export { default as AT } from './at.js';
export { default as CH } from './ch.js';
export { default as SE } from './se.js';
export { default as NO } from './no.js';
export { default as DK } from './dk.js';
export { default as FI } from './fi.js';
export { default as PL } from './pl.js';
export { default as CZ } from './cz.js';
export { default as NZ } from './nz.js';
export { default as HK } from './hk.js';
export { default as JP } from './jp.js';
export { default as SA } from './sa.js';
export { default as IN } from './in.js';
export { default as BR } from './br.js';
export { default as MX } from './mx.js';
export { default as ZA } from './za.js';
