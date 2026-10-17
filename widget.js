// The Daily Draft - iPhone home-screen widget (Scriptable)
// Install: copy this whole file into a new script in the Scriptable app,
// then long-press home screen > + > Scriptable > Medium > pick this script.

const FEED = "https://ptlrudra0.github.io/daily/content.json";
const PAGE = "https://ptlrudra0.github.io/daily/";

const PAPER = new Color("#F9F9F6");
const INK   = new Color("#17140F");
const SOFT  = new Color("#6B6255");
const RED   = new Color("#E8480C");
const KIND_COLORS = {
  "AI TIP":  new Color("#2B4BE0"),
  "DESIGN":  new Color("#E8480C"),
  "AI NEWS": new Color("#B87A00"),
  "TRY THIS":new Color("#CE3A6B"),
  "ON SCREEN":new Color("#CE3A6B")
};

const w = new ListWidget();
w.backgroundColor = PAPER;
w.url = PAGE;
w.setPadding(16, 16, 14, 16);

try {
  const data = await new Request(FEED).loadJSON();
  const issue = data.issues[0];
  const lead = issue.items[0];
  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  // masthead row
  const top = w.addStack();
  top.layoutHorizontally();
  const name = top.addText("THE DAILY DRAFT");
  name.font = Font.boldSystemFont(10);
  name.textColor = INK;
  top.addSpacer();
  const dot = top.addText("●");
  dot.font = Font.systemFont(8);
  dot.textColor = RED;

  w.addSpacer(2);
  const rule = w.addText("───────────────────");
  rule.font = Font.systemFont(6);
  rule.textColor = SOFT;

  w.addSpacer(8);

  // category chip
  const chip = w.addText(" " + lead.kind + " ");
  chip.font = Font.boldSystemFont(9);
  chip.textColor = PAPER;
  chip.backgroundColor = KIND_COLORS[lead.kind] || RED;

  w.addSpacer(6);

  // headline + story art
  const mid = w.addStack();
  mid.layoutHorizontally();
  mid.centerAlignContent();
  const left = mid.addStack();
  left.layoutVertically();
  const head = left.addText(lead.headline);
  head.font = Font.semiboldSystemFont(19);
  head.textColor = INK;
  head.lineLimit = 3;
  head.minimumScaleFactor = 0.8;
  mid.addSpacer(6);
  if (lead.image) {
    try {
      const img = await new Request(PAGE + lead.image).loadImage();
      const pic = mid.addImage(img);
      pic.imageSize = new Size(92, 62);
      pic.rightAlignImage();
    } catch (e2) {}
  }

  w.addSpacer();

  // footer row
  const foot = w.addStack();
  foot.layoutHorizontally();
  foot.centerAlignContent();
  const dt = foot.addText(dayStr + "  ·  № " + issue.number);
  dt.font = Font.systemFont(10);
  dt.textColor = SOFT;
  foot.addSpacer();
  const open = foot.addText("Read →");
  open.font = Font.boldSystemFont(10);
  open.textColor = RED;
} catch (e) {
  const t = w.addText("The Daily Draft");
  t.font = Font.boldSystemFont(16);
  t.textColor = INK;
  w.addSpacer(6);
  const s = w.addText("Could not load today's edition. Tap to open the paper.");
  s.font = Font.systemFont(11);
  s.textColor = SOFT;
}

if (!config.runsInWidget) {
  await w.presentMedium();
}
Script.setWidget(w);
Script.complete();
