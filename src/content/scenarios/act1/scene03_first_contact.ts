import type { Scenario } from '../../../types';

// menGained: 1 represents gaining a stray paratrooper (+1 man)
export const scene03_first_contact: Scenario = {
  id: "act1_first_contact",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Hedgerow gap. Unidentified figure 20 meters ahead, darker than the dark. No visible uniform or weapon. Cricket clicker available. Recognition procedure: one click challenge, two clicks response.",

  narrative: "Footsteps ahead — twenty meters. A figure in the hedgerow gap, darker than the dark. No uniform or weapon you can see. One hand on your pistol, the other on the cricket clicker in your breast pocket. There was a recognition procedure in the briefing. You remember that much.",
  decisions: [
    {
      id: "contact_click_once",
      text: "Click the cricket once and listen for a reply",
      tier: "excellent",
      outcome: {
        success: {
          text: "One click-clack. Silence — then click-clack, click-clack from the dark. The figure steps forward: a PFC from the 502nd, shaking but armed, dropped miles off his DZ. 'Jesus, am I glad to see someone,' he whispers.",
          context: "Correct cricket challenge. Proper response received. Gained one stray PFC from 502nd, armed.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 0
        },
        partial: {
          text: "One click-clack. A long pause — then two clicks, hesitant, fumbling. An American from the 501st, badly shaken, separated from his stick. He can barely hold his clicker, but he's a body.",
          context: "Correct challenge, hesitant response. Gained one shaken trooper from 501st. Low readiness but extra manpower.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 0
        },
        failure: {
          text: "One click-clack, then nothing. The figure bolts through the hedgerow — you catch a flash of a 101st patch before he's gone. Too panicked to respond.",
          context: "Correct challenge but figure bolted. American 101st patch spotted. Too panicked to respond. No contact made.",
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
      text: "Click the cricket twice and listen for a reply",
      tier: "reckless",
      outcome: {
        success: {
          text: "Click-clack, click-clack. The figure freezes — that's the response, not the challenge. Thirty seconds of silence before he whispers 'Flash?' and you manage 'Thunder.' He's American, but you both stood in the open for half a minute sorting it out.",
          context: "Gave response instead of challenge. Confusion sorted after 30 seconds exposed. Gained one trooper but sloppy contact.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 2
        },
        partial: {
          text: "Click-clack, click-clack. The figure backs away slowly, then scrambles through the hedgerow. You gave the response instead of the challenge. He didn't trust it.",
          context: "Wrong signal — gave response not challenge. Figure retreated, didn't trust it. No contact made.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 3
        },
        failure: {
          text: "Click-clack, click-clack. A shot cracks the air — muzzle flash blinding in the dark, the round snapping past your ear. You hit the dirt. By the time you look up, he's gone. An American who shot at you because you gave the wrong signal.",
          context: "Wrong signal triggered friendly fire. Shot snapped past, near miss. American fled. Position compromised by gunshot.",
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
      text: "Click the cricket three times in quick succession",
      tier: "suicidal",
      outcome: {
        success: {
          text: "Three rapid clicks. The figure drops flat — you hear a rifle bolt being worked. 'WHO'S THERE?' An American voice, terrified. You call out 'Flash' and get 'Thunder' back, but he nearly killed you.",
          context: "Three clicks — meaningless signal. Nearly shot by terrified American. Verbal challenge salvaged contact. Extreme noise.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 5
        },
        partial: {
          text: "Three clicks. A burst of rifle fire — bullets thud into the hedgerow above as you press yourself into the dirt. When the shooting stops, the figure is gone. German or American, you'll never know.",
          context: "Three clicks triggered burst of rifle fire. Rounds into hedgerow overhead. Figure fled. Identity unknown. Area compromised.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 8
        },
        failure: {
          text: "Three clicks. The figure fires. Dirt and rock spray into your face as the round hits the ground beside you. You roll behind the hedgerow, half-blind. Everyone within five hundred meters heard those shots.",
          context: "Three clicks drew direct fire. Round hit ground beside captain. Half-blinded by debris. Gunshots audible 500m+.",
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
      text: "Whisper 'Flash' into the dark and wait",
      tier: "sound",
      outcome: {
        success: {
          text: "'Flash.' A beat. 'Thunder.' The relief almost buckles your knees. A PFC from the 506th — your own regiment — steps out from behind a stone wall. He's yours now.",
          context: "Verbal challenge. Correct response. Gained one PFC from 506th — same regiment. Clean contact.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 2
        },
        partial: {
          text: "'Flash.' Silence. Then, barely audible: '...Thunder?' He stumbles toward you — American, disoriented, maybe concussed from a hard landing. He'll slow you down, but he's an extra pair of eyes.",
          context: "Verbal challenge, slow response. Gained one trooper, possibly concussed. Extra body but reduced capability.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2
        },
        failure: {
          text: "'Flash.' Nothing. Again: 'Flash.' The figure turns and walks into the dark. Not running — walking. Maybe German, maybe a shell-shocked American who forgot the code. Your voice hung in the night air twice. You need to move.",
          context: "Verbal challenge twice, no response. Figure walked away. Voice exposed position. Need to relocate.",
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
      text: "Whisper 'Thunder' into the dark and wait",
      tier: "reckless",
      outcome: {
        success: {
          text: "'Thunder.' The figure cocks his head. Wrong word — that's the response, not the challenge. He whispers back: 'Flash?' You say 'Thunder' again. He comes over, shaking his head. 'You got it backwards, buddy.'",
          context: "Gave response instead of challenge. Confusion resolved. Gained one trooper but looked incompetent.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 3
        },
        partial: {
          text: "'Thunder.' Nothing. The figure steps back. Two full minutes of standoff in the dark before he whispers 'Flash?' and you realize your mistake. By then, you've both been standing in the open far too long.",
          context: "Wrong verbal — gave response first. Two-minute standoff exposed in open. No contact gained.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 4
        },
        failure: {
          text: "'Thunder.' The figure freezes. Says nothing. Then he disappears into the hedgerow at a run. He thinks you're German — what American says the response first?",
          context: "Gave response first. Figure assumed German — fled at run. No contact. Procedure failure.",
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
      text: "Yell 'Flash' at the top of your voice",
      tier: "reckless",
      outcome: {
        success: {
          text: "'FLASH!' Your voice cracks the silence like a rifle shot. 'THUNDER!' the figure shouts back, then catches himself. 'Jesus Christ, keep your voice down.' He's American, but every ear in the area just turned your direction.",
          context: "Yelled challenge at full volume. Got response. Gained one trooper but massive noise signature. Area alerted.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 8
        },
        partial: {
          text: "'FLASH!' The word echoes off the hedgerows. The figure drops flat. Somewhere in the distance, a German voice barks something. The figure crawls toward you. 'Are you trying to get us killed?'",
          context: "Yelled challenge. Echo alerted Germans in distance. Gained one trooper. German voice responded to noise.",
          menLost: 0, menGained: 1,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 10
        },
        failure: {
          text: "'FLASH!' Silence — then a Schmeisser opens up from your left. The figure scatters. You hit the ground as bullets snap through the air above. When it stops, you're alone, and the Germans know exactly where you are.",
          context: "Yelled challenge. Drew Schmeisser fire from nearby German position. Figure fled. Alone and position known to enemy.",
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
      text: "Draw your pistol and fire at the figure",
      tier: "suicidal",
      outcome: {
        success: {
          text: "You fire. The figure drops. You rush forward — screaming eagle patch on his shoulder. 101st. American. The round hit his canteen. He's alive, staring up at you with an expression you'll carry for the rest of the war.",
          context: "Fired on unidentified figure. Hit canteen — American 101st, alive but shot at. Severe trust damage. Gunshot noise.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: -10,
          readinessChange: 8
        },
        partial: {
          text: "You fire. Miss. The figure fires back. Both of you shooting blind until he screams 'FLASH! FLASH! FLASH!' American. You stop. He stops. You find each other with shaking hands. You almost killed each other.",
          context: "Mutual blind firefight with American. Both missed. Identified by verbal challenge after shots fired. Massive noise signature.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -8,
          readinessChange: 10
        },
        failure: {
          text: "You fire. The figure crumples. Screaming eagle patch. 101st. He's not moving. You killed an American — alone in the dark, just like you — and you shot him dead.",
          context: "Shot and killed an American paratrooper, 101st. Friendly fire fatality. Catastrophic morale and psychological damage.",
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
      text: "Hold still — don't move, don't make a sound",
      tier: "mediocre",
      outcome: {
        success: {
          text: "You hold your breath. The figure stands there for what feels like an hour, then moves on into the hedgerow. Safe. But whoever that was, they could have been yours.",
          context: "Held still. Figure moved on without detecting. No contact made. Potential ally lost.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 0
        },
        partial: {
          text: "You freeze. The figure turns toward you — did he hear something? Your heart hammers against your ribs. Then he turns away and disappears. Safe, but alone.",
          context: "Froze. Figure almost detected, turned away. No contact made. Still alone.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 0
        },
        failure: {
          text: "You try to hold still but your boot shifts on gravel. The figure spins. A tense second — then he bolts. Gone. You're standing in the dark with a pounding heart and nothing to show for it.",
          context: "Tried to hold still but made noise. Figure spooked and bolted. No contact, minor noise made.",
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
      text: "Crawl backward slowly and slip through the gap",
      tier: "mediocre",
      outcome: {
        success: {
          text: "You ease backward, one hand behind you feeling for the gap. Slow. Silent. The figure never turns. You slip into the dark. Alive, but still completely alone.",
          context: "Silent withdrawal. Undetected. No contact made. Potential ally bypassed.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 0
        },
        partial: {
          text: "You back up. A branch snaps under your knee. The figure turns — but you're already through the gap. You hear a whisper behind you, but you're gone.",
          context: "Retreated. Branch snapped, nearly detected. Escaped through gap. No contact made.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 1
        },
        failure: {
          text: "You crawl backward and your canteen clanks against your pistol. The figure drops to a knee — rifle bolt. You freeze. A minute passes that feels like an hour before he moves on. You're shaking.",
          context: "Retreat failed — canteen noise. Figure readied weapon. Tense standoff before he moved on. Shaken.",
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
