"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  CollapsibleSection,
  Drawer,
  DrawerActions,
  Modal,
} from "@/design-system";

export type CatalogFormVariant = "drawer" | "modal";

/**
 * Where a catalog form opens: a drawer on the catalog's pages (as every
 * register/edit form of the app) or a modal over another form (the "+"
 * beside an item's product or brand, already inside a drawer).
 */
export function CatalogFormShell({
  variant,
  title,
  subtitle,
  busy,
  onClose,
  section,
  actions,
  children,
}: {
  variant: CatalogFormVariant;
  title: string;
  subtitle: string;
  busy: boolean;
  onClose: () => void;
  /** The drawer shows the fields in this section (as Equipe/Moradores). */
  section: { icon: ReactNode; title: string; description: string };
  /** The cancel and submit buttons. */
  actions: ReactNode;
  children: ReactNode;
}) {
  if (variant === "drawer") {
    return (
      <Drawer
        open
        onClose={onClose}
        busy={busy}
        title={title}
        subtitle={subtitle}
        footer={<DrawerActions>{actions}</DrawerActions>}
      >
        <CollapsibleSection
          icon={section.icon}
          title={section.title}
          description={section.description}
        >
          {children}
        </CollapsibleSection>
      </Drawer>
    );
  }
  /**
   * Desktop: wider, and tall enough for a select's list (e.g. the units) to
   * open whole inside the modal instead of being cut by its scroll. The
   * product and the brand forms share the same size. Rendered in <body>:
   * the modal opens from inside another form (the request's drawer), and a
   * form inside a form would submit the outer one (reloading the page).
   */
  return createPortal(
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={title}
      busy={busy}
      footer={actions}
    >
      <div className="space-y-4 sm:min-h-[26rem]">
        <p className="text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </Modal>,
    document.body,
  );
}
