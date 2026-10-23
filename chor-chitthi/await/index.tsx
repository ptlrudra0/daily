import {
	Button,
	HStack,
	RoundedRectangle,
	Text,
	VStack,
	ZStack,
} from 'await';

// CHOR-CHITTHI - a digital chitthi (slip) draw on the Home Screen.
// Pick 4 or 6 players, pass the phone seat to seat. Each player taps the
// face-down slip to see their role alone, then hides it and passes on.
// No names, no scoring. The rest of the game happens in the room.
// State lives in AwaitStore, so the deal survives widget refreshes.

type Phase = 'choose' | 'pass' | 'reveal' | 'done';
type GameState = {
	mode: 4 | 6;
	seats: number[];
	current: number;
	phase: Phase;
};
type EntryData = GameState;

const STORE_KEY = 'chor-chitthi-state-v1';

const colors = {
	burgundy: '#4A0E1C',
	deep: '#2A0710',
	ivory: '#F3EAD8',
	gold: '#D6B673',
	dim: '#B9A98F',
	scarlet: '#D64541',
	slip: '#3A0B16',
};

const ROLES: Record<number, {name: string; blurb: string}[]> = {
	4: [
		{name: 'RAJA', blurb: 'The king. Untouchable.'},
		{name: 'RANI', blurb: 'The queen. Royal blood.'},
		{name: 'WAZIR', blurb: 'The minister. Name the Chor.'},
		{name: 'CHOR', blurb: 'The thief. Act innocent.'},
	],
	6: [
		{name: 'RAJA', blurb: 'The king. Untouchable.'},
		{name: 'RANI', blurb: 'The queen. Royal blood.'},
		{name: 'WAZIR', blurb: 'The minister. Name the Chor.'},
		{name: 'CHOR', blurb: 'The thief. Act innocent.'},
		{name: "RANI'S BROTHER", blurb: 'Blood of the queen.'},
		{name: 'SIPAHI', blurb: 'The soldier. Loyal blade.'},
	],
};

function shuffled(count: number): number[] {
	const seats = Array.from({length: count}, (_, i) => i);
	for (let i = seats.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[seats[i], seats[j]] = [seats[j], seats[i]];
	}

	return seats;
}

function freshState(): GameState {
	return {mode: 4, seats: [], current: 0, phase: 'choose'};
}

function getState(): GameState {
	const stored = AwaitStore.get<GameState>(STORE_KEY);
	if (
		stored
		&& (stored.mode === 4 || stored.mode === 6)
		&& Array.isArray(stored.seats)
		&& typeof stored.current === 'number'
		&& ['choose', 'pass', 'reveal', 'done'].includes(stored.phase)
	) {
		return stored;
	}

	const fresh = freshState();
	AwaitStore.set(STORE_KEY, fresh);
	return fresh;
}

function save(state: GameState) {
	AwaitStore.set(STORE_KEY, state);
}

function choose(mode: number) {
	if (mode !== 4 && mode !== 6) {
		return;
	}

	save({mode, seats: shuffled(mode), current: 0, phase: 'pass'});
	AwaitUI.haptic('medium');
}

function reveal() {
	const state = getState();
	if (state.phase !== 'pass') {
		return;
	}

	state.phase = 'reveal';
	save(state);
	AwaitUI.haptic('light');
}

function hide() {
	const state = getState();
	if (state.phase !== 'reveal') {
		return;
	}

	state.current += 1;
	state.phase = state.current >= state.mode ? 'done' : 'pass';
	save(state);
	AwaitUI.haptic('light');
}

function redeal() {
	const state = getState();
	state.seats = shuffled(state.mode);
	state.current = 0;
	state.phase = 'pass';
	save(state);
	AwaitUI.haptic('medium');
}

function newTable() {
	save(freshState());
}

function PillButton({label, intent, tone, size}: {label: string; intent: IntentInfo; tone: 'gold' | 'ghost'; size: number}) {
	return (
		<Button intent={intent} buttonStyle='borderless'>
			<Text
				value={label}
				fontSize={size}
				fontWeight={800}
				kerning={1}
				foreground={tone === 'gold' ? colors.deep : colors.gold}
				padding={{vertical: size * 0.55, horizontal: size * 1.2}}
				background={tone === 'gold' ? colors.gold : undefined}
				cornerRadius={size * 1.1}
			/>
		</Button>
	);
}

function SlipCard({width, height}: {width: number; height: number}) {
	return (
		<ZStack frame={{width, height}}>
			<RoundedRectangle
				rectRadius={Math.min(width, height) * 0.14}
				fill={{
					gradient: 'linear',
					colors: [colors.burgundy, colors.slip],
					startPoint: 'top',
					endPoint: 'bottom',
				}}
				stroke={{color: colors.gold, lineWidth: 1}}
			/>
			<Text value='?' fontSize={height * 0.5} fontWeight={700} fontDesign='serif' foreground={colors.gold}/>
		</ZStack>
	);
}

function ChooseScreen({scale}: {scale: number}) {
	return (
		<VStack spacing={10 * scale} alignment='center'>
			<Text value='A GAME OF SLIPS' fontSize={9 * scale} fontWeight={700} kerning={3} foreground={colors.gold}/>
			<Text value='CHOR-CHITTHI' fontSize={26 * scale} fontWeight={700} fontDesign='serif' foreground={colors.ivory}/>
			<HStack spacing={10 * scale} padding={{top: 4 * scale}}>
				<PillButton label='4 PLAYERS' intent={app.choose(4)} tone='gold' size={12 * scale}/>
				<PillButton label='6 PLAYERS' intent={app.choose(6)} tone='ghost' size={12 * scale}/>
			</HStack>
		</VStack>
	);
}

function PassScreen({state, scale, w, h}: {state: GameState; scale: number; w: number; h: number}) {
	return (
		<HStack spacing={14 * scale} alignment='center'>
			<VStack spacing={6 * scale} alignment='leading'>
				<Text value='PASS THE PHONE TO' fontSize={9 * scale} fontWeight={700} kerning={2} foreground={colors.dim}/>
				<Text
					value={'SEAT ' + (state.current + 1)}
					fontSize={30 * scale}
					fontWeight={700}
					fontDesign='serif'
					foreground={colors.ivory}
				/>
				<Text value={'of ' + state.mode + ' players'} fontSize={10 * scale} fontDesign='serif' foreground={colors.dim}/>
			</VStack>
			<Button intent={app.reveal()} buttonStyle='borderless'>
				<VStack spacing={6 * scale} alignment='center'>
					<SlipCard width={Math.min(w * 0.3, 84 * scale)} height={Math.min(h * 0.62, 108 * scale)}/>
					<Text value='TAP TO DRAW' fontSize={9 * scale} fontWeight={800} kerning={2} foreground={colors.gold}/>
				</VStack>
			</Button>
		</HStack>
	);
}

function RevealScreen({state, scale}: {state: GameState; scale: number}) {
	const role = ROLES[state.mode][state.seats[state.current]] ?? {name: 'CHOR', blurb: ''};
	return (
		<VStack spacing={7 * scale} alignment='center'>
			<Text value='YOUR CHITTHI' fontSize={9 * scale} fontWeight={700} kerning={3} foreground={colors.gold}/>
			<Text
				value={role.name}
				fontSize={role.name.length > 8 ? 22 * scale : 30 * scale}
				fontWeight={700}
				fontDesign='serif'
				foreground={colors.ivory}
				lineLimit={1}
				minimumScaleFactor={0.5}
			/>
			<Text value={role.blurb} fontSize={11 * scale} fontDesign='serif' foreground={colors.dim}/>
			<Text value='ONLY YOU SHOULD SEE THIS' fontSize={8 * scale} fontWeight={700} kerning={2} foreground={colors.scarlet}/>
			<PillButton label='HIDE & PASS' intent={app.hide()} tone='gold' size={12 * scale}/>
		</VStack>
	);
}

function DoneScreen({state, scale}: {state: GameState; scale: number}) {
	return (
		<VStack spacing={8 * scale} alignment='center'>
			<Text value='ALL CHITTHIS DEALT' fontSize={20 * scale} fontWeight={700} fontDesign='serif' foreground={colors.ivory}/>
			<Text value='Wazir, name the Chor.' fontSize={11 * scale} fontDesign='serif' foreground={colors.dim}/>
			<HStack spacing={10 * scale} padding={{top: 4 * scale}}>
				<PillButton label='DEAL AGAIN' intent={app.redeal()} tone='gold' size={12 * scale}/>
				<PillButton label='NEW TABLE' intent={app.newTable()} tone='ghost' size={12 * scale}/>
			</HStack>
		</VStack>
	);
}

function widget(entry: WidgetEntry<EntryData>) {
	const state = entry;
	const w = entry.size.width;
	const h = entry.size.height;
	const scale = Math.max(0.8, Math.min(w, h) / 170);
	return (
		<ZStack
			maxSides
			ignoresSafeArea
			background={{
				gradient: 'linear',
				colors: [colors.burgundy, colors.deep],
				startPoint: 'top',
				endPoint: 'bottom',
			}}
		>
			<ZStack maxSides alignment='center' padding={12}>
				{state.phase === 'choose' ? <ChooseScreen scale={scale}/> : undefined}
				{state.phase === 'pass' ? <PassScreen state={state} scale={scale} w={w} h={h}/> : undefined}
				{state.phase === 'reveal' ? <RevealScreen state={state} scale={scale}/> : undefined}
				{state.phase === 'done' ? <DoneScreen state={state} scale={scale}/> : undefined}
			</ZStack>
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
	widgetIntents: {choose, reveal, hide, redeal, newTable},
});
