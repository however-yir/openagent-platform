import { useConfig } from "#/hooks/query/use-config";
import {
  SAAS_NAV_ITEMS,
  OSS_NAV_ITEMS,
  SettingsNavItem,
  SettingsNavSection,
} from "#/constants/settings-nav";
import { OrganizationUserRole } from "#/types/org";
import { isBillingHidden } from "#/utils/org/billing-visibility";
import { isSettingsPageHidden } from "#/utils/settings-utils";
import { useMe } from "./query/use-me";
import { usePermission } from "./organizations/use-permissions";
import { useOrgTypeAndAccess } from "./use-org-type-and-access";

// Rendered navigation item types
export type SettingsNavRenderedItem =
  | { type: "item"; item: SettingsNavItem }
  | { type: "header"; text: string }
  | { type: "divider" };

// Section header text mapping
const SECTION_HEADERS: Record<SettingsNavSection, string> = {
  model: "模型",
  runtime: "运行时",
  security: "安全",
  team: "团队",
  integrations: "集成",
};

/**
 * Build Settings navigation items based on:
 * - app mode (saas / oss)
 * - feature flags
 * - active user's role
 * - org type (personal vs team)
 * @returns Settings Nav Rendered Items (items, headers, dividers)
 */
export function useSettingsNavItems(): SettingsNavRenderedItem[] {
  const { data: config } = useConfig();
  const { data: user } = useMe();
  const userRole: OrganizationUserRole = user?.role ?? "member";
  const { hasPermission } = usePermission(userRole);
  const { isPersonalOrg, isTeamOrg, organizationId } = useOrgTypeAndAccess();

  const shouldHideBilling = isBillingHidden(
    config,
    hasPermission("view_billing"),
  );
  const isSaasMode = config?.app_mode === "saas";
  const featureFlags = config?.feature_flags;

  let items = isSaasMode ? [...SAAS_NAV_ITEMS] : [...OSS_NAV_ITEMS];

  // First apply feature flag-based hiding
  items = items.filter((item) => !isSettingsPageHidden(item.to, featureFlags));

  // Hide billing when billing is not accessible OR when in team org
  if (shouldHideBilling || isTeamOrg) {
    items = items.filter((item) => item.to !== "/settings/billing");
  }

  if (isSaasMode) {
    // Hide org routes for personal orgs, missing permissions, or no org selected
    if (!hasPermission("view_billing") || !organizationId || isPersonalOrg) {
      items = items.filter((item) => item.to !== "/settings/org");
    }

    if (
      !hasPermission("invite_user_to_organization") ||
      !organizationId ||
      isPersonalOrg
    ) {
      items = items.filter((item) => item.to !== "/settings/org-members");
    }

    // Hide user settings for non-members without org context in SaaS mode
    if (!organizationId) {
      items = items.filter((item) => item.to !== "/settings/user");
    }
  } else {
    // In OSS mode we don't expose team/billing pages in settings nav
    items = items.filter(
      (item) =>
        item.to !== "/settings/org" && item.to !== "/settings/org-members",
    );
  }

  // Build rendered items with explicit section headers and dividers
  const renderedItems: SettingsNavRenderedItem[] = [];
  let currentSection: SettingsNavSection | undefined;
  let isFirstSection = true;

  for (const item of items) {
    const itemSection = item.section;

    if (itemSection && itemSection !== currentSection) {
      if (!isFirstSection) {
        renderedItems.push({ type: "divider" });
      }

      renderedItems.push({
        type: "header",
        text: SECTION_HEADERS[itemSection],
      });

      currentSection = itemSection;
      isFirstSection = false;
    }

    renderedItems.push({ type: "item", item });
  }

  return renderedItems;
}
