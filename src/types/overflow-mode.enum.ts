/**
 * Defines strategies for handling buffer overflow conditions
 * @enum {string}
 * @property {string} REJECT - Blocks new items when buffer is full
 * @property {string} EVICT - Removes oldest item to make room for new items
 */
export enum OverflowMode {
  REJECT = 'reject',
  EVICT = 'evict',
}
