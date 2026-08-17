// Rate Limiting Engine & Anti-Spam Security Layer for abobiferramentas

export interface ToolLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
  name: string;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetInSeconds: number;
  reason?: string;
  isBurstBlocked?: boolean;
}

// Configured limits by tool tier
const DEFAULT_LIMIT: ToolLimitConfig = {
  maxRequests: 12,
  windowMs: 10000, // 10 seconds
  name: 'Geral',
};

const TOOL_CONFIGS: Record<string, ToolLimitConfig> = {
  // Global site actions
  'site-global': {
    maxRequests: 30,
    windowMs: 20000, // 30 req per 20s
    name: 'Toda a Aplicação',
  },

  // Heavy CPU / Generation Tools
  'compressor-imagem': {
    maxRequests: 5,
    windowMs: 15000, // 5 compressions per 15s
    name: 'Compressor de Imagem',
  },
  'gerador-curriculo': {
    maxRequests: 5,
    windowMs: 15000,
    name: 'Gerador de Currículo',
  },
  'gerador-qrcode': {
    maxRequests: 8,
    windowMs: 10000,
    name: 'Gerador de QR Code',
  },
  'conversor-imagem': {
    maxRequests: 5,
    windowMs: 15000, // 5 conversões por 15s
    name: 'Conversor de Imagem',
  },

  // Generator & Validator Tools
  'gerador-cpf': {
    maxRequests: 10,
    windowMs: 10000,
    name: 'Gerador de CPF',
  },
  'validador-cpf': {
    maxRequests: 15,
    windowMs: 10000,
    name: 'Validador de CPF',
  },
  'gerador-cnpj': {
    maxRequests: 10,
    windowMs: 10000,
    name: 'Gerador de CNPJ',
  },
  'gerador-senhas': {
    maxRequests: 12,
    windowMs: 10000,
    name: 'Gerador de Senhas',
  },
  'gerador-uuid': {
    maxRequests: 12,
    windowMs: 10000,
    name: 'Gerador de UUID',
  },
  'link-whatsapp': {
    maxRequests: 10,
    windowMs: 10000,
    name: 'Link do WhatsApp',
  },
  'base64-hash': {
    maxRequests: 15,
    windowMs: 10000,
    name: 'Base64 & Hash',
  },
  'gerador-pix': {
    maxRequests: 10,
    windowMs: 10000,
    name: 'Gerador de Pix',
  },
  // Consulta a API pública do ViaCEP: limite mais apertado para não abusar de serviço de terceiro.
  'consulta-cep': {
    maxRequests: 8,
    windowMs: 15000,
    name: 'Consulta de CEP',
  },

  // High-Frequency Realtime Tools
  'contador-texto': {
    maxRequests: 30,
    windowMs: 5000,
    name: 'Contador de Texto',
  },
  'formatador-json': {
    maxRequests: 20,
    windowMs: 5000,
    name: 'Formatador JSON',
  },
  'calculadoras': {
    maxRequests: 25,
    windowMs: 5000,
    name: 'Calculadoras',
  },
  'conversor-unidades': {
    maxRequests: 25,
    windowMs: 5000,
    name: 'Conversor de Unidades',
  },
  'calculadora-datas': {
    maxRequests: 25,
    windowMs: 5000,
    name: 'Calculadora de Datas',
  },
  'comparador-texto': {
    maxRequests: 20,
    windowMs: 5000,
    name: 'Comparador de Textos',
  },
};

// In-Memory Timestamp Trackers
const memoryLogs: Record<string, number[]> = {};
const burstLocks: Record<string, number> = {}; // key -> unlock timestamp ms

const STORAGE_PREFIX = 'multitool_ratelimit_';

/**
 * Retrieves timestamps from memory or localStorage for persistent tracking across reloads
 */
function getTimestamps(key: string): number[] {
  const now = Date.now();
  let list = memoryLogs[key];

  if (!list) {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (stored) {
        list = JSON.parse(stored);
      }
    } catch {
      list = [];
    }
  }

  list = (list || []).filter((ts) => typeof ts === 'number' && now - ts < 60000);
  memoryLogs[key] = list;
  return list;
}

/**
 * Saves timestamps to memory & localStorage
 */
function saveTimestamps(key: string, list: number[]) {
  memoryLogs[key] = list;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(list.slice(-50)));
  } catch {
    // ignore quota error
  }
}

/**
 * Returns configuration for a given tool
 */
export function getToolConfig(toolId: string): ToolLimitConfig {
  return TOOL_CONFIGS[toolId] || DEFAULT_LIMIT;
}

/**
 * Checks if action is permitted and consumes 1 token if allowed.
 */
export function checkAndConsumeRateLimit(toolId: string): RateLimitCheckResult {
  const now = Date.now();
  const config = getToolConfig(toolId);
  const globalConfig = TOOL_CONFIGS['site-global'];

  // 1. Check active Burst / Lockout
  const burstUnlock = burstLocks[toolId] || 0;
  if (now < burstUnlock) {
    const diffSec = Math.ceil((burstUnlock - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      limit: config.maxRequests,
      resetInSeconds: diffSec,
      reason: 'Atenção: Muitas requisições em um intervalo extremamente curto (Proteção Anti-Bot).',
      isBurstBlocked: true,
    };
  }

  // 2. Check Tool-Specific Timestamps
  const toolLogs = getTimestamps(toolId).filter((ts) => now - ts < config.windowMs);

  // Anti-burst check: if > 5 requests in < 800ms
  const recent1s = toolLogs.filter((ts) => now - ts < 800);
  if (recent1s.length >= 5) {
    // Trigger 10s lockout
    const lockUntil = now + 10000;
    burstLocks[toolId] = lockUntil;
    return {
      allowed: false,
      remaining: 0,
      limit: config.maxRequests,
      resetInSeconds: 10,
      reason: 'Disparo contínuo bloqueado! Por favor aguarde 10s para retomar o uso.',
      isBurstBlocked: true,
    };
  }

  if (toolLogs.length >= config.maxRequests) {
    const oldest = toolLogs[0];
    const resetMs = oldest + config.windowMs - now;
    const resetInSeconds = Math.max(1, Math.ceil(resetMs / 1000));
    return {
      allowed: false,
      remaining: 0,
      limit: config.maxRequests,
      resetInSeconds,
      reason: `Limite de ${config.maxRequests} chamadas por ${config.windowMs / 1000}s atingido para ${config.name}.`,
    };
  }

  // 3. Check Global Site Timestamps
  const globalLogs = getTimestamps('site-global').filter((ts) => now - ts < globalConfig.windowMs);
  if (globalLogs.length >= globalConfig.maxRequests) {
    const oldest = globalLogs[0];
    const resetMs = oldest + globalConfig.windowMs - now;
    const resetInSeconds = Math.max(1, Math.ceil(resetMs / 1000));
    return {
      allowed: false,
      remaining: 0,
      limit: globalConfig.maxRequests,
      resetInSeconds,
      reason: 'Limite geral de uso da aplicação atingido temporariamente. Aguarde alguns segundos.',
    };
  }

  // Action is allowed! Record timestamp
  toolLogs.push(now);
  saveTimestamps(toolId, toolLogs);

  globalLogs.push(now);
  saveTimestamps('site-global', globalLogs);

  const remaining = config.maxRequests - toolLogs.length;
  const resetInSeconds = Math.ceil(config.windowMs / 1000);

  return {
    allowed: true,
    remaining,
    limit: config.maxRequests,
    resetInSeconds,
  };
}

/**
 * Returns current usage info without consuming a request
 */
export function getUsageInfo(toolId: string): {
  used: number;
  limit: number;
  windowSeconds: number;
} {
  const now = Date.now();
  const config = getToolConfig(toolId);
  const logs = getTimestamps(toolId).filter((ts) => now - ts < config.windowMs);

  return {
    used: logs.length,
    limit: config.maxRequests,
    windowSeconds: config.windowMs / 1000,
  };
}
