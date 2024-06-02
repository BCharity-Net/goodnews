import { describe, expect, test } from 'vitest';

import { Regex } from '../../regex';

const validate = (text: string) => {
  Regex.cashtag.lastIndex = 0;
  return Regex.cashtag.test(text);
};

describe('cashtag regex', () => {
  test('should pass for valid cashtag', () => {
    expect(validate('$good')).toBe(true);
    expect(validate('$GOOD')).toBe(true);
    expect(validate('$_good')).toBe(true);
    expect(validate('$123good')).toBe(true);
  });

  test('should fail for cashtags filled with a digit', () => {
    expect(validate('$2024')).toBe(false);
  });

  test('should fail for cashtags without any alphabet characters', () => {
    expect(validate('$123')).toBe(false);
    expect(validate('$_!@')).toBe(false);
  });

  test('should fail for empty string', () => {
    expect(validate('')).toBe(false);
    expect(validate('$')).toBe(false);
  });
});
