import { createPortal } from 'react-dom';
import DetailedTrain from './DetailedTrain';

/** A full-screen, unmissable train-on-track loader — shown while a login attempt is in flight. */
export default function TrainLoaderOverlay({ message }: { message: string }) {
  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-7 bg-brand-950/95 backdrop-blur-sm">
      <div className="relative h-24 w-96 max-w-[85vw] overflow-hidden">
        <div className="rail-track-invert absolute inset-x-0 bottom-2" />
        <div className="animate-train-travel-lg absolute bottom-2 w-40 -translate-x-1/2">
          <DetailedTrain className="w-full drop-shadow-lg" />
        </div>
      </div>
      <p className="text-[15px] font-medium text-white">{message}</p>
    </div>,
    document.body,
  );
}
