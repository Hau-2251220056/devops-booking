function StatCard({ title, value, tone = "blue" }) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <p className="stat-card-title">{title}</p>
      <strong className="stat-card-value">{value}</strong>
    </article>
  );
}

export default StatCard;
