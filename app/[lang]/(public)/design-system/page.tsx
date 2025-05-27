// app/[lang]/(public)/design-system/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design System | BRIDGEMAKERS',
  description: 'Tailwind CSS 기반 디자인 시스템 가이드',
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Design System</h1>
          <p className="text-xl text-gray-600">Tailwind CSS 기반 디자인 시스템 가이드</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 타이포그래피 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>
              
              <div className="space-y-4">
                <div>
                  <h1 className="text-h1 font-bold text-gray-900">Headline</h1>
                  <p className="text-sm text-gray-500">Lato Light 32px - H1</p>
                </div>
                
                <div>
                  <h2 className="text-h2 font-semibold text-gray-900">Title</h2>
                  <p className="text-sm text-gray-500">Lato Light 28px - H2</p>
                </div>
                
                <div>
                  <h3 className="text-h3 font-medium text-gray-900">Subheader</h3>
                  <p className="text-sm text-gray-500">Lato Regular 24px - H3</p>
                </div>
                
                <div>
                  <p className="text-body text-gray-900">Body1</p>
                  <p className="text-sm text-gray-500">Lato Regular 16px</p>
                </div>
                
                <div>
                  <p className="text-body-sm text-gray-900">Caption</p>
                  <p className="text-sm text-gray-500">Lato Regular 14px</p>
                </div>
              </div>
            </div>

            {/* 컬러 팔레트 */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Colors</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="w-full h-16 bg-blue rounded-lg mb-2"></div>
                  <p className="text-sm font-medium">#007AFF</p>
                  <p className="text-xs text-gray-500">PRIMARY COLOR</p>
                </div>
                
                <div>
                  <div className="w-full h-16 bg-gold rounded-lg mb-2"></div>
                  <p className="text-sm font-medium">#CBA967</p>
                  <p className="text-xs text-gray-500">ACCENT COLOR</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="w-full h-12 bg-gray-light rounded mb-2"></div>
                  <p className="text-xs">#F2F2F7</p>
                </div>
                <div>
                  <div className="w-full h-12 bg-gray-medium rounded mb-2"></div>
                  <p className="text-xs">#C7C7CC</p>
                </div>
                <div>
                  <div className="w-full h-12 bg-gray-dark rounded mb-2"></div>
                  <p className="text-xs">#8E8E93</p>
                </div>
              </div>
            </div>
          </div>

          {/* 컴포넌트 섹션 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Components</h2>
              
              {/* 버튼 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Buttons</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                    Static
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                    Hover
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded">
                    Pressed
                  </button>
                  <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed">
                    Disabled
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                    + Static
                  </button>
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                    + Hover
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded">
                    + Pressed
                  </button>
                  <div></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <button className="bg-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    + Static
                  </button>
                  <button className="bg-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    + Static
                  </button>
                  <button className="bg-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    + Static
                  </button>
                </div>
              </div>

              {/* 입력 필드 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Input</h3>
                
                <div className="space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Normal" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <input 
                      type="text" 
                      placeholder="Active" 
                      className="w-full px-3 py-2 border-2 border-blue rounded-md focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <input 
                      type="text" 
                      placeholder="Alert" 
                      className="w-full px-3 py-2 border-2 border-red-500 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 선택 요소 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue">
                    <option>Normal</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                  
                  <select className="w-full px-3 py-2 border-2 border-blue rounded-md focus:outline-none">
                    <option>Hover</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>

              {/* 체크박스와 라디오 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkbox & Radio Button</h3>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Unchecked option</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Hover option</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked className="rounded" />
                      <span>Checked</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-400">
                      <input type="checkbox" disabled className="rounded" />
                      <span>Disabled Item</span>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="radio-group" />
                      <span>Static</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="radio-group" />
                      <span>Hover</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="radio-group" checked />
                      <span>Checked</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-400">
                      <input type="radio" name="radio-group" disabled />
                      <span>Disabled</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 알림 스타일 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Styles</h3>
                
                <div className="space-y-4">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
                    <span className="mr-2">⚠️</span>
                    Alert validation text
                  </div>
                  
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
                    <span className="mr-2">✅</span>
                    Well done! Successful!
                  </div>
                  
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded flex items-center">
                    <span className="mr-2">⚠️</span>
                    Warning!
                  </div>
                  
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded flex items-center">
                    <span className="mr-2">ℹ️</span>
                    Successful! Well done! Text message here.
                  </div>
                </div>
              </div>

              {/* 페이지네이션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagination</h3>
                
                <div className="flex items-center justify-center space-x-2">
                  <button className="px-3 py-1 text-gray-500 hover:text-gray-700">‹</button>
                  <button className="px-3 py-1 bg-blue text-white rounded">1</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">2</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">3</button>
                  <button className="px-3 py-1 text-gray-500 hover:text-gray-700">›</button>
                </div>
              </div>

              {/* 스위치 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Switch</h3>
                
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                  </label>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked className="sr-only peer" />
                    <div className="w-11 h-6 bg-blue peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 요소 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Elements for Chart</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray="75, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold">75%</span>
                </div>
              </div>
              <p className="text-lg font-semibold">$ 12,700</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeDasharray="60, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold">60%</span>
                </div>
              </div>
              <p className="text-lg font-semibold">$ 7,200</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeDasharray="45, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold">45%</span>
                </div>
              </div>
              <p className="text-lg font-semibold">$ 5,500</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}