// Cada módulo de datos se re-exporta individualmente porque varios definen
// helpers con nombres idénticos (formatCurrency). Los consumidores importan
// del módulo específico: import { X } from '@taxvn/tax-data/taxLawHistory'

// Re-exportación principal: taxLawHistory (fuente de verdad para formatCurrency)
export * from './taxLawHistory';

// Constantes de pensiones (sin conflictos)
export * from './pensionConstants';

// Módulos con conflictos de nombres — exportación de namespace
export * as taxTreatyData from './taxTreatyData';
export * as taxExemptionChecker from './taxExemptionChecker';
export * as taxDeadlineManager from './taxDeadlineManager';
