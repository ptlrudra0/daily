// NEON GRID - tic-tac-toe home-screen widget for Scriptable.
// Name this script exactly: Neon Grid
// Medium widget. Each cell is a tap zone: tap -> Scriptable runs, your X
// lands, the bot answers, the widget re-renders. Running the script inside
// the app (or tapping the score bar) opens a full playable board instead.
// State lives in a JSON file in Scriptable's documents, so it survives runs.

const SCRIPT_NAME = "Neon Grid";
const STATE_FILE = "neon-grid-state.json";

const C = {
  bgTop: new Color("#141126"),
  bgBottom: new Color("#07060F"),
  cell: new Color("#1D1A33"),
  cellWin: new Color("#3A2A5E"),
  grid: new Color("#2A2550"),
  x: new Color("#37E6FF"),
  o: new Color("#FF3DA6"),
  ink: new Color("#EDEAF7"),
  dim: new Color("#8B86B0"),
};

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function fm() { return FileManager.local(); }
function statePath() { return fm().joinPath(fm().documentsDirectory(), STATE_FILE); }

function newGame(keep) {
  return {
    board: ["","","","","","","","",""],
    status: "playing", line: [],
    xWins: keep ? keep.xWins : 0,
    oWins: keep ? keep.oWins : 0,
    draws: keep ? keep.draws : 0,
  };
}

function loadState() {
  try {
    if (fm().fileExists(statePath())) {
      const s = JSON.parse(fm().readString(statePath()));
      if (s && Array.isArray(s.board) && s.board.length === 9) return s;
    }
  } catch (e) {}
  return newGame();
}

function saveState(s) { fm().writeString(statePath(), JSON.stringify(s)); }

function winnerOf(b) {
  for (const line of LINES) {
    const [a, bb, c] = line;
    if (b[a] !== "" && b[a] === b[bb] && b[a] === b[c]) return { mark: b[a], line };
  }
  return { mark: "", line: [] };
}

function botPick(b) {
  const empty = i => b[i] === "";
  const findFor = mark => {
    for (const line of LINES) {
      const trio = [b[line[0]], b[line[1]], b[line[2]]];
      const marks = trio.filter(v => v === mark).length;
      const blanks = trio.filter(v => v === "").length;
      if (marks === 2 && blanks === 1) return line[trio.indexOf("")];
    }
    return -1;
  };
  let pick = findFor("O");
  if (pick >= 0) return pick;
  pick = findFor("X");
  if (pick >= 0) return pick;
  if (empty(4)) return 4;
  const corners = [0,2,6,8].filter(empty);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const rest = b.map((_, i) => i).filter(empty);
  return rest.length ? rest[Math.floor(Math.random() * rest.length)] : -1;
}

function applyTap(s, i) {
  if (s.status !== "playing" || s.board[i] !== "") return s;
  s.board[i] = "X";
  let r = winnerOf(s.board);
  if (r.mark === "X") {
    s.status = "won"; s.line = r.line; s.xWins += 1;
  } else if (s.board.every(c => c !== "")) {
    s.status = "draw"; s.draws += 1;
  } else {
    const p = botPick(s.board);
    if (p >= 0) s.board[p] = "O";
    r = winnerOf(s.board);
    if (r.mark === "O") {
      s.status = "lost"; s.line = r.line; s.oWins += 1;
    } else if (s.board.every(c => c !== "")) {
      s.status = "draw"; s.draws += 1;
    }
  }
  return s;
}

function statusText(s) {
  if (s.status === "won") return "YOU WIN";
  if (s.status === "lost") return "BOT WINS";
  if (s.status === "draw") return "DRAW";
  return "YOUR MOVE";
}

function runURL(cell) {
  return "scriptable:///run/" + encodeURIComponent(SCRIPT_NAME) + "?cell=" + cell;
}

function buildWidget(s) {
  const w = new ListWidget();
  const g = new LinearGradient();
  g.colors = [C.bgTop, C.bgBottom];
  g.startPoint = new Point(0, 0);
  g.endPoint = new Point(0, 1);
  w.backgroundGradient = g;
  w.setPadding(12, 12, 12, 12);

  const title = w.addText("NEON GRID  " + s.xWins + " - " + s.oWins);
  title.font = Font.boldRoundedSystemFont(12);
  title.textColor = C.dim;
  w.url = runURL("open");
  w.addSpacer(6);

  for (let row = 0; row < 3; row++) {
    const r = w.addStack();
    r.layoutHorizontally();
    r.centerAlignContent();
    for (let col = 0; col < 3; col++) {
      const i = row * 3 + col;
      const cell = r.addStack();
      cell.size = new Size(44, 44);
      cell.cornerRadius = 10;
      const inLine = s.line.indexOf(i) >= 0;
      cell.backgroundColor = inLine ? C.cellWin : C.cell;
      cell.url = runURL(i);
      const mark = s.board[i];
      const t = cell.addText(mark === "" ? " " : mark);
      t.font = Font.blackRoundedSystemFont(24);
      if (mark === "X") t.textColor = C.x;
      if (mark === "O") t.textColor = C.o;
      if (col < 2) r.addSpacer(8);
    }
    if (row < 2) w.addSpacer(8);
  }

  w.addSpacer(6);
  const st = w.addText(statusText(s) + "  ·  tap a cell");
  st.font = Font.mediumRoundedSystemFont(11);
  st.textColor = s.status === "won" ? C.x : (s.status === "lost" ? C.o : C.dim);

  const resetRow = w.addStack();
  resetRow.layoutHorizontally();
  const reset = resetRow.addText("NEW GAME");
  reset.font = Font.boldRoundedSystemFont(10);
  reset.textColor = C.ink;
  resetRow.url = runURL("reset");

  return w;
}

async function presentBoard(s) {
  // Full playable board inside Scriptable (same state file as the widget).
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"><style>
  body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(#141126,#07060F);font-family:-apple-system;color:#EDEAF7}
  h1{font-size:18px;letter-spacing:3px;color:#8B86B0;font-weight:800}
  #grid{display:grid;grid-template-columns:repeat(3,92px);gap:10px;margin:18px 0}
  .c{width:92px;height:92px;border-radius:18px;background:#1D1A33;border:1px solid #2A2550;display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:900}
  .c.win{background:#3A2A5E}.x{color:#37E6FF;text-shadow:0 0 14px #37E6FF}.o{color:#FF3DA6;text-shadow:0 0 14px #FF3DA6}
  #st{color:#8B86B0;font-weight:700;margin-bottom:14px}
  #new{background:linear-gradient(135deg,#37E6FF,#FF3DA6);color:#0B0A14;border:0;border-radius:14px;padding:12px 26px;font-weight:900;font-size:15px}
  </style></head><body>
  <h1>NEON GRID</h1><div id="st"></div><div id="grid"></div>
  <button id="new">NEW GAME</button>
  <script>
  const s = ${JSON.stringify(s)};
  const render = () => {
    document.getElementById('st').textContent =
      s.status==='won'?'YOU WIN':s.status==='lost'?'BOT WINS':s.status==='draw'?'DRAW':'YOUR MOVE';
    const g = document.getElementById('grid'); g.innerHTML='';
    s.board.forEach((m,i)=>{const d=document.createElement('div');
      d.className='c'+(s.line.includes(i)?' win':'');
      if(m){const t=document.createElement('span');t.className=m.toLowerCase();t.textContent=m;d.appendChild(t);}
      d.onclick=()=>{location.href='ttj://play/'+i};g.appendChild(d);});
  };
  document.getElementById('new').onclick=()=>{location.href='ttj://reset'};
  render();
  </scr` + `ipt></body></html>`;

  const wv = new WebView();
  wv.shouldAllowRequest = req => {
    const u = req.url;
    if (u.startsWith("ttj://play/")) {
      const i = parseInt(u.split("/").pop(), 10);
      s = applyTap(s, i);
      saveState(s);
      presentBoard(s);
      return false;
    }
    if (u.startsWith("ttj://reset")) {
      s = newGame(s);
      saveState(s);
      presentBoard(s);
      return false;
    }
    return true;
  };
  await wv.loadHTML(html, null);
  await wv.present(true);
}

// ---- entry point ----
const qp = args.queryParameters || {};
let s = loadState();

if (config.runsInWidget) {
  Script.setWidget(buildWidget(loadState()));
} else if (qp.cell === "reset") {
  s = newGame(loadState());
  saveState(s);
  Script.setWidget(buildWidget(s));
} else if (qp.cell !== undefined && qp.cell !== "open") {
  s = applyTap(loadState(), parseInt(qp.cell, 10));
  saveState(s);
  Script.setWidget(buildWidget(s));
} else {
  // Run in the app with no cell: full playable board.
  await presentBoard(loadState());
  Script.setWidget(buildWidget(loadState()));
}
Script.complete();
