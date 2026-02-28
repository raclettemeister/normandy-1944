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
    background: "Ancien contremaitre d'usine. Le plus age du peloton.",
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
    background: "Ex-boxeur, bati comme une borne incendie. Mene depuis l'avant.",
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
      "Coreen-Americain, a du se battre deux fois plus pour son grade. Calme, methodique, mortel.",
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
    background: "Voulait etre medecin. Mains douces, nerfs d'acier sous le feu.",
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
      "Polonais-Americain, bati comme un boeuf. Porte le BAR comme les autres portent leur fusil.",
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
      "Ancien telegraphiste. Drole, fait rire les hommes. Porte 30 livres de radio sans se plaindre.",
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
    background: "Fils de fermier, le plus jeune du peloton. Avide, effraye, essaie de prouver sa valeur.",
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
      "Bavard, a toujours une cigarette. A l'air paresseux mais a les meilleurs yeux du peloton.",
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
      "Nerveux, intellectuel, lit des livres dans son trou. S'est engage parce qu'il sentait qu'il devait.",
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
    background: "Debrouillard, dur, a grandi dans la difficulte. Ne s'effraie pas facilement.",
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
      "Bruyant, fanfaron, parle sans arret. Rend les sergents fous mais les soldats l'adorent.",
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
      "Calme, poli, ecrit a sa mere chaque jour. Tireur d'elite au fusil.",
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
      "1m93, ancien siderurgiste. Porte les munitions pour Kowalski. Simple, fiable, fort comme un boeuf.",
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
      "Irlandais-catholique, prie avant chaque mission. Superstitieux mais fiable.",
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
      "Germano-Americain, sensible a ce sujet. Parle un peu allemand, ce qui pourrait servir.",
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
      "Ancien guide de chasse. Connait la nature mieux que quiconque. Excellent pisteur.",
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
    background: "Coureur rapide, ancien star du sprint. Mince, nerveux, ne s'arrete jamais.",
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
      "Le raleur. Se plaint de tout. Mais quand les balles sifflent, il se bat.",
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
        'Vous entendez un clicker cricket — un clic-clac. Vous repondez par deux. Le SSgt Henderson emerge de la haie. "Mon capitaine. Content de vous voir, monsieur." Le soulagement dans sa voix est evident. Votre sergent de peloton est vivant.',
    },
    {
      soldiers: [byId("malone"), byId("doyle")],
      ammoGain: 10,
      moraleGain: 5,
      narrative:
        'Le Sgt Malone apparait avec le PFC Doyle a la remorque. Le gamin a l\'air terrifie mais Malone le fait avancer. "Trouve celui-la emmele dans son parachute a un demi-mille," dit Malone. "Il ira bien." Doyle hoche la tete, serrant son fusil a blanc.',
    },
    {
      soldiers: [byId("park"), byId("webb"), byId("ellis")],
      ammoGain: 12,
      moraleGain: 6,
      narrative:
        "Le Sgt Park a deja organise un petit groupe. Webb et Ellis se cachaient derriere un mur de pierre quand Park les a trouves. Park les a equipes et prets. Webb a meme reussi a recuperer des chargeurs supplementaires d'un paquet d'equipement abandonne.",
    },
    {
      soldiers: [byId("rivera"), byId("kowalski")],
      ammoGain: 15,
      moraleGain: 7,
      narrative:
        'Doc Rivera et Kowalski arrivent ensemble. Kowalski a le BAR en bandouliere et deux bandoulieres sur la poitrine. Rivera examine deja les hommes pour les blessures. "Des blesses? Montrez-moi ces mains." Avoir le BAR et un medecin change tout.',
    },
    {
      soldiers: [byId("davis"), byId("caruso")],
      ammoGain: 8,
      moraleGain: 6,
      narrative:
        "Vous entendez Caruso avant de le voir — l'homme ne peut pas chuchoter pour sauver sa vie. Davis est derriere lui, courbe sous le poids de la radio SCR-300. Elle a survecu au saut. Vous avez les communications.",
    },
    {
      soldiers: [byId("washington"), byId("mitchell"), byId("sullivan")],
      ammoGain: 10,
      moraleGain: 5,
      narrative:
        "Trois hommes emergent d'un fosse de drainage. Washington est en tete — il mene Mitchell et Sullivan a travers les champs depuis une heure. Mitchell n'a pas dit un mot. Sullivan se signe en voyant le groupe. \"Merci mon Dieu,\" murmure-t-il.",
    },
    {
      soldiers: [byId("novak"), byId("bergman"), byId("jenkins")],
      ammoGain: 12,
      moraleGain: 5,
      narrative:
        "Novak arrive en portant la moitie des munitions de reserve du peloton sur son dos. Bergman a trouve un paquet de ravitaillement dans un champ inonde — Jenkins l'a suivi par la soie du parachute accrochee a un arbre. A eux trois, ils ont un petit arsenal.",
    },
    {
      soldiers: [byId("herrera"), byId("palmer")],
      ammoGain: 5,
      moraleGain: 3,
      narrative:
        'Derniers a arriver: Herrera et Palmer. Herrera a couru tout le chemin depuis le champ voisin. Palmer a l\'air pale et secoue. "On a entendu des tirs," dit Palmer. "On a cru que c\'etait les Allemands." Herrera secoue la tete. "C\'etait nous, genie." Tout le monde n\'est pas content d\'etre la, mais tout le monde est la.',
    },
  ];
}
