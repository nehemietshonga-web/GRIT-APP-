/* =========================================================
   GRIT V2 — ANALYSIS ENGINE
   Version 1
   Analyse les données du sportif sans modifier GRIT actuel.
   ========================================================= */

(function () {
  "use strict";

  function average(values) {
    const valid = values.filter(
      value => typeof value === "number" && !Number.isNaN(value)
    );

    if (!valid.length) return null;

    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  }

  function getRecent(items, days = 7) {
    const limit = Date.now() - days * 24 * 60 * 60 * 1000;

    return items.filter(item => {
      if (!item.createdAt) return false;

      return new Date(item.createdAt).getTime() >= limit;
    });
  }

  function analyseSleep(data) {
    const sleepEntries = getRecent(data.sleep || [], 7);

    if (!sleepEntries.length) {
      return {
        status: "unknown",
        score: null,
        message: "Pas encore assez de données de sommeil."
      };
    }

    const hours = sleepEntries
      .map(entry => Number(entry.hours))
      .filter(Number.isFinite);

    const averageHours = average(hours);

    if (averageHours === null) {
      return {
        status: "unknown",
        score: null,
        message: "Les données de sommeil sont incomplètes."
      };
    }

    if (averageHours < 6) {
      return {
        status: "alert",
        score: 35,
        message:
          "Ton temps de sommeil moyen est faible. La récupération mérite une attention particulière."
      };
    }

    if (averageHours < 7) {
      return {
        status: "warning",
        score: 60,
        message:
          "Ton sommeil moyen pourrait être amélioré pour favoriser ta récupération."
      };
    }

    if (averageHours < 8) {
      return {
        status: "good",
        score: 80,
        message:
          "Ton temps de sommeil moyen est plutôt favorable à la récupération."
      };
    }

    return {
      status: "excellent",
      score: 95,
      message:
        "Ton temps de sommeil moyen est très favorable à la récupération."
    };
  }

  function analyseTraining(data) {
    const sessions = getRecent(data.training || [], 7);

    if (!sessions.length) {
      return {
        status: "unknown",
        score: null,
        count: 0,
        message: "Aucune séance récente enregistrée."
      };
    }

    const effortValues = sessions
      .map(session => Number(session.rpe ?? session.effort))
      .filter(Number.isFinite);

    const averageEffort = average(effortValues);

    if (averageEffort !== null && averageEffort >= 8.5) {
      return {
        status: "warning",
        score: 60,
        count: sessions.length,
        averageEffort,
        message:
          "Tes dernières séances semblent exigeantes. Surveille ta récupération."
      };
    }

    if (averageEffort !== null && averageEffort >= 7) {
      return {
        status: "moderate",
        score: 75,
        count: sessions.length,
        averageEffort,
        message:
          "Ton niveau d'effort est soutenu. Assure-toi de bien récupérer entre les séances."
      };
    }

    return {
      status: "good",
      score: 90,
      count: sessions.length,
      averageEffort,
      message:
        "Ta charge d'entraînement récente semble raisonnable selon les données disponibles."
    };
  }

  function analysePain(data) {
    const pains = getRecent(data.pain || [], 14);

    if (!pains.length) {
      return {
        status: "good",
        score: 100,
        message: "Aucune douleur récente enregistrée."
      };
    }

    const intensities = pains
      .map(item => Number(item.intensity))
      .filter(Number.isFinite);

    const averagePain = average(intensities);

    if (averagePain !== null && averagePain >= 7) {
      return {
        status: "alert",
        score: 30,
        message:
          "Une douleur importante a été enregistrée. Évite les mouvements qui l'aggravent et envisage un avis professionnel de santé."
      };
    }

    if (averagePain !== null && averagePain >= 4) {
      return {
        status: "warning",
        score: 60,
        message:
          "Une douleur modérée apparaît dans tes données. Surveille son évolution et informe ton coach si elle persiste."
      };
    }

    return {
      status: "moderate",
      score: 80,
      message:
        "Une légère douleur a été enregistrée. Surveille son évolution."
    };
  }

  function analyseRecovery(data) {
    const sleep = analyseSleep(data);
    const training = analyseTraining(data);
    const pain = analysePain(data);

    const scores = [sleep.score, training.score, pain.score].filter(
      Number.isFinite
    );

    const score = scores.length ? Math.round(average(scores)) : null;

    let status = "unknown";

    if (score !== null) {
      if (score < 50) status = "alert";
      else if (score < 70) status = "warning";
      else if (score < 85) status = "good";
      else status = "excellent";
    }

    return {
      status,
      score,
      sleep,
      training,
      pain
    };
  }

  function generateAnalysis() {
    const data = window.GRIT_V2.load();

    const recovery = analyseRecovery(data);

    const priorities = [];
    const observations = [];

    if (recovery.sleep.status === "alert") {
      priorities.push("Améliorer ton sommeil.");
    } else if (recovery.sleep.status === "warning") {
      priorities.push("Essayer d'améliorer progressivement ton sommeil.");
    }

    if (recovery.training.status === "warning") {
      priorities.push("Surveiller la récupération entre les séances.");
    }

    if (recovery.pain.status === "alert") {
      priorities.push("Surveiller une douleur importante et demander un avis professionnel si nécessaire.");
    } else if (recovery.pain.status === "warning") {
      priorities.push("Surveiller l'évolution de la douleur.");
    }

    observations.push(recovery.sleep.message);
    observations.push(recovery.training.message);
    observations.push(recovery.pain.message);

    let summary =
      "Tes données sont encore limitées. Continue à renseigner régulièrement GRIT pour obtenir une analyse plus personnalisée.";

    if (recovery.score !== null) {
      if (recovery.score >= 85) {
        summary =
          "Ta situation actuelle semble favorable selon les données disponibles. Continue à suivre régulièrement ton entraînement et ta récupération.";
      } else if (recovery.score >= 70) {
        summary =
          "Ta situation semble globalement correcte, mais certains éléments peuvent encore être améliorés pour favoriser ta progression.";
      } else if (recovery.score >= 50) {
        summary =
          "Certains signaux montrent que ta récupération mérite davantage d'attention cette semaine.";
      } else {
        summary =
          "Plusieurs signaux indiquent que ta récupération doit être surveillée. Évite de négliger les signaux de fatigue ou de douleur.";
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      score: recovery.score,
      status: recovery.status,
      summary,
      observations,
      priorities,
      recovery
    };
  }

  window.GRIT_V2_ANALYSIS = {
    generateAnalysis
  };

  console.log("GRIT V2 — Analysis Engine chargé.");
})();
