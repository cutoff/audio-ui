export async function GET() {
    return new Response(`User-agent: *
Disallow: /`, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
