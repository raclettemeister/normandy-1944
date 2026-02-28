# Personnel Research — Roster, Roles, Traits, Relationships

**Purpose:** Single reference for content writers: the 18-soldier roster, what each role does in play, how traits help or hurt tasks, and relationship dynamics. Maps to `src/engine/roster.ts` and `src/content/relationships.ts`.

---

## 1. Roster (18 soldiers)

| ID | Name | Rank | Role | Traits | Notes |
|----|------|------|------|--------|--------|
| henderson | Bill Henderson "Top" | SSgt | platoon_sergeant | veteran, steady | Senior NCO; 2IC. |
| malone | Frank Malone "Red" | Sgt | NCO | brave, hothead | Leads from the front; aggressive. |
| park | Eddie Park | Sgt | NCO | steady, sharpshooter | Calm, methodical. |
| rivera | Ray Rivera "Doc" | Cpl | medic | brave, steady | Medic; keep off point/assault. |
| kowalski | Walt Kowalski | Cpl | BAR_gunner | loyal, steady | BAR; pairs with Novak. |
| davis | Tommy Davis | Cpl | radioman | loud_mouth, lucky | Radio; critical for comms. |
| doyle | James Doyle "Jimmy" | PFC | rifleman | green, brave | Young, eager, first combat. |
| webb | Charlie Webb | PFC | rifleman | sharpshooter, scrounger | Good eyes; finds ammo. |
| ellis | Harold Ellis "Harry" | PFC | rifleman | green, quiet | Nervous, intellectual. |
| washington | Leon Washington | PFC | rifleman | veteran, resourceful | Tough, dependable. |
| caruso | Vincent Caruso "Vinnie" | PFC | rifleman | loud_mouth, brave | Loud, brave. |
| mitchell | Robert Mitchell "Bobby" | Pvt | rifleman | sharpshooter, quiet | Calm, writes home. |
| novak | Thomas Novak "Big Tom" | Pvt | rifleman | loyal, steady | BAR ammo bearer; Kowalski's partner. |
| sullivan | Eugene Sullivan "Gene" | Pvt | rifleman | steady, lucky | Superstitious, reliable. |
| bergman | Arthur Bergman "Art" | Pvt | rifleman | resourceful, quiet | Speaks some German. |
| jenkins | Floyd Jenkins | Pvt | rifleman | sharpshooter, scrounger | Hunter; good tracker. |
| herrera | Daniel Herrera "Danny" | Pvt | rifleman | brave, green | Fast, young. |
| palmer | Curtis Palmer "Curt" | Pvt | rifleman | coward, unlucky | Complainer; fights when it matters. |

---

## 2. Role Functions (what they do in the game)

| Role | In-game function | Good for | Bad for |
|------|------------------|----------|---------|
| **platoon_sergeant** | 2IC; coordinates squads; gives 2IC comments. | Leading rally, coordinating fire and movement. | Being sent alone on risky recon. |
| **NCO** | Squad leadership; executes orders; can lead fire teams. | Point, assault team lead, covering fire. | Sacrificial or solo jobs. |
| **medic** | canTreatWounded; stabilizes casualties. | Aid station, rear position, treating wounded. | Point man, assault stack, carrying the BAR. |
| **BAR_gunner** | Primary suppressive fire (canSuppress when present). | Covering movement, ambush kill zone. | Scouting alone, carrying wounded. |
| **MG_gunner** | (If present) Heavy suppressive fire. | Same as BAR; sustained fire. | Same as BAR. |
| **radioman** | hasRadio; comms with higher. | At CP or with commander. | Point, first through the door. |
| **rifleman** | Base infantry; can fill point, scout, ammo bearer. | Any role by trait (see below). | — |

---

## 3. Trait–Task Mapping (helps / hurts)

| Trait | Helps | Hurts |
|-------|--------|--------|
| **veteran** | Point, assault, leadership, steady under fire. | — |
| **steady** | Any high-stress role; covering fire; holding position. | — |
| **brave** | Assault, point (if not green), risky moves. | Can be too aggressive (pair with steady NCO). |
| **green** | — | Point (freezes), first assault, lone roles. |
| **hothead** | Aggressive assault. | Restraint; holding fire; coordination. |
| **sharpshooter** | Point (eyes), designated marksman, ambush. | — |
| **scrounger** | Scouting (finds ammo/supplies); patrol. | — |
| **loyal** | Team roles; ammo bearer for BAR; staying with buddy. | — |
| **coward** | — | Point, assault lead, any “first” role. |
| **unlucky** | — | High-risk roles (narrative weight). |
| **lucky** | Survives scrapes; finding things. | — |
| **quiet** | Stealth, listening post, not giving away position. | — |
| **loud_mouth** | Morale, distraction; not stealth. | Recon, listening post, ambush silence. |
| **resourceful** | Improvising; intel (e.g. Bergman, German). | — |
| **medic_instinct** | (If present) Helping wounded. | — |
| **natural_leader** | (If present) Leading when NCO is down. | — |

**Content use:** Assigning “Doyle (green) on point” → personnel issue (freeze risk). “Webb (sharpshooter, scrounger) on point” → bonus (eyes + finds stuff). “Rivera (medic) in the assault stack” → capability risk.

---

## 4. Relationships (from `relationships.ts`)

| Soldier | Target | Type | Detail (summary) |
|---------|--------|------|------------------|
| henderson | doyle | protective | Trained him; promised his mother to bring him back. |
| malone | caruso | rivalry | Boston vs Brooklyn; argue but inseparable. |
| kowalski | novak | brothers | BAR team; Novak carries ammo; work as one. |
| park | webb | depends_on | Park uses Webb as his eyes; Webb spots, Park shoots. |
| rivera | everyone | protective | Doc cares for everyone; losing him hurts hope. |
| palmer | malone | resents | Malone called him coward; Palmer resents it. |
| doyle | ellis | brothers | Both green, both scared; stick together. |
| washington | henderson | rivalry | Washington has seen danger; finds Henderson too cautious. |

**Content use:**
- **protective:** At risk if protected soldier is put in harm’s way (e.g. Doyle in the lead → Henderson stressed).
- **brothers:** Keep Kowalski–Novak together for BAR team; Doyle–Ellis together for morale, but don’t put both in the same high-risk role.
- **rivalry (malone–caruso):** Can spark friction or competition; not necessarily bad in a fight.
- **rivalry (washington–henderson):** Washington may question cautious orders; can add 2IC tension.
- **depends_on (park–webb):** Splitting them weakens Park’s effectiveness (no “eyes”).
- **resents (palmer–malone):** Putting Palmer under Malone’s direct lead can backfire.
- **protective (rivera–everyone):** Losing Rivera hits morale and medical capability; narrative weight when he’s at risk.

---

## 5. Mapping Tables for Content

### 5.1 Who can fill which “task” (for personnel evaluation)

| Task | Ideal | Acceptable | Poor |
|------|--------|-------------|------|
| Point / scout | webb, jenkins, park (with webb) | washington, mitchell | doyle, ellis, rivera, davis, palmer |
| BAR / suppressive | kowalski (novak ammo) | — | rivera, doyle |
| Assault lead | malone, park, washington | caruso, herrera | doyle, ellis, palmer |
| Medic / aid station | rivera | — | (any non-medic in medic role) |
| Radio / CP | davis | — | (radioman forward = risk) |
| Listening post | webb, mitchell, jenkins (quiet movement) | sullivan, bergman | caruso (loud) |

### 5.2 Relationship pairs (keep together / avoid together)

| Pair | Recommendation |
|------|----------------|
| kowalski + novak | Keep together (BAR team). |
| park + webb | Keep together (spotter–shooter). |
| doyle + ellis | Can keep together for morale; don’t put both on point. |
| palmer + malone | Avoid Palmer under Malone’s direct command if possible. |
| henderson + doyle | Henderson protective; Doyle in danger = narrative hook. |

---

## 6. Rally Order (for scene briefs)

Rally events in the game use this order (see `getRallyOrder()` in `roster.ts`):

1. henderson  
2. malone, doyle  
3. park, webb, ellis  
4. rivera, kowalski  
5. davis, caruso  
6. washington, mitchell, sullivan  
7. novak, bergman, jenkins  
8. herrera, palmer  

Use these IDs in scene briefs when specifying “rally soldiers for this scene.”
