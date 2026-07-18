import styles from './MessageThread.module.css'

interface MessageThreadProps {
  className?: string
}

export default function MessageThread({ className }: MessageThreadProps) {
  return (
    <div className={`${styles.messageContainer}${className ? ` ${className}` : ''}`}>
      <div className={styles.messageScreen}>

        <div className={styles.rowLeft}>
          <div className={styles.bubble}>
            <p className={styles.bubbleText}>Hey Edgar. Just got off a call.</p>
          </div>
        </div>

        <div className={styles.rowRight}>
          <div className={`${styles.bubble} ${styles.bubbleSent}`}>
            <p className={styles.bubbleText}>Hey. How&apos;d it go?</p>
          </div>
        </div>

        <div className={styles.rowLeft}>
          <div className={styles.bubble}>
            <p className={styles.bubbleText}>Every team has the same pain points around software assets.</p>
          </div>
        </div>

        <div className={styles.rowLeft}>
          <div className={styles.bubble}>
            <p className={styles.bubbleText}>Millions are spent on licenses they can&apos;t track or efficiently optimize.</p>
          </div>
        </div>

        <div className={styles.rowLeft}>
          <div className={styles.bubble}>
            <p className={styles.bubbleText}>Everything is ran through spreadsheets and tools that don&apos;t talk to each other.</p>
          </div>
        </div>

        <div className={styles.rowRight}>
          <img src="/images/software-observability/face.jpg" alt="" aria-hidden="true" className={styles.emoji} />
        </div>

      </div>
    </div>
  )
}
