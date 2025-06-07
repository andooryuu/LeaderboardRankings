import { Button } from "react-bootstrap";
import { useLanguage } from "./LanguageContext";

interface LanguageToggleProps {
  variant?: string;
  size?: "sm" | "lg";
  className?: string;
}

function LanguageToggle({
  variant = "outline-light",
  size,
  className = "",
}: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggleLanguage}
    >
      {language === "en" ? "🇫🇷 Français" : "🇬🇧 English"}
    </Button>
  );
}

export default LanguageToggle;
