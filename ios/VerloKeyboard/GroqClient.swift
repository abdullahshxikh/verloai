import Foundation

class GroqClient {
    static let shared = GroqClient()
    private let apiKey = "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" // TODO: Move to secure storage or info.plist injection
    private let textUrl = URL(string: "https://api.groq.com/openai/v1/chat/completions")!

    func sharpen(currentText: String, completion: @escaping (String?) -> Void) {
        var request = URLRequest(url: textUrl)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // System prompt for "Rizz"
        let systemPrompt = "You are a witty, high-status communication coach. Rewrite the user's text to be shorter, more intriguing, and slightly challenging. Do not be polite. Be 'cool'. Output ONLY the rewritten text."
        
        let body: [String: Any] = [
            "model": "llama-3.3-70b-versatile",
            "messages": [
                ["role": "system", "content": systemPrompt],
                ["role": "user", "content": currentText]
            ],
            "max_tokens": 100
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data, error == nil else {
                print("Groq Error: \(error?.localizedDescription ?? "Unknown")")
                completion(nil)
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let choices = json["choices"] as? [[String: Any]],
                   let firstChoice = choices.first,
                   let message = firstChoice["message"] as? [String: Any],
                   let content = message["content"] as? String {
                    completion(content.trimmingCharacters(in: .whitespacesAndNewlines))
                } else {
                    completion(nil)
                }
            } catch {
                print("JSON Parse Error: \(error)")
                completion(nil)
            }
        }
        task.resume()
    }
}
