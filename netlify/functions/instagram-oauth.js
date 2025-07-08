// netlify/functions/instagram-oauth.js
// Handles Instagram OAuth token exchange for PostMyStyle.ai

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { code, mediaSendId } = JSON.parse(event.body);

    if (!code) {
      throw new Error('Authorization code is required');
    }

    console.log('🔧 Processing Instagram OAuth for PostMyStyle.ai');
    console.log('📝 Media Send ID:', mediaSendId);

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,           // Your: 1690627741578566
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,   // Your Facebook App Secret
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,     // Your: https://landing.postmystyle.ai/instagram-callback
        code: code
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Instagram token exchange failed:', errorData);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Instagram OAuth successful');

    // Return the access token
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: tokenData.access_token,
        user_id: tokenData.user_id,
        success: true
      })
    };

  } catch (error) {
    console.error('❌ Instagram OAuth error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message || 'OAuth exchange failed',
        success: false
      })
    };
  }
};