import { Link } from 'react-router-dom';
import { TrainFront, Package, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';

const OPTIONS = [
  {
    to: '/alteration/coach',
    icon: TrainFront,
    title: 'Coach',
    description: 'S.No., Date, TL. No., Description, Status and Remarks — with supporting document uploads.',
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    to: '/alteration/wagon',
    icon: Package,
    title: 'Wagon',
    description: 'S.No., Date, TL. No., Description, Status and Remarks — with supporting document uploads.',
    tone: 'bg-indigo-50 text-indigo-600',
  },
];

export default function Alteration() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Nomenclature Alteration' }]} />
      <PageHeader title="Nomenclature Alteration" description="Select an asset category to view its alteration register" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-2xl">
        {OPTIONS.map((opt) => (
          <Link key={opt.to} to={opt.to}>
            <Card className="group h-full p-6 transition-all hover:border-brand-300 hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${opt.tone}`}>
                <opt.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-800">{opt.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{opt.description}</p>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-brand-600">
                Open Register
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
