import type { Scenario } from '../../../types';
import { PLATOON_ROSTER } from '../../../engine/roster';

const byId = (id: string) => {
  const s = PLATOON_ROSTER.find(r => r.id === id);
  if (!s) throw new Error(`Unknown soldier: ${id}`);
  return { ...s };
};

// ENGINE NOTES:
// - sergeant_signal_shot should trigger a PARTIAL rally (Henderson only,
//   ammoGain: 5, moraleGain: 3) instead of the full rally below.
//   Malone and Doyle scatter and are lost for the rest of the game.
// - sergeant_avoid skips the rally entirely. No soldiers, no 2IC.
// - sergeant_rush failure inflicts a persistent captain_wounded penalty
//   (shoulder graze) that should carry through the rest of the run.
// - Decisions with longer time costs: sergeant_pebble (30 min),
//   sergeant_observe (30 min), sergeant_listen (20 min). All others are 15 min.
//   The Scenario.timeCost field only supports a single value; the engine
//   would need per-decision overrides or narrative-only time references.

export const scene04_the_sergeant: Scenario = {
  id: "act1_the_sergeant",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Mur de pierre, 30 metres de 2-3 voix. La cadence sonne americaine mais pourrait etre Ost-Bataillon ou Fallschirmjager avec equipement capture. Clicker disponible. Rassemblement potentiel avec Henderson, Malone, Doyle.",

  narrative: "Des voix de l'autre cote d'un mur de pierre. Trente metres, peut-etre moins. Deux, trois personnes — une qui donne des ordres, calme mais ferme. La cadence sonne americaine. Mais le briefing avertissait sur les troupes Ost-Bataillon avec anglais approximatif, Fallschirmjager avec equipement capture. Votre main trouve le clicker.",

  narrativeAlt: {
    low_morale: "Des voix de l'autre cote d'un mur de pierre. Proches. Vous vous mettez a genoux. La cadence pourrait etre de l'anglais — ou vous en auriez besoin. Vous etes trop epuise pour faire confiance a vos propres oreilles. Le clicker est dans votre poche de poitrine. Vos doigts sont lents a le trouver."
  },

  rally: {
    soldiers: [byId('henderson'), byId('malone'), byId('doyle')],
    ammoGain: 10,
    moraleGain: 8,
    narrative: "Henderson se leve de la haie, carabine basse. 'Capitaine.' C'est tout ce qu'il dit. Derriere lui, Malone s'accroupit avec sa Thompson, les yeux balayant l'obscurite, machoire serree comme s'il esperait que quelqu'un lui donne une raison. Doyle est a plat ventre, poings blancs sur son Garand. Le gamin ne leve pas les yeux. Trois hommes. Vos hommes. Quelque chose se detend dans votre poitrine."
  },

  decisions: [
    {
      id: "sergeant_clicker",
      text: "Utiliser le clicker depuis derriere le mur",
      tier: "excellent",
      outcome: {
        success: {
          text: "Un clic-clac. Silence — puis clic-clac, clic-clac depuis l'obscurite. Vous franchissez le mur. Henderson est la, carabine basse, regard stable. 'Capitaine,' dit-il. 'Content de vous voir, mon capitaine.'",
          context: "Defi clicker depuis couvert. Reponse appropriee. Rassemblement propre avec Henderson. Pas de bruit, pas de retard.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 8,
          readinessChange: 0
        },
        partial: {
          text: "Un clic-clac. Une longue pause. Des voix chuchotees de l'autre cote. Puis deux clics — tentatifs. Vous escaladez le mur avec precaution. Henderson a son pistolet braque sur votre poitrine jusqu'a voir votre visage. 'Capitaine. Mon Dieu.' Il baisse l'arme.",
          context: "Defi clicker, reponse hesitante. Henderson avait l'arme braquee a l'approche. Rassemblement fait mais tendu.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 6,
          readinessChange: 0
        },
        failure: {
          text: "Un clic-clac. Rien. Puis une culasse qu'on arme. La voix de Malone : 'Flash. Tout de suite.' Vous repondez 'Thunder.' Il baisse son arme. 'Je pensais que vous etiez un Boche.' Les retrouvailles sont tendues — tout le monde est sur les nerfs.",
          context: "Clicker sans reponse. Malone a failli tirer. Defi verbal a regle. Rassemblement fait mais escouade sur les nerfs.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_flash",
      text: "Crier 'Flash' depuis derriere le mur de pierre",
      tier: "sound",
      outcome: {
        success: {
          text: "'Flash.' Instantane : 'Thunder. Identifiez-vous.' La voix de Henderson — vous la reconnaitriez partout. 'Capitaine, 2e peloton.' 'Entrez, mon capitaine.' Henderson, Malone, Doyle. Vos hommes.",
          context: "Defi verbal. Reponse correcte instantanee de Henderson. Rassemblement propre avec element complet.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 6,
          readinessChange: 2
        },
        partial: {
          text: "'Flash.' Une pause qui dure une eternite. Puis : '...Thunder.' Incertain. Vous contournez le mur lentement. Henderson a sa carabine levee. Quand il vous voit, il expire. 'Capitaine. Bon sang, mon capitaine.'",
          context: "Defi verbal, reponse incertaine. Henderson avait la carabine levee. Rassemblement fait mais approche tendue.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 2
        },
        failure: {
          text: "'Flash.' 'THUNDER!' Malone le crie — assez fort pour resonner sur les haies. 'Malone, ferme-la,' siffle Henderson. Trop tard. Quelque part a l'est, une fusee monte dans le ciel. Vous avez ete repere.",
          context: "Defi verbal. Malone a crie la reponse — echo porte. Fusee allemande a l'est. Position compromise.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 5
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_rush",
      text: "Sprint vers les voix avant qu'elles ne partent",
      tier: "reckless",
      outcome: {
        success: {
          text: "Vous franchissez le mur et courez. Malone pivote — pistolet leve. Henderson lui attrape le bras. 'NE TIREZ PAS.' Vous glissez a l'arret, haletant. Henderson vous fixe. 'Avec tout le respect, mon capitaine — ne refaites jamais ca.'",
          context: "Precipite par-dessus le mur sans identification. Henderson a empeche Malone de tirer. Rassemblement fait mais presque fatal.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 3
        },
        partial: {
          text: "Vous sautez le mur. Eclair de bouche — Malone tire. La balle siffle a votre oreille. 'CESSEZ LE FEU!' Henderson plaque Malone. Doyle hurle. Quand ca se calme, personne n'est touche. Mais votre oreille bourdonne et vos mains ne s'arretent pas de trembler.",
          context: "Precipite vers le mur. Malone a tire — quasi-accident. Henderson a plaque le tireur. Pas de pertes mais escouade secouee. Signature sonore.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 6
        },
        failure: {
          // captain_wounded: persistent penalty — engine must track shoulder graze
          text: "Vous chargez par-dessus le mur. Malone tire deux fois. La douleur dechire votre epaule — vous tombez au sol. Henderson crie. Tout est chaos. La balle vous a effleure, mais le sang imbibe votre manche. Votre propre homme vous a tire dessus.",
          context: "Charge le mur sans identification. Malone a tire sur le capitaine — effleurement epaule. Blessure par tir ami. Escouade en chaos.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 8
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_pebble",
      text: "Lancer un caillou par-dessus le mur et ecouter",
      tier: "mediocre",
      // Effective timeCost: 30 min (extra 15 min for the confusion this causes)
      outcome: {
        success: {
          text: "Le caillou claque de l'autre cote du mur. Les voix se taisent. Puis : 'Qui est la? Flash.' Henderson. Vous repondez 'Thunder.' Ca marche — a juste pris plus longtemps que necessaire.",
          context: "Caillou lance. A cause une alerte mais Henderson a defie verbalement. Rassemblement fait avec retard supplementaire.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 1
        },
        partial: {
          text: "Le caillou atterrit. Silence de mort. Armes en preparation. Deux longues minutes avant un chuchotement : 'Si vous etes Americain, utilisez votre satane clicker.' Vous le faites. Henderson : 'Ca aurait ete bien de commencer par la, mon capitaine.'",
          context: "Caillou a cause un face-a-face arme de deux minutes. Du utiliser le clicker de toute facon. Rassemblement fait mais temps perdu, confiance ebranlee.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 2
        },
        failure: {
          text: "Le caillou atterrit et Malone ouvre le feu au son. Vous vous plaquez dans la terre. Henderson crie de cesser le feu. Dix minutes de chaos avant d'etablir le contact avec le clicker. Doyle pleure. Malone ne vous regarde pas.",
          context: "Caillou a declenche les tirs de Malone. Dix minutes de chaos. Rassemblement fait mais escouade traumatisee. Doyle s'effondre.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 5
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_signal_shot",
      text: "Tirer un coup en l'air pour les signaler",
      tier: "suicidal",
      // PARTIAL RALLY: Only Henderson is found. Malone and Doyle scatter
      // and are lost. Engine should override the full rally with:
      // soldiers: [henderson], ammoGain: 5, moraleGain: 3
      outcome: {
        success: {
          text: "Le coup de feu dechire la nuit. Les voix se dispersent — course dans toutes les directions. 'FLASH!' vous criez. 'THUNDER!' Henderson, cinquante metres et qui s'eloigne. Malone et Doyle ont disparu — enfuis dans le noir. Henderson vous trouve seul. 'Un coup de signal, mon capitaine? En Normandie?'",
          context: "Coup de signal a disperse tout le monde. Malone et Doyle enfuis — perdus. Seul Henderson recupere. Rassemblement partiel, munitions depensees.",
          rallyOverride: {
            soldiers: [byId('henderson')],
            ammoGain: 5,
            moraleGain: 3,
          },
          menLost: 0,
          ammoSpent: -1,
          moraleChange: -3,
          readinessChange: 10
        },
        partial: {
          text: "Le coup de feu resonne sur les haies. Pandemonium — course, cris, une voix allemande qui aboie au loin. Vous trouvez Henderson accroupi derriere le mur, seul. Malone et Doyle disperses. 'Capitaine. Je n'ai rien de gentil a dire sur ce que vous venez de faire.'",
          context: "Coup de signal a cause le pandemonium. Voix allemande au loin. Malone et Doyle disperses, perdus. Henderson seulement.",
          rallyOverride: {
            soldiers: [byId('henderson')],
            ammoGain: 5,
            moraleGain: 3,
          },
          menLost: 0,
          ammoSpent: -1,
          moraleChange: -6,
          readinessChange: 12
        },
        failure: {
          text: "Le coup de feu resonne. Une mitrailleuse ouvre le feu a trois cents metres — longues rafales, traceurs sifflant au-dessus. Tout le monde se disperse. Quarante-cinq minutes a ramper dans les fosses. Vous trouvez Henderson. Juste Henderson. Malone et Doyle ont disparu.",
          context: "Coup de signal a attire les tirs de MG. 45 minutes a ramper dans les fosses. Seul Henderson trouve. Malone et Doyle perdus. Rassemblement rate.",
          menLost: 0,
          ammoSpent: -1,
          moraleChange: -10,
          readinessChange: 15,
          skipRally: true,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_observe",
      text: "Contourner large par la haie et les observer",
      tier: "sound",
      // Effective timeCost: 30 min (extra movement through bocage)
      outcome: {
        success: {
          text: "Cent metres a travers le bocage, rampant sur le ventre les vingt derniers. Depuis le nouvel angle : trois hommes. Casques americains. Bottes de parachutiste. Une Thompson — arme de sous-officier. Vous utilisez le clicker. Henderson repond.",
          context: "Contourne large, observe depuis nouvel angle. Confirme casques americains, bottes parachutiste, Thompson. Rassemblement clicker propre.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        partial: {
          text: "Vingt-cinq minutes a travers la haie dense. Des formes dans le noir — pas de details. Americains, probablement. Vous utilisez le clicker. Deux clics en retour. Henderson, Malone, Doyle. 'Ou diable etiez-vous, Capitaine? On est la depuis une heure.'",
          context: "Circuit de flanc 25 minutes. Impossible de confirmer les identites visuellement. Clicker a regle. Rassemblement fait mais temps brule.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "Vous contournez trop large. Trente-cinq minutes. Quand vous atteignez l'endroit, ils ont bouge. Encore dix minutes a les pister avant que le clicker de Henderson vous trouve. Vous avez brule pres d'une heure.",
          context: "Contourne trop large — 45 minutes au total. Le groupe avait bouge. Le clicker de Henderson vous a trouve. Pres d'une heure gaspillee.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 4
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_avoid",
      text: "Se faufiler dans le champ suivant et continuer",
      tier: "mediocre",
      outcome: {
        success: {
          text: "Vous vous faufilez dans le champ suivant. Les voix s'estompent derriere le mur. En securite. Le silence qui suit est la chose la plus bruyante que vous ayez entendue de toute la nuit. Vous etes toujours seul.",
          context: "Contact evite. Le groupe s'est faufile sans etre detecte. Pas de rassemblement — toujours seul. Aucun risque pris, aucun homme gagne.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 0,
          skipRally: true,
        },
        partial: {
          text: "Vous reculez. Une branche craque. Les voix se taisent. Quelqu'un chuchote 'Flash?' — a peine audible. Vous continuez. Une part de vous dit de revenir. Vous ne le faites pas.",
          context: "Retraite. Defi 'Flash' entendu derriere — Americains confirmes. Repli maintenu. Rassemblement saute. Toujours seul.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -7,
          readinessChange: 0,
          skipRally: true,
        },
        failure: {
          text: "Vous partez. Chaque son est plus fort quand on est seul. Chaque ombre a un fusil. Vous avez fait le choix prudent. Le choix prudent vous a laisse sans un seul allie en France occupee.",
          context: "Allies potentiels laisses derriere le mur. Pas de rassemblement. Seul en territoire ennemi. Decision motivee par la peur.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -10,
          readinessChange: 0,
          skipRally: true,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_listen",
      text: "Se coller au mur et ecouter avant de decider",
      tier: "sound",
      // Effective timeCost: 20 min (five minutes listening plus approach)
      outcome: {
        success: {
          text: "Cinq minutes contre le mur. '...la zone de rassemblement devrait etre...' Anglais americain. Pas de manuel — de vrais accents de Boston. C'est Malone. Henderson le corrige doucement. Vous cliquez. Ils repondent instantanement.",
          context: "Ecoute cinq minutes. Confirme accents americains, identifie la voix de Malone. Rassemblement clicker instantane. Approche propre.",
          timeCost: 20,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 1
        },
        partial: {
          text: "Cinq minutes d'ecoute. Voix indistinctes. L'un d'eux rit — quelque chose sur les Red Sox. Americain. Probablement. Vous utilisez le clicker. Deux clics en retour. Henderson, Malone, Doyle.",
          context: "Ecoute cinq minutes. Voix indistinctes mais indices culturels suggerent Americains. Clicker confirme. Rassemblement fait.",
          timeCost: 20,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        failure: {
          text: "Cinq minutes et les mots se brouillent dans le noir. Accents, cadence — rien de clair. Vous utilisez le clicker quand meme. Henderson repond. Mais vous etes accroupi la depuis trop longtemps. Vos genoux font mal et l'heure a avance.",
          context: "Ecoute cinq minutes, impossible de confirmer l'identite. Utilise le clicker quand meme — a marche. Temps brule sans gain de renseignement.",
          timeCost: 20,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    }
  ],

  interlude: {
    type: "rest",
    beat: "Vous prenez genou derriere un bas mur de pierre et etalez la carte sur votre cuisse. La lune eclaire les courbes de niveau. Quelque part devant, des voix. Vous marquez votre position et repliez la carte.",
    context: "breve pause avant contact potentiel, anticipation prudente",
    objectiveReminder: "Continuez le rassemblement. Securisez assez d'hommes pour passer a l'objectif.",
  },
};
