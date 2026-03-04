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

	const freefemTypes: Record<string, string> = {
    'mesh': 'Triangular 2D mesh.',
    'mesh3': 'Tetrahedral 3D mesh.',
    'meshS': 'Surface 3D mesh.',
    'meshL': 'Curve 3D mesh.',
    'fespace': 'Finite element space defined on a mesh.',
    'matrix': 'Sparse matrix.',
    'real': 'Floating point number.',
    'int': 'Integer number.',
    'complex': 'Complex number.',
    'bool': 'Boolean value (true or false).',
    'string': 'Character string.',
    'func': 'Function type.',
    'border': 'Boundary curve definition.',
    'varf': 'Variational form.',
    'macro': 'Macro definition.',
    'ifstream': 'Input file stream.',
    'ofstream': 'Output file stream.',
    'problem': 'Variational problem definition.',
    'solve': 'Solve a variational problem inline.',
	};

	const freefemFESpaces: Record<string, string> = {
    // Lagrange continus
    'P0': 'Piecewise constant finite element (2D).',
    'P03d': 'Piecewise constant finite element (3D).',
    'P0Edge': 'Piecewise constant edge finite element.',
    'P1': 'Piecewise linear finite element, continuous (2D).',
    'P13d': 'Piecewise linear finite element, continuous (3D).',
    'P2': 'Piecewise quadratic finite element, continuous (2D).',
    'P23d': 'Piecewise quadratic finite element, continuous (3D).',
    'P2h': 'Piecewise quadratic finite element with hierarchical basis.',
    'P3': 'Piecewise cubic finite element (requires load "Element_P3").',
    'P4': 'Piecewise quartic finite element (requires load "Element_P4").',
    'P5': 'Piecewise quintic finite element.',
    // Lagrange discontinus
    'P1dc': 'Piecewise linear finite element, discontinuous.',
    'P2dc': 'Piecewise quadratic finite element, discontinuous.',
    'P3dc': 'Piecewise cubic finite element, discontinuous.',
    'P4dc': 'Piecewise quartic finite element, discontinuous.',
    'P5dc': 'Piecewise quintic finite element, discontinuous.',
    // Avec bulles
    'P1b': 'P1 with bubble function (2D).',
    'P1b3d': 'P1 with bubble function (3D).',
    'P1bl': 'P1 with local bubble function (2D).',
    'P1bl3d': 'P1 with local bubble function (3D).',
    // Non-conforming
    'P1nc': 'P1 non-conforming finite element.',
    // Arêtes - PkEdge
    'P1Edge': 'P1 edge finite element.',
    'P2Edge': 'P2 edge finite element.',
    'P3Edge': 'P3 edge finite element.',
    'P4Edge': 'P4 edge finite element.',
    'P5Edge': 'P5 edge finite element.',
    // Raviart-Thomas
    'RT0': 'Raviart-Thomas finite element of order 0 (2D).',
    'RT03d': 'Raviart-Thomas finite element of order 0 (3D).',
    'RT0Ortho': 'Raviart-Thomas orthogonal finite element of order 0.',
    'RT1': 'Raviart-Thomas finite element of order 1.',
    'RT1Ortho': 'Raviart-Thomas orthogonal finite element of order 1.',
    'RT2': 'Raviart-Thomas finite element of order 2.',
    'RT2Ortho': 'Raviart-Thomas orthogonal finite element of order 2.',
    // BDM
    'BDM1': 'Brezzi-Douglas-Marini finite element of order 1.',
    'BDM1Ortho': 'Brezzi-Douglas-Marini orthogonal finite element of order 1.',
    // Éléments 3D arêtes
    'Edge03d': '3D Nedelec edge element of order 0.',
    'Edge13d': '3D Nedelec edge element of order 1.',
    'Edge23d': '3D Nedelec edge element of order 2.',
    // Autres
    'P2Morley': 'Morley finite element.',
    'HCT': 'Hsieh-Clough-Tocher finite element.',
    'P2BR': 'Bernardi-Raugel finite element.',
    'FEQF': 'Quadrature formula finite element.',
	};

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'freefem' },
        {
            provideCompletionItems(document, position) {
                const funcItems = functions.map(name => {
				const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
				const entry = db[name];
				if (entry.description) {
					item.documentation = new vscode.MarkdownString(entry.description);
				}
				return item;
			});

			const typeItems = Object.entries(freefemTypes).map(([name, desc]) => {
				const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Struct);
				item.documentation = new vscode.MarkdownString(desc);
				return item;
			});

			const feItems = Object.entries(freefemFESpaces).map(([name, desc]) => {
			const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Enum);
			item.documentation = new vscode.MarkdownString(desc);
			return item;
			});

			return [...funcItems, ...typeItems, ...feItems];
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