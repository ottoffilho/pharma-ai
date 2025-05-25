/**
 * Módulo de logging centralizado com funcionalidades para sanitizar dados sensíveis
 */

// Lista de chaves sensíveis que devem ser redatadas nos logs
const SENSITIVE_KEYS = [
  'password', 'senha', 'token', 'secret', 'key', 'api_key', 'apiKey', 
  'auth', 'credentials', 'credit_card', 'creditCard', 'cvv', 'cvc'
];

// Função para sanitizar objetos recursivamente
const sanitizeObject = (obj: unknown): unknown => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  return Object.entries(obj as Record<string, unknown>).reduce((acc, [key, value]) => {
    // Verifique se a chave contém palavras sensíveis
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );

    if (isSensitive && value) {
      // Redatar valores sensíveis
      acc[key] = typeof value === 'string' 
        ? '********' 
        : '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Sanitizar objetos aninhados
      acc[key] = sanitizeObject(value);
    } else {
      acc[key] = value;
    }

    return acc;
  }, {} as Record<string, unknown>);
};

// Interface para o logger
interface Logger {
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

// Implementação do logger
const logger: Logger = {
  error: (message: string, ...args: unknown[]): void => {
    console.error(
      `[ERROR] ${message}`, 
      ...args.map(arg => sanitizeObject(arg))
    );
  },
  
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(
      `[WARN] ${message}`, 
      ...args.map(arg => sanitizeObject(arg))
    );
  },
  
  info: (message: string, ...args: unknown[]): void => {
    console.info(
      `[INFO] ${message}`, 
      ...args.map(arg => sanitizeObject(arg))
    );
  },
  
  debug: (message: string, ...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      console.log(
        `[DEBUG] ${message}`, 
        ...args.map(arg => sanitizeObject(arg))
      );
    }
  }
};

export default logger; 