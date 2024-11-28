import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = "medium", fullScreen = false }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-[#005670]`} />
      </div>
    );
  }

  return <Loader2 className={`${sizeClasses[size]} animate-spin text-[#005670]`} />;
};

export default LoadingSpinner;