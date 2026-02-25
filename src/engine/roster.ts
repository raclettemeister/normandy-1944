import type { Soldier, RallyEvent } from "../types/index.ts";

export const PLATOON_ROSTER: Soldier[] = [
  {
    id: "henderson",
    name: "Bill Henderson",
    nickname: "Top",
    rank: "SSgt",
    role: "platoon_sergeant",
    status: "active",
    age: 28,
    hometown: "Scranton, Pennsylvania",
    background: "Former factory foreman. Oldest man in the platoon.",
    traits: ["veteran", "steady"],
  },
  {
    id: "malone",
    name: "Frank Malone",
    nickname: "Red",
    rank: "Sgt",
    role: "NCO",
    status: "active",
    age: 24,
    hometown: "South Boston, Massachusetts",
    background: "Ex-boxer, built like a fire hydrant. Leads from the front.",
    traits: ["brave", "hothead"],
  },
  {
    id: "park",
    name: "Eddie Park",
    rank: "Sgt",
    role: "NCO",
    status: "active",
    age: 23,
    hometown: "San Francisco, California",
    background:
      "Korean-American, had to fight twice as hard for his rank. Quiet, methodical, deadly.",
    traits: ["steady", "sharpshooter"],
  },
  {
    id: "rivera",
    name: "Ray Rivera",
    nickname: "Doc",
    rank: "Cpl",
    role: "medic",
    status: "active",
    age: 22,
    hometown: "San Antonio, Texas",
    background: "Wanted to be a doctor. Gentle hands, steel nerves under fire.",
    traits: ["brave", "steady"],
  },
  {
    id: "kowalski",
    name: "Walt Kowalski",
    rank: "Cpl",
    role: "BAR_gunner",
    status: "active",
    age: 21,
    hometown: "Detroit, Michigan",
    background:
      "Polish-American, built like an ox. Carries the BAR like other men carry rifles.",
    traits: ["loyal", "steady"],
  },
  {
    id: "davis",
    name: "Tommy Davis",
    rank: "Cpl",
    role: "radioman",
    status: "active",
    age: 20,
    hometown: "Nashville, Tennessee",
    background:
      "Former telegraph operator. Funny, keeps the men laughing. Carries 30 pounds of radio without complaining.",
    traits: ["loud_mouth", "lucky"],
  },
  {
    id: "doyle",
    name: "James Doyle",
    nickname: "Jimmy",
    rank: "PFC",
    role: "rifleman",
    status: "active",
    age: 19,
    hometown: "Boise, Idaho",
    background: "Farm kid, youngest in the platoon. Eager, scared, trying to prove himself.",
    traits: ["green", "brave"],
  },
  {
    id: "webb",
    name: "Charlie Webb",
    rank: "PFC",
    role: "rifleman",
    status: "active",
    age: 21,
    hometown: "Atlanta, Georgia",
    background:
      "Smooth talker, always has a cigarette. Looks lazy but has the best eyes in the platoon.",
    traits: ["sharpshooter", "scrounger"],
  },
  {
    id: "ellis",
    name: "Harold Ellis",
    nickname: "Harry",
    rank: "PFC",
    role: "rifleman",
    status: "active",
    age: 20,
    hometown: "Philadelphia, Pennsylvania",
    background:
      "Nervous, intellectual, reads books in his foxhole. Joined because he felt he had to.",
    traits: ["green", "quiet"],
  },
  {
    id: "washington",
    name: "Leon Washington",
    rank: "PFC",
    role: "rifleman",
    status: "active",
    age: 22,
    hometown: "Chicago, Illinois",
    background: "Street-smart, tough, grew up hard. Doesn't scare easy.",
    traits: ["veteran", "resourceful"],
  },
  {
    id: "caruso",
    name: "Vincent Caruso",
    nickname: "Vinnie",
    rank: "PFC",
    role: "rifleman",
    status: "active",
    age: 20,
    hometown: "Brooklyn, New York",
    background:
      "Loud, brash, talks constantly. Drives the sergeants crazy but the privates love him.",
    traits: ["loud_mouth", "brave"],
  },
  {
    id: "mitchell",
    name: "Robert Mitchell",
    nickname: "Bobby",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 19,
    hometown: "Small-town Oklahoma",
    background:
      "Quiet, polite, writes letters to his mother every day. Dead shot with a rifle.",
    traits: ["sharpshooter", "quiet"],
  },
  {
    id: "novak",
    name: "Thomas Novak",
    nickname: "Big Tom",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 23,
    hometown: "Pittsburgh, Pennsylvania",
    background:
      "6'4\", former steelworker. Carries ammunition for Kowalski. Simple, dependable, strong as an ox.",
    traits: ["loyal", "steady"],
  },
  {
    id: "sullivan",
    name: "Eugene Sullivan",
    nickname: "Gene",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 20,
    hometown: "Worcester, Massachusetts",
    background:
      "Irish-Catholic, prays before every mission. Superstitious but dependable.",
    traits: ["steady", "lucky"],
  },
  {
    id: "bergman",
    name: "Arthur Bergman",
    nickname: "Art",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 21,
    hometown: "Milwaukee, Wisconsin",
    background:
      "German-American, sensitive about it. Speaks some German, which could be useful.",
    traits: ["resourceful", "quiet"],
  },
  {
    id: "jenkins",
    name: "Floyd Jenkins",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 22,
    hometown: "Rural Mississippi",
    background:
      "Former hunting guide. Knows the outdoors better than anyone. Excellent tracker.",
    traits: ["sharpshooter", "scrounger"],
  },
  {
    id: "herrera",
    name: "Daniel Herrera",
    nickname: "Danny",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 19,
    hometown: "Albuquerque, New Mexico",
    background: "Fast runner, former track star. Skinny, wiry, never stops moving.",
    traits: ["brave", "green"],
  },
  {
    id: "palmer",
    name: "Curtis Palmer",
    nickname: "Curt",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 20,
    hometown: "Dayton, Ohio",
    background:
      "The complainer. Bitches about everything. But when the bullets fly, he fights.",
    traits: ["coward", "unlucky"],
  },
];

export function getRallyOrder(): RallyEvent[] {
  const byId = (id: string) => {
    const s = PLATOON_ROSTER.find((r) => r.id === id);
    if (!s) throw new Error(`Unknown soldier: ${id}`);
    return { ...s };
  };

  return [
    {
      soldiers: [byId("henderson")],
      ammoGain: 8,
      moraleGain: 8,
      narrative:
        'You hear a cricket clicker — one click-clack. You respond with two. SSgt. Henderson emerges from the hedgerow. "Captain. Glad to see you, sir." The relief in his voice is obvious. Your platoon sergeant is alive.',
    },
    {
      soldiers: [byId("malone"), byId("doyle")],
      ammoGain: 10,
      moraleGain: 5,
      narrative:
        'Sgt. Malone appears with PFC Doyle in tow. The kid looks terrified but Malone has him moving. "Found this one tangled in his chute half a mile back," Malone says. "He\'ll be fine." Doyle nods, gripping his rifle with white knuckles.',
    },
    {
      soldiers: [byId("park"), byId("webb"), byId("ellis")],
      ammoGain: 12,
      moraleGain: 6,
      narrative:
        "Sgt. Park has already organized a small group. Webb and Ellis were hiding behind a stone wall when Park found them. Park has them kitted up and ready. Webb even managed to scrounge extra clips from an abandoned equipment bundle.",
    },
    {
      soldiers: [byId("rivera"), byId("kowalski")],
      ammoGain: 15,
      moraleGain: 7,
      narrative:
        'Doc Rivera and Kowalski come in together. Kowalski has the BAR slung across his back and two bandoliers across his chest. Rivera is already checking the men for injuries. "Anyone hurt? Let me see those hands." Having the BAR and a medic changes everything.',
    },
    {
      soldiers: [byId("davis"), byId("caruso")],
      ammoGain: 8,
      moraleGain: 6,
      narrative:
        "You hear Caruso before you see him — the man can't whisper to save his life. Davis is behind him, hunched under the weight of the SCR-300 radio. It survived the drop. You have comms.",
    },
    {
      soldiers: [byId("washington"), byId("mitchell"), byId("sullivan")],
      ammoGain: 10,
      moraleGain: 5,
      narrative:
        "Three men emerge from a drainage ditch. Washington has point — he's been leading Mitchell and Sullivan through the fields for an hour. Mitchell hasn't said a word. Sullivan crosses himself when he sees the group. \"Thank God,\" he whispers.",
    },
    {
      soldiers: [byId("novak"), byId("bergman"), byId("jenkins")],
      ammoGain: 12,
      moraleGain: 5,
      narrative:
        "Novak comes in carrying half the platoon's spare ammo on his back. Bergman found a supply bundle in a flooded field — Jenkins tracked it by the parachute silk caught in a tree. Between the three of them, they've got a small arsenal.",
    },
    {
      soldiers: [byId("herrera"), byId("palmer")],
      ammoGain: 5,
      moraleGain: 3,
      narrative:
        'Last to arrive: Herrera and Palmer. Herrera ran all the way from the next field over. Palmer looks pale and shaken. "We heard shooting," Palmer says. "Thought it was Germans." Herrera shakes his head. "That was us, genius." Not everyone is happy to be here, but everyone is here.',
    },
  ];
}
