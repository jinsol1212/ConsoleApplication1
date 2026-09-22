import type { MerakiAbility, MerakiChampion, MerakiModifier } from './meraki'

export type BuiltStats = {
  hp: number
  armor: number
  mr: number
  ad: number
  ap: number
  as: number
  crit: number
  ah: number
  lethality: number
  armorPenPct: number
  magicPenFlat: number
  magicPenPct: number
  bonusAd: number
  bonusHp: number
}

export type ItemMods = {
  ad: number
  ap: number
  armor: number
  mr: number
  hp: number
  asPct: number
  crit: number
  ah: number
  lethality: number
  armorPenPct: number
  magicPenFlat: number
  magicPenPct: number
}

export const EMPTY_ITEM: ItemMods = {
  ad: 0,
  ap: 0,
  armor: 0,
  mr: 0,
  hp: 0,
  asPct: 0,
  crit: 0,
  ah: 0,
  lethality: 0,
  armorPenPct: 0,
  magicPenFlat: 0,
  magicPenPct: 0,
}

/** Data Dragon item.stats → 내부 모드 (폴백) */
export function parseDdItemStats(stats: Record<string, number>): ItemMods {
  const m = { ...EMPTY_ITEM }
  m.ad += stats.FlatPhysicalDamageMod ?? 0
  m.ap += stats.FlatMagicDamageMod ?? 0
  m.armor += stats.FlatArmorMod ?? 0
  m.mr += stats.FlatSpellBlockMod ?? 0
  m.hp += stats.FlatHPPoolMod ?? 0
  m.asPct += (stats.PercentAttackSpeedMod ?? 0) * 100
  m.crit += (stats.FlatCritChanceMod ?? 0) * 100
  if (stats.PercentCooldownMod) {
    const cdr = -stats.PercentCooldownMod
    m.ah += Math.round((cdr / (1 - cdr)) * 100)
  }
  return m
}

/** Meraki item.stats → 관통·스킬가속 포함 */
export function parseMerakiItemStats(
  stats: Record<string, { flat?: number; percent?: number }>,
): ItemMods {
  const m = { ...EMPTY_ITEM }
  const f = (k: string) => stats[k]?.flat ?? 0
  const p = (k: string) => stats[k]?.percent ?? 0
  m.ad += f('attackDamage')
  m.ap += f('abilityPower')
  m.armor += f('armor')
  m.mr += f('magicResistance')
  m.hp += f('health')
  m.asPct += p('attackSpeed')
  m.crit += p('criticalStrikeChance')
  m.ah += f('abilityHaste')
  m.lethality += f('lethality')
  m.armorPenPct += p('armorPenetration')
  m.magicPenFlat += f('magicPenetration')
  m.magicPenPct += p('magicPenetration')
  return m
}

export function sumItems(items: ItemMods[]): ItemMods {
  return items.reduce(
    (a, b) => ({
      ad: a.ad + b.ad,
      ap: a.ap + b.ap,
      armor: a.armor + b.armor,
      mr: a.mr + b.mr,
      hp: a.hp + b.hp,
      asPct: a.asPct + b.asPct,
      crit: a.crit + b.crit,
      ah: a.ah + b.ah,
      lethality: a.lethality + b.lethality,
      armorPenPct: a.armorPenPct + b.armorPenPct,
      magicPenFlat: a.magicPenFlat + b.magicPenFlat,
      magicPenPct: a.magicPenPct + b.magicPenPct,
    }),
    { ...EMPTY_ITEM },
  )
}

function growth(base: number, perLevel: number, level: number) {
  // Riot growth: perLevel * (level-1) * (0.7025 + 0.0175*(level-1))
  if (level <= 1) return base
  const n = level - 1
  return base + perLevel * n * (0.7025 + 0.0175 * n)
}

export function buildStats(
  meraki: MerakiChampion,
  level: number,
  items: ItemMods,
): BuiltStats {
  const s = meraki.stats
  const baseAd = growth(
    s.attackDamage?.flat ?? 0,
    s.attackDamage?.perLevel ?? 0,
    level,
  )
  const baseHp = growth(s.health?.flat ?? 0, s.health?.perLevel ?? 0, level)
  const baseArmor = growth(s.armor?.flat ?? 0, s.armor?.perLevel ?? 0, level)
  const baseMr = growth(
    s.magicResistance?.flat ?? 0,
    s.magicResistance?.perLevel ?? 0,
    level,
  )
  const baseAs = s.attackSpeed?.flat ?? 0.625
  const asPerLevel = s.attackSpeed?.perLevel ?? 0 // already percent points
  const bonusAsFromLevel = asPerLevel * (level - 1) * (0.7025 + 0.0175 * (level - 1))
  const bonusAd = items.ad
  const bonusHp = items.hp

  return {
    hp: baseHp + items.hp,
    armor: baseArmor + items.armor,
    mr: baseMr + items.mr,
    ad: baseAd + items.ad,
    ap: items.ap,
    as: baseAs * (1 + (bonusAsFromLevel + items.asPct) / 100),
    crit: items.crit,
    ah: items.ah,
    lethality: items.lethality,
    armorPenPct: items.armorPenPct,
    magicPenFlat: items.magicPenFlat,
    magicPenPct: items.magicPenPct,
    bonusAd,
    bonusHp,
  }
}

export function mitigatePhysical(
  raw: number,
  targetArmor: number,
  lethality: number,
  armorPenPct: number,
  attackerLevel: number,
): number {
  // Lethality → flat pen scales slightly with level
  const flatPen = lethality * (0.6 + (0.4 * attackerLevel) / 18)
  let armor = targetArmor
  armor -= flatPen
  armor *= 1 - armorPenPct / 100
  if (armor < 0) {
    return raw * (2 - 100 / (100 - armor))
  }
  return raw * (100 / (100 + armor))
}

export function mitigateMagic(
  raw: number,
  targetMr: number,
  magicPenFlat: number,
  magicPenPct: number,
): number {
  let mr = targetMr
  mr *= 1 - magicPenPct / 100
  mr -= magicPenFlat
  if (mr < 0) {
    return raw * (2 - 100 / (100 - mr))
  }
  return raw * (100 / (100 + mr))
}

export function cdrFactor(ah: number) {
  return 1 + ah / 100
}

export function effectiveCooldown(base: number, ah: number, affected = true) {
  if (!affected) return base
  return base / cdrFactor(ah)
}

function pickValue(mod: MerakiModifier, rank: number): number {
  const idx = Math.min(Math.max(rank - 1, 0), mod.values.length - 1)
  return mod.values[idx] ?? 0
}

function pickUnit(mod: MerakiModifier, rank: number): string {
  const idx = Math.min(Math.max(rank - 1, 0), mod.units.length - 1)
  return (mod.units[idx] ?? '').trim()
}

/** Meraki unit 문자열 → 스케일링 데미지 */
export function scaleModifier(
  mod: MerakiModifier,
  rank: number,
  stats: BuiltStats,
  targetHp: number,
): { amount: number; label: string } {
  const v = pickValue(mod, rank)
  const unit = pickUnit(mod, rank).toLowerCase()

  if (!unit) {
    return { amount: v, label: `${round1(v)}` }
  }

  // percent ratios like "% AD", "% AP", "% bonus AD"
  if (unit.includes('%')) {
    const ratio = v / 100
    if (unit.includes('bonus ad')) {
      return {
        amount: ratio * stats.bonusAd,
        label: `${v}% 추가 AD (${round1(ratio * stats.bonusAd)})`,
      }
    }
    if (unit.includes('bonus ap')) {
      return {
        amount: ratio * stats.ap,
        label: `${v}% AP (${round1(ratio * stats.ap)})`,
      }
    }
    if (unit.includes('bonus health') || unit.includes('bonus hp')) {
      return {
        amount: ratio * stats.bonusHp,
        label: `${v}% 추가 체력 (${round1(ratio * stats.bonusHp)})`,
      }
    }
    if (
      unit.includes("target's maximum health") ||
      unit.includes('target maximum health') ||
      unit.includes("of the target's health")
    ) {
      return {
        amount: ratio * targetHp,
        label: `${v}% 대상 최대 체력 (${round1(ratio * targetHp)})`,
      }
    }
    if (unit.includes('maximum health') || unit.includes('max health') || unit === '% health') {
      return {
        amount: ratio * stats.hp,
        label: `${v}% 최대 체력 (${round1(ratio * stats.hp)})`,
      }
    }
    if (unit.includes('ad') && !unit.includes('ap')) {
      return {
        amount: ratio * stats.ad,
        label: `${v}% AD (${round1(ratio * stats.ad)})`,
      }
    }
    if (unit.includes('ap')) {
      return {
        amount: ratio * stats.ap,
        label: `${v}% AP (${round1(ratio * stats.ap)})`,
      }
    }
  }

  return { amount: v, label: `${round1(v)} ${unit}` }
}

export type DamageLine = {
  attribute: string
  raw: number
  parts: string[]
  mitigated: number
  kind: 'physical' | 'magic' | 'true' | 'mixed' | 'other'
}

function inferKind(
  attribute: string,
  abilityDamageType: string | null | undefined,
): DamageLine['kind'] {
  const a = attribute.toLowerCase()
  if (a.includes('true')) return 'true'
  if (a.includes('magic')) return 'magic'
  if (a.includes('physical') || a.includes('bonus physical')) return 'physical'
  if (a.includes('heal') || a.includes('shield') || a.includes('speed'))
    return 'other'
  if (!abilityDamageType) return 'other'
  const d = abilityDamageType.toLowerCase()
  if (d.includes('true')) return 'true'
  if (d.includes('magic')) return 'magic'
  if (d.includes('physical')) return 'physical'
  if (d.includes('mixed')) return 'mixed'
  return 'other'
}

export function calcAbilityDamage(
  ability: MerakiAbility,
  rank: number,
  attacker: BuiltStats,
  defender: BuiltStats,
  attackerLevel: number,
): DamageLine[] {
  const lines: DamageLine[] = []
  for (const effect of ability.effects) {
    for (const leveling of effect.leveling) {
      const attr = leveling.attribute
      const kind = inferKind(attr, ability.damageType)
      if (kind === 'other' && !/damage|dmg/i.test(attr)) continue

      const parts: string[] = []
      let raw = 0
      for (const mod of leveling.modifiers) {
        const scaled = scaleModifier(mod, rank, attacker, defender.hp)
        raw += scaled.amount
        parts.push(scaled.label)
      }

      let mitigated = raw
      if (kind === 'physical' || (kind === 'mixed' && !/magic/i.test(attr))) {
        mitigated = mitigatePhysical(
          raw,
          defender.armor,
          attacker.lethality,
          attacker.armorPenPct,
          attackerLevel,
        )
      } else if (kind === 'magic') {
        mitigated = mitigateMagic(
          raw,
          defender.mr,
          attacker.magicPenFlat,
          attacker.magicPenPct,
        )
      } else if (kind === 'true') {
        mitigated = raw
      } else if (kind === 'mixed') {
        // split unknown — show raw as mitigated estimate via armor average
        mitigated =
          (mitigatePhysical(
            raw / 2,
            defender.armor,
            attacker.lethality,
            attacker.armorPenPct,
            attackerLevel,
          ) +
            mitigateMagic(
              raw / 2,
              defender.mr,
              attacker.magicPenFlat,
              attacker.magicPenPct,
            ))
      }

      lines.push({
        attribute: attr,
        raw,
        parts,
        mitigated,
        kind,
      })
    }
  }
  return lines
}

export function abilityCooldown(
  ability: MerakiAbility,
  rank: number,
  ah: number,
): number | null {
  const mods = ability.cooldown?.modifiers
  if (!mods?.length) return null
  const base = pickValue(mods[0], rank)
  return effectiveCooldown(
    base,
    ah,
    ability.cooldown?.affectedByCdr !== false,
  )
}

export function autoAttackDamage(
  attacker: BuiltStats,
  defender: BuiltStats,
  attackerLevel: number,
  crit = false,
): { raw: number; mitigated: number } {
  const critMult = crit ? 1.75 + (attacker.crit >= 0 ? 0 : 0) : 1
  // base crit 175%; IE etc. not modeled beyond item AD/crit chance
  const raw = attacker.ad * (crit ? 1.75 : 1)
  void critMult
  return {
    raw,
    mitigated: mitigatePhysical(
      raw,
      defender.armor,
      attacker.lethality,
      attacker.armorPenPct,
      attackerLevel,
    ),
  }
}

export function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function round0(n: number) {
  return Math.round(n)
}
