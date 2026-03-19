import { DomainEvent, DomainEventName } from "../domain/events";

type Handler<T extends DomainEvent> = (event: T) => void;

export class EventEmitter {
  private handlers: Map<string, Handler<DomainEvent>[]> = new Map();

  subscribe<K extends DomainEventName>(
    eventName: K,
    handler: Handler<Extract<DomainEvent, { name: K }>>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler as Handler<DomainEvent>);
  }

  
  unsubscribe<K extends DomainEventName>(
    eventName: K,
    handler: Handler<Extract<DomainEvent, { name: K }>>
  ): void {
    const list = this.handlers.get(eventName);
    if (!list) return;
    this.handlers.set(
      eventName,
      list.filter((h) => h !== (handler as Handler<DomainEvent>))
    );
  }

  emit(event: DomainEvent): void {
    const list = this.handlers.get(event.name);
    if (list) {
      for (const handler of list) {
        handler(event);
      }
    }
  }
}

export const emitter = new EventEmitter();
