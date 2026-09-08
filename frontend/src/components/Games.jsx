import { specialGames } from '../data/specialGames'
import { Download, Gamepad2, Plus } from 'lucide-react'
import '../game-catalogue.css'

const packGames = [
  { title: 'EA SPORTS FC', image: 'ea-fc', imageAlt: 'EA SPORTS FC 26 artwork', detail: 'Available edition', genre: 'Football', text: 'Bring match day home. Play as your favourite clubs, build attacking moves, and challenge friends for football bragging rights.' },
  { title: 'WWE 2K25 / 2K26', image: 'wwe', imageAlt: 'WWE 2K25 artwork', detail: 'Either edition', genre: 'Wrestling', text: 'Enter the ring with WWE Superstars. Pull off signature moves, create fierce rivalries, and turn every match into a main event.' },
  { title: 'Asphalt', image: 'asphalt', genre: 'Arcade racing', text: 'Get behind the wheel of spectacular cars, boost through thrilling tracks, and chase the finish line in fast-paced arcade races.' },
  { title: 'God of War Ragnarök', image: 'god-of-war-ragnarok', genre: 'Action adventure', text: 'Journey with Kratos and Atreus through the Nine Realms. Face Norse gods, battle fearsome creatures, and discover an epic father-and-son story.' },
  { title: 'It Takes Two', image: 'it-takes-two', genre: 'Co-op adventure', text: 'Share a playful adventure built for two. Solve imaginative puzzles and master surprising abilities as Cody and May navigate a world full of surprises.' },
  { title: 'Mortal Kombat', image: 'mortal-kombat', imageAlt: 'Mortal Kombat 1 artwork', genre: 'Fighting', text: 'Choose your fighter and step into intense head-to-head battles. Learn powerful combos and unleash signature moves against your rivals.' },
]



function Games() {
  return (
    <section className="section games-section" id="games">
      <div className="container">
        <div className="section-heading"><p className="eyebrow">GAME VAULT</p><h2>Pick a world. <span>Press start.</span></h2></div>
        <section className="pack-games" aria-labelledby="pack-games-title">
          <div className="pack-games-intro">
            <div className="catalogue-heading">
              <p className="eyebrow">INCLUDED IN YOUR RENTAL</p>
              <h3 id="pack-games-title">Games included <span>in your pack.</span></h3>
              <p>Your next session starts with PS Plus, EA Play, and popular games to explore.</p>
            </div>
            <div className="pack-memberships" aria-label="Included memberships">
              <span className="pack-membership ps-plus"><Plus size={20} aria-hidden="true" />PS Plus</span>
              <span className="pack-membership ea-play"><Gamepad2 size={20} aria-hidden="true" />EA Play</span>
            </div>
          </div>
          <h4 className="pack-popular-title">Popular games</h4>
          <ul className="pack-games-list">
            {packGames.map(({ title, image, imageAlt, detail, genre, text }) => (
              <li className="pack-game" key={title}>
                <img src={`/images/games/${image}.jpg`} alt={imageAlt || `${title} game artwork`} loading="lazy" width="460" height="215" />
                <div className="pack-game-content">
                  <span className="pack-game-genre">{genre}</span>
                  <h5>{title}</h5>
                  {detail && <p className="pack-game-edition">{detail}</p>}
                  <p className="pack-game-description">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="pack-library-banner">
            <span className="pack-library-icon"><Download size={26} aria-hidden="true" /></span>
            <div><strong>600+ games</strong><p>Download and play — discover even more favourites with your pack.</p></div>
          </div>
          <p className="pack-install-note"><strong>Note:</strong> Listed games may or may not be pre-installed on your rental console. Games that are not installed will need to be downloaded before you can play.</p>
        </section>
        <section className="special-catalogue" aria-labelledby="special-catalogue-title">
          <div className="catalogue-heading">
            <p className="eyebrow">EXPLORE MORE</p>
            <h3 id="special-catalogue-title">Special <span>Catalogue</span></h3>
            <span className="special-catalogue-price">₹300</span>
            <p>Big adventures, shared victories, and one more race. Find your next favourite.</p>
          </div>
          <div className="special-games-grid">
            {specialGames.map(({ title, image, genre, text }) => (
              <article className="catalogue-card" key={image}>
                <img src={`/images/games/${image}.jpg`} alt={`${title} game artwork`} loading="lazy" width="460" height="215" />
                <div className="catalogue-card-content">
                  <p className="catalogue-genre">{genre}</p>
                  <h4>{title}</h4>
                  <p className="catalogue-description">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Games
