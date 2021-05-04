import * as vscode from 'vscode';
import { getId } from './idGiver';


export class jsonEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new jsonEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(jsonEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'visudata.jsonEditor';
    private static readonly dataTypes = ['object', 'string', 'array', 'boolean', 'number', 'null'];


    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
    }

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.uri.toString() === document.uri.toString()) {
            updateWebview();
        }
    });
    
    webviewPanel.onDidDispose(() => {
        changeDocumentSubscription.dispose();
    });
    
    webviewPanel.webview.onDidReceiveMessage(e => {
        switch (e.type) {
            case 'add':
                this.addNewJson(document);
                return;
    
            case 'delete':
                this.deleteJson(document, e.id);
                return;
        }
    });
    
    updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'assets', 'jsonEditor.js'));
    
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'assets', 'jsonEditor.css'));
    
        return /* html */`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Visudata Json Editor</title>
                </head>
                <body>
                    <div class="editor">
                        
                    </div>
                    <div id="menuBar">
    
                    </div>
                </body>
                </html>`;
    
            private addNewScratch(document: vscode.TextDocument) {
                const json = this.getDocumentAsJson(document);
    
                json.editors = [
                    ...(Array.isArray(json.editors) ? json.editors : []),
                    {
                        id: getId(),
                        created: Date.now(),
                    }
                ];
    
                return this.updateTextDocument(document, json);
            }
    }
    
    private deleteJson(document: vscode.TextDocument, id: string) {
        const json = this.getDocumentAsJson(document);
        if (!Array.isArray(json.editors)) {
            return;
        }
    
        json.editors = json.editors.filter((note: any) => note.id !== id);
    
        return this.updateTextDocument(document, json);
    
        private getDocumentAsJson(document: vscode.TextDocument): any {
            const text = document.getText();
            if (text.trim().length === 0) {
                return {};
            }
    
            try {
                return JSON.parse(text);
            } catch {
                throw new Error('Could not get document as json. Content is not valid json');
            }
        }
    
        private updateTextDocument(document: vscode.TextDocument, json: any) {
            const edit = new vscode.WorkspaceEdit();
    
            // Just replace the entire document every time for this example extension.
            // A more complete extension should compute minimal edits instead.
            edit.replace(
                document.uri,
                new vscode.Range(0, 0, document.lineCount, 0),
                JSON.stringify(json, null, 2));
    
            return vscode.workspace.applyEdit(edit);
        }
    
    }

}
