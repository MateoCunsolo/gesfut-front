import test from 'node:test';
import assert from 'node:assert/strict';
import { SHIRT_RANGE_MESSAGE, SHIRT_REQUIRED_MESSAGE, parseShirtNumber, shirtNumberError } from '../src/app/core/utils/shirt-number';

test('el dorsal acepta 0 a 99 y bloquea el resto con el mensaje unificado', () => {
  assert.equal(parseShirtNumber(0), 0);
  assert.equal(parseShirtNumber(99), 99);
  assert.equal(parseShirtNumber('00'), 0);
  assert.equal(parseShirtNumber(-1), null);
  assert.equal(parseShirtNumber(100), null);
  assert.equal(parseShirtNumber(1.5), null);
  assert.equal(shirtNumberError(null), SHIRT_REQUIRED_MESSAGE);
  assert.equal(shirtNumberError(''), SHIRT_REQUIRED_MESSAGE);
  assert.equal(shirtNumberError(-1), SHIRT_RANGE_MESSAGE);
  assert.equal(shirtNumberError(100), SHIRT_RANGE_MESSAGE);
  assert.equal(shirtNumberError(0), '');
});
