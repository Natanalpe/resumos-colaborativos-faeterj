import { useEffect } from 'react';

export default function PasswordResetHandler({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    if (window.location.search.includes('reset')) {
      window.location.reload();
    }
  }, []);

  return <>{children}</>;
}