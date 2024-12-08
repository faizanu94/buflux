# Buflux 🚀

Buflux is a high-performance buffer library for Node.js and browsers. It’s designed to efficiently manage fixed-capacity data with powerful overflow strategies, perfect for high-throughput systems.

## 🌟 Features

- Fixed-Capacity Buffer: Manage data up to a defined limit with ease.
- Overflow Strategies:
  - `REJECT`: Safely block new additions when full.
  - `EVICT`: Automatically remove the oldest item to make room, mimicking circular buffer behavior.
- Event-Driven: React to `enqueue`, `dequeue`, `overflow`, and `reject` events effortlessly.
- Zero Dependencies: Lightweight and fast.
- Universal Compatibility: Works seamlessly in Node.js (16+) and modern browsers.

## 🚀 Installation

Install Buflux via Yarn or npm:

```bash
yarn add buflux

npm install buflux
```

## 🔧 Usage

### Basic Example

```typescript
import { Buflux, OverflowMode } from 'buflux';

// Create a buffer with capacity 3 and eviction overflow strategy
const buffer = new Buflux<number>({
  capacity: 3,
  overflow: OverflowMode.EVICT,
});

buffer.enqueue(1); // [1]
buffer.enqueue(2); // [1, 2]
buffer.enqueue(3); // [1, 2, 3]

buffer.enqueue(4); // Evicts 1, buffer becomes [2, 3, 4]

console.log(buffer.toArray()); // [2, 3, 4]
console.log(buffer.peek()); // 2
```

### Events Example

```typescript
// Subscribe to events
const unsubscribeEnqueue = buffer.on('enqueue', (item) => {
  console.log(`Item added: ${item}`);
});

const unsubscribeOverflow = buffer.on('overflow', (evicted) => {
  console.log(`Item evicted: ${evicted}`);
});

buffer.enqueue(5); // Triggers 'enqueue'

// Unsubscribe
unsubscribeEnqueue(); // Remove enqueue listener
unsubscribeOverflow(); // Remove overflow listener

// Subscribe to other events
buffer.on('dequeue', (item) => {
  console.log(`Item removed: ${item}`);
});

buffer.on('reject', (item) => {
  console.log(`Item rejected: ${item}`);
});
```

## 📚 API Reference

### Buflux<T>

#### Constructor

```typescript
new Buflux<T>({ capacity: number, overflow?: OverflowMode });
```

- `capacity`: Maximum number of items the buffer can hold.
- `overflow` (optional): Overflow strategy (`REJECT` or `EVICT`). Defaults to `REJECT`.

#### Methods

- `enqueue(item)`: Adds an item to the buffer. Returns `true` if successful, `false` otherwise.
- `dequeue()`: Removes and returns the oldest item.
- `peek()`: Returns the oldest item without removing it.
- `size()`: Returns the current number of items.
- `isFull()`: Checks if the buffer is full.
- `clear()`: Removes all items from the buffer.

## 📦 Use Cases

- Task Queues: Efficiently manage job queues with predictable size.
- Rate Limiting: Buffer API calls or events to prevent overloads.
- Caching: In-memory storage with automatic eviction.
- Data Streams: Process and buffer incoming data streams efficiently.
