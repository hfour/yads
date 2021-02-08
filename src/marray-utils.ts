export class EventHandler<T = undefined, U = void> {
  private handlers: Array<(t: T) => U> = [];

  addListener(f: (t: T) => U) {
    this.handlers.push(f);
  }

  run(t: T) {
    this.handlers.forEach(handler => handler(t));
  }

  removeListener(f: (t: T) => U) {
    this.handlers.splice(this.handlers.indexOf(f), 1);
  }
}

export function toInteger(s: any): number | null {
  if (s === '' || typeof s === 'symbol') return null;
  let n = Number(s);
  if (Number.isInteger(n)) return n;
  return null;
}
