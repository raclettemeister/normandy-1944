import type { SoldierRelationship } from '../types';

const RELATIONSHIPS: SoldierRelationship[] = [
  {
    soldierId: "henderson", targetId: "doyle", type: "protective",
    detail: "L'a entraine personnellement a Toccoa. A promis a sa mere de le ramener.",
  },
  {
    soldierId: "malone", targetId: "caruso", type: "rivalry",
    detail: "Boston contre Brooklyn. Ils se disputent sur tout. Inseparables.",
  },
  {
    soldierId: "kowalski", targetId: "novak", type: "brothers",
    detail: "Equipe BAR. Travaillent comme une seule unite. Novak porte les munitions en plus de Kowalski.",
  },
  {
    soldierId: "park", targetId: "webb", type: "depends_on",
    detail: "Park utilise Webb comme ses yeux. Webb repere, Park tire.",
  },
  {
    soldierId: "rivera", targetId: "everyone", type: "protective",
    detail: "Doc soigne tout le monde. Perdre Doc c'est perdre l'espoir.",
  },
  {
    soldierId: "palmer", targetId: "malone", type: "resents",
    detail: "Malone traite Palmer de froussard en face. Palmer le hait pour ca.",
  },
  {
    soldierId: "doyle", targetId: "ellis", type: "brothers",
    detail: "Tous deux bleus, tous deux effrayes. Ils restent ensemble car personne d'autre ne le fera.",
  },
  {
    soldierId: "washington", targetId: "henderson", type: "rivalry",
    detail: "Washington a vu le vrai danger. Respecte Henderson mais le trouve trop prudent.",
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
