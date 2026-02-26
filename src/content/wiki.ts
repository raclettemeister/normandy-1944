import type { WikiEntry, WikiCategory } from "../types/index.ts";

export const WIKI_ENTRIES: WikiEntry[] = [
  // ─── Operation ────────────────────────────────────────────────────

  {
    id: "operation_overlord",
    term: "Operation Overlord",
    category: "operation",
    shortDescription: "The Allied invasion of Normandy, June 6 1944.",
    fullDescription:
      "Operation Overlord is the codename for the Allied invasion of German-occupied France. The assault begins with airborne drops in the early hours of June 6, followed by amphibious landings at five beaches. Your drop zone is inland from Utah Beach, behind the Atlantic Wall defenses.",
    alwaysAvailable: true,
  },
  {
    id: "d_day_timeline",
    term: "D-Day Timeline",
    category: "operation",
    shortDescription: "Key timings for the 101st Airborne on D-Day.",
    fullDescription:
      "0015–0200: Pathfinder and main body drops. Paratroopers scattered by flak and cloud cover. 0400: Assembly deadline — rally on unit markers. 0630: H-Hour, beach landings commence. 0900: Secure key crossroads and causeways. 1200: Link up with beach elements for resupply. 1800: Relief from 4th Infantry Division expected.",
    tacticalNote: "Every hour you spend lost is an hour the enemy spends organizing.",
    alwaysAvailable: true,
  },
  {
    id: "mission_objectives",
    term: "Mission Objectives",
    category: "operation",
    shortDescription: "2nd Platoon's assigned objectives for D-Day.",
    fullDescription:
      "Primary: Secure the crossroads at Ste-Mère-Église to block German reinforcement to the beaches. Secondary: Destroy communication lines along the road network. Tertiary: Link up with seaborne forces moving inland from Utah Beach. Failure to hold the crossroads allows enemy armor to reach the beaches.",
    alwaysAvailable: true,
  },

  // ─── Your Unit ────────────────────────────────────────────────────

  {
    id: "101st_airborne",
    term: "101st Airborne Division",
    category: "your_unit",
    shortDescription: "The Screaming Eagles — America's airborne elite.",
    fullDescription:
      "Activated in 1942, the 101st Airborne Division is trained for parachute and glider assault behind enemy lines. The division's mission on D-Day is to secure the western flank of Utah Beach by seizing key road junctions and bridges. Your regiment, the 506th PIR, leads the assault.",
    alwaysAvailable: true,
  },
  {
    id: "easy_company",
    term: "Easy Company, 506th PIR",
    category: "your_unit",
    shortDescription: "Your company. 2nd Platoon is your responsibility.",
    fullDescription:
      "Easy Company is part of 2nd Battalion, 506th Parachute Infantry Regiment. You command 2nd Platoon — 18 men organized into three squads. Every man is jump-qualified. Most have never been under fire. Your platoon sergeant is the only combat veteran.",
    alwaysAvailable: true,
  },
  {
    id: "chain_of_command",
    term: "Chain of Command",
    category: "your_unit",
    shortDescription: "Who reports to whom, and what happens when the chain breaks.",
    fullDescription:
      "You are the platoon leader. Your platoon sergeant is your second-in-command. Below them, three squad leaders (Corporals or Sergeants) each run a team. If you are killed, the platoon sergeant takes command. If both are down, the senior NCO leads. In the chaos of a night drop, the chain often breaks before the fight even starts.",
    alwaysAvailable: true,
  },

  // ─── Weapons & Equipment ──────────────────────────────────────────

  {
    id: "m1_garand",
    term: "M1 Garand",
    category: "weapons_equipment",
    shortDescription: "Standard-issue semi-automatic rifle, .30 caliber.",
    fullDescription:
      "The M1 Garand fires .30-06 rounds from an 8-round en-bloc clip. Semi-automatic — one trigger pull, one shot. Effective out to 500 yards but most combat happens under 100. The distinctive 'ping' when the clip ejects tells everyone nearby you're empty. Reliable, accurate, heavy.",
    tacticalNote: "Every rifleman carries one. Your base of fire.",
    alwaysAvailable: true,
  },
  {
    id: "bar",
    term: "Browning Automatic Rifle (BAR)",
    category: "weapons_equipment",
    shortDescription: "Squad automatic weapon. 20-round magazine, full-auto capable.",
    fullDescription:
      "The BAR provides suppressive fire at the squad level. Fires the same .30-06 as the Garand but fully automatic. 20-round magazine means frequent reloads. Heavy at 19 pounds. The BAR man is the most valuable member of the fire team — and the first target the enemy looks for.",
    tacticalNote: "Suppression keeps enemy heads down. Without a BAR, you can't maneuver.",
    alwaysAvailable: true,
  },
  {
    id: "mg42",
    term: "MG 42",
    category: "weapons_equipment",
    shortDescription: "German machine gun. 1,200 rounds per minute.",
    fullDescription:
      "The MG 42 fires so fast its individual shots blur into a continuous ripping sound — 'Hitler's buzzsaw.' Belt-fed, 1,200 RPM, effective to 1,000 yards. A single MG 42 position can pin an entire platoon. You will not outshoot it. You must flank it or suppress it and close the distance.",
    tacticalNote: "If you hear the buzzsaw, get down. Then figure out where it is.",
    alwaysAvailable: true,
  },

  // ─── Enemy Forces ─────────────────────────────────────────────────

  {
    id: "german_garrison",
    term: "German Garrison Troops",
    category: "enemy_forces",
    shortDescription: "Static defense units manning the Atlantic Wall.",
    fullDescription:
      "The garrison troops in Normandy are a mix of veterans recuperating from the Eastern Front, Ost-Truppen (conscripts from occupied territories), and rear-echelon units. Quality varies wildly — some will surrender at first contact, others are hardened Eastern Front survivors who fight to the last round.",
    alwaysAvailable: true,
  },
  {
    id: "german_patrols",
    term: "German Patrols",
    category: "enemy_forces",
    shortDescription: "Roving search parties hunting scattered paratroopers.",
    fullDescription:
      "After the airborne drops, German command dispatches patrols to sweep the countryside for isolated paratroopers. Typically 4-8 men, led by an NCO, moving along roads and hedgerows. They use flares and challenge words. They know you're out there — they just don't know where.",
    alwaysAvailable: false,
    unlockedBy: ["scene03_first_contact"],
  },
  {
    id: "german_mg_positions",
    term: "German MG Positions",
    category: "enemy_forces",
    shortDescription: "Pre-sited machine gun nests covering key terrain.",
    fullDescription:
      "The Germans position MG 42s to cover roads, intersections, and open ground. Positions are dug in with overhead cover and interlocking fields of fire. Approaching frontally is suicide. Look for dead ground, defilade, and flanking routes. If one gun opens up, expect another covering it.",
    alwaysAvailable: false,
    unlockedBy: ["scene06_the_farmhouse", "scene07_the_road"],
  },

  // ─── Terrain & Landmarks ──────────────────────────────────────────

  {
    id: "bocage",
    term: "Bocage",
    category: "terrain_landmarks",
    shortDescription: "Dense hedgerow terrain that defines the Normandy battlefield.",
    fullDescription:
      "The bocage is a patchwork of small fields bounded by ancient hedgerows — earthen banks topped with dense brush and trees, often 6 feet high. Each field is a natural defensive position. Visibility is measured in yards, not miles. Armor can't push through. Infantry fights field by field. It favors the defender.",
    tacticalNote: "Use hedgerows for concealment, but remember the enemy knows them better.",
    alwaysAvailable: true,
  },
  {
    id: "flooded_fields",
    term: "Flooded Fields",
    category: "terrain_landmarks",
    shortDescription: "Deliberately inundated lowlands behind the beaches.",
    fullDescription:
      "The Germans flooded low-lying fields by damming streams and opening sluice gates. Water ranges from ankle-deep to chest-high. Equipment sinks, movement slows to a crawl, and paratroopers weighed down with gear have drowned in the dark. Sound carries across the water.",
    alwaysAvailable: false,
    unlockedBy: ["scene01_landing"],
  },
  {
    id: "the_church",
    term: "The Church",
    category: "terrain_landmarks",
    shortDescription: "Stone church visible above the hedgerows — a navigation landmark.",
    fullDescription:
      "A Norman stone church with a tall steeple, visible above the bocage for half a mile. Serves as a rally point and navigation aid. The churchyard provides hard cover. The steeple offers observation but also makes you visible. The Germans know you'll head for landmarks — expect them to watch it.",
    alwaysAvailable: false,
    unlockedBy: ["scene02_finding_north"],
  },

  // ─── Tactics Learned ──────────────────────────────────────────────

  {
    id: "assess_before_acting",
    term: "Assess Before Acting",
    category: "tactics_learned",
    shortDescription: "Stop. Look. Listen. Think. Then move.",
    fullDescription:
      "The instinct under fire is to act immediately. But seconds spent observing — counting muzzle flashes, reading terrain, checking your flanks — save lives. A bad decision made fast is still a bad decision. Take the beat. Assess the situation. Then commit.",
    tacticalNote: "The first thing you do in any new situation is nothing. Observe first.",
    alwaysAvailable: false,
    unlockedBy: ["assess_before_acting"],
  },
  {
    id: "dead_reckoning",
    term: "Dead Reckoning",
    category: "tactics_learned",
    shortDescription: "Navigate by pace count, compass, and terrain features.",
    fullDescription:
      "When you can't see landmarks, navigate by dead reckoning: set a compass bearing, count paces, and track your position on the map. Account for obstacles that force detours. In the dark Normandy countryside, a compass and a steady pace count are the difference between reaching your objective and wandering into an ambush.",
    tacticalNote: "Trust your compass over your instincts. The dark lies to you.",
    alwaysAvailable: false,
    unlockedBy: ["dead_reckoning"],
  },
  {
    id: "supply_discipline",
    term: "Supply Discipline",
    category: "tactics_learned",
    shortDescription: "Ammunition is finite. Every round counts.",
    fullDescription:
      "A paratrooper carries what he jumped with — no resupply until link-up. Every burst of automatic fire, every grenade, every bandage is irreplaceable until the beaches are secured. Conserve ammunition. Prioritize aimed shots. Recover enemy supplies when possible. Running dry in contact is a death sentence.",
    tacticalNote: "Count your rounds. Make them count.",
    alwaysAvailable: false,
    unlockedBy: ["supply_discipline"],
  },
  {
    id: "recognition_signals",
    term: "Recognition Signals",
    category: "tactics_learned",
    shortDescription: "Flash-thunder. The wrong answer gets you shot.",
    fullDescription:
      "In the dark, every shape could be friendly or enemy. The 101st uses challenge-and-reply signals and a cricket clicker for close recognition. Flash gets 'Thunder.' One click gets two clicks back. Use them. The alternative is fratricide — and in Normandy, more paratroopers die from friendly fire than anyone admits.",
    tacticalNote: "Challenge first. Always. Even when you're sure.",
    alwaysAvailable: false,
    unlockedBy: ["recognition_signals"],
  },
  {
    id: "identify_before_engaging",
    term: "Identify Before Engaging",
    category: "tactics_learned",
    shortDescription: "Know your target. Friendly fire kills just as dead.",
    fullDescription:
      "In the confusion of a night drop, friendly units are scattered everywhere. That silhouette in the hedgerow might be German — or it might be a paratrooper from another stick. Positive identification before opening fire is not optional. The few seconds it takes to confirm a target saves lives on both sides.",
    alwaysAvailable: false,
    unlockedBy: ["identify_before_engaging"],
  },
  {
    id: "rally_procedures",
    term: "Rally Procedures",
    category: "tactics_learned",
    shortDescription: "How to gather scattered men into a fighting force.",
    fullDescription:
      "After a scattered drop, rallying is survival. Move to the nearest landmark. Use recognition signals. Establish a perimeter. Account for personnel and equipment. Assign roles based on who you've got, not who you expected. A scratch platoon of strangers is still better than being alone. But rally fast — the enemy is organizing too.",
    alwaysAvailable: false,
    unlockedBy: ["rally_procedures"],
  },
  {
    id: "ambush_doctrine",
    term: "Ambush Doctrine",
    category: "tactics_learned",
    shortDescription: "How to set and survive an ambush.",
    fullDescription:
      "An ambush is violence of action at a time and place of your choosing. Choose a kill zone with limited escape routes. Position your base of fire to cover the kill zone. Assault element flanks. Signal to initiate. Hit hard, hit fast, then withdraw before the enemy can react. If you're caught in an ambush: return fire immediately, seek cover, and break contact.",
    tacticalNote: "The ambush is won or lost before the first shot.",
    alwaysAvailable: false,
    unlockedBy: ["ambush_doctrine"],
  },
  {
    id: "tactical_patience",
    term: "Tactical Patience",
    category: "tactics_learned",
    shortDescription: "Sometimes the best move is to wait.",
    fullDescription:
      "Not every contact requires immediate action. Sometimes a patrol will pass. Sometimes the enemy will reveal their positions if you're patient. Rushing into action burns ammo, risks casualties, and alerts every German within earshot. Patience is a weapon — use it when the clock allows.",
    alwaysAvailable: false,
    unlockedBy: ["tactical_patience"],
  },
  {
    id: "stealth_operations",
    term: "Stealth Operations",
    category: "tactics_learned",
    shortDescription: "Move unseen. Strike without warning.",
    fullDescription:
      "In the dark, stealth is your greatest advantage. Move slowly. Avoid roads and open ground. Use terrain to mask sound and silhouette. Communicate with hand signals, not voices. A platoon that reaches its objective undetected has already won half the fight. Once you're compromised, speed replaces stealth — but always start quiet.",
    alwaysAvailable: false,
    unlockedBy: ["stealth_operations"],
  },
  {
    id: "positive_identification",
    term: "Positive Identification",
    category: "tactics_learned",
    shortDescription: "Confirm what you're looking at before you act on it.",
    fullDescription:
      "A shape in the dark. A sound in the hedgerow. Your instinct says 'enemy.' But instinct is wrong often enough to matter. Positive identification means confirming the target through challenge-and-reply, visual confirmation, or known enemy indicators (equipment, language, movement pattern). Act on certainty, not assumption.",
    alwaysAvailable: false,
    unlockedBy: ["positive_identification"],
  },
  {
    id: "route_selection",
    term: "Route Selection",
    category: "tactics_learned",
    shortDescription: "The fastest route is rarely the safest.",
    fullDescription:
      "Roads are fast but exposed — the enemy watches them. Open fields offer speed but no cover. Hedgerows provide concealment but slow you down. Select routes that balance speed, cover, and concealment against the tactical situation. Plan primary and alternate routes. Always have a way out.",
    tacticalNote: "The obvious path is obvious to the enemy too.",
    alwaysAvailable: false,
    unlockedBy: ["route_selection"],
  },
];

export function getWikiEntry(id: string): WikiEntry | undefined {
  return WIKI_ENTRIES.find((e) => e.id === id);
}

export function getEntriesByCategory(category: WikiCategory): WikiEntry[] {
  return WIKI_ENTRIES.filter((e) => e.category === category);
}
