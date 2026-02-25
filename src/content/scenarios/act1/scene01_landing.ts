import type { Scenario } from '../../../types';

export const scene01_landing: Scenario = {
  id: "act1_landing",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Night. Flooded field near DZ. Waist-deep in black water, parachute tangled in rigging lines. Rifle lost underwater, pistol on hip. AA fire along horizon. Alone in occupied France.",

  narrative:
    "You're waist-deep in black water. The parachute drags behind you, rigging lines knotted around your legs. No moon, no stars — just the distant pulse of anti-aircraft fire along the horizon. Your rifle is somewhere under the surface. The pistol is still on your hip. You are alone in occupied France.",

  narrativeAlt: {
    "assess_before_acting":
      "You're waist-deep in black water. The parachute drags behind you, rigging lines knotted around your legs. No moon, no stars — just the distant pulse of anti-aircraft fire along the horizon. Your rifle is somewhere under the surface. The pistol is still on your hip. You've done this before. Slow down. Think first.",
  },

  decisions: [
    {
      id: "landing_check_gear",
      text: "Check your gear — pat down every pocket, check each strap",
      tier: "excellent",
      outcome: {
        success: {
          text: "You work your pockets methodically. Pistol, two grenades, cricket clicker — all accounted for. Your fingers close around the compass in your trouser pocket. The luminous dial glows faint green.",
          context: "Systematic gear check. Found pistol, two grenades, cricket clicker, compass. All kit accounted for.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 0,
          intelGained: "hasCompass",
        },
        partial: {
          text: "Your hands are numb. You find the pistol, feel two grenades, but your fingers won't cooperate for anything smaller. You need dry ground before you can do a proper check.",
          context: "Partial gear check. Found pistol and grenades but hands too numb for thorough search. Need dry ground.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 0,
        },
        failure: {
          text: "You fumble with your harness. Something falls from the webbing — a small splash, then nothing. Your fingers search the water but it's gone. The cold is winning.",
          context: "Fumbled gear check in water. Lost a piece of equipment. Cold worsening, dexterity failing.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 0,
        },
        lessonUnlocked: "assess_before_acting",
        nextScene: "act1_finding_north",
      },
    },
    {
      id: "landing_assess",
      text: "Get your bearings — listen, look for any light or landmark",
      tier: "sound",
      outcome: {
        success: {
          text: "You force yourself to breathe and listen. Distant gunfire — north, maybe northeast. Then you see it: a church steeple, barely visible against the clouds. The briefing maps mentioned a steeple near the DZ.",
          context: "Stopped and assessed surroundings. Identified church steeple near DZ from briefing maps. Gunfire bearing established.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 0,
        },
        partial: {
          text: "You stop and listen. Explosions somewhere, but the sound bounces off the hedgerows. Every direction sounds the same. At least you're thinking clearly.",
          context: "Attempted orientation. Sound bouncing off hedgerows, no clear direction. Thinking clearly but still disoriented.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 0,
        },
        failure: {
          text: "You strain to hear, to see. The darkness gives you nothing and the cold is seeping deeper. You're no better oriented than when you landed.",
          context: "Failed to orient. Darkness and cold gave nothing useful. No closer to knowing position.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 0,
        },
        lessonUnlocked: "assess_before_acting",
        nextScene: "act1_finding_north",
      },
    },
    {
      id: "landing_move_fast",
      text: "Get out of this water — move to solid ground now",
      tier: "reckless",
      outcome: {
        success: {
          text: "You push through the water toward the nearest bank. Mud grabs at your boots. You haul yourself onto solid ground, dripping and gasping — but you have no idea which direction you're facing.",
          context: "Rushed to solid ground. Made it to bank but completely disoriented. No assessment done.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 2,
        },
        partial: {
          text: "You lurch forward. Your boot catches a submerged fence post and you go face-first into the water. You drag yourself to the bank coughing, pistol soaked.",
          context: "Tripped on submerged fence post. Face-first into water. Reached bank but pistol soaked.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 2,
        },
        failure: {
          text: "You thrash toward the bank and your ankle catches on something under the water — wire, a root. Pain shoots up your leg. You make it to solid ground limping, and someone might have heard all that splashing.",
          context: "Caught ankle on submerged obstacle. Injured leg, limping. Made excessive noise reaching bank. Possible detection.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 3,
        },
        lessonUnlocked: "assess_before_acting",
        nextScene: "act1_finding_north",
      },
    },
    {
      id: "landing_freeze",
      text: "Stay still — don't move, don't make a sound",
      tier: "mediocre",
      outcome: {
        success: {
          text: "You stand motionless. The water numbs your legs and the silence presses in. Minutes pass. Nobody is coming — you need to move.",
          context: "Froze in place for several minutes. No threats appeared. Time wasted standing in cold water.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 1,
        },
        partial: {
          text: "You wait. The cold creeps past your thighs. Your teeth start chattering and you clamp your jaw shut. Five minutes for nothing.",
          context: "Waited motionless five minutes. Cold seeping deeper, teeth chattering. No information gained.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 1,
        },
        failure: {
          text: "You freeze in place. Your legs go numb, then your hands. When you finally try to move, you stumble and splash. The cold has eaten into your muscles and you've gained nothing from the wait.",
          context: "Froze too long. Legs and hands went numb. Lost mobility to cold. Stumbled and made noise on exit.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -7,
          readinessChange: 2,
        },
        lessonUnlocked: "assess_before_acting",
        nextScene: "act1_finding_north",
      },
    },
  ],
};
