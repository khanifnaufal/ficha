const FLAG_MAP: Record<string, string> = {
	// Europe
	england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
	scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
	wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
	'northern ireland': '🇬🇧',
	france: '🇫🇷',
	germany: '🇩🇪',
	spain: '🇪🇸',
	portugal: '🇵🇹',
	italy: '🇮🇹',
	netherlands: '🇳🇱',
	belgium: '🇧🇪',
	croatia: '🇭🇷',
	switzerland: '🇨🇭',
	denmark: '🇩🇰',
	norway: '🇳🇴',
	sweden: '🇸🇪',
	poland: '🇵🇱',
	austria: '🇦🇹',
	turkey: '🇹🇷',
	ukraine: '🇺🇦',
	russia: '🇷🇺',
	serbia: '🇷🇸',
	slovakia: '🇸🇰',
	slovenia: '🇸🇮',
	hungary: '🇭🇺',
	romania: '🇷🇴',
	greece: '🇬🇷',
	czechia: '🇨🇿',
	'czech republic': '🇨🇿',
	ireland: '🇮🇪',
	'republic of ireland': '🇮🇪',
	finland: '🇫🇮',
	iceland: '🇮🇸',

	// South America
	brazil: '🇧🇷',
	argentina: '🇦🇷',
	uruguay: '🇺🇾',
	colombia: '🇨🇴',
	chile: '🇨🇱',
	ecuador: '🇪🇨',
	peru: '🇵🇪',
	paraguay: '🇵🇾',
	venezuela: '🇻🇪',
	bolivia: '🇧🇴',

	// North/Central America
	usa: '🇺🇸',
	'united states': '🇺🇸',
	mexico: '🇲🇽',
	canada: '🇨🇦',
	jamaica: '🇯🇲',
	'costa rica': '🇨🇷',
	panama: '🇵🇦',
	honduras: '🇭🇳',
	'el salvador': '🇸🇻',

	// Africa
	senegal: '🇸🇳',
	morocco: '🇲🇦',
	algeria: '🇩🇿',
	tunisia: '🇹🇳',
	egypt: '🇪🇬',
	nigeria: '🇳🇬',
	cameroon: '🇨🇲',
	ghana: '🇬🇭',
	'ivory coast': '🇨🇮',
	"cote d'ivoire": '🇨🇮',
	mali: '🇲🇱',
	congo: '🇨🇬',
	'dr congo': '🇨🇩',
	'democratic republic of the congo': '🇨🇩',
	angola: '🇦🇴',
	guinea: '🇬🇳',
	burkina: '🇧🇫',
	'burkina faso': '🇧🇫',
	gabon: '🇬🇦',
	zambia: '🇿🇲',
	south: '🇿🇦',
	'south africa': '🇿🇦',

	// Asia/Oceania
	japan: '🇯🇵',
	'south korea': '🇰🇷',
	korea: '🇰🇷',
	australia: '🇦🇺',
	iran: '🇮🇷',
	'saudi arabia': '🇸🇦',
	qatar: '🇶🇦',
	china: '🇨🇳',
	'new zealand': '🇳🇿',
	uzbekistan: '🇺🇿',
	iraq: '🇮🇶',
	syria: '🇸🇾',
	uae: '🇦🇪',
	'united arab emirates': '🇦🇪'
};

/**
 * Converts country name (string) into emoji flag
 */
export function getFlagEmoji(nationality: string | null | undefined): string {
	if (!nationality) return '🏳️';
	const normalized = nationality.trim().toLowerCase();
	if (FLAG_MAP[normalized]) {
		return FLAG_MAP[normalized];
	}
	return '🏳️';
}
