export default function Loading() {
  return (
    <main className="section-wrap section-block" aria-label="Carregando conteúdo" aria-busy="true">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="projects-grid">
        {[1, 2, 3].map((card) => (
          <div className="skeleton-card" key={card}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton skeleton-copy" />
          </div>
        ))}
      </div>
      <p className="loading-label">Carregando projetos do GitHub...</p>
    </main>
  );
}
