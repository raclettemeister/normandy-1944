import { useState, useEffect } from "react";
import type { GameState, PlaythroughEvent } from "../types/index.ts";
import { NarrativeService } from "../services/narrativeService.ts";
import { getRelationshipsForSoldier } from "../content/relationships.ts";

interface EpilogueScreenProps {
  finalState: GameState;
  captainSurvived: boolean;
  onRestart: () => void;
  narrativeService: NarrativeService;
  eventLog: PlaythroughEvent[];
}

function generateDefaultEpilogue(
  name: string,
  status: string,
  hometown: string
): string {
  switch (status) {
    case "active":
      return `${name} survived the war. He returned to ${hometown} and lived a quiet life. He rarely spoke about what happened in Normandy.`;
    case "wounded":
      return `${name} was evacuated to a field hospital in England. After months of recovery, he was sent home to ${hometown}. He walked with a limp for the rest of his life.`;
    case "KIA":
      return `${name} was killed in action near Sainte-Marie-du-Mont on June 6, 1944. He is buried at the Normandy American Cemetery in Colleville-sur-Mer, France. His family in ${hometown} received his posthumous Purple Heart.`;
    case "missing":
      return `${name} was captured by German forces on June 6. He spent months as a POW before being liberated in 1945. He returned to ${hometown} and never spoke about the camp.`;
    default:
      return `${name} served with distinction.`;
  }
}

export default function EpilogueScreen({
  finalState,
  captainSurvived,
  onRestart,
  narrativeService,
  eventLog,
}: EpilogueScreenProps) {
  const survived = finalState.roster.filter(
    (s) => s.status === "active"
  ).length;
  const total = finalState.roster.length;

  const [epilogues, setEpilogues] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(narrativeService.getMode() === "llm");

  useEffect(() => {
    if (narrativeService.getMode() !== "llm") return;

    const eventsBySoldier = new Map<string, PlaythroughEvent[]>();
    const relationshipsBySoldier = new Map();
    const allStatuses = finalState.roster.map(s => ({ id: s.id, status: s.status }));

    for (const soldier of finalState.roster) {
      eventsBySoldier.set(
        soldier.id,
        eventLog.filter(e => e.soldierIds.includes(soldier.id))
      );
      relationshipsBySoldier.set(
        soldier.id,
        getRelationshipsForSoldier(soldier.id)
      );
    }

    narrativeService.generateEpilogues(
      finalState.roster,
      eventsBySoldier,
      relationshipsBySoldier,
    ).then(results => {
      setEpilogues(results);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [narrativeService, finalState.roster, eventLog]);

  function getEpilogue(soldierId: string, name: string, status: string, hometown: string): string {
    return epilogues.get(soldierId) ?? generateDefaultEpilogue(name, status, hometown);
  }

  return (
    <div className="epilogue-screen" data-testid="epilogue-screen">
      <h2 className="epilogue-screen__title">After the War</h2>

      {captainSurvived ? (
        <div className="epilogue-soldier">
          <div className="epilogue-soldier__name">The Captain</div>
          <div className="epilogue-soldier__text">
            He led 2nd Platoon through 24 hours of combat in Normandy.{" "}
            {survived} of his {total} men survived the day. He went on to fight
            through Carentan, Market Garden, and the Bulge. He carried the names
            of the men he lost for the rest of his life.
          </div>
        </div>
      ) : (
        <div className="epilogue-soldier">
          <div className="epilogue-soldier__name">The Captain</div>
          <div className="epilogue-soldier__text">
            He was killed in action near Sainte-Marie-du-Mont on June 6, 1944.
            {finalState.secondInCommand && (
              <>
                {" "}
                Command passed to {finalState.secondInCommand.soldier.rank}{" "}
                {finalState.secondInCommand.soldier.name}.
              </>
            )}{" "}
            {survived} of {total} men survived the day.
          </div>
        </div>
      )}

      {loading && (
        <div className="epilogue-loading" data-testid="epilogue-loading">
          Generating epilogues...
        </div>
      )}

      {finalState.roster.map((soldier) => (
        <div
          key={soldier.id}
          className="epilogue-soldier"
          data-testid={`epilogue-soldier-${soldier.id}`}
        >
          <div className="epilogue-soldier__name">
            {soldier.rank} {soldier.name}
            {soldier.nickname ? ` "${soldier.nickname}"` : ""}
          </div>
          <div className="epilogue-soldier__text">
            {getEpilogue(soldier.id, soldier.name, soldier.status, soldier.hometown)}
          </div>
        </div>
      ))}

      <div className="epilogue-screen__footer">
        <p className="epilogue-memorial">
          In memory of the men who fought and died in Normandy, June 6, 1944.
        </p>
        <div data-testid="run-statistics" style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Scenes visited: {finalState.scenesVisited.length} · Lessons
            learned: {finalState.lessonsUnlocked.length} · Final men:{" "}
            {finalState.men}
          </p>
        </div>
        <button
          className="btn btn--primary"
          data-testid="restart-btn"
          onClick={onRestart}
        >
          Begin Again
        </button>
      </div>
    </div>
  );
}
