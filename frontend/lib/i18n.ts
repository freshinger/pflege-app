import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  de: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        patients: 'Patienten',
        todos: 'Aufgaben',
        statistics: 'Statistiken',
        logout: 'Abmelden',
      },
      // Auth
      auth: {
        login: 'Anmelden',
        register: 'Registrieren',
        email: 'E-Mail',
        password: 'Passwort',
        firstName: 'Vorname',
        lastName: 'Nachname',
        loginButton: 'Anmelden',
        registerButton: 'Konto erstellen',
        alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
        noAccount: 'Noch kein Konto?',
      },
      // Patients
      patients: {
        name: 'Name',
        diagnosis: 'Diagnose',
        title: 'Patienten',
        addPatient: 'Patient hinzufügen',
        editPatient: 'Patient bearbeiten',
        deletePatient: 'Patient löschen',
        deletePatientConfirm: 'Möchten Sie diesen Patienten wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        viewTodos: 'Aufgaben anzeigen',
        firstName: 'Vorname',
        lastName: 'Nachname',
        dateOfBirth: 'Geburtsdatum',
        age: 'Alter',
        weight: 'Gewicht (kg)',
        gender: 'Geschlecht',
        male: 'Männlich',
        female: 'Weiblich',
        other: 'Divers',
        mainDiagnosis: 'Hauptdiagnose',
        otherDiagnoses: 'Weitere Diagnosen',
        diagnoses: 'Diagnosen',
        diagnosisText: 'Diagnosetext',
        setAsMainDiagnosis: 'Als Hauptdiagnose',
        main: 'Haupt',
        addDiagnosisPlaceholder: 'Neue Diagnose eingeben',
        atLeastOneDiagnosis: 'Mindestens eine Diagnose ist erforderlich',
        exactlyOneMainDiagnosis: 'Genau eine Diagnose muss als Hauptdiagnose markiert sein',
        diagnosisTextRequired: 'Alle Diagnosen müssen einen Text haben',
        allergies: 'Allergien',
        allergyText: 'Allergietext',
        addAllergyPlaceholder: 'Neue Allergie eingeben',
        none: 'Keine',
        roomNumber: 'Zimmernummer',
        notes: 'Notizen',
        search: 'Patienten suchen...',
      },
      // Todos
      todos: {
        title: 'Aufgaben',
        addTodo: 'Aufgabe hinzufügen',
        editTodo: 'Aufgabe bearbeiten',
        deleteTodo: 'Aufgabe löschen',
        todoTitle: 'Titel',
        description: 'Beschreibung',
        category: 'Kategorie',
        priority: 'Priorität',
        dueDate: 'Fälligkeitsdatum',
        completed: 'Erledigt',
        assignTo: 'Zuweisen an',
        overdue: 'Überfällig',
        upcoming: 'Anstehend',
        selectPatient: 'Patient auswählen',
        searchPatient: 'Patient suchen...',
        clearSelection: 'Auswahl löschen',
        noPatientSelected: 'Bitte wählen Sie einen Patienten aus, um Aufgaben anzuzeigen.',
        selectPatientFirst: 'Bitte wählen Sie zuerst einen Patienten aus.',
        // Categories
        Beatmung: 'Beatmung',
        Ernährung: 'Ernährung',
        Bewegung: 'Bewegung',
        Ausscheidung: 'Ausscheidung',
        // Priorities
        low: 'Niedrig',
        medium: 'Mittel',
        high: 'Hoch',
        urgent: 'Dringend',
      },
      // Calendar
      calendar: {
        day: 'Tag',
        week: 'Woche',
        month: 'Monat',
        today: 'Heute',
        next: 'Weiter',
        previous: 'Zurück',
      },
      // Statistics
      statistics: {
        title: 'Statistiken',
        visitFrequency: 'Besuchshäufigkeit',
        topPatients: 'Top Patienten',
        visitCount: 'Anzahl Besuche',
      },
      // Dashboard
      dashboard: {
        todaysTodos: 'Heutige Aufgaben',
        noTodosToday: 'Keine Aufgaben für heute',
      },
        // Common
      common: {
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        add: 'Hinzufügen',
        search: 'Suchen',
        loading: 'Laden...',
        error: 'Fehler',
        success: 'Erfolg',
        confirm: 'Bestätigen',
        close: 'Schließen',
        actions: 'Aktionen',
        noData: 'Keine Daten gefunden',
        confirmDelete: 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?',
        unknown: 'Unbekannt',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    lng: 'de',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
