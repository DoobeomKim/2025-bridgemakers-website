import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 큰 텍스트 */}
        <h1 className="text-[120px] md:text-[200px] font-bold leading-none [color:#cba967] !text-gold">
          404
        </h1>
        
        {/* 메인 메시지 */}
        <h2 className="text-h2 md:text-[32px] text-white mt-4 mb-6">
          페이지를 찾을 수 없습니다
        </h2>
        
        {/* 부가 설명 */}
        <p className="text-[16px] !text-gray-medium mb-12 max-w-md mx-auto [color:#C7C7CC_!important]">
          요청하신 페이지가 삭제되었거나 일시적으로 사용할 수 없습니다.
          아래 버튼을 클릭하여 메인 페이지로 이동해 주세요.
        </p>
        
        {/* 홈으로 돌아가기 버튼 */}
        <Link 
          href="/" 
          className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-standard transition-all duration-200 hover:scale-105"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 