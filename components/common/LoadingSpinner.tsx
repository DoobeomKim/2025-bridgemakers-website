export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="text-lg font-medium text-gray-700">인증 처리 중...</div>
        <div className="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</div>
      </div>
    </div>
  );
} 