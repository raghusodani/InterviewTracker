
function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <main className="max-w-5xl w-full text-center space-y-8 z-10">
        <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-4 backdrop-blur-md">
                v1.0.0 Public Beta
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400">
                Interview Tracker
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The ultimate workspace for aspiring engineers. Track your LeetCode grind, system design notes, and interview schedules in one premium interface.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-4">
            {[ 
                { title: 'Problem Log', desc: 'Detailed history of every algorithm problem you solve.', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400/50' },
                { title: 'Analytics', desc: 'Beautiful charts to visualize your study velocity.', color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 hover:border-emerald-400/50' },
                { title: 'Resources', desc: 'Curated lists of patterns and system design templates.', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400/50' }
            ].map((feature, i) => (
                <div key={i} className={`group p-8 rounded-3xl border bg-gradient-to-br ${feature.color} backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer text-left`}>
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                        <div className="w-5 h-5 bg-current opacity-80" /> 
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>

        <div className="pt-12 flex justify-center gap-6">
            <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
              Start Tracking
            </button>
            <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-md">
              View Demo
            </button>
        </div>
      </main>
    </div>
  )
}

export default App
