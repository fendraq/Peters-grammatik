#!/usr/bin/env python3
"""Convert Lexin (Svenska ord, 4th ed., CC BY 4.0) XML to compact JSON.

Usage: python3 convert_lexicon.py [path to swe_swe.xml] [output path]
Downloads swe_swe.xml from Isof if no input path is given.

Source: https://sprakresurser.isof.se/lexin/svenska/swe_swe.xml
"""
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET

SOURCE_URL = "https://sprakresurser.isof.se/lexin/svenska/swe_swe.xml"


def get_xml_path():
    if len(sys.argv) > 1:
        return sys.argv[1]
    print("Downloading " + SOURCE_URL)
    target, _ = urllib.request.urlretrieve(SOURCE_URL, "swe_swe.xml")
    return target


def clean(text):
    if text is None:
        return ""
    return " ".join(text.split())


def convert(xml_path, out_path):
    tree = ET.parse(xml_path)
    entries = []
    for lemma in tree.getroot().findall(".//Lemma"):
        word = lemma.get("Value")
        if not word or not word.strip():
            continue
        pos = lemma.get("Type") or ""

        definitions = []
        examples = []
        for lexeme in lemma.findall("Lexeme"):
            for element in lexeme.findall("Definition"):
                text = clean(element.text)
                if text:
                    definitions.append(text)
            for element in lexeme.findall("Example"):
                text = clean(element.text)
                if text:
                    examples.append(text)

        inflections = []
        for element in lemma.findall("Inflection"):
            text = clean(element.text)
            if text:
                inflections.append(text)

        # Plain index forms (word forms users may search for,
        # e.g. the infinitive when the lemma is in present tense).
        indexes = []
        for element in lemma.findall("Index"):
            if element.get("Type"):
                continue
            text = clean(element.get("Value"))
            if text and text not in indexes:
                indexes.append(text)

        entries.append({
            "word": clean(word),
            "pos": pos,
            "defs": definitions,
            "ex": examples,
            "infl": inflections,
            "idx": indexes,
        })

    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(entries, handle, ensure_ascii=False, separators=(",", ":"))
    print("Wrote %d entries to %s" % (len(entries), out_path))


if __name__ == "__main__":
    xml_path = get_xml_path()
    out_path = sys.argv[2] if len(sys.argv) > 2 else "lexicon.json"
    convert(xml_path, out_path)
