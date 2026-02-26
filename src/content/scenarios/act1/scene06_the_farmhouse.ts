import type { Scenario } from '../../../types';
import { PLATOON_ROSTER } from '../../../engine/roster';

const rivera = PLATOON_ROSTER.find(s => s.id === 'rivera')!;
const kowalski = PLATOON_ROSTER.find(s => s.id === 'kowalski')!;

export const scene06_the_farmhouse: Scenario = {
  id: "act1_the_farmhouse",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Ferme en pierre, deux etages, grange attenante. Equipement parachutiste 506e sur le porche — musette, casque as de pique. Porte fermee, fenetres sombres, planchers qui craquent a l'interieur. Amis possibles : Rivera (medecin) et Kowalski (tireur BAR).",

  narrative: "Une ferme en pierre au bord d'un pre. Deux etages, toit d'ardoise, grange attenante. Equipement parachutiste sur le porche — musette, casque as de pique. C'est la 506e. La porte est fermee et les fenetres sont sombres, mais vous entendez les planchers craquer a l'interieur. Quelqu'un est la.",

  narrativeAlt: {
    "hasSecondInCommand": "Une ferme en pierre. Equipement parachutiste sur le porche — casque 506e, musette. Henderson etudie le batiment longuement. 'Pourrait etre des notres,' dit-il doucement. Il verifie sa carabine. 'Comment voulez-vous gerer ca, mon capitaine?'",
    "solo": "Une ferme en pierre seule au bord d'un pre. Equipement parachutiste sur le porche — c'est la 506e, votre regiment. Des munitions la-dedans, peut-etre. De l'equipement. Mais les fenetres sont sombres et vous etes seul avec un pistolet."
  },

  secondInCommandComments: {
    "farmhouse_stack_clear": "Je prends la tete. Stack standard a deux. On balaie a gauche a l'entree.",
    "farmhouse_two_element": "Malone et moi prenons le devant. Vous couvrez l'arriere avec Doyle.",
    "farmhouse_rush": "Ralentissez, Capitaine. On ne sait pas qui est la-dedans. Pourrait etre des notres.",
    "farmhouse_grenade": "Mon capitaine, c'est de l'equipement parachutiste sur le porche. Ce pourrait etre nos gens a l'interieur. Ne tirez pas.",
    "farmhouse_clicker_outside": "Malin. Laissez le clicker parler.",
    "farmhouse_scout": "Prenez votre temps. Je tiens la lisiere.",
    "farmhouse_skip": "Capitaine, c'est de l'equipement parachutiste sur le porche. Quelqu'un est la-dedans."
  },

  prepActions: [
    {
      id: "farmhouse_prep_observe",
      text: "Surveiller la ferme pour des mouvements",
      timeCost: 5,
      responseVeteran: "Planchers qui craquent — quelqu'un fait les cent pas. Musette sur le porche est du modele 506e. Pas d'empreintes de bottes allemandes dans la boue, juste des bottes de saut. Qui que ce soit la-dedans est descendu en parachute.",
      responseGreen: "J'entends quelqu'un bouger a l'interieur. Le casque sur le porche a un pique dessus.",
    },
    {
      id: "farmhouse_prep_ask_henderson",
      text: "Demander a Henderson des conseils sur l'approche",
      soldierId: "henderson",
      timeCost: 5,
      responseVeteran: "Une porte devant, une porte cote grange. Fenetres : deux au rez-de-chaussee, deux a l'etage. Murs en pierre — rien ne passera a travers. Si c'est des notres, le clicker devrait regler. Sinon, ce BAR sur le chambranle sera un probleme. Je dirais porte de devant, clicker d'abord.",
      responseGreen: "C'est un batiment, mon capitaine. La porte est la.",
    },
    {
      id: "farmhouse_prep_circle_building",
      text: "Contourner le batiment pour verifier les sorties",
      timeCost: 5,
      responseVeteran: "Porte arriere par la grange, une fenetre accessible cote ouest. Murs en pierre partout ailleurs. Bonne nouvelle : seulement deux sorties. Vous pouvez couvrir les deux avec quatre hommes.",
      responseGreen: "Il y a une porte derriere. Et une fenetre, je crois.",
    },
  ],

  rally: {
    soldiers: [{ ...rivera }, { ...kowalski }],
    ammoGain: 15,
    moraleGain: 7,
    narrative: "Rivera sort en tremblant, mais ses mains vont droit au sac de secours — deja en train de verifier vos hommes avant qu'on lui demande. Kowalski remplit l'embrasure derriere lui, BAR en travers de la poitrine, deux bandoulieres en plus sur les epaules. Il vous regarde et hoche la tete une fois. Un medecin et une arme automatique. Tout vient de changer."
  },

  decisions: [
    {
      id: "farmhouse_stack_clear",
      text: "Stack sur la porte — nettoyer le batiment piece par piece",
      tier: "excellent",
      requiresPhase: "squad",
      minMen: 2,
      outcome: {
        success: {
          text: "Henderson clique a la porte. Deux clics en retour de l'interieur. Il entre bas, balaie a gauche — Rivera la, mains levees, Kowalski avec le BAR sur le chambranle. 'Thunder,' chuchote Rivera. Piece par piece, vous nettoyez. Rien que vos propres hommes.",
          context: "Stack et clear avec identification clicker. Rivera et Kowalski identifies. Entree propre, pieces nettoyees. Rassemblement avec medecin et tireur BAR.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: 5,
          readinessChange: 2
        },
        partial: {
          text: "Henderson clique a la porte. Silence — Rivera a perdu son clicker au saut. 'Flash,' chuchote Henderson. Une voix repond en tremblant : 'Thunder! Ne tirez pas, on est Americains!' La porte s'ouvre sur le BAR de Kowalski braque sur la poitrine de Henderson. Une minute entiere avant que personne n'arrete de trembler.",
          context: "Stack et clear. Clicker rate — Rivera a perdu le sien. Defi verbal a regle. BAR braque sur amis. Rassemblement tendu.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "Doyle accroche le seau a lait avec sa botte — il claque sur la pierre et le BAR ouvre le feu a travers la porte. Henderson se jette a plat en hurlant 'AMERICAIN!' jusqu'a ce que les tirs s'arretent. Personne touche. Assez pres pour le sentir.",
          context: "Bruit pendant l'approche a declenche tirs BAR a travers la porte. Pas de pertes par chance. Henderson a hurle l'identification. Rassemblement fait sous le feu.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: 1,
          readinessChange: 5
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_two_element",
      text: "Envoyer deux hommes devant pendant que vous couvrez la sortie arriere",
      tier: "sound",
      requiresPhase: "squad",
      minMen: 3,
      outcome: {
        success: {
          text: "Henderson et Malone prennent le devant. Henderson clique. Deux clics de l'interieur. 'Amis qui entrent.' La porte s'ouvre et la voix de Henderson porte par la fenetre : 'RAS. Capitaine, entrez.' Rivera et Kowalski. Vivants et armes.",
          context: "Approche a deux elements. Echange clicker a la porte de devant. Entree propre. Rivera et Kowalski rassembles. Arriere couvert.",
          menLost: 0,
          ammoSpent: -1,
          moraleChange: 3,
          readinessChange: 1
        },
        partial: {
          text: "Henderson et Malone entrent. Vous entendez des voix — urgentes, pas des coups de feu. Puis Henderson a la fenetre arriere : 'Capitaine, c'est des notres. Rivera et Kowalski.' Mais Doyle a la porte arriere a entendu la commotion et a failli tirer. Vous avez du pousser son canon vous-meme.",
          context: "Element avant entre avec succes. Element arriere a failli tirer sur la commotion. Capitaine a empeche tir ami. Rassemblement fait de justesse.",
          menLost: 0,
          ammoSpent: -1,
          moraleChange: 2,
          readinessChange: 2
        },
        failure: {
          text: "Henderson entre. Kowalski tire sur le mouvement. Henderson plonge. Malone riposte. 'CESSEZ LE FEU! CESSEZ LE FEU!' — Henderson hurle dans le noir. Quand les acouphenes s'arretent, Malone a une egratignure au bras. Personne de mort. De justesse.",
          context: "Entree a declenche combat entre amis. Kowalski a tire, Malone a riposte. Malone effleure. Henderson a arrete. Rassemblement dans le chaos.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -2,
          readinessChange: 5
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_rush",
      text: "Entrer vite — prendre le batiment d'assaut avant que quiconque reagisse",
      tier: "reckless",
      outcome: {
        success: {
          text: "Vous faites irruption par la porte. Rivera crie. Kowalski braque le BAR vers votre poitrine et s'arrete — silhouette de votre casque, Americain. 'MON DIEU! On est Americains!' crie Rivera. Le doigt de Kowalski etait sur la detente. Une seconde de plus.",
          context: "Pris le batiment d'assaut sans identification. Kowalski a failli tirer le BAR sur le capitaine. Silhouette du casque reconnue. Rassemblement par chance, pas par competence.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -2,
          readinessChange: 5
        },
        partial: {
          text: "Vous defoncez la porte. Le BAR tire — la balle frappe le mur a un pouce de votre tete, poussiere de platre dans les yeux. 'FLASH! FLASH!' vous hurlez. Kowalski s'arrete. Rivera est par terre, mains sur les oreilles, en pleurs. Tout le monde vivant, mais quelque chose dans la piece est casse.",
          context: "Entree en force, BAR ouvre le feu. Quasi-accident sur le capitaine — balle dans le mur. Rivera craque. Rassemblement etabli, mais escouade psychologiquement atteinte.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -5,
          readinessChange: 6
        },
        failure: {
          text: "Vous chargez. Le BAR tire. Un de vos hommes est silhouette dans l'embrasure et la balle le fait tomber. 'AMERICAIN! ON EST AMERICAINS!' Trop tard. Rivera se precipite vers le corps. Votre propre soldat, tire par vos propres gens, parce que vous n'avez pas dit un mot avant de passer cette porte.",
          context: "Pris le batiment d'assaut. BAR a tue un ami dans l'embrasure. Aucune identification donnee avant l'entree. Fatalite par tir ami.",
          menLost: 1,
          ammoSpent: -3,
          moraleChange: -10,
          readinessChange: 8
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_grenade",
      text: "Lancer une grenade par la fenetre, puis entrer",
      tier: "reckless",
      outcome: {
        success: {
          text: "Vous retirez la goupille. Henderson attrape votre poignet. 'Capitaine. CAPITAINE. Regardez le porche.' Sa voix est plate, urgente. 'C'est de l'equipement 506e.' Vous regardez. Il a raison. Vous remettez la goupille avec des doigts qui ne s'arreteront pas de trembler. Henderson vient de vous sauver de la pire erreur de votre vie.",
          context: "Grenade abandonnee — Henderson a stoppe le capitaine. Equipement 506e sur le porche identifie juste a temps. Pas de lancer. Erreur quasi-catastrophique evitee.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 3
        },
        partial: {
          text: "La grenade passe par la fenetre. L'explosion secoue les murs. Vous entrez dans la fumee et trouvez Rivera par terre, oreilles qui saignent, bouche ouverte dans un cri que vous n'entendez pas. Kowalski est etourdi contre le mur du fond, le BAR arrache de ses mains. Les deux vivants — la grenade a atterri dans la piece a cote. Votre medecin n'entend pas quand vous l'appelez.",
          context: "Grenade lancee sur position amie. Explosion a blesse Rivera (oreilles) et etourdi Kowalski. Les deux vivants — grenade a touche piece adjacente. Ouie du medecin endommagee.",
          menLost: 0,
          ammoSpent: -5,
          moraleChange: -12,
          readinessChange: 8
        },
        failure: {
          text: "La grenade detone dans la piece principale. Vous entrez dans la fumee. Kowalski est mort ou il etait assis — l'explosion l'a pris de plein fouet. Rivera est affale contre le mur du fond, shrapnel dans la poitrine, fixant l'aigle hurlant sur votre epaule. 'Vous...' chuchote-t-il. Vous venez de tuer votre propre tireur BAR avec une bombe Gammon.",
          context: "Grenade a tue Kowalski (tireur BAR). Rivera touche par shrapnel. Tir ami — grenade sur vos propres hommes. Echec de leadership catastrophique.",
          menLost: 1,
          ammoSpent: -5,
          moraleChange: -15,
          readinessChange: 10
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_clicker_outside",
      text: "Utiliser le clicker depuis le porche — ecouter la reponse",
      tier: "sound",
      outcome: {
        success: {
          text: "Un clic-clac depuis le porche. Silence. Puis de l'interieur : clic-clac, clic-clac. La voix de Rivera, etouffee : 'Americain? S'il vous plait soyez Americain.' Vous ouvrez la porte. Rivera et Kowalski. Vivants, armes, et le soulagement sur le visage de Rivera vous brise presque.",
          context: "Clicker depuis le porche. Reponse appropriee de l'interieur. Identification propre. Rivera et Kowalski rassembles. Pas de coups de feu.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        partial: {
          text: "Un clic. Rien — Rivera a perdu son clicker au saut. Vous essayez le verbal : 'Flash.' Longue pause. Puis une voix a travers la porte, a peine audible : 'Thunder.' La porte s'entreouvre. Le visage de Rivera, tendu et pale. 'Capitaine? Oh, merci mon Dieu.'",
          context: "Clicker rate — pas de reponse. Defi verbal a marche. Rivera et Kowalski trouves vivants. Processus d'identification lent.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "Un clic. Le bruit d'une arme qu'on prepare a l'interieur — une culasse qu'on arme. Pas de clicker, pas de reponse. Vous criez 'Flash.' Un long silence. Puis : '...Thunder?' Effraye, incertain. Vous entrez lentement. Les mains de Rivera tremblent si fort qu'il ne peut pas tenir son sac de secours.",
          context: "Clicker et verbal tous deux accueillis par la peur. Arme preparee a l'interieur. Identification lente et tendue. Rivera tres secoue — capacite de medecin compromise.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 3
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_scout",
      text: "Reconnaitre le batiment d'abord — verifier chaque fenetre pour des mouvements",
      tier: "sound",
      outcome: {
        success: {
          text: "Vous contournez le batiment bas, dos contre la pierre. Par une fenetre laterale : deux silhouettes en uniformes americains. Brassard medecin sur l'un, l'autre tenant un BAR. Vous tapez le verre. 'Flash.' 'Thunder!' Ils vous laissent entrer par la porte laterale.",
          context: "Batiment reconnu. Uniformes americains, brassard medecin, BAR confirmes visuellement. Defi verbal a la fenetre. Rassemblement propre.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 1
        },
        partial: {
          text: "Vous contournez la ferme. Sombre a l'interieur — des formes, rien de clair. Mais les bottes au sol sont a semelle americaine, pas a clous allemands. Vous tapez la porte avec votre clicker et attendez. Ca prend du temps, mais le contact est etabli. Rivera et Kowalski, vivants dans le noir.",
          context: "Batiment reconnu. Visuel peu concluant — semelle de botte americaine identifiee. Clicker a la porte a regle. Rassemblement fait avec retard.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2
        },
        failure: {
          text: "Vingt-cinq minutes a contourner le batiment sur le ventre. Des formes a travers le verre sale, rien de confirme. Vous utilisez enfin le clicker a la porte de devant et ca marche en trente secondes. Une demi-heure brulee pour ce que le clicker aurait fait depuis le porche.",
          context: "25 minutes de reconnaissance n'ont rien apporte. Clicker a la porte a marche en 30 secondes. Temps excessif depense sans avantage de renseignement.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 3
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_skip",
      text: "Passer la ferme — continuer vers le point de rassemblement",
      tier: "mediocre",
      outcome: {
        success: {
          text: "Vous passez la ferme sans vous arreter. Henderson regarde en arriere une fois. 'C'etait des notres, mon capitaine.' Peut-etre. Peut-etre pas. L'equipement sur le porche vous reste plus longtemps qu'il ne devrait.",
          context: "Ferme contournee. Pas de tentative de rassemblement. Amis possibles laisses derriere. Poursuite vers le point de rassemblement.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 0
        },
        partial: {
          text: "Vous poussez a travers le champ suivant. La ferme reste derriere dans le gris. A mi-chemin, vous l'entendez — un clicker dans cette direction. Un clic. Faible. Vous etes deja en marche et vous ne revenez pas.",
          context: "Ferme contournee. Clicker entendu derriere — allies confirmes. Le groupe n'est pas revenu. Opportunite de rassemblement manquee.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 0
        },
        failure: {
          text: "Vous partez. Henderson ne dit rien mais sa machoire est serree. Malone marmonne quelque chose que vous ne saisissez pas. Vous avez laisse des amis possibles dans une ferme sombre parce que vous aviez peur de ce qu'il y avait dedans. Les hommes l'ont vu.",
          context: "Ferme contournee par peur. Escouade a remarque l'evitement. Perdu medecin et tireur BAR potentiels. Credibilite du leadership endommagee.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 0
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    }
  ],

  interlude: {
    type: "transition",
    beat: "La ferme se tient sombre et silencieuse au bord du champ. Murs de pierre, fenetres voletees. Pourrait etre vide. Pourrait etre n'importe quoi.",
    context: "tension montante, approche d'une structure inconnue",
    objectiveReminder: "Nettoyer la ferme et continuer vers le carrefour.",
  },
};
