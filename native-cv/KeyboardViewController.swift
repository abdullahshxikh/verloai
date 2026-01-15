import UIKit
import SwiftUI

class KeyboardViewController: UIInputViewController {

    var rootView: KeyboardRootView?
    var hostingController: UIHostingController<KeyboardRootView>?
    var viewModel = KeyboardViewModel() // Retain the model

    override func viewDidLoad() {
        super.viewDidLoad()
        
        // --- BRIDGE SWIFTUI TO UIKIT ---
        // Create the SwiftUI view with closures bridging back to this controller
        rootView = KeyboardRootView(
            viewModel: viewModel,
            onInsertText: { [weak self] text in
                self?.textDocumentProxy.insertText(text)
                self?.analyzeCurrentContext()
            },
            onDeleteBackwards: { [weak self] in
                self?.textDocumentProxy.deleteBackward()
                self?.analyzeCurrentContext()
            },
            onNextKeyboard: { [weak self] in
                self?.advanceToNextInputMode()
            },
            onScanTrigger: { [weak self] in
                self?.performGhostScan()
            },
            onSharpenTrigger: { [weak self] in
                self?.performSharpen()
            }
        )
        
        guard let rootView = rootView else { return }
        
        // Host it
        hostingController = UIHostingController(rootView: rootView)
        
        guard let hostingView = hostingController?.view else { return }
        hostingView.translatesAutoresizingMaskIntoConstraints = false
        hostingView.backgroundColor = .clear
        
        // Add to hierarchy
        addChild(hostingController!)
        view.addSubview(hostingView)
        hostingController?.didMove(toParent: self)
        
        // Layout
        NSLayoutConstraint.activate([
            hostingView.leftAnchor.constraint(equalTo: view.leftAnchor),
            hostingView.rightAnchor.constraint(equalTo: view.rightAnchor),
            hostingView.topAnchor.constraint(equalTo: view.topAnchor),
            hostingView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            // Height constraint is important for keyboards
            hostingView.heightAnchor.constraint(equalToConstant: 260) 
        ])
    }
    
    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
    }
    
    override func textDidChange(_ textInput: UITextInput?) {
        // The app just changed the text (e.g. moved cursor), let's re-analyze
        analyzeCurrentContext()
    }
    
    // MARK: - Logic
    
    func analyzeCurrentContext() {
        guard let currentText = textDocumentProxy.documentContextBeforeInput else { return }
        let state = AuraAnalyzer.shared.analyze(text: currentText)
        viewModel.updateAura(state)
    }
    
    func performGhostScan() {
        viewModel.setRoast("Scanning Ghost...")
        GhostScanner.shared.scanPasteboard { [weak self] scannedText in
            guard let self = self else { return }
            
            if let text = scannedText {
                self.viewModel.setRoast("Ghost: \(text.prefix(10))...")
                let state = AuraAnalyzer.shared.analyze(text: text)
                self.viewModel.updateAura(state)
            } else {
                 self.viewModel.setRoast("Ghost: No text found.")
            }
        }
    }
    
    func performSharpen() {
        guard let currentText = textDocumentProxy.documentContextBeforeInput else {
            // Nothing to sharpen
            viewModel.setRoast("Type something first.")
            return
        }
        
        viewModel.setSharpening(true)
        
        GroqClient.shared.sharpen(currentText: currentText) { [weak self] rewrittenText in
            guard let self = self else { return }
            
            self.viewModel.setSharpening(false)
            
            if let newText = rewrittenText {
                DispatchQueue.main.async {
                    // Replace text: Delete existing, insert new.
                    for _ in 0..<currentText.count {
                        self.textDocumentProxy.deleteBackward()
                    }
                    self.textDocumentProxy.insertText(newText)
                }
            } else {
                 self.viewModel.setRoast("Sharpen failed.")
            }
        }
    }
}
