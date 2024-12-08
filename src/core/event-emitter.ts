/** Event types that can be emitted by the buffer */
type BufferEvent = 'enqueue' | 'dequeue' | 'overflow' | 'reject';

/** Handler function type for buffer events */
type EventHandler<T> = (data: T) => void;

/**
 * Event emitter class for handling buffer events
 * @template T The type of data passed to event handlers
 */
export class EventEmitter<T> {
  /** Map of event names to sets of handler functions */
  private events: Record<BufferEvent, Set<EventHandler<T>>> = {
    enqueue: new Set(),
    dequeue: new Set(),
    overflow: new Set(),
    reject: new Set(),
  };

  /**
   * Subscribe to a buffer event
   * @param {BufferEvent} event - The event to subscribe to
   * @param {EventHandler<T>} handler - Function to handle the event
   * @returns {Function} Unsubscribe function to remove the handler
   */
  on(event: BufferEvent, handler: EventHandler<T>): () => void {
    this.events?.[event]?.add(handler);
    return () => {
      this.events?.[event]?.delete(handler);
    };
  }

  /**
   * Emit an event to all subscribed handlers
   * @param {BufferEvent} event - The event to emit
   * @param {T} data - Data to pass to handlers
   */
  emit(event: BufferEvent, data: T): void {
    for (const handler of this.events?.[event] || []) {
      handler(data);
    }
  }
}
