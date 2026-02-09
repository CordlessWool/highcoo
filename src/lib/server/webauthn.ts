import { env } from '$env/dynamic/private';

export const rpName = 'highcoo';
export const rpID = env.RP_ID ?? 'localhost';
export const origin = env.ORIGIN ?? `http://${rpID}:5173`;
