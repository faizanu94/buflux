import { describe, it, expect } from 'vitest';
import { Buflux, OverflowMode } from '../src';
import { performance } from 'perf_hooks';
describe('Buflux - Performance Benchmarks', () => {
  const LARGE_CAPACITY = 1_000_000;

  it('should maintain O(1) enqueue performance', () => {
    const buffer = new Buflux<number>({
      capacity: LARGE_CAPACITY,
      overflow: OverflowMode.EVICT,
    });

    const start = performance.now();
    for (let i = 0; i < LARGE_CAPACITY; i++) {
      buffer.enqueue(i);
    }
    const end = performance.now();

    const duration = end - start;
    console.log(`Enqueue ${LARGE_CAPACITY} items: ${duration.toFixed(2)}ms`);

    expect(duration).toBeLessThan(1000);
  });

  it('should handle high-frequency operations', () => {
    const buffer = new Buflux<number>({
      capacity: 100_000,
      overflow: OverflowMode.EVICT,
    });

    const start = performance.now();

    for (let i = 0; i < 500_000; i++) {
      if (i % 2 === 0) {
        buffer.enqueue(i);
      } else {
        buffer.dequeue();
      }
    }

    const end = performance.now();
    const duration = end - start;

    console.log(`Mixed operations duration: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(2000);
  });

  it('should have predictable memory usage', () => {
    const buffer = new Buflux<number>({
      capacity: LARGE_CAPACITY,
      overflow: OverflowMode.EVICT,
    });

    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < LARGE_CAPACITY; i++) {
      buffer.enqueue(i);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDelta = finalMemory - initialMemory;

    console.log(`Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);

    expect(memoryDelta / 1024 / 1024).toBeLessThan(100);
  });
  it('should handle enqueueing a large number of items efficiently', () => {
    const capacity = 1_000_000;
    const buffer = new Buflux<number>({ capacity });

    for (let i = 0; i < capacity; i++) {
      buffer.enqueue(i);
    }

    expect(buffer.size()).toBe(capacity);
    expect(buffer.peek()).toBe(0);
  });

  it('should handle high-frequency enqueue and dequeue operations', () => {
    const capacity = 100_000;
    const buffer = new Buflux<number>({ capacity });

    for (let i = 0; i < capacity; i++) {
      buffer.enqueue(i);
    }

    for (let i = capacity; i < capacity * 2; i++) {
      buffer.dequeue();
      buffer.enqueue(i);
    }

    expect(buffer.size()).toBe(capacity);
    expect(buffer.peek()).toBe(capacity);
  });

  it('should handle repeated overflow scenarios', () => {
    const capacity = 10_000;
    const buffer = new Buflux<number>({
      capacity,
      overflow: OverflowMode.EVICT,
    });

    for (let i = 0; i < capacity * 2; i++) {
      buffer.enqueue(i);
    }

    expect(buffer.size()).toBe(capacity);
    expect(buffer.peek()).toBe(10_000);
  });

  it('should not cause memory leaks with large datasets', () => {
    const capacity = 1_000_000;
    const buffer = new Buflux<number>({ capacity });

    for (let i = 0; i < capacity; i++) {
      buffer.enqueue(i);
    }

    buffer.clear();
    expect(buffer.size()).toBe(0);

    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Memory used: ${usedMemory.toFixed(2)} MB`);
  });

  it('should measure enqueue and dequeue performance', () => {
    const capacity = 100_000;
    const buffer = new Buflux<number>({ capacity });

    const startEnqueue = performance.now();
    for (let i = 0; i < capacity; i++) {
      buffer.enqueue(i);
    }
    const endEnqueue = performance.now();

    const startDequeue = performance.now();
    for (let i = 0; i < capacity; i++) {
      buffer.dequeue();
    }
    const endDequeue = performance.now();

    const enqueueTime = endEnqueue - startEnqueue;
    const dequeueTime = endDequeue - startDequeue;

    console.log(`Enqueue Performance: ${enqueueTime.toFixed(2)}ms`);
    console.log(`Dequeue Performance: ${dequeueTime.toFixed(2)}ms`);

    expect(enqueueTime).toBeLessThan(1000);
    expect(dequeueTime).toBeLessThan(1000);
  });

  it('should have predictable memory growth', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const buffer = new Buflux<number>({ capacity: 1_000_000 });

    for (let i = 0; i < 1_000_000; i++) {
      buffer.enqueue(i);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDelta = finalMemory - initialMemory;

    console.log(`Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);

    expect(memoryDelta / 1024 / 1024).toBeLessThan(100);
  });

  it('should handle concurrent async operations', async () => {
    const capacity = 50_000;
    const buffer = new Buflux<number>({ capacity });

    const producers = Array.from({ length: 10 }, (_, i) =>
      Promise.all(
        Array.from({ length: 5_000 }, (_, j) => buffer.enqueue(i * 5_000 + j))
      )
    );

    const consumers = Array.from({ length: 10 }, () =>
      Promise.all(Array.from({ length: 5_000 }, () => buffer.dequeue()))
    );

    await Promise.all([...producers, ...consumers]);

    expect(buffer.size()).toBeLessThanOrEqual(capacity);
  });
});
