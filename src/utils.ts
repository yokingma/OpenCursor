import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.js';

export function calcHex(str: string): string {
  try {
    const hash = createHash('sha1');
    hash.update(str);
    return hash.digest('hex');
  } catch (error) {
    logger.error(error);
    return '-1';
  }
}

export function genUUID(): string {
  return uuidv4();
}
