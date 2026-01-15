import Foundation

enum AuraState {
    case low
    case neutral
    case high
}

class AuraAnalyzer {
    static let shared = AuraAnalyzer()
    
    // Heuristic analysis: "High Status" means concise, confident, no hedging.
    // "Low Status" means too many words, apologies, hedging.
    func analyze(text: String) -> AuraState {
        let wordCount = text.split(separator: " ").count
        
        // Low Status Indicators
        let lowStatusWords = ["sorry", "just", "maybe", "think", "might", "um", "uh"]
        let lowerText = text.lowercased()
        
        var lowScore = 0
        for word in lowStatusWords {
            if lowerText.contains(word) {
                lowScore += 1
            }
        }
        
        // High Status: Short and direct
        if wordCount > 0 && wordCount < 10 && lowScore == 0 {
            return .high
        }
        
        if wordCount > 20 || lowScore > 1 {
            return .low
        }
        
        return .neutral
    }
    
    func getRoast(for state: AuraState) -> String {
        switch state {
        case .low:
            return ["Stop yapping.", "You sound desperate.", "Too available.", "Delete that."].randomElement()!
        case .neutral:
            return ["Spice it up.", "Boring.", "Sharpen needed."].randomElement()!
        case .high:
            return ["Gold.", "Send it.", "Chef's kiss."].randomElement()!
        }
    }
}
