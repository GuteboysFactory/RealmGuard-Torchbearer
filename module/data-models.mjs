const fields = foundry.data.fields;
const TypeDataModel = foundry.abstract.TypeDataModel;

const int = (initial = 0, min = 0, max = undefined) => new fields.NumberField({ required: true, nullable: false, integer: true, initial, min, ...(max === undefined ? {} : { max }) });
const str = (initial = "") => new fields.StringField({ required: true, nullable: false, initial });
const bool = (initial = false) => new fields.BooleanField({ required: true, nullable: false, initial });
const rating = (initial = 1, maximum = 6) => new fields.SchemaField({ value: int(initial, 0), max: int(maximum, 1) });

export class RealmGuardCharacterData extends TypeDataModel {
  static defineSchema() {
    return {
      biography: new fields.HTMLField({ required: true, nullable: false, initial: "" }),
      notes: new fields.HTMLField({ required: true, nullable: false, initial: "" }),
      concept: str(), rank: str(), homeland: str(), age: str(),
      lineage: str(), insignia: str(), seniorArtisan: str(), friend: str(),
      cloak: str(), weapon: str(), mentor: str(), enemy: str(), parents: str(),
      belief: str(), goal: str(), instinct: str(),
      attributes: new fields.SchemaField({
        nature: new fields.SchemaField({ value: int(4, 0, 7), maximum: int(4, 0, 7) }),
        will: rating(3, 6), health: rating(3, 6), resources: rating(2, 10), circles: rating(2, 10)
      }),
      resources: new fields.SchemaField({
        fate: new fields.SchemaField({ value: int(0), max: int(5, 1) }),
        persona: new fields.SchemaField({ value: int(0), max: int(5, 1) }),
        checks: new fields.SchemaField({ value: int(0), max: int(9, 1) })
      }),
      progression: new fields.SchemaField({
        level: int(1, 1, 10),
        spentFate: int(0, 0),
        spentPersona: int(0, 0)
      }),
      roll: new fields.SchemaField({ versus: bool(false), obstacle: int(1, 0), modifier: int(0, -20) })
    };
  }
}

export class RealmGuardNpcData extends RealmGuardCharacterData {}

export class RealmGuardRoleData extends TypeDataModel {
  static defineSchema() {
    return {
      rating: int(1, 0, 12),
      learning: new fields.SchemaField({ passed: int(0), failed: int(0), passNeeded: int(1), failNeeded: int(1) }),
      description: str(), notes: str(), versus: bool(false),
      beginnerAbility: str(""), beginnerAttempts: int(0, 0)
    };
  }
}
export class RealmGuardTraitData extends TypeDataModel { static defineSchema() { return { rating: int(1, 0, 6), description: str() }; } }
export class RealmGuardWiseData extends TypeDataModel { static defineSchema() { return { description: str() }; } }
export class RealmGuardGearData extends TypeDataModel {
  static defineSchema() {
    return {
      quantity: int(1),
      description: str(),
      inventory: new fields.SchemaField({
        mode: str("unassigned"),
        location: str(""),
        containerId: str(""),
        slots: int(1, 1, 4),
        bundle: int(1, 1, 99),
        wieldHands: int(0, 0, 2),
        containerType: str("none"),
        capacity: int(0, 0, 24)
      })
    };
  }
}

export class RealmGuardTokenOfPowerData extends TypeDataModel {
  static defineSchema() {
    return {
      level: int(1, 1, 3),
      linkType: str("skill"),
      linkedSkill: str(""),
      linkedUse: str(""),
      effectMode: str("level"),
      form: str(""),
      origin: str(""),
      description: new fields.HTMLField({ required: true, nullable: false, initial: "" }),
      session: new fields.SchemaField({ used: bool(false) })
    };
  }
}

export class RealmGuardTalentData extends TypeDataModel {
  static defineSchema() {
    return {
      sourceKey: str(""),
      minLevel: int(2, 2, 10),
      frequency: str("session"),
      linkType: str("skill"),
      linkedSkill: str(""),
      linkedAbility: str(""),
      effectMode: str("dice"),
      diceBonus: int(1, 0, 6),
      description: new fields.HTMLField({ required: true, nullable: false, initial: "" }),
      session: new fields.SchemaField({ used: bool(false) }),
      conflict: new fields.SchemaField({ usedId: str("") })
    };
  }
}

export class RealmGuardConditionData extends TypeDataModel {
  static defineSchema() {
    return {
      active: bool(false),
      icon: str("systems/realm-guard/assets/conditions/condition.svg"),
      rollModifier: int(0, -6, 6),
      appliesTo: str("all"),
      recoveryType: str("manual"),
      recoveryAbility: str(""),
      recoveryRole: str(""),
      recoveryObstacle: int(1, 0, 20),
      recoveryNote: str(""),
      description: new fields.HTMLField({ required: true, nullable: false, initial: "" })
    };
  }
}
