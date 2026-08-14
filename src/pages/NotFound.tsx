import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
        <AlertCircle className="h-6 w-6 text-amber-500" />
      </div>
      <h1 className="text-lg font-semibold text-slate-800">Page not found</h1>
      <p className="text-sm text-slate-500">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button variant="primary" className="mt-2">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
