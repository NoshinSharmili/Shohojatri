/* @ds-bundle: {"format":4,"namespace":"ShohojatriDesignSystem_1ff839","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"ActivityCard","sourcePath":"components/cards/ActivityCard.jsx"},{"name":"Avatar","sourcePath":"components/cards/Avatar.jsx"},{"name":"Card","sourcePath":"components/cards/Card.jsx"},{"name":"ChildCard","sourcePath":"components/cards/ChildCard.jsx"},{"name":"LogEntryCard","sourcePath":"components/cards/LogEntryCard.jsx"},{"name":"ReminderCard","sourcePath":"components/cards/ReminderCard.jsx"},{"name":"RoleBadge","sourcePath":"components/cards/RoleBadge.jsx"},{"name":"SuggestionCard","sourcePath":"components/cards/SuggestionCard.jsx"},{"name":"ChatBubble","sourcePath":"components/chat/ChatBubble.jsx"},{"name":"SourceChip","sourcePath":"components/chat/SourceChip.jsx"},{"name":"Chip","sourcePath":"components/choice/Chip.jsx"},{"name":"ChoiceCard","sourcePath":"components/choice/ChoiceCard.jsx"},{"name":"ChoiceGroup","sourcePath":"components/choice/ChoiceGroup.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"RiskBadge","sourcePath":"components/data/RiskBadge.jsx"},{"name":"ScoreGauge","sourcePath":"components/data/ScoreGauge.jsx"},{"name":"RISK","sourcePath":"components/data/riskLevels.js"},{"name":"RISK_ORDER","sourcePath":"components/data/riskLevels.js"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"StateView","sourcePath":"components/feedback/StateView.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"LanguageToggle","sourcePath":"components/navigation/LanguageToggle.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Stepper","sourcePath":"components/navigation/Stepper.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Modal","sourcePath":"components/overlay/Modal.jsx"},{"name":"Sheet","sourcePath":"components/overlay/Sheet.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"7b1387dc6748","components/actions/IconButton.jsx":"f2173f76097a","components/cards/ActivityCard.jsx":"f3800a938bf6","components/cards/Avatar.jsx":"b192371ee6f6","components/cards/Card.jsx":"162a2e7da227","components/cards/ChildCard.jsx":"cfc3c10731db","components/cards/LogEntryCard.jsx":"cdadcbf97604","components/cards/ReminderCard.jsx":"326917fb296f","components/cards/RoleBadge.jsx":"372d696f9aa2","components/cards/SuggestionCard.jsx":"bcc8fdbd5fcb","components/chat/ChatBubble.jsx":"a1f1965bbb01","components/chat/SourceChip.jsx":"41912f567687","components/choice/Chip.jsx":"57f918edbb77","components/choice/ChoiceCard.jsx":"1835b88347ce","components/choice/ChoiceGroup.jsx":"8dca9a140ba9","components/core/Icon.jsx":"8861f6b4ccfd","components/data/RiskBadge.jsx":"6dda2853bd65","components/data/ScoreGauge.jsx":"aca0a748f6ed","components/data/riskLevels.js":"d6e27529d9a4","components/feedback/Skeleton.jsx":"a3250006e749","components/feedback/StateView.jsx":"dadf01c6e233","components/feedback/Toast.jsx":"59a404c52024","components/forms/TextField.jsx":"69de2baf47ac","components/navigation/BottomNav.jsx":"761ba320a0dc","components/navigation/LanguageToggle.jsx":"455b39cacf77","components/navigation/Sidebar.jsx":"73e71f7a92cb","components/navigation/Stepper.jsx":"8802a12c9dbf","components/navigation/Tabs.jsx":"cdf5861ba17e","components/overlay/Modal.jsx":"070e408b9465","components/overlay/Sheet.jsx":"0774819c7bf5","components/utils.js":"dd59e61fcc50","ui_kits/companion/AppShell.jsx":"d41051f659da","ui_kits/companion/ChatScreen.jsx":"408c70bea575","ui_kits/companion/OverviewScreen.jsx":"d45885cfd0d9","ui_kits/companion/ReportsScreen.jsx":"cdc54ba48b75","ui_kits/companion/data.jsx":"731de7617a98","ui_kits/screening/ActivityScreen.jsx":"ff2c290ff4b9","ui_kits/screening/QuestionScreen.jsx":"fccac6c13f1a","ui_kits/screening/ReportScreen.jsx":"1cd33f6d9554","ui_kits/screening/Shell.jsx":"280f5047d456","ui_kits/screening/WelcomeScreen.jsx":"70da0f76b460"},"inlinedExternals":[],"unexposedExports":[{"name":"cx","sourcePath":"components/utils.js"},{"name":"num","sourcePath":"components/utils.js"},{"name":"toBnDigits","sourcePath":"components/utils.js"}]} */

(() => {

const __ds_ns = (window.ShohojatriDesignSystem_1ff839 = window.ShohojatriDesignSystem_1ff839 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/Avatar.jsx
try { (() => {
function Avatar({
  src,
  name = '',
  size = 48,
  alt
}) {
  const initial = (name || '').trim().charAt(0);
  return /*#__PURE__*/React.createElement("span", {
    className: "sj-avatar",
    style: {
      width: size,
      height: size,
      fontSize: Math.round(size * 0.42)
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt || name
  }) : initial);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function pascal(n) {
  return String(n).split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join('');
}
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color = 'currentColor',
  className,
  style,
  title
}) {
  const L = typeof window !== 'undefined' ? window.lucide : null;
  const key = pascal(name);
  const node = L && (L.icons && L.icons[key] || L[key]);
  let kids = [];
  if (Array.isArray(node)) {
    kids = node[0] === 'svg' ? node[2] || [] : node;
  }
  return /*#__PURE__*/React.createElement("svg", {
    className: 'sj-icon' + (className ? ' ' + className : ''),
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": title ? undefined : true,
    role: title ? 'img' : undefined
  }, title ? /*#__PURE__*/React.createElement("title", null, title) : null, kids.map(function (k, i) {
    return React.createElement(k[0], Object.assign({
      key: i
    }, k[1]));
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/cards/ReminderCard.jsx
try { (() => {
const KINDS = {
  therapy: {
    icon: 'hand-heart',
    bg: 'var(--sj-teal-50)',
    fg: 'var(--sj-ink-teal)'
  },
  appointment: {
    icon: 'calendar-heart',
    bg: 'var(--sj-navy-50)',
    fg: 'var(--sj-navy)'
  },
  medicine: {
    icon: 'pill',
    bg: 'var(--sj-amber-50)',
    fg: 'var(--sj-ink-amber)'
  },
  activity: {
    icon: 'sparkles',
    bg: 'var(--sj-sprout-50)',
    fg: 'var(--sj-ink-leaf)'
  }
};
function ReminderCard({
  title,
  time,
  kind = 'appointment',
  done = false,
  onToggle,
  toggleLabel = 'Mark done',
  lang
}) {
  const k = KINDS[kind] || KINDS.appointment;
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-card",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px'
    },
    lang: lang
  }, /*#__PURE__*/React.createElement("span", {
    className: "sj-tile",
    style: {
      background: k.bg,
      color: k.fg
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.icon,
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 16,
      lineHeight: 1.55,
      color: done ? 'var(--text-3)' : 'var(--text-1)',
      textDecoration: done ? 'line-through' : 'none'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "sj-meta",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 15
  }), time)), onToggle !== undefined ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'sj-check' + (done ? ' sj-check--on' : ''),
    "aria-pressed": done,
    "aria-label": toggleLabel,
    onClick: onToggle
  }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 18,
    strokeWidth: 3
  }) : null) : null);
}
Object.assign(__ds_scope, { ReminderCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ReminderCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/RoleBadge.jsx
try { (() => {
const ROLES = {
  parent: {
    icon: 'heart',
    bn: 'অভিভাবক',
    en: 'Parent'
  },
  teacher: {
    icon: 'school',
    bn: 'শিক্ষক',
    en: 'Teacher'
  },
  specialist: {
    icon: 'stethoscope',
    bn: 'বিশেষজ্ঞ',
    en: 'Specialist'
  }
};
function RoleBadge({
  role = 'parent',
  label,
  lang = 'bn'
}) {
  const r = ROLES[role] || ROLES.parent;
  return /*#__PURE__*/React.createElement("span", {
    className: 'sj-role sj-role--' + role,
    lang: lang
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: r.icon,
    size: 15,
    strokeWidth: 2.25
  }), label || r[lang]);
}
Object.assign(__ds_scope, { RoleBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/RoleBadge.jsx", error: String((e && e.message) || e) }); }

// components/chat/SourceChip.jsx
try { (() => {
const ICON = {
  log: 'notebook-pen',
  report: 'clipboard-list',
  doc: 'file-text',
  guide: 'book-open'
};
function SourceChip({
  label,
  kind = 'doc',
  onClick,
  lang
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sj-src",
    lang: lang,
    onClick: onClick
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ICON[kind] || 'file-text',
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { SourceChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/SourceChip.jsx", error: String((e && e.message) || e) }); }

// components/chat/ChatBubble.jsx
try { (() => {
function ChatBubble({
  from = 'assistant',
  children,
  sources = [],
  sourcesLabel,
  time,
  avatarSrc,
  lang
}) {
  const me = from === 'user';
  return /*#__PURE__*/React.createElement("div", {
    className: 'sj-bubble-row' + (me ? ' sj-bubble-row--user' : ''),
    lang: lang
  }, !me ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: 'none',
      borderRadius: '50%',
      background: avatarSrc ? '#fff' : 'var(--sj-teal-50)',
      color: 'var(--sj-ink-teal)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      border: '1px solid var(--border-1)'
    }
  }, avatarSrc ? /*#__PURE__*/React.createElement("img", {
    src: avatarSrc,
    alt: "",
    style: {
      width: '80%',
      height: '80%',
      objectFit: 'contain'
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sparkles",
    size: 18
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: me ? 'flex-end' : 'flex-start',
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: 'sj-bubble sj-bubble--' + (me ? 'user' : 'assistant')
  }, /*#__PURE__*/React.createElement("div", null, children), sources.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, sourcesLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-3)',
      fontWeight: 600
    }
  }, sourcesLabel) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, sources.map(function (s, i) {
    return /*#__PURE__*/React.createElement(__ds_scope.SourceChip, {
      key: i,
      label: s.label || s,
      kind: s.kind,
      onClick: s.onClick
    });
  }))) : null), time ? /*#__PURE__*/React.createElement("div", {
    className: "sj-bubble__meta"
  }, time) : null));
}
Object.assign(__ds_scope, { ChatBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/ChatBubble.jsx", error: String((e && e.message) || e) }); }

// components/data/riskLevels.js
try { (() => {
const RISK = {
  low: {
    icon: 'sprout',
    bn: 'কম ঝুঁকি',
    en: 'Low',
    n: 1,
    c: 'var(--sj-risk-low)'
  },
  moderate: {
    icon: 'eye',
    bn: 'মাঝারি ঝুঁকি',
    en: 'Moderate',
    n: 2,
    c: 'var(--sj-risk-moderate)'
  },
  elevated: {
    icon: 'compass',
    bn: 'বাড়তি ঝুঁকি',
    en: 'Elevated',
    n: 3,
    c: 'var(--sj-risk-elevated)'
  },
  high: {
    icon: 'hand-heart',
    bn: 'উচ্চ ঝুঁকি',
    en: 'High',
    n: 4,
    c: 'var(--sj-risk-high)'
  }
};
const RISK_ORDER = ['low', 'moderate', 'elevated', 'high'];
Object.assign(__ds_scope, { RISK, RISK_ORDER });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/riskLevels.js", error: String((e && e.message) || e) }); }

// components/data/RiskBadge.jsx
try { (() => {
function RiskBadge({
  level = 'low',
  label,
  size = 'md',
  lang = 'bn',
  showBars = true
}) {
  const r = __ds_scope.RISK[level] || __ds_scope.RISK.low;
  const lg = size === 'lg';
  return /*#__PURE__*/React.createElement("span", {
    className: 'sj-risk sj-risk--' + level + (lg ? ' sj-risk--lg' : ''),
    lang: lang,
    role: "status"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: r.icon,
    size: lg ? 22 : 18,
    strokeWidth: 2.25
  }), /*#__PURE__*/React.createElement("span", null, label || r[lang]), showBars ? /*#__PURE__*/React.createElement("span", {
    className: "sj-risk__bars",
    "aria-hidden": "true"
  }, [1, 2, 3, 4].map(function (i) {
    return /*#__PURE__*/React.createElement("i", {
      key: i,
      className: i <= r.n ? 'on' : '',
      style: {
        height: (lg ? 6 : 5) + i * (lg ? 3 : 2.5)
      }
    });
  })) : null);
}
Object.assign(__ds_scope, { RiskBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RiskBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "sj-skel",
    "aria-hidden": "true",
    style: Object.assign({
      display: 'block',
      width: width,
      height: height,
      borderRadius: radius
    }, style || {})
  });
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StateView.jsx
try { (() => {
const K = {
  empty: {
    i: 'sprout',
    bg: 'var(--sj-sprout-50)',
    fg: 'var(--sj-ink-leaf)'
  },
  error: {
    i: 'cloud-off',
    bg: 'var(--sj-amber-50)',
    fg: 'var(--sj-ink-amber)'
  },
  offline: {
    i: 'wifi-off',
    bg: 'var(--sj-n-100)',
    fg: 'var(--text-2)'
  },
  done: {
    i: 'star',
    bg: 'var(--sj-amber-50)',
    fg: '#C98A12'
  }
};
function StateView({
  kind = 'empty',
  title,
  message,
  icon,
  illustrationSrc,
  action,
  lang
}) {
  if (kind === 'loading') {
    return /*#__PURE__*/React.createElement("div", {
      className: "sj-state",
      lang: lang,
      role: "status",
      "aria-live": "polite"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sj-dots",
      style: {
        padding: '24px 0 8px'
      }
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), title ? /*#__PURE__*/React.createElement("p", {
      className: "sj-state__title",
      style: {
        fontSize: 18
      }
    }, title) : null, message ? /*#__PURE__*/React.createElement("p", {
      className: "sj-state__msg"
    }, message) : null);
  }
  const k = K[kind] || K.empty;
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-state",
    lang: lang,
    role: kind === 'error' ? 'alert' : undefined
  }, illustrationSrc ? /*#__PURE__*/React.createElement("img", {
    src: illustrationSrc,
    alt: "",
    style: {
      width: 160,
      height: 'auto'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    className: "sj-state__art",
    style: {
      background: k.bg,
      color: k.fg
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || k.i,
    size: 44,
    strokeWidth: 1.75
  })), title ? /*#__PURE__*/React.createElement("h3", {
    className: "sj-state__title"
  }, title) : null, message ? /*#__PURE__*/React.createElement("p", {
    className: "sj-state__msg"
  }, message) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, action) : null);
}
Object.assign(__ds_scope, { StateView });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StateView.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const T = {
  success: {
    i: 'circle-check',
    bg: 'var(--sj-success-bg)',
    fg: 'var(--sj-success)'
  },
  info: {
    i: 'info',
    bg: 'var(--sj-info-bg)',
    fg: 'var(--sj-info)'
  },
  warning: {
    i: 'triangle-alert',
    bg: 'var(--sj-warning-bg)',
    fg: 'var(--sj-warning)'
  },
  error: {
    i: 'cloud-off',
    bg: 'var(--sj-danger-bg)',
    fg: 'var(--sj-danger)'
  }
};
function Toast({
  tone = 'success',
  title,
  message,
  actionLabel,
  onAction,
  onClose,
  closeLabel = 'Close',
  lang
}) {
  const t = T[tone] || T.info;
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-toast",
    role: tone === 'error' ? 'alert' : 'status',
    lang: lang
  }, /*#__PURE__*/React.createElement("span", {
    className: "sj-toast__ic",
    style: {
      background: t.bg,
      color: t.fg
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.i,
    size: 18,
    strokeWidth: 2.25
  })), /*#__PURE__*/React.createElement("div", {
    className: "sj-toast__body"
  }, title ? /*#__PURE__*/React.createElement("div", {
    className: "sj-toast__title"
  }, title) : null, message ? /*#__PURE__*/React.createElement("div", {
    className: "sj-toast__msg"
  }, message) : null, actionLabel ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sj-linkbtn",
    onClick: onAction
  }, actionLabel) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sj-iconbtn sj-iconbtn--sm",
    "aria-label": closeLabel,
    onClick: onClose,
    style: {
      marginTop: -6,
      marginRight: -4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 18
  })) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Modal.jsx
try { (() => {
function Modal({
  open = true,
  title,
  children,
  footer,
  onClose,
  closeLabel = 'Close',
  inline = false,
  icon,
  lang
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: 'sj-overlay' + (inline ? ' sj-overlay--inline' : ''),
    onClick: function (e) {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sj-modal",
    role: "dialog",
    "aria-modal": "true",
    lang: lang
  }, /*#__PURE__*/React.createElement("div", {
    className: "sj-modal__head"
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "sj-tile",
    style: {
      background: 'var(--sj-teal-50)',
      color: 'var(--sj-ink-teal)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 24
  })) : null, /*#__PURE__*/React.createElement("h2", {
    className: "sj-modal__title"
  }, title), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sj-iconbtn sj-iconbtn--sm",
    "aria-label": closeLabel,
    onClick: onClose
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 20
  })) : null), /*#__PURE__*/React.createElement("div", {
    className: "sj-modal__body"
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    className: "sj-modal__foot"
  }, footer) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Modal.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Sheet.jsx
try { (() => {
function Sheet({
  open = true,
  title,
  children,
  footer,
  onClose,
  closeLabel = 'Close',
  inline = false,
  lang
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: 'sj-overlay sj-overlay--sheet' + (inline ? ' sj-overlay--inline' : ''),
    onClick: function (e) {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sj-sheet",
    role: "dialog",
    "aria-modal": "true",
    lang: lang
  }, /*#__PURE__*/React.createElement("span", {
    className: "sj-sheet__handle"
  }), title ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "sj-modal__title",
    style: {
      padding: 0,
      fontSize: 20
    }
  }, title), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sj-iconbtn sj-iconbtn--sm",
    "aria-label": closeLabel,
    onClick: onClose
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 20
  })) : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      lineHeight: 1.7,
      color: 'var(--text-2)'
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Sheet.jsx", error: String((e && e.message) || e) }); }

// components/utils.js
try { (() => {
function cx() {
  return Array.prototype.slice.call(arguments).filter(Boolean).join(' ');
}
const BN = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBnDigits(v) {
  return String(v).replace(/[0-9]/g, function (d) {
    return BN[+d];
  });
}
function num(v, lang) {
  return lang === 'en' ? String(v) : toBnDigits(v);
}
Object.assign(__ds_scope, { cx, toBnDigits, num });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/utils.js", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className,
  lang
}) {
  const is = size === 'sm' ? 18 : size === 'lg' ? 22 : 20;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    lang: lang,
    className: __ds_scope.cx('sj-btn', 'sj-btn--' + variant, size !== 'md' && 'sj-btn--' + size, block && 'sj-btn--block', className),
    disabled: disabled || loading,
    onClick: onClick,
    "aria-busy": loading || undefined
  }, loading ? /*#__PURE__*/React.createElement("span", {
    className: "sj-spinner",
    "aria-hidden": "true"
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: is
  }) : null, /*#__PURE__*/React.createElement("span", null, children), iconRight && !loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: is
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled,
  className
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: __ds_scope.cx('sj-iconbtn', variant !== 'ghost' && 'sj-iconbtn--' + variant, size === 'sm' && 'sj-iconbtn--sm', className),
    "aria-label": label,
    title: label,
    onClick: onClick,
    disabled: disabled
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 20 : 22
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/cards/Card.jsx
try { (() => {
function Card({
  tone,
  interactive,
  onClick,
  padding,
  children,
  className,
  style,
  as
}) {
  const Tag = as || (onClick ? 'button' : 'div');
  return /*#__PURE__*/React.createElement(Tag, {
    type: Tag === 'button' ? 'button' : undefined,
    onClick: onClick,
    className: __ds_scope.cx('sj-card', tone && 'sj-card--' + tone, (interactive || onClick) && 'sj-card--interactive', className),
    style: Object.assign(padding != null ? {
      padding: padding
    } : {}, style || {})
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/cards/ChildCard.jsx
try { (() => {
function ChildCard({
  name,
  meta,
  avatarSrc,
  stats = [],
  badge,
  onClick,
  lang
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    onClick: onClick,
    className: "",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    },
    lang: lang
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: avatarSrc,
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "sj-h3"
  }, name), meta ? /*#__PURE__*/React.createElement("div", {
    className: "sj-meta"
  }, meta) : null), badge || null, onClick ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 22,
    color: "var(--text-3)"
  }) : null), stats.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + stats.length + ',minmax(0,1fr))',
      gap: 8
    }
  }, stats.map(function (s, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: 'var(--surface-sunken)',
        borderRadius: 12,
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: '700 20px/1.3 var(--font-display)',
        color: 'var(--sj-navy)'
      }
    }, s.value), /*#__PURE__*/React.createElement("div", {
      className: "sj-meta",
      style: {
        fontSize: 13
      }
    }, s.label));
  })) : null);
}
Object.assign(__ds_scope, { ChildCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ChildCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/SuggestionCard.jsx
try { (() => {
function SuggestionCard({
  eyebrow = 'AI suggestion',
  title,
  body,
  sources = [],
  status = 'pending',
  confirmedLabel = 'Saved',
  labels = {},
  onConfirm,
  onEdit,
  onDismiss,
  lang
}) {
  const L = Object.assign({
    confirm: 'Confirm',
    edit: 'Edit',
    dismiss: 'Dismiss'
  }, labels);
  const ok = status === 'confirmed';
  return /*#__PURE__*/React.createElement("div", {
    className: 'sj-suggest' + (ok ? ' sj-suggest--confirmed' : ''),
    lang: lang
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 10,
      background: ok ? 'var(--sj-leaf)' : '#fff',
      color: ok ? '#fff' : 'var(--sj-blue)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ok ? 'check' : 'sparkles',
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: ok ? 'var(--sj-ink-leaf)' : '#1373A3'
    }
  }, ok ? confirmedLabel : eyebrow)), title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 17,
      lineHeight: 1.55
    }
  }, title) : null, body ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: 'var(--text-2)'
    }
  }, body) : null, sources.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, sources.map(function (s, i) {
    return /*#__PURE__*/React.createElement(__ds_scope.SourceChip, {
      key: i,
      label: s.label || s,
      kind: s.kind
    });
  })) : null, !ok ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    icon: "check",
    onClick: onConfirm
  }, L.confirm), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "secondary",
    icon: "pencil",
    onClick: onEdit
  }, L.edit), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "ghost",
    onClick: onDismiss
  }, L.dismiss)) : null);
}
Object.assign(__ds_scope, { SuggestionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/SuggestionCard.jsx", error: String((e && e.message) || e) }); }

// components/choice/Chip.jsx
try { (() => {
function Chip({
  label,
  selected,
  onClick,
  icon,
  tone,
  onRemove,
  removeLabel = 'Remove',
  lang
}) {
  const isStatic = !onClick && selected === undefined;
  const cls = __ds_scope.cx('sj-chip', isStatic && 'sj-chip--static', tone && 'sj-chip--' + tone, selected && 'sj-chip--selected');
  const inner = [selected ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    key: "c",
    name: "check",
    size: 16,
    strokeWidth: 2.5
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    key: "i",
    name: icon,
    size: 16
  }) : null, /*#__PURE__*/React.createElement("span", {
    key: "l"
  }, label), onRemove ? /*#__PURE__*/React.createElement("span", {
    key: "x",
    role: "button",
    tabIndex: 0,
    "aria-label": removeLabel,
    className: "sj-chip__x",
    onClick: function (e) {
      e.stopPropagation();
      onRemove();
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 14
  })) : null];
  if (isStatic) return /*#__PURE__*/React.createElement("span", {
    className: cls,
    lang: lang
  }, inner);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    lang: lang,
    className: cls,
    "aria-pressed": selected === undefined ? undefined : !!selected,
    onClick: onClick
  }, inner);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/choice/Chip.jsx", error: String((e && e.message) || e) }); }

// components/cards/ActivityCard.jsx
try { (() => {
function ActivityCard({
  title,
  description,
  imageSrc,
  icon = 'camera',
  meta = [],
  status = 'todo',
  doneLabel,
  ctaLabel,
  onStart,
  lang
}) {
  const done = status === 'done';
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-card",
    style: {
      padding: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    lang: lang
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 132,
      background: imageSrc ? 'center/cover no-repeat url(' + imageSrc + ')' : 'var(--sj-gradient-sky)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }
  }, imageSrc ? null : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 20,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--sj-blue)',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 30
  })), done ? /*#__PURE__*/React.createElement("span", {
    className: "sj-role sj-role--specialist",
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-check",
    size: 15
  }), doneLabel || 'Done') : null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "sj-h3"
  }, title), description ? /*#__PURE__*/React.createElement("div", {
    className: "sj-meta",
    style: {
      fontSize: 15
    }
  }, description) : null, meta.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, meta.map(function (m, i) {
    return /*#__PURE__*/React.createElement(__ds_scope.Chip, {
      key: i,
      label: m.label,
      icon: m.icon,
      tone: "sky"
    });
  })) : null, ctaLabel ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: done ? 'secondary' : 'primary',
    icon: done ? 'rotate-ccw' : 'play',
    block: true,
    onClick: onStart
  }, ctaLabel)) : null));
}
Object.assign(__ds_scope, { ActivityCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ActivityCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/LogEntryCard.jsx
try { (() => {
function LogEntryCard({
  author,
  role = 'parent',
  roleLabel,
  time,
  title,
  body,
  tags = [],
  attachments,
  comments,
  avatarSrc,
  onClick,
  lang = 'bn'
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    onClick: onClick,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    },
    lang: lang
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: author,
    src: avatarSrc,
    size: 36
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 15
    }
  }, author), /*#__PURE__*/React.createElement(__ds_scope.RoleBadge, {
    role: role,
    label: roleLabel,
    lang: lang
  }), /*#__PURE__*/React.createElement("span", {
    className: "sj-meta",
    style: {
      marginLeft: 'auto',
      fontSize: 13
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    lang: lang
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 17,
      lineHeight: 1.55,
      marginBottom: 2
    }
  }, title) : null, body ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: 'var(--text-2)'
    }
  }, body) : null), tags.length || attachments || comments ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, tags.map(function (t, i) {
    return /*#__PURE__*/React.createElement(__ds_scope.Chip, {
      key: i,
      label: t.label || t,
      tone: t.tone || 'calm'
    });
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 14,
      color: 'var(--text-3)',
      fontSize: 14
    }
  }, attachments ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 4,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "paperclip",
    size: 16
  }), attachments) : null, comments ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 4,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "message-circle",
    size: 16
  }), comments) : null)) : null);
}
Object.assign(__ds_scope, { LogEntryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/LogEntryCard.jsx", error: String((e && e.message) || e) }); }

// components/choice/ChoiceCard.jsx
try { (() => {
function ChoiceCard({
  label,
  description,
  selected = false,
  multi = false,
  icon,
  onSelect,
  disabled,
  lang
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    lang: lang,
    role: multi ? 'checkbox' : 'radio',
    "aria-checked": selected,
    disabled: disabled,
    className: __ds_scope.cx('sj-choice', selected && 'sj-choice--selected'),
    onClick: onSelect
  }, /*#__PURE__*/React.createElement("span", {
    className: __ds_scope.cx('sj-choice__ind', multi && 'sj-choice__ind--multi')
  }, selected ? multi ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 16,
    strokeWidth: 3
  }) : /*#__PURE__*/React.createElement("span", {
    className: "sj-choice__dot"
  }) : null), /*#__PURE__*/React.createElement("span", {
    className: "sj-choice__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sj-choice__label"
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    className: "sj-choice__desc"
  }, description) : null), icon ? /*#__PURE__*/React.createElement("span", {
    className: "sj-choice__lead"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22
  })) : null);
}
Object.assign(__ds_scope, { ChoiceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/choice/ChoiceCard.jsx", error: String((e && e.message) || e) }); }

// components/data/ScoreGauge.jsx
try { (() => {
function pt(t, cx, cy, r) {
  return [cx - r * Math.cos(Math.PI * t), cy - r * Math.sin(Math.PI * t)];
}
function arc(a, b, cx, cy, r) {
  const p = pt(a, cx, cy, r),
    q = pt(b, cx, cy, r);
  return 'M' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + q[0].toFixed(2) + ' ' + q[1].toFixed(2);
}
function ScoreGauge({
  value = 0,
  max = 20,
  thresholds = [3, 8, 13],
  level,
  caption,
  maxLabel,
  lang = 'bn',
  width = 280,
  showBadge = true
}) {
  const lv = level || (value < thresholds[0] ? 'low' : value < thresholds[1] ? 'moderate' : value < thresholds[2] ? 'elevated' : 'high');
  const cx = 110,
    cy = 112,
    r = 88,
    g = 0.014;
  const stops = [0, thresholds[0] / max, thresholds[1] / max, thresholds[2] / max, 1];
  const t = Math.max(0, Math.min(1, value / max));
  const m = pt(t, cx, cy, r);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      width: width
    },
    lang: lang
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 220 128",
    width: width,
    height: width * 128 / 220,
    role: "img",
    "aria-label": (lang === 'en' ? 'Score ' : 'স্কোর ') + __ds_scope.num(value, lang) + ' / ' + __ds_scope.num(max, lang)
  }, __ds_scope.RISK_ORDER.map(function (k, i) {
    return /*#__PURE__*/React.createElement("path", {
      key: k,
      d: arc(stops[i] + (i ? g : 0), stops[i + 1] - (i < 3 ? g : 0), cx, cy, r),
      fill: "none",
      stroke: __ds_scope.RISK[k].c,
      strokeWidth: "18",
      strokeLinecap: "butt",
      opacity: k === lv ? 1 : 0.28
    });
  }), /*#__PURE__*/React.createElement("circle", {
    cx: m[0],
    cy: m[1],
    r: "13",
    fill: "#fff",
    stroke: "var(--sj-navy)",
    strokeWidth: "4"
  }), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy - 14,
    textAnchor: "middle",
    style: {
      font: '700 44px var(--font-display)',
      fill: 'var(--sj-navy)'
    }
  }, __ds_scope.num(value, lang)), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy + 8,
    textAnchor: "middle",
    style: {
      font: '500 14px var(--font-body)',
      fill: 'var(--text-3)'
    }
  }, maxLabel || '/ ' + __ds_scope.num(max, lang))), showBadge ? /*#__PURE__*/React.createElement(__ds_scope.RiskBadge, {
    level: lv,
    size: "lg",
    lang: lang
  }) : null, caption ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      lineHeight: 1.65,
      color: 'var(--text-2)',
      textAlign: 'center',
      maxWidth: width
    }
  }, caption) : null);
}
Object.assign(__ds_scope, { ScoreGauge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ScoreGauge.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
let _id = 0;
function TextField({
  label,
  hint,
  error,
  optionalLabel,
  value,
  defaultValue,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  type = 'text',
  icon,
  id,
  required,
  disabled,
  autoFocus,
  lang
}) {
  const ref = React.useRef(null);
  if (!ref.current) ref.current = id || 'sj-f-' + ++_id;
  const fid = ref.current;
  const common = {
    id: fid,
    className: 'sj-field__input',
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    required: required,
    disabled: disabled,
    autoFocus: autoFocus,
    'aria-invalid': !!error || undefined,
    'aria-describedby': hint || error ? fid + '-d' : undefined,
    onChange: onChange ? function (e) {
      onChange(e.target.value, e);
    } : undefined
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-field",
    lang: lang
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    className: "sj-field__label"
  }, label, optionalLabel ? /*#__PURE__*/React.createElement("span", {
    className: "sj-field__opt"
  }, optionalLabel) : null) : null, /*#__PURE__*/React.createElement("div", {
    className: __ds_scope.cx('sj-field__control', multiline && 'sj-field__control--multi', error && 'sj-field__control--error')
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  }) : null, multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows
  }, common)) : /*#__PURE__*/React.createElement("input", _extends({
    type: type
  }, common))), error ? /*#__PURE__*/React.createElement("div", {
    id: fid + '-d',
    className: "sj-field__error"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-alert",
    size: 16
  }), error) : hint ? /*#__PURE__*/React.createElement("div", {
    id: fid + '-d',
    className: "sj-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/choice/ChoiceGroup.jsx
try { (() => {
function ChoiceGroup({
  options = [],
  multi = false,
  value,
  onChange,
  other,
  otherValue,
  onOtherChange,
  ariaLabel,
  lang
}) {
  const [inner, setInner] = React.useState(multi ? [] : null);
  const [otherText, setOtherText] = React.useState('');
  const val = value !== undefined ? value : inner;
  const ot = otherValue !== undefined ? otherValue : otherText;
  const isOn = function (v) {
    return multi ? (val || []).indexOf(v) >= 0 : val === v;
  };
  const pick = function (v) {
    let next;
    if (multi) {
      const a = (val || []).slice();
      const i = a.indexOf(v);
      if (i >= 0) a.splice(i, 1);else a.push(v);
      next = a;
    } else next = v;
    if (value === undefined) setInner(next);
    onChange && onChange(next);
  };
  const OTHER = '__other__';
  const otherOn = other && isOn(OTHER);
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-choicegroup",
    role: multi ? 'group' : 'radiogroup',
    "aria-label": ariaLabel,
    lang: lang
  }, options.map(function (o) {
    return /*#__PURE__*/React.createElement(__ds_scope.ChoiceCard, {
      key: o.value,
      label: o.label,
      description: o.description,
      icon: o.icon,
      multi: multi,
      selected: isOn(o.value),
      onSelect: function () {
        pick(o.value);
      }
    });
  }), other ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.ChoiceCard, {
    label: other.label,
    description: other.description,
    icon: other.icon || 'pencil-line',
    multi: multi,
    selected: otherOn,
    onSelect: function () {
      pick(OTHER);
    }
  }), otherOn ? /*#__PURE__*/React.createElement("div", {
    className: "sj-choicegroup__other"
  }, /*#__PURE__*/React.createElement(__ds_scope.TextField, {
    multiline: true,
    rows: 2,
    autoFocus: true,
    label: other.fieldLabel,
    placeholder: other.placeholder,
    value: ot,
    onChange: function (t) {
      if (otherValue === undefined) setOtherText(t);
      onOtherChange && onOtherChange(t);
    }
  })) : null) : null);
}
Object.assign(__ds_scope, { ChoiceGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/choice/ChoiceGroup.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function BottomNav({
  items = [],
  value,
  onChange,
  lang
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "sj-bnav",
    lang: lang
  }, items.map(function (it) {
    const on = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      className: __ds_scope.cx('sj-bnav__item', on && 'sj-bnav__item--on'),
      "aria-current": on ? 'page' : undefined,
      onClick: function () {
        onChange && onChange(it.id);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sj-bnav__pill"
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 24,
      strokeWidth: on ? 2.25 : 2
    })), /*#__PURE__*/React.createElement("span", null, it.label));
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/LanguageToggle.jsx
try { (() => {
function LanguageToggle({
  value = 'bn',
  onChange,
  label = 'ভাষা / Language'
}) {
  const opts = [{
    v: 'bn',
    t: 'বাংলা'
  }, {
    v: 'en',
    t: 'EN'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-lang",
    role: "radiogroup",
    "aria-label": label
  }, opts.map(function (o) {
    return /*#__PURE__*/React.createElement("button", {
      key: o.v,
      type: "button",
      role: "radio",
      "aria-checked": value === o.v,
      lang: o.v,
      className: __ds_scope.cx('sj-lang__opt', 'sj-lang__opt--' + o.v, value === o.v && 'sj-lang__opt--on'),
      onClick: function () {
        onChange && onChange(o.v);
      }
    }, o.t);
  }));
}
Object.assign(__ds_scope, { LanguageToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/LanguageToggle.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function Sidebar({
  items = [],
  value,
  onChange,
  header,
  footer,
  lang
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "sj-side",
    lang: lang
  }, header ? /*#__PURE__*/React.createElement("div", {
    className: "sj-side__head"
  }, header) : null, /*#__PURE__*/React.createElement("nav", {
    className: "sj-side__nav"
  }, items.map(function (it, i) {
    if (it.section) return /*#__PURE__*/React.createElement("div", {
      key: 's' + i,
      className: "sj-side__section"
    }, it.section);
    const on = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      className: __ds_scope.cx('sj-side__item', on && 'sj-side__item--on'),
      "aria-current": on ? 'page' : undefined,
      onClick: function () {
        onChange && onChange(it.id);
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 22
    }), /*#__PURE__*/React.createElement("span", null, it.label), it.badge != null ? /*#__PURE__*/React.createElement("span", {
      className: "sj-side__badge"
    }, it.badge) : null);
  })), footer ? /*#__PURE__*/React.createElement("div", null, footer) : null);
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Stepper.jsx
try { (() => {
function Stepper({
  steps = [],
  total,
  current = 0,
  variant = 'segments',
  countLabel,
  caption,
  lang = 'bn'
}) {
  const n = total || steps.length;
  const cnt = countLabel || (lang === 'en' ? 'Step ' + (current + 1) + ' of ' + n : 'ধাপ ' + __ds_scope.num(current + 1, 'bn') + ' / ' + __ds_scope.num(n, 'bn'));
  if (variant === 'labeled') {
    return /*#__PURE__*/React.createElement("ol", {
      className: "sj-stepper__row",
      lang: lang,
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0
      }
    }, steps.map(function (s, i) {
      const st = i < current ? 'done' : i === current ? 'cur' : 'todo';
      return /*#__PURE__*/React.createElement("li", {
        key: i,
        className: __ds_scope.cx('sj-stepper__step', 'sj-stepper__step--' + st),
        "aria-current": st === 'cur' ? 'step' : undefined
      }, /*#__PURE__*/React.createElement("span", {
        className: "sj-stepper__node"
      }, st === 'done' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "check",
        size: 18,
        strokeWidth: 3
      }) : __ds_scope.num(i + 1, lang)), /*#__PURE__*/React.createElement("span", null, s));
    }));
  }
  const segs = [];
  for (let i = 0; i < n; i++) segs.push(/*#__PURE__*/React.createElement("span", {
    key: i,
    className: __ds_scope.cx('sj-stepper__seg', i < current && 'sj-stepper__seg--done', i === current && 'sj-stepper__seg--cur')
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "sj-stepper",
    lang: lang,
    role: "progressbar",
    "aria-valuemin": 1,
    "aria-valuemax": n,
    "aria-valuenow": current + 1,
    "aria-valuetext": cnt
  }, /*#__PURE__*/React.createElement("div", {
    className: "sj-stepper__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sj-stepper__count"
  }, cnt), /*#__PURE__*/React.createElement("span", null, caption || steps[current] || '')), /*#__PURE__*/React.createElement("div", {
    className: "sj-stepper__bar"
  }, segs));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items = [],
  value,
  onChange,
  variant = 'line',
  lang
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: __ds_scope.cx('sj-tabs', variant === 'pill' && 'sj-tabs--pill'),
    role: "tablist",
    lang: lang
  }, items.map(function (t) {
    const on = t.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      role: "tab",
      "aria-selected": on,
      className: __ds_scope.cx('sj-tab', on && 'sj-tab--on'),
      onClick: function () {
        onChange && onChange(t.id);
      }
    }, t.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon,
      size: 18
    }) : null, /*#__PURE__*/React.createElement("span", null, t.label), t.count != null ? /*#__PURE__*/React.createElement("span", {
      className: "sj-tab__count"
    }, t.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/companion/AppShell.jsx
try { (() => {
(() => {
  const {
    Sidebar,
    LanguageToggle,
    IconButton,
    Avatar,
    Icon
  } = window.ShohojatriDesignSystem_1ff839;
  function AppShell({
    lang,
    setLang,
    page,
    setPage,
    children
  }) {
    const d = SJ_DATA[lang];
    return /*#__PURE__*/React.createElement("div", {
      lang: lang,
      style: {
        display: 'flex',
        height: '100%',
        background: 'var(--surface-page)'
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      lang: lang,
      value: page,
      onChange: setPage,
      header: /*#__PURE__*/React.createElement("img", {
        src: "../../assets/logo/shohojatri-wordmark.png",
        alt: "\u09B8\u09B9\u09AF\u09BE\u09A4\u09CD\u09B0\u09C0",
        style: {
          height: 42,
          display: 'block'
        }
      }),
      items: [d.nav[0], {
        section: d.children
      }, ...d.nav.slice(1)],
      footer: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 8px 0',
          borderTop: '1px solid var(--border-1)'
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: lang === 'bn' ? 'ফারহানা' : 'Farhana',
        size: 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          fontSize: 15
        }
      }, lang === 'bn' ? 'ফারহানা রহমান' : 'Farhana Rahman'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          color: 'var(--text-3)'
        }
      }, lang === 'bn' ? 'অভিভাবক' : 'Parent')))
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("header", {
      style: {
        flex: 'none',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 32px',
        borderBottom: '1px solid var(--border-1)',
        background: 'rgba(250,251,248,.9)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 12px 6px 6px',
        borderRadius: 999,
        background: '#fff',
        border: '1px solid var(--border-1)'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: d.child,
      size: 32
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600
      }
    }, d.child), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 18,
      color: "var(--text-3)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(LanguageToggle, {
      value: lang,
      onChange: setLang
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "bell",
      label: lang === 'bn' ? 'রিমাইন্ডার' : 'Reminders'
    })), /*#__PURE__*/React.createElement("main", {
      style: {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto'
      }
    }, children)));
  }
  window.AppShell = AppShell;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/companion/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/companion/ChatScreen.jsx
try { (() => {
(() => {
  const {
    ChatBubble,
    Chip,
    IconButton,
    StateView
  } = window.ShohojatriDesignSystem_1ff839;
  const CT = {
    bn: {
      title: 'সহায়তা',
      sub: 'আয়ানের লগ আর বিশ্বস্ত গাইড থেকে উত্তর দেয়। জরুরি প্রয়োজনে ডাক্তারের সাথে কথা বলুন।',
      src: 'সূত্র',
      ph: 'আপনার প্রশ্ন লিখুন…',
      quick: ['ঘুমের রুটিন', 'খাবারে বাছবিচার', 'থেরাপির প্রস্তুতি'],
      m: [['user', 'ও রাতে কিছুতেই ঘুমাতে চায় না, কী করতে পারি?', '১০:৪২'], ['assistant', 'গত ৭ দিনের লগ দেখে মনে হচ্ছে স্ক্রিন বন্ধের পরপরই আয়ানকে ঘুমাতে পাঠানো হচ্ছে। ঘুমের ৩০ মিনিট আগে একটা শান্ত, একই রকম রুটিন — গোসল, হালকা আলো, একটা ছবির বই — চেষ্টা করে দেখতে পারেন। রবিবার গোসলের পর সে শান্ত ছিল, সেটা ভালো লক্ষণ।', '১০:৪৩', [{
        label: 'ঘুমের লগ (৭ দিন)',
        kind: 'log'
      }, {
        label: 'ঘুমের রুটিন গাইড',
        kind: 'guide'
      }]]],
      reply: 'ভালো প্রশ্ন। আমি রুমানা আপার সর্বশেষ লগ আর থেরাপি নোট দেখে একটা ছোট সারাংশ তৈরি করছি — শেয়ার করার আগে আপনি দেখে নিতে পারবেন।',
      think: 'ভাবছি…'
    },
    en: {
      title: 'Assistant',
      sub: "Answers from Ayaan's logs and trusted guides. For anything urgent, talk to a doctor.",
      src: 'Sources',
      ph: 'Type your question…',
      quick: ['Sleep routine', 'Picky eating', 'Preparing for therapy'],
      m: [['user', "He just won't sleep at night — what can I do?", '10:42'], ['assistant', "Looking at the last 7 days of logs, Ayaan is going to bed right after screens go off. Try a calm, consistent routine 30 minutes before sleep — bath, dim light, one picture book. He was calmer after Sunday's bath, which is a good sign.", '10:43', [{
        label: 'Sleep logs (7 days)',
        kind: 'log'
      }, {
        label: 'Bedtime routine guide',
        kind: 'guide'
      }]]],
      reply: "Good question. I'm putting together a short summary from Rumana's latest logs and the therapy notes — you can review it before sharing.",
      think: 'Thinking…'
    }
  };
  function ChatScreen({
    lang
  }) {
    const t = CT[lang];
    const [msgs, setMsgs] = React.useState([]);
    const [v, setV] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    React.useEffect(() => {
      setMsgs([]);
    }, [lang]);
    const all = [...t.m, ...msgs];
    const send = txt => {
      const s = (txt || v).trim();
      if (!s) return;
      setMsgs(m => [...m, ['user', s, '']]);
      setV('');
      setBusy(true);
      setTimeout(() => {
        setMsgs(m => [...m, ['assistant', t.reply, '', [{
          label: lang === 'bn' ? 'রুমানার লগ' : "Rumana's logs",
          kind: 'log'
        }]]]);
        setBusy(false);
      }, 1400);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 820,
        margin: '0 auto',
        padding: '24px 32px 24px'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        font: '700 28px/1.4 var(--font-display)',
        margin: 0
      }
    }, t.title), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '2px 0 16px',
        color: 'var(--text-2)',
        fontSize: 15
      }
    }, t.sub), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '8px 2px'
      }
    }, all.map((m, i) => /*#__PURE__*/React.createElement(ChatBubble, {
      key: i,
      lang: lang,
      from: m[0],
      time: m[2],
      sources: m[3] || [],
      sourcesLabel: m[3] ? t.src : undefined,
      avatarSrc: "../../assets/logo/shohojatri-mark.png"
    }, m[1])), busy ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 46,
        color: 'var(--text-3)',
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sj-dots",
      style: {
        transform: 'scale(.7)'
      }
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), t.think) : null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        margin: '12px 0'
      }
    }, t.quick.map(q => /*#__PURE__*/React.createElement(Chip, {
      key: q,
      label: q,
      icon: "sparkles",
      onClick: () => send(q)
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        border: '1.5px solid var(--border-2)',
        borderRadius: 28,
        padding: '6px 6px 6px 20px',
        boxShadow: 'var(--shadow-sm)'
      }
    }, /*#__PURE__*/React.createElement("input", {
      value: v,
      onChange: e => setV(e.target.value),
      onKeyDown: e => e.key === 'Enter' && send(),
      placeholder: t.ph,
      style: {
        flex: 1,
        border: 0,
        outline: 0,
        font: '400 16px/1.6 var(--font-body)',
        background: 'transparent',
        color: 'var(--text-1)'
      }
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "mic",
      label: "Voice",
      size: "sm"
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "send-horizontal",
      label: "Send",
      variant: "solid",
      onClick: () => send()
    })));
  }
  window.ChatScreen = ChatScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/companion/ChatScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/companion/OverviewScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(() => {
  const {
    ChildCard,
    LogEntryCard,
    ReminderCard,
    SuggestionCard,
    Tabs,
    Button,
    Modal,
    TextField,
    Chip,
    Toast,
    Card,
    StateView
  } = window.ShohojatriDesignSystem_1ff839;
  const OT = {
    bn: {
      log: 'শেয়ার করা লগ',
      add: 'লগ লিখুন',
      tabs: [['all', 'সব'], ['parent', 'অভিভাবক'], ['teacher', 'শিক্ষক'], ['specialist', 'বিশেষজ্ঞ']],
      stats: [['১২', 'এই সপ্তাহের লগ'], ['৩', 'চলমান লক্ষ্য'], ['২', 'টিম সদস্য']],
      rem: 'আসন্ন',
      r: [['therapy', 'স্পিচ থেরাপি — ডা. নাসরিন', 'আগামীকাল, বিকাল ৪টা'], ['appointment', 'স্কুলে অভিভাবক সভা', 'বৃহস্পতি, সকাল ১০টা']],
      sg: {
        eyebrow: 'এআই পরামর্শ — যাচাই করুন',
        confirmed: 'লক্ষ্য হিসেবে যোগ হয়েছে',
        title: 'নতুন লক্ষ্য: দুই শব্দের বাক্য',
        body: 'গত ২ সপ্তাহে ৬ বার একক শব্দে কিছু চাওয়া লগ হয়েছে। "আরও পানি"-র মতো দুই শব্দ চেষ্টা করা যেতে পারে।',
        src: [{
          label: '৬টি লগ',
          kind: 'log'
        }, {
          label: 'থেরাপি নোট',
          kind: 'report'
        }],
        labels: {
          confirm: 'নিশ্চিত করুন',
          edit: 'সম্পাদনা',
          dismiss: 'বাদ দিন'
        }
      },
      mT: 'নতুন লগ',
      mL: 'কী দেখলেন?',
      mP: 'আজকের একটা ছোট মুহূর্ত…',
      mTag: 'বিষয়',
      tags: ['ভাষা', 'খেলা', 'ঘুম', 'খাবার', 'আচরণ'],
      save: 'সেভ করুন',
      cancel: 'বাতিল',
      toastT: 'লগ সেভ হয়েছে',
      toastM: 'রুমানা আপা ও ডা. নাসরিন দেখতে পাবেন।',
      undo: 'ফিরিয়ে নিন',
      me: 'ফারহানা',
      now: 'এইমাত্র',
      emptyT: 'এই বিভাগে কোনো লগ নেই',
      emptyM: 'অন্য কেউ লিখলে এখানে দেখা যাবে।'
    },
    en: {
      log: 'Shared log',
      add: 'Write a log',
      tabs: [['all', 'All'], ['parent', 'Parent'], ['teacher', 'Teacher'], ['specialist', 'Specialist']],
      stats: [['12', 'Logs this week'], ['3', 'Active goals'], ['2', 'Team members']],
      rem: 'Coming up',
      r: [['therapy', 'Speech therapy — Dr. Nasrin', 'Tomorrow, 4:00 pm'], ['appointment', 'Parent meeting at school', 'Thu, 10:00 am']],
      sg: {
        eyebrow: 'AI suggestion — please review',
        confirmed: 'Added as a goal',
        title: 'New goal: two-word phrases',
        body: '6 single-word requests were logged in the past 2 weeks. Trying two words like "more water" could be next.',
        src: [{
          label: '6 logs',
          kind: 'log'
        }, {
          label: 'Therapy note',
          kind: 'report'
        }],
        labels: {
          confirm: 'Confirm',
          edit: 'Edit',
          dismiss: 'Dismiss'
        }
      },
      mT: 'New log',
      mL: 'What did you notice?',
      mP: 'A small moment from today…',
      mTag: 'Topic',
      tags: ['Speech', 'Play', 'Sleep', 'Food', 'Behaviour'],
      save: 'Save',
      cancel: 'Cancel',
      toastT: 'Log saved',
      toastM: 'Rumana and Dr. Nasrin can see it.',
      undo: 'Undo',
      me: 'Farhana',
      now: 'Just now',
      emptyT: 'No logs here yet',
      emptyM: "When someone writes one, it'll appear here."
    }
  };
  function OverviewScreen({
    lang,
    go
  }) {
    const t = OT[lang],
      d = SJ_DATA[lang];
    const [tab, setTab] = React.useState('all');
    const [extra, setExtra] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [txt, setTxt] = React.useState('');
    const [tags, setTags] = React.useState([]);
    const [toast, setToast] = React.useState(false);
    const [done, setDone] = React.useState({});
    const [sg, setSg] = React.useState('pending');
    const logs = [...extra, ...d.logs].filter(l => tab === 'all' || l.role === tab);
    const save = () => {
      setExtra([{
        author: t.me,
        role: 'parent',
        time: t.now,
        body: txt || t.mP,
        tags: tags.map(x => ({
          label: x,
          tone: 'calm'
        }))
      }, ...extra]);
      setOpen(false);
      setTxt('');
      setTags([]);
      setToast(true);
      setTimeout(() => setToast(false), 5000);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '28px 32px 48px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 360px',
        gap: 28,
        maxWidth: 1120,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("section", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--sj-ink-teal)',
        fontWeight: 600,
        fontSize: 15
      }
    }, d.hi), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: '700 30px/1.4 var(--font-display)',
        margin: 0
      }
    }, t.log)), /*#__PURE__*/React.createElement(Button, {
      icon: "plus",
      onClick: () => setOpen(true)
    }, t.add)), /*#__PURE__*/React.createElement(Tabs, {
      lang: lang,
      value: tab,
      onChange: setTab,
      items: t.tabs.map(([id, label]) => ({
        id,
        label
      }))
    }), logs.length ? logs.map((l, i) => /*#__PURE__*/React.createElement(LogEntryCard, _extends({
      key: tab + i,
      lang: lang
    }, l))) : /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(StateView, {
      lang: lang,
      kind: "empty",
      icon: "notebook-pen",
      title: t.emptyT,
      message: t.emptyM
    }))), /*#__PURE__*/React.createElement("aside", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(ChildCard, {
      lang: lang,
      name: d.child,
      meta: d.childMeta,
      stats: t.stats.map(([value, label]) => ({
        value,
        label
      }))
    }), sg !== 'dismissed' ? /*#__PURE__*/React.createElement(SuggestionCard, {
      lang: lang,
      status: sg,
      eyebrow: t.sg.eyebrow,
      confirmedLabel: t.sg.confirmed,
      title: t.sg.title,
      body: t.sg.body,
      sources: t.sg.src,
      labels: t.sg.labels,
      onConfirm: () => setSg('confirmed'),
      onDismiss: () => setSg('dismissed'),
      onEdit: () => go('chat')
    }) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        marginTop: 4
      }
    }, t.rem), t.r.map(([k, ti, tm], i) => /*#__PURE__*/React.createElement(ReminderCard, {
      key: i,
      lang: lang,
      kind: k,
      title: ti,
      time: tm,
      done: !!done[i],
      onToggle: () => setDone({
        ...done,
        [i]: !done[i]
      })
    }))), open ? /*#__PURE__*/React.createElement(Modal, {
      lang: lang,
      icon: "notebook-pen",
      title: t.mT,
      onClose: () => setOpen(false),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => setOpen(false)
      }, t.cancel), /*#__PURE__*/React.createElement(Button, {
        icon: "check",
        onClick: save
      }, t.save))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(TextField, {
      lang: lang,
      label: t.mL,
      multiline: true,
      rows: 3,
      placeholder: t.mP,
      value: txt,
      onChange: setTxt,
      autoFocus: true
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "sj-field__label",
      style: {
        marginBottom: 8
      }
    }, t.mTag), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, t.tags.map(x => /*#__PURE__*/React.createElement(Chip, {
      key: x,
      label: x,
      selected: tags.includes(x),
      onClick: () => setTags(tags.includes(x) ? tags.filter(y => y !== x) : [...tags, x])
    })))))) : null, toast ? /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        right: 32,
        bottom: 32,
        zIndex: 200,
        width: 400
      }
    }, /*#__PURE__*/React.createElement(Toast, {
      lang: lang,
      tone: "success",
      title: t.toastT,
      message: t.toastM,
      actionLabel: t.undo,
      onAction: () => {
        setExtra(extra.slice(1));
        setToast(false);
      },
      onClose: () => setToast(false)
    })) : null);
  }
  window.OverviewScreen = OverviewScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/companion/OverviewScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/companion/ReportsScreen.jsx
try { (() => {
(() => {
  const {
    StateView,
    Button,
    Card,
    ScoreGauge,
    RiskBadge,
    Icon
  } = window.ShohojatriDesignSystem_1ff839;
  function ReportsScreen({
    lang,
    page
  }) {
    if (page === 'team') {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '28px 32px',
          maxWidth: 1120
        }
      }, /*#__PURE__*/React.createElement("h1", {
        style: {
          font: '700 30px/1.4 var(--font-display)',
          margin: '0 0 16px'
        }
      }, lang === 'bn' ? 'টিম' : 'Team'), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(StateView, {
        lang: lang,
        kind: "empty",
        icon: "users-round",
        title: lang === 'bn' ? 'আয়ানের টিমে আর কাউকে যোগ করুন' : "Invite more people to Ayaan's team",
        message: lang === 'bn' ? 'শিক্ষক বা থেরাপিস্ট যোগ হলে সবাই একই লগ দেখতে ও লিখতে পারবেন।' : 'When a teacher or therapist joins, everyone sees and writes the same log.',
        action: /*#__PURE__*/React.createElement(Button, {
          icon: "user-plus"
        }, lang === 'bn' ? 'আমন্ত্রণ পাঠান' : 'Send invite')
      })));
    }
    const rows = lang === 'bn' ? [['অক্টোবর ২০২৬', 'moderate', 9], ['জুলাই ২০২৬', 'elevated', 11]] : [['October 2026', 'moderate', 9], ['July 2026', 'elevated', 11]];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '28px 32px',
        maxWidth: 1120
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        font: '700 30px/1.4 var(--font-display)',
        margin: '0 0 16px'
      }
    }, lang === 'bn' ? 'স্ক্রিনিং রিপোর্ট' : 'Screening reports'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '340px minmax(0,1fr)',
        gap: 20,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement(Card, {
      style: {
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(ScoreGauge, {
      lang: lang,
      value: 9,
      max: 20,
      width: 280,
      caption: lang === 'bn' ? 'জুলাইয়ের তুলনায় ২ পয়েন্ট কম — অগ্রগতি হচ্ছে।' : '2 points lower than July — progress.'
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 6
    }, rows.map(([d, l, s], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderTop: i ? '1px solid var(--border-1)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sj-tile",
      style: {
        background: 'var(--sj-navy-50)',
        color: 'var(--sj-navy)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clipboard-list",
      size: 22
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontWeight: 600
      }
    }, d), /*#__PURE__*/React.createElement(RiskBadge, {
      lang: lang,
      level: l
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: "arrow-right"
    }, lang === 'bn' ? 'দেখুন' : 'View'))))));
  }
  window.ReportsScreen = ReportsScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/companion/ReportsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/companion/data.jsx
try { (() => {
(() => {
  const D = {
    bn: {
      nav: [{
        id: 'home',
        label: 'সারসংক্ষেপ',
        icon: 'house'
      }, {
        id: 'chat',
        label: 'সহায়তা',
        icon: 'message-circle-heart'
      }, {
        id: 'reports',
        label: 'রিপোর্ট',
        icon: 'clipboard-list'
      }, {
        id: 'team',
        label: 'টিম',
        icon: 'users-round',
        badge: '১'
      }],
      children: 'শিশু',
      child: 'আয়ান রহমান',
      childMeta: '৪ বছর ২ মাস · মিরপুর, ঢাকা',
      hi: 'শুভ সকাল, ফারহানা',
      logs: [{
        author: 'রুমানা আক্তার',
        role: 'teacher',
        time: 'আজ, ১১:২০',
        title: "নিজে থেকে 'পানি' বলেছে",
        body: 'টিফিনের সময় ইশারা ছাড়াই চাইল। ক্লাসের সবাই হাততালি দিয়েছে!',
        tags: ['ভাষা', {
          label: 'প্রথমবার',
          tone: 'warm'
        }],
        comments: '২'
      }, {
        author: 'ডা. নাসরিন হক',
        role: 'specialist',
        time: 'সোম, বিকাল ৪:১০',
        title: 'যৌথ মনোযোগ বাড়ছে',
        body: 'ছবির বইয়ে আমার আঙুল অনুসরণ করেছে ৫ বারে ৪ বার।',
        tags: [{
          label: 'থেরাপি',
          tone: 'sky'
        }],
        attachments: '১'
      }, {
        author: 'ফারহানা',
        role: 'parent',
        time: 'রবি, রাত ৯:০০',
        title: 'ঘুমাতে দেরি',
        body: 'আজও সাড়ে এগারোটার আগে ঘুমায়নি। গোসলের পর একটু শান্ত ছিল।',
        tags: [{
          label: 'ঘুম',
          tone: 'calm'
        }]
      }]
    },
    en: {
      nav: [{
        id: 'home',
        label: 'Overview',
        icon: 'house'
      }, {
        id: 'chat',
        label: 'Assistant',
        icon: 'message-circle-heart'
      }, {
        id: 'reports',
        label: 'Reports',
        icon: 'clipboard-list'
      }, {
        id: 'team',
        label: 'Team',
        icon: 'users-round',
        badge: '1'
      }],
      children: 'Children',
      child: 'Ayaan Rahman',
      childMeta: '4 yrs 2 mo · Mirpur, Dhaka',
      hi: 'Good morning, Farhana',
      logs: [{
        author: 'Rumana Akter',
        role: 'teacher',
        time: 'Today, 11:20',
        title: "Said 'water' on his own",
        body: 'Asked at tiffin time without pointing. The whole class clapped!',
        tags: ['Speech', {
          label: 'First time',
          tone: 'warm'
        }],
        comments: '2'
      }, {
        author: 'Dr. Nasrin Haque',
        role: 'specialist',
        time: 'Mon, 4:10 pm',
        title: 'Joint attention improving',
        body: 'Followed my point in the picture book 4 of 5 times.',
        tags: [{
          label: 'Therapy',
          tone: 'sky'
        }],
        attachments: '1'
      }, {
        author: 'Farhana',
        role: 'parent',
        time: 'Sun, 9:00 pm',
        title: 'Late to sleep',
        body: 'Again not asleep before 11:30. Calmer after a bath.',
        tags: [{
          label: 'Sleep',
          tone: 'calm'
        }]
      }]
    }
  };
  window.SJ_DATA = D;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/companion/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/screening/ActivityScreen.jsx
try { (() => {
(() => {
  const {
    Stepper,
    ActivityCard,
    Button,
    Icon,
    Toast,
    Sheet
  } = window.ShohojatriDesignSystem_1ff839;
  const AT = {
    bn: {
      sec: 'ক্যামেরা খেলা',
      title: 'নাম ধরে ডাকুন',
      tip: 'আয়ান খেলায় ব্যস্ত থাকলে, পেছন থেকে স্বাভাবিক স্বরে একবার নাম ধরে ডাকুন। ফোনটা এমনভাবে ধরুন যেন ওর মুখ দেখা যায়।',
      rec: 'রেকর্ড শুরু',
      stop: 'থামান',
      frame: 'আয়ানের মুখ এই ফ্রেমে রাখুন',
      saved: 'ভিডিও সংরক্ষিত হয়েছে',
      savedM: 'শুধু আপনি আর আপনার বেছে নেওয়া বিশেষজ্ঞ দেখতে পাবেন।',
      nextT: 'পরের খেলা',
      list: 'বাকি খেলা',
      done: 'সম্পন্ন',
      see: 'রিপোর্ট দেখুন',
      a2: 'বল গড়িয়ে দিন',
      a2d: 'বল গড়িয়ে দিয়ে দেখুন সে ফেরত দেয় কিনা।',
      min: '২ মিনিট',
      cam: 'ক্যামেরা',
      start: 'শুরু করুন'
    },
    en: {
      sec: 'Camera play',
      title: 'Call his name',
      tip: "While Ayaan is busy playing, call his name once from behind in a normal voice. Hold the phone so his face is visible.",
      rec: 'Start recording',
      stop: 'Stop',
      frame: "Keep Ayaan's face in this frame",
      saved: 'Video saved',
      savedM: 'Only you and the specialist you choose can see it.',
      nextT: 'Next activity',
      list: 'Remaining activities',
      done: 'Done',
      see: 'See report',
      a2: 'Roll the ball',
      a2d: 'Roll a ball and see if he rolls it back.',
      min: '2 min',
      cam: 'Camera',
      start: 'Start'
    }
  };
  function ActivityScreen({
    lang,
    go
  }) {
    const t = AT[lang];
    const [st, setSt] = React.useState('idle');
    const [sec, setSec] = React.useState(0);
    React.useEffect(() => {
      if (st !== 'rec') return;
      const id = setInterval(() => setSec(s => s + 1), 1000);
      return () => clearInterval(id);
    }, [st]);
    const mm = '0:' + String(sec).padStart(2, '0');
    return /*#__PURE__*/React.createElement(ScreenBody, {
      footer: st === 'saved' ? /*#__PURE__*/React.createElement(Button, {
        size: "lg",
        block: true,
        iconRight: "arrow-right",
        onClick: () => go('report')
      }, t.see) : /*#__PURE__*/React.createElement(Button, {
        size: "lg",
        block: true,
        icon: st === 'rec' ? 'square' : 'circle',
        variant: st === 'rec' ? 'secondary' : 'primary',
        onClick: () => {
          if (st === 'rec') setSt('saved');else {
            setSec(0);
            setSt('rec');
          }
        }
      }, st === 'rec' ? t.stop + ' · ' + mm : t.rec)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Stepper, {
      lang: lang,
      total: 8,
      current: 5,
      caption: t.sec
    })), /*#__PURE__*/React.createElement("h2", {
      style: {
        font: '700 22px/1.5 var(--font-display)',
        margin: '0 0 6px'
      }
    }, t.title), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 14px',
        fontSize: 15,
        color: 'var(--text-2)'
      }
    }, t.tip), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 250,
        borderRadius: 24,
        background: 'linear-gradient(160deg,#1B2F44,#0F2236)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,.75)',
        marginBottom: 16,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: '34px 70px',
        border: '2.5px dashed rgba(140,200,138,.8)',
        borderRadius: '50%'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        textAlign: 'center',
        padding: '0 90px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "scan-face",
      size: 32
    }), t.frame), st === 'rec' ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 14,
        left: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(0,0,0,.45)',
        color: '#fff',
        borderRadius: 999,
        padding: '4px 12px',
        fontSize: 14,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#F8B442'
      }
    }), mm) : null), st === 'saved' ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement(Toast, {
      lang: lang,
      tone: "success",
      title: t.saved,
      message: t.savedM
    })) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        margin: '4px 0 10px'
      }
    }, t.list), /*#__PURE__*/React.createElement(ActivityCard, {
      lang: lang,
      title: t.a2,
      description: t.a2d,
      icon: "circle-dot",
      meta: [{
        label: t.min,
        icon: 'clock'
      }, {
        label: t.cam,
        icon: 'video'
      }],
      ctaLabel: t.start
    }));
  }
  window.ActivityScreen = ActivityScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/screening/ActivityScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/screening/QuestionScreen.jsx
try { (() => {
(() => {
  const {
    Stepper,
    ChoiceGroup,
    Button,
    IconButton,
    Modal
  } = window.ShohojatriDesignSystem_1ff839;
  const QS = {
    bn: {
      sec: 'যোগাযোগ',
      back: 'আগের',
      next: 'পরের প্রশ্ন',
      pause: 'থামুন',
      hint: 'সঠিক বা ভুল উত্তর নেই — যা দেখেছেন সেটাই বেছে নিন।',
      other: {
        label: 'অন্যান্য (লিখুন)',
        placeholder: 'নিজের ভাষায় লিখুন…'
      },
      multiHint: 'একাধিক বেছে নিতে পারেন',
      q: [{
        t: 'আয়ানকে নাম ধরে ডাকলে সে কি আপনার দিকে তাকায়?',
        o: ['প্রায় সবসময়', 'মাঝে মাঝে', 'খুব কম', 'কখনো না']
      }, {
        t: 'কোনো কিছু দেখাতে চাইলে আয়ান কী করে?',
        multi: true,
        o: ['আঙুল দিয়ে দেখায়', 'হাত ধরে নিয়ে যায়', 'শুধু তাকিয়ে থাকে', 'শব্দ করে ডাকে']
      }, {
        t: 'আপনি হাসলে সে কি পাল্টা হাসে?',
        o: ['হ্যাঁ, প্রায়ই', 'মাঝে মাঝে', 'খুব কম']
      }],
      mT: 'স্ক্রিনিং থামাবেন?',
      mB: 'আপনার উত্তরগুলো এই ফোনে সংরক্ষিত থাকবে। যেকোনো সময় আবার শুরু করতে পারবেন।',
      mK: 'চালিয়ে যান',
      mP: 'পরে শেষ করব'
    },
    en: {
      sec: 'Communication',
      back: 'Back',
      next: 'Next question',
      pause: 'Pause',
      hint: "There are no right or wrong answers — choose what you've seen.",
      other: {
        label: 'Other (write)',
        placeholder: 'Describe in your own words…'
      },
      multiHint: 'You can pick more than one',
      q: [{
        t: 'When you call Ayaan by name, does he look at you?',
        o: ['Almost always', 'Sometimes', 'Rarely', 'Never']
      }, {
        t: 'When Ayaan wants to show you something, what does he do?',
        multi: true,
        o: ['Points with a finger', 'Leads you by the hand', 'Just looks at it', 'Makes a sound to call you']
      }, {
        t: 'When you smile at him, does he smile back?',
        o: ['Yes, often', 'Sometimes', 'Rarely']
      }],
      mT: 'Pause the screening?',
      mB: 'Your answers are saved on this phone. You can pick up any time.',
      mK: 'Keep going',
      mP: 'Finish later'
    }
  };
  function QuestionScreen({
    lang,
    go
  }) {
    const t = QS[lang];
    const [i, setI] = React.useState(0);
    const [ans, setAns] = React.useState({});
    const [pause, setPause] = React.useState(false);
    const q = t.q[i];
    const v = ans[i] !== undefined ? ans[i] : q.multi ? [] : null;
    const has = q.multi ? v.length > 0 : v != null;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ScreenBody, {
      footer: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        icon: "arrow-left",
        onClick: () => i ? setI(i - 1) : go('welcome')
      }, t.back), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement(Button, {
        block: true,
        iconRight: "arrow-right",
        disabled: !has,
        onClick: () => i < t.q.length - 1 ? setI(i + 1) : go('activity')
      }, t.next)))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Stepper, {
      lang: lang,
      total: 8,
      current: 2,
      caption: t.sec
    })), /*#__PURE__*/React.createElement(IconButton, {
      icon: "pause",
      label: t.pause,
      variant: "soft",
      size: "sm",
      onClick: () => setPause(true)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: 'var(--text-3)',
        fontWeight: 600,
        marginBottom: 2
      }
    }, (lang === 'bn' ? 'প্রশ্ন ' : 'Question ') + (lang === 'bn' ? ['১১', '১২', '১৩'][i] : 11 + i) + (lang === 'bn' ? ' / ২০' : ' / 20')), /*#__PURE__*/React.createElement("h2", {
      style: {
        font: '700 22px/1.5 var(--font-display)',
        margin: '0 0 6px',
        textWrap: 'pretty'
      }
    }, q.t), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 16px',
        fontSize: 15,
        color: 'var(--text-2)'
      }
    }, q.multi ? t.multiHint : t.hint), /*#__PURE__*/React.createElement(ChoiceGroup, {
      key: i + lang,
      lang: lang,
      multi: q.multi,
      value: v,
      onChange: nv => setAns({
        ...ans,
        [i]: nv
      }),
      options: q.o.map((o, k) => ({
        value: 'o' + k,
        label: o
      })),
      other: t.other
    })), pause ? /*#__PURE__*/React.createElement(Modal, {
      inline: true,
      icon: "pause",
      title: t.mT,
      onClose: () => setPause(false),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => setPause(false)
      }, t.mK), /*#__PURE__*/React.createElement(Button, {
        onClick: () => go('welcome')
      }, t.mP))
    }, t.mB) : null);
  }
  window.QuestionScreen = QuestionScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/screening/QuestionScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/screening/ReportScreen.jsx
try { (() => {
(() => {
  const {
    ScoreGauge,
    Card,
    Button,
    Icon,
    Tabs,
    RiskBadge,
    Sheet
  } = window.ShohojatriDesignSystem_1ff839;
  const RT = {
    bn: {
      title: 'আয়ানের স্ক্রিনিং রিপোর্ট',
      date: '১৫ অক্টোবর ২০২৬ · ২৪–৩০ মাস',
      cap: 'কিছু ক্ষেত্রে আয়ানের আরও সহায়তা লাগতে পারে। একজন বিশেষজ্ঞের সাথে কথা বলা ভালো হবে।',
      not: 'এটি রোগনির্ণয় নয় — এটি পরবর্তী পদক্ষেপ বোঝার একটা সহায়ক।',
      areas: 'ক্ষেত্র অনুযায়ী',
      a: [['যোগাযোগ', 'moderate'], ['খেলা ও অনুকরণ', 'low'], ['সামাজিক সাড়া', 'elevated'], ['চলাফেরা', 'low']],
      next: 'এরপর কী করবেন',
      n: [['stethoscope', 'বিশেষজ্ঞের পরামর্শ নিন', 'ঢাকা শিশু হাসপাতাল · শিশু বিকাশ কেন্দ্র'], ['sprout', 'প্রতিদিনের খেলা', 'নাম ধরে ডাকা ও মুখোমুখি খেলার ৫টি আইডিয়া']],
      share: 'বিশেষজ্ঞের সাথে শেয়ার করুন',
      start: 'সহযাত্রী শুরু করুন',
      shT: 'রিপোর্ট শেয়ার করুন',
      shB: 'ডা. নাসরিন হক রিপোর্ট ও ভিডিওগুলো দেখতে পাবেন। যেকোনো সময় অনুমতি তুলে নিতে পারবেন।',
      shOk: 'শেয়ার করুন'
    },
    en: {
      title: "Ayaan's screening report",
      date: '15 Oct 2026 · 24–30 months',
      cap: 'Ayaan may need some extra support in a few areas. Talking with a specialist is a good next step.',
      not: 'This is not a diagnosis — it helps you decide what to do next.',
      areas: 'By area',
      a: [['Communication', 'moderate'], ['Play & imitation', 'low'], ['Social response', 'elevated'], ['Movement', 'low']],
      next: 'What to do next',
      n: [['stethoscope', 'Talk to a specialist', 'Dhaka Shishu Hospital · Child Development Centre'], ['sprout', 'Everyday play', '5 ideas for name-calling and face-to-face play']],
      share: 'Share with a specialist',
      start: 'Start Companion',
      shT: 'Share report',
      shB: 'Dr. Nasrin Haque will see the report and videos. You can withdraw access any time.',
      shOk: 'Share'
    }
  };
  function ReportScreen({
    lang,
    go
  }) {
    const t = RT[lang];
    const [sh, setSh] = React.useState(false);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ScreenBody, {
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        size: "lg",
        block: true,
        icon: "share-2",
        onClick: () => setSh(true)
      }, t.share), /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        block: true,
        onClick: () => go('welcome')
      }, t.start))
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        font: '700 24px/1.45 var(--font-display)',
        margin: 0
      }
    }, t.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: 'var(--text-3)',
        marginBottom: 14
      }
    }, t.date), /*#__PURE__*/React.createElement(Card, {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(ScoreGauge, {
      lang: lang,
      value: 9,
      max: 20,
      thresholds: [3, 8, 13],
      width: 260,
      caption: t.cap
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        fontSize: 14,
        color: 'var(--text-2)',
        margin: '0 4px 18px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 18
    }), /*#__PURE__*/React.createElement("span", null, t.not)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        marginBottom: 8
      }
    }, t.areas), /*#__PURE__*/React.createElement(Card, {
      padding: 4,
      style: {
        marginBottom: 18
      }
    }, t.a.map(([n, l], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 14px',
        borderTop: i ? '1px solid var(--border-1)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, n), /*#__PURE__*/React.createElement(RiskBadge, {
      lang: lang,
      level: l,
      showBars: false
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        marginBottom: 8
      }
    }, t.next), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, t.n.map(([ic, h, d], i) => /*#__PURE__*/React.createElement(Card, {
      key: i,
      onClick: () => {},
      padding: 14,
      style: {
        display: 'flex',
        gap: 12,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sj-tile",
      style: {
        background: i ? 'var(--sj-sprout-50)' : 'var(--sj-navy-50)',
        color: i ? 'var(--sj-ink-leaf)' : 'var(--sj-navy)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 22
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontWeight: 600
      }
    }, h), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 14,
        color: 'var(--text-2)'
      }
    }, d)), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 20,
      color: "var(--text-3)"
    }))))), sh ? /*#__PURE__*/React.createElement(Sheet, {
      inline: true,
      lang: lang,
      title: t.shT,
      onClose: () => setSh(false),
      footer: /*#__PURE__*/React.createElement(Button, {
        block: true,
        icon: "share-2",
        onClick: () => setSh(false)
      }, t.shOk)
    }, t.shB) : null);
  }
  window.ReportScreen = ReportScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/screening/ReportScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/screening/Shell.jsx
try { (() => {
(() => {
  const {
    LanguageToggle,
    IconButton
  } = window.ShohojatriDesignSystem_1ff839;
  function Phone({
    lang,
    setLang,
    onHome,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      lang: lang,
      style: {
        width: 390,
        height: 844,
        background: 'var(--surface-page)',
        borderRadius: 44,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,60,120,.22),0 0 0 10px #0F2236',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 44,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        font: '600 15px var(--font-body)',
        color: 'var(--text-1)'
      }
    }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon2, {
      n: "signal"
    }), /*#__PURE__*/React.createElement(Icon2, {
      n: "wifi"
    }), /*#__PURE__*/React.createElement(Icon2, {
      n: "battery-full"
    }))), /*#__PURE__*/React.createElement("header", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 16px 8px 20px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onHome,
      style: {
        border: 0,
        background: 'none',
        padding: 0,
        cursor: 'pointer'
      },
      "aria-label": "Home"
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logo/shohojatri-wordmark.png",
      alt: "\u09B8\u09B9\u09AF\u09BE\u09A4\u09CD\u09B0\u09C0",
      style: {
        height: 34,
        display: 'block'
      }
    })), /*#__PURE__*/React.createElement(LanguageToggle, {
      value: lang,
      onChange: setLang
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }
    }, children));
  }
  function Icon2({
    n
  }) {
    const {
      Icon
    } = window.ShohojatriDesignSystem_1ff839;
    return /*#__PURE__*/React.createElement(Icon, {
      name: n,
      size: 16,
      strokeWidth: 2.25
    });
  }
  function ScreenBody({
    children,
    footer
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px 20px 24px'
      }
    }, children), footer ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '12px 20px 28px',
        background: 'linear-gradient(180deg,rgba(250,251,248,0),var(--surface-page) 30%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, footer) : null);
  }
  Object.assign(window, {
    Phone,
    ScreenBody
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/screening/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/screening/WelcomeScreen.jsx
try { (() => {
(() => {
  const {
    Button,
    Card,
    Icon,
    Chip
  } = window.ShohojatriDesignSystem_1ff839;
  const WT = {
    bn: {
      hi: 'স্বাগতম, ফারহানা',
      title: 'আপনার শিশুর বিকাশ — এক সাথে বুঝি',
      body: '১৫ মিনিটের কিছু প্রশ্ন আর ছোট খেলার মাধ্যমে আয়ানের বেড়ে ওঠা নিয়ে একটা প্রাথমিক ধারণা পাবেন।',
      steps: [['message-square-text', 'প্রশ্নাবলি', 'খেলা, কথা আর মেলামেশা নিয়ে ২০টি প্রশ্ন'], ['camera', 'ক্যামেরা খেলা', '৩টি ছোট খেলা, ফোনের ক্যামেরায়'], ['clipboard-list', 'রিপোর্ট', 'সহজ ভাষায় ফলাফল ও পরামর্শ']],
      note: 'এটি রোগনির্ণয় নয়। ভিডিও শুধু আপনার অনুমতিতে সংরক্ষিত হয়।',
      cta: 'স্ক্রিনিং শুরু করুন',
      later: 'পরে করব',
      time: 'প্রায় ১৫ মিনিট'
    },
    en: {
      hi: 'Welcome, Farhana',
      title: "Understanding your child's growth — together",
      body: "A few questions and short play activities (about 15 minutes) give you an early picture of how Ayaan is developing.",
      steps: [['message-square-text', 'Questions', '20 questions on play, talk and connecting'], ['camera', 'Camera play', '3 short games using your phone camera'], ['clipboard-list', 'Report', 'Plain-language results and next steps']],
      note: 'This is not a diagnosis. Videos are saved only with your permission.',
      cta: 'Start screening',
      later: 'Maybe later',
      time: 'About 15 minutes'
    }
  };
  function WelcomeScreen({
    lang,
    go
  }) {
    const t = WT[lang];
    return /*#__PURE__*/React.createElement(ScreenBody, {
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        size: "lg",
        block: true,
        icon: "play",
        onClick: () => go('questions')
      }, t.cta), /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        block: true
      }, t.later))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--sj-gradient-sky)',
        borderRadius: '28px 28px 28px 8px',
        padding: '20px 20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: 20,
        border: '1px solid var(--border-1)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logo/shohojatri-mark.png",
      alt: "",
      style: {
        width: 150,
        marginBottom: 12
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        color: 'var(--sj-ink-teal)',
        fontWeight: 600
      }
    }, t.hi), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: '700 26px/1.45 var(--font-display)',
        margin: '2px 0 8px',
        color: 'var(--text-1)',
        textWrap: 'pretty'
      }
    }, t.title), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 16px',
        color: 'var(--text-2)'
      }
    }, t.body), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: 16
      }
    }, t.steps.map(([ic, h, d], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 14,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sj-tile",
      style: {
        background: 'var(--sj-teal-50)',
        color: 'var(--sj-ink-teal)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 22
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600
      }
    }, h), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: 'var(--text-2)'
      }
    }, d))))), /*#__PURE__*/React.createElement(Card, {
      tone: "warm",
      padding: 14
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        fontSize: 14,
        lineHeight: 1.6,
        color: 'var(--sj-ink-amber)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield-check",
      size: 20
    }), /*#__PURE__*/React.createElement("span", null, t.note))));
  }
  window.WelcomeScreen = WelcomeScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/screening/WelcomeScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.ActivityCard = __ds_scope.ActivityCard;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ChildCard = __ds_scope.ChildCard;

__ds_ns.LogEntryCard = __ds_scope.LogEntryCard;

__ds_ns.ReminderCard = __ds_scope.ReminderCard;

__ds_ns.RoleBadge = __ds_scope.RoleBadge;

__ds_ns.SuggestionCard = __ds_scope.SuggestionCard;

__ds_ns.ChatBubble = __ds_scope.ChatBubble;

__ds_ns.SourceChip = __ds_scope.SourceChip;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ChoiceCard = __ds_scope.ChoiceCard;

__ds_ns.ChoiceGroup = __ds_scope.ChoiceGroup;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.RiskBadge = __ds_scope.RiskBadge;

__ds_ns.ScoreGauge = __ds_scope.ScoreGauge;

__ds_ns.RISK = __ds_scope.RISK;

__ds_ns.RISK_ORDER = __ds_scope.RISK_ORDER;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.StateView = __ds_scope.StateView;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.LanguageToggle = __ds_scope.LanguageToggle;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Sheet = __ds_scope.Sheet;

})();
