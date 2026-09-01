import { Crosshair, Gamepad2, Trophy } from 'lucide-react'

const games = [
  { icon: Trophy, title: 'EA SPORTS FC 26', text: 'Bring the stadium home for an unforgettable match night.' },
  { icon: Crosshair, title: 'Call of Duty', text: 'Jump straight into fast, high-energy multiplayer action.' },
  { icon: Gamepad2, title: 'More to play', text: 'Ask our team about the latest games available with your rental.' },
]

function Games() {
  return <section className="section games-section" id="games"><div className="container"><div className="section-heading"><p className="eyebrow">GAME VAULT</p><h2>Pick a world. <span>Press start.</span></h2></div><div className="games-grid">{games.map(({ icon: Icon, title, text }) => <article className="game-card" key={title}><span className="game-icon"><Icon size={25} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
}

export default Games
