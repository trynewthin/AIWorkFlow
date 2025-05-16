import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  // 检测当前主题
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />
  );
}

export { Toaster }
