# reCAPTCHA Enterprise Application Summary

This document summarizes the functionality of the `index.html` (Vue.js frontend) and `recaptcha-express-backend.js` (Node.js/Express backend) files.

## 🔒 Application Architecture

The application implements an advanced, two-factor reCAPTCHA Enterprise flow:

1. **Invisible Score Check (v3)**: First, it invisibly assesses the user's risk
2. **Visible Challenge (v2)**: If the risk is high (score is low), it presents a visible "I'm not a robot" challenge

## 🎨 Frontend (`index.html`)

The frontend is a single-page application built with **Vue.js** and styled with **Tailwind CSS**.

### Key Features

- **Dual API Loading**: Loads both the reCAPTCHA Enterprise (v3) API and the v2 Checkbox API simultaneously
- **Test Key**: Configured to use the "ns-anag-test-key-low-score" (`6Ldh...gmFw`), which forces a low score for testing
- **Dynamic UI**: 
  - Shows a standard login form (username/password)
  - Hides the v2 "I'm not a robot" checkbox by default
- **Raw Response**: Displays the full, raw JSON response from the backend in a `<pre>` block for easy debugging

### Application Flow

1. **Initial Login**: When the user first clicks "Login", the app calls `handleV3Login()`
2. **v3 Assessment**: This function gets an invisible v3 token and sends it to the backend's `/login-v3` endpoint
3. **Response Handling**: It then waits for the backend's response:
   - **200 OK (High Score)**: The user is considered legitimate, and a success message is shown
   - **401 Unauthorized (Low Score)**: The app receives a `challengeRequired: true` flag. It then makes the "I'm not a robot" checkbox visible by calling `renderV2Challenge()`
4. **v2 Challenge**: After the user checks the box, they click "Login" again
5. **v2 Verification**: This time, the app calls `handleV2Login()`, which sends the v2 challenge token to the backend's `/login-v2` endpoint to be verified

## ⚙️ Backend (`recaptcha-express-backend.js`)

The backend is a **Node.js/Express** server that handles all the secure verification.

### Key Features

- **Dual Endpoints**: Exposes two distinct API endpoints to match the frontend's logic
- **Centralized API**: Uses the modern Enterprise assessments API for both v3 score and v2 challenge verification
- **User Data**: Captures the user's User-Agent and IP Address (correctly parsing `x-forwarded-for`) and sends them to Google for more accurate assessments
- **Score Threshold**: Defines a `SCORE_THRESHOLD` (set to 0.5)

### API Endpoints

#### `POST /login-v3` (Score Assessment)

- **Purpose**: Receives the v3 token for invisible score assessment
- **Process**:
  1. Creates an assessment using the `V3_SITE_KEY` (`6Ldh...gmFw`)
  2. Checks the `riskAnalysis.score` from Google
- **Response Logic**:
  - **score >= 0.5**: Returns `200 OK` success response
  - **score < 0.5**: Returns `401 Unauthorized` response to trigger the v2 challenge on the frontend

#### `POST /login-v2` (Challenge Verification)

- **Purpose**: Receives the v2 token (from the checkbox) for challenge verification
- **Process**:
  1. Creates an assessment using the `V2_CHALLENGE_SITE_KEY` (`6Ldo...igN0`)
  2. Checks the `tokenProperties.valid` boolean from Google
- **Response Logic**:
  - **valid: true**: Returns `200 OK` success response
  - **valid: false**: Returns `400 Bad Request` error

## 🔄 Complete Flow Diagram

```
User submits login
        ↓
   handleV3Login()
        ↓
 POST /login-v3 (invisible)
        ↓
   Score >= 0.5?
    ↙        ↘
  YES        NO
   ↓          ↓
Success   Show v2 Challenge
          ("I'm not a robot")
               ↓
          User checks box
               ↓
          handleV2Login()
               ↓
          POST /login-v2
               ↓
           Valid token?
            ↙      ↘
          YES      NO
           ↓        ↓
        Success   Error
```

## 🎯 Testing Configuration

- **Test Key**: Uses `ns-anag-test-key-low-score` to force low scores for testing the complete flow
- **Score Threshold**: Set to `0.5` for demonstration purposes
- **Dual Site Keys**: Separate keys for v3 score assessment and v2 challenge verification