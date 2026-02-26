import type { Scenario } from '../../../types';

export const scene05_the_patrol: Scenario = {
  id: "act1_the_patrol",
  act: 1,
  timeCost: 20,
  combatScene: true,

  sceneContext: "Stone bridge over drainage canal. Four Germans: Feldwebel reading papers by shielded torch, one guarding French civilian with bound hands. Papers contain DZ locations — critical intel. Patrol preparing to move out.",

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

  prepActions: [
    {
      id: "patrol_prep_ask_henderson",
      text: "Ask Henderson about the bridge",
      soldierId: "henderson",
      timeCost: 5,
      responseVeteran: "Four men. Feldwebel — see the torch? He's reading something. Papers. MG34 slung on the guard, not shouldered. Second man watching the French civilian. Other two are relaxed — smoking. They don't know we're here. Dead ground along the canal bank, maybe fifty meters to the bridge.",
      responseGreen: "There's... some Germans. On the bridge. One's got a light.",
    },
    {
      id: "patrol_prep_check_canal",
      text: "Check the drainage canal for cover",
      timeCost: 5,
      responseVeteran: "Canal bank is about three feet deep. Good dead ground — you could move a fire team along it to within thirty meters of the bridge without being seen. Mud at the bottom, so it'll be slow and quiet.",
      responseGreen: "It's a ditch. Pretty deep. Muddy.",
    },
    {
      id: "patrol_prep_ask_malone",
      text: "Ask Malone what he thinks",
      soldierId: "malone",
      timeCost: 5,
      responseVeteran: "Let me take my guys around the left, Captain. Through that canal. We hit 'em fast — they won't know what happened. I'll go first.",
      responseGreen: "I can go. Whatever you need, sir. Just say the word.",
    },
  ],

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
          context: "L-ambush executed textbook. Converging fire, 10 seconds. Four enemy KIA, zero friendly casualties. Intel papers recovered.",
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
          context: "L-ambush mostly successful. Three down, fourth killed in pursuit. Doyle nicked — minor wound. Papers recovered. Civilian alive.",
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
          context: "Premature fire by Doyle. Germans scattered. Two KIA, two escaped — will report contact. Partial intel only.",
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
          context: "Linear ambush. Three down on volley, fourth flanked by Henderson. Papers recovered. No crossfire advantage.",
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
          context: "Linear fire dropped two. One escaped, one killed running. Half the papers recovered. Enemy will report contact.",
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
          context: "Linear ambush failed — no coverage on far side. Three escaped with papers. One friendly KIA. Intel lost.",
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
          context: "Knife kill on sentry — silent. Close-range fight took remaining three. Papers recovered. Barely clean.",
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
          context: "Knife failed to silence sentry. Close-range firefight. Two KIA, one POW, one escaped. Squad shaken by violence.",
          menLost: 0,
          ammoSpent: -5,
          moraleChange: -3,
          readinessChange: 10
        },
        failure: {
          text:
            "Your boot kicks a stone. The sentry turns. You struggle — the knife misses. He screams. " +
            "The other three open fire. Your men fire back. A chaotic mess. You take a casualty.",
          context: "Approach detected. Knife missed. Chaotic firefight at bridge. One friendly KIA. No intel recovered.",
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
          context: "Hasty fire. Germans surprised but engagement was wasteful. Four KIA. Papers recovered. High ammo expenditure.",
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
          context: "Uncontrolled fire. Two KIA, one escaped. Papers water-damaged, half illegible. Excessive ammo burned.",
          menLost: 0,
          ammoSpent: -15,
          moraleChange: -2,
          readinessChange: 12
        },
        failure: {
          text:
            "You fire. They fire back. Everyone shooting into darkness. " +
            "When it stops, one German is dead, three escaped, and you've used nearly all your ammunition. Papers gone.",
          context: "Blind firefight. One German KIA, three escaped with papers. Nearly all ammunition expended. One friendly KIA.",
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
          context: "Bayonet charge closed distance before reaction. Four enemy KIA in melee. Zero friendly casualties. Severe psychological impact on squad.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 15
        },
        partial: {
          text:
            "Running through open ground. A Schmeisser opens up. Someone goes down. " +
            "You reach the bridge — hand-to-hand. Ugly. You win. Barely. One of your men is hit.",
          context: "Bayonet charge across open ground. Schmeisser fire during approach — one friendly KIA. Hand-to-hand at bridge. Pyrrhic win.",
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
          context: "Charge detected at 20m. Schmeisser cut into line. Two friendly KIA. Melee at bridge — both sides devastated.",
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
          context: "Rock distraction ineffective — ignored by garrison troops. Opened fire without full surprise. Four KIA but rocks wasted time.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 1,
          readinessChange: 8
        },
        partial: {
          text:
            "The rocks hit the bridge. A German investigates. But your flank position isn't ready — " +
            "you rushed the setup. A sloppy engagement. Two dead, two escaped. Papers partially recovered.",
          context: "Rock distraction pulled one German but flank not ready. Sloppy engagement — two KIA, two escaped. Partial intel.",
          menLost: 0,
          ammoSpent: -10,
          moraleChange: -2,
          readinessChange: 10
        },
        failure: {
          text:
            "The Germans hear the rocks and go to alert. Garrison troops, but not stupid. " +
            "When you try to flank, they're already in cover. A firefight — messy, costly, loud.",
          context: "Rocks alerted Germans to full alert. Flank attempt found them in cover. Costly firefight. One friendly KIA.",
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
          context: "Animal noise drew one German. Killed in struggle but noise triggered unplanned firefight. Position exposed.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: -3,
          readinessChange: 10
        },
        partial: {
          text:
            "Your cow impression is not convincing. The German says something to the Feldwebel. " +
            "Two men sent to investigate. They find you. Close-range firefight. Messy.",
          context: "Unconvincing animal sound. Two Germans sent to investigate. Close-range firefight. One friendly KIA.",
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
          context: "Animal sound recognized as suspicious. All four Germans swept toward position. Ambush position revealed. One friendly KIA.",
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
          context: "Let patrol pass. No engagement. Papers and civilian taken by Germans. No casualties, no ammo spent, but intel lost.",
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
          context: "Let patrol pass. Nearly detected — German glanced toward position. Papers lost. French civilian taken. No engagement.",
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
          context: "Let patrol pass. Enemy had vehicle — papers already en route to CP. DZ intel will reach German command. Strategic failure.",
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
          context: "Infiltrated via drainage canal. Stole map case undetected. Intel recovered, no shots fired, no casualties. Ten-minute head start.",
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
          context: "Canal infiltration detected on extraction. Grabbed case but drew fire. Intel recovered but position known. No casualties.",
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
          context: "Canal too shallow. Detected and fired upon. No intel recovered. Position compromised. Forced to withdraw.",
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
          context: "Decoy drew attention. Flanking fire dropped two, Henderson stopped Feldwebel. Papers secured. Decoy returned safely.",
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
          context: "Decoy drew fire — Doyle hit in calf, wounded. Flank fire dropped two, two escaped. No intel recovered.",
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
          context: "Decoy Doyle killed at 20 meters. Germans reached cover before flanking fire. Firefight with enemy in cover. One friendly KIA.",
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
