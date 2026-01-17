'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setError('Nesprávný email nebo heslo');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Nastala chyba při přihlašování');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Administrace</h1>
          <p className="text-[var(--text-muted)]">Přihlaste se do svého účtu</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="vas@email.cz"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              id="password"
              type="password"
              label="Heslo"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {error && (
              <p className="text-sm text-[var(--error)] text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Přihlásit se
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Pro vytvoření účtu kontaktujte administrátora
        </p>
      </div>
    </div>
  );
}
