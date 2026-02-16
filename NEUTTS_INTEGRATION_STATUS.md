# NeuTTS Voice Cloning Integration - Status Report

**Date**: February 3, 2026
**Status**: Foundation Complete, Ready for Xcode Integration

---

## ✅ What's Been Done

### 1. Models Downloaded & Bundled (932MB total)

**Location**: `ios/VerloAI/`

- ✅ **neutts-nano-q4.gguf** (186MB) - GGUF backbone model for text→audio tokens
- ✅ **neucodec-decoder.onnx** (746MB) - ONNX codec decoder for audio tokens→WAV

**How it works when users download your app:**
- These files will be bundled in the iOS app binary
- App Store will show: "Size: [current size] + 932MB"
- Users download once, models available offline forever
- No separate download step needed

### 2. iOS Native Module Created

**Files Created**:
- `ios/VerloAI/NeuTTSModule.h` - Objective-C header
- `ios/VerloAI/NeuTTSModule.mm` - Objective-C++ implementation

**React Native Methods Exposed**:
```typescript
NeuTTSModule.loadModel() → Promise<boolean>
NeuTTSModule.encodeReference(audioPath, refText) → Promise<string>
NeuTTSModule.synthesize(text, refCodePath) → Promise<string>
NeuTTSModule.isModelLoaded() → Promise<boolean>
```

### 3. React Native Service Layer Created

**File**: `services/neutts.ts` (278 lines)

**Features**:
- Auto-initialization of models
- Timeout handling (500ms max, falls back to Groq TTS)
- Clean async/await API
- Error handling and logging

**Usage Example**:
```typescript
import NeuTTSService from '@/services/neutts';

// Initialize once on app startup
await NeuTTSService.initialize();

// During onboarding: encode user's voice
const refCodePath = await NeuTTSService.encodeReference(
  'file:///path/to/voice-sample.wav',
  'I want to sound more confident and charismatic.'
);

// During practice: generate speech with cloned voice
const audioPath = await NeuTTSService.synthesize(
  'Hello! This is your voice speaking.',
  refCodePath,
  500 // 500ms timeout
);

if (audioPath) {
  // Play with expo-av
} else {
  // Fell back to cloud TTS due to timeout
}
```

---

## 🚧 What's Next (Manual Steps Required)

### Step 1: Add Files to Xcode Project

You need to manually add the model files to Xcode so they bundle with the app:

1. Open `ios/VerloAI.xcworkspace` in Xcode
2. Right-click on `VerloAI` folder → "Add Files to VerloAI..."
3. Select these files:
   - `neutts-nano-q4.gguf`
   - `neucodec-decoder.onnx`
   - `NeuTTSModule.h`
   - `NeuTTSModule.mm`
4. **IMPORTANT**: Check "Copy items if needed" and "Add to targets: VerloAI"

### Step 2: Add llama.cpp to Project

The GGUF backbone needs llama.cpp to run. Options:

**Option A: Use llama-cpp-pod (Easiest)**
```ruby
# Add to ios/Podfile
pod 'llama', :git => 'https://github.com/ggerganov/llama.cpp.git', :tag => 'b1234'
```

**Option B: Add llama.cpp source directly**
- Copy `~/llama.cpp/ggml.c`, `ggml.h`, `llama.cpp`, `llama.h` to `ios/VerloAI/llama/`
- Add to Xcode project
- Configure build settings

**Option C: Pre-compiled framework** (I can help with this)

### Step 3: Add ONNX Runtime to Project

The codec decoder needs ONNX Runtime:

```ruby
# Add to ios/Podfile
pod 'onnxruntime-objc', '~> 1.16.0'
```

Then run:
```bash
cd ios && pod install
```

### Step 4: Implement Actual Inference

Currently `NeuTTSModule.mm` has placeholder implementations. You need to:

1. **loadModel()**: Load GGUF with llama.cpp + ONNX decoder
2. **synthesize()**:
   - Tokenize text
   - Run llama.cpp inference (text → audio tokens)
   - Run ONNX decoder (audio tokens → WAV)
   - Save WAV file and return path

This is the complex part that requires understanding llama.cpp and ONNX Runtime APIs.

---

## 📊 Architecture Overview

```
User's Voice Sample (3-5 sec WAV)
         │
         ↓
  [encode_reference.py on server]  ← One-time encoding
         │
         ↓
   reference.pt (small, <1MB)
         │
         ↓
   [Stored in FileSystem]
         │
         ├──────────────────────────────────┐
         │                                  │
         ↓                                  ↓
   User speaks in practice          AI needs to respond
         │                                  │
         ↓                                  ↓
   Groq Whisper                       NeuTTS Synthesis
   (transcribe)                            │
         │                                  ├─ Load reference.pt
         ↓                                  ├─ Load neutts-nano-q4.gguf (186MB)
   AI generates                            ├─ Load neucodec-decoder.onnx (746MB)
   response text                           ├─ Inference: text → audio tokens
         │                                  ├─ Decode: audio tokens → WAV
         │                                  │
         └──────────────────────────────────┤
                                            ↓
                                    Synthesized speech.wav
                                            ↓
                                    [Play with expo-av]
```

---

## ⚠️ Important Notes

### Model Size Impact
- **Current app size**: ~50-100MB (estimated)
- **After adding NeuTTS**: +932MB
- **Total**: ~1GB app download

**Mitigation strategies**:
- App Store allows up to 4GB for iOS apps
- Users on cellular will see "Download over WiFi" prompt (>200MB)
- Alternative: Download models on first launch (but worse UX)

### Performance Expectations

**Target Latency**: <200ms per sentence
- GGUF inference: ~120ms (backbone)
- ONNX decoding: ~50ms (codec)
- File I/O: ~30ms

**Reality Check**:
- First tests may be slower (500-1000ms)
- Optimization needed to hit <200ms target
- Fallback to Groq TTS for slow inferences

### Voice Encoding Strategy

**Problem**: The voice encoder is 1.1GB and can't fit on device.

**Solution**: Encode voices server-side
1. User records voice during onboarding
2. Upload to your backend
3. Run `encode_reference.py` with full neucodec model
4. Store resulting `.pt` file (small, <1MB)
5. Download `.pt` to device for synthesis

**Alternative**: Pre-encode common voices and let users select

---

## 🎯 Next Steps for You

1. **Decide on llama.cpp integration method** (CocoaPods vs source vs framework)
2. **Add ONNX Runtime via CocoaPods**
3. **Add model files to Xcode** (drag & drop)
4. **Implement actual inference** in `NeuTTSModule.mm` (or I can help)
5. **Test on physical device** (Simulator won't work well for inference)

**Timeline Estimate**:
- Xcode setup: 1-2 hours
- Inference implementation: 4-8 hours (if you do it) or I can do it
- Testing & optimization: 2-4 hours
- **Total**: 1-2 days for MVP

---

## 📞 Questions to Answer

1. **Do you want me to implement the llama.cpp + ONNX inference code in NeuTTSModule.mm?**
   - This is the most complex part
   - I can write it but you'll need to test on a physical device

2. **Server-side voice encoding**: Do you have a backend where we can run the encoder?
   - If yes: I'll create an API endpoint
   - If no: We need to find another solution (maybe encode on device despite size?)

3. **Model download strategy**:
   - **Option A**: Bundle with app (932MB, slower App Store approval)
   - **Option B**: Download on first launch (better approval, worse first-run UX)
   - Which do you prefer?

Let me know how you want to proceed!
