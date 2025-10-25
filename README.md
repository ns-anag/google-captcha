# Google reCAPTCHA Enterprise Demo

A Vue.js frontend with Express.js backend that demonstrates Google reCAPTCHA Enterprise score-based authentication for login forms.

## Configuration

### 1. Google Cloud Setup

1. **Enable reCAPTCHA Enterprise API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Library
   - Search for "reCAPTCHA Enterprise API" and enable it

2. **Create API Key:**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > API Key
   - Copy the API key

3. **Create reCAPTCHA Site Key:**
   - Go to reCAPTCHA Enterprise > Create Key
   - Choose "Score-based (Website)"
   - Add your domains (include `localhost` for development)
   - Copy the site key

4. **Configure the application:**
   - Edit `recaptcha-express-backend.js` and update:
     ```javascript
     const GC_PROJECT_ID = "your-project-id";
     const GC_API_KEY = "your-api-key";
     ```
   - Edit `index.html` and update:
     ```javascript
     const ENTERPRISE_SITE_KEY = "your-site-key";
     ```

## Cloud Run Deployment

1. **Build and push the Docker image:**
   ```bash
   # Configure Docker authentication
   gcloud auth configure-docker us-west1-docker.pkg.dev
   
   # Build for Cloud Run (linux/amd64)
   docker build --platform linux/amd64 -t us-west1-docker.pkg.dev/rbi-dev-qe/anag-docker-images/google-captcha:latest .
   
   # Push to Artifact Registry
   docker push us-west1-docker.pkg.dev/rbi-dev-qe/anag-docker-images/google-captcha:latest
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy google-captcha \
     --image docker push us-west1-docker.pkg.dev/rbi-dev-qe/anag-docker-images/google-captcha:latest \
     --platform managed \
     --region us-west1 \
     --allow-unauthenticated \
     --port 3000
   ```

3. **Update reCAPTCHA domain configuration:**
   - Add your Cloud Run service URL to the reCAPTCHA site key domains in Google Cloud Console