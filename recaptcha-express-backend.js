/*
    This is your Express.js backend server.
*/

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // For allowing cross-origin requests

// --- Configuration ---
// !! ========================================================== !!
// !! v3 Enterprise Keys ("ns-anag-test-key-low-score")
// !! ========================================================== !!
const GC_PROJECT_ID = "rbi-dev-qe"; // Your Google Cloud Project ID
const GC_API_KEY = "AIzaSyBRgJiwVF518s6BvhjCqiPssflTBG-DEBA"; // Your Google Cloud API Key
const V3_SITE_KEY = "6LfA2PUrAAAAAHpAiEqVIjx75by751WRkBxiyhRK"; // ns-anag-demo
// const V3_SITE_KEY = "6LdhgPYrAAAAAM4tChgopVnOuKjHx18tXneXgmFw"; // ns-anag-test-key-low-score
// !! ========================================================== !!

// !! ========================================================== !!
// !! v2 Challenge Enterprise Keys ("ns-anag-demo-challenge")
// !! ========================================================== !!
const V2_CHALLENGE_SITE_KEY = "6Ldo3fUrAAAAAAAYjyoy8oEVaT_CU8z41OMVigN0";


// Set the score threshold. Any score BELOW this will require a v2 challenge.
const SCORE_THRESHOLD = 0.5;


const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({ origin: '*' }));
app.use(express.json());
app.set('trust proxy', true);

// Serve index.html at root first, before static middleware
app.get('/', (req, res) => {
    // This assumes index.html is in the same directory as the script
    res.sendFile(__dirname + '/index.html');
});

// Serve static files from the public directory for other assets
// If you have a 'public' folder, create it and put assets there.
// app.use(express.static('public'));


// --- Routes ---

/*
 * @route   POST /login-v3
 * @desc    Handles the initial invisible v3 score assessment
 * @access  Public
 */
app.post('/login-v3', async (req, res) => {
    try {
        const { username, password, token } = req.body;
        const userAgent = req.headers['user-agent'];
        const xForwardedFor = req.headers['x-forwarded-for'];
        
        let userIpAddress;
        if (xForwardedFor) {
            userIpAddress = xForwardedFor.split(',')[0].trim();
        } else {
            userIpAddress = req.ip;
        }

        console.log(`[v3] Login attempt for user: ${username}`);
        console.log(` > User IP: ${userIpAddress}`);

        if (!token) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA v3 token is missing.' });
        }

        const assessmentUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${GC_PROJECT_ID}/assessments?key=${GC_API_KEY}`;
        const assessmentBody = {
            event: {
                token: token,
                siteKey: V3_SITE_KEY, // Use the v3 site key
                expectedAction: "login",
                userAgent: userAgent,
                userIpAddress: userIpAddress,
                requestedUri: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        };

        const googleResponse = await fetch(assessmentUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessmentBody)
        });

        const assessmentData = await googleResponse.json();
        console.log("[v3] Google Assessment Response:", JSON.stringify(assessmentData, null, 2));

        if (assessmentData.error) {
            console.error('[v3] reCAPTCHA API Error:', assessmentData.error.message);
            return res.status(400).json({
                success: false,
                message: `reCAPTCHA Enterprise API Error: ${assessmentData.error.message}`,
                fullResponse: assessmentData
            });
        }

        const { tokenProperties, riskAnalysis } = assessmentData;
        const score = riskAnalysis.score;

        if (tokenProperties.valid && tokenProperties.action === 'login') {
            
            // Check the score against our threshold
            if (score >= SCORE_THRESHOLD) {
                // HIGH SCORE: Success!
                console.log(`[v3] High score: ${score}. Login successful.`);
                return res.status(200).json({
                    success: true,
                    message: `Login successful! Welcome, ${username}.`,
                    score: score,
                    fullResponse: assessmentData
                });
            } else {
                // LOW SCORE: Require challenge
                console.log(`[v3] Low score: ${score}. Requiring v2 challenge.`);
                return res.status(401).json({
                    success: false,
                    challengeRequired: true,
                    message: 'Low score detected. Please complete the CAPTCHA challenge.',
                    score: score,
                    fullResponse: assessmentData
                });
            }

        } else {
            // Token was invalid
            console.log("[v3] Token was invalid or action mismatch.");
            return res.status(400).json({
                success: false,
                message: `reCAPTCHA verification failed. Reason: ${tokenProperties.invalidReason || 'Action mismatch'}.`,
                fullResponse: assessmentData
            });
        }

    } catch (error) {
        console.error('[v3] Server error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


/*
 * @route   POST /login-v2
 * @desc    Handles the v2 checkbox challenge verification
 * --- NOW USING THE ENTERPRISE 'ASSESSMENTS' API ---
 * @access  Public
 */
app.post('/login-v2', async (req, res) => {
    try {
        const { username, password, token } = req.body;
        const userAgent = req.headers['user-agent'];
        const xForwardedFor = req.headers['x-forwarded-for'];
        
        let userIpAddress;
        if (xForwardedFor) {
            userIpAddress = xForwardedFor.split(',')[0].trim();
        } else {
            userIpAddress = req.ip;
        }
        
        console.log(`[v2-Enterprise] Challenge attempt for user: ${username}`);
        console.log(` > User IP: ${userIpAddress}`);

        if (!token) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA v2 token is missing.' });
        }
        
        // --- NEW: Use the Enterprise Assessments API for v2/challenge token ---
        const assessmentUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${GC_PROJECT_ID}/assessments?key=${GC_API_KEY}`;
        const assessmentBody = {
            event: {
                token: token,
                siteKey: V2_CHALLENGE_SITE_KEY, // Use the v2/challenge site key
                expectedAction: "login", // Action should still be login
                userAgent: userAgent,
                userIpAddress: userIpAddress,
                requestedUri: req.protocol + '://' + req.get('host') + req.originalUrl,
            }
        };

        const googleResponse = await fetch(assessmentUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessmentBody)
        });

        const assessmentData = await googleResponse.json();
        console.log("[v2-Enterprise] Google Assessment Response:", JSON.stringify(assessmentData, null, 2));

        // Check for API-level errors first
        if (assessmentData.error) {
            console.error('[v2-Enterprise] reCAPTCHA API Error:', assessmentData.error.message);
            return res.status(400).json({
                success: false,
                message: `reCAPTCHA Enterprise API Error: ${assessmentData.error.message}`,
                fullResponse: assessmentData
            });
        }

        // Now check if the token itself was valid
        if (assessmentData.tokenProperties.valid) {
            // V2 Challenge Passed!
            console.log("[v2-Enterprise] Challenge passed. Login successful.");
            
            // --- Your REAL Login Logic Here ---
            // You would check username/password against DB
            // ---
            
            return res.status(200).json({
                success: true,
                message: `Login successful! Challenge passed. Welcome, ${username}.`,
                fullResponse: assessmentData
            });
        } else {
            // V2 Challenge Failed
            console.log("[v2-Enterprise] Challenge failed.");
            return res.status(400).json({
                success: false,
                message: 'CAPTCHA verification failed. Please try again.',
                fullResponse: assessmentData
            });
        }

    } catch (error) {
        console.error('[v2-Enterprise] Server error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`reCAPTCHA backend server running on port ${PORT}`);
});

