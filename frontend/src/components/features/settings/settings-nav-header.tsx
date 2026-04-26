import { useTranslation } from "react-i18next";
import { Typography } from "#/ui/typography";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface SettingsNavHeaderProps {
  text: string;
  className?: string;
}

export function SettingsNavHeader({ text, className }: SettingsNavHeaderProps) {
  const { t } = useTranslation();
  const resolvedText = text.includes("$") ? t(text as I18nKey) : text;

  return (
    <div className={cn("px-3.5", className)}>
      <Typography.Text className="text-[11px] font-medium text-[#8c8c8c] uppercase tracking-wide leading-5">
        {resolvedText}
      </Typography.Text>
    </div>
  );
}
