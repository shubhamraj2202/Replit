interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export function LoadingModal({ 
  isOpen, 
  title = "Analyzing Your Food",
  message = "Our AI is checking if it's vegan..."
}: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-ios-lg p-8 mx-6 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-ios-gray-2">{message}</p>
      </div>
    </div>
  );
}
