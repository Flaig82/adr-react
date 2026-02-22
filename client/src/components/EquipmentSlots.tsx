interface EquipmentSlotsProps {
  character: any;
}

const slots = [
  { key: 'equipWeapon', label: 'Weapon', icon: '🗡️' },
  { key: 'equipArmor', label: 'Armor', icon: '🛡️' },
  { key: 'equipShield', label: 'Shield', icon: '🔰' },
  { key: 'equipHelm', label: 'Helm', icon: '⛑️' },
  { key: 'equipGloves', label: 'Gloves', icon: '🧤' },
  { key: 'equipAmulet', label: 'Amulet', icon: '📿' },
  { key: 'equipRing', label: 'Ring', icon: '💍' },
  { key: 'equipMagicAttack', label: 'Magic Atk', icon: '🔮' },
  { key: 'equipMagicDefense', label: 'Magic Def', icon: '🛡️' },
];

export function EquipmentSlots({ character }: EquipmentSlotsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const itemId = character[slot.key];
        const isEmpty = !itemId || itemId === 0;

        return (
          <div
            key={slot.key}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed transition-colors
              ${isEmpty
                ? 'border-gray-700 bg-gray-800/30'
                : 'border-adr-blue bg-adr-blue/10'
              }`}
          >
            <span className="text-2xl mb-1">{slot.icon}</span>
            <span className="text-xs text-gray-400">{slot.label}</span>
            {!isEmpty && (
              <span className="text-xs text-adr-gold mt-0.5">Equipped</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
