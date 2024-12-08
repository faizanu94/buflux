import { describe, it, expect, vi } from 'vitest';
import { Buflux, EventEmitter, OverflowMode } from '../src/';

describe('Buflux - Event Hooks', () => {
  it('should fire enqueue event on adding items', () => {
    const buffer = new Buflux({ capacity: 3 });
    const enqueueSpy = vi.fn();
    buffer.on('enqueue', enqueueSpy);
    buffer.enqueue(1);
    expect(enqueueSpy).toHaveBeenCalledWith(1);
  });

  it('should fire dequeue event on removing items', () => {
    const buffer = new Buflux({ capacity: 3 });
    const dequeueSpy = vi.fn();
    buffer.on('dequeue', dequeueSpy);

    buffer.enqueue(1);
    buffer.dequeue();
    expect(dequeueSpy).toHaveBeenCalledWith(1);
  });

  it('should fire overflow event when evicting items', () => {
    const buffer = new Buflux({ capacity: 3, overflow: OverflowMode.EVICT });
    const overflowSpy = vi.fn();
    buffer.on('overflow', overflowSpy);

    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);
    buffer.enqueue(4);
    expect(overflowSpy).toHaveBeenCalledWith(1);
  });

  it('should fire reject event when rejecting items', () => {
    const buffer = new Buflux({ capacity: 3 });
    const rejectSpy = vi.fn();
    buffer.on('reject', rejectSpy);

    buffer.enqueue(1);
    buffer.enqueue(2);
    buffer.enqueue(3);
    buffer.enqueue(4);
    expect(rejectSpy).toHaveBeenCalledWith(4);
  });

  it('should allow unsubscribing from an event', () => {
    const emitter = new EventEmitter<number>();
    const mockHandler = vi.fn();

    const unsubscribe = emitter.on('enqueue', mockHandler);

    emitter.emit('enqueue', 42);
    expect(mockHandler).toHaveBeenCalledWith(42);
    expect(mockHandler).toHaveBeenCalledTimes(1);

    unsubscribe();

    emitter.emit('enqueue', 43);
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should support multiple handlers for same event', () => {
    const emitter = new EventEmitter<string>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('enqueue', handler1);
    emitter.on('enqueue', handler2);

    emitter.emit('enqueue', 'test');
    expect(handler1).toHaveBeenCalledWith('test');
    expect(handler2).toHaveBeenCalledWith('test');
  });

  it('should handle unsubscribing from different events', () => {
    const emitter = new EventEmitter<number>();
    const enqueueHandler = vi.fn();
    const dequeueHandler = vi.fn();

    emitter.on('enqueue', enqueueHandler);
    emitter.on('dequeue', dequeueHandler);

    emitter.emit('enqueue', 1);
    emitter.emit('dequeue', 2);

    expect(enqueueHandler).toHaveBeenCalledWith(1);
    expect(dequeueHandler).toHaveBeenCalledWith(2);
  });

  it('should be safe to call unsubscribe multiple times', () => {
    const emitter = new EventEmitter<number>();
    const handler = vi.fn();

    const unsubscribe = emitter.on('enqueue', handler);

    emitter.emit('enqueue', 1);
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    unsubscribe();
    unsubscribe();

    emitter.emit('enqueue', 2);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
