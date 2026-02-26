import type { WikiEntry, WikiCategory } from "../types/index.ts";

export const WIKI_ENTRIES: WikiEntry[] = [
  // ─── Operation ────────────────────────────────────────────────────

  {
    id: "operation_overlord",
    term: "Operation Overlord",
    category: "operation",
    shortDescription: "L'invasion alliee de Normandie, 6 juin 1944.",
    fullDescription:
      "Operation Overlord est le nom de code de l'invasion alliee de la France occupee par l'Allemagne. L'assaut debute par des parachutages aux premieres heures du 6 juin, suivis de debarquements amphibies sur cinq plages. Votre zone de saut est a l'interieur des terres depuis Utah Beach, derriere le Mur de l'Atlantique.",
    alwaysAvailable: true,
  },
  {
    id: "d_day_timeline",
    term: "Chronologie du Jour J",
    category: "operation",
    shortDescription: "Horaires cles pour la 101st Airborne le Jour J.",
    fullDescription:
      "0015–0200: Sauts des pathfinders et du corps principal. Parachutistes disperses par la DCA et la couverture nuageuse. 0400: Delai de rassemblement — rallier les marqueurs d'unite. 0630: H-Hour, debarquements sur les plages. 0900: Securiser les carrefours et chaussees cles. 1200: Liaison avec les elements de plage pour le ravitaillement. 1800: Relieve par la 4th Infantry Division prevue.",
    tacticalNote: "Chaque heure perdue est une heure que l'ennemi consacre a s'organiser.",
    alwaysAvailable: true,
  },
  {
    id: "mission_objectives",
    term: "Objectifs de mission",
    category: "operation",
    shortDescription: "Objectifs assignes au 2e peloton pour le Jour J.",
    fullDescription:
      "Primaire: Securiser le carrefour de Ste-Mere-Eglise pour bloquer les renforts allemands vers les plages. Secondaire: Detruire les lignes de communication le long du reseau routier. Tertiaire: Faire liaison avec les forces debarquees avançant vers l'interieur depuis Utah Beach. L'echec a tenir le carrefour permet aux blindes ennemis d'atteindre les plages.",
    alwaysAvailable: true,
  },

  // ─── Your Unit ────────────────────────────────────────────────────

  {
    id: "101st_airborne",
    term: "101st Airborne Division",
    category: "your_unit",
    shortDescription: "Les Screaming Eagles — l'elite aeroportee americaine.",
    fullDescription:
      "Activee en 1942, la 101st Airborne Division est entrainee pour l'assaut parachute et planeur derriere les lignes ennemies. La mission de la division le Jour J est de securer le flanc ouest d'Utah Beach en prenant les jonctions et ponts routiers cles. Votre regiment, le 506th PIR, mene l'assaut.",
    alwaysAvailable: true,
  },
  {
    id: "easy_company",
    term: "Easy Company, 506th PIR",
    category: "your_unit",
    shortDescription: "Votre compagnie. Le 2e peloton est votre responsabilite.",
    fullDescription:
      "Easy Company fait partie du 2e bataillon, 506th Parachute Infantry Regiment. Vous commandez le 2e peloton — 18 hommes organises en trois escouades. Chaque homme est qualifie saut. La plupart n'ont jamais ete sous le feu. Votre sergent de peloton est le seul veteran de combat.",
    alwaysAvailable: true,
  },
  {
    id: "chain_of_command",
    term: "Chaine de commandement",
    category: "your_unit",
    shortDescription: "Qui rend compte a qui, et ce qui se passe quand la chaine se brise.",
    fullDescription:
      "Vous etes le chef de peloton. Votre sergent de peloton est votre second. En dessous, trois chefs d'escouade (caporaux ou sergents) dirigent chacun une equipe. Si vous etes tue, le sergent de peloton prend le commandement. Si les deux sont hors combat, le sous-officier le plus ancien prend la tete. Dans le chaos d'un saut de nuit, la chaine se brise souvent avant meme que le combat ne commence.",
    alwaysAvailable: true,
  },

  // ─── Weapons & Equipment ──────────────────────────────────────────

  {
    id: "m1_garand",
    term: "M1 Garand",
    category: "weapons_equipment",
    shortDescription: "Fusil semi-automatique reglementaire, calibre .30.",
    fullDescription:
      "Le M1 Garand tire des cartouches .30-06 depuis un chargeur en-bloc de 8 cartouches. Semi-automatique — une pression sur la detente, un coup. Efficace jusqu'a 500 yards mais la plupart des combats se font a moins de 100. Le 'ping' caracteristique a l'ejection du chargeur indique a tous que vous etes vide. Fiable, precis, lourd.",
    tacticalNote: "Chaque fusilier en porte un. Votre base de feu.",
    alwaysAvailable: true,
  },
  {
    id: "bar",
    term: "Browning Automatic Rifle (BAR)",
    category: "weapons_equipment",
    shortDescription: "Arme automatique d'escouade. Chargeur 20 coups, capable en full-auto.",
    fullDescription:
      "Le BAR fournit le feu de suppression au niveau de l'escouade. Tire le meme .30-06 que le Garand mais en entierement automatique. Chargeur de 20 coups signifie rechargements frequents. Lourd a 19 livres. Le tireur BAR est le membre le plus precieux de l'equipe de feu — et la premiere cible que l'ennemi cherche.",
    tacticalNote: "La suppression maintient les tetes ennemies baissees. Sans BAR, on ne peut pas manoeuvrer.",
    alwaysAvailable: true,
  },
  {
    id: "mg42",
    term: "MG 42",
    category: "weapons_equipment",
    shortDescription: "Mitrailleuse allemande. 1 200 coups par minute.",
    fullDescription:
      "Le MG 42 tire si vite que ses coups individuels se fondent en un son continu de dechirure — « la scie de Hitler ». Alimentation par bande, 1 200 c/min, efficace jusqu'a 1 000 yards. Une seule position MG 42 peut clouer un peloton entier. Vous ne le surpasserez pas au tir. Il faut le contourner ou le supprimer et reduire la distance.",
    tacticalNote: "Si vous entendez la scie, mettez-vous a couvert. Puis trouvez ou elle est.",
    alwaysAvailable: true,
  },

  // ─── Enemy Forces ─────────────────────────────────────────────────

  {
    id: "german_garrison",
    term: "Troupes de garrison allemandes",
    category: "enemy_forces",
    shortDescription: "Unites de defense statique gardant le Mur de l'Atlantique.",
    fullDescription:
      "Les troupes de garrison en Normandie sont un melange de veterans en convalescence du front de l'Est, d'Ost-Truppen (conscrits des territoires occupes) et d'unites de l'arriere. La qualite varie enormement — certains se rendront au premier contact, d'autres sont des survivants endureis du front de l'Est qui combattent jusqu'a la derniere cartouche.",
    alwaysAvailable: true,
  },
  {
    id: "german_patrols",
    term: "Patrouilles allemandes",
    category: "enemy_forces",
    shortDescription: "Groupes de recherche mobiles traquant les parachutistes disperses.",
    fullDescription:
      "Apres les parachutages, le commandement allemand envoie des patrouilles balayer la campagne pour les parachutistes isoles. Typiquement 4-8 hommes, menes par un sous-officier, se deplacant le long des routes et haies. Ils utilisent des fusees et mots de passe. Ils savent que vous etes la — ils ne savent juste pas ou.",
    alwaysAvailable: false,
    unlockedBy: ["scene03_first_contact"],
  },
  {
    id: "german_mg_positions",
    term: "Positions MG allemandes",
    category: "enemy_forces",
    shortDescription: "Nids de mitrailleuses pre-positionnes couvrant le terrain cle.",
    fullDescription:
      "Les Allemands positionnent les MG 42 pour couvrir les routes, carrefours et terrain decouvert. Les positions sont enterrees avec couverture overhead et champs de tir croises. Approcher de face est suicide. Cherchez le terrain mort, le defile et les routes de contournement. Si une arme ouvre le feu, attendez-vous a une autre qui la couvre.",
    alwaysAvailable: false,
    unlockedBy: ["scene06_the_farmhouse", "scene07_the_road"],
  },

  // ─── Terrain & Landmarks ──────────────────────────────────────────

  {
    id: "bocage",
    term: "Bocage",
    category: "terrain_landmarks",
    shortDescription: "Terrain de haies denses qui definit le champ de bataille normand.",
    fullDescription:
      "Le bocage est un patchwork de petits champs delimites par d'anciennes haies — talus de terre surmontes de broussailles et arbres denses, souvent 6 pieds de haut. Chaque champ est une position defensive naturelle. La visibilite se mesure en yards, pas en miles. Les blindes ne peuvent pas traverser. L'infanterie combat champ par champ. Cela favorise le defenseur.",
    tacticalNote: "Utilisez les haies pour le camouflage, mais rappelez-vous que l'ennemi les connait mieux.",
    alwaysAvailable: true,
  },
  {
    id: "flooded_fields",
    term: "Champs inondes",
    category: "terrain_landmarks",
    shortDescription: "Basses terres deliberement inondees derriere les plages.",
    fullDescription:
      "Les Allemands ont inonde les champs bas en barrant les ruisseaux et en ouvrant les vannes. L'eau va de la cheville a la poitrine. L'equipement coule, le mouvement ralentit au pas, et des parachutistes charges d'equipement se sont noyes dans l'obscurite. Le son porte sur l'eau.",
    alwaysAvailable: false,
    unlockedBy: ["scene01_landing"],
  },
  {
    id: "the_church",
    term: "L'eglise",
    category: "terrain_landmarks",
    shortDescription: "Eglise en pierre visible au-dessus des haies — point de repere de navigation.",
    fullDescription:
      "Une eglise normande en pierre avec un haut clocher, visible au-dessus du bocage sur un demi-mille. Sert de point de rassemblement et d'aide a la navigation. Le cimetiere offre une couverture dure. Le clocher offre l'observation mais vous rend aussi visible. Les Allemands savent que vous irez vers les points de repere — attendez-vous a ce qu'ils le surveillent.",
    alwaysAvailable: false,
    unlockedBy: ["scene02_finding_north"],
  },

  // ─── Tactics Learned ──────────────────────────────────────────────

  {
    id: "assess_before_acting",
    term: "Evaluer avant d'agir",
    category: "tactics_learned",
    shortDescription: "Arretez. Regardez. Ecoutez. Pensez. Puis bougez.",
    fullDescription:
      "L'instinct sous le feu est d'agir immediatement. Mais les secondes passees a observer — compter les eclats de bouche, lire le terrain, verifier vos flancs — sauvent des vies. Une mauvaise decision prise vite reste une mauvaise decision. Prenez le temps. Evaluez la situation. Puis engagez-vous.",
    tacticalNote: "La premiere chose a faire dans toute nouvelle situation est rien. Observez d'abord.",
    alwaysAvailable: false,
    unlockedBy: ["assess_before_acting"],
  },
  {
    id: "dead_reckoning",
    term: "Estime au compas",
    category: "tactics_learned",
    shortDescription: "Naviguer par comptage de pas, boussole et elements du terrain.",
    fullDescription:
      "Quand vous ne voyez pas les points de repere, naviguez par estime: fixez un cap au compas, comptez les pas et suivez votre position sur la carte. Tenez compte des obstacles qui forcent des detours. Dans la campagne normande obscure, une boussole et un comptage de pas regulier font la difference entre atteindre votre objectif et tomber dans une embuscade.",
    tacticalNote: "Faites confiance a votre boussole plutot qu'a vos instincts. L'obscurite vous ment.",
    alwaysAvailable: false,
    unlockedBy: ["dead_reckoning"],
  },
  {
    id: "supply_discipline",
    term: "Discipline des approvisionnements",
    category: "tactics_learned",
    shortDescription: "Les munitions sont limitees. Chaque coup compte.",
    fullDescription:
      "Un parachutiste porte ce avec quoi il a saute — pas de ravitaillement avant la liaison. Chaque rafale, chaque grenade, chaque bandage est irremplacable jusqu'a ce que les plages soient securisees. Economisez les munitions. Priorisez les tirs vises. Recuperez les approvisionnements ennemis quand possible. Etre a sec au contact est une condamnation a mort.",
    tacticalNote: "Comptez vos cartouches. Faites-les compter.",
    alwaysAvailable: false,
    unlockedBy: ["supply_discipline"],
  },
  {
    id: "recognition_signals",
    term: "Signaux de reconnaissance",
    category: "tactics_learned",
    shortDescription: "Flash-thunder. La mauvaise reponse vous fait tirer dessus.",
    fullDescription:
      "Dans l'obscurite, chaque forme peut etre amie ou ennemie. La 101st utilise des signaux defi-reponse et un clicker cricket pour la reconnaissance rapprochee. Flash recoit « Thunder ». Un clic recoit deux clics en retour. Utilisez-les. L'alternative est le fratricide — et en Normandie, plus de parachutistes meurent du feu ami que personne ne l'admet.",
    tacticalNote: "Defiez d'abord. Toujours. Meme quand vous etes sur.",
    alwaysAvailable: false,
    unlockedBy: ["recognition_signals"],
  },
  {
    id: "identify_before_engaging",
    term: "Identifier avant d'engager",
    category: "tactics_learned",
    shortDescription: "Connaissez votre cible. Le feu ami tue tout aussi mort.",
    fullDescription:
      "Dans la confusion d'un saut de nuit, les unites amies sont dispersees partout. Cette silhouette dans la haie pourrait etre allemande — ou un parachutiste d'un autre stick. L'identification positive avant d'ouvrir le feu n'est pas optionnelle. Les quelques secondes pour confirmer une cible sauvent des vies des deux cotes.",
    alwaysAvailable: false,
    unlockedBy: ["identify_before_engaging"],
  },
  {
    id: "rally_procedures",
    term: "Procedures de rassemblement",
    category: "tactics_learned",
    shortDescription: "Comment rassembler des hommes disperses en force de combat.",
    fullDescription:
      "Apres un saut disperse, le rassemblement est la survie. Deplacez-vous vers le point de repere le plus proche. Utilisez les signaux de reconnaissance. Etablissez un perimetre. Comptez le personnel et l'equipement. Attribuez les roles selon qui vous avez, pas qui vous attendiez. Un peloton improvise d'inconnus vaut mieux qu'etre seul. Mais rassemblez vite — l'ennemi s'organise aussi.",
    alwaysAvailable: false,
    unlockedBy: ["rally_procedures"],
  },
  {
    id: "ambush_doctrine",
    term: "Doctrine d'embuscade",
    category: "tactics_learned",
    shortDescription: "Comment tendre et survivre a une embuscade.",
    fullDescription:
      "Une embuscade est la violence de l'action au moment et au lieu de votre choix. Choisissez une zone de mort avec des voies de fuite limitees. Positionnez votre base de feu pour couvrir la zone. L'element d'assaut contourne. Signal pour lancer. Frappez fort, frappez vite, puis repliez-vous avant que l'ennemi ne reagisse. Si vous etes pris dans une embuscade: ripostez immediatement, cherchez un abri et rompez le contact.",
    tacticalNote: "L'embuscade est gagnee ou perdue avant le premier coup.",
    alwaysAvailable: false,
    unlockedBy: ["ambush_doctrine"],
  },
  {
    id: "tactical_patience",
    term: "Patience tactique",
    category: "tactics_learned",
    shortDescription: "Parfois le meilleur mouvement est d'attendre.",
    fullDescription:
      "Tous les contacts ne requierent pas une action immediate. Parfois une patrouille passera. Parfois l'ennemi revelera ses positions si vous etes patient. Se precipiter brule des munitions, risque des pertes et alerte chaque Allemand a portee de voix. La patience est une arme — utilisez-la quand le temps le permet.",
    alwaysAvailable: false,
    unlockedBy: ["tactical_patience"],
  },
  {
    id: "stealth_operations",
    term: "Operations furtives",
    category: "tactics_learned",
    shortDescription: "Bougez invisible. Frappez sans avertissement.",
    fullDescription:
      "Dans l'obscurite, la furtivite est votre plus grand avantage. Bougez lentement. Evitez les routes et le terrain decouvert. Utilisez le terrain pour masquer le son et la silhouette. Communiquez par signes de la main, pas a voix. Un peloton qui atteint son objectif non detecte a deja gagne la moitie du combat. Une fois compromis, la vitesse remplace la furtivite — mais commencez toujours en silence.",
    alwaysAvailable: false,
    unlockedBy: ["stealth_operations"],
  },
  {
    id: "positive_identification",
    term: "Identification positive",
    category: "tactics_learned",
    shortDescription: "Confirmez ce que vous regardez avant d'agir.",
    fullDescription:
      "Une forme dans l'obscurite. Un bruit dans la haie. Votre instinct dit « ennemi ». Mais l'instinct se trompe assez souvent pour compter. L'identification positive signifie confirmer la cible par defi-reponse, confirmation visuelle ou indicateurs ennemis connus (equipement, langue, mode de deplacement). Agissez sur la certitude, pas l'hypothese.",
    alwaysAvailable: false,
    unlockedBy: ["positive_identification"],
  },
  {
    id: "route_selection",
    term: "Selection d'itineraire",
    category: "tactics_learned",
    shortDescription: "L'itineraire le plus rapide est rarement le plus sur.",
    fullDescription:
      "Les routes sont rapides mais exposees — l'ennemi les surveille. Les champs ouverts offrent la vitesse mais pas de couverture. Les haies offrent le camouflage mais vous ralentissent. Selectionnez des itineraires qui equilibrent vitesse, couverture et camouflage selon la situation tactique. Planifiez des itineraires primaire et alternatif. Ayez toujours une sortie.",
    tacticalNote: "Le chemin evident l'est aussi pour l'ennemi.",
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
