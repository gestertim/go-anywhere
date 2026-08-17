import { notFound } from "next/navigation";
import { getTrip } from "@/features/trips/queries";
import { EditTripSettingsForm } from "./EditTripSettingsForm";
import styles from "./edit-trip.module.css";

export default async function TripSettingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>旅程設定</p>
        <h1 className={styles.title}>編輯旅程</h1>
        <p className={styles.subtitle}>更新這趟旅程的名稱、目的地與日期，變更會立即套用。</p>
      </header>
      <div className={styles.card}>
        <EditTripSettingsForm trip={trip} />
      </div>
    </main>
  );
}
