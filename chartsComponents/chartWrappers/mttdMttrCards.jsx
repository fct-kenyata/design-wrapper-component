import React from 'react';
import { AlarmClock, RefreshCw, ClipboardList, Clock } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';

/**
 * MttdMttrCardsWrapper — grid of summary metric cards with a left accent rail
 * + icon/logo. Rebuilt on the shadcn Card primitive; accent color is
 * data-driven (card.color) so it stays inline. Public API unchanged.
 */

const ICON_MAP = {
	'alarm-clock': AlarmClock,
	refresh: RefreshCw,
	clipboard: ClipboardList,
	clock: Clock,
};

export default function MttdMttrCardsWrapper({
	cards = [],
	children = null,
	isLoading = false,
	loadingComponent = '',
	noDataComponent = 'No summary data available',
	columns,
	onCardClick,
}) {
	const hasCards = Array.isArray(cards) && cards.length > 0;

	if (isLoading) {
		return loadingComponent;
	}

	if (!hasCards) {
		return (
			<div className="flex min-h-[120px] items-center justify-center text-sm text-muted-foreground">
				{noDataComponent}
			</div>
		);
	}

	if (children) {
		return children;
	}

	const columnCount = columns || Math.min(cards.length, 3);

	return (
		<div
			className="grid gap-3"
			style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
		>
			{cards.map((card, index) => {
				const accentColor = card?.color || 'var(--primary)';
				const Icon = typeof card?.icon === 'string' ? ICON_MAP[card.icon] : (card?.Icon || card?.icon);
				const logo = card?.logo || card?.logoSrc;
				const subDataItems = Array.isArray(card?.subData)
					? card.subData
					: card?.subData
						? [card.subData]
						: card?.subtitle
							? [card.subtitle]
							: [];
				const clickable = Boolean(card?.clickable || card?.onClick || onCardClick);

				const handleClick = () => {
					if (typeof card?.onClick === 'function') return card.onClick(card);
					if (typeof onCardClick === 'function') onCardClick(card, index);
				};

				const tint = { backgroundColor: `color-mix(in oklab, ${accentColor} 18%, transparent)` };

				return (
					<Card
						key={card?.id || card?.label || index}
						onClick={clickable ? handleClick : undefined}
						style={{ borderLeft: `4px solid ${accentColor}` }}
						className={cn(
							'ring-0 flex-row items-center gap-3 border border-border py-4 pl-4 pr-4',
							clickable && 'cursor-pointer'
						)}
					>
						{logo ? (
							<div className="flex size-10 shrink-0 items-center justify-center rounded-md p-1" style={tint}>
								<img src={logo} alt={card?.label || card?.title || 'card logo'} className="size-full object-contain" />
							</div>
						) : Icon ? (
							<div className="flex size-10 shrink-0 items-center justify-center rounded-md" style={tint}>
								<Icon className="size-5" style={{ color: accentColor }} />
							</div>
						) : null}

						<div className="min-w-0">
							<div className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
								{card?.label || card?.title || '--'}
							</div>
							<div className="text-2xl font-bold leading-tight text-foreground">
								{card?.display ?? card?.value ?? '--'}
							</div>
							{subDataItems.length > 0 && (
								<div className="mt-1 space-y-0.5">
									{subDataItems.map((item, itemIndex) => (
										<div key={`${card?.id || index}-sub-${itemIndex}`} className="text-xs leading-snug text-muted-foreground">
											{item}
										</div>
									))}
								</div>
							)}
						</div>
					</Card>
				);
			})}
		</div>
	);
}
