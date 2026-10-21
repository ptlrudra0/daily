import {Button, Color, HStack, Image, Link, RoundedRectangle, Text, VStack, ZStack} from 'await';

// PHOTO DARE - daily pose challenge widget
// Tap the silhouette (or TAKE PHOTO) -> opens the PhotoDare shortcut
// which runs the camera, previews the shot and saves it to Drive > Arcade.
// The widget shows your latest shot once the Drive sync is on.

const BASE = 'https://ptlrudra0.github.io/daily/photo-dare/';
const SHORTCUT_URL = 'shortcuts://run-shortcut?name=PhotoDare';

const POSES = [
	{name: 'THE CHAMPION', img: 'pose-champion.png', hint: 'Arms up in a big V, own it', alt: 'Do 10 jumping jacks right now'},
	{name: 'SUPERHERO', img: 'pose-superhero.png', hint: 'Hands on hips, chest out', alt: 'Hold a plank for 20 seconds'},
	{name: 'STAR JUMP', img: 'pose-star.png', hint: 'Freeze mid-jump, arms and legs wide', alt: 'Do 5 real star jumps'},
	{name: 'THE DAB', img: 'pose-dab.png', hint: 'Classic dab, hold it', alt: 'Drink a full glass of water'},
	{name: 'THE THINKER', img: 'pose-thinker.png', hint: 'Hand on chin, deep thoughts', alt: 'Send a friend a genuine compliment'},
	{name: 'PEACE OUT', img: 'pose-peace.png', hint: 'Peace sign up, lean back', alt: 'Text someone you miss'},
	{name: 'TREE POSE', img: 'pose-tree.png', hint: 'One leg, palms together overhead', alt: 'Balance on one leg for 30 seconds'},
	{name: 'THE POINT', img: 'pose-point.png', hint: 'Point straight at the camera', alt: 'Say one goal for this week out loud'},
];

const NEON = '#39FF14';
const INK = '#0B0B10';
const CARD = '#15151D';

function dayIndex() {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
	return (day + AwaitStore.num('skip', 0)) % POSES.length;
}

function skip() {
	AwaitStore.set('skip', AwaitStore.num('skip', 0) + 1);
}

function today() {
	AwaitStore.set('skip', 0);
}

type EntryData = {
	photo: string;
	taken: string;
};

async function widgetTimeline(): Promise<Timeline<EntryData>> {
	let photo = '';
	let taken = '';
	try {
		const res = await AwaitNetwork.request(BASE + 'latest.json?ts=' + Date.now());
		if (res.code === 200) {
			const data = JSON.parse(res.data);
			if (data && data.photo) {
				photo = BASE + data.photo + '?ts=' + Date.now();
				taken = data.taken || '';
			}
		}
	} catch (e) {}
	return {
		entries: [{date: new Date(), photo, taken}],
		update: 'rapid',
	};
}

function poseCard(img: string, w: number, h: number) {
	return (
		<Link url={SHORTCUT_URL}>
			<Image url={BASE + 'poses/' + img} resizable aspectRatio='fill' frame={{width: w, height: h}} cornerRadius={14}/>
		</Link>
	);
}

function widget(entry: WidgetEntry<EntryData>) {
	const pose = POSES[dayIndex()];

	if (entry.family === 'small') {
		return (
			<ZStack maxSides background={INK}>
				<VStack spacing={6} maxSides padding={10}>
					<Text value='PHOTO DARE' fontSize={9} fontWeight={800} foreground={NEON} kerning={2}/>
					{poseCard(pose.img, 120, 108)}
					<Text value={pose.name} fontSize={11} fontWeight={700} foreground='white'/>
				</VStack>
			</ZStack>
		);
	}

	return (
		<HStack spacing={12} maxSides padding={12} background={INK}>
			{poseCard(pose.img, 108, 146)}
			<VStack spacing={5} frame={{maxWidth: 'max'}} alignment='leading'>
				<Text value='PHOTO DARE' fontSize={9} fontWeight={800} foreground={NEON} kerning={2}/>
				<Text value={pose.name} fontSize={16} fontWeight={900} foreground='white' lineLimit={1}/>
				<Text value={pose.hint} fontSize={10} foreground='#B9B9C7' lineLimit={2}/>
				<Text value={'No camera? ' + pose.alt} fontSize={9} foreground='#7C7C8C' lineLimit={2}/>
				<HStack spacing={8} padding={{top: 2}}>
					<Link url={SHORTCUT_URL}>
						<Text value='TAKE PHOTO' fontSize={10} fontWeight={800} foreground={INK}
							padding={{vertical: 6, horizontal: 12}} background={NEON} cornerRadius={20}/>
					</Link>
					<Button intent={app.skip()} buttonStyle='borderless'>
						<Text value='SKIP' fontSize={10} fontWeight={700} foreground='#B9B9C7'/>
					</Button>
				</HStack>
				{entry.photo ? (
					<HStack spacing={6} padding={{top: 3}}>
						<Image url={entry.photo} resizable aspectRatio='fill' frame={{width: 30, height: 30}} cornerRadius={8}/>
						<Text value={'LAST SHOT' + (entry.taken ? ' · ' + entry.taken : '')} fontSize={8} fontWeight={600} foreground='#7C7C8C'/>
					</HStack>
				) : (
					<Text value='Tap the pose to shoot it' fontSize={8} foreground='#5A5A6A' padding={{top: 3}}/>
				)}
			</VStack>
		</HStack>
	);
}

const app = Await.define({
	widget,
	widgetTimeline,
	widgetFamilies: ['small', 'medium'],
	widgetIntents: {skip, today},
});
