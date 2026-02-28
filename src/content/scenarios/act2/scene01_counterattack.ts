import type { Scenario } from "../../../types";

export const scene01_counterattack: Scenario = {
  id: "act2_scene01",
  act: 2,
  timeCost: 25,
  combatScene: true,
  achievesMilestone: "move_to_objective",

  sceneContext:
    "Dawn edge of Sainte-Marie-du-Mont. Hedgerows, wet ditches, scattered German fire from a tree line and a machine gun probing the lane. Your regrouped men are tired but in contact with friendlies. First push of Act 2.",

  interlude: {
    type: "transition",
    beat: "L'aube perce enfin. Le bruit de la bataille se rapproche.",
    context: "La mission change d'echelle : tenir, avancer, coordonner.",
    objectiveReminder: "Rejoindre et soutenir l'effort principal vers l'objectif.",
  },

  narrative:
    "L'aube grise s'ouvre sur les haies et les fosses pleines d'eau. Cette fois vous n'etes plus seul : des poches de paras se reforment autour de vous, mais les tirs allemands accrochent deja les axes de progression. Le point de ralliement est derriere. Devant, c'est l'Acte 2 : tenir le rythme, garder vos hommes en vie, et pousser vers l'objectif.",

  narrativeAlt: {
    hasSecondInCommand:
      "Henderson regarde la lisiere a travers une trouee de haie. 'On a des tirs de harcelement devant, Capitaine. Rien de massif, mais assez pour nous clouer si on monte mal. On y va propre, ou on y va vite et on le paie.'",
    solo:
      "Vous avez atteint les lignes americaines, mais vous restez seul pour l'instant. Les tirs allemands accrochent deja les couloirs d'approche. Sans equipe, chaque metre en avant vaut le double.",
  },

  secondInCommandComments: {
    act2_establish_base_of_fire:
      "Feu de base d'abord. Ensuite seulement on bouge. C'est propre et ca tient.",
    act2_bound_and_probe:
      "Progression par bonds, reconnaissance courte devant. C'est lent, mais on garde l'initiative.",
    act2_hasty_push:
      "Capitaine, ca sent la charge a l'instinct. On peut passer, mais on peut aussi se faire hacher.",
  },

  decisions: [
    {
      id: "act2_establish_base_of_fire",
      text: "Etablir une base de feu puis manœuvrer par element",
      tier: "excellent",
      minMen: 3,
      requiresCapability: "canSuppress",
      outcome: {
        success: {
          text: "Vous fixez les tirs ennemis avec une base de feu courte et precise. Pendant que les Allemands se couchent, votre element de manœuvre gagne la haie suivante. Le couloir est ouvert.",
          context: "Base de feu disciplinée, manœuvre coordonnée, progression propre.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 6,
          readinessChange: 1,
        },
        partial: {
          text: "La base de feu fonctionne, mais le terrain casse votre rythme. Vous gagnez du terrain au prix de plusieurs pauses et d'un paquet de munitions.",
          context: "Progression réelle mais coûteuse, cadence irrégulière.",
          menLost: 0,
          ammoSpent: -14,
          moraleChange: 2,
          readinessChange: 3,
        },
        failure: {
          text: "Votre feu part trop tôt. Les Allemands se terrent puis contre-tirent pendant votre mouvement. Vous passez, mais un homme est touché et l'unité perd sa cohésion pendant de longues minutes.",
          context: "Synchronisation ratée entre feu et mouvement, progression sous pertes.",
          menLost: 1,
          ammoSpent: -16,
          moraleChange: -4,
          readinessChange: 6,
        },
        wikiUnlocks: "fire_and_maneuver",
        nextScene: "act2_scene02",
      },
    },
    {
      id: "act2_bound_and_probe",
      text: "Avancer par bonds courts avec reconnaissance devant",
      tier: "sound",
      minMen: 2,
      outcome: {
        success: {
          text: "Vous avancez par bonds de haie en haie. Le probe repere un angle battu avant l'engagement, ce qui vous evite une mauvaise surprise. Vous progressez sans casse.",
          context: "Bonds courts et reconnaissance prudente, progression sûre.",
          menLost: 0,
          ammoSpent: -6,
          moraleChange: 4,
          readinessChange: 2,
        },
        partial: {
          text: "Le plan tient, mais chaque bond prend plus de temps que prevu. Vous arrivez en position avec du retard et des hommes fatigues.",
          context: "Approche sûre mais lente, pression temporelle accrue.",
          menLost: 0,
          ammoSpent: -9,
          moraleChange: 1,
          readinessChange: 4,
        },
        failure: {
          text: "Le probe est reperé sur un mouvement. Rafales, repli, confusion brève. Vous reprenez la progression, mais en subissant une blessure et un net coup au moral.",
          context: "Reconnaissance compromise, progression maintenue sous contrainte.",
          menLost: 1,
          ammoSpent: -12,
          moraleChange: -5,
          readinessChange: 7,
        },
        wikiUnlocks: "fire_and_maneuver",
        nextScene: "act2_scene02",
      },
    },
    {
      id: "act2_hasty_push",
      text: "Pousser immediatement pour gagner du terrain avant reaction ennemie",
      tier: "reckless",
      outcome: {
        success: {
          text: "L'audace surprend l'ennemi. Vous gagnez rapidement la haie suivante et coupez un angle de tir. C'etait sale, mais ca passe.",
          context: "Poussée rapide réussie, initiative conservée par surprise.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: 2,
          readinessChange: 4,
        },
        partial: {
          text: "Vous passez, mais sous un feu desordonné qui vous plaque dans la boue. L'unite arrive en position fatiguee, desorganisee, et avec moins de munitions que prevu.",
          context: "Progression forcée au prix d'un fort coût de friction.",
          menLost: 1,
          ammoSpent: -15,
          moraleChange: -4,
          readinessChange: 8,
        },
        failure: {
          text: "La poussee se transforme en course sous feu croise. Deux hommes tombent avant la haie, et le reste se jette en couverture sans liaison claire. Vous arretez l'hemorragie, mais l'initiative est perdue.",
          context: "Assaut précipité, pertes élevées, cohésion dégradée.",
          menLost: 2,
          ammoSpent: -18,
          moraleChange: -8,
          readinessChange: 12,
        },
        wikiUnlocks: "fire_and_maneuver",
        nextScene: "act2_scene02",
      },
    },
  ],
};
