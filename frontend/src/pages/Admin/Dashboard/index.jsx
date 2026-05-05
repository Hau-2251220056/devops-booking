import { useEffect, useMemo, useState } from "react";
import StatCard from "../../../components/StatCard";
import { fetchAdminStats } from "../../../services/adminApi";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError("");

      const response = await fetchAdminStats();

      if (!isMounted) {
        return;
      }

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStats(null);
        setError(response.message || "Không thể tải thống kê.");
      }

      setLoading(false);
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      { title: "Tổng Users", value: stats?.totalUsers ?? 0, tone: "blue" },
      {
        title: "Tổng Bookings",
        value: stats?.totalBookings ?? 0,
        tone: "purple",
      },
      { title: "Pending Bookings", value: stats?.pending ?? 0, tone: "amber" },
      {
        title: "Completed Bookings",
        value: stats?.completed ?? 0,
        tone: "green",
      },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="dashboard-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state dashboard-state-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="dashboard-panel">
      <div className="dashboard-grid">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            tone={card.tone}
          />
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
