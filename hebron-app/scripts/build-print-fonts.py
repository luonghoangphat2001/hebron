"""Mechanically instantiate our bundled Pretendard font for reliable PDF outlines.

Run with fonttools installed. Keeps copyright/license records; renames derived
font names to respect the source's Reserved Font Name. No font is downloaded
or substituted. Generated binaries are checked in for runtime use.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1]
source = root / "src/assets/fonts/PretendardVariable.ttf"
destination = root / "src/assets/fonts/print"
destination.mkdir(exist_ok=True)
for weight in (400, 700):
    font = instantiateVariableFont(TTFont(source), {"wght": weight}, inplace=True)
    style = "Regular" if weight == 400 else "Bold"
    names = {1: "Hebron Print Sans", 2: style, 3: f"Hebron Print Sans {weight}",
             4: f"Hebron Print Sans {style}", 6: f"HebronPrintSans-{style}",
             16: "Hebron Print Sans", 17: style, 25: "HebronPrintSans"}
    for record in list(font["name"].names):
        if record.nameID in names:
            font["name"].setName(names[record.nameID], record.nameID,
                                 record.platformID, record.platEncID, record.langID)
    font.flavor = "woff"
    font.save(destination / f"HebronPrintSans-{weight}.woff")
