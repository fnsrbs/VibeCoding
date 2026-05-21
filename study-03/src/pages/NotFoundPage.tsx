import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-indigo-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-slate-500 mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <button
          onClick={() => navigate('/')}
          aria-label="홈으로 이동"
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
        >
          홈으로 이동
        </button>
      </div>
    </div>
  )
}
