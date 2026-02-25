import type { Scenario } from '../../../types';

export const scene05_the_patrol: Scenario = {
  id: "act1_the_patrol",
  act: 1,
  timeCost: 20,
  combatScene: true,

  narrative:
    "You spot them before they spot you. Four Germans at a stone bridge over a drainage canal. " +
    "A Feldwebel hunches over papers spread on the bridge wall, reading by shielded torchlight. " +
    "One soldier guards a French civilian with bound hands. " +
    "If those papers reach the German command post, they'll know where every drop zone is. " +
    "The Feldwebel barks an order — they're getting ready to move.",

  narrativeAlt: {
    squad:
      "Henderson crawls up beside you. He studies the bridge for ten seconds. " +
      "'Papers,' he whispers. 'That's bad for us if those get through, Captain.' " +
      "A pause. 'But we've got the mission to think about. Your call.'",
    solo:
      "You're alone. Four Germans. You have a pistol, a knife, and two grenades. " +
      "The math isn't good."
  },

  secondInCommandComments: {
    patrol_l_ambush: "Good position, sir. I'll take the second element. On your signal.",
    patrol_linear_ambush: "One-sided, sir? Better than nothing. But some'll get away down the bridge.",
    patrol_knife: "That's... optimistic, Captain. You knife one, the other three hear it.",
    patrol_open_fire: "No setup, sir? Just... shooting?",
    patrol_charge: "Captain — you are not serious. A bayonet charge? Against four men with submachine guns?",
    patrol_rocks: "Rocks, sir? These aren't children.",
    patrol_animal_sounds: "Sir... you want to moo at them?",
    patrol_let_pass: "Those papers, sir. If they get back to their CP, they'll know where every DZ is. That's going to hurt us.",
    patrol_decoy: "Who are you sending out there, sir?"
  },

  decisions: [
    {
      id: "patrol_l_ambush",
      text: "Set an L-shaped ambush — two teams, crossfire",
      tier: "excellent",
      requiresPhase: "squad",
      minMen: 3,
      outcome: {
        success: {
          text:
            "Two elements in position. You wait until the Germans cluster near the Feldwebel, then signal. " +
            "Converging fire from two angles — ten seconds and it's over. Four dead, zero friendly. " +
            "You pull the papers from the Feldwebel's body. Patrol routes, unit dispositions. Gold.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 8,
          readinessChange: 5,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "Ambush fires. Three Germans drop. The fourth runs — Malone chases, fires, drops him thirty meters out. " +
            "But return fire nicked Doyle's arm. Not serious, but he's bleeding. " +
            "You get the papers. The French civilian is shaking but alive.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: 5,
          readinessChange: 7,
          intelGained: "knowsPatrolRoute"
        },
        failure: {
          text:
            "Doyle fires early. The Germans scatter before your fire teams converge. " +
            "A confused firefight in the dark. Two dead, two escaped toward the village. " +
            "You recover some papers but they'll report contact. Doyle won't stop shaking.",
          menLost: 0,
          ammoSpent: -12,
          moraleChange: 1,
          readinessChange: 12
        },
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_linear_ambush",
      text: "Line everyone up and fire from here — on my mark",
      tier: "mediocre",
      requiresPhase: "squad",
      minMen: 2,
      outcome: {
        success: {
          text:
            "Your men line the hedgerow. Signal. A volley rips into the Germans — three drop immediately. " +
            "The fourth crawls behind the bridge wall and fires back. Henderson flanks and finishes it. " +
            "You get the papers.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: 3,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "The volley drops two. Two others run — one escapes, one is hit fifty meters out. " +
            "Papers scattered. You find half of them. The escaped German will report contact.",
          menLost: 0,
          ammoSpent: -12,
          moraleChange: 1,
          readinessChange: 10
        },
        failure: {
          text:
            "Linear fire doesn't cover the far side of the bridge. Three Germans escape. " +
            "They fire as they run. A round hits the wall next to your head. " +
            "The Feldwebel grabbed the papers.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -3,
          readinessChange: 12
        },
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_knife",
      text: "Crawl up and knife the rear sentry, then rush them",
      tier: "reckless",
      outcome: {
        success: {
          text:
            "You crawl to within arm's reach. The knife goes in clean — hand over the mouth, blade between the ribs. " +
            "He sags. The others don't notice. Your men close the distance. " +
            "A short, vicious fight at close range. It works. Barely.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: 2,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "The knife goes in but the German screams. Everything goes loud. " +
            "Close-range firefight at the bridge. Two dead, one surrendering, one escaped. " +
            "Your hands are covered in blood. Doyle throws up.",
          menLost: 0,
          ammoSpent: -5,
          moraleChange: -3,
          readinessChange: 10
        },
        failure: {
          text:
            "Your boot kicks a stone. The sentry turns. You struggle — the knife misses. He screams. " +
            "The other three open fire. Your men fire back. A chaotic mess. You take a casualty.",
          menLost: 1,
          ammoSpent: -8,
          moraleChange: -6,
          readinessChange: 12
        },
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_open_fire",
      text: "Open fire right now — hit them before they move",
      tier: "reckless",
      outcome: {
        success: {
          text:
            "You fire. Your men fire. The Germans drop — surprised, caught in the open. " +
            "But it cost you. A lot of ammunition for a messy result. You grab the papers.",
          menLost: 0,
          ammoSpent: -12,
          moraleChange: 1,
          readinessChange: 10,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "Shots everywhere. Two Germans down. Two running. One makes it to the dark. " +
            "Papers soaked in canal water — half illegible. Ammo burned for a partial result.",
          menLost: 0,
          ammoSpent: -15,
          moraleChange: -2,
          readinessChange: 12
        },
        failure: {
          text:
            "You fire. They fire back. Everyone shooting into darkness. " +
            "When it stops, one German is dead, three escaped, and you've used nearly all your ammunition. Papers gone.",
          menLost: 1,
          ammoSpent: -15,
          moraleChange: -5,
          readinessChange: 12
        },
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_charge",
      text: "Fix bayonets — we charge them across the open ground",
      tier: "suicidal",
      requiresPhase: "squad",
      outcome: {
        success: {
          text:
            "By some miracle the charge closes the distance before they react. The fight is short and savage. " +
            "Four Germans dead. You look at your men. Doyle is staring at his bayonet. " +
            "The violence of it settles on everyone like a weight.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 15
        },
        partial: {
          text:
            "Running through open ground. A Schmeisser opens up. Someone goes down. " +
            "You reach the bridge — hand-to-hand. Ugly. You win. Barely. One of your men is hit.",
          menLost: 1,
          ammoSpent: -2,
          moraleChange: -8,
          readinessChange: 15
        },
        failure: {
          text:
            "They hear you coming. The Schmeisser tears into your line at twenty meters. " +
            "Two men go down before you close. The fight at the bridge is a slaughter — theirs and yours. " +
            "You survive. Some of your men don't.",
          menLost: 2,
          ammoSpent: -3,
          moraleChange: -12,
          readinessChange: 15
        },
        fatal: true,
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_rocks",
      text: "Throw rocks toward the canal to draw them off",
      tier: "reckless",
      requiresPhase: "squad",
      outcome: {
        success: {
          text:
            "Rocks splash in the canal. One German looks up. The rest don't move — " +
            "a splash during an invasion means nothing to them. " +
            "When you finally open fire, you've lost the element of complete surprise. It works, but the rocks added nothing.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 1,
          readinessChange: 8
        },
        partial: {
          text:
            "The rocks hit the bridge. A German investigates. But your flank position isn't ready — " +
            "you rushed the setup. A sloppy engagement. Two dead, two escaped. Papers partially recovered.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: -2,
          readinessChange: 10
        },
        failure: {
          text:
            "The Germans hear the rocks and go to alert. Garrison troops, but not stupid. " +
            "When you try to flank, they're already in cover. A firefight — messy, costly, loud.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -4,
          readinessChange: 12
        },
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_animal_sounds",
      text: "Make cow sounds to lure one away from the group",
      tier: "suicidal",
      outcome: {
        success: {
          text:
            "You make a noise. One German mutters and walks toward the hedgerow, rifle raised. " +
            "You jump him — a struggle, you put him down. " +
            "But the noise alerts the others. What started as a ruse turns into a firefight you didn't plan for.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: -3,
          readinessChange: 10
        },
        partial: {
          text:
            "Your cow impression is not convincing. The German says something to the Feldwebel. " +
            "Two men sent to investigate. They find you. Close-range firefight. Messy.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -6,
          readinessChange: 12
        },
        failure: {
          text:
            "You moo. The Feldwebel barks an order. All four Germans fan out toward your position with weapons raised. " +
            "They're not investigating livestock — they're clearing a suspected ambush position. " +
            "You've given away your location for nothing.",
          menLost: 1,
          ammoSpent: -12,
          moraleChange: -8,
          readinessChange: 12
        },
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_let_pass",
      text: "Let them pass — we can't risk a fight right now",
      tier: "sound",
      outcome: {
        success: {
          text:
            "You watch them leave. The Feldwebel folds the papers into his case. " +
            "They march the civilian down the road and disappear. No shots fired. " +
            "Henderson watches them go. 'We'll pay for that later, Captain.'",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 15
        },
        partial: {
          text:
            "They move out. One German glances your direction — you freeze. He keeps walking. " +
            "The French civilian looks over his shoulder toward the hedgerow, as if he knows you're there. " +
            "You let him go too.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 15
        },
        failure: {
          text:
            "They leave. You breathe. Five minutes later, a truck engine starts in the distance. " +
            "They had a vehicle. Those papers are already on the way to the CP. " +
            "Henderson says nothing. He doesn't have to.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -7,
          readinessChange: 18
        },
        lessonUnlocked: "tactical_patience",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_solo_steal",
      text: "Crawl through the drainage ditch and steal the map case",
      tier: "excellent",
      visibleIf: { phase: "solo" },
      outcome: {
        success: {
          text:
            "You slide into the drainage canal. Cold water to your waist. " +
            "The Feldwebel left the map case on the bridge wall while he briefs his men. " +
            "You reach up. Fingers close on the leather strap. Pull it under and crawl back the way you came. " +
            "They won't notice for ten minutes.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 10,
          readinessChange: 2,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "The canal is shallower than you thought. Ripples. The guard looks toward the water — you freeze, half-submerged. " +
            "An agonizing minute. He looks away. You grab the case but knock it against stone. " +
            "Shouting. Bullets hit the water around you. You make it to the hedgerow with the case.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        failure: {
          text:
            "The canal is too shallow. You can't stay submerged. A German sees movement in the water and fires. " +
            "You scramble backward, rounds snapping past. No case. Your position is known. You need to move.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 10
        },
        lessonUnlocked: "stealth_operations",
        nextScene: "act1_the_farmhouse"
      }
    },

    {
      id: "patrol_decoy",
      text: "Send one man as decoy, then hit them from the flank",
      tier: "mediocre",
      requiresPhase: "squad",
      minMen: 3,
      outcome: {
        success: {
          text:
            "Doyle runs along the hedgerow — visible, making noise. The Germans turn. You open fire. " +
            "Two down before they react. The Feldwebel grabs for the papers — Henderson puts a round through his hand. " +
            "Papers secured. Doyle makes it back, gasping.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 2,
          readinessChange: 8,
          intelGained: "knowsPatrolRoute"
        },
        partial: {
          text:
            "Doyle runs. The Germans fire at him — tracers chasing him through the dark. " +
            "You engage from the flank. Two down. Two escape. " +
            "Doyle is hit. Round through the calf. 'I'm okay,' he says. He's not okay.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: -2,
          readinessChange: 10
        },
        failure: {
          text:
            "Doyle runs. A burst catches him at twenty meters. He goes down hard. " +
            "You open fire but the Germans are already in cover. " +
            "A firefight you didn't want, and Doyle isn't moving.",
          menLost: 1,
          ammoSpent: -10,
          moraleChange: -8,
          readinessChange: 12
        },
        lessonUnlocked: "ambush_doctrine",
        nextScene: "act1_the_farmhouse"
      }
    }
  ]
};
