const VIETNAMESE_CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN');

export function sanitizeNumericInput(value: string): string {
  return value.replace(/[^\d]/g, '');
}

export function formatCurrencyInput(value: string): string {
  if (!value) {
    return '';
  }

  return `${VIETNAMESE_CURRENCY_FORMATTER.format(Number(value))} đ`;
}
