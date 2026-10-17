import {
	Button,
	HStack,
	RoundedRectangle,
	Text,
	VStack,
	ZStack,
} from 'await';

// NEON GRID - tic-tac-toe you play on the Home Screen.
// You are X (cyan). The bot is O (magenta). Tap a cell to move.
// State lives in AwaitStore, so the board survives widget refreshes.

type Cell = '' | 'X' | 'O';
type GameState = {
	board: Cell[];
	status: 'playing' | 'won' | 'lost' | 'draw';
	line: number[];
	xWins: number;
	oWins: number;
	draws: number;
};
type EntryData = GameState;

const STORE_KEY = 'neon-grid-state-v1';

const colors = {
	bgTop: '#141126',
	bgBottom: '#07060F',
	cell: '#1D1A33',
	cellWin: '#3A2A5E',
	grid: '#2A2550',
	x: '#37E6FF',
	o: '#FF3DA6',
	ink: '#EDEAF7',
	dim: '#8B86B0',
	panel: '#191631',
};

const LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

function winnerOf(board: Cell[]): {mark: Cell; line: number[]} {
	for (const line of LINES) {
		const [a, b, c] = line;
		if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
			return {mark: board[a], line};
		}
	}

	return {mark: '', line: []};
}

function newGame(keep?: GameState): GameState {
	return {
		board: Array.from({length: 9}, () => '' as Cell),
		status: 'playing',
		line: [],
		xWins: keep?.xWins ?? 0,
		oWins: keep?.oWins ?? 0,
		draws: keep?.draws ?? 0,
	};
}

function getState(): GameState {
	const stored = AwaitStore.get<GameState>(STORE_KEY);
	if (stored && Array.isArray(stored.board) && stored.board.length === 9) {
		return stored;
	}

	const fresh = newGame();
	AwaitStore.set(STORE_KEY, fresh);
	return fresh;
}

function botPick(board: Cell[]): number {
	const empty = (i: number) => board[i] === '';
	const findFor = (mark: Cell): number => {
		for (const [a, b, c] of LINES) {
			const trio = [board[a], board[b], board[c]];
			const marks = trio.filter(v => v === mark).length;
			const blanks = trio.filter(v => v === '').length;
			if (marks === 2 && blanks === 1) {
				const line = [a, b, c];
				return line[trio.indexOf('')];
			}
		}

		return -1;
	};

	const win = findFor('O');
	if (win >= 0) {
		return win;
	}

	const block = findFor('X');
	if (block >= 0) {
		return block;
	}

	if (empty(4)) {
		return 4;
	}

	const corners = [0, 2, 6, 8].filter(empty);
	if (corners.length > 0) {
		return corners[Math.floor(Math.random() * corners.length)];
	}

	const rest = board.map((_, i) => i).filter(empty);
	return rest[Math.floor(Math.random() * rest.length)] ?? -1;
}

function tap(i: number) {
	const state = getState();
	if (state.status !== 'playing' || state.board[i] !== '') {
		return;
	}

	state.board[i] = 'X';
	let result = winnerOf(state.board);
	if (result.mark === 'X') {
		state.status = 'won';
		state.line = result.line;
		state.xWins += 1;
	} else if (state.board.every(c => c !== '')) {
		state.status = 'draw';
		state.draws += 1;
	} else {
		const pick = botPick(state.board);
		if (pick >= 0) {
			state.board[pick] = 'O';
		}

		result = winnerOf(state.board);
		if (result.mark === 'O') {
			state.status = 'lost';
			state.line = result.line;
			state.oWins += 1;
		} else if (state.board.every(c => c !== '')) {
			state.status = 'draw';
			state.draws += 1;
		}
	}

	AwaitStore.set(STORE_KEY, state);
	AwaitUI.haptic('light');
}

function reset() {
	AwaitStore.set(STORE_KEY, newGame(getState()));
	AwaitUI.haptic('medium');
}

function statusText(state: GameState): string {
	switch (state.status) {
		case 'won': {
			return 'YOU WIN';
		}

		case 'lost': {
			return 'BOT WINS';
		}

		case 'draw': {
			return 'DRAW';
		}

		default: {
			return 'YOUR MOVE';
		}
	}
}

function statusColor(state: GameState): string {
	switch (state.status) {
		case 'won': {
			return colors.x;
		}

		case 'lost': {
			return colors.o;
		}

		default: {
			return colors.dim;
		}
	}
}

function CellView({state, i, size}: {state: GameState; i: number; size: number}) {
	const mark = state.board[i];
	const inLine = state.line.includes(i);
	const markColor = mark === 'X' ? colors.x : colors.o;
	return (
		<Button intent={app.tap(i)} buttonStyle='borderless'>
			<ZStack frame={{width: size, height: size}}>
				<RoundedRectangle
					rectRadius={size * 0.22}
					fill={inLine ? colors.cellWin : colors.cell}
					stroke={{color: inLine ? markColor : colors.grid, lineWidth: 1}}
				/>
				{mark === ''
					? undefined
					: (
						<Text
							value={mark}
							fontSize={size * 0.52}
							fontWeight={900}
							fontDesign='rounded'
							foreground={markColor}
							shadow={{color: markColor, blur: 8}}
						/>
					)}
			</ZStack>
		</Button>
	);
}

function BoardView({state, cell, gap}: {state: GameState; cell: number; gap: number}) {
	return (
		<VStack spacing={gap}>
			{[0, 1, 2].map(row => (
				<HStack spacing={gap}>
					{[0, 1, 2].map(col => (
						<CellView state={state} i={row * 3 + col} size={cell}/>
					))}
				</HStack>
			))}
		</VStack>
	);
}

function SideRail({state, width, height, gap}: {state: GameState; width: number; height: number; gap: number}) {
	const block = (height - gap * 2) / 3;
	return (
		<VStack spacing={gap} frame={{width, height}}>
			<Button intent={app.reset()} buttonStyle='borderless'>
				<ZStack frame={{width, height: block}}>
					<RoundedRectangle
						rectRadius={block * 0.3}
						fill={{
							gradient: 'linear',
							colors: [colors.x, colors.o],
							startPoint: 'topLeading',
							endPoint: 'bottomTrailing',
						}}
					/>
					<Text
						value='NEW'
						fontSize={block * 0.38}
						fontWeight={900}
						fontDesign='rounded'
						foreground='#0B0A14'
					/>
				</ZStack>
			</Button>
			<ZStack frame={{width, height: block}}>
				<RoundedRectangle rectRadius={block * 0.3} fill={colors.panel}/>
				<Text
					value={`${state.xWins} - ${state.oWins}`}
					fontSize={block * 0.34}
					fontWeight={800}
					fontDesign='rounded'
					monospacedDigit
					foreground={colors.ink}
				/>
			</ZStack>
			<ZStack frame={{width, height: block}}>
				<RoundedRectangle rectRadius={block * 0.3} fill={colors.panel}/>
				<Text
					value={statusText(state)}
					fontSize={block * 0.22}
					fontWeight={800}
					fontDesign='rounded'
					foreground={statusColor(state)}
					lineLimit={1}
					minimumScaleFactor={0.5}
					padding={4}
				/>
			</ZStack>
		</VStack>
	);
}

function widget(entry: WidgetEntry<EntryData>) {
	const state = entry;
	const pad = 12;
	const gap = 8;
	const sideWidth = 64;
	const width = entry.size.width - pad * 2;
	const height = entry.size.height - pad * 2;
	const boardWidth = width - sideWidth - gap;
	const cell = Math.min(
		(boardWidth - gap * 2) / 3,
		(height - gap * 2) / 3,
	);
	return (
		<ZStack
			maxSides
			ignoresSafeArea
			background={{
				gradient: 'linear',
				colors: [colors.bgTop, colors.bgBottom],
				startPoint: 'top',
				endPoint: 'bottom',
			}}
		>
			<HStack spacing={gap} padding={pad} maxSides alignment='center'>
				<BoardView state={state} cell={cell} gap={gap}/>
				<SideRail state={state} width={sideWidth} height={cell * 3 + gap * 2} gap={gap}/>
			</HStack>
		</ZStack>
	);
}

function widgetTimeline(_context: TimelineContext): Timeline<EntryData> {
	return {
		entries: [
			{
				date: new Date(),
				...getState(),
			},
		],
	};
}

const app = Await.define({
	widget,
	widgetFamilies: ['medium', 'large'],
	widgetTimeline,
	widgetIntents: {tap, reset},
});
