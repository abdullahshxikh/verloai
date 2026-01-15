import Foundation
import Combine

class KeyboardViewModel: ObservableObject {
    @Published var aura: AuraState = .neutral
    @Published var roast: String = "Verlo is ready."
    @Published var isSharpening: Bool = false
    
    func updateAura(_ state: AuraState) {
        DispatchQueue.main.async {
            self.aura = state
            self.roast = AuraAnalyzer.shared.getRoast(for: state)
        }
    }
    
    func setSharpening(_ loading: Bool) {
        DispatchQueue.main.async {
            self.isSharpening = loading
            if loading {
                self.roast = "Sharpening..."
            }
        }
    }
    
    func setRoast(_ text: String) {
        DispatchQueue.main.async {
            self.roast = text
        }
    }
}
