async function loadGames() {
  const res = await fetch('./games.json');
  const games = await res.json();
  const grid = document.getElementById('games-grid');

  grid.innerHTML = games.map(game => `
    <a href="${game.url}" target="_blank" rel="noopener" class="game-card">
      <h2>${game.name}</h2>
      <p>${game.description}</p>
      <div class="tags">
        ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </a>
  `).join('');
}

loadGames();
