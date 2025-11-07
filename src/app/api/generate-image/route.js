import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { prompt } = await request.json();
        
        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        console.log('Generating image for prompt:', prompt);

        // Try Cloudflare Worker first
        try {
            const cloudflareUrl = process.env.CLOUDFLARE_WORKER_URL;
            const apiKey = process.env.CLOUDFLARE_API_KEY;

            if (cloudflareUrl && apiKey) {
                console.log('Trying Cloudflare Worker:', cloudflareUrl);
                
                const response = await fetch(cloudflareUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'X-API-Key': apiKey
                    },
                    body: JSON.stringify({ prompt: prompt }),
                    timeout: 30000
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.imageUrl && !data.error) {
                        console.log('Cloudflare Worker success!');
                        return NextResponse.json(data);
                    }
                }
                
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.log('Cloudflare Worker failed:', errorData);
            }
        } catch (workerError) {
            console.log('Cloudflare Worker error:', workerError.message);
        }

        // Fallback to Pollinations API (free and reliable)
        try {
            console.log('Using Pollinations API as fallback...');
            
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}`;
            
            const response = await fetch(pollinationsUrl, {
                method: 'GET',
                timeout: 15000
            });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const imageUrl = `data:image/jpeg;base64,${base64}`;
                
                console.log('Pollinations API success!');
                
                return NextResponse.json({
                    success: true,
                    imageUrl: imageUrl,
                    message: 'Image generated successfully with Pollinations API',
                    provider: 'pollinations'
                });
            }
        } catch (pollinationsError) {
            console.log('Pollinations API failed:', pollinationsError.message);
        }

        // Final fallback: Enhanced placeholder
        console.log('All services failed, generating enhanced placeholder...');
        const placeholderImage = generateEnhancedPlaceholder(prompt);
        
        return NextResponse.json({
            success: true,
            imageUrl: placeholderImage,
            message: 'Generated enhanced placeholder (all AI services unavailable)',
            isPlaceholder: true
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}

// Generate enhanced placeholder with better graphics
function generateEnhancedPlaceholder(prompt) {
    const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140']
    ];
    const colorPair = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
        </defs>
        <rect width="1024" height="1024" fill="url(#grad1)" />
        
        <!-- Decorative circles -->
        <circle cx="200" cy="200" r="60" fill="rgba(255,255,255,0.1)" />
        <circle cx="824" cy="300" r="40" fill="rgba(255,255,255,0.15)" />
        <circle cx="150" cy="800" r="80" fill="rgba(255,255,255,0.08)" />
        <circle cx="900" cy="750" r="50" fill="rgba(255,255,255,0.12)" />
        
        <!-- Main content -->
        <rect x="100" y="150" width="824" height="600" rx="20" fill="rgba(255,255,255,0.1)" filter="url(#shadow)" />
        
        <text x="512" y="220" font-family="Arial, sans-serif" font-size="42" fill="white" text-anchor="middle" font-weight="bold">🎨 AI Image Generator</text>
        <text x="512" y="280" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.9)" text-anchor="middle">Generated Placeholder</text>
        
        <foreignObject x="120" y="320" width="784" height="300">
            <div xmlns="http://www.w3.org/1999/xhtml" style="
                color: white; 
                font-family: Arial, sans-serif; 
                font-size: 18px; 
                text-align: center; 
                padding: 30px;
                word-wrap: break-word;
                line-height: 1.6;
                background: rgba(0,0,0,0.2);
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.2);
            ">
                <strong style="font-size: 20px; display: block; margin-bottom: 15px;">Your Prompt:</strong>
                "${prompt.substring(0, 400)}${prompt.length > 400 ? '...' : ''}"
            </div>
        </foreignObject>
        
        <text x="512" y="700" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">✨ Configure Cloudflare Worker for AI Generation</text>
        <text x="512" y="730" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)" text-anchor="middle">Or use alternative AI services</text>
    </svg>`;
    
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}