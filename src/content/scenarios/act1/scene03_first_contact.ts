import type { Scenario } from '../../../types';

// menGained: 1 represents gaining a stray paratrooper (+1 man)
export const scene03_first_contact: Scenario = {
  id: "act1_first_contact",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Trouee dans la haie. Silhouette non identifiee a vingt metres, plus sombre que l'obscurite. Pas d'uniforme ni d'arme visibles. Clicker disponible. Procedure de reconnaissance : un clic defi, deux clics reponse.",

  narrative: "Des pas devant — vingt metres. Une silhouette dans la trouee de la haie, plus sombre que l'obscurite. Pas d'uniforme ni d'arme visibles. Une main sur votre pistolet, l'autre sur le clicker dans la poche de poitrine. Il y avait une procedure de reconnaissance dans le briefing. Vous vous en souvenez.",
  decisions: [
    {
      id: "contact_click_once",
      text: "Faire cliquer le clicker une fois et ecouter la reponse",
      tier: "excellent",
      outcome: {
        success: {
          text: "Un clic-clac. Silence — puis clic-clac, clic-clac depuis l'obscurite. La silhouette s'avance : un soldat de la 502e, tremblant mais arme, tombe a des kilometres de sa zone de saut. 'Mon Dieu, content de voir quelqu'un,' chuchote-t-il.",
          context: "Defi clicker correct. Reponse appropriee recue. Gagne un soldat egaré de la 502e, arme.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 0
        },
        partial: {
          text: "Un clic-clac. Une longue pause — puis deux clics, hesitants, maladroits. Un Americain de la 501e, tres secoue, separe de son stick. Il tient a peine son clicker, mais c'est un corps de plus.",
          context: "Defi correct, reponse hesitante. Gagne un parachutiste secoue de la 501e. Faible preparation mais main-d'oeuvre supplementaire.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 0
        },
        failure: {
          text: "Un clic-clac, puis rien. La silhouette fonce a travers la haie — vous apercevez un insigne 101e avant qu'il disparaisse. Trop panique pour repondre.",
          context: "Defi correct mais la silhouette a fui. Insigne 101e apercu. Trop panique pour repondre. Pas de contact etabli.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 2
        },
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_click_twice",
      text: "Faire cliquer le clicker deux fois et ecouter la reponse",
      tier: "reckless",
      outcome: {
        success: {
          text: "Clic-clac, clic-clac. La silhouette se fige — c'est la reponse, pas le defi. Trente secondes de silence avant qu'il chuchote 'Flash?' et vous repondez 'Thunder.' Il est Americain, mais vous avez tous deux reste exposes une demi-minute a regler ca.",
          context: "Donne la reponse au lieu du defi. Confusion reglee apres 30 secondes d'exposition. Gagne un parachutiste mais contact neglige.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 2
        },
        partial: {
          text: "Clic-clac, clic-clac. La silhouette recule lentement, puis se precipite a travers la haie. Vous avez donne la reponse au lieu du defi. Il ne vous a pas fait confiance.",
          context: "Mauvais signal — donne la reponse pas le defi. La silhouette a recule, pas confiance. Pas de contact etabli.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 3
        },
        failure: {
          text: "Clic-clac, clic-clac. Un coup de feu dechire l'air — l'eclair de la bouche aveuglant dans le noir, la balle sifflant a votre oreille. Vous vous jetez au sol. Quand vous relevez la tete, il a disparu. Un Americain qui vous a tire dessus parce que vous avez donne le mauvais signal.",
          context: "Mauvais signal a declenche tir ami. Balle passee pres, quasi-accident. Americain en fuite. Position compromise par le coup de feu.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -6,
          readinessChange: 6
        },
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_click_three",
      text: "Faire cliquer le clicker trois fois rapidement",
      tier: "suicidal",
      outcome: {
        success: {
          text: "Trois clics rapides. La silhouette se jette au sol — vous entendez une culasse. 'QUI EST LA?' Une voix americaine, terrifiee. Vous criez 'Flash' et recevez 'Thunder', mais il a failli vous tuer.",
          context: "Trois clics — signal sans signification. Presque tue par un Americain terrifie. Defi verbal a sauve le contact. Bruit extreme.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 5
        },
        partial: {
          text: "Trois clics. Une rafale de fusil — les balles s'enfoncent dans la haie au-dessus de vous pendant que vous vous plaquez dans la terre. Quand les tirs s'arretent, la silhouette a disparu. Allemand ou Americain, vous ne saurez jamais.",
          context: "Trois clics ont declenche une rafale. Balles dans la haie au-dessus. Silhouette en fuite. Identite inconnue. Zone compromise.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 8
        },
        failure: {
          text: "Trois clics. La silhouette tire. Terre et cailloux vous eclaboussent le visage quand la balle frappe le sol a cote de vous. Vous roulez derriere la haie, a moitie aveugle. Tout le monde a cinq cents metres a entendu ces coups de feu.",
          context: "Trois clics ont attire des tirs directs. Balle a frappe le sol a cote du capitaine. A moitie aveugle par les debris. Coups de feu audibles a 500m+.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -10,
          readinessChange: 10
        },
        fatal: true,
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_flash",
      text: "Chuchoter 'Flash' dans le noir et attendre",
      tier: "sound",
      outcome: {
        success: {
          text: "'Flash.' Un temps. 'Thunder.' Le soulagement vous fait presque plier les genoux. Un soldat de la 506e — votre propre regiment — sort de derriere un mur de pierre. Il est a vous maintenant.",
          context: "Defi verbal. Reponse correcte. Gagne un soldat de la 506e — meme regiment. Contact propre.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 2
        },
        partial: {
          text: "'Flash.' Silence. Puis, a peine audible : '...Thunder?' Il trebuche vers vous — Americain, desoriente, peut-etre commotionne par un atterrissage brutal. Il vous ralentira, mais c'est une paire d'yeux de plus.",
          context: "Defi verbal, reponse lente. Gagne un parachutiste, peut-etre commotionne. Corps supplementaire mais capacite reduite.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2
        },
        failure: {
          text: "'Flash.' Rien. Encore : 'Flash.' La silhouette se retourne et s'en va dans le noir. Pas en courant — en marchant. Peut-etre Allemand, peut-etre un Americain choque qui a oublie le code. Votre voix a flotte deux fois dans l'air nocturne. Il faut bouger.",
          context: "Defi verbal deux fois, pas de reponse. Silhouette partie en marchant. Voix a expose la position. Besoin de se deplacer.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 4
        },
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_thunder",
      text: "Chuchoter 'Thunder' dans le noir et attendre",
      tier: "reckless",
      outcome: {
        success: {
          text: "'Thunder.' La silhouette penche la tete. Mauvais mot — c'est la reponse, pas le defi. Il chuchote : 'Flash?' Vous dites 'Thunder' encore. Il s'approche en secouant la tete. 'Tu t'es trompe de sens, mon pote.'",
          context: "Donne la reponse au lieu du defi. Confusion resolue. Gagne un parachutiste mais a l'air incompetent.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 3
        },
        partial: {
          text: "'Thunder.' Rien. La silhouette recule. Deux longues minutes de face-a-face dans le noir avant qu'il chuchote 'Flash?' et vous realisez votre erreur. D'ici la, vous avez tous deux reste exposes bien trop longtemps.",
          context: "Mauvais verbal — donne la reponse en premier. Face-a-face de deux minutes expose. Pas de contact etabli.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 4
        },
        failure: {
          text: "'Thunder.' La silhouette se fige. Ne dit rien. Puis il disparait dans la haie en courant. Il pense que vous etes Allemand — quel Americain dit la reponse en premier?",
          context: "Donne la reponse en premier. Silhouette a suppose Allemand — a fui en courant. Pas de contact. Echec de procedure.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 3
        },
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_yell_flash",
      text: "Crier 'Flash' a pleine voix",
      tier: "reckless",
      outcome: {
        success: {
          text: "'FLASH!' Votre voix dechire le silence comme un coup de fusil. 'THUNDER!' crie la silhouette en retour, puis se reprend. 'Mon Dieu, baisse la voix.' Il est Americain, mais toutes les oreilles du coin viennent de se tourner vers vous.",
          context: "Defi crie a pleine voix. Reponse obtenue. Gagne un parachutiste mais signature sonore massive. Zone alertee.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 8
        },
        partial: {
          text: "'FLASH!' Le mot resonne sur les haies. La silhouette se jette au sol. Quelque part au loin, une voix allemande aboie quelque chose. La silhouette rampe vers vous. 'Vous voulez nous faire tuer?'",
          context: "Defi crie. Echo a alerte les Allemands au loin. Gagne un parachutiste. Voix allemande a repondu au bruit.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 10
        },
        failure: {
          text: "'FLASH!' Silence — puis une Schmeisser ouvre le feu sur votre gauche. La silhouette se disperse. Vous vous jetez au sol pendant que les balles sifflent au-dessus. Quand ca s'arrete, vous etes seul, et les Allemands savent exactement ou vous etes.",
          context: "Defi crie. A attire des tirs Schmeisser d'une position allemande proche. Silhouette en fuite. Seul et position connue de l'ennemi.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 12
        },
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_shoot",
      text: "Degainer votre pistolet et tirer sur la silhouette",
      tier: "suicidal",
      outcome: {
        success: {
          text: "Vous tirez. La silhouette s'effondre. Vous vous precipitez — insigne aigle hurlant sur son epaule. 101e. Americain. La balle a touche sa gourde. Il est vivant, vous regarde avec une expression que vous porterez le reste de la guerre.",
          context: "Tire sur silhouette non identifiee. Touche la gourde — Americain 101e, vivant mais tire dessus. Degats de confiance severes. Bruit du coup de feu.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: -10,
          readinessChange: 8
        },
        partial: {
          text: "Vous tirez. Rate. La silhouette riposte. Vous vous tirez dessus tous les deux a l'aveugle jusqu'a ce qu'il crie 'FLASH! FLASH! FLASH!' Americain. Vous vous arretez. Lui aussi. Vous vous retrouvez a mains tremblantes. Vous avez failli vous tuer.",
          context: "Echange de tirs a l'aveugle avec Americain. Tous les deux ont rate. Identifie par defi verbal apres les coups de feu. Signature sonore massive.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -8,
          readinessChange: 10
        },
        failure: {
          text: "Vous tirez. La silhouette s'effondre. Insigne aigle hurlant. 101e. Il ne bouge plus. Vous avez tue un Americain — seul dans le noir, comme vous — et vous l'avez abattu.",
          context: "Tire et tue un parachutiste americain, 101e. Fatalite par tir ami. Degats moraux et psychologiques catastrophiques.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: -15,
          readinessChange: 10
        },
        fatal: true,
        wikiUnlocks: "identify_before_engaging",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_freeze",
      text: "Rester immobile — ne pas bouger, ne pas faire de bruit",
      tier: "mediocre",
      outcome: {
        success: {
          text: "Vous retenez votre souffle. La silhouette reste la pendant ce qui semble une heure, puis s'en va dans la haie. En securite. Mais qui que ce soit, il aurait pu etre des votres.",
          context: "Reste immobile. Silhouette partie sans vous detecter. Pas de contact etabli. Allie potentiel perdu.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 0
        },
        partial: {
          text: "Vous vous figez. La silhouette se tourne vers vous — a-t-il entendu quelque chose? Votre coeur martele vos cotes. Puis il se detourne et disparait. En securite, mais seul.",
          context: "Immobile. La silhouette a failli detecter votre presence, puis s'est detournee. Pas de contact etabli. Toujours seul.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 0
        },
        failure: {
          text: "Vous essayez de rester immobile mais votre botte bouge sur le gravier. La silhouette pivote. Une seconde tendue — puis il fonce. Parti. Vous restez dans le noir le coeur battant et rien a montrer.",
          context: "A essaye de rester immobile mais a fait du bruit. Silhouette effrayee et partie. Pas de contact, bruit mineur.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 1
        },
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    },
    {
      id: "contact_retreat",
      text: "Ramper en arriere lentement et vous faufiler par la trouee",
      tier: "mediocre",
      outcome: {
        success: {
          text: "Vous reculez doucement, une main derriere vous cherchant la trouee. Lent. Silencieux. La silhouette ne se retourne jamais. Vous vous glissez dans le noir. Vivant, mais toujours completement seul.",
          context: "Retrait silencieux. Non detecte. Pas de contact etabli. Allie potentiel contourne.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 0
        },
        partial: {
          text: "Vous reculez. Une branche craque sous votre genou. La silhouette se tourne — mais vous etes deja passe par la trouee. Vous entendez un chuchotement derriere vous, mais vous etes parti.",
          context: "Retraite. Branche cassee, presque detecte. Echappe par la trouee. Pas de contact etabli.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 1
        },
        failure: {
          text: "Vous rampez en arriere et votre gourde claque contre votre pistolet. La silhouette se met a genoux — culasse. Vous vous figez. Une minute qui semble une heure avant qu'il parte. Vous tremblez.",
          context: "Retraite ratee — bruit de gourde. Silhouette a arme son arme. Face-a-face tendu avant qu'il parte. Secoue.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 2
        },
        wikiUnlocks: "recognition_signals",
        nextScene: "act1_the_sergeant"
      }
    }
  ]
};
