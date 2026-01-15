import Foundation
import UIKit
import Vision

class GhostScanner {
    static let shared = GhostScanner()
    
    func scanPasteboard(completion: @escaping (String?) -> Void) {
        if let image = UIPasteboard.general.image {
            recognizeText(in: image, completion: completion)
        } else {
            // In a real extensions, we might need Full Access to read pasteboard freely
            // or we ask user to "Paste" to trigger a read if restricted.
            // For "Ghost Scan", assuming user just took screenshot and copied it or valid access.
            completion(nil)
        }
    }
    
    // NOTE: Accessing Photo Library directly from Keyboard Extension is restricted without explicit UI permission (UIImagePickerController).
    // The "Flash" flow usually relies on the user verifying "Allow Paste" or using a custom picker.
    // We will attempt Pasteboard first as "Ghost Scan".
    
    private func recognizeText(in image: UIImage, completion: @escaping (String?) -> Void) {
        guard let cgImage = image.cgImage else {
            completion(nil)
            return
        }
        
        let request = VNRecognizeTextRequest { request, error in
            guard let observations = request.results as? [VNRecognizedTextObservation], error == nil else {
                completion(nil)
                return
            }
            
            let recognizedStrings = observations.compactMap { observation in
                return observation.topCandidates(1).first?.string
            }
            
            let fullText = recognizedStrings.joined(separator: "\n")
            completion(fullText)
        }
        
        request.recognitionLevel = .accurate
        
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            print("Vision Error: \(error)")
            completion(nil)
        }
    }
}
