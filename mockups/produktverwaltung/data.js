// Illustrative sample data for the click dummy. These are not real products,
// prices or links. `hasLicenses` is not a product field; it only simulates
// whether licenses exist, to show when deleting is blocked.
window.PM_SEED = [
  {
    id: "KASSE-T200",
    description:
      "Kassenterminal mit 15,6-Zoll-Touchdisplay, integriertem Bondrucker und Kartenleser für den Einzelhandel. Zahlungsarten und Zusatzfunktionen werden per Lizenzschlüssel freigeschaltet.",
    available: true,
    price: 1290,
    links: [
      "https://docs.example.com/kasse-t200/handbuch",
      "https://support.example.com/kasse-t200",
    ],
    tags: ["Einzelhandel", "Zahlungsverkehr", "Hardware"],
    hasLicenses: true,
    features: [
      {
        id: "KONTAKTLOS",
        description:
          "Kontaktloses Bezahlen per NFC mit Karte, Smartphone oder Smartwatch.",
        fields: [],
      },
      {
        id: "MULTI-USER",
        description:
          "Mehrere Kassierer:innen mit eigener Anmeldung und getrennter Kassenabrechnung.",
        fields: [{ name: "Anzahl Benutzer:innen", type: "integer" }],
      },
      {
        id: "BON-CLOUD",
        description:
          "Digitale Belege in der Cloud speichern und per QR-Code an Kund:innen ausgeben.",
        fields: [
          { name: "Mandanten-ID", type: "text" },
          { name: "Speicherdauer in Monaten", type: "integer" },
        ],
      },
      {
        id: "FISKAL-TSE",
        description:
          "Technische Sicherheitseinrichtung nach Kassensicherungsverordnung (KassenSichV).",
        fields: [
          { name: "TSE-Seriennummer", type: "text" },
          { name: "Zertifikat gültig bis", type: "date" },
        ],
      },
    ],
  },
  {
    id: "SCAN-D500",
    description:
      "Dokumentenscanner für Belege und Verträge mit bis zu 60 Seiten pro Minute und Einzug für 100 Blatt.",
    available: true,
    price: 849,
    links: ["https://docs.example.com/scan-d500/datenblatt"],
    tags: ["Büro", "Dokumente", "Hardware"],
    hasLicenses: true,
    features: [
      {
        id: "OCR-PRO",
        description:
          "Texterkennung mit Export als durchsuchbares PDF und automatischer Belegerkennung.",
        fields: [{ name: "Sprachpakete", type: "text" }],
      },
      {
        id: "DUPLEX",
        description: "Beidseitiges Scannen in einem Durchgang.",
        fields: [],
      },
      {
        id: "TAGESVOLUMEN",
        description:
          "Erhöht das empfohlene Tagesvolumen, ohne die Garantie zu verlieren.",
        fields: [{ name: "Seiten pro Tag", type: "integer" }],
      },
    ],
  },
  {
    id: "GATEWAY-IOT4",
    description:
      "Industrie-Gateway mit vier Ethernet-Anschlüssen und LTE-Modem, das Maschinen und Sensoren sicher mit der Cloud verbindet.",
    available: true,
    price: 2450,
    links: [
      "https://docs.example.com/gateway-iot4/installation",
      "https://docs.example.com/gateway-iot4/api",
    ],
    tags: ["Industrie", "IoT", "Hardware"],
    hasLicenses: false,
    features: [
      {
        id: "VPN",
        description: "Verschlüsselter Tunnel ins Firmennetz.",
        fields: [{ name: "Gegenstelle (Hostname)", type: "text" }],
      },
      {
        id: "MODBUS-TCP",
        description: "Anbindung von Steuerungen über Modbus TCP.",
        fields: [],
      },
      {
        id: "SENSOR-PAKET",
        description:
          "Zusätzliche Kanäle für Temperatur-, Druck- und Vibrationssensoren.",
        fields: [{ name: "Anzahl Sensoren", type: "integer" }],
      },
      {
        id: "FERNWARTUNG",
        description:
          "Fernzugriff für den Service, jede Sitzung wird protokolliert.",
        fields: [
          { name: "Wartungsvertrag-Nr.", type: "text" },
          { name: "Gültig bis", type: "date" },
        ],
      },
    ],
  },
  {
    id: "KARTENLESER-C3",
    description:
      "Chipkartenleser mit PIN-Pad für Online-Banking und qualifizierte elektronische Signaturen.",
    available: true,
    price: 129,
    links: ["https://support.example.com/kartenleser-c3/treiber"],
    tags: ["Banking", "Sicherheit", "Hardware"],
    hasLicenses: true,
    features: [
      {
        id: "SIGNATUR-QES",
        description: "Qualifizierte elektronische Signatur nach eIDAS.",
        fields: [
          { name: "Zertifikatsnummer", type: "text" },
          { name: "Gültig bis", type: "date" },
        ],
      },
      {
        id: "MULTI-KARTE",
        description: "Mehrere Bankkarten auf einem Gerät verwenden.",
        fields: [{ name: "Anzahl Karten", type: "integer" }],
      },
    ],
  },
  {
    id: "DISPLAY-K15",
    description:
      "Kundendisplay mit 15-Zoll-Bildschirm, das Einkäufe und Werbung an der Kasse zeigt. Wird nicht mehr verkauft, bestehende Geräte werden weiter unterstützt.",
    available: false,
    price: 390,
    links: [],
    tags: ["Einzelhandel", "Auslaufmodell"],
    hasLicenses: true,
    features: [
      {
        id: "WERBUNG",
        description: "Werbeinhalte zwischen den Einkäufen abspielen.",
        fields: [
          { name: "Playlist-ID", type: "text" },
          { name: "Laufzeit bis", type: "date" },
        ],
      },
    ],
  },
];
