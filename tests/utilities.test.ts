import { describe, it, expect } from 'vitest';
import { Buflux } from '../src';

describe('Buflux - Utility Methods', () => {
  it('should convert buffer to an array', () => {
    const buffer = new Buflux({ capacity: 3 });
    buffer.enqueue(1);
    buffer.enqueue(2);
    expect(buffer.toArray()).toEqual([1, 2]);
  });

  it('should clear the buffer', () => {
    const buffer = new Buflux({ capacity: 3 });
    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.clear();
    expect(buffer.toArray()).toEqual([]);
  });

  it('should correctly report buffer fullness', () => {
    const buffer = new Buflux({ capacity: 3 });
    expect(buffer.isEmpty()).toBe(true);

    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);

    expect(buffer.isFull()).toBe(true);
    expect(buffer.isEmpty()).toBe(false);
  });

  it('should peek the oldest item without removing it', () => {
    const buffer = new Buflux({ capacity: 3 });
    buffer.enqueue(1);
    buffer.enqueue(2);
    expect(buffer.peek()).toBe(1);
    expect(buffer.toArray()).toEqual([1, 2]);
  });
});
