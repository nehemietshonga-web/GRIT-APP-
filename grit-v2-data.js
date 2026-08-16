/* =========================================================
   GRIT V2 — DATA FOUNDATION
   Version 1
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "grit_v2_data";

  const DEFAULT_DATA = {
    profile: {
      objective: null,
      targetValue: null,
      targetUnit: null,
      targetDate: null,
      mainDiscipline: null,
      level: null
    },

    training: [],

    performances: [],

    nutrition: {
      meals: [],
      hydration: [],
      targets: {
        calories: null,
        protein: null,
        carbohydrates: null,
        fats: null
      }
    },

    sleep: [],

    recovery: [],

    pain: [],

    analysis: {
      lastGenerated: null,
      history: []
    }
  };

  function cloneDefaultData() {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return cloneDefaultData();
      }

      const parsed = JSON.parse(saved);

      return {
        ...cloneDefaultData(),
        ...parsed,
        profile: {
          ...cloneDefaultData().profile,
          ...(parsed.profile || {})
        },
        nutrition: {
          ...cloneDefaultData().nutrition,
          ...(parsed.nutrition || {}),
          targets: {
            ...cloneDefaultData().nutrition.targets,
            ...((parsed.nutrition || {}).targets || {})
          }
        },
        analysis: {
          ...cloneDefaultData().analysis,
          ...(parsed.analysis || {})
        }
      };
    } catch (error) {
      console.error("GRIT V2 : impossible de charger les données.", error);
      return cloneDefaultData();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("GRIT V2 : impossible de sauvegarder les données.", error);
      return false;
    }
  }

  function addToCollection(collectionName, item) {
    const data = load();

    if (!Array.isArray(data[collectionName])) {
      data[collectionName] = [];
    }

    const entry = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item
    };

    data[collectionName].push(entry);
    save(data);

    return entry;
  }

  function getCollection(collectionName) {
    const data = load();

    return Array.isArray(data[collectionName])
      ? data[collectionName]
      : [];
  }

  function updateProfile(updates) {
    const data = load();

    data.profile = {
      ...data.profile,
      ...updates
    };

    save(data);

    return data.profile;
  }

  function updateNutritionTargets(updates) {
    const data = load();

    data.nutrition.targets = {
      ...data.nutrition.targets,
      ...updates
    };

    save(data);

    return data.nutrition.targets;
  }

  function addMeal(meal) {
    const data = load();

    data.nutrition.meals.push({
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...meal
    });

    save(data);

    return data.nutrition.meals[data.nutrition.meals.length - 1];
  }

  function addHydration(entry) {
    const data = load();

    data.nutrition.hydration.push({
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...entry
    });

    save(data);

    return data.nutrition.hydration[data.nutrition.hydration.length - 1];
  }

  function saveAnalysis(analysis) {
    const data = load();

    data.analysis.lastGenerated = new Date().toISOString();

    data.analysis.history.push({
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...analysis
    });

    save(data);

    return data.analysis;
  }

  window.GRIT_V2 = {
    STORAGE_KEY,
    load,
    save,
    addToCollection,
    getCollection,
    updateProfile,
    updateNutritionTargets,
    addMeal,
    addHydration,
    saveAnalysis
  };

  console.log("GRIT V2 — Data Foundation chargée.");
})();
