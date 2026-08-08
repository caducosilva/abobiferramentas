export interface PasswordOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  avoidAmbiguous: boolean;
}

export function generatePassword(options: PasswordOptions): string {
  let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lower = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '0123456789';
  let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (options.avoidAmbiguous) {
    upper = upper.replace(/[IO]/g, '');
    lower = lower.replace(/[l]/g, '');
    numbers = numbers.replace(/[01]/g, '');
    symbols = symbols.replace(/[{}[\]()/\'"`~,;:.<>]/g, '');
  }

  let charset = '';
  if (options.useUpper) charset += upper;
  if (options.useLower) charset += lower;
  if (options.useNumbers) charset += numbers;
  if (options.useSymbols) charset += symbols;

  if (!charset) {
    charset = lower; // fallback
  }

  let password = '';
  const array = new Uint32Array(options.length);
  window.crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}

export function calculatePasswordStrength(password: string): {
  score: number; // 0 - 100
  label: string;
  color: string;
  entropy: number;
} {
  if (!password) {
    return { score: 0, label: 'Muito Fraca', color: 'bg-red-500', entropy: 0 };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = Math.round(password.length * Math.log2(poolSize || 1));

  let score = Math.min(100, Math.round((entropy / 80) * 100));
  let label = 'Fraca';
  let color = 'bg-red-500';

  if (entropy >= 80) {
    label = 'Impenetrável';
    color = 'bg-emerald-500';
  } else if (entropy >= 60) {
    label = 'Forte';
    color = 'bg-green-500';
  } else if (entropy >= 40) {
    label = 'Média';
    color = 'bg-yellow-500';
  } else {
    label = 'Fraca';
    color = 'bg-red-500';
  }

  return { score, label, color, entropy };
}

export function encodeBase64(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    return 'Erro na codificação Base64';
  }
}

export function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    return 'Erro ao decodificar Base64: String inválida';
  }
}

export async function computeHash(text: string, algorithm: 'SHA-256' | 'SHA-1' | 'SHA-512'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeFileHash(
  file: File,
  algorithm: 'SHA-256' | 'SHA-1' | 'SHA-512'
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateUUIDs(count: number = 1, uppercase = false, hyphens = true): string[] {
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    let id = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    if (!hyphens) id = id.replace(/-/g, '');
    if (uppercase) id = id.toUpperCase();
    list.push(id);
  }
  return list;
}
