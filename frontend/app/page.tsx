import Link from 'next/link';

const stats = [
  { label: 'Ideas Registered', value: '2,400+', sub: 'on Algorand Testnet' },
  { label: 'Verified Investors', value: '180+', sub: 'vetted profiles' },
  { label: 'Tx Fee per Registration', value: '0.001 ALGO', sub: '≈ $0.0002' },
  { label: 'Finality Time', value: '2.8 sec', sub: 'instant, no forks' },
];

const features = [
  {
    icon: '🔐',
    title: 'SHA-256 Hash on Algorand',
    desc: 'Your idea is hashed and stored permanently on the Algorand blockchain. Immutable, tamper-proof, publicly verifiable.',
  },
  {
    icon: '📄',
    title: 'IPFS Document Storage',
    desc: 'Upload pitch decks and supporting documents to IPFS. The CID is anchored on-chain alongside your hash.',
  },
  {
    icon: '🛡️',
    title: 'Blockchain Proof Certificate',
    desc: 'Receive a certificate with your transaction ID, timestamp, and Testnet explorer link as legal evidence.',
  },
  {
    icon: '🚫',
    title: 'Duplicate Prevention (On-Chain)',
    desc: "Smart contract rejects any same hash submitted twice — at the protocol level. Zero trust required.",
  },
  {
    icon: '🤝',
    title: 'Verified Investor Network',
    desc: 'Browse ideas as a vetted investor or connect directly with founders — fully on-platform messaging.',
  },
  {
    icon: '🌐',
    title: 'Live On-Chain Verification',
    desc: 'Any future challenge? Run verify_idea() directly against the Algorand smart contract in real time.',
  },
];

const howItWorks = [
  { step: '01', title: 'Describe your idea', desc: 'Fill out title, description, category, stage, and upload supporting documents.' },
  { step: '02', title: 'Hash & upload', desc: 'Backend generates a SHA-256 hash and uploads your documents to IPFS via Pinata.' },
  { step: '03', title: 'Blockchain registration', desc: 'The hash is stored on the Algorand smart contract (IdeaRegistry). Transaction ID returned.' },
  { step: '04', title: 'Get your certificate', desc: 'Download your blockchain proof certificate with explorer link, hash, and timestamp.' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="mb-6 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live on Algorand Testnet · App ID available at submission
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Protect your startup idea<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">on the blockchain</span>
          </h1>
          <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">
            Register your idea on Algorand. Get a tamper-proof, timestamped blockchain certificate.
            Connect with verified investors — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup?role=FOUNDER" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105">
              Register Your Idea →
            </Link>
            <Link href="/browse" className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
              Browse Ideas
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-slate-300 font-semibold text-sm mt-1">{s.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How IdeaVault Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map(h => (
            <div key={h.step} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-4xl font-black text-slate-700 mb-3">{h.step}</div>
              <h3 className="text-white font-bold mb-2">{h.title}</h3>
              <p className="text-slate-400 text-sm">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Why IdeaVault?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/40 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-24 text-center">
        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-blue-500/30 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to protect your idea?</h2>
          <p className="text-slate-400 mb-8">Join thousands of founders who&apos;ve already secured their IP on Algorand blockchain.</p>
          <Link href="/signup" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105">
            Get Started — Free
          </Link>
        </div>
      </section>
    </>
  );
}
