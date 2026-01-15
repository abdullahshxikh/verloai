import SwiftUI

struct KeyboardRootView: View {
    @ObservedObject var viewModel: KeyboardViewModel
    
    // Callbacks to interact with the InputViewController
    var onInsertText: (String) -> Void
    var onDeleteBackwards: () -> Void
    var onNextKeyboard: () -> Void
    var onScanTrigger: () -> Void
    var onSharpenTrigger: () -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            // MARK: Aura Bar (HUD)
            ZStack {
                LinearGradient(
                    colors: auraGradient(for: viewModel.aura),
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(height: 48)
                
                HStack {
                    Image(systemName: "sparkles")
                        .foregroundColor(.white)
                    Text(viewModel.roast)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            
            // MARK: Function Row
            HStack(spacing: 20) {
                Button(action: {
                    onScanTrigger()
                }) {
                    VStack {
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 20))
                        Text("Ghost")
                            .font(.caption2)
                    }
                    .foregroundColor(Color(red: 0.1, green: 0.1, blue: 0.2))
                }
                
                Spacer()
                
                // MAIN ACTION: Sharpen (Logo)
                Button(action: {
                    onSharpenTrigger()
                }) {
                    ZStack {
                        Circle()
                            .fill(Color(red: 0.42, green: 0.36, blue: 0.91)) // #6C5CE7
                            .frame(width: 56, height: 56)
                            .shadow(radius: 4)
                        
                        if viewModel.isSharpening {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Image(systemName: "wand.and.stars")
                                .font(.system(size: 24))
                                .foregroundColor(.white)
                        }
                    }
                }
                .offset(y: -12) // Pop out effect
                
                Spacer()
                
                Button(action: onNextKeyboard) {
                    VStack {
                        Image(systemName: "globe")
                            .font(.system(size: 20))
                        Text("Next")
                            .font(.caption2)
                    }
                    .foregroundColor(Color(red: 0.1, green: 0.1, blue: 0.2))
                }
            }
            .padding(.horizontal, 40)
            .padding(.top, 10)
            .padding(.bottom, 10)
            .background(Color(red: 0.96, green: 0.96, blue: 0.98))
            
            // MARK: Simple Keyboard (Fallback/Passthrough)
            HStack {
                Button("Delete") { onDeleteBackwards() }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(8)
                    .foregroundColor(.red)
                
                Button(action: { onInsertText(" ") }) {
                    Text("Space").frame(maxWidth: .infinity)
                }
                .padding()
                .background(Color.white)
                .cornerRadius(8)
                .foregroundColor(.black)
                
                Button("Return") { onInsertText("\n") }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(8)
                    .foregroundColor(.blue)
            }
            .padding(8)
            .background(Color(red: 0.9, green: 0.9, blue: 0.92))
        }
        .background(Color(red: 0.96, green: 0.96, blue: 0.98))
    }
    
    private func auraGradient(for state: AuraState) -> [Color] {
        switch state {
        case .low: return [.gray, .gray.opacity(0.8)]
        case .neutral: return [Color(red: 0.42, green: 0.36, blue: 0.91), Color(red: 0.64, green: 0.61, blue: 1.0)]
        case .high: return [.yellow, .orange]
        }
    }
}
