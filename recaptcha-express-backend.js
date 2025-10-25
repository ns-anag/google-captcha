/*
    This is your Express.js backend server.
    It has been updated to send the User-Agent and User IP Address
    to the reCAPTCHA Enterprise API for a more accurate assessment.
*/

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // For allowing cross-origin requests

// --- Configuration ---
// !! ========================================================== !!
// !! Fill in your Google Cloud Project ID and API Key           !!
// !! ========================================================== !!
const GC_PROJECT_ID = "rbi-dev-qe"; // Your Google Cloud Project ID
const GC_API_KEY = "AIzaSyBRgJiwVF518s6BvhjCqiPssflTBG-DEBA"; // Your Google Cloud API Key (from APIs & Services > Credentials)
// !! ========================================================== !!

const app = express();
const PORT = 3000;

// --- Middleware ---
// 1. Enable CORS for all routes
app.use(cors({ origin: '*' })); // For development

// 2. Enable built-in JSON body parsing
app.use(express.json());

// 3. Trust the first proxy
// This is important for accurately getting the user's IP address
// if your server is behind a proxy (like Nginx or a load balancer).
app.set('trust proxy', true);


// --- Routes ---

/*
 * @route   POST /login
 * @desc    Handles user login and creates a reCAPTCHA assessment
 * @access  Public
 */
app.post('/login', async (req, res) => {
    try {
        // 1. Get data from the request body
        const { username, password, token } = req.body;
        
        // 2. NEW: Get User-Agent and IP Address from the request
        const userAgent = req.headers['user-agent'];
        
        // --- FIX FOR NGROK / PROXIES ---
        // Manually read the 'x-forwarded-for' header added by ngrok.
        // req.ip can be unreliable, this is more explicit.
        const userIpAddress = req.headers['x-forwarded-for'] || req.ip; 
        // --- END FIX ---

        console.log(`Login attempt for user: ${username}`);
        console.log(` > User IP: ${userIpAddress}`);
        console.log(` > User-Agent: ${userAgent}`);

        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: 'reCAPTCHA token is missing.' 
            });
        }

        // 3. Construct the Google reCAPTCHA Enterprise API URL
        const assessmentUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${GC_PROJECT_ID}/assessments?key=${GC_API_KEY}`;

        // 4. Construct the assessment request body
        const assessmentBody = {
            event: {
                token: token,
                siteKey: "6LfA2PUrAAAAAHpAiEqVIjx75by751WRkBxiyhRK", // Your reCAPTCHA Site Key
                expectedAction: "login",
                
                // NEW: Send the user agent and IP address for better analysis
                userAgent: userAgent,
                userIpAddress: userIpAddress
            }
        };

        // 5. Send the assessment request to Google
        const googleResponse = await fetch(assessmentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assessmentBody)
        });

        const assessmentData = await googleResponse.json();
        
        console.log("Google Assessment Response:", JSON.stringify(assessmentData, null, 2));

        // 6. Handle API errors (e.g., invalid API key)
        if (assessmentData.error) {
            console.error('reCAPTCHA Enterprise API Error:', assessmentData.error.message);
            return res.status(400).json({
                success: false,
                message: `reCAPTCHA Enterprise API Error: ${assessmentData.error.message}`,
                fullResponse: assessmentData
            });
        }

        // 7. Interpret the assessment
        const { tokenProperties, riskAnalysis } = assessmentData;

        // Check if the token is valid and the action matches
        if (tokenProperties.valid && tokenProperties.action === 'login') {
            
            // Token is valid! Now you can check the score.
            const score = riskAnalysis.score;
            
            // --- Your Login Logic Here ---
            // For this example, we'll just send a success message.
            // In a real app, you'd check the password and *also*
            // decide if the score is high enough (e.g., score > 0.7)
            // -------------------------------
            
            return res.status(200).json({
                success: true,
                message: `Login successful! Welcome, ${username}.`,
                score: score,
                fullResponse: assessmentData // Send the full response for debugging
            });

        } else {
            // Token was invalid or action didn't match
            return res.status(400).json({
                success: false,
                message: `reCAPTCHA verification failed. Reason: ${tokenProperties.invalidReason || 'Action mismatch'}.`,
                fullResponse: assessmentData
            });
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error.' 
        });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`reCAPTCHA backend server running on http://localhost:${PORT}`);
});

