/* =========================================================
   GRIT V2 — ANALYSIS UI
   Version 1
   ========================================================= */

(function () {
  "use strict";

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function statusLabel(status) {
    const labels = {
      excellent: "Excellent",
      good: "Bon",
      moderate: "À surveiller",
      warning: "Attention",
      alert: "Priorité",
      unknown: "Données insuffisantes"
    };

    return labels[status] || "Analyse";
  }

  function statusIcon(status) {
    const icons = {
      excellent: "🟢",
      good: "🟢",
      moderate: "🟡",
      warning: "🟠",
      alert: "🔴",
      unknown: "⚪"
    };

    return icons[status] || "⚪";
  }

  function createStyles() {
    if (document.getElementById("grit-v2-analysis-styles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "grit-v2-analysis-styles";

    style.textContent = `
      .grit-v2-analysis {
        padding: 16px;
        max-width: 900px;
        margin: 0 auto;
      }

      .grit-v2-analysis-header {
        margin-bottom: 20px;
      }

      .grit-v2-analysis-header h2 {
        margin: 0 0 6px;
      }

      .grit-v2-analysis-subtitle {
        opacity: 0.75;
        font-size: 14px;
      }

      .grit-v2-analysis-score {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 18px;
        border-radius: 18px;
        margin-bottom: 16px;
        background: var(--card, rgba(255,255,255,.06));
        border: 1px solid rgba(255,255,255,.08);
      }

      .grit-v2-score-number {
        font-size: 34px;
        font-weight: 800;
      }

      .grit-v2-score-label {
        font-size: 13px;
        opacity: .7;
      }

      .grit-v2-analysis-card {
        padding: 18px;
        border-radius: 18px;
        margin-bottom: 14px;
        background: var(--card, rgba(255,255,255,.06));
        border: 1px solid rgba(255,255,255,.08);
      }

      .grit-v2-analysis-card h3 {
        margin-top: 0;
        margin-bottom: 12px;
      }

      .grit-v2-observation {
        display: flex;
        gap: 10px;
        margin: 10px 0;
        line-height: 1.45;
      }

      .grit-v2-priority {
        padding: 11px 12px;
        margin: 8px 0;
        border-radius: 12px;
        background: rgba(255,255,255,.04);
      }

      .grit-v2-analysis-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 18px;
      }

      .grit-v2-analysis-btn {
        border: 0;
        border-radius: 12px;
        padding: 11px 15px;
        cursor: pointer;
        font-weight: 700;
      }

      .grit-v2-analysis-btn.secondary {
        background: rgba(255,255,255,.08);
        color: inherit;
      }

      .grit-v2-analysis-empty {
        text-align: center;
        padding: 30px 18px;
        opacity: .8;
      }
    `;

    document.head.appendChild(style);
  }

  function renderAnalysis(container) {
    if (!container) return;

    if (
      !window.GRIT_V2 ||
      !window.GRIT_V2_ANALYSIS
    ) {
      container.innerHTML = `
        <div class="grit-v2-analysis-empty">
          <p>🧠 L'analyse GRIT n'est pas encore disponible.</p>
        </div>
      `;
      return;
    }

    const analysis =
      window.GRIT_V2_ANALYSIS.generateAnalysis();

    const score =
      analysis.score !== null
        ? `${escapeHTML(analysis.score)}/100`
        : "—";

    const status =
      statusLabel(analysis.status);

    const observations =
      analysis.observations || [];

    const priorities =
      analysis.priorities || [];

    container.innerHTML = `
      <div class="grit-v2-analysis">

        <div class="grit-v2-analysis-header">
          <h2>🧠 Mon analyse</h2>
          <div class="grit-v2-analysis-subtitle">
            Une lecture personnalisée de tes données récentes.
          </div>
        </div>

        <div class="grit-v2-analysis-score">

          <div>
            <div class="grit-v2-score-number">
              ${score}
            </div>

            <div class="grit-v2-score-label">
              Récupération estimée
            </div>
          </div>

          <div>
            <strong>
              ${status}
            </strong>
          </div>

        </div>

        <div class="grit-v2-analysis-card">

          <h3>🔎 Ce que GRIT remarque</h3>

          <p>
            ${escapeHTML(analysis.summary)}
          </p>

          ${observations
            .map(
              observation => `
                <div class="grit-v2-observation">
                  <span>•</span>
                  <span>
                    ${escapeHTML(observation)}
                  </span>
                </div>
              `
            )
            .join("")}

        </div>

        <div class="grit-v2-analysis-card">

          <h3>🎯 Tes priorités</h3>

          ${
            priorities.length
              ? priorities
                  .map(
                    (priority, index) => `
                      <div class="grit-v2-priority">
                        <strong>
                          ${index + 1}.
                        </strong>
                        ${escapeHTML(priority)}
                      </div>
                    `
                  )
                  .join("")
              : `
                  <p>
                    Continue à renseigner régulièrement tes données pour obtenir des priorités plus précises.
                  </p>
                `
          }

        </div>

        <div class="grit-v2-analysis-card">

          <h3>📊 Détails</h3>

          <p>
            ${statusIcon(analysis.recovery.sleep.status)}
            Sommeil :
            ${escapeHTML(analysis.recovery.sleep.message)}
          </p>

          <p>
            ${statusIcon(analysis.recovery.training.status)}
            Entraînement :
            ${escapeHTML(analysis.recovery.training.message)}
          </p>

          <p>
            ${statusIcon(analysis.recovery.pain.status)}
            Douleurs :
            ${escapeHTML(analysis.recovery.pain.message)}
          </p>

        </div>

        <div class="grit-v2-analysis-actions">

          <button
            type="button"
            class="grit-v2-analysis-btn"
            id="grit-v2-refresh-analysis"
          >
            🔄 Actualiser l'analyse
          </button>

          <button
            type="button"
            class="grit-v2-analysis-btn secondary"
            id="grit-v2-share-analysis"
          >
            📤 Préparer mon résumé
          </button>

        </div>

      </div>
    `;

    const refreshButton =
      document.getElementById(
        "grit-v2-refresh-analysis"
      );

    if (refreshButton) {
      refreshButton.onclick = () => {
        renderAnalysis(container);
      };
    }

    const shareButton =
      document.getElementById(
        "grit-v2-share-analysis"
      );

    if (shareButton) {
      shareButton.onclick = () => {
        const text =
          buildCoachSummary(analysis);

        if (navigator.share) {
          navigator.share({
            title: "Mon résumé GRIT",
            text
          }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              alert(
                "Résumé copié. Tu peux maintenant l'envoyer à ton coach."
              );
            });
        } else {
          alert(text);
        }
      };
    }
  }

  function buildCoachSummary(analysis) {
    const lines = [
      "📊 MON RÉSUMÉ GRIT",
      "",
      "🧠 Analyse :",
      analysis.summary,
      "",
      "🔎 Observations :",
      ...(analysis.observations || []).map(
        item => `• ${item}`
      ),
      "",
      "🎯 Priorités :",
      ...(analysis.priorities || []).map(
        (item, index) =>
          `${index + 1}. ${item}`
      )
    ];

    return lines.join("\n");
  }

  function init() {
    createStyles();

    const existing =
      document.getElementById(
        "grit-v2-analysis-container"
      );

    if (existing) {
      renderAnalysis(existing);
      return;
    }

    /*
      Pour l'instant, on ne crée pas encore
      automatiquement une nouvelle page.
      Le conteneur sera branché à la navigation
      GRIT dans l'étape suivante.
    */
  }

  window.GRIT_V2_ANALYSIS_UI = {
    init,
    renderAnalysis,
    buildCoachSummary
  };

  console.log("GRIT V2 — Analysis UI chargée.");
})();
