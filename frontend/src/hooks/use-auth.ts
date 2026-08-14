import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/auth.api';
import { User } from '../types/daily-log';
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { getCurrentUser().then(({ data }) => setUser(data)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  return { user, loading };
};

