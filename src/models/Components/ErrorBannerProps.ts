export interface ErrorBannerProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
