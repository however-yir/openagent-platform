import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import ForgePilotLogo from "#/assets/branding/forgepilot-logo.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";

export function ForgePilotLogoButton() {
  const { t } = useTranslation();

  const tooltipText = t(I18nKey.BRANDING$FORGEPILOT);
  const ariaLabel = t(I18nKey.BRANDING$FORGEPILOT_LOGO);

  return (
    <StyledTooltip content={tooltipText}>
      <NavLink to="/" aria-label={ariaLabel}>
        <ForgePilotLogo width={46} height={30} />
      </NavLink>
    </StyledTooltip>
  );
}
