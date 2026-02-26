import type { Scenario } from '../../../types';

export const scene02_finding_north: Scenario = {
  id: "act1_finding_north",
  act: 1,
  timeCost: 20,
  combatScene: false,

  sceneContext: "Pays de bocage. Haies de six pieds, chaque champ une boite fermee. Ciel couvert, pas d'etoiles visibles. Besoin d'un cap vers la zone de saut pres de Sainte-Marie-du-Mont. Seul sur la terre ferme.",

  narrative:
    "Herbe mouillee sous les pieds, terre ferme. Pays de bocage — les haies s'elevent a six pieds, terre tassee et racines, chaque champ une boite dont on ne voit pas l'exterieur. Les cartes du briefing montraient la zone de saut pres de Sainte-Marie-du-Mont. Ca pourrait etre n'importe ou maintenant. Pas de boussole, pas d'etoiles a travers la couverture nuageuse. Il faut trouver le nord.",

  narrativeAlt: {
    "hasCompass":
      "Herbe mouillee sous les pieds, terre ferme. Pays de bocage — les haies s'elevent a six pieds, terre tassee et racines, chaque champ une boite dont on ne voit pas l'exterieur. Les cartes du briefing montraient la zone de saut pres de Sainte-Marie-du-Mont, mais ca pourrait etre n'importe ou maintenant. Vous sortez la boussole de la poche de votre jambe. Le cadran lumineux se stabilise — nord. Mais nord de ou?",
  },

  decisions: [
    {
      id: "north_compass_terrain",
      text: "Utiliser votre boussole et faire correspondre le terrain aux cartes du briefing",
      tier: "excellent",
      visibleIf: { hasIntel: "hasCompass" },
      outcome: {
        success: {
          text: "Nord a la boussole. Un clocher au nord-est — recoupe avec la carte du briefing memorisee. Sainte-Marie-du-Mont. Deux kilometres au sud-ouest de la zone de saut. Vous savez ou aller.",
          context: "Boussole plus terrain. Recoupe le clocher avec la carte du briefing. Position fixee : deux km au SO de la zone de saut.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 0,
          intelGained: "hasMap",
        },
        partial: {
          text: "La boussole vous donne le nord, mais rien au sol ne correspond au briefing. Soit la carte etait fausse soit vous etes plus loin de la zone de saut que prevu. Une direction, pas une position.",
          context: "Boussole donne le nord mais le terrain ne correspond pas au briefing. Direction obtenue, pas la position.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 0,
        },
        failure: {
          text: "La boussole vous donne le nord et rien d'autre. Chaque haie est identique dans l'obscurite. Vous avez un cap — vous devinez tout le reste.",
          context: "Boussole nord seulement. Haies identiques dans le noir. Cap etabli, position inconnue.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 0,
        },
        wikiUnlocks: "dead_reckoning",
        nextScene: "act1_first_contact",
      },
    },
    {
      id: "north_stars",
      text: "Chercher l'Etoile polaire a travers les trouees dans les nuages",
      tier: "sound",
      outcome: {
        success: {
          text: "Une trouee dans les nuages — la Grande Ourse, les etoiles pointeuses menant a Polaris. Vous attendez une deuxieme trouee pour confirmer. Meme reponse. Vous avez un cap.",
          context: "Trouve Polaris a travers une trouee. Cap confirme par deuxieme observation. Nord etabli.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 0,
        },
        partial: {
          text: "Les nuages sont epais. Vous apercevez quelque chose — peut-etre Polaris, peut-etre pas. Vous choisissez une direction selon votre meilleure estimation. Soixante-dix pour cent sur.",
          context: "Breve trouee. Observation possible de Polaris, faible confiance. Cap etabli au mieux.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 0,
        },
        failure: {
          text: "Les nuages ne se dissipent pas. Vingt minutes a fixer un ciel gris-noir. Votre cou vous fait mal. Vous n'etes pas plus proche de savoir ou est le nord.",
          context: "Ciel couvert maintenu. Vingt minutes a regarder le ciel pour rien. Aucun cap etabli.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 1,
        },
        wikiUnlocks: "dead_reckoning",
        nextScene: "act1_first_contact",
      },
    },
    {
      id: "north_follow_gunfire",
      text: "Se diriger vers les coups de feu — c'est la ou se passe l'action",
      tier: "mediocre",
      outcome: {
        success: {
          text: "Vous prenez la direction la plus bruyante et vous bougez. Quinze minutes a escalader les haies, puis un panneau. Illisible dans le noir, mais la route vous donne une ligne de marche.",
          context: "Marche vers les coups de feu 15 minutes. Trouve route avec panneau. Ligne de marche etablie mais cap incertain.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 3,
        },
        partial: {
          text: "Vous marchez vers les tirs mais le son rebondit sur les haies. Quinze minutes et vous n'etes pas sur d'avoir marche droit. Puis les coups de feu s'arretent.",
          context: "Suivi les coups de feu mais le son rebondissait. 15 minutes, progression incertaine. Source du son perdue.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 3,
        },
        failure: {
          text: "Le bruit vous mene au bord d'un village — casques allemands dans la lueur du feu. Vous vous figez, reculez, contournez large. Quinze minutes dans la mauvaise direction.",
          context: "Suivi les coups de feu jusqu'au bord d'un village occupe par les Allemands. Du retraiter et contourner. 15 minutes perdues mauvaise direction.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -6,
          readinessChange: 5,
        },
        wikiUnlocks: "dead_reckoning",
        nextScene: "act1_first_contact",
      },
    },
    {
      id: "north_just_walk",
      text: "Choisir une direction et marcher — rester immobile c'est mourir",
      tier: "reckless",
      outcome: {
        success: {
          text: "Vous traversez une haie, puis une autre, puis une autre. Chaque champ identique. Apres vingt-cinq minutes vous tombez sur un chemin de terre. Quelque chose a suivre.",
          context: "Marche direction aleatoire 25 minutes a travers le bocage. Trouve chemin de terre par hasard. Quelque chose a suivre.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 2,
        },
        partial: {
          text: "Haie, champ, haie, champ. Vingt-cinq minutes et vous avez peut-etre tourne en rond. Vos bottes sont trempees. Vous n'etes pas plus proche de savoir ou vous etes.",
          context: "25 minutes a travers des champs identiques. Peut-etre tourne en rond. Aucun progres sur l'orientation.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 3,
        },
        failure: {
          text: "Vingt-cinq minutes a errer dans le bocage. Vous trebuchez sur un mur de pierre et atterrissez dans un pre a vaches. Quand vous vous relevez — des voix allemandes, proches. Vous vous plaquez contre la haie et ne respirez plus jusqu'a ce qu'ils passent.",
          context: "25 minutes a errer dans le bocage. Presque tombe sur une patrouille allemande. Du se cacher. Temps et energie gaspilles.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 5,
        },
        wikiUnlocks: "dead_reckoning",
        nextScene: "act1_first_contact",
      },
    },
    {
      id: "north_search_supplies",
      text: "Fouiller la zone pour les colis de ravitaillement — les parachutes devraient etre visibles",
      tier: "sound",
      outcome: {
        success: {
          // Negative ammoSpent = ammo gained (no ammoGain field on OutcomeNarrative)
          text: "Soie blanche dans un arbre. Vous tirez le conteneur — munitions de fusil, rations K, deux bandoulieres supplementaires. Les cartouches sont seches. Vous les chargez et continuez.",
          context: "Trouve parachute de ravitaillement dans un arbre. Recupere munitions fusil, rations K, deux bandoulieres. Ravitaillement en munitions securise.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: 2,
          readinessChange: 3,
        },
        partial: {
          text: "Trente minutes de recherche donnent un parachute d'equipement — surtout des vetements et une radio cassee. Une boite de .30 cal au fond. Mieux que rien.",
          context: "Trouve un parachute d'equipement apres 30 minutes. Surtout vetements et radio cassee. Une boite .30 cal recuperee.",
          menLost: 0,
          ammoSpent: -5,
          moraleChange: 0,
          readinessChange: 3,
        },
        failure: {
          text: "Trente minutes a ramper dans les champs mouilles dans le noir. Rien. Les colis de ravitaillement peuvent etre n'importe ou sur un kilometre carre. Temps brule, bruit fait, rien gagne.",
          context: "30 minutes a fouiller les champs mouilles. Aucun colis trouve. Temps brule, bruit fait, rien gagne.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 4,
        },
        wikiUnlocks: "supply_discipline",
        nextScene: "act1_first_contact",
      },
    },
  ],

  interlude: {
    type: "movement",
    beat: "Vous pataugez a travers le champ inonde vers les hauteurs. L'eau s'amenuise, puis cede la place a la boue, puis a la terre ferme.",
    context: "soulagement melange a la desorientation, seul dans le noir",
    objectiveReminder: "Trouvez vos hommes. Rassemblez-vous au point de repere le plus proche.",
  },
};
