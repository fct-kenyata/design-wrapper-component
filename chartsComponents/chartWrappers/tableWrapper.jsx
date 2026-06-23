import React, { useMemo } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { cn } from '../../lib/utils';

/**
 * TableWrapper — auto-columned data table. Rebuilt on the shadcn Table
 * primitives + tokens. Public API unchanged: { data, columns, rowNameField,
 * rowNameLabel, rowKeyField, height, isLoading, noDataComponent, stickyHeader,
 * valueFormatter, onRowClick }. Custom column.render is still honored.
 */

const toLabel = (value) => String(value || '')
	.replace(/([a-z])([A-Z])/g, '$1 $2')
	.replace(/[_-]+/g, ' ')
	.replace(/\s+/g, ' ')
	.trim()
	.replace(/^./, (char) => char.toUpperCase());

const defaultFormatValue = (value) => {
	if (value === null || value === undefined || value === '') return '-';
	if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString() : '-';
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	return String(value);
};

export default function TableWrapper({
	data = [],
	columns = null,
	rowNameField = 'name',
	rowNameLabel = 'Name',
	rowKeyField = null,
	height = 400,
	isLoading = false,
	noDataComponent = 'No data available',
	stickyHeader = true,
	valueFormatter = defaultFormatValue,
	onRowClick,
}) {
	const rows = Array.isArray(data) ? data : [];

	const resolvedColumns = useMemo(() => {
		if (Array.isArray(columns) && columns.length > 0) {
			return columns;
		}

		const firstRow = rows.find((row) => row && typeof row === 'object');
		const keys = firstRow ? Object.keys(firstRow) : [];

		if (!keys.length) {
			return [{ key: rowNameField, label: rowNameLabel, isRowName: true }];
		}

		return keys.map((key) => ({
			key,
			label: key === rowNameField ? rowNameLabel : toLabel(key),
			isRowName: key === rowNameField,
			align: 'left',
		}));
	}, [columns, rows, rowNameField, rowNameLabel]);

	const resolvedHeight = typeof height === 'number' ? `${height}px` : (height || '400px');

	if (isLoading) {
		return (
			<div className="flex items-center justify-center text-sm text-muted-foreground" style={{ minHeight: resolvedHeight }}>
				Loading...
			</div>
		);
	}

	if (!rows.length) {
		return (
			<div className="flex items-center justify-center text-sm text-muted-foreground" style={{ minHeight: resolvedHeight }}>
				{noDataComponent}
			</div>
		);
	}

	const clickable = typeof onRowClick === 'function';

	return (
		<div className="w-full overflow-auto rounded-lg border border-border bg-card" style={{ height: resolvedHeight }}>
			<Table>
				<TableHeader className={cn(stickyHeader && 'sticky top-0 z-[2] bg-card')}>
					<TableRow>
						{resolvedColumns.map((column) => (
							<TableHead
								key={`header-${column.key}`}
								style={{ textAlign: column.align || 'left' }}
								className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								{column.label || toLabel(column.key)}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row, rowIndex) => {
						const baseRowKey = rowKeyField
							? row?.[rowKeyField]
							: (row?.id ?? row?.ticketNumber ?? row?.ruleId ?? row?.[rowNameField] ?? 'row');
						const resolvedRowKey = `${String(baseRowKey)}-${rowIndex}`;

						return (
							<TableRow
								key={resolvedRowKey}
								onClick={clickable ? () => onRowClick(row, rowIndex) : undefined}
								className={cn(clickable && 'cursor-pointer')}
							>
								{resolvedColumns.map((column) => {
									const rawValue = row?.[column.key];
									const renderedValue = typeof column.render === 'function'
										? column.render(rawValue, row, rowIndex)
										: valueFormatter(rawValue, column.key, row, rowIndex);

									return (
										<TableCell
											key={`cell-${resolvedRowKey}-${column.key}`}
											style={{ textAlign: column.align || 'left' }}
											className={column.isRowName ? 'font-medium text-foreground' : 'text-muted-foreground'}
										>
											{renderedValue}
										</TableCell>
									);
								})}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
