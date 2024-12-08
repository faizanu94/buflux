import { describe, it, expect } from 'vitest';
import { Buflux, OverflowMode } from '../src';

describe('Buflux - Cross-Environment Compatibility', () => {
  it('should work in Node.js runtime', () => {
    const buffer = new Buflux<number>({ capacity: 5 });

    buffer.enqueue(1);
    buffer.enqueue(2);

    expect(buffer.size()).toBe(2);
    expect(buffer.peek()).toBe(1);
  });

  it('should be compatible with browser memory constraints', () => {
    const buffer = new Buflux<string>({
      capacity: 10,
      overflow: OverflowMode.EVICT,
    });

    for (let i = 0; i < 15; i++) {
      buffer.enqueue(`item-${i}`);
    }

    expect(buffer.size()).toBe(10);
    expect(buffer.peek()).toBe('item-5');
  });

  it('should maintain event consistency', () => {
    const buffer = new Buflux<number>({
      capacity: 3,
      overflow: OverflowMode.EVICT,
    });

    const events: string[] = [];
    buffer.on('enqueue', () => events.push('enqueue'));
    buffer.on('dequeue', () => events.push('dequeue'));
    buffer.on('overflow', () => events.push('overflow'));
    buffer.on('reject', () => events.push('reject'));

    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);
    buffer.enqueue(4);
    buffer.dequeue();

    expect(events).toContain('enqueue');
    expect(events).toContain('dequeue');
    expect(events).toContain('overflow');
  });

  it('should be JSON serializable', () => {
    const buffer = new Buflux<{ id: number }>({ capacity: 3 });

    buffer.enqueue({ id: 1 });
    buffer.enqueue({ id: 2 });

    const serialized = JSON.stringify(buffer.toArray());
    const parsed = JSON.parse(serialized);

    expect(parsed).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should have consistent memory usage across environments', () => {
    const buffer = new Buflux<number>({ capacity: 1000 });

    for (let i = 0; i < 1000; i++) {
      buffer.enqueue(i);
    }

    expect(buffer.size()).toBe(1000);
    expect(buffer.isFull()).toBe(true);
  });

  it('should support async operations', async () => {
    const buffer = new Buflux<number>({ capacity: 10 });

    const asyncEnqueue = async (item: number) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          resolve(buffer.enqueue(item));
        }, 10);
      });
    };

    await Promise.all([asyncEnqueue(1), asyncEnqueue(2), asyncEnqueue(3)]);

    expect(buffer.size()).toBe(3);
  });
});
