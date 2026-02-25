import type { SoldierRelationship } from '../types';

const RELATIONSHIPS: SoldierRelationship[] = [
  {
    soldierId: "henderson", targetId: "doyle", type: "protective",
    detail: "Trained him personally at Toccoa. Promised his mother he'd bring him home.",
  },
  {
    soldierId: "malone", targetId: "caruso", type: "rivalry",
    detail: "Boston vs. Brooklyn. They argue about everything. Inseparable.",
  },
  {
    soldierId: "kowalski", targetId: "novak", type: "brothers",
    detail: "BAR team. Work as one unit. Novak carries Kowalski's extra ammo.",
  },
  {
    soldierId: "park", targetId: "webb", type: "depends_on",
    detail: "Park uses Webb as his eyes. Webb spots, Park shoots.",
  },
  {
    soldierId: "rivera", targetId: "everyone", type: "protective",
    detail: "Doc treats everyone. Losing Doc is losing hope.",
  },
  {
    soldierId: "palmer", targetId: "malone", type: "resents",
    detail: "Malone calls Palmer a coward to his face. Palmer hates him for it.",
  },
  {
    soldierId: "doyle", targetId: "ellis", type: "brothers",
    detail: "Both green, both scared. They stick together because nobody else will.",
  },
  {
    soldierId: "washington", targetId: "henderson", type: "rivalry",
    detail: "Washington's seen real danger. Respects Henderson but thinks he's too cautious.",
  },
];

export function getRelationships(): SoldierRelationship[] {
  return RELATIONSHIPS;
}

export function getRelationshipsForSoldier(soldierId: string): SoldierRelationship[] {
  return RELATIONSHIPS.filter(r => r.soldierId === soldierId || r.targetId === soldierId);
}

export function getActiveRelationships(activeSoldierIds: string[]): SoldierRelationship[] {
  return RELATIONSHIPS.filter(r => {
    if (r.targetId === "everyone") return activeSoldierIds.includes(r.soldierId);
    return activeSoldierIds.includes(r.soldierId) && activeSoldierIds.includes(r.targetId);
  });
}
