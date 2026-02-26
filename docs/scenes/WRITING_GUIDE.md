# Scene Writing Guide — Normandy 1944

This guide applies to ALL scene TypeScript files. Read it before writing any content.

## Voice & Tone

- Second person, present tense. "You hear." "You move." "You fire."
- Terse. Military. Short sentences. Like Hemingway with a rifle.
- No adjective stacking. One sensory detail per sentence, not three.
- BAD: "The cold, biting, merciless water soaks through your drenched, exhausted body"
- GOOD: "The water is chest-deep. Cold enough to make your teeth lock."
- Let the situation carry the emotion. Don't tell the player how to feel.
- BAD: "You feel a wave of terror wash over you"
- GOOD: "Your hands are shaking. Not from the cold."

## Narrative Length

- **Scene opening narrative**: 4-6 sentences. Set the scene, establish stakes, end on the decision point.
- **Decision text** (what the player clicks): 8-12 words maximum. A verb phrase, not an essay. All decisions should be roughly the same length — do NOT make "correct" options longer or more detailed.
- **Outcome text** (success/partial/failure): 2-4 sentences. What happened, what it cost, what it felt like. No more.

## Character Voice

- **Henderson** (SSgt, platoon sergeant, your 2IC): Dry, professional, calm. Calls you "Captain" or "sir." Economy of words. When he disapproves, he says it once and moves on. Never raises his voice.
- **Malone** (Sgt, NCO): Blunt, Boston accent implied, aggressive. Swears under his breath. Acts first, thinks second. Loyal but volatile.
- **Doyle** (PFC, rifleman, green): Barely speaks. White knuckles on his rifle. When he does talk, it's short and scared. The kid everyone wants to protect.
- **Rivera** (Cpl, medic): Gentle, precise, emotional. Medical terminology mixed with human warmth. First to check if anyone's hurt. The heart of the platoon.
- **Kowalski** (Cpl, BAR gunner): Monosyllables. Nods. The BAR speaks for him. Built like an ox, quiet as a mouse. When he acts, it's decisive.

## Connecting Tissue

- Each scene's opening should subtly reference the passage of time and growing fatigue. Hours since the drop. Adrenaline wearing off.
- Low morale (< 30): narrative feels heavier — shorter sentences, more silence, physical exhaustion.
- High morale (> 60): hint of confidence — still terse, but less desperate.
- Henderson's first appearance (Scene 4) should feel like oxygen. The relief of not being alone.
- Rivera and Kowalski's appearance (Scene 6) should feel like capability — suddenly you can DO things.

## Creative Freedom

- The scene brief defines decisions, tiers, and state changes. These are FIXED. Do not change them.
- The narrative TEXT is where you have creative freedom. Make each outcome feel distinct and real.
- Add small details: a soldier's reaction, a sound in the distance, a physical sensation. These make scenes memorable.
- Vary sentence rhythm. Success outcomes can breathe a little. Failure outcomes should be clipped, harsh, fast.
- You MAY add brief environmental details not in the brief (a dead cow in the field, a burning farmhouse in the distance, the sound of naval guns) as long as they're historically plausible and don't affect mechanics.

## What Not To Do

- Don't editorialize. Never write "This was clearly the wrong choice."
- Don't reveal tiers. The player should never sense that one option is "excellent" and another "suicidal."
- Don't make correct options sound more professional or detailed than wrong ones.
- Don't use modern language. No "basically," "literally," "kind of." These men are from 1944.
- Don't write Hollywood dialogue. No quips before combat. No one-liners after a kill. War isn't witty.
- Don't add mechanics the brief doesn't specify. If the brief says moraleChange: +5, that's what it is.
- Don't use emojis or special formatting in narrative text.
- Don't break the fourth wall or reference game mechanics in narrative text.

## TypeScript Structure

Each scene file exports a single `Scenario` object. Follow this structure:

```typescript
import { Scenario } from '../../../types';

export const sceneXX: Scenario = {
  id: "act1_scene_id",
  act: 1,
  timeCost: 15,
  narrative: "Opening narrative here. 4-6 sentences.",
  narrativeAlt: {
    "hasCompass": "Alternative narrative when player has compass.",
    "low_morale": "Alternative when morale is below 30."
  },
  combatScene: false,
  secondInCommandComments: {
    "decision_id_1": "Henderson's comment for this decision.",
    "decision_id_2": "Henderson's comment for this decision."
  },
  decisions: [
    {
      id: "decision_id",
      text: "Short verb phrase, 8-12 words",
      tier: "sound",
      outcome: {
        success: {
          text: "2-4 sentence outcome.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 0
        },
        partial: {
          text: "2-4 sentence outcome.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 0
        },
        failure: {
          text: "2-4 sentence outcome.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 1
        },
        lessonUnlocked: "lesson_id_string",
        nextScene: "act1_next_scene_id"
      }
    }
  ]
};
```

## Historical Accuracy Reminders

- 101st Airborne, 506th PIR, Easy Company, 2nd Platoon
- Night of June 5-6, 1944, Normandy, France
- Cricket clicker: one click = challenge, two clicks = response
- Verbal challenge: "Flash" / response: "Thunder"
- Enemy: 709th Static Division (garrison troops, not elite)
- Terrain: Norman bocage — hedgerow-lined fields, stone walls, flooded lowlands
- Weather: overcast, no moon, scattered cloud cover
- Equipment: M1 Garand, M1 Carbine, BAR, Thompson, Colt .45 pistol, cricket clicker, compass, Gammon bombs
