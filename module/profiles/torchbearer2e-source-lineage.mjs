import { freezeTb2e } from "../m10d-tb2e-source-coverage.mjs";

export const TB2E_GUIDE_SOURCE_AUTHORITY=freezeTb2e([
  {
    id:"538386285-Torchbearer-2E-Character-Creation-Guide.pdf",
    file:"538386285-Torchbearer-2E-Character-Creation-Guide.pdf",
    role:"RULE_GUIDE",tier:"GUIDE",pdfPages:48,
    sha256:"1fffcfca9739a76ca1d2cdfdb618fafbe764599db0273124cdcc0f91a1a9fc6e"
  },
  {
    id:"538386649-Torchbearer-2E-Quick-Rules-Guide.pdf",
    file:"538386649-Torchbearer-2E-Quick-Rules-Guide.pdf",
    role:"RULE_GUIDE",tier:"GUIDE",pdfPages:102,
    sha256:"2389aaac039428632ed9aaac7f71489406213057a7893f6a5be810d934f570cb"
  }
]);

export const TB2E_CORE_RULEBOOK_AUTHORITY=freezeTb2e([
  {
    id:"808847477-Dungeoneers-Handbook.pdf",file:"808847477-Dungeoneers-Handbook.pdf",
    role:"CORE_RULEBOOK_PLAYER_CHARACTER",tier:"CORE",pdfPages:256,
    sha256:"1e2e08c47f20e07a200ee50757ce6c6a5b1cec210d461560a11ca67e318ec35b"
  },
  {
    id:"809781414-TB2e-Scholars-Guide.pdf",file:"809781414-TB2e-Scholars-Guide.pdf",
    role:"CORE_RULEBOOK_GM_PROCEDURES",tier:"CORE",pdfPages:320,
    sha256:"3b38d8ca7e998415e4eb7f3299fc3b157ff2e4295e3086c52433c68f408e7ea1"
  }
]);

export const TB2E_OPTIONAL_SOURCE_AUTHORITY=freezeTb2e([
  {
    id:"809781402-TB2e-Lore-Masters-Manual.pdf",file:"809781402-TB2e-Lore-Masters-Manual.pdf",
    role:"OPTIONAL_ADVANCED_RULES",tier:"OPTIONAL_EXPANSION",pdfPages:272,
    sha256:"cd04b422416d3c96dafce41e4a208323feadff35929b2cbcbc13492b71dbcbaf"
  },
  {
    id:"679301798-TB2E-Scavenger-s-Supplement.pdf",file:"679301798-TB2E-Scavenger-s-Supplement.pdf",
    role:"OPTIONAL_CLASSES_AND_RULES",tier:"OPTIONAL_EXPANSION",pdfPages:72,
    sha256:"8c101a88eba2ee0161c700e138d34850c4b3d8dd16cfe1394df9733541c594cb"
  }
]);

export const TB2E_PROJECT_GOVERNANCE_AUTHORITY=freezeTb2e([
  {id:"MG_FAMILY_CORE_RULE_AUDIT_v0.2",file:"MG_FAMILY_CORE_RULE_AUDIT_v0.2(1).md",role:"CORE_AUDIT",tier:"PROJECT_GOVERNANCE",pdfPages:null,sha256:"21bacebd16573a452ab7e5e21eb873cf212b01f010199671b2d7dd86a7eb420b"},
  {id:"MG_FAMILY_CORE_ARCHITECTURE_v0.1",file:"MG_FAMILY_CORE_ARCHITECTURE_v0.1(1).md",role:"ARCHITECTURE",tier:"PROJECT_GOVERNANCE",pdfPages:null,sha256:"83bc92589fe31dee326328b8eeaeecf2a428a0e210ba94c3ef105a6f43879e8e"},
  {id:"MG_FAMILY_CORE_IMPLEMENTATION_ROADMAP_v0.1",file:"MG_FAMILY_CORE_IMPLEMENTATION_ROADMAP_v0.1(1).md",role:"IMPLEMENTATION_POLICY",tier:"PROJECT_GOVERNANCE",pdfPages:null,sha256:"2beea7db73d6015fbe78cdb2274c4991d64712a8b764a829929cf822f71411e8"}
]);

export const TB2E_SOURCE_AUTHORITY=freezeTb2e([
  ...TB2E_GUIDE_SOURCE_AUTHORITY,
  ...TB2E_CORE_RULEBOOK_AUTHORITY,
  ...TB2E_OPTIONAL_SOURCE_AUTHORITY,
  ...TB2E_PROJECT_GOVERNANCE_AUTHORITY
]);
