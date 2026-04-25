import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors
      closeButton
      expand
      visibleToasts={4}
      duration={3500}
      style={{ zIndex: 999999 } as React.CSSProperties}
      toastOptions={{
        duration: 3500,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!bg-green-600 !text-white !border-green-700",
          error: "!bg-red-600 !text-white !border-red-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
