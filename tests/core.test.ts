import { describe, it, expect } from 'vitest';
import { Buflux, OverflowMode } from '../src/index';

describe('Buflux - Core Functionality', () => {
  it('should enqueue items up to capacity', () => {
    const buffer = new Buflux({ capacity: 3 });
    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);
    expect(buffer.toArray()).toEqual([1, 2, 3]);
  });

  it('should evict oldest item when full (Evict Oldest)', () => {
    const buffer = new Buflux({ capacity: 3, overflow: OverflowMode.EVICT });
    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);
    buffer.enqueue(4);
    expect(buffer.toArray()).toEqual([2, 3, 4]);
  });

  it('should reject new items when full (No Eviction)', () => {
    const buffer = new Buflux({ capacity: 3 });
    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);
    const result = buffer.enqueue(4);
    expect(result).toBe(false);
    expect(buffer.toArray()).toEqual([1, 2, 3]);
  });

  it('should dequeue items in FIFO order', () => {
    const buffer = new Buflux({ capacity: 3 });
    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);
    expect(buffer.dequeue()).toBe(1);
    expect(buffer.dequeue()).toBe(2);
    expect(buffer.toArray()).toEqual([3]);
  });

  it('should return undefined when dequeueing from an empty buffer', () => {
    const buffer = new Buflux({ capacity: 3 });
    expect(buffer.dequeue()).toBeUndefined();
  });
});
