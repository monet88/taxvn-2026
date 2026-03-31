// Módulo principal — exportación completa (fuente de verdad para tipos/constantes)
export * from './taxCalculator';

// Conversión GROSS↔NET — exportación completa (sin conflictos con taxCalculator)
export * from './grossNetCalculator';

// Los calculadores de dominio no se re-exportan con export * porque muchos
// definen helpers como formatCurrency, formatPercent, generateId, etc. que
// colisionan entre sí. Los consumidores deben importar directamente:
//   import { calculateBonus } from '@taxvn/tax-core/bonusCalculator'
// o usar el default import del módulo específico.
//
// Aquí re-exportamos solo los tipos/funciones principales para casos comunes:

export type {
  GrossNetInput,
  GrossNetResult,
} from './grossNetCalculator';
