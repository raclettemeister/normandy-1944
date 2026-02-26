import type { Scenario } from '../../../types';

export const scene07_the_road: Scenario = {
  id: "act1_scene07",
  act: 1,
  timeCost: 20,
  combatScene: false,
  achievesMilestone: "rally_complete",

  sceneContext: "Chemin creux entre hautes haies. Point de rassemblement a moins d'1 km au nord — armes legeres americaines audibles. Carrefour devant avec fil de fer tendu, traces de pneus fraiches. Les Allemands sont passes recemment. Dernier troncon de l'Acte 1.",

  narrative: "Un chemin creux entre de hautes haies, le genre que les Normands empruntent depuis mille ans. Le point de rassemblement devrait etre a moins d'un kilometre au nord — vous entendez des tirs d'armes legeres epars dans cette direction, Americains au son. Mais le chemin debouche sur un carrefour devant, et quelqu'un a tendu du fil de fer. Traces de pneus fraiches dans la boue. Les Allemands sont passes recemment.",

  narrativeAlt: {
    "hasSecondInCommand": "Un chemin creux vers le nord. Henderson etudie le carrefour devant a travers une trouee — fil de fer tendu, traces de pneus fraiches dans la boue. 'Les Allemands ont installe ca dans la derniere heure,' chuchote-t-il. 'Le point de rassemblement est proche, Capitaine. Comment on passe?'",
    "solo": "Un chemin creux vers le nord. Le point de rassemblement est proche — vous entendez des armes americaines au loin. Mais le carrefour devant a du fil de fer tendu et des traces de pneus fraiches. Vous etes toujours seul, et c'est le dernier troncon."
  },

  secondInCommandComments: {
    "road_scouts_forward": "Bon choix, mon capitaine. Je garde le reste au silence jusqu'a leur signal.",
    "road_hedgerow_route": "Lent mais sur. Je mets Malone en securite arriere.",
    "road_straight_through": "Capitaine, ces traces de pneus sont fraiches. Je ne marcherais pas la-dedans.",
    "road_open_field": "Mon capitaine, il n'y a pas de couvert la-bas. S'il y a une patrouille..."
  },

  decisions: [
    {
      id: "road_scouts_forward",
      text: "Envoyer deux hommes en avant pour reconnaitre le carrefour avant de bouger",
      tier: "excellent",
      requiresPhase: "squad",
      requiresCapability: "canScout",
      outcome: {
        success: {
          text: "Deux hommes se faufilent en avant a travers la haie. Cinq minutes de silence. Puis l'un apparait a la trouee, pouces leves — le fil est sans surveillance, la patrouille est partie. Vous traversez la route par paires, vite et bas. Le point de rassemblement est a deux cents metres. Vous voyez des parachutistes americains creuser.",
          context: "Eclaireurs ont confirme carrefour libre — fil sans surveillance, patrouille partie. Traverse par paires. Point de rassemblement atteint. Approche finale propre.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 8,
          readinessChange: 0
        },
        partial: {
          text: "Les eclaireurs atteignent le carrefour et signalent — mouvement a l'est, une patrouille allemande qui s'eloigne. Vous attendez dix minutes qu'ils partent, puis traversez. Lent, tendu, mais propre. Le point de rassemblement apparait dans la brume devant.",
          context: "Eclaireurs ont repere patrouille allemande se deplacer vers l'est. Attendu 10 minutes qu'ils partent. Traverse propre. Point de rassemblement atteint.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 2
        },
        failure: {
          text: "Les eclaireurs sont reperes — une sentinelle allemande tire un coup avant de foncer vers l'est. Vos hommes se dispersent, se regroupent, traversent le carrefour en courant. Personne touche, mais le coup attirera l'attention. Vous atteignez le point de rassemblement en haletant.",
          context: "Eclaireurs reperes par sentinelle. Un coup tire — sentinelle en fuite vers l'est. Escouade dispersee, regroupee, a traverse le carrefour en courant. Point de rassemblement atteint en alerte.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: 2,
          readinessChange: 5
        },
        wikiUnlocks: "route_selection",
        nextScene: "act2_scene01"
      }
    },
    {
      id: "road_hedgerow_route",
      text: "Suivre la haie vers le nord — eviter le carrefour entierement",
      tier: "sound",
      outcome: {
        success: {
          text: "Vous poussez a travers le bocage parallele a la route, luttant contre branches et boue. Vingt minutes a ramper, mais le carrefour reste derriere vous. La haie debouche sur un pre et les voila — parachutistes americains, trous de tirailleurs, antenne radio. Le point de rassemblement.",
          context: "Contournement par haie reussi. 20 minutes a travers le bocage, carrefour evite entierement. Point de rassemblement atteint par le flanc.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 1
        },
        partial: {
          text: "L'itineraire par la haie est plus long qu'il n'y parait. Ronces epaisses, un fosse de drainage avec de l'eau froide jusqu'a la taille. Une demi-heure de progression miserable avant de tomber sur le perimetre du point de rassemblement par l'est. Une sentinelle vous a failli tirer dessus avant que vous donniez le mot de passe.",
          context: "Itineraire par haie plus long que prevu. 30 minutes a travers ronces et fosse de drainage. Presque tire par sentinelle du point de rassemblement. Arrive cote est.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "Vous vous perdez dans le bocage. Les haies se ressemblent toutes dans le noir. Quarante minutes gaspillees avant de retrouver la route et devoir traverser l'intersection exposee de toute facon. Le point de rassemblement est la, mais vous avez brule du temps que vous n'aviez pas.",
          context: "Perdu dans le bocage. 40 minutes gaspillees. Oblige de traverser l'intersection exposee de toute facon. Point de rassemblement atteint, mais temps critique perdu.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 3
        },
        wikiUnlocks: "route_selection",
        nextScene: "act2_scene01"
      }
    },
    {
      id: "road_straight_through",
      text: "Traverser le carrefour directement — vitesse plutot que prudence",
      tier: "mediocre",
      outcome: {
        success: {
          text: "Vous poussez a travers le fil et traversez au trot. Le carrefour est vide — la patrouille qui a tendu le fil est partie depuis longtemps. Rapide et propre. Le point de rassemblement se materialise dans la lueur grise devant. Vous y etes arrive.",
          context: "Traverse directement a travers le fil au trot. Carrefour vide — patrouille partie. Transit rapide. Point de rassemblement atteint.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 3
        },
        partial: {
          text: "A mi-chemin de l'intersection, des phares apparaissent sur la route est — un vehicule allemand lance a vive allure. Vous vous plaquez dans le fosse. Il passe sans s'arreter, mais vous etes face contre la boue normande, le coeur dans la gorge. Le point de rassemblement est proche. Vous avalez les cent derniers metres en courant.",
          context: "Traverse l'intersection. Vehicule allemand apparu a mi-traversee — cache dans le fosse. Vehicule passe. Precipite les 100 derniers metres jusqu'au point de rassemblement.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 5
        },
        failure: {
          text: "Le fil accroche la botte de votre homme de tete. Il tombe lourdement, gourde qui claque sur la route. Un coup de fusil depuis la lisiere — une sentinelle allemande, precipitee et sauvage, mais proche. Vous ripostez et courez. Le point de rassemblement est la, mais les Allemands savent exactement ou vous avez traverse.",
          context: "Fil a fait trebucher l'homme de tete. Bruit a attire les tirs de sentinelle. Riposte et course. Point de rassemblement atteint mais point de traversee compromis.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -3,
          readinessChange: 8
        },
        wikiUnlocks: "route_selection",
        nextScene: "act2_scene01"
      }
    },
    {
      id: "road_open_field",
      text: "Couper a travers le pre decouvert pour tout contourner",
      tier: "reckless",
      outcome: {
        success: {
          text: "Vous quittez le chemin et traversez le pre en courant bas. Terrain decouvert, expose, mais rapide. Rien ne tire. Les sentinelles du point de rassemblement vous defient depuis la lisiere. 'Flash.' 'Thunder.' Vous etes entre. Ca a marche, mais Henderson vous lance un regard qui dit ne refaites jamais ca.",
          context: "Traverse le pre decouvert en courant. Aucun tir recu. Sentinelles du point de rassemblement ont defie — autorise. Arrive expose mais vite.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 4
        },
        partial: {
          text: "A mi-chemin du champ, une fusee monte de quelque part a l'est — tout le pre eclaire en blanc. Vous vous jetez a plat, visage dans l'herbe mouillee. La fusee s'estompe. Personne ne tire. Vous rampez sur le ventre les deux cents derniers metres. Les sentinelles du point de rassemblement vous trouvent couvert de boue et tremblant.",
          context: "Traverse le champ decouvert. Fusee allemande a illumine la position a mi-traversee. Jete a plat, rampe 200m sur le ventre. Point de rassemblement atteint, secoue.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 6
        },
        failure: {
          text: "Le pre est mine. La premiere explosion projette de la terre six metres en l'air. Tout le monde se disperse. La deuxieme explosion atteint la jambe de quelqu'un — il tombe en hurlant. Vous le trainez sur les cent derniers metres jusqu'au perimetre du point de rassemblement pendant que le reste du peloton assure un tir de couverture sur des ombres.",
          context: "Pre mine. Deux detonations — un ami a perdu une jambe. Blesse traine jusqu'au point de rassemblement sous tir de couverture. Un tue.",
          menLost: 1,
          ammoSpent: -5,
          moraleChange: -8,
          readinessChange: 10
        },
        wikiUnlocks: "route_selection",
        nextScene: "act2_scene01"
      }
    }
  ]
};
