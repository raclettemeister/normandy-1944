import type { PlaythroughEvent } from '../types';

export class EventLog {
  private events: PlaythroughEvent[] = [];

  append(event: PlaythroughEvent): void {
    this.events.push(event);
  }

  getAll(): PlaythroughEvent[] {
    return [...this.events];
  }

  getForSoldier(soldierId: string): PlaythroughEvent[] {
    return this.events.filter(e => e.soldierIds.includes(soldierId));
  }

  getByType(type: PlaythroughEvent["type"]): PlaythroughEvent[] {
    return this.events.filter(e => e.type === type);
  }

  getRecentForDM(count: number): PlaythroughEvent[] {
    const start = Math.max(0, this.events.length - count);
    return this.events.slice(start);
  }

  serialize(): PlaythroughEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
