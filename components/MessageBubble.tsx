import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
  children: React.ReactNode;
  className?: string;
}

// Figma node 796:930 ("Portfolio Cleaning" file) — chat-style bubble, sharp
// bottom-left corner pointing back at whatever it's anchored to (currently
// WorkCaseStudyRow's large ghost cursor).
export default function MessageBubble({ children, className }: MessageBubbleProps) {
  return (
    <div className={[styles.bubble, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
