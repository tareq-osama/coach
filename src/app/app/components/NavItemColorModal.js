"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";

/** Muted, distinct palette for nav item icon backgrounds (icon will be white on these) */
export const NAV_ITEM_COLOR_PALETTE = [
  "#64748b", // slate
  "#0d9488", // teal
  "#059669", // emerald
  "#b45309", // amber
  "#be123c", // rose
  "#6d28d9", // violet
  "#4338ca", // indigo
  "#0e7490", // cyan
  "#4d7c0a", // lime
  "#dc2626", // red
  "#ea580c", // orange
  "#ca8a04", // yellow
];

export const DEFAULT_NAV_ICON_COLOR = NAV_ITEM_COLOR_PALETTE[0];

const DotsIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

export default function NavItemColorModal({ isOpen, onClose, itemLabel, currentColor, onSelectColor }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" placement="center">
      <ModalContent>
        <ModalHeader className="text-base">Choose color for &quot;{itemLabel}&quot;</ModalHeader>
        <ModalBody className="pb-4">
          <div className="grid grid-cols-6 gap-2">
            {NAV_ITEM_COLOR_PALETTE.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => {
                  onSelectColor(hex);
                  onClose();
                }}
                className="h-9 w-9 rounded-lg border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{
                  backgroundColor: hex,
                  borderColor: currentColor === hex ? "var(--heroui-primary)" : "transparent",
                }}
                aria-label={`Select color ${hex}`}
              />
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export { DotsIcon };
