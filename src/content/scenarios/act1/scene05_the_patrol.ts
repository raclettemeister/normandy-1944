import type { Scenario } from '../../../types';

export const scene05_the_patrol: Scenario = {
  id: "act1_the_patrol",
  act: 1,
  timeCost: 20,
  combatScene: true,

  sceneContext: "Pont de pierre sur canal de drainage. Quatre Allemands : Feldwebel lisant des papiers a la lampe torche, un gardant un civil francais mains liees. Les papiers contiennent les emplacements des zones de saut — renseignement critique. Patrouille prete a partir.",

  narrative:
    "Vous les reperez avant qu'ils ne vous reperent. Quatre Allemands sur un pont de pierre au-dessus d'un canal de drainage. " +
    "Un Feldwebel se penche sur des papiers etales sur le mur du pont, lisant a la lueur d'une lampe. " +
    "Un soldat garde un civil francais les mains liees. " +
    "Si ces papiers atteignent le poste de commandement allemand, ils sauront ou est chaque zone de saut. " +
    "Le Feldwebel aboie un ordre — ils se preparent a partir.",

  narrativeAlt: {
    squad:
      "Henderson rampe a cote de vous. Il etudie le pont pendant dix secondes. " +
      "'Des papiers,' chuchote-t-il. 'C'est mauvais pour nous s'ils passent, Capitaine.' " +
      "Une pause. 'Mais on a la mission a considerer. A vous de decider.'",
    solo:
      "Vous etes seul. Quatre Allemands. Vous avez un pistolet, un couteau et deux grenades. " +
      "Le calcul n'est pas bon."
  },

  secondInCommandComments: {
    patrol_l_ambush: "Bonne position, mon capitaine. Je prends le deuxieme element. A votre signal.",
    patrol_linear_ambush: "D'un seul cote, mon capitaine? Mieux que rien. Mais certains s'echapperont par le pont.",
    patrol_knife: "C'est... optimiste, Capitaine. Vous en poignardez un, les trois autres entendent.",
    patrol_open_fire: "Pas de preparation, mon capitaine? Juste... tirer?",
    patrol_charge: "Capitaine — vous n'etes pas serieux. Une charge a la baionnette? Contre quatre hommes avec des mitraillettes?",
    patrol_rocks: "Des cailloux, mon capitaine? Ce ne sont pas des enfants.",
    patrol_animal_sounds: "Mon capitaine... vous voulez meugler vers eux?",
    patrol_let_pass: "Ces papiers, mon capitaine. S'ils reviennent a leur PC, ils sauront ou est chaque zone de saut. Ca va nous faire mal.",
    patrol_decoy: "Qui envoyez-vous la-bas, mon capitaine?"
  },

  prepActions: [
    {
      id: "patrol_prep_ask_henderson",
      text: "Demander a Henderson des infos sur le pont",
      soldierId: "henderson",
      timeCost: 5,
      responseVeteran: "Quatre hommes. Feldwebel — voyez la lampe? Il lit quelque chose. Des papiers. MG34 en bandouliere sur le garde, pas en epaule. Deuxieme homme surveille le civil francais. Les deux autres sont detendus — fument. Ils ne savent pas qu'on est la. Zone morte le long de la berge du canal, peut-etre cinquante metres jusqu'au pont.",
      responseGreen: "Il y a... des Allemands. Sur le pont. Un a une lumiere.",
    },
    {
      id: "patrol_prep_check_canal",
      text: "Verifier le canal de drainage pour le couvert",
      timeCost: 5,
      responseVeteran: "La berge du canal fait environ un metre de profondeur. Bonne zone morte — vous pourriez deplacer une equipe de feu jusqu'a trente metres du pont sans etre vu. Boue au fond, donc lent et silencieux.",
      responseGreen: "C'est un fosse. Assez profond. Boueux.",
    },
    {
      id: "patrol_prep_ask_malone",
      text: "Demander a Malone ce qu'il en pense",
      soldierId: "malone",
      timeCost: 5,
      responseVeteran: "Laissez-moi prendre mes gars par la gauche, Capitaine. Par ce canal. On les frappe vite — ils ne sauront pas ce qui s'est passe. Je passe en premier.",
      responseGreen: "Je peux y aller. Tout ce dont vous avez besoin, mon capitaine. Dites le mot.",
    },
  ],

  decisions: [
    {
      id: "patrol_l_ambush",
      text: "Tendre une embuscade en L — deux equipes, tir croise",
      tier: "excellent",
      requiresPhase: "squad",
      minMen: 3,
      outcome: {
        success: {
          text:
            "Deux elements en position. Vous attendez que les Allemands se regroupent pres du Feldwebel, puis signalez. " +
            "Tir convergent sous deux angles — dix secondes et c'est fini. Quatre morts, zero ami. " +
            "Vous prenez les papiers sur le corps du Feldwebel. Itineraires de patrouille, dispositions des unites. De l'or.",
          context: "Embuscade L executee parfaitement. Tir convergent, 10 secondes. Quatre ennemis tues, zero pertes amies. Papiers de renseignement recuperes.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 8,
          readinessChange: 5,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "L'embuscade ouvre le feu. Trois Allemands tombent. Le quatrieme court — Malone le poursuit, tire, l'abat a trente metres. " +
            "Mais les tirs de riposte ont effleure le bras de Doyle. Pas grave, mais il saigne. " +
            "Vous recuperez les papiers. Le civil francais tremble mais est vivant.",
          context: "Embuscade L largement reussie. Trois abattus, quatrieme tue a la poursuite. Doyle effleure — blessure mineure. Papiers recuperes. Civil vivant.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: 5,
          readinessChange: 7,
          intelGained: "knowsPatrolRoute"
        },
        failure: {
          text:
            "Doyle tire trop tot. Les Allemands se dispersent avant que vos equipes de feu convergent. " +
            "Un combat confus dans le noir. Deux morts, deux en fuite vers le village. " +
            "Vous recuperez quelques papiers mais ils signaleront le contact. Doyle ne s'arrete pas de trembler.",
          context: "Tir premature de Doyle. Allemands disperses. Deux tues, deux en fuite — signaleront le contact. Renseignements partiels seulement.",
          menLost: 0,
          ammoSpent: -12,
          moraleChange: 1,
          readinessChange: 12
        },
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_linear_ambush",
      text: "Aligner tout le monde et tirer d'ici — a mon signal",
      tier: "mediocre",
      requiresPhase: "squad",
      minMen: 2,
      outcome: {
        success: {
          text:
            "Vos hommes s'alignent le long de la haie. Signal. Une volee de balles frappe les Allemands — trois tombent immediatement. " +
            "Le quatrieme rampe derriere le mur du pont et riposte. Henderson le prend de flanc et acheve. " +
            "Vous recuperez les papiers.",
          context: "Embuscade lineaire. Trois abattus a la volee, quatrieme pris de flanc par Henderson. Papiers recuperes. Pas d'avantage de tir croise.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: 3,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "La volee en abat deux. Deux autres courent — un s'echappe, un est touche a cinquante metres. " +
            "Papiers eparpilles. Vous en trouvez la moitie. L'Allemand en fuite signalera le contact.",
          context: "Tir lineaire en a abattu deux. Un en fuite, un tue en courant. Moitie des papiers recuperee. L'ennemi signalera le contact.",
          menLost: 0,
          ammoSpent: -12,
          moraleChange: 1,
          readinessChange: 10
        },
        failure: {
          text:
            "Le tir lineaire ne couvre pas l'autre cote du pont. Trois Allemands s'echappent. " +
            "Ils tirent en courant. Une balle frappe le mur a cote de votre tete. " +
            "Le Feldwebel a emporte les papiers.",
          context: "Embuscade lineaire ratee — pas de couverture cote oppose. Trois en fuite avec les papiers. Un ami tue. Renseignements perdus.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -3,
          readinessChange: 12
        },
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_knife",
      text: "Ramper et poignarder la sentinelle arriere, puis les charger",
      tier: "reckless",
      outcome: {
        success: {
          text:
            "Vous rampez a portee de bras. Le couteau entre proprement — main sur la bouche, lame entre les cotes. " +
            "Il s'affaisse. Les autres ne remarquent pas. Vos hommes ferment la distance. " +
            "Un combat court et vicieux a courte portee. Ca marche. De justesse.",
          context: "Meurtre au couteau sur la sentinelle — silencieux. Combat a courte portee a elimine les trois restants. Papiers recuperes. A peine propre.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: 2,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "Le couteau entre mais l'Allemand crie. Tout devient bruyant. " +
            "Combat a courte portee au pont. Deux morts, un qui se rend, un en fuite. " +
            "Vos mains sont couvertes de sang. Doyle vomit.",
          context: "Couteau n'a pas reduit la sentinelle au silence. Combat a courte portee. Deux tues, un prisonnier, un en fuite. Escouade secouee par la violence.",
          menLost: 0,
          ammoSpent: -5,
          moraleChange: -3,
          readinessChange: 10
        },
        failure: {
          text:
            "Votre botte heurte une pierre. La sentinelle se retourne. Vous vous battez — le couteau rate. Il crie. " +
            "Les trois autres ouvrent le feu. Vos hommes ripostent. Un chaos. Vous avez une perte.",
          context: "Approche detectee. Couteau rate. Combat chaotique au pont. Un ami tue. Aucun renseignement recupere.",
          menLost: 1,
          ammoSpent: -8,
          moraleChange: -6,
          readinessChange: 12
        },
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_open_fire",
      text: "Ouvrir le feu tout de suite — les frapper avant qu'ils bougent",
      tier: "reckless",
      outcome: {
        success: {
          text:
            "Vous tirez. Vos hommes tirent. Les Allemands tombent — surpris, pris a decouvert. " +
            "Mais ca vous coute. Beaucoup de munitions pour un resultat desordonne. Vous attrapez les papiers.",
          context: "Tir precipite. Allemands surpris mais engagement gaspilleur. Quatre tues. Papiers recuperes. Forte depense de munitions.",
          menLost: 0,
          ammoSpent: -12,
          moraleChange: 1,
          readinessChange: 10,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "Des tirs partout. Deux Allemands a terre. Deux en fuite. Un atteint l'obscurite. " +
            "Papiers trempes dans l'eau du canal — moitie illisibles. Munitions brulees pour un resultat partiel.",
          context: "Tir non controle. Deux tues, un en fuite. Papiers endommages par l'eau, moitie illisibles. Munitions excessives brulees.",
          menLost: 0,
          ammoSpent: -15,
          moraleChange: -2,
          readinessChange: 12
        },
        failure: {
          text:
            "Vous tirez. Ils ripostent. Tout le monde tire dans l'obscurite. " +
            "Quand ca s'arrete, un Allemand est mort, trois en fuite, et vous avez utilise presque toutes vos munitions. Papiers perdus.",
          context: "Combat a l'aveugle. Un Allemand tue, trois en fuite avec les papiers. Presque toutes les munitions depensees. Un ami tue.",
          menLost: 1,
          ammoSpent: -15,
          moraleChange: -5,
          readinessChange: 12
        },
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_charge",
      text: "Fixer les baionnettes — on les charge a travers le terrain decouvert",
      tier: "suicidal",
      requiresPhase: "squad",
      outcome: {
        success: {
          text:
            "Par quelque miracle la charge ferme la distance avant qu'ils reagissent. Le combat est court et sauvage. " +
            "Quatre Allemands morts. Vous regardez vos hommes. Doyle fixe sa baionnette. " +
            "La violence de tout ca pese sur tout le monde.",
          context: "Charge a la baionnette a ferme la distance avant reaction. Quatre ennemis tues au corps a corps. Zero pertes amies. Impact psychologique severe sur l'escouade.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 15
        },
        partial: {
          text:
            "Course a travers le terrain decouvert. Une Schmeisser ouvre le feu. Quelqu'un tombe. " +
            "Vous atteignez le pont — corps a corps. Moche. Vous gagnez. De justesse. Un de vos hommes est touche.",
          context: "Charge a la baionnette a travers terrain decouvert. Tirs Schmeisser pendant l'approche — un ami tue. Corps a corps au pont. Victoire a la Pyrrhus.",
          menLost: 1,
          ammoSpent: -2,
          moraleChange: -8,
          readinessChange: 15
        },
        failure: {
          text:
            "Ils vous entendent arriver. La Schmeisser dechire votre ligne a vingt metres. " +
            "Deux hommes tombent avant que vous ne fermiez. Le combat au pont est un massacre — le leur et le votre. " +
            "Vous survivez. Certains de vos hommes non.",
          context: "Charge detectee a 20m. Schmeisser a coupe la ligne. Deux amis tues. Melee au pont — les deux cotes devastes.",
          menLost: 2,
          ammoSpent: -3,
          moraleChange: -12,
          readinessChange: 15
        },
        fatal: true,
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_rocks",
      text: "Lancer des cailloux vers le canal pour les attirer",
      tier: "reckless",
      requiresPhase: "squad",
      outcome: {
        success: {
          text:
            "Les cailloux eclaboussent le canal. Un Allemand leve les yeux. Les autres ne bougent pas — " +
            "une eclaboussure pendant une invasion ne signifie rien pour eux. " +
            "Quand vous ouvrez enfin le feu, vous avez perdu l'element de surprise totale. Ca marche, mais les cailloux n'ont rien ajoute.",
          context: "Distraction par cailloux inefficace — ignoree par les troupes de garrison. Ouvert le feu sans surprise totale. Quatre tues mais cailloux ont gaspille du temps.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 1,
          readinessChange: 8
        },
        partial: {
          text:
            "Les cailloux frappent le pont. Un Allemand enquete. Mais votre position de flanc n'est pas prete — " +
            "vous avez precipite la mise en place. Un engagement neglige. Deux morts, deux en fuite. Papiers partiellement recuperes.",
          context: "Distraction par cailloux a attire un Allemand mais flanc pas pret. Engagement neglige — deux tues, deux en fuite. Renseignements partiels.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: -2,
          readinessChange: 10
        },
        failure: {
          text:
            "Les Allemands entendent les cailloux et passent en alerte. Troupes de garrison, mais pas stupides. " +
            "Quand vous tentez de prendre le flanc, ils sont deja a couvert. Un combat — desordonne, couteux, bruyant.",
          context: "Cailloux ont alerte les Allemands. Tentative de flanc les a trouves a couvert. Combat couteux. Un ami tue.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -4,
          readinessChange: 12
        },
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_animal_sounds",
      text: "Faire des bruits de vache pour en attirer un loin du groupe",
      tier: "suicidal",
      outcome: {
        success: {
          text:
            "Vous faites un bruit. Un Allemand marmonne et marche vers la haie, fusil leve. " +
            "Vous lui sautez dessus — une lutte, vous le mettez a terre. " +
            "Mais le bruit alerte les autres. Ce qui a commence comme une ruse tourne en combat que vous n'aviez pas prevu.",
          context: "Bruit d'animal a attire un Allemand. Tue dans la lutte mais bruit a declenche combat non prevu. Position exposee.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: -3,
          readinessChange: 10
        },
        partial: {
          text:
            "Votre imitation de vache n'est pas convaincante. L'Allemand dit quelque chose au Feldwebel. " +
            "Deux hommes envoyes pour enqueter. Ils vous trouvent. Combat a courte portee. Desordonne.",
          context: "Bruit d'animal peu convaincant. Deux Allemands envoyes enqueter. Combat a courte portee. Un ami tue.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -6,
          readinessChange: 12
        },
        failure: {
          text:
            "Vous meuglez. Le Feldwebel aboie un ordre. Les quatre Allemands se deploient vers votre position armes levees. " +
            "Ils n'enquetent pas sur du betail — ils nettoient une position d'embuscade suspectee. " +
            "Vous avez revele votre position pour rien.",
          context: "Bruit d'animal reconnu comme suspect. Les quatre Allemands ont balaye vers la position. Position d'embuscade revelee. Un ami tue.",
          menLost: 1,
          ammoSpent: -12,
          moraleChange: -8,
          readinessChange: 12
        },
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_let_pass",
      text: "Les laisser passer — on ne peut pas risquer un combat maintenant",
      tier: "sound",
      outcome: {
        success: {
          text:
            "Vous les regardez partir. Le Feldwebel plie les papiers dans sa mallette. " +
            "Ils emmenent le civil sur la route et disparaissent. Pas de coups de feu. " +
            "Henderson les regarde partir. 'On paiera ca plus tard, Capitaine.'",
          context: "Laisse la patrouille passer. Pas d'engagement. Papiers et civil emmenes par les Allemands. Pas de pertes, pas de munitions depensees, mais renseignements perdus.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 15
        },
        partial: {
          text:
            "Ils partent. Un Allemand jette un coup d'oeil dans votre direction — vous vous figez. Il continue de marcher. " +
            "Le civil francais regarde par-dessus son epaule vers la haie, comme s'il savait que vous etes la. " +
            "Vous le laissez partir aussi.",
          context: "Laisse la patrouille passer. Presque detecte — Allemand a regarde vers la position. Papiers perdus. Civil francais emmene. Pas d'engagement.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 15
        },
        failure: {
          text:
            "Ils partent. Vous respirez. Cinq minutes plus tard, un moteur de camion demarre au loin. " +
            "Ils avaient un vehicule. Ces papiers sont deja en route vers le PC. " +
            "Henderson ne dit rien. Il n'a pas besoin.",
          context: "Laisse la patrouille passer. L'ennemi avait un vehicule — papiers deja en route vers le PC. Renseignements zones de saut atteindront le commandement allemand. Echec strategique.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -7,
          readinessChange: 18
        },
        wikiUnlocks: "tactical_patience",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_solo_steal",
      text: "Ramper dans le fosse de drainage et voler la mallette de cartes",
      tier: "excellent",
      visibleIf: { phase: "solo" },
      outcome: {
        success: {
          text:
            "Vous glissez dans le canal de drainage. Eau froide jusqu'a la taille. " +
            "Le Feldwebel a laisse la mallette de cartes sur le mur du pont pendant qu'il briefe ses hommes. " +
            "Vous tendez la main. Les doigts se referment sur la sangle de cuir. Vous la tirez sous l'eau et rampez en arriere. " +
            "Ils ne s'apercevront de rien avant dix minutes.",
          context: "Infiltre via le canal de drainage. Mallette de cartes volee sans etre detecte. Renseignements recuperes, pas de coups de feu, pas de pertes. Dix minutes d'avance.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 10,
          readinessChange: 2,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "Le canal est plus peu profond que prevu. Des rides. Le garde regarde vers l'eau — vous vous figez, a moitie immerge. " +
            "Une minute angoissante. Il detourne le regard. Vous attrapez la mallette mais la cognez contre la pierre. " +
            "Des cris. Des balles frappent l'eau autour de vous. Vous atteignez la haie avec la mallette.",
          context: "Infiltration par canal detectee a l'extraction. Mallette attrapee mais a attire des tirs. Renseignements recuperes mais position connue. Pas de pertes.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        failure: {
          text:
            "Le canal est trop peu profond. Vous ne pouvez pas rester immerge. Un Allemand voit un mouvement dans l'eau et tire. " +
            "Vous battez en retraite, les balles sifflant. Pas de mallette. Votre position est connue. Il faut bouger.",
          context: "Canal trop peu profond. Detecte et pris pour cible. Aucun renseignement recupere. Position compromise. Force de se retirer.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 10
        },
        wikiUnlocks: "stealth_operations",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_decoy",
      text: "Envoyer un homme comme leurre, puis les frapper sur le flanc",
      tier: "mediocre",
      requiresPhase: "squad",
      minMen: 3,
      outcome: {
        success: {
          text:
            "Doyle court le long de la haie — visible, faisant du bruit. Les Allemands se retournent. Vous ouvrez le feu. " +
            "Deux a terre avant qu'ils reagissent. Le Feldwebel attrape les papiers — Henderson lui met une balle dans la main. " +
            "Papiers securises. Doyle revient, haletant.",
          context: "Leurre a attire l'attention. Tir de flanc en a abattu deux, Henderson a stoppe le Feldwebel. Papiers securises. Leurre revenu sain et sauf.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 2,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "Doyle court. Les Allemands tirent sur lui — traceurs le poursuivant dans le noir. " +
            "Vous engagez depuis le flanc. Deux a terre. Deux en fuite. " +
            "Doyle est touche. Balle dans le mollet. 'Ca va,' dit-il. Ca ne va pas.",
          context: "Leurre a attire les tirs — Doyle touche au mollet, blesse. Tir de flanc en a abattu deux, deux en fuite. Aucun renseignement recupere.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: -2,
          readinessChange: 10
        },
        failure: {
          text:
            "Doyle court. Une rafale l'atteint a vingt metres. Il tombe lourdement. " +
            "Vous ouvrez le feu mais les Allemands sont deja a couvert. " +
            "Un combat que vous ne vouliez pas, et Doyle ne bouge plus.",
          context: "Leurre Doyle tue a 20 metres. Allemands ont atteint le couvert avant le tir de flanc. Combat avec ennemi a couvert. Un ami tue.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -8,
          readinessChange: 12
        },
        wikiUnlocks: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    }
  ]
};
