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
				const parenStart = entry.signature.indexOf('(');
				const parenEnd = entry.signature.lastIndexOf(')');
				const sigMatch = parenStart !== -1 && parenEnd !== -1 
					? [null, entry.signature.substring(parenStart + 1, parenEnd)] 
					: null;
				if (!sigMatch) {return null;}

				// Sépare obligatoires et optionnels
				const allParams = sigMatch[1].split(',').map((p: string) => p.trim());
				const required = allParams.filter((p: string) => !p.includes('='));
				const hasOptional = allParams.some((p: string) => p.includes('='));
				const params = required.join(', ') + (hasOptional ? ', ...opts' : '');

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

	const hoverProvider = vscode.languages.registerHoverProvider(
		{ scheme: 'file', language: 'freefem' },
		{
			provideHover(document, position) {
				const wordRange = document.getWordRangeAtPosition(position);
				if (!wordRange) {return null;}

				const word = document.getText(wordRange).toLowerCase();
				const entry = db[word];
				if (!entry) {return null;}

				const md = new vscode.MarkdownString();

				if (entry.description) {
					md.appendMarkdown(`**${word}** — ${entry.description}\n\n`);
				}

				if (entry.signature) {
					md.appendCodeblock(entry.signature, 'freefem');
				}

				md.appendMarkdown(`[See the documentation](https://doc.freefem.org/references/functions.html#${word})`);

				return new vscode.Hover(md);
			}
		}
	);

	context.subscriptions.push(hoverProvider);

    context.subscriptions.push(completionProvider);
    context.subscriptions.push(signatureProvider);
}

export function deactivate() {}