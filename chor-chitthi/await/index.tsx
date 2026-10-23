import {
	Button,
	RoundedRectangle,
	Text,
	VStack,
	ZStack,
} from 'await';

// CHOR-CHITTHI launcher. A Home Screen widget cannot hold the game, so this
// widget is a lightweight card that opens the full-screen game.
// Tap anywhere on the card to open the game.
const GAME_URL = 'https://ptlrudra0.github.io/daily/chor-chitthi/';

const colors = {
	burgundy: '#4A0E1C',
	deep: '#2A0710',
	ivory: '#F3EAD8',
	gold: '#D6B673',
	dim: '#B9A98F',
};

function widget({size}: {size: Size}) {
	const w = size.width;
	const h = size.height;
	return (
		<Button url={GAME_URL} buttonStyle='borderless'>
			<ZStack frame={{width: w, height: h}}>
				<RoundedRectangle
					rectRadius={22}
					fill={{
						gradient: 'linear',
						colors: [colors.burgundy, colors.deep],
						startPoint: 'top',
						endPoint: 'bottom',
					}}
					stroke={{color: colors.gold, lineWidth: 1}}
				/>
				<VStack spacing={6} frame={{width: w - 28, height: h - 28}}>
					<Text value='A GAME OF SLIPS' fontSize={10} fontWeight={600} foreground={colors.gold}/>
					<Text value='CHOR-CHITTHI' fontSize={Math.min(26, w / 8)} fontWeight={700} fontDesign='serif' foreground={colors.ivory}/>
					<Text value='Trust nobody. Catch the Chor.' fontSize={12} fontDesign='serif' foreground={colors.dim}/>
					<Text value='PLAY  ›' fontSize={14} fontWeight={700} foreground={colors.gold}/>
				</VStack>
			</ZStack>
		</Button>
	);
}

const app = Await.define({
	widget,
});
