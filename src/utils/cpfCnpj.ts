// Helper functions for Brazilian CPF and CNPJ generation and validation

export const CPF_STATES: Record<number, string> = {
  1: 'DF, GO, MS, MT, TO',
  2: 'AC, AM, AP, PA, RO, RR',
  3: 'CE, MA, PI',
  4: 'AL, PB, PE, RN',
  5: 'BA, SE',
  6: 'MG',
  7: 'ES, RJ',
  8: 'SP',
  9: 'PR, SC',
  0: 'RS',
};

export function formatCPF(cpfRaw: string): string {
  const digits = cpfRaw.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function generateCPF(formatted: boolean = true, stateDigit?: number): string {
  const randomDigit = () => Math.floor(Math.random() * 10);
  const n = Array.from({ length: 8 }, randomDigit);

  // 9th digit represents state if specified, otherwise random
  const NinthDigit = stateDigit !== undefined && stateDigit >= 0 && stateDigit <= 9
    ? stateDigit
    : randomDigit();
  
  const base = [...n, NinthDigit];

  // Calculate 1st verification digit
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += base[i] * (10 - i);
  }
  let d1 = 11 - (sum1 % 11);
  if (d1 >= 10) d1 = 0;

  // Calculate 2nd verification digit
  let sum2 = 0;
  const base2 = [...base, d1];
  for (let i = 0; i < 10; i++) {
    sum2 += base2[i] * (11 - i);
  }
  let d2 = 11 - (sum2 % 11);
  if (d2 >= 10) d2 = 0;

  const raw = `${base.join('')}${d1}${d2}`;
  return formatted ? formatCPF(raw) : raw;
}

export interface CPFValidationResult {
  isValid: boolean;
  raw: string;
  formatted: string;
  stateOrigin?: string;
  step1: { sum: number; remainder: number; expectedDigit: number; actualDigit: number; isMatch: boolean };
  step2: { sum: number; remainder: number; expectedDigit: number; actualDigit: number; isMatch: boolean };
  message: string;
}

export function validateCPF(cpfInput: string): CPFValidationResult {
  const clean = cpfInput.replace(/\D/g, '');
  const formatted = formatCPF(clean);

  if (clean.length !== 11) {
    return {
      isValid: false,
      raw: clean,
      formatted,
      step1: { sum: 0, remainder: 0, expectedDigit: 0, actualDigit: 0, isMatch: false },
      step2: { sum: 0, remainder: 0, expectedDigit: 0, actualDigit: 0, isMatch: false },
      message: 'O CPF deve conter exatamente 11 dígitos numéricos.',
    };
  }

  // Check sequence of identical digits
  if (/^(\d)\1{10}$/.test(clean)) {
    return {
      isValid: false,
      raw: clean,
      formatted,
      step1: { sum: 0, remainder: 0, expectedDigit: 0, actualDigit: 0, isMatch: false },
      step2: { sum: 0, remainder: 0, expectedDigit: 0, actualDigit: 0, isMatch: false },
      message: 'CPFs com todos os dígitos iguais são considerados inválidos.',
    };
  }

  const digits = clean.split('').map(Number);
  const actualD1 = digits[9];
  const actualD2 = digits[10];

  // Digit 1 check
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += digits[i] * (10 - i);
  }
  const rem1 = sum1 % 11;
  const expectedD1 = rem1 < 2 ? 0 : 11 - rem1;
  const match1 = expectedD1 === actualD1;

  // Digit 2 check
  let sum2 = 0;
  for (let i = 0; i < 10; i++) {
    sum2 += digits[i] * (11 - i);
  }
  const rem2 = sum2 % 11;
  const expectedD2 = rem2 < 2 ? 0 : 11 - rem2;
  const match2 = expectedD2 === actualD2;

  const isValid = match1 && match2;
  const ninthDigit = digits[8];
  const stateOrigin = CPF_STATES[ninthDigit];

  return {
    isValid,
    raw: clean,
    formatted,
    stateOrigin,
    step1: { sum: sum1, remainder: rem1, expectedDigit: expectedD1, actualDigit: actualD1, isMatch: match1 },
    step2: { sum: sum2, remainder: rem2, expectedDigit: expectedD2, actualDigit: actualD2, isMatch: match2 },
    message: isValid
      ? `CPF Válido! Região de emissão provável: ${stateOrigin}`
      : 'CPF Inválido. Os dígitos verificadores não conferem com o cálculo matemático.',
  };
}

// CNPJ Helper functions
export function formatCNPJ(cnpjRaw: string): string {
  const digits = cnpjRaw.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function generateCNPJ(formatted: boolean = true): string {
  const randomDigit = () => Math.floor(Math.random() * 10);
  const n = Array.from({ length: 8 }, randomDigit);
  // Matriz standard: 0001
  const branch = [0, 0, 0, 1];
  const base = [...n, ...branch];

  // 1st Verification digit (weights: 5,4,3,2,9,8,7,6,5,4,3,2)
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += base[i] * weights1[i];
  }
  let d1 = 11 - (sum1 % 11);
  if (d1 >= 10) d1 = 0;

  // 2nd Verification digit (weights: 6,5,4,3,2,9,8,7,6,5,4,3,2)
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const base2 = [...base, d1];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += base2[i] * weights2[i];
  }
  let d2 = 11 - (sum2 % 11);
  if (d2 >= 10) d2 = 0;

  const raw = `${base.join('')}${d1}${d2}`;
  return formatted ? formatCNPJ(raw) : raw;
}

export function validateCNPJ(cnpjInput: string): { isValid: boolean; message: string; formatted: string } {
  const clean = cnpjInput.replace(/\D/g, '');
  const formatted = formatCNPJ(clean);

  if (clean.length !== 14) {
    return { isValid: false, message: 'O CNPJ deve conter exatamente 14 dígitos numéricos.', formatted };
  }

  if (/^(\d)\1{13}$/.test(clean)) {
    return { isValid: false, message: 'CNPJs com todos os números iguais são inválidos.', formatted };
  }

  const digits = clean.split('').map(Number);
  const actualD1 = digits[12];
  const actualD2 = digits[13];

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += digits[i] * weights1[i];
  }
  let expectedD1 = 11 - (sum1 % 11);
  if (expectedD1 >= 10) expectedD1 = 0;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += digits[i] * weights2[i];
  }
  let expectedD2 = 11 - (sum2 % 11);
  if (expectedD2 >= 10) expectedD2 = 0;

  const isValid = expectedD1 === actualD1 && expectedD2 === actualD2;

  return {
    isValid,
    message: isValid ? 'CNPJ Válido!' : 'CNPJ Inválido. Os dígitos verificadores não conferem.',
    formatted,
  };
}
