# Google reCAPTCHA Enterprise Demo# Getting Started with Create React App



A complete implementation of Google reCAPTCHA Enterprise with a Vue.js frontend and Express.js backend, demonstrating score-based authentication for login forms.This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



## 🚀 Features## Available Scripts



- **Vue.js 3** frontend with CDN-based setupIn the project directory, you can run:

- **Tailwind CSS** for modern, responsive styling

- **Google reCAPTCHA Enterprise** integration with score-based verification### `npm start`

- **Express.js** backend server for token validation

- **Real-time score display** showing reCAPTCHA assessment resultsRuns the app in the development mode.\

- **Comprehensive error handling** with user-friendly messagesOpen [http://localhost:3000](http://localhost:3000) to view it in the browser.

- **Raw response viewer** for debugging and transparency

The page will reload if you make edits.\

## 📋 PrerequisitesYou will also see any lint errors in the console.



Before running this project, you need:### `npm test`



1. **Google Cloud Account** with billing enabledLaunches the test runner in the interactive watch mode.\

2. **reCAPTCHA Enterprise API** enabled in Google Cloud ConsoleSee the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

3. **API Key** created in Google Cloud Console

4. **Site Key** configured for reCAPTCHA Enterprise### `npm run build`

5. **Node.js** (v14 or higher) installed on your system

Builds the app for production to the `build` folder.\

## 🛠️ Setup InstructionsIt correctly bundles React in production mode and optimizes the build for the best performance.



### 1. Google Cloud ConfigurationThe build is minified and the filenames include the hashes.\

Your app is ready to be deployed!

1. **Enable reCAPTCHA Enterprise API:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

   - Navigate to APIs & Services > Library

   - Search for "reCAPTCHA Enterprise API" and enable it### `npm run eject`



2. **Create API Key:****Note: this is a one-way operation. Once you `eject`, you can’t go back!**

   - Go to APIs & Services > Credentials

   - Click "Create Credentials" > API KeyIf you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

   - Copy the API key for backend configuration

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

3. **Create Site Key:**

   - Go to reCAPTCHA Enterprise > Create KeyYou don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

   - Choose "Score-based (Website)"

   - Add your domain(s) including `localhost` for development## Learn More

   - Copy the site key for frontend configuration

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

### 2. Project Configuration

To learn React, check out the [React documentation](https://reactjs.org/).

1. **Clone or download the project:**
   ```bash
   cd google-captcha
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the backend:**
   Edit `recaptcha-express-backend.js` and update:
   ```javascript
   const GC_PROJECT_ID = "your-project-id"; // Your Google Cloud Project ID
   const GC_API_KEY = "your-api-key"; // Your Google Cloud API Key
   ```

4. **Configure the frontend:**
   Edit `index.html` and update the site key:
   ```javascript
   const ENTERPRISE_SITE_KEY = "your-site-key";
   ```
   
   Also update the script tag:
   ```html
   <script src="https://www.google.com/recaptcha/enterprise.js?render=your-site-key&onload=onRecaptchaLoad"></script>
   ```

## 🚀 Running the Application

### Start the Backend Server

```bash
node recaptcha-express-backend.js
```

The server will start on `http://localhost:3000`

### Open the Frontend

Simply open `index.html` in your web browser, or serve it using a local server:

```bash
# Using Python (if installed)
python3 -m http.server 8000

# Using Node.js http-server (install globally first)
npm install -g http-server
http-server

# Or just open the file directly
open index.html
```

## 📁 Project Structure

```
google-captcha/
├── index.html                      # Vue.js frontend application
├── recaptcha-express-backend.js    # Express.js backend server
├── package.json                    # Node.js dependencies
├── package-lock.json              # Dependency lock file
├── node_modules/                   # Installed packages
└── README.md                       # This file
```

## 🏗️ Architecture

### Frontend (`index.html`)
- **Vue.js 3** with Composition API
- **Tailwind CSS** for styling with responsive design
- **reCAPTCHA Enterprise** score-based integration
- **Form handling** with real-time validation
- **Response display** showing raw backend data

### Backend (`recaptcha-express-backend.js`)
- **Express.js** server with CORS enabled
- **reCAPTCHA Enterprise API** integration
- **Token validation** and score assessment
- **User context** extraction (IP, User-Agent)
- **Comprehensive error handling**

## 🔧 Configuration Details

### Current Configuration

- **Site Key:** `6LfA2PUrAAAAAHpAiEqVIjx75by751WRkBxiyhRK`
- **Project ID:** `rbi-dev-qe`
- **API Key:** `AIzaSyBRgJiwVF518s6BvhjCqiPssflTBG-DEBA`
- **Action:** `login`
- **Expected Domain:** `localhost` (configured for development)

### Environment Variables

For production, consider using environment variables:

```javascript
const GC_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "rbi-dev-qe";
const GC_API_KEY = process.env.GOOGLE_CLOUD_API_KEY || "your-api-key";
```

## 🎯 How It Works

1. **User Interaction:** User fills out the login form
2. **reCAPTCHA Execution:** Vue.js triggers reCAPTCHA Enterprise assessment
3. **Token Generation:** Google generates a token based on user behavior
4. **Backend Validation:** Express server validates token with Google's API
5. **Score Assessment:** Google returns a risk score (0.0 to 1.0)
6. **Response Display:** Frontend shows the assessment results

### Score Interpretation

- **0.9 - 1.0:** Very likely a legitimate user
- **0.7 - 0.9:** Likely legitimate, but monitor
- **0.3 - 0.7:** Suspicious, may require additional verification
- **0.0 - 0.3:** Very likely a bot

## 🔍 API Endpoints

### POST `/login`

Validates user credentials and reCAPTCHA token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "token": "reCAPTCHA-token-here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful! Welcome, user@example.com.",
  "score": 0.9,
  "fullResponse": {
    "tokenProperties": { ... },
    "riskAnalysis": { ... }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "reCAPTCHA verification failed. Reason: INVALID_REASON.",
  "fullResponse": { ... }
}
```

## 🛠️ Dependencies

### Backend Dependencies
- **express** (^5.1.0): Web application framework
- **cors** (^2.8.5): Cross-Origin Resource Sharing middleware
- **node-fetch** (^2.7.0): HTTP client for API requests

### Frontend Dependencies (CDN)
- **Vue.js 3**: Reactive frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements
- **Google reCAPTCHA Enterprise**: Bot protection service

## 🚨 Troubleshooting

### Common Issues

1. **"reCAPTCHA Enterprise script did not load"**
   - Check your site key in the script tag
   - Ensure the domain is added to your reCAPTCHA configuration
   - Verify internet connection

2. **400 Bad Request from backend**
   - Verify your Google Cloud API key
   - Check that reCAPTCHA Enterprise API is enabled
   - Ensure the project ID is correct

3. **CORS errors**
   - Backend includes CORS middleware for development
   - For production, configure specific origins

4. **Invalid token errors**
   - Site key mismatch between frontend and backend
   - Token expired (tokens are single-use)
   - Domain not configured in reCAPTCHA settings

### Debugging Steps

1. **Check browser console** for JavaScript errors
2. **Verify network requests** in browser developer tools
3. **Check backend logs** for detailed error messages
4. **Test with different browsers** to isolate issues

## 📚 Additional Resources

- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Vue.js 3 Documentation](https://vuejs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🔒 Security Considerations

1. **Never expose API keys** in frontend code
2. **Use HTTPS** in production
3. **Implement rate limiting** on backend endpoints
4. **Validate all user inputs** server-side
5. **Set appropriate CORS policies** for production
6. **Monitor reCAPTCHA scores** and adjust thresholds as needed

## 📝 License

This project is for demonstration purposes. Please ensure compliance with Google's terms of service when using reCAPTCHA Enterprise in production applications.