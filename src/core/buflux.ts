import { EventEmitter } from './event-emitter';
import { OverflowMode } from '../types/overflow-mode.enum';

/** Configuration options for creating a Buflux instance */
interface BufluxOptions {
  /** Maximum number of items the buffer can hold */
  capacity: number;
  /** Strategy to handle overflow when buffer is full */
  overflow?: OverflowMode;
}

/**
 * A fixed-capacity buffer with configurable overflow strategies
 * @template T The type of items stored in the buffer
 * @extends EventEmitter<T>
 */
export class Buflux<T> extends EventEmitter<T> {
  private buffer: T[] = [];
  private readonly capacity: number;
  private readonly overflowMode: OverflowMode;
  private overflowHandlers: Map<OverflowMode, (item: T) => boolean> = new Map();
  private overflowHandler: (item: T) => boolean;

  /**
   * Creates a new Buflux instance
   * @param {BufluxOptions} options - Configuration options
   * @throws {Error} If capacity is not a positive integer
   */
  constructor(options: BufluxOptions) {
    super();
    if (!Number.isInteger(options.capacity) || options.capacity <= 0) {
      throw new Error('Capacity must be a positive integer');
    }

    this.capacity = options.capacity;
    this.overflowMode =
      options.overflow === OverflowMode.EVICT
        ? OverflowMode.EVICT
        : OverflowMode.REJECT;

    this.initializeOverflowHandlers();
    const handler = this.overflowHandlers.get(this.overflowMode);
    if (!handler) {
      throw new Error('Invalid overflow mode');
    }
    this.overflowHandler = handler;
  }

  /**
   * Initializes handlers for different overflow modes
   * @private
   */
  private initializeOverflowHandlers(): void {
    this.overflowHandlers.set(OverflowMode.REJECT, (item: T) => {
      this.emit('reject', item);
      return false;
    });

    this.overflowHandlers.set(OverflowMode.EVICT, (item: T) => {
      const evicted = this.buffer.shift();
      if (evicted) {
        this.emit('overflow', evicted);
      }
      return this.enqueue(item);
    });
  }

  /**
   * Adds an item to the buffer
   * @param {T} item - Item to add
   * @returns {boolean} True if item was added successfully, false otherwise
   * @emits enqueue When item is added successfully
   * @emits overflow When an item is evicted (in EVICT mode)
   * @emits reject When item is rejected (in REJECT mode)
   */
  enqueue(item: T): boolean {
    if (this.buffer.length < this.capacity) {
      this.buffer.push(item);
      this.emit('enqueue', item);
      return true;
    }

    return this.overflowHandler(item);
  }

  /**
   * Removes and returns the oldest item from the buffer
   * @returns {T | undefined} The removed item, or undefined if buffer is empty
   * @emits dequeue When an item is removed
   */
  dequeue(): T | undefined {
    if (this.buffer.length === 0) {
      return undefined;
    }

    const item = this.buffer.shift();
    if (item) {
      this.emit('dequeue', item);
    }
    return item;
  }

  /**
   * Checks if the buffer is at capacity
   * @returns {boolean} True if buffer is full
   */
  isFull(): boolean {
    return this.buffer.length === this.capacity;
  }

  /**
   * Checks if the buffer has no items
   * @returns {boolean} True if buffer is empty
   */
  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  /**
   * Gets the current number of items in the buffer
   * @returns {number} Current buffer size
   */
  size(): number {
    return this.buffer.length;
  }

  /**
   * Returns the oldest item without removing it
   * @returns {T | undefined} The oldest item, or undefined if buffer is empty
   */
  peek(): T | undefined {
    return this.buffer[0];
  }

  /**
   * Removes all items from the buffer
   */
  clear(): void {
    this.buffer = [];
  }

  /**
   * Returns a copy of the buffer contents as an array
   * @returns {T[]} Array containing buffer items in order
   */
  toArray(): T[] {
    return [...this.buffer];
  }
}
