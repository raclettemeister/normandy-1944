import { useState } from "react";
import type { WikiCategory } from "../types/index.ts";
import { WIKI_ENTRIES, getEntriesByCategory } from "../content/wiki.ts";

interface WikiPanelProps {
  unlockedEntryIds: string[];
  onClose: () => void;
}

const CATEGORIES: { key: WikiCategory; label: string }[] = [
  { key: "operation", label: "Operation" },
  { key: "your_unit", label: "Votre unite" },
  { key: "weapons_equipment", label: "Armes et equipement" },
  { key: "enemy_forces", label: "Forces ennemies" },
  { key: "terrain_landmarks", label: "Terrain et reperes" },
  { key: "tactics_learned", label: "Tactiques apprises" },
];

function isEntryVisible(entryId: string, alwaysAvailable: boolean, unlockedIds: string[]): boolean {
  return alwaysAvailable || unlockedIds.includes(entryId);
}

export default function WikiPanel({ unlockedEntryIds, onClose }: WikiPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory>("operation");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const entries = getEntriesByCategory(selectedCategory);
  const selectedEntry = selectedEntryId
    ? WIKI_ENTRIES.find((e) => e.id === selectedEntryId) ?? null
    : null;

  function getCategoryCount(cat: WikiCategory): { unlocked: number; total: number } {
    const catEntries = getEntriesByCategory(cat);
    const unlocked = catEntries.filter((e) =>
      isEntryVisible(e.id, e.alwaysAvailable, unlockedEntryIds)
    ).length;
    return { unlocked, total: catEntries.length };
  }

  if (selectedEntry && isEntryVisible(selectedEntry.id, selectedEntry.alwaysAvailable, unlockedEntryIds)) {
    return (
      <div className="overlay-backdrop" onClick={onClose}>
        <div className="overlay-panel wiki-panel" onClick={(e) => e.stopPropagation()}>
          <div className="overlay-header">
            <span className="overlay-title">Manuel de campagne</span>
            <button className="overlay-close" onClick={onClose}>ESC</button>
          </div>
          <div className="wiki-article">
            <button
              className="wiki-back-btn"
              onClick={() => setSelectedEntryId(null)}
            >
              &larr; Retour
            </button>
            <h2 className="wiki-article__term">{selectedEntry.term}</h2>
            <p className="wiki-article__short">{selectedEntry.shortDescription}</p>
            <p className="wiki-article__full">{selectedEntry.fullDescription}</p>
            {selectedEntry.tacticalNote && (
              <p className="wiki-article__tactical">
                <span className="wiki-article__tactical-label">Note tactique : </span>
                {selectedEntry.tacticalNote}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel wiki-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <span className="overlay-title">Manuel de campagne</span>
          <button className="overlay-close" onClick={onClose}>ESC</button>
        </div>
        <div className="wiki-layout">
          <nav className="wiki-categories">
            {CATEGORIES.map(({ key, label }) => {
              const { unlocked, total } = getCategoryCount(key);
              return (
                <button
                  key={key}
                  className={`wiki-category-btn ${selectedCategory === key ? "wiki-category-btn--active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(key);
                    setSelectedEntryId(null);
                  }}
                >
                  {label}
                  <span className="wiki-category-btn__count">{unlocked}/{total}</span>
                </button>
              );
            })}
          </nav>
          <div className="wiki-entries">
            {entries.length === 0 ? (
              <p className="wiki-empty">Aucune entree dans cette categorie.</p>
            ) : (
              entries.map((entry) => {
                const visible = isEntryVisible(entry.id, entry.alwaysAvailable, unlockedEntryIds);
                return (
                  <button
                    key={entry.id}
                    className={`wiki-entry-btn ${!visible ? "wiki-entry-btn--locked" : ""}`}
                    onClick={() => visible && setSelectedEntryId(entry.id)}
                    disabled={!visible}
                  >
                    <span className="wiki-entry-btn__term">{entry.term}</span>
                    <span className="wiki-entry-btn__desc">
                      {visible ? entry.shortDescription : "???"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
