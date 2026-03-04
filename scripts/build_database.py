import os
import json
import urllib.request
import re

OUTPUT_PATH = os.path.expanduser("~/freefem-kit/src/database.json")

def get_builtins_from_doc():
    """Récupère la liste des fonctions depuis la doc officielle FreeFEM"""
    url = 'https://doc.freefem.org/references/functions.html'
    with urllib.request.urlopen(url) as r:
        html = r.read().decode('utf-8')
    matches = re.findall(r'id=\"([a-z][a-z0-9]*?)\"', html)
    return sorted(set(matches))

def main():
    print("Récupération des fonctions depuis la doc officielle...")
    builtins = get_builtins_from_doc()
    print(f"Trouvé {len(builtins)} fonctions")

    database = {}
    for func in builtins:
        database[func] = {
            "name": func,
        }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

    print(f"Base de données sauvegardée : {len(database)} fonctions")

if __name__ == "__main__":
    main()