import Link from "next/link";
import styles from "./index.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <Link href="/rag" passHref>
          <button className={styles.button}>PDF情報</button>
        </Link>
        <Link href="/information" passHref>
          <button className={styles.button}>避難所情報</button>
        </Link>
        <Link href="/map" passHref>
          <button className={styles.button}>マップ</button>
        </Link>
        <Link href="/question" passHref>
          <button className={styles.button}>質問</button>
        </Link>
        <Link href="/completed" passHref>
          <button className={styles.button}>完成</button>
        </Link>
      </div>
    </div>
  );
}
