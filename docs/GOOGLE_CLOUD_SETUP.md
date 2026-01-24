# ☁️ How to Get a Google Cloud API Key for Text-to-Speech

To enable the high-quality "Journey" neural voice for Aria, you need a Google Cloud API Key.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **"New Project"**.
3. Give it a name (e.g., "Voice Assistant") and click **Create**.

## 2. Enable the Text-to-Speech API
1. In the search bar at the top, type **"Cloud Text-to-Speech API"**.
2. Select the result "Cloud Text-to-Speech API".
3. Click **Enable**.
   > **Note:** You may need to link a billing account. Google Cloud offers a free tier (standard voices are free up to 4M chars/month, Neural/Journey voices have a smaller free tier).

## 3. Create an API Key
1. Go to the **Navigation Menu** (≡) > **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top.
3. Select **API key**.
4. Your new API key will appear. **Copy it!** 🔑

## 4. (Optional but Recommended) Restrict Your Key
To prevent unauthorized use:
1. Click **Edit API key** (or the pencil icon).
2. Under **API restrictions**, select **Restrict key**.
3. In the dropdown, select **Cloud Text-to-Speech API**.
4. Click **Save**.

## 5. Use It in Aria
1. Go back to your Voice Assistant app.
2. Paste the key into the **"Google Cloud API Key"** field in the Config Panel.
3. Click **Start Conversation**.

Enjoy the ultra-realistic voice! 🎤✨
