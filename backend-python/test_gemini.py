"""Quick test script to check Gemini API and available models."""
import google.generativeai as genai

# New API key
API_KEY = "AIzaSyDmsBGygSmr-DZv12Eb1ieaFzRGjqQUmo0"

# Configure
genai.configure(api_key=API_KEY)

print("=" * 60)
print("Checking available Gemini models...")
print("=" * 60)

# List available models
available_models = []
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        available_models.append(model.name)
        print(f"  ✅ {model.name}")

print("\n" + "=" * 60)
print("Testing models with 'Hi Hello' message...")
print("=" * 60)

# Test different models
test_models = [
    "gemini-2.5-pro",
    "gemini-2.5-flash", 
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

working_models = []

for model_name in test_models:
    full_name = f"models/{model_name}"
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hi Hello! Please respond briefly.")
        print(f"\n✅ {model_name} - WORKING!")
        print(f"   Response: {response.text[:100]}...")
        working_models.append(model_name)
    except Exception as e:
        print(f"\n❌ {model_name} - FAILED: {str(e)[:50]}")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"Working models: {', '.join(working_models) if working_models else 'None'}")
if working_models:
    print(f"\n🎯 Recommended: Use '{working_models[0]}' (most capable available)")
