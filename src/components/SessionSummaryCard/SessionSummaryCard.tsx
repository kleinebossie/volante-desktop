import styles from './SessionSummaryCard.module.css';

export interface SessionSummaryRow {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'danger';
}

interface SessionSummaryCardProps {
  title: string;
  rows: SessionSummaryRow[];
}

export function SessionSummaryCard({ title, rows }: SessionSummaryCardProps) {
  return (
    <section className={styles.card} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.grid}>
        {rows.map((row) => {
          const toneClass =
            row.tone === 'success'
              ? styles.valueSuccess
              : row.tone === 'danger'
                ? styles.valueDanger
                : styles.value;

          return (
            <div key={row.label} className={styles.row}>
              <div className={styles.label}>{row.label}</div>
              <div className={toneClass}>{row.value}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
