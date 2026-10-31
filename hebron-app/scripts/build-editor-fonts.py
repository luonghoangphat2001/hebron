"""Download pinned official Google Fonts and build static editor/PDF faces.

Requires fonttools + brotli. Run from the repository; --copy-to can synchronize
the exact generated font catalog into the admin repository.
"""
import argparse
import hashlib
import json
import re
import shutil
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

REVISION = 'ddf386ba1b9fbc6b2c818f1ddcd9148f54ced94b'
BASE = f'https://raw.githubusercontent.com/google/fonts/{REVISION}'
FAMILIES = {
    'arimo': 'Arimo', 'tinos': 'Tinos', 'cousine': 'Cousine',
    'gelasio': 'Gelasio', 'ptsans': 'PT Sans', 'cabin': 'Cabin',
    'oswald': 'Oswald', 'comicneue': 'Comic Neue',
    'crimsontext': 'Crimson Text', 'ebgaramond': 'EB Garamond',
    'librebaskerville': 'Libre Baskerville', 'sourcesans3': 'Source Sans 3',
    'nanumgothic': 'Nanum Gothic', 'nanummyeongjo': 'Nanum Myeongjo',
    'nanumgothiccoding': 'Nanum Gothic Coding',
}


def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Hebron-font-build'})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def ranges(points):
    result = []
    for point in sorted(points):
        if result and point == result[-1][1] + 1:
            result[-1][1] = point
        else:
            result.append([point, point])
    return result


def build_family(slug, family, output):
    directory = output / slug
    directory.mkdir(parents=True, exist_ok=True)
    metadata_url = f'{BASE}/ofl/{slug}/METADATA.pb'
    metadata = download(metadata_url)
    (directory / 'METADATA.pb').write_bytes(metadata)
    license_url = (('https://raw.githubusercontent.com/googlefonts/tinos/'
                    '3b4482a99b80ea5fc75f187b1be3120a3f5905b3/OFL.txt')
                   if slug == 'tinos' else f'{BASE}/ofl/{slug}/OFL.txt')
    license_data = download(license_url)
    if b'OPEN FONT LICENSE' not in license_data.upper():
        raise ValueError(f'Unexpected license for {family}')
    (directory / 'OFL.txt').write_bytes(license_data)
    filenames = sorted(set(re.findall(r'filename: "([^"]+\.ttf)"', metadata.decode())))
    entries, sources = [], []
    for filename in filenames:
        url = f'{BASE}/ofl/{slug}/{urllib.parse.quote(filename)}'
        binary = download(url)
        original = TTFont(BytesIO(binary))
        style = 'italic' if original['head'].macStyle & 2 else 'normal'
        axes = {axis.axisTag: axis for axis in original['fvar'].axes} if 'fvar' in original else {}
        weights = [int(original['OS/2'].usWeightClass)]
        if 'wght' in axes:
            weights = list(range(int(axes['wght'].minValue + 99) // 100 * 100, int(axes['wght'].maxValue) + 1, 100))
        sources.append({'family': family, 'url': url, 'revision': REVISION,
                        'sha256': digest(binary), 'license_url': license_url,
                        'license_sha256': digest(license_data)})
        for weight in weights:
            font = TTFont(BytesIO(binary))
            if axes:
                limits = {tag: axis.defaultValue for tag, axis in axes.items()}
                if 'wght' in axes:
                    limits['wght'] = weight
                font = instantiateVariableFont(font, limits, inplace=True)
            # Name derived static faces distinctly; CSS keeps the canonical family.
            if axes:
                generated_name = f'Hebron {family}'
                for record in list(font['name'].names):
                    values = {1: generated_name, 2: f'{weight} {style}',
                              3: f'{generated_name} {weight} {style}',
                              4: f'{generated_name} {weight} {style}',
                              6: f'Hebron-{slug}-{weight}-{style}',
                              16: generated_name, 17: f'{weight} {style}'}
                    if record.nameID in values:
                        font['name'].setName(values[record.nameID], record.nameID, record.platformID, record.platEncID, record.langID)
            name = f'{slug}-{weight}{"-Italic" if style == "italic" else ""}.ttf'
            target = directory / name
            font.flavor = None
            font.save(target)
            entries.append({'family': family, 'weight': weight, 'style': style,
                            'file': f'{slug}/{name}', 'coverage': ranges(font.getBestCmap()),
                            'sha256': digest(target.read_bytes())})
    print(f'{family}: {len(entries)} faces', flush=True)
    return entries, sources


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--copy-to', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    output = root / 'src/assets/fonts/editor'
    output.mkdir(parents=True, exist_ok=True)
    manifest, sources = [], []
    with ThreadPoolExecutor(max_workers=4) as executor:
        jobs = [executor.submit(build_family, slug, family, output) for slug, family in FAMILIES.items()]
        for job in jobs:
            entries, records = job.result()
            manifest.extend(entries)
            sources.extend(records)
    # The bundled Pretendard variable font retains its existing license/provenance.
    original = root / 'src/assets/fonts/PretendardVariable.ttf'
    directory = output / 'pretendard'
    directory.mkdir(exist_ok=True)
    shutil.copy2(root / 'src/assets/fonts/print/LICENSE.txt', directory / 'OFL.txt')
    for weight in range(100, 1000, 100):
        font = instantiateVariableFont(TTFont(original), {'wght': weight}, inplace=True)
        for record in list(font['name'].names):
            values = {1: 'Hebron Print Sans', 2: str(weight), 3: f'Hebron Print Sans {weight}',
                      4: f'Hebron Print Sans {weight}', 6: f'HebronPrintSans-{weight}',
                      16: 'Hebron Print Sans', 17: str(weight), 25: 'HebronPrintSans'}
            if record.nameID in values:
                font['name'].setName(values[record.nameID], record.nameID, record.platformID, record.platEncID, record.langID)
        name = f'pretendard-{weight}.ttf'
        target = directory / name
        font.flavor = None
        font.save(target)
        manifest.append({'family': 'Pretendard', 'weight': weight, 'style': 'normal',
                         'file': f'pretendard/{name}', 'coverage': ranges(font.getBestCmap()),
                         'sha256': digest(target.read_bytes())})
    sources.append({'family': 'Pretendard', 'url': 'https://github.com/orioncactus/pretendard',
                    'source': 'src/assets/fonts/PretendardVariable.ttf', 'sha256': digest(original.read_bytes()),
                    'license': 'pretendard/OFL.txt',
                    'revision': TTFont(original)['name'].getDebugName(5)})
    manifest.sort(key=lambda entry: (entry['family'], entry['weight'], entry['style']))
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (output / 'sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n')
    css = []
    for entry in manifest:
        css.append("@font-face {\n  font-family: '%s';\n  src: url('./%s') format('truetype');\n  font-weight: %s;\n  font-style: %s;\n  font-display: block;\n}" % (entry['family'], entry['file'], entry['weight'], entry['style']))
    (output / 'fonts.css').write_text('\n\n'.join(css) + '\n')
    if args.copy_to:
        shutil.copytree(output, args.copy_to / 'src/assets/fonts/editor', dirs_exist_ok=True)
    print(f'Built {len(manifest)} font faces')


if __name__ == '__main__':
    main()
