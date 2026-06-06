import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import './lib/server/env'; // Triggers Zod validation at startup

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Add secure headers
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

	// Content-Security-Policy (CSP) configuration
	// In development, we permit 'unsafe-eval' and ws/wss for Vite's hot module replacement (HMR).
	const csp = dev
		? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss: https:;"
		: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;";

	response.headers.set('Content-Security-Policy', csp);

	return response;
};
