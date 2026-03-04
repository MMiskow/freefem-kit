import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function loadDatabase(context: vscode.ExtensionContext): Record<string, any> {
    const dbPath = path.join(context.extensionPath, 'src', 'database.json');
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
}

export function activate(context: vscode.ExtensionContext) {
    const db = loadDatabase(context);
    const functions = Object.keys(db);

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'freefem' },
        {
            provideCompletionItems(document, position) {
                return functions.map(name => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
                    const entry = db[name];
                    if (entry.description) {
                        item.documentation = new vscode.MarkdownString(entry.description);
                    }
                    return item;
                });
            }
        }
    );

    const signatureProvider = vscode.languages.registerSignatureHelpProvider(
        { scheme: 'file', language: 'freefem' },
        {
            provideSignatureHelp(document, position) {
                const lineText = document.lineAt(position).text;
                const textBeforeCursor = lineText.substring(0, position.character);

                // Cherche le nom de fonction avant la parenthèse ouvrante
                const match = textBeforeCursor.match(/([a-zA-Z][a-zA-Z0-9]*)\s*\(([^)]*)$/);
                if (!match) {return null;}

                const funcName = match[1].toLowerCase();
                const entry = db[funcName];
                if (!entry || !entry.signature) {return null;}

                // Extrait les paramètres entre parenthèses
                const sigMatch = entry.signature.match(/\(([^)]*)\)/);
                if (!sigMatch) {return null;}
                const params = sigMatch[1];

                const signature = new vscode.SignatureInformation(
                    `${funcName}(${params})`,
                    new vscode.MarkdownString(entry.description)
                );

                const signatureHelp = new vscode.SignatureHelp();
                signatureHelp.signatures = [signature];
                signatureHelp.activeSignature = 0;
                signatureHelp.activeParameter = 0;

                return signatureHelp;
            }
        },
        '(', ','  // triggers
    );

    context.subscriptions.push(completionProvider);
    context.subscriptions.push(signatureProvider);
}

export function deactivate() {}