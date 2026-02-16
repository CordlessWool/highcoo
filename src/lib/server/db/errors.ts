export class UniqueConstraintError extends Error {
	constraint: string | undefined;

	constructor(constraint?: string) {
		super('Unique constraint violation');
		this.name = 'UniqueConstraintError';
		this.constraint = constraint;
	}
}

export function isUniqueViolation(error: unknown): { constraint?: string } | null {
	const cause =
		error instanceof Error && error.cause && typeof error.cause === 'object'
			? error.cause
			: null;
	if (!cause || !('code' in cause) || cause.code !== '23505') return null;
	return {
		constraint: 'constraint_name' in cause ? String(cause.constraint_name) : undefined
	};
}
