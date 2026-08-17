// Monta o payload "Pix Copia e Cola" (BR Code), que é o padrão EMV MPM adotado pelo Banco Central.
//
// O formato é uma sequência de campos ID + tamanho + valor, onde o tamanho tem sempre 2 dígitos
// e conta caracteres, não bytes. O último campo é o CRC16 do payload inteiro, incluindo o próprio
// cabeçalho "6304". Errar o CRC é o motivo número um de app de banco recusar o código.

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';

export interface PixPayloadInput {
  key: string;
  keyType: PixKeyType;
  merchantName: string;
  merchantCity: string;
  amount?: string;
  description?: string;
  txid?: string;
}

const ID_PAYLOAD_FORMAT = '00';
const ID_MERCHANT_ACCOUNT = '26';
const ID_MERCHANT_CATEGORY = '52';
const ID_CURRENCY = '53';
const ID_AMOUNT = '54';
const ID_COUNTRY = '58';
const ID_MERCHANT_NAME = '59';
const ID_MERCHANT_CITY = '60';
const ID_ADDITIONAL_DATA = '62';
const ID_CRC = '63';

const GUI_PIX = 'br.gov.bcb.pix';

function field(id: string, value: string): string {
  const length = String(value.length).padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * O BR Code é lido por leitores que assumem ASCII. Acento e símbolo fora da tabela fazem o
 * tamanho declarado do campo divergir do que o app do banco conta, e o código é rejeitado.
 */
export function sanitizeText(value: string, maxLength: number): string {
  return value
    .normalize('NFD')
    .replace(/[^A-Za-z0-9 .,\-]/g, '')
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

/** Normaliza a chave conforme o tipo: CPF/CNPJ e telefone vão só com dígitos. */
export function normalizePixKey(key: string, keyType: PixKeyType): string {
  const trimmed = key.trim();

  if (keyType === 'cpf' || keyType === 'cnpj') {
    return trimmed.replace(/\D/g, '');
  }
  if (keyType === 'telefone') {
    const digits = trimmed.replace(/\D/g, '');
    // O padrão exige o telefone no formato internacional, com +55 na frente.
    return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
  }
  return trimmed;
}

export function validatePixKey(key: string, keyType: PixKeyType): string | null {
  const normalized = normalizePixKey(key, keyType);
  if (!normalized) return 'Informe a chave Pix.';

  if (keyType === 'cpf' && normalized.length !== 11) return 'CPF deve ter 11 dígitos.';
  if (keyType === 'cnpj' && normalized.length !== 14) return 'CNPJ deve ter 14 dígitos.';
  if (keyType === 'telefone' && normalized.length < 13) return 'Telefone deve ter DDD e 9 dígitos.';
  if (keyType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    return 'E-mail inválido.';
  if (keyType === 'aleatoria' && normalized.length !== 36)
    return 'A chave aleatória tem 36 caracteres, no formato UUID.';

  return null;
}

/** Converte "1.234,56" ou "1234.56" para o formato exigido pelo padrão: "1234.56". */
export function normalizeAmount(amount: string): string {
  const cleaned = amount.replace(/[^\d,.]/g, '');
  if (!cleaned) return '';

  // Se tem vírgula, ela é o separador decimal e o ponto é separador de milhar.
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;

  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return '';
  return value.toFixed(2);
}

/** CRC16/CCITT-FALSE: polinômio 0x1021, valor inicial 0xFFFF, sem inversão final. */
export function crc16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayload(input: PixPayloadInput): string {
  const key = normalizePixKey(input.key, input.keyType);
  const description = input.description ? sanitizeText(input.description, 40) : '';

  const merchantAccount =
    field('00', GUI_PIX) + field('01', key) + (description ? field('02', description) : '');

  // O txid identifica a cobrança no extrato. "***" é o valor livre previsto pelo padrão.
  const txid = input.txid ? sanitizeText(input.txid, 25).replace(/[^A-Za-z0-9]/g, '') : '';
  const additionalData = field('05', txid || '***');

  const amount = input.amount ? normalizeAmount(input.amount) : '';

  const payload =
    field(ID_PAYLOAD_FORMAT, '01') +
    field(ID_MERCHANT_ACCOUNT, merchantAccount) +
    field(ID_MERCHANT_CATEGORY, '0000') +
    field(ID_CURRENCY, '986') +
    (amount ? field(ID_AMOUNT, amount) : '') +
    field(ID_COUNTRY, 'BR') +
    field(ID_MERCHANT_NAME, sanitizeText(input.merchantName, 25) || 'NAO INFORMADO') +
    field(ID_MERCHANT_CITY, sanitizeText(input.merchantCity, 15) || 'SAO PAULO') +
    field(ID_ADDITIONAL_DATA, additionalData);

  // O CRC é calculado sobre o payload já com "6304" no fim, por isso a concatenação vem antes.
  const withCrcHeader = `${payload}${ID_CRC}04`;
  return `${withCrcHeader}${crc16(withCrcHeader)}`;
}
