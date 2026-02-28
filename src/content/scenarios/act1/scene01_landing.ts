import type { Scenario } from '../../../types';

export const scene01_landing: Scenario = {
  id: "act1_scene01_landing",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Night. Flooded field near the drop zone. Water up to your waist, chute tangled in the lines. Rifle lost under the surface, pistol on your hip. Flak on the horizon. You're alone in occupied France.",

  interlude: { type: "transition", beat: "Out of the water. Into the dark.", context: "You've left the flooded field. Next: find a direction." },
  secondInCommandComments: { veteran: "You're on your own until you find the platoon." },

  narrative:
    "Vous avez de l'eau jusqu'a la taille. Le parachute vous traine derriere, les cordes enchevetrees autour de vos jambes. Pas de lune, pas d'etoiles — juste le pouls lointain du tir antiaerien a l'horizon. Votre fusil est quelque part sous la surface. Le pistolet est toujours a votre hanche. Vous etes seul en France occupee.",

  narrativeAlt: {
    "assess_before_acting":
      "Vous avez de l'eau jusqu'a la taille. Le parachute vous traine derriere, les cordes enchevetrees autour de vos jambes. Pas de lune, pas d'etoiles — juste le pouls lointain du tir antiaerien a l'horizon. Votre fusil est quelque part sous la surface. Le pistolet est toujours a votre hanche. Vous avez deja fait ca. Ralentissez. Reflechissez d'abord.",
  },

  decisions: [
    {
      id: "landing_check_gear",
      text: "Verifier votre equipement — fouiller chaque poche, verifier chaque sangle",
      tier: "excellent",
      minMen: 1,
      outcome: {
        success: {
          text: "Vous fouillez vos poches methodiquement. Pistolet, deux grenades, clicker — tout est la. Vos doigts se referment sur la boussole dans la poche de votre pantalon. Le cadran lumineux brille d'un vert pale.",
          context: "Verification systematique de l'equipement. Trouve pistolet, deux grenades, clicker, boussole. Tout le materiel est la.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 0,
          intelGained: "hasCompass",
        },
        partial: {
          text: "Vos mains sont engourdies. Vous trouvez le pistolet, sentez les deux grenades, mais vos doigts ne cooperent pas pour le reste. Il vous faut la terre ferme avant de pouvoir faire une verification complete.",
          context: "Verification partielle. Trouve pistolet et grenades mais mains trop engourdies pour fouiller. Besoin de terre ferme.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 0,
        },
        failure: {
          text: "Vous tatonnez avec votre harnais. Quelque chose tombe du filet — un petit plouf, puis plus rien. Vos doigts cherchent dans l'eau mais c'est perdu. Le froid gagne.",
          context: "Verification ratee dans l'eau. Perte d'une piece d'equipement. Froid croissant, dexterite en baisse.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 0,
        },
        wikiUnlocks: "assess_before_acting",
        nextScene: "act1_scene02_finding_north",
      },
    },
    {
      id: "landing_assess",
      text: "Reperer les alentours — ecouter, chercher une lumiere ou un point de repere",
      tier: "sound",
      minMen: 1,
      outcome: {
        success: {
          text: "Vous vous forcez a respirer et a ecouter. Des coups de feu au loin — au nord, peut-etre au nord-est. Puis vous le voyez : un clocher d'eglise, a peine visible contre les nuages. Les cartes du briefing mentionnaient un clocher pres de la zone de saut.",
          context: "Arrete et evalue les alentours. Identifie le clocher pres de la zone de saut sur les cartes. Direction des tirs etablie.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 0,
        },
        partial: {
          text: "Vous vous arretez et ecoutez. Des explosions quelque part, mais le son rebondit sur les haies. Chaque direction sonne pareil. Au moins vous pensez clairement.",
          context: "Tentative d'orientation. Son rebondissant sur les haies, pas de direction claire. Pensee claire mais toujours desoriente.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 0,
        },
        failure: {
          text: "Vous tendez l'oreille, les yeux. L'obscurite ne vous donne rien et le froid s'insinue plus profond. Vous n'etes pas mieux oriente qu'a l'atterrissage.",
          context: "Echec d'orientation. Obscurite et froid sans resultat. Pas plus proche de connaitre sa position.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 0,
        },
        wikiUnlocks: "assess_before_acting",
        nextScene: "act1_scene02_finding_north",
      },
    },
    {
      id: "landing_move_fast",
      text: "Sortir de cette eau — gagner la terre ferme maintenant",
      tier: "reckless",
      outcome: {
        success: {
          text: "Vous poussez vers la berge la plus proche. La boue accroche vos bottes. Vous vous hissez sur la terre ferme, trempe, a bout de souffle — sans savoir dans quelle direction vous faites face.",
          context: "Precipite vers la terre ferme. Atteint la berge mais completement desoriente. Aucune evaluation faite.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 2,
        },
        partial: {
          text: "Vous vous elancez. Votre botte accroche un poteau de cloture immerge et vous plongez la tete la premiere dans l'eau. Vous vous trainez jusqu'a la berge en toussant, pistolet trempe.",
          context: "Trebuche sur un poteau immerge. Tete la premiere dans l'eau. Atteint la berge mais pistolet trempe.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 2,
        },
        failure: {
          text: "Vous vous battez vers la berge et votre cheville accroche quelque chose sous l'eau — du fil, une racine. La douleur remonte dans votre jambe. Vous atteignez la terre ferme en boitant, et quelqu'un a peut-etre entendu tout ce clapotis.",
          context: "Cheville prise sur un obstacle immerge. Jambe blessee, boite. Trop de bruit en atteignant la berge. Detection possible.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 3,
        },
        wikiUnlocks: "assess_before_acting",
        nextScene: "act1_scene02_finding_north",
      },
    },
    {
      id: "landing_freeze",
      text: "Rester immobile — ne pas bouger, ne pas faire de bruit",
      tier: "mediocre",
      outcome: {
        success: {
          text: "Vous restez immobile. L'eau engourdit vos jambes et le silence pese. Les minutes passent. Personne ne vient — il faut bouger.",
          context: "Immobilise plusieurs minutes. Aucune menace. Temps perdu debout dans l'eau froide.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 1,
        },
        partial: {
          text: "Vous attendez. Le froid grimpe au-dessus de vos cuisses. Vos dents claquent et vous serrez la machoire. Cinq minutes pour rien.",
          context: "Attendu immobile cinq minutes. Froid plus profond, dents qui claquent. Aucune information obtenue.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 1,
        },
        failure: {
          text: "Vous restez immobile. Vos jambes s'engourdissent, puis vos mains. Quand vous essayez enfin de bouger, vous trebuchez et eclaboussez. Le froid a ronge vos muscles et l'attente ne vous a rien apporte.",
          context: "Immobilise trop longtemps. Jambes et mains engourdies. Mobilite perdue au froid. Trebuche et fait du bruit en sortant.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -7,
          readinessChange: 2,
        },
        wikiUnlocks: "assess_before_acting",
        nextScene: "act1_scene02_finding_north",
      },
    },
  ],
};
