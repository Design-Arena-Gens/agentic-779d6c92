"use client";

import type { OfflineResponse } from "@/lib/offlineAgent";

interface InsightPanelProps {
  response: OfflineResponse | null;
}

export const InsightPanel = ({ response }: InsightPanelProps) => {
  if (!response) {
    return (
      <div className="insight-grid">
        <div className="insight-card">
          <h3>Need intel?</h3>
          <p>
            Trigger offline mode to mine the embedded playbooks, or flip to hybrid for live model
            synthesis.
          </p>
        </div>
        <div className="insight-card">
          <h3>Parallel Threads</h3>
          <p>
            Spawn multiple threads to compare strategies. Each thread tracks its own context and
            mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="insight-grid">
      <div className="insight-card">
        <h3>Reasoning</h3>
        <p>{response.reasoning}</p>
      </div>
      <div className="insight-card">
        <h3>Synthesis</h3>
        <p>{response.synthesis}</p>
      </div>
      <div className="insight-card">
        <h3>Actions</h3>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-muted)" }}>
          {response.actionable.map((item, index) => (
            <li key={index} style={{ marginBottom: "6px" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {response.insights.map((insight) => (
        <div key={insight.entry.id} className="insight-card">
          <h3>{insight.entry.title}</h3>
          <p>{insight.entry.summary}</p>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", color: "var(--text-muted)" }}>
            {insight.entry.resources.map((resource) => (
              <li key={resource}>
                <a href={resource} target="_blank" rel="noreferrer">
                  {resource}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
