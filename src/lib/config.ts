
export type DatabaseProvider = 'supabase' | 'firebase';

export const DATABASE_CONFIG = {
  provider: (import.meta.env.VITE_DATABASE_PROVIDER || 'supabase') as DatabaseProvider,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://zpuhcukjltbjrmapkwur.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdWhjdWtqbHRianJtYXBrd3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjM3NDYsImV4cCI6MjA2MzMzOTc0Nn0.iDf7HfkRLfH8CwIWsLl2Ac7NHsqtDvsrKnhyGJb9lRQ"
  },
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }
};

// Validar si Firebase está configurado correctamente
export const isFirebaseConfigured = () => {
  const config = DATABASE_CONFIG.firebase;
  return !!(config.apiKey && config.authDomain && config.projectId);
};

console.log('Database provider:', DATABASE_CONFIG.provider);
console.log('Firebase configured:', isFirebaseConfigured());
console.log('Firebase config:', DATABASE_CONFIG.firebase);
