import React, { createContext, useState, useContext, ReactNode } from "react";

// Define all translations for the application
export const translations = {
  en: {
    // Common UI elements
    language: "English",
    changeLanguage: "Français",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",

    // Navigation
    home: "Home",
    leaderboard: "Leaderboard",
    statistics: "Statistics",
    upload: "Upload",
    admin: "Admin",
    login: "Login",
    logout: "Logout",
    dashboard: "Dashboard",

    // HomePage
    homeTitle: "LA ZONE TRACKER",
    homeSubtitle:
      "Track your airsoft shooting range performance and compete on the leaderboard",
    enterUsername: "Enter your username",
    searchButton: "Search",
    viewLeaderboard: "View Leaderboard",
    uploadData: "Upload",
    allRightsReserved: "All Rights Reserved",

    // NavBar
    laZoneTracker: "LA ZONE TRACKER",

    // Upload form
    uploadTitle: "Upload BlazePod CSV Data",
    uploadDescription: "Select a CSV file with activity data",
    clickToUpload: "Click to upload CSV",
    dragAndDrop: "or drag and drop file here",
    processing: "Processing file...",
    serverProcessing: "Server-side CSV processing",
    recordsProcessed: "records processed",

    // Sessions
    sessionsOverview: "Sessions Overview",
    complete: "Complete",
    partial: "Partial",
    saving: "Saving...",
    saveCompleteSessions: "Save Complete Sessions",
    session: "Session",
    type: "Type",
    status: "Status",
    activities: "Activities",
    sessionStart: "Session Start",
    duration: "Duration",
    hitsMisses: "Hits/Misses",
    avgReaction: "Avg Reaction",
    completeSession: "Session",
    partialSession: "Partial Session",
    singleStation: "Single Station",

    // Leaderboard
    leaderboardRanking: "Leaderboard Ranking",
    topPerformers: "Top Performers",
    allActivities: "All Activities",
    rank: "Rank",
    playerName: "Player Name",
    activityDate: "Activity Date",
    activityTime: "Activity Time",
    activityName: "Activity Name",
    avgReactionTime: "Avg Reaction Time",
    totalHits: "Total Hits",
    missHits: "Miss Hits",
    strikes: "Strikes",
    loadingLeaderboard: "Loading leaderboard...",
    airstoftTracker: "Airsoft Tracker | LA ZONE Training System",
    bestScorePerPlayer: "Best score per player per activity",

    // Stats Page
    playerStats: "Player Statistics",
    userNotFound: "User not found",
    noDataFound: "No data found for this user",
    loadingUserData: "Loading user data...",
    backToHome: "Back to Home",
    sessionDetails: "Session Details",
    totalSessions: "Total Sessions",
    averageScore: "Average Score",
    bestTime: "Best Time",
    improvement: "Improvement",
    recentActivity: "Recent Activity",
    activityBreakdown: "Activity Breakdown",
    viewDetails: "View Details",
    backToStats: "Back to Stats",
    sessionInformation: "Session Information",
    performanceSummary: "Performance Summary",
    accuracy: "Accuracy",
    visualCues: "Visual Cues",
    visualCuesBySection: "Visual Cues by Section",
    timeline: "Timeline",
    loadingVisualCues: "Loading visual cues...",
    noVisualCuesFound: "No visual cues data found for this session",
    failedToLoadVisualCues: "Failed to load visual cues data",
    note: "Note",
    section: "Section",
    cue: "Cue",
    cues: "cues",
    color: "Color",
    order: "Order",
    sectionSequence: "Section Sequence",
    activityDetails: "Activity Details",

    // Admin
    adminArea: "Admin Area",
    adminAccess: "Admin Access",
    enterAdminToken: "Enter your admin token to access the upload dashboard",
    adminToken: "Admin Token",
    accessDashboard: "Access Dashboard",
    authenticating: "Authenticating...",
    forDemoPurposes: "For demo purposes, use:",
    blazepodAdmin: "BlazePod Admin",
    dataManagementPortal: "Data Management Portal",
    totalUploads: "Total Uploads",
    activeUsers: "Active Users",
    sessions: "Sessions",
    growth: "Growth",
    csvUpload: "CSV Upload",
    reports: "Reports",
    uploadCsvData: "Upload CSV Data",
    uploadBlazepodDescription:
      "Upload BlazePod activity data files to process and analyze training sessions.",
    reportsComingSoon: "Reports Coming Soon",
    advancedAnalytics:
      "Advanced analytics and reporting features will be available in the next update.",
    areYouSureLogout: "Are you sure you want to logout?",
    blazepodAdminPortal: "BlazePod Admin Portal - Secure Access Required",

    // Error messages
    noSessionsToSave: "No sessions to save",
    noCompleteSessionsFound: "No complete sessions found",
    failedToSave: "Failed to save sessions",
    failedToUpload: "Failed to upload file",
    unknownError: "Unknown error occurred",
    uploadError: "An error occurred while uploading the file",
    savingError: "An error occurred while saving sessions",
    loginError: "Invalid username or password",

    // Success messages
    successfullySaved: "Successfully saved {count} sessions!",
    loginSuccess: "Login successful",

    // Other
    unknown: "Unknown",
    seconds: "s",
    milliseconds: "ms",
    station: "Station",
    welcomeBack: "Welcome back",
    pleaseLogin: "Please login to continue",
    username: "Username",
    password: "Password",
    player: "Player",
    score: "Score",
    time: "Time",
    topPlayers: "Top Players",
    sec: "sec",
    ms: "ms",
  },
  fr: {
    // Common UI elements
    language: "Français",
    changeLanguage: "English",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    back: "Retour",
    next: "Suivant",
    view: "Voir",
    edit: "Modifier",
    delete: "Supprimer",
    search: "Rechercher",
    filter: "Filtrer",

    // Navigation
    home: "Accueil",
    leaderboard: "Classement",
    statistics: "Statistiques",
    upload: "Télécharger",
    admin: "Admin",
    login: "Connexion",
    logout: "Déconnexion",
    dashboard: "Tableau de bord",

    // HomePage
    homeTitle: "LA ZONE TRACKER",
    homeSubtitle: "Suivez vos performances de tir et participez au classement",
    enterUsername: "Entrez votre nom d'utilisateur",
    searchButton: "Rechercher",
    viewLeaderboard: "Voir le classement",
    uploadData: "Télécharger",
    allRightsReserved: "Tous droits réservés",

    // NavBar
    laZoneTracker: "LA ZONE TRACKER",

    // Upload form
    uploadTitle: "Télécharger les données CSV BlazePod",
    uploadDescription:
      "Sélectionnez un fichier CSV avec les données d'activité",
    clickToUpload: "Cliquez pour télécharger CSV",
    dragAndDrop: "ou glissez-déposez le fichier ici",
    processing: "Traitement du fichier...",
    serverProcessing: "Traitement CSV côté serveur",
    recordsProcessed: "enregistrements traités",

    // Sessions
    sessionsOverview: "Aperçu des sessions",
    complete: "Complète",
    partial: "Partielle",
    saving: "Enregistrement...",
    saveCompleteSessions: "Enregistrer les sessions complètes",
    session: "Session",
    type: "Type",
    status: "Statut",
    activities: "Activités",
    sessionStart: "Début de session",
    duration: "Durée",
    hitsMisses: "Réussites/Échecs",
    avgReaction: "Réaction moy.",
    completeSession: "Session",
    partialSession: "Session Partielle",
    singleStation: "Station Unique",

    // Leaderboard
    leaderboardRanking: "Classement des joueurs",
    topPerformers: "Meilleurs performances",
    allActivities: "Toutes les activités",
    rank: "Rang",
    playerName: "Nom du joueur",
    activityDate: "Date d'activité",
    activityTime: "Heure d'activité",
    activityName: "Nom de l'activité",
    avgReactionTime: "Temps de réaction moy.",
    totalHits: "Total des réussites",
    missHits: "Échecs",
    strikes: "Frappes",
    loadingLeaderboard: "Chargement du classement...",
    airstoftTracker: "Airsoft Tracker | Système d'entraînement LA ZONE",
    bestScorePerPlayer: "Meilleur score par joueur par activité",

    // Stats Page
    playerStats: "Statistiques du joueur",
    userNotFound: "Utilisateur non trouvé",
    noDataFound: "Aucune donnée trouvée pour cet utilisateur",
    loadingUserData: "Chargement des données utilisateur...",
    backToHome: "Retour à l'accueil",
    sessionDetails: "Détails de la session",
    totalSessions: "Sessions totales",
    averageScore: "Score moyen",
    bestTime: "Meilleur temps",
    improvement: "Amélioration",
    recentActivity: "Activité récente",
    activityBreakdown: "Répartition des activités",
    viewDetails: "Voir les détails",
    backToStats: "Retour aux statistiques",
    sessionInformation: "Informations de session",
    performanceSummary: "Résumé des performances",
    accuracy: "Précision",
    visualCues: "Signaux visuels",
    visualCuesBySection: "Signaux visuels par section",
    timeline: "Chronologie",
    loadingVisualCues: "Chargement des signaux visuels...",
    noVisualCuesFound: "Aucun signal visuel trouvé pour cette session",
    failedToLoadVisualCues: "Échec du chargement des signaux visuels",
    note: "Note",
    section: "Section",
    cue: "Signal",
    cues: "signaux",
    color: "Couleur",
    order: "Ordre",
    sectionSequence: "Séquence de section",
    activityDetails: "Détails de l'activité",

    // Admin
    adminArea: "Zone d'administration",
    adminAccess: "Accès administrateur",
    enterAdminToken:
      "Entrez votre jeton d'administrateur pour accéder au tableau de bord de téléchargement",
    adminToken: "Jeton d'administrateur",
    accessDashboard: "Accéder au tableau de bord",
    authenticating: "Authentification...",
    forDemoPurposes: "À des fins de démonstration, utilisez :",
    blazepodAdmin: "BlazePod Admin",
    dataManagementPortal: "Portail de gestion des données",
    totalUploads: "Total des téléchargements",
    activeUsers: "Utilisateurs actifs",
    sessions: "Sessions",
    growth: "Croissance",
    csvUpload: "Téléchargement CSV",
    reports: "Rapports",
    uploadCsvData: "Télécharger des données CSV",
    uploadBlazepodDescription:
      "Téléchargez des fichiers de données d'activité BlazePod pour traiter et analyser les sessions d'entraînement.",
    reportsComingSoon: "Rapports à venir",
    advancedAnalytics:
      "Les fonctionnalités d'analyse et de rapport avancées seront disponibles dans la prochaine mise à jour.",
    areYouSureLogout: "Êtes-vous sûr de vouloir vous déconnecter ?",
    blazepodAdminPortal:
      "Portail d'administration BlazePod - Accès sécurisé requis",

    // Error messages
    noSessionsToSave: "Aucune session à enregistrer",
    noCompleteSessionsFound: "Aucune session complète trouvée",
    failedToSave: "Échec de l'enregistrement des sessions",
    failedToUpload: "Échec du téléchargement du fichier",
    unknownError: "Une erreur inconnue s'est produite",
    uploadError: "Une erreur s'est produite lors du téléchargement du fichier",
    savingError:
      "Une erreur s'est produite lors de l'enregistrement des sessions",
    loginError: "Nom d'utilisateur ou mot de passe invalide",

    // Success messages
    successfullySaved: "{count} sessions enregistrées avec succès !",
    loginSuccess: "Connexion réussie",

    // Other
    unknown: "Inconnu",
    seconds: "s",
    milliseconds: "ms",
    station: "Station",
    welcomeBack: "Bienvenue",
    pleaseLogin: "Veuillez vous connecter pour continuer",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    player: "Joueur",
    score: "Score",
    time: "Temps",
    topPlayers: "Meilleurs joueurs",
    sec: "sec",
    ms: "ms",
  },
};

// Create a type for translations
type TranslationType = typeof translations.en;

// Define the context type
interface LanguageContextType {
  language: "en" | "fr";
  t: TranslationType;
  toggleLanguage: () => void;
}

// Create the context with an initial default value
const defaultValue: LanguageContextType = {
  language: "en",
  t: translations.en,
  toggleLanguage: () => {},
};

// Create the context with the default value
export const LanguageContext = createContext<LanguageContextType>(defaultValue);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<"en" | "fr">("en");

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "fr" : "en"));
  };

  // Get current language translations
  const t = translations[language];

  // Create the value object
  const contextValue: LanguageContextType = {
    language,
    t,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context;
};
