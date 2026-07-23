import urllib.parse
import unicodedata

def check_homograph(url: str) -> dict:
    """
    Analyzes a URL for Homograph Attack indicators, Punycode encoding (xn--),
    Unicode Hex Anomalies (U+0430 Cyrillic / Greek spoofing), and Target Port.
    """
    if not url:
        return {
            "domain": "",
            "punycode_domain": "",
            "unicode_hex": "None (Standard ASCII)",
            "is_punycode": False,
            "has_non_ascii": False,
            "suspicious_chars": [],
            "is_threat": False,
            "message": "Empty URL provided."
        }

    parsed_url = url.strip()
    if not parsed_url.startswith(("http://", "https://")):
        parsed_url = "http://" + parsed_url

    try:
        parsed = urllib.parse.urlparse(parsed_url)
        netloc = parsed.netloc or parsed.path.split('/')[0]
        domain_parts = netloc.split(':')
        domain = domain_parts[0].lower()
    except Exception as e:
        return {
            "domain": url,
            "punycode_domain": url,
            "unicode_hex": "Error",
            "is_punycode": False,
            "has_non_ascii": False,
            "suspicious_chars": [],
            "is_threat": False,
            "message": f"URL Parsing Error: {str(e)}"
        }

    is_punycode = "xn--" in domain
    has_non_ascii = any(ord(char) > 127 for char in domain)

    decoded_domain = domain
    if is_punycode:
        try:
            parts = domain.split('.')
            decoded_parts = []
            for part in parts:
                if part.startswith("xn--"):
                    decoded_parts.append(part.encode('ascii').decode('idna'))
                else:
                    decoded_parts.append(part)
            decoded_domain = ".".join(decoded_parts)
            has_non_ascii = True
        except Exception:
            decoded_domain = domain

    suspicious_chars = []
    unicode_hex_list = []
    target_str = decoded_domain if decoded_domain != domain else domain

    for char in target_str:
        if ord(char) > 127:
            hex_code = f"U+{ord(char):04X}"
            try:
                char_name = unicodedata.name(char, 'UNKNOWN')
            except Exception:
                char_name = 'UNKNOWN'
            
            suspicious_chars.append({
                "char": char,
                "code": hex_code,
                "name": char_name
            })
            unicode_hex_list.append(f"'{char}' ({hex_code})")

    # Deduplicate suspicious chars
    unique_suspicious = []
    seen = set()
    for sc in suspicious_chars:
        if sc["code"] not in seen:
            seen.add(sc["code"])
            unique_suspicious.append(sc)

    is_threat = is_punycode or len(unique_suspicious) > 0
    unicode_hex_str = ", ".join(unicode_hex_list) if unicode_hex_list else "None (Standard ASCII)"

    if is_punycode and len(unique_suspicious) > 0:
        message = f"CRITICAL IDN HOMOGRAPH: Punycode (xn--) active with spoofed Unicode characters: {', '.join([c['char'] for c in unique_suspicious])}"
    elif is_punycode:
        message = "CRITICAL IDN HOMOGRAPH: Punycode (xn--) detected in domain string."
    elif len(unique_suspicious) > 0:
        message = f"CRITICAL IDN HOMOGRAPH: Non-ASCII Cyrillic/Greek characters detected: {', '.join([c['char'] for c in unique_suspicious])}"
    else:
        message = "CLEAN: Standard ASCII Domain"

    return {
        "domain": domain,
        "decoded_domain": decoded_domain,
        "punycode_domain": domain if not is_punycode else domain,
        "unicode_hex": unicode_hex_str,
        "is_punycode": is_punycode,
        "has_non_ascii": has_non_ascii,
        "suspicious_chars": unique_suspicious,
        "is_threat": is_threat,
        "message": message
    }
