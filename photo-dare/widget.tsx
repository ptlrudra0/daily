import {Button, HStack, Image, Link, Text, VStack, ZStack} from 'await';

// PHOTO DARE - daily weird-face challenge widget
// Tap the face (or TAKE PHOTO) -> opens the PhotoDare shortcut
// which runs the selfie camera, previews the shot and saves it to Drive > Arcade.
// Photos stay private in Drive; the widget never loads them.

const BASE = 'https://ptlrudra0.github.io/daily/photo-dare/';
const SHORTCUT_URL = 'shortcuts://run-shortcut?name=PhotoDare';

const FACES = [
	{name: 'GOOFBALL', img: 'face-crosseyed.png', hint: 'Go cross-eyed, tongue all the way out', alt: 'Do 10 jumping jacks right now'},
	{name: 'FISH FACE', img: 'face-fish.png', hint: 'Suck your cheeks in, pout like a fish', alt: 'Hold a plank for 20 seconds'},
	{name: 'WINK OUT', img: 'face-wink.png', hint: 'Hard wink, tongue out to the side', alt: 'Do 5 star jumps'},
	{name: 'DUCK LIPS', img: 'face-duck.png', hint: 'Push your lips as far out as they go', alt: 'Drink a full glass of water'},
	{name: 'THE SKEPTIC', img: 'face-skeptic.png', hint: 'One eyebrow up, totally unimpressed', alt: 'Send a friend a genuine compliment'},
	{name: 'CHEESE GRIN', img: 'face-grin.png', hint: 'Biggest grin, eyes squinted shut', alt: 'Text someone you miss'},
	{name: 'THE SNARL', img: 'face-snarl.png', hint: 'Curl one lip, wrinkle your nose', alt: 'Balance on one leg for 30 seconds'},
	{name: 'TOTAL SHOCK', img: 'face-shock.png', hint: 'Eyes wide, mouth a giant O', alt: 'Say one goal for this week out loud'},
];

const NEON = '#39FF14';
const INK = '#0B0B10';

function dayIndex() {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
	return (day + AwaitStore.num('skip', 0)) % FACES.length;
}

function skip() {
	AwaitStore.set('skip', AwaitStore.num('skip', 0) + 1);
}

function today() {
	AwaitStore.set('skip', 0);
}

function faceCard(img: string, w: number, h: number) {
	return (
		<Link url={SHORTCUT_URL}>
			<Image url={BASE + 'faces/' + img} resizable aspectRatio='fill' frame={{width: w, height: h}} cornerRadius={14}/>
		</Link>
	);
}

function widget(entry: WidgetEntry) {
	const face = FACES[dayIndex()];

	if (entry.family === 'small') {
		return (
			<ZStack maxSides background={INK}>
				<VStack spacing={6} maxSides padding={10}>
					<Text value='PHOTO DARE' fontSize={9} fontWeight={800} foreground={NEON} kerning={2}/>
					{faceCard(face.img, 120, 108)}
					<Text value={face.name} fontSize={11} fontWeight={700} foreground='white'/>
				</VStack>
			</ZStack>
		);
	}

	return (
		<HStack spacing={12} maxSides padding={12} background={INK}>
			{faceCard(face.img, 108, 146)}
			<VStack spacing={5} frame={{maxWidth: 'max'}} alignment='leading'>
				<Text value='PHOTO DARE' fontSize={9} fontWeight={800} foreground={NEON} kerning={2}/>
				<Text value={face.name} fontSize={16} fontWeight={900} foreground='white' lineLimit={1}/>
				<Text value={face.hint} fontSize={10} foreground='#B9B9C7' lineLimit={2}/>
				<Text value={'No camera? ' + face.alt} fontSize={9} foreground='#7C7C8C' lineLimit={2}/>
				<HStack spacing={8} padding={{top: 2}}>
					<Link url={SHORTCUT_URL}>
						<Text value='TAKE PHOTO' fontSize={10} fontWeight={800} foreground={INK}
							padding={{vertical: 6, horizontal: 12}} background={NEON} cornerRadius={20}/>
					</Link>
					<Button intent={app.skip()} buttonStyle='borderless'>
						<Text value='SKIP' fontSize={10} fontWeight={700} foreground='#B9B9C7'/>
					</Button>
				</HStack>
				<Text value='Photos save privately to Drive > Arcade' fontSize={8} foreground='#5A5A6A' padding={{top: 3}}/>
			</VStack>
		</HStack>
	);
}

const app = Await.define({
	widget,
	widgetFamilies: ['small', 'medium'],
	widgetIntents: {skip, today},
});
