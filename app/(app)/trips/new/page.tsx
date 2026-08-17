import { NewTripForm } from "./NewTripForm";
import styles from "./new-trip.module.css";

export default function NewTripPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>新的開始</p>
        <h1 className={styles.title}>建立旅程</h1>
        <p className={styles.subtitle}>填寫旅程名稱、目的地與日期，開始規劃你的下一趟旅行。</p>
      </header>
      <div className={styles.card}>
        <NewTripForm />
      </div>
    </main>
  );
}
