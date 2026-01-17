import { Button } from '@/components/ui';
import { Calendar, Clock, Users, Palette } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">
          Rezervační systém
        </h1>
        <p className="text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
          White-label rezervační systém pro vaše podnikání.
          Masáže, kadeřnictví, doktor - cokoliv potřebujete.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/pavel-masaze">
            <Button size="lg">
              Vyzkoušet demo
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">
              Zjistit více
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Funkce systému</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard
            icon={Calendar}
            title="Online rezervace 24/7"
            description="Zákazníci si mohou rezervovat termín kdykoliv, bez nutnosti volat."
          />
          <FeatureCard
            icon={Clock}
            title="Automatická dostupnost"
            description="Systém automaticky zobrazuje pouze volné termíny."
          />
          <FeatureCard
            icon={Users}
            title="Multi-tenancy"
            description="Jeden systém pro více provozoven, každá s vlastním brandingem."
          />
          <FeatureCard
            icon={Palette}
            title="Vlastní vzhled"
            description="Přizpůsobte barvy a logo podle vaší značky."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-[var(--primary)] text-white rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Připraveni začít?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Vyzkoušejte demo verzi nebo nás kontaktujte pro nastavení vašeho vlastního rezervačního systému.
          </p>
          <Link href="/pavel-masaze">
            <Button variant="secondary" size="lg">
              Vyzkoušet demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-[var(--text-muted)]">
          <p>&copy; {new Date().getFullYear()} DevStudio. Rezervační systém.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--primary)]" />
      </div>
      <h3 className="font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm">{description}</p>
    </div>
  );
}
