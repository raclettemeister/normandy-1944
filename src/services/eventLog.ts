import type { PlaythroughEvent, GameEvent, PlatoonAudit, GameState, SoldierRelationship } from '../types';

const MAX_SUMMARY_EVENTS = 30;
const RECENT_THRESHOLD = 8;

export class EventLog {
  private events: PlaythroughEvent[] = [];
  private gameEvents: GameEvent[] = [];

  // --- Existing PlaythroughEvent API (unchanged) ---

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
    this.gameEvents = [];
  }

  // --- New GameEvent API (v2 design) ---

  appendGameEvent(event: GameEvent): void {
    this.gameEvents.push(event);
  }

  getAllGameEvents(): GameEvent[] {
    return [...this.gameEvents];
  }

  buildContextSummary(): string {
    if (this.gameEvents.length === 0) return "SITUATION LOG:\n- No events yet.";

    const lines: string[] = [];
    const total = this.gameEvents.length;
    const recentStart = Math.max(0, total - RECENT_THRESHOLD);

    for (let i = 0; i < Math.min(total, MAX_SUMMARY_EVENTS); i++) {
      const event = this.gameEvents[i];
      const isRecent = i >= recentStart;
      lines.push(isRecent ? this.formatEventDetailed(event) : this.formatEventCompressed(event));
    }

    return `SITUATION LOG:\n${lines.map(l => `- ${l}`).join("\n")}`;
  }

  runPlatoonAudit(state: GameState, relationships: SoldierRelationship[]): PlatoonAudit {
    const caps = state.capabilities;
    const active = state.roster.filter(s => s.status === "active");
    const roles = new Set(active.map(s => s.role));

    const criticalRisks: string[] = [];
    if (!caps.canSuppress) criticalRisks.push("No suppressive fire capability");
    if (!caps.canTreatWounded) criticalRisks.push("No medical capability — wounded will deteriorate");
    if (!caps.hasNCO) criticalRisks.push("No NCO — leadership gap");
    if (state.ammo < 20) criticalRisks.push("Critically low ammunition");
    if (state.morale < 30) criticalRisks.push("Dangerously low morale");

    const personnelGaps: string[] = [];
    if (!roles.has("medic")) personnelGaps.push("No medic");
    if (!roles.has("radioman")) personnelGaps.push("No radioman");
    if (!roles.has("BAR_gunner") && !roles.has("MG_gunner")) personnelGaps.push("No automatic weapons");

    const relationshipStatus = relationships
      .filter(r => {
        const s1 = active.find(s => s.id === r.soldierId);
        const s2 = active.find(s => s.id === r.targetId);
        return s1 && s2;
      })
      .map(r => `${r.soldierId}-${r.targetId} (${r.type})`);

    return {
      currentCapabilities: { ...caps },
      criticalRisks,
      personnelGaps,
      relationshipStatus,
      effectiveStrength: active.length,
    };
  }

  private formatEventDetailed(event: GameEvent): string {
    switch (event.type) {
      case "scene_complete":
        return `${event.timestamp}: ${event.summary}`;
      case "decision_made":
        return `${event.timestamp}: Decision — ${event.prompt} (${event.tier}, personnel: ${event.personnelScore})`;
      case "casualty":
        return `${event.timestamp}: ${event.name} ${event.status} — ${event.cause}`;
      case "rally":
        return `${event.timestamp}: Rally — ${event.description}`;
      case "capability_change":
        return `${event.timestamp}: ${event.gained ? "Gained" : "Lost"} ${event.capability} — ${event.reason}`;
      case "intel_gained":
        return `${event.timestamp}: Intel — ${event.source}`;
      case "trait_triggered":
        return `${event.timestamp}: ${event.soldierId} trait ${event.trait} — ${event.effect}`;
      case "relationship_moment":
        return `${event.timestamp}: ${event.soldiers.join("+")} — ${event.description}`;
      case "assignment_consequence":
        return `${event.timestamp}: ${event.soldierId} assigned ${event.task} — ${event.outcome}`;
      case "resource_snapshot":
        return `${event.timestamp}: Men:${event.men} Ammo:${event.ammo}% Morale:${event.morale} Readiness:${event.readiness}`;
    }
  }

  private formatEventCompressed(event: GameEvent): string {
    switch (event.type) {
      case "scene_complete":
        return `${event.timestamp}: ${event.summary}`;
      case "casualty":
        return `${event.timestamp}: ${event.name} ${event.status}`;
      case "rally":
        return `${event.timestamp}: Rally — ${event.soldiers.join(", ")}`;
      default:
        return this.formatEventDetailed(event);
    }
  }
}
